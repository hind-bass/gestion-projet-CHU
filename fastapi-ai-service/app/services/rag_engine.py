import logging
import re
from typing import Any

from app.services.spring_client import fetch_ai_context

logger = logging.getLogger(__name__)

GREETING_PATTERN = re.compile(
    r"^\s*(bonjour|salut|hello|bonsoir|coucou|hey|hi)([\s,;:!?.]*)*$",
    re.IGNORECASE,
)

GREETING_ANSWER = (
    "Bonjour, je suis l'assistant du service informatique du CHU. "
    "Posez-moi une question sur un projet, une tâche ou une réunion."
)


def is_greeting(question: str) -> bool:
    return bool(GREETING_PATTERN.match((question or "").strip()))


def retrieve_context(user_id: int, role: str, question: str) -> dict[str, Any]:
    """
    Récupère un contexte métier compact via Spring Boot.
    Les salutations n'entraînent aucun appel Spring ni Ollama.
    Le rôle envoyé par le client n'est pas une source de vérité : Spring
    recalcule les droits à partir de userId.
    """
    if is_greeting(question):
        logger.info("RAG greeting : aucun appel Spring, aucun appel Ollama")
        return {
            "status": "GREETING",
            "context": None,
            "sources_count": 0,
            "answer": GREETING_ANSWER,
        }

    logger.info("RAG appel Spring user_id=%s question_len=%s", user_id, len(question or ""))
    result = fetch_ai_context(user_id=user_id, role=role, question=question)
    logger.info(
        "RAG Spring status=%s sources=%s duration_ms=%s",
        result.get("status"),
        result.get("sources_count"),
        result.get("duration_ms"),
    )
    return result
