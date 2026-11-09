"""
Base Class for MOSEB Multi-Agent AI System.
Defines standard interfaces for all specialized laboratory agents.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid


class BaseAgent(ABC):
    def __init__(
        self,
        agent_id: str,
        name: str,
        role: str,
        category: str,
        description: str,
        supported_tasks: List[str],
        icon: str
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.category = category
        self.description = description
        self.supported_tasks = supported_tasks
        self.icon = icon

    def get_info(self) -> Dict[str, Any]:
        return {
            "id": self.agent_id,
            "name": self.name,
            "role": self.role,
            "category": self.category,
            "description": self.description,
            "supported_tasks": self.supported_tasks,
            "icon": self.icon,
            "status": "active"
        }

    @abstractmethod
    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Execute agent specialized logic.
        Returns a dictionary containing summary, details, structured_data,
        diagram_mermaid, svg_render, and actions_taken.
        """
        pass
