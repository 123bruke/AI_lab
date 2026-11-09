"""
Scientific PDF Document & Laboratory Protocol Parser.
Extracts apparatus requirements, chemical lists, experimental procedures,
and safety constraints from scientific documents.
"""

import re
import os
import pathlib
from typing import Dict, Any, List, Optional

from backend.app.logging_system.logger import app_logger
from backend.app.vector_store.chroma_service import chroma_service


class ScientificPDFParser:
    """
    Parser for scientific laboratory guides, research papers, and MSDS PDFs.
    Extracts text, identifies section headers, extracts tabular data,
    and indexes content directly into the ChromaDB vector store.
    """

    def __init__(self):
        pass

    def extract_text_from_file(self, file_path: str) -> str:
        """Extract raw text from PDF file or fallback text document."""
        path = pathlib.Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Try pypdf or PyPDF2 if available
        if path.suffix.lower() == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(path))
                pages = [page.extract_text() or "" for page in reader.pages]
                return "\n\n".join(pages)
            except ImportError:
                try:
                    import PyPDF2
                    reader = PyPDF2.PdfReader(str(path))
                    pages = [page.extract_text() or "" for page in reader.pages]
                    return "\n\n".join(pages)
                except Exception as e:
                    app_logger.warning(f"PDF library extraction failed ({e}), attempting text read")

        # Fallback reading as text / utf-8
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            app_logger.error(f"Failed to read file {file_path}: {e}")
            return ""

    def parse_protocol(self, text_content: str, filename: str = "document.pdf") -> Dict[str, Any]:
        """Parse structured laboratory protocol from extracted text."""
        lines = [line.strip() for line in text_content.splitlines() if line.strip()]

        title = lines[0] if lines else "Untitled Laboratory Document"
        for line in lines[:5]:
            if "experiment" in line.lower() or "investigation" in line.lower() or "protocol" in line.lower():
                title = line
                break

        # Reagents and apparatus detection
        chemicals_found = []
        apparatus_found = []
        safety_notes = []
        procedure_steps = []

        chemical_keywords = ["water", "h2o", "hydrochloric acid", "hcl", "sodium hydroxide", "naoh", "copper sulfate", "cuso4", "ethanol", "acetone", "sulfuric acid"]
        apparatus_keywords = ["beaker", "burner", "flask", "thermometer", "graduated cylinder", "calorimeter", "burette", "stirrer", "balance", "pipette"]

        current_section = "general"

        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ["hazard", "safety", "caution", "danger", "warning"]):
                safety_notes.append(line)
            if any(s in line_lower for s in ["procedure", "method", "protocol", "step"]):
                current_section = "procedure"
                continue

            # Detect chemicals
            for chem in chemical_keywords:
                if chem in line_lower and chem not in [c.lower() for c in chemicals_found]:
                    chemicals_found.append(chem.title())

            # Detect apparatus
            for app in apparatus_keywords:
                if app in line_lower and app not in [a.lower() for a in apparatus_found]:
                    apparatus_found.append(app.title())

            if current_section == "procedure" and re.match(r"^\d+[\.\)]", line):
                procedure_steps.append(line)

        parsed_data = {
            "filename": filename,
            "title": title,
            "chemicals_identified": chemicals_found,
            "apparatus_required": apparatus_found,
            "safety_precautions": safety_notes,
            "procedure_steps": procedure_steps if procedure_steps else lines[:10],
            "raw_text_length": len(text_content),
            "summary": f"Extracted protocol with {len(procedure_steps)} experimental steps, {len(chemicals_found)} chemical reagents, and {len(apparatus_found)} apparatus."
        }

        # Auto-index into ChromaDB protocols collection
        try:
            doc_id = f"parsed_pdf_{pathlib.Path(filename).stem}"
            chroma_service.add_document(
                collection_name="protocols",
                doc_id=doc_id,
                text=f"{title}. Procedure: {' '.join(procedure_steps[:5])}. Safety: {' '.join(safety_notes[:3])}",
                metadata={
                    "title": title,
                    "source_file": filename,
                    "chemicals": json.dumps(chemicals_found),
                    "apparatus": json.dumps(apparatus_found)
                }
            )
            app_logger.info(f"Indexed parsed protocol '{doc_id}' into ChromaDB")
        except Exception as e:
            app_logger.warning(f"Could not auto-index parsed protocol into ChromaDB: {e}")

        return parsed_data


# Global parser instance
scientific_pdf_parser = ScientificPDFParser()
