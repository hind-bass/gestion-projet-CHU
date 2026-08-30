import logging
import os
import time
from pathlib import Path
from typing import Any

import requests

logger = logging.getLogger(__name__)

SPRING_TIMEOUT_SECONDS = float(os.getenv("SPRING_AI_CONTEXT_TIMEOUT", "15"))


def _load_local_env() -> None:
    """Charge le .env du projet si les variables ne sont pas déjà définies."""
    candidates = [
        Path(__file__).resolve().parents[3] / ".env",
        Path(__file__).resolve().parents[2] / ".env",
    ]
    for path in candidates:
        if not path.is_file():
            continue
        try:
            for raw in path.read_text(encoding="utf-8").splitlines():
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
        except OSError:
            continue
        break


_load_local_env()

SPRING_API_URL = os.getenv("SPRING_API_URL", "http://localhost:3000").rstrip("/")
INTERNAL_TOKEN = os.getenv("IA_SERVICE_INTERNAL_TOKEN", "")


def fetch_ai_context(user_id: int, role: str, question: str) -> dict[str, Any]:
    """
    Appelle Spring Boot POST /internal/ai/context.
    Ne logue jamais le jeton interne.
    """
    url = f"{SPRING_API_URL}/internal/ai/context"
    headers = {"Content-Type": "application/json"}
    if INTERNAL_TOKEN:
        headers["Authorization"] = f"Bearer {INTERNAL_TOKEN}"

    payload = {
        "userId": user_id,
        "role": role,
        "question": question,
    }

    started = time.perf_counter()
    try:
        logger.info("Appel Spring /internal/ai/context")
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=SPRING_TIMEOUT_SECONDS,
        )
        duration_ms = round((time.perf_counter() - started) * 1000)
        if response.status_code >= 400:
            logger.warning(
                "Spring contexte HTTP %s duration_ms=%s",
                response.status_code,
                duration_ms,
            )
            return _error(
                "Le service applicatif est temporairement indisponible. Réessayez plus tard.",
                duration_ms,
            )

        data = response.json() if response.content else {}
        return {
            "status": data.get("status") or "ERROR",
            "context": data.get("context"),
            "sources_count": int(data.get("sourcesCount", data.get("sources_count", 0)) or 0),
            "duration_ms": duration_ms,
        }
    except requests.Timeout:
        duration_ms = round((time.perf_counter() - started) * 1000)
        logger.warning("Spring contexte timeout duration_ms=%s", duration_ms)
        return _error(
            "Le service applicatif met trop de temps à répondre. Réessayez plus tard.",
            duration_ms,
        )
    except requests.RequestException as ex:
        duration_ms = round((time.perf_counter() - started) * 1000)
        logger.warning(
            "Spring contexte indisponible (%s) duration_ms=%s",
            ex.__class__.__name__,
            duration_ms,
        )
        return _error(
            "Le service applicatif est temporairement indisponible. Réessayez plus tard.",
            duration_ms,
        )


def _error(message: str, duration_ms: int) -> dict[str, Any]:
    return {
        "status": "ERROR",
        "context": message,
        "sources_count": 0,
        "duration_ms": duration_ms,
    }
