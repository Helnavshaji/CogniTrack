import spacy
import textstat
import numpy as np

nlp = spacy.load("en_core_web_sm")

def extract_linguistic_biomarkers(text: str) -> dict:
    if not text or len(text.split()) < 5:
        return {}

    doc = nlp(text)
    sentences = list(doc.sents)
    words = [t.text.lower() for t in doc if t.is_alpha]

    if not words:
        return {}

    # Sentence length
    avg_sentence_length = np.mean([len(list(s)) for s in sentences]) if sentences else 0

    # Reading complexity
    flesch_kincaid = textstat.flesch_kincaid_grade(text)

    # Vocabulary richness
    type_token_ratio = len(set(words)) / len(words)

    # Filler words
    fillers = {"um", "uh", "like", "basically", "literally"}
    filler_count = sum(1 for w in words if w in fillers)
    filler_rate = filler_count / len(words)

    # Semantic coherence
    if len(sentences) > 1:
        noun_sets = []
        for sent in sentences:
            nouns = {t.lemma_ for t in sent if t.pos_ in ("NOUN", "PROPN")}
            noun_sets.append(nouns)
        overlaps = []
        for i in range(1, len(noun_sets)):
            if noun_sets[i-1] and noun_sets[i]:
                union = noun_sets[i-1] | noun_sets[i]
                inter = noun_sets[i-1] & noun_sets[i]
                overlaps.append(len(inter) / len(union))
        semantic_coherence = float(np.mean(overlaps)) if overlaps else 0.5
    else:
        semantic_coherence = 1.0

    # Emotional valence
    positive_words = {"good", "great", "happy", "fine", "well", "better", "wonderful"}
    negative_words = {"bad", "tired", "sad", "worse", "awful", "depressed", "anxious"}
    pos_count = sum(1 for w in words if w in positive_words)
    neg_count = sum(1 for w in words if w in negative_words)
    emotional_valence = (pos_count - neg_count) / max(len(words), 1)

    # Self reference
    i_count = sum(1 for t in doc if t.lower_ == "i" and t.pos_ == "PRON")
    i_ratio = i_count / len(words)

    return {
        "avg_sentence_length": round(avg_sentence_length, 2),
        "flesch_kincaid_grade": round(flesch_kincaid, 2),
        "type_token_ratio": round(type_token_ratio, 3),
        "filler_rate": round(filler_rate, 4),
        "semantic_coherence": round(semantic_coherence, 3),
        "emotional_valence": round(emotional_valence, 4),
        "self_reference_ratio": round(i_ratio, 4),
        "word_count": len(words),
        "sentence_count": len(sentences)
    }