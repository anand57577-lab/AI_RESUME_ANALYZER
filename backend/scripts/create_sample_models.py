"""Generate demo TF-IDF vectorizer and classifier for portfolio use."""

from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
SAMPLES = {
    "Data Scientist": [
        "data scientist machine learning python pandas numpy scikit-learn statistics sql deep learning nlp tensorflow model deployment",
        "applied scientist predictive modeling feature engineering python pytorch data visualization experimentation a/b testing",
        "ml engineer training pipelines python sklearn pandas statistics research papers computer vision model evaluation",
    ],
    "Software Engineer": [
        "software engineer python java object oriented design algorithms data structures git rest api microservices backend development",
        "backend developer python django flask sql docker agile unit testing api design system design",
        "full stack engineer javascript node.js python sql git ci cd code review scalable services",
    ],
    "Web Developer": [
        "web developer html css javascript react typescript responsive design frontend ui ux tailwind next.js",
        "frontend engineer react javascript typescript css html spa performance optimization accessibility",
        "web developer javascript react node.js rest api git responsive layouts component driven development",
    ],
    "DevOps Engineer": [
        "devops engineer docker kubernetes aws linux ci cd terraform monitoring automation cloud infrastructure",
        "site reliability engineer kubernetes docker aws observability incident response automation scripting linux",
        "platform engineer ci cd pipelines docker aws git infrastructure as code monitoring alerting",
    ],
    "Business Analyst": [
        "business analyst sql excel power bi requirements gathering stakeholder communication agile process improvement reporting",
        "data analyst sql excel tableau dashboards kpis business requirements documentation communication problem solving",
        "business analyst project management requirements analysis excel sql reporting stakeholder management agile scrum",
    ],
}

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"


def main() -> None:
    texts: list[str] = []
    labels: list[str] = []

    for label, docs in SAMPLES.items():
        for doc in docs:
            texts.append(doc)
            labels.append(label)

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        stop_words="english",
    )

    x_train = vectorizer.fit_transform(texts)
    classifier = LogisticRegression(max_iter=1000)
    classifier.fit(x_train, np.array(labels))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(vectorizer, MODEL_DIR / "tfidf.pkl")
    joblib.dump(classifier, MODEL_DIR / "best_model.pkl")

    print(f"Saved models to {MODEL_DIR}")


if __name__ == "__main__":
    main()
