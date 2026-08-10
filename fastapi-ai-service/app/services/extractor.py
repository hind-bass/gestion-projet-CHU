import re
import dateparser
from typing import List, Dict, Any

# Dictionnaire de compétences IT à détecter automatiquement
SKILL_KEYWORDS = [
    "FastAPI", "React", "Python", "Java", "Docker", "SQL", "PostgreSQL",
    "Réseau", "Sécurité", "Pare-feu", "Switch", "Tests", "Tests de charge",
    "API", "SI", "Base de données", "UI", "UX", "DevOps", "Linux"
]

HIGH_PRIORITY_KEYWORDS = ["urgent", "urgente", "bloc", "bloquant", "critique", "prioritaire", "immédiat", "asap"]


def extract_speakers(text: str) -> List[str]:
    """Extrait les noms des intervenants au début des lignes (ex: 'Mohamed :', '[Marc]')."""
    pattern = r'^(?:\[([^\]]+)\]|([A-Z][a-zA-zA-ZÀ-ÿ\s-]+)\s*:)'
    speakers = set()
    
    for line in text.split('\n'):
        match = re.match(pattern, line.strip())
        if match:
            speaker = match.group(1) or match.group(2)
            if speaker:
                speakers.add(speaker.strip())
                
    return list(speakers)


def _detect_skills(text_line: str) -> List[str]:
    """Détecte les compétences techniques mentionnées dans une ligne."""
    line_lower = text_line.lower()
    detected = []
    for skill in SKILL_KEYWORDS:
        # Recherche par mot complet pour éviter les faux positifs
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', line_lower):
            detected.append(skill)
    return list(set(detected))


def _calculate_confidence(has_assignee: bool, has_due_date: bool, has_skills: bool) -> int:
    """Calcule le score de confiance d'extraction IA en fonction de la richesse des données trouvées."""
    score = 65
    if has_assignee:
        score += 15
    if has_due_date:
        score += 10
    if has_skills:
        score += 8
    return min(score, 98)


def extract_decisions_and_tasks(text: str) -> Dict[str, Any]:
    """Détecte les décisions et les tâches enrichies (ID, compétences, confiance, priorité)."""
    lines = text.split('\n')
    decisions = []
    tasks = []
    
    # Mots-clés déclencheurs
    decision_keywords = ["décidé", "décision", "validé", "accord", "conclu", "adopté"]
    task_keywords = ["doit", "va faire", "s'occupe de", "charger de", "à faire", "action", "propose de", "besoin de"]
    
    task_counter = 101

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        line_lower = line_str.lower()
        
        # 1. Extraction de décision
        if any(kw in line_lower for kw in decision_keywords):
            decisions.append(line_str)
            
        # 2. Extraction de tâche
        elif any(kw in line_lower for kw in task_keywords):
            # Tenter d'extraire une date limite dans la ligne
            parsed_date = dateparser.parse(
                line_str, 
                languages=['fr'], 
                settings={'PREFER_DATES_FROM': 'future', 'RELATIVE_BASE': None}
            )
            due_date_str = parsed_date.strftime('%Y-%m-%d') if parsed_date else None
            
            # Tenter de deviner le responsable
            speaker_match = re.match(r'^([A-Z][a-zA-zA-ZÀ-ÿ-]+)\s*:', line_str)
            assignee = speaker_match.group(1) if speaker_match else "Non assigné"
            
            # Évaluation de la priorité (HAUTE si présence de mots critiques, sinon MOYENNE)
            priority = "HAUTE" if any(kw in line_lower for kw in HIGH_PRIORITY_KEYWORDS) else "MOYENNE"
            
            # Détection des compétences
            skills = _detect_skills(line_str)
            
            # Score de confiance
            confidence = _calculate_confidence(
                has_assignee=(assignee != "Non assigné"),
                has_due_date=(due_date_str is not None),
                has_skills=(len(skills) > 0)
            )

            tasks.append({
                "id": f"AI-{task_counter}",
                "title": line_str,
                "assignee": assignee,
                "due_date": due_date_str,
                "priority": priority,
                "confidence": confidence,
                "skills": skills,
                "status_validation": "EN_ATTENTE"
            })
            task_counter += 1
            
    return {
        "decisions": decisions,
        "tasks": tasks
    }