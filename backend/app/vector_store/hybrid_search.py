"""
Hybrid Search Engine Combining ChromaDB Dense Vector Similarity and BM25 Lexical Keyword Search.
Provides state-of-the-art information retrieval for laboratory protocols, chemical data, and research papers.
"""

import re
import math
from typing import List, Dict, Any, Optional
from collections import Counter
import time

from backend.app.vector_store.chroma_service import chroma_service
from backend.app.logging_system.logger import app_logger


class BM25Scorer:
    """Lightweight in-memory BM25 ranker for laboratory documents."""
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[A-Za-z0-9_-]+\b", text.lower())

    def score(self, query_tokens: List[str], doc_text: str, avg_doc_len: float = 50.0) -> float:
        doc_tokens = self._tokenize(doc_text)
        doc_len = len(doc_tokens)
        if doc_len == 0:
            return 0.0

        counts = Counter(doc_tokens)
        score = 0.0
        for token in query_tokens:
            if token in counts:
                tf = counts[token]
                # BM25 term weighting formula
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (doc_len / avg_doc_len))
                score += (numerator / denominator)
        return score


class HybridSearchEngine:
    def __init__(self):
        self.bm25 = BM25Scorer()

    def _create_snippet(self, text: str, query_tokens: List[str], max_len: int = 160) -> str:
        """Extract the most relevant excerpt containing query keywords."""
        if len(text) <= max_len:
            return text

        lowered = text.lower()
        first_pos = len(text)
        for q in query_tokens:
            pos = lowered.find(q)
            if 0 <= pos < first_pos:
                first_pos = pos

        if first_pos == len(text):
            return text[:max_len] + "..."

        start = max(0, first_pos - 40)
        end = min(len(text), start + max_len)
        snippet = text[start:end]
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        return snippet

    def search(
        self,
        query: str,
        collection: Optional[str] = "all",
        top_k: int = 5,
        vector_weight: float = 0.65,
        keyword_weight: float = 0.35
    ) -> Dict[str, Any]:
        """
        Execute Hybrid Search across vector space and lexical keyword space.
        Uses reciprocal rank fusion (RRF) and weighted linear interpolation.
        """
        start_time = time.time()
        query_tokens = re.findall(r"\b[A-Za-z0-9_-]+\b", query.lower())

        # 1. Retrieve vector search candidates from ChromaDB
        if collection and collection != "all":
            vector_results = chroma_service.query_collection(collection, query, top_k=top_k * 2)
        else:
            vector_results = chroma_service.query_all(query, top_k=top_k * 2)

        # 2. Score candidates with BM25
        scored_candidates = []
        max_bm25 = 0.001
        for item in vector_results:
            bm25_raw = self.bm25.score(query_tokens, item["text"])
            if bm25_raw > max_bm25:
                max_bm25 = bm25_raw
            scored_candidates.append({
                "item": item,
                "vector_score": item["similarity"],
                "bm25_raw": bm25_raw
            })

        # 3. Fuse scores
        fused_matches = []
        for cand in scored_candidates:
            item = cand["item"]
            v_score = cand["vector_score"]
            # Normalize BM25 to [0, 1]
            k_score = min(1.0, cand["bm25_raw"] / max_bm25) if max_bm25 > 0 else 0.0

            # Combined weighted score
            final_score = (vector_weight * v_score) + (keyword_weight * k_score)

            # Metadata title resolution
            title = item["metadata"].get("title", item["id"])
            snippet = self._create_snippet(item["text"], query_tokens)

            fused_matches.append({
                "id": item["id"],
                "title": title,
                "collection": item["collection"],
                "snippet": snippet,
                "combined_score": round(final_score, 4),
                "vector_score": round(v_score, 4),
                "keyword_score": round(k_score, 4),
                "metadata": item["metadata"]
            })

        # Sort by combined score descending
        fused_matches.sort(key=lambda x: x["combined_score"], reverse=True)
        final_results = fused_matches[:top_k]

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        app_logger.info(f"Hybrid search for '{query}' returned {len(final_results)} results in {elapsed_ms}ms")

        return {
            "query": query,
            "total_matches": len(final_results),
            "execution_time_ms": elapsed_ms,
            "results": final_results
        }


# Global Hybrid Search Instance
hybrid_search = HybridSearchEngine()
