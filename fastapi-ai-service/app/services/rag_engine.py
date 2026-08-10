from typing import Dict, Any, Optional

# Mock de base de données (À remplacer plus tard par une vraie connexion MySQL / SQLAlchemy ou appel Spring Boot)
MOCK_DB_TASKS = [
    {"id": 1, "title": "Mise à niveau du pare-feu du bloc opératoire", "assignee_id": 1, "assignee_name": "Youssef Alami", "status": "En cours", "priority": "HAUTE", "project": "Sécurisation DSI & Logs"},
    {"id": 2, "title": "Exécution des tests de charge API Dossier Patient", "assignee_id": 2, "assignee_name": "Sanaa Chraibi", "status": "À faire", "priority": "HAUTE", "project": "Refonte SI Hospitalier"},
    {"id": 3, "title": "Vérification des accès BDD médecins", "assignee_id": 2, "assignee_name": "Sanaa Chraibi", "status": "En cours", "priority": "MOYENNE", "project": "Refonte SI Hospitalier"},
]

MOCK_DB_MEETINGS = [
    {"id": 101, "title": "Réunions Réseau & Infrastructure", "date": "2026-08-01", "summary": "Validation du nouveau switch Cisco et planification de la migration."},
]

def retrieve_context(user_id: int, role: str, question: str) -> Optional[str]:
    """
    Récupère le contexte BDD selon la question et applique le filtrage par rôle (RBAC).
    Retourne None si aucune donnée pertinente n'est trouvée (pour empêcher les hallucinations).
    """
    q_lower = question.lower()
    matching_info = []

    # 1. Filtrage des Tâches selon le Rôle
    for task in MOCK_DB_TASKS:
        # Un MEMBRE ne voit que ses propres tâches ; l'ADMIN voit tout
        if role == "MEMBRE" and task["assignee_id"] != user_id:
            continue
            
        # Détection de mots-clés dans la question
        if any(kw in q_lower for kw in ["tâche", "taches", "priorité", "faire", "projet", task["assignee_name"].lower()]):
            matching_info.append(
                f"- Tâche '{task['title']}' (Statut: {task['status']}, Priorité: {task['priority']}, Responsable: {task['assignee_name']}, Projet: {task['project']})"
            )

    # 2. Filtrage des Réunions (pour ADMIN ou si mentionné)
    if any(kw in q_lower for kw in ["réunion", "reunion", "décision", "compte rendu"]):
        for m in MOCK_DB_MEETINGS:
            matching_info.append(f"- Réunion '{m['title']}' du {m['date']}: {m['summary']}")

    # RÈGLE DE NON-HALLUCINATION : Si aucun enregistrement trouvé, retourner None
    if not matching_info:
        return None

    return "\n".join(matching_info)