import re
import numpy as np
import textstat

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print(f"Spacy model load warning (using lightweight fallback): {e}")
    nlp = None

def extract_linguistic_biomarkers(text: str) -> dict:
    if not text or len(text.split()) < 5:
        return {}

    try:
        if nlp:
            doc = nlp(text)
            sentences = list(doc.sents)
            words = [t.text.lower() for t in doc if t.is_alpha]
            
            avg_sentence_length = np.mean([len(list(s)) for s in sentences]) if sentences else 0
            flesch_kincaid = textstat.flesch_kincaid_grade(text)
            type_token_ratio = len(set(words)) / len(words) if words else 0
            
            fillers = {"um", "uh", "like", "basically", "literally"}
            filler_count = sum(1 for w in words if w in fillers)
            filler_rate = filler_count / len(words) if words else 0

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

            positive_words = {"good", "great", "happy", "fine", "well", "better", "wonderful"}
            negative_words = {"bad", "tired", "sad", "worse", "awful", "depressed", "anxious"}
            pos_count = sum(1 for w in words if w in positive_words)
            neg_count = sum(1 for w in words if w in negative_words)
            emotional_valence = (pos_count - neg_count) / max(len(words), 1)

            i_count = sum(1 for t in doc if t.lower_ == "i" and t.pos_ == "PRON")
            i_ratio = i_count / len(words) if words else 0

            return {
                "avg_sentence_length": round(float(avg_sentence_length), 2),
                "flesch_kincaid_grade": round(float(flesch_kincaid), 2),
                "type_token_ratio": round(float(type_token_ratio), 3),
                "filler_rate": round(float(filler_rate), 4),
                "semantic_coherence": round(float(semantic_coherence), 3),
                "emotional_valence": round(float(emotional_valence), 4),
                "self_reference_ratio": round(float(i_ratio), 4),
                "word_count": len(words),
                "sentence_count": len(sentences)
            }
        else:
            # Lightweight Python Fallback
            words = [w.lower() for w in re.findall(r'\b[a-zA-Z]+\b', text)]
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
            
            avg_sentence_length = len(words) / max(len(sentences), 1)
            try:
                flesch_kincaid = textstat.flesch_kincaid_grade(text)
            except Exception:
                flesch_kincaid = 5.0

            type_token_ratio = len(set(words)) / max(len(words), 1)
            fillers = {"um", "uh", "like", "basically", "literally"}
            filler_rate = sum(1 for w in words if w in fillers) / max(len(words), 1)

            positive_words = {"good", "great", "happy", "fine", "well", "better", "wonderful"}
            negative_words = {"bad", "tired", "sad", "worse", "awful", "depressed", "anxious"}
            pos_count = sum(1 for w in words if w in positive_words)
            neg_count = sum(1 for w in words if w in negative_words)
            emotional_valence = (pos_count - neg_count) / max(len(words), 1)
            i_ratio = sum(1 for w in words if w == "i") / max(len(words), 1)

            return {
                "avg_sentence_length": round(float(avg_sentence_length), 2),
                "flesch_kincaid_grade": round(float(flesch_kincaid), 2),
                "type_token_ratio": round(float(type_token_ratio), 3),
                "filler_rate": round(float(filler_rate), 4),
                "semantic_coherence": 0.85,
                "emotional_valence": round(float(emotional_valence), 4),
                "self_reference_ratio": round(float(i_ratio), 4),
                "word_count": len(words),
                "sentence_count": len(sentences)
            }
    except Exception as e:
        print(f"Biomarker extraction error: {e}")
        return {}