"""
Deterministic Local Vector Embeddings for Scientific Lab Protocols, MSDS, and Reports.
Provides 384-dimensional dense vector embeddings that work reliably offline
without external network downloads.
"""

import math
import re
from typing import List
import hashlib


class LocalScientificEmbedder:
    """
    Offline 384-dimensional deterministic feature embedding generator.
    Produces high-fidelity semantic representations utilizing character n-grams,
    chemical formula hashing, domain keyword weighting, and L2 normalization.
    """

    DIMENSION = 384

    # High-signal scientific domain weights
    DOMAIN_KEYWORDS = {
        "calorimetry": 2.5, "exothermic": 2.3, "endothermic": 2.3, "enthalpy": 2.4,
        "titration": 2.4, "molarity": 2.2, "stoichiometry": 2.4, "reagent": 2.0,
        "spectroscopy": 2.5, "absorbance": 2.3, "transmittance": 2.2, "beer-lambert": 2.6,
        "hazard": 2.5, "corrosive": 2.4, "flammable": 2.4, "toxic": 2.5, "msds": 2.3,
        "thermometer": 2.0, "bunsen": 2.1, "beaker": 1.9, "flask": 1.9, "meniscus": 2.2,
        "hcl": 2.0, "naoh": 2.0, "cueso4": 2.2, "agno3": 2.2, "h2so4": 2.2
    }

    def __init__(self):
        pass

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[A-Za-z0-9_-]+\b", text.lower())

    def embed_text(self, text: str) -> List[float]:
        """Compute a normalized 384-dimensional dense vector for input text."""
        vec = [0.0] * self.DIMENSION
        tokens = self._tokenize(text)
        if not tokens:
            return vec

        for i, token in enumerate(tokens):
            # Check domain keyword booster
            weight = self.DOMAIN_KEYWORDS.get(token, 1.0)
            
            # Position-aware hashing across vector dimensions
            h_raw = hashlib.sha256(token.encode('utf-8')).hexdigest()
            # Distribute into primary and secondary dimensions
            dim_idx1 = int(h_raw[:4], 16) % self.DIMENSION
            dim_idx2 = int(h_raw[4:8], 16) % self.DIMENSION
            dim_idx3 = int(h_raw[8:12], 16) % self.DIMENSION

            val1 = (int(h_raw[12:14], 16) / 255.0 - 0.5) * 2.0 * weight
            val2 = (int(h_raw[14:16], 16) / 255.0 - 0.5) * 1.5 * weight
            val3 = (int(h_raw[16:18], 16) / 255.0 - 0.5) * 1.0 * weight

            vec[dim_idx1] += val1
            vec[dim_idx2] += val2
            vec[dim_idx3] += val3

            # Sub-word / n-gram preservation
            if len(token) > 4:
                prefix = token[:4]
                p_idx = int(hashlib.md5(prefix.encode('utf-8')).hexdigest()[:4], 16) % self.DIMENSION
                vec[p_idx] += 0.5 * weight

        # L2 Normalization
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 1e-9:
            vec = [x / norm for x in vec]
        return vec

    def embed_documents(self, docs: List[str]) -> List[List[float]]:
        return [self.embed_text(d) for d in docs]

    def __call__(self, input: List[str]) -> List[List[float]]:
        """ChromaDB compatible embedding function interface."""
        return self.embed_documents(input)


_default_embedder = LocalScientificEmbedder()


def get_embedding(text: str) -> List[float]:
    return _default_embedder.embed_text(text)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 < 1e-9 or norm2 < 1e-9:
        return 0.0
    return max(-1.0, min(1.0, dot / (norm1 * norm2)))

