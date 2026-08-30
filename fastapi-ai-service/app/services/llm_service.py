import os
import requests
import json

# Ollama tourne en local sur Windows (port 11434), hors Docker.
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))


def generate_meeting_summary(speakers: list, decisions: list, tasks: list) -> str:
    """
    Génère un résumé de réunion structuré en langage naturel via LLM.
    Le LLM ne prend aucune décision métier : il rédige uniquement le compte-rendu 
    à partir des éléments déjà filtrés et extraits.
    """
    # Si pas d'éléments, retourner un résumé par défaut sans appeler le LLM
    if not decisions and not tasks:
        return "Réunion terminée sans décisions ni tâches formalisées identifiées."

    # Construction du contexte figé transmis au LLM
    prompt = f"""Tu es un assistant administratif du service informatique d'un CHU.
Rédige un compte-rendu clair et professionnel (en 3 à 5 phrases max en français) pour la réunion ci-dessous.

CONTEXTE DE LA RÉUNION :
- Intervenants : {', '.join(speakers) if speakers else 'Non spécifiés'}
- Décisions prises : {json.dumps(decisions, ensure_ascii=False)}
- Actions/Tâches extraites : {json.dumps([t['title'] for t in tasks], ensure_ascii=False)}

Règles :
1. Sois synthétique, concis et formel.
2. Base-toi EXCLUSIVEMENT sur les informations fournies ci-dessus. Ne rajoute rien d'autre.
3. Rédige directement le résumé sans introduction du type "Voici le résumé :".
"""

    try:
        payload = {
            "model": DEFAULT_MODEL,
            "prompt": prompt,
            "stream": False
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=OLLAMA_TIMEOUT)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            # Fallback en cas d'erreur de réponse Ollama
            return f"Réunion avec {len(speakers)} participant(s). {len(decisions)} décision(s) et {len(tasks)} action(s) identifiée(s)."
            
    except Exception as e:
        # Fallback de secours si Ollama n'est pas lancé / accessible
        print(f"[LLM Service Warning] Ollama non joignable: {e}")
        participants = ", ".join(speakers) if speakers else "l'équipe"
        return (
            f"Compte-rendu automatique : Réunion réunissant {participants}. "
            f"{len(decisions)} décision(s) validée(s) et {len(tasks)} tâche(s) planifiée(s)."
        )


def generate_chat_response(question: str, context: str) -> str:
    """
    Génère une réponse en langage naturel basée EXCLUSIVEMENT sur le contexte fourni.
    """
    prompt = f"""Tu es l'assistant virtuel du service informatique du CHU.
Réponds UNIQUEMENT à partir du contexte extrait de la base de données ci-dessous.
Ce contexte est la source de vérité : il contient déjà les données métier à utiliser.

CONTEXTE EXTRAIT DE LA BDD :
{context}

QUESTION DE L'UTILISATEUR :
{question}

Règles de réponse :
1. Base-toi exclusivement sur le contexte. N'utilise aucune connaissance externe.
2. Ne dis jamais qu'une information est absente, manquante ou inconnue si elle figure dans le contexte.
3. Reprends exactement les valeurs présentes dans le contexte (nombres, dates, statuts, noms).
4. Ne recalcule, n'arrondis et ne remplace aucune valeur par une estimation.
5. N'invente rien. N'ajoute aucun chiffre, date, nom ou fait qui n'est pas dans le contexte.
6. Si la question demande un chiffre (avancement, nombre, taux), donne directement le chiffre tel qu'écrit dans le contexte.
7. Réponds de façon précise, courte et professionnelle.
"""

    try:
        payload = {
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 160,
                "num_ctx": 2048,
                "temperature": 0.3,
            },
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=OLLAMA_TIMEOUT)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            return f"Voici les informations trouvées dans le système :\n\n{context}"
            
    except Exception as e:
        print(f"[LLM Chat Warning] Ollama non joignable: {e}")
        # Fallback sans LLM si le serveur local est éteint
        return f"Informations extraites de la base de données :\n{context}"