import requests
import json

# URL par défaut de l'instance locale Ollama (port 11434)
OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3"  # ou mistral / llama3.2 / llama2 selon votre modèle installé


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
        response = requests.post(OLLAMA_URL, json=payload, timeout=15)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            # Fallback en cas d'erreur de réponse Ollama
            return f"Réunion avec {len(speakers)} participant(s). {len(decisions)} décision(s) et {len(tasks)} action(s) identifiée(s)."
            
    except Exception as e:
        # Fallback de secours si Ollama n'est pas lancé / accessible
        print(f"[LLM Service Warning] Ollama non joignable: {e}")
        return f"Compte-rendu automatique : Réunion réunissant {', '.join(speakers) if speakers else 'l\'équipe'}. {len(decisions)} décision(s) validée(s) et {len(tasks)} tâche(s) planifiée(s)."


def generate_chat_response(question: str, context: str) -> str:
    """
    Génère une réponse en langage naturel basée EXCLUSIVEMENT sur le contexte fourni.
    """
    prompt = f"""Tu es l'assistant virtuel intelligent du service informatique du CHU.
Réponds à la question de l'utilisateur en te basant EXCLUSIVEMENT sur le contexte extrait de la base de données ci-dessous.

CONTEXTE EXTRAIT DE LA BDD :
{context}

QUESTION DE L'UTILISATEUR :
{question}

Règles de réponse :
1. Réponds de façon précise, courtoise et professionnelle.
2. Si le contexte ne contient pas l'information nécessaire pour répondre, dis clairement que vous n'avez pas l'information dans le système.
3. Ne fabrique aucune information non présente dans le contexte.
"""

    try:
        payload = {
            "model": DEFAULT_MODEL,
            "prompt": prompt,
            "stream": False
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=15)
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            return f"Voici les informations trouvées dans le système :\n\n{context}"
            
    except Exception as e:
        print(f"[LLM Chat Warning] Ollama non joignable: {e}")
        # Fallback sans LLM si le serveur local est éteint
        return f"Informations extraites de la base de données :\n{context}"