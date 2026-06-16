import re
from typing import Iterable

SKILL_KEYWORDS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "sql",
    "mongodb",
    "postgresql",
    "mysql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "linux",
    "machine learning",
    "deep learning",
    "nlp",
    "natural language processing",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "data analysis",
    "data visualization",
    "power bi",
    "tableau",
    "excel",
    "statistics",
    "agile",
    "scrum",
    "project management",
    "communication",
    "leadership",
    "problem solving",
    "html",
    "css",
    "tailwind",
    "fastapi",
    "flask",
    "django",
    "rest api",
    "graphql",
    "ci/cd",
    "devops",
    "cloud computing",
    "computer vision",
    "llm",
    "transformers",
    "bert",
    "spacy",
    "feature engineering",
    "model deployment",
}

CATEGORY_SKILL_PROFILES = {
    "data scientist": {
        "python",
        "machine learning",
        "pandas",
        "numpy",
        "statistics",
        "scikit-learn",
        "sql",
        "data visualization",
        "deep learning",
        "tensorflow",
        "pytorch",
    },
    "software engineer": {
        "python",
        "java",
        "javascript",
        "git",
        "sql",
        "rest api",
        "docker",
        "agile",
        "linux",
        "ci/cd",
    },
    "web developer": {
        "html",
        "css",
        "javascript",
        "react",
        "typescript",
        "node.js",
        "rest api",
        "git",
        "tailwind",
        "next.js",
    },
    "devops engineer": {
        "docker",
        "kubernetes",
        "aws",
        "linux",
        "ci/cd",
        "git",
        "python",
        "cloud computing",
        "devops",
        "rest api",
    },
    "business analyst": {
        "sql",
        "excel",
        "power bi",
        "tableau",
        "communication",
        "project management",
        "agile",
        "data analysis",
        "problem solving",
        "statistics",
    },
}


def extract_skills(text: str) -> list[str]:
    found: list[str] = []
    normalized = text.lower()

    for skill in sorted(SKILL_KEYWORDS, key=len, reverse=True):
        pattern = re.escape(skill).replace(r"\ ", r"\s+")
        if re.search(rf"\b{pattern}\b", normalized):
            label = skill.title() if skill.islower() else skill
            if label not in found:
                found.append(label)

    return found[:20]


def get_missing_skills(category: str, extracted_skills: Iterable[str]) -> list[str]:
    profile_key = category.lower()
    expected = CATEGORY_SKILL_PROFILES.get(profile_key)

    if not expected:
        for key in CATEGORY_SKILL_PROFILES:
            if key in profile_key or profile_key in key:
                expected = CATEGORY_SKILL_PROFILES[key]
                break

    if not expected:
        expected = CATEGORY_SKILL_PROFILES["software engineer"]

    extracted_normalized = {skill.lower() for skill in extracted_skills}
    missing = [
        skill.title() if skill.islower() else skill
        for skill in sorted(expected)
        if skill.lower() not in extracted_normalized
    ]
    return missing[:8]


def compute_ats_score(text: str, extracted_skills: list[str], missing_skills: list[str]) -> float:
    word_count = len(text.split())
    skill_coverage = len(extracted_skills) / max(len(extracted_skills) + len(missing_skills), 1)

    length_score = min(word_count / 450, 1.0) * 35
    skill_score = skill_coverage * 40
    structure_score = 15 if re.search(r"(experience|education|skills|projects)", text) else 5
    contact_score = 10 if re.search(r"[@]\w+\.\w+|linkedin|github", text) else 3

    return round(min(length_score + skill_score + structure_score + contact_score, 100), 1)


def build_recommendations(
    category: str,
    confidence: float,
    ats_score: float,
    missing_skills: list[str],
    word_count: int,
) -> list[str]:
    recommendations: list[str] = []

    if confidence < 0.65:
        recommendations.append(
            f"Strengthen role alignment for {category} by highlighting relevant projects and tools."
        )

    if ats_score < 70:
        recommendations.append(
            "Improve ATS compatibility with clear section headers: Experience, Skills, Education, and Projects."
        )

    if missing_skills:
        recommendations.append(
            f"Add or emphasize these role-relevant skills: {', '.join(missing_skills[:4])}."
        )

    if word_count < 250:
        recommendations.append(
            "Expand impact-focused bullet points with measurable outcomes (metrics, percentages, scale)."
        )
    elif word_count > 900:
        recommendations.append(
            "Trim less relevant details to keep the resume concise and scannable for recruiters."
        )

    if not recommendations:
        recommendations.append(
            "Strong resume profile. Keep updating achievements and tailoring keywords to each job posting."
        )

    return recommendations[:5]
