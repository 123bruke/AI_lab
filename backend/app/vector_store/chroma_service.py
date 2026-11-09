"""
ChromaDB Persistent Vector Store Service for MOSEB Student Lab.
Manages collections for protocols, chemical MSDS datasheets, and experimental reports.
Includes robust embedded persistent fallback if chromadb-client thin client mode is active.
"""

import os
import json
import pathlib
from typing import List, Dict, Any, Optional
import math

try:
    from backend.app.vector_store.embeddings import LocalScientificEmbedder, cosine_similarity
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from app.vector_store.embeddings import LocalScientificEmbedder, cosine_similarity
    from app.logging_system.logger import app_logger


class EmbeddedVectorCollection:
    """
    High-performance JSON-persisted vector collection matching ChromaDB interface.
    Used for local offline persistence and thin-client compatibility.
    """
    def __init__(self, name: str, storage_dir: str, embedder: LocalScientificEmbedder):
        self.name = name
        self.storage_dir = pathlib.Path(storage_dir) / "collections"
        try:
            self.storage_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            self.storage_dir = pathlib.Path("/tmp/chroma_db/collections")
            self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.file_path = self.storage_dir / f"{name}.json"
        self.embedder = embedder
        self.data: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception as e:
                app_logger.warning(f"Could not load vector collection {self.name}: {e}")
                self.data = {}

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            app_logger.error(f"Could not persist vector collection {self.name}: {e}")

    def count(self) -> int:
        return len(self.data)

    def upsert(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]):
        embeddings = self.embedder.embed_documents(documents)
        for doc_id, doc, meta, emb in zip(ids, documents, metadatas, embeddings):
            self.data[doc_id] = {
                "id": doc_id,
                "document": doc,
                "metadata": meta,
                "embedding": emb
            }
        self._save()

    def query(self, query_texts: List[str], n_results: int = 5) -> Dict[str, Any]:
        if not query_texts or not self.data:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        query_vec = self.embedder.embed_text(query_texts[0])
        scored = []
        for doc_id, entry in self.data.items():
            sim = cosine_similarity(query_vec, entry["embedding"])
            dist = max(0.0, 1.0 - sim)
            scored.append({
                "id": doc_id,
                "document": entry["document"],
                "metadata": entry["metadata"],
                "distance": dist
            })

        scored.sort(key=lambda x: x["distance"])
        top = scored[:n_results]

        return {
            "ids": [[x["id"] for x in top]],
            "documents": [[x["document"] for x in top]],
            "metadatas": [[x["metadata"] for x in top]],
            "distances": [[x["distance"] for x in top]]
        }


class ChromaService:
    def __init__(self, db_dir: Optional[str] = None):
        if db_dir is None:
            base_dir = pathlib.Path(__file__).resolve().parent.parent.parent
            target_dir = base_dir / "chroma_db"
            if os.access(str(base_dir), os.W_OK):
                self.db_dir = str(target_dir)
            else:
                self.db_dir = "/tmp/chroma_db"
        else:
            self.db_dir = db_dir

        try:
            os.makedirs(self.db_dir, exist_ok=True)
        except Exception:
            self.db_dir = "/tmp/chroma_db"
            os.makedirs(self.db_dir, exist_ok=True)
        self.embedder = LocalScientificEmbedder()
        self.is_chroma_native = False
        self.collections: Dict[str, Any] = {}

        # Attempt to initialize ChromaDB PersistentClient
        try:
            import chromadb
            from chromadb.config import Settings
            self.client = chromadb.PersistentClient(
                path=self.db_dir,
                settings=Settings(anonymized_telemetry=False, allow_reset=True)
            )
            self.is_chroma_native = True
            app_logger.info(f"ChromaDB Native PersistentClient initialized at {self.db_dir}")
        except Exception as e:
            app_logger.warning(f"ChromaDB native PersistentClient not available ({e}). Using persistent embedded vector store.")
            self.client = None
            self.is_chroma_native = False

        # Initialize collections
        self.protocols_collection = self._get_or_create_collection("protocols")
        self.msds_collection = self._get_or_create_collection("msds")
        self.reports_collection = self._get_or_create_collection("reports")

    def _get_or_create_collection(self, name: str):
        if self.is_chroma_native and self.client:
            try:
                return self.client.get_or_create_collection(
                    name=name,
                    embedding_function=self.embedder,
                    metadata={"description": f"MOSEB Student Lab {name} knowledge base"}
                )
            except Exception:
                pass

        # Embedded Persistent Vector Collection
        if name not in self.collections:
            self.collections[name] = EmbeddedVectorCollection(name, self.db_dir, self.embedder)
        return self.collections[name]

    def add_document(self, collection_name: str, doc_id: str, text: str, metadata: Dict[str, Any]):
        """Add or update a document in the specified collection."""
        collection = self._get_or_create_collection(collection_name)
        sanitized_meta = {}
        for k, v in metadata.items():
            if isinstance(v, (str, int, float, bool)):
                sanitized_meta[k] = v
            else:
                sanitized_meta[k] = json.dumps(v)

        collection.upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[sanitized_meta]
        )
        app_logger.debug(f"Indexed doc '{doc_id}' into collection '{collection_name}'")

    def query_collection(self, collection_name: str, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Query a single collection using vector similarity."""
        collection = self._get_or_create_collection(collection_name)
        count = collection.count()
        if count == 0:
            return []

        limit = min(top_k, count)
        results = collection.query(
            query_texts=[query_text],
            n_results=limit
        )

        formatted = []
        if results and "ids" in results and results["ids"]:
            ids = results["ids"][0]
            docs = results["documents"][0] if "documents" in results else [""] * len(ids)
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(ids)
            dists = results["distances"][0] if "distances" in results else [0.0] * len(ids)

            for doc_id, doc, meta, dist in zip(ids, docs, metas, dists):
                similarity = max(0.0, 1.0 - (dist / 2.0))
                clean_meta = {}
                for k, v in meta.items():
                    try:
                        clean_meta[k] = json.loads(v) if isinstance(v, str) and (v.startswith("{") or v.startswith("[")) else v
                    except Exception:
                        clean_meta[k] = v

                formatted.append({
                    "id": doc_id,
                    "collection": collection_name,
                    "text": doc,
                    "similarity": round(similarity, 4),
                    "metadata": clean_meta
                })
        return formatted

    def query_all(self, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Query across all collections and combine results."""
        all_res = []
        for col in ["protocols", "msds", "reports"]:
            all_res.extend(self.query_collection(col, query_text, top_k=top_k))
        all_res.sort(key=lambda x: x["similarity"], reverse=True)
        return all_res[:top_k]

    def seed_test_data(self):
        """Index all JSON files located in backend/test_data/."""
        base_dir = pathlib.Path(__file__).resolve().parent.parent.parent
        test_data_dir = base_dir / "test_data"
        if not test_data_dir.exists():
            return {"protocols": 0, "msds": 0, "reports": 0}

        counts = {"protocols": 0, "msds": 0, "reports": 0}

        # Index Protocols
        proto_dir = test_data_dir / "protocols"
        if proto_dir.exists():
            for p in proto_dir.glob("*.json"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    doc_id = data.get("id", p.stem)
                    title = data.get("title", p.stem)
                    content = f"{title}. {data.get('description', '')} {data.get('steps', '')} {data.get('safety', '')}"
                    self.add_document("protocols", doc_id, content, {
                        "title": title,
                        "category": data.get("category", "General"),
                        "difficulty": data.get("difficulty", "Intermediate"),
                        "source_file": p.name
                    })
                    counts["protocols"] += 1
                except Exception as e:
                    app_logger.warning(f"Error seeding protocol {p.name}: {e}")

        # Index MSDS Sheets
        msds_dir = test_data_dir / "msds_sheets"
        if msds_dir.exists():
            for m in msds_dir.glob("*.json"):
                try:
                    with open(m, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    doc_id = data.get("id", m.stem)
                    name = data.get("chemical_name", m.stem)
                    content = f"{name} ({data.get('formula', '')}). Hazards: {data.get('hazards', '')}. Handling: {data.get('handling', '')}. Physical: {data.get('properties', '')}"
                    self.add_document("msds", doc_id, content, {
                        "title": name,
                        "formula": data.get("formula", ""),
                        "cas_number": data.get("cas_number", ""),
                        "source_file": m.name
                    })
                    counts["msds"] += 1
                except Exception as e:
                    app_logger.warning(f"Error seeding MSDS {m.name}: {e}")

        # Index Reports
        rep_dir = test_data_dir / "reports"
        if rep_dir.exists():
            for r in rep_dir.glob("*.json"):
                try:
                    with open(r, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    doc_id = data.get("id", r.stem)
                    title = data.get("title", r.stem)
                    content = f"{title}. Abstract: {data.get('abstract', '')} Methodology: {data.get('methodology', '')} Conclusion: {data.get('conclusion', '')}"
                    self.add_document("reports", doc_id, content, {
                        "title": title,
                        "experiment_type": data.get("experiment_type", "Standard"),
                        "author": data.get("author", "AI Lab"),
                        "source_file": r.name
                    })
                    counts["reports"] += 1
                except Exception as e:
                    app_logger.warning(f"Error seeding report {r.name}: {e}")

        app_logger.info(f"Vector Store seeded successfully: {counts}")
        return counts


# Global Singleton
chroma_service = ChromaService()
