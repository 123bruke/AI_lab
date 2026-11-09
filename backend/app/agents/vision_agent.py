"""
Agent 9: YOLOv8 Computer Vision & Multimodal Document Agent.
Analyzes laboratory images with YOLOv8 optical object detection and parses
scientific protocol PDF manuals for experimental extraction.
"""

from typing import Dict, Any, Optional
from backend.app.agents.base_agent import BaseAgent
from backend.app.vision.yolo_detector import yolo_lab_detector
from backend.app.vision.pdf_parser import scientific_pdf_parser
from backend.app.logging_system.logger import app_logger


class VisionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="vision_agent",
            name="YOLOv8 Vision & Document Agent",
            role="Multimodal Vision Specialist & Optical Analyst",
            category="Perception",
            description="Executes YOLOv8 object detection on laboratory images to recognize apparatus, liquid meniscus volume, and heat sources, and parses scientific PDF guides.",
            supported_tasks=["detect_apparatus", "measure_meniscus", "parse_protocol_pdf", "inspect_bench_hazards"],
            icon="Camera"
        )

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        params = parameters or {}
        temp = apparatus_state.get("temperature", 24.5) if apparatus_state else 24.5
        liquid = apparatus_state.get("waterLevel", 150.0) if apparatus_state else 150.0

        pdf_path = params.get("pdf_path")
        image_input = params.get("image_data")

        if pdf_path:
            # Parse PDF document
            raw_text = scientific_pdf_parser.extract_text_from_file(pdf_path)
            parsed = scientific_pdf_parser.parse_protocol(raw_text, filename=pdf_path)
            summary = f"Parsed scientific document '{parsed['title']}' with {len(parsed['chemicals_identified'])} reagents and {len(parsed['procedure_steps'])} steps."
            return {
                "summary": summary,
                "details": f"Vision & Document Agent extracted structured protocol from PDF file.",
                "structured_data": parsed,
                "diagram_mermaid": None,
                "svg_render": None,
                "actions_taken": [
                    {"action": "parse_pdf_document", "path": pdf_path},
                    {"action": "index_to_chromadb", "collection": "protocols"}
                ]
            }

        # Otherwise run YOLO apparatus optical analysis
        analysis = yolo_lab_detector.analyze_image(image_input, temperature=temp, liquid_level=liquid)

        summary = (
            f"YOLOv8 Vision Analysis: Identified {len(analysis['detections'])} laboratory apparatus entities. "
            f"Meniscus Volume = {analysis['estimated_liquid_volume_ml']} mL, Hotspots = {analysis['thermal_hotspots_detected']}."
        )

        return {
            "summary": summary,
            "details": analysis["summary"],
            "structured_data": analysis,
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {"action": "yolov8_inference", "model": analysis["model_version"], "latency_ms": analysis["inference_time_ms"]},
                {"action": "optical_meniscus_readout", "volume_ml": analysis["estimated_liquid_volume_ml"]}
            ]
        }

