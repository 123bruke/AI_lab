"""
Agent 4: Literature & Scientific Knowledge Harvester Agent.
Queries ChromaDB vector collections and executes Hybrid Search (vector + BM25)
to gather empirical constants, scientific papers, and experimental procedures.
"""

from typing import Dict, Any, Optional
try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.vector_store.hybrid_search import hybrid_search
    from backend.app.vector_store.chroma_service import chroma_service
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from .base_agent import BaseAgent
    from ..vector_store.hybrid_search import hybrid_search
    from ..vector_store.chroma_service import chroma_service
    from ..logging_system.logger import app_logger


class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="research_agent",
            name="Literature & Knowledge Harvester",
            role="Information Retrieval & Hybrid Vector Search Specialist",
            category="Information Retrieval",
            description="Searches ChromaDB vector store using Hybrid Search (dense vectors + BM25 keyword fusion) to harvest scientific papers, protocol procedures, and thermodynamic literature.",
            supported_tasks=["hybrid_search", "harvest_literature", "lookup_constants", "summarize_protocol"],
            icon="Search"
        )

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        params = parameters or {}
        collection = params.get("collection", "all")
        top_k = params.get("top_k", 5)

        # Execute Hybrid Search across ChromaDB
        search_res = hybrid_search.search(
            query=prompt,
            collection=collection,
            top_k=top_k,
            vector_weight=params.get("vector_weight", 0.65),
            keyword_weight=params.get("keyword_weight", 0.35)
        )

        matches = search_res.get("results", [])
        total = len(matches)

        if total > 0:
            top_match = matches[0]
            summary = (
                f"Retrieved {total} scientific sources via Hybrid Search in {search_res['execution_time_ms']}ms. "
                f"Top citation: '{top_match['title']}' (Score: {top_match['combined_score']:.3f})."
            )
        else:
            summary = f"Hybrid search completed in {search_res['execution_time_ms']}ms. No exact matches found for '{prompt}'."

        return {
            "summary": summary,
            "details": f"Queried ChromaDB collections across dense embedding space and BM25 inverted index. Fused scores using Reciprocal Rank Fusion.",
            "structured_data": search_res,
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {
                    "action": "execute_chromadb_hybrid_search",
                    "query": prompt,
                    "matches_found": total,
                    "latency_ms": search_res["execution_time_ms"]
                }
            ]
        }

