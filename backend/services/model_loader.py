import os
from functools import lru_cache
from pathlib import Path

import joblib
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def load_model():
    model_path = os.getenv("MODEL_PATH", "./models/best_model.pkl")
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found at {path.resolve()}. "
            "Place best_model.pkl in backend/models or set MODEL_PATH."
        )
    return joblib.load(path)


@lru_cache(maxsize=1)
def load_vectorizer():
    tfidf_path = os.getenv("TFIDF_PATH", "./models/tfidf.pkl")
    path = Path(tfidf_path)
    if not path.exists():
        raise FileNotFoundError(
            f"TF-IDF vectorizer not found at {path.resolve()}. "
            "Place tfidf.pkl in backend/models or set TFIDF_PATH."
        )
    return joblib.load(path)


def predict_category(clean_text: str) -> tuple[str, float]:
    vectorizer = load_vectorizer()
    model = load_model()

    features = vectorizer.transform([clean_text])
    probabilities = model.predict_proba(features)[0]
    predicted_index = probabilities.argmax()
    confidence = float(probabilities[predicted_index])

    if hasattr(model, "classes_"):
        category = str(model.classes_[predicted_index])
    else:
        category = str(model.predict(features)[0])

    return category, round(confidence, 4)
