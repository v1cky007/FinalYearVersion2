import re
import spacy

class ProductionContentAnalyzer:
    def __init__(self):
        # 1. Load the pre-trained Deep Learning NLP Model
        try:
            print("⏳ Loading spaCy NLP Model (en_core_web_sm)...")
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ NLP Model Loaded Successfully!")
            self.nlp_active = True
        except Exception as e:
            print("⚠️ spaCy model not found. Run: python -m spacy download en_core_web_sm")
            self.nlp_active = False

        # 2. Structural PII Patterns (Regex is still best for exact formats)
        self.patterns = {
            "EMAIL": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            "PHONE_NUMBER": r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            "IP_ADDRESS": r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
            "SSN": r'\d{3}-\d{2}-\d{4}', 
            "CRYPTO_WALLET": r'0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}' 
        }
        
        # 3. High-Risk Semantic Keywords
        self.keywords = [
            "password", "secret", "classified", "confidential", 
            "login", "token", "api_key", "bank", "credit card", "cvv", "seed phrase"
        ]

    def analyze(self, text: str):
        threat_score = 0
        detected = []
        recommendations = []

        # ==========================================
        # PHASE 1: Contextual NLP Analysis (NER)
        # ==========================================
        if self.nlp_active:
            doc = self.nlp(text)
            
            # Analyze detected entities
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    threat_score += 10
                    detected.append(f"Person Name ({ent.text})")
                elif ent.label_ == "ORG": # Organization
                    threat_score += 10
                    detected.append(f"Organization ({ent.text})")
                elif ent.label_ == "MONEY":
                    threat_score += 25  # High risk if discussing specific financial amounts
                    detected.append(f"Financial Amount ({ent.text})")
                elif ent.label_ == "GPE": # Location/Geopolitical
                    threat_score += 5
                    detected.append(f"Location ({ent.text})")

        # ==========================================
        # PHASE 2: Structural Pattern Scanning
        # ==========================================
        for label, pattern in self.patterns.items():
            found_items = re.findall(pattern, text)
            if found_items:
                # Add heavy penalty for exact PII matches
                threat_score += (30 * len(found_items)) 
                detected.append(f"Contains {label} ({len(found_items)} found)")

        # ==========================================
        # PHASE 3: Semantic Keyword Scanning
        # ==========================================
        text_lower = text.lower()
        for word in self.keywords:
            if word in text_lower:
                threat_score += 20
                detected.append(f"Sensitive Keyword: '{word}'")

        # ==========================================
        # PHASE 4: Threat Classification & Policy
        # ==========================================
        risk_level = "LOW"
        if threat_score >= 70:
            risk_level = "CRITICAL"
            recommendations = ["Enable Burn Mode", "Enable Decoy Mode", "Use IPFS"]
            auto_burn = True
            auto_decoy = True
        elif threat_score >= 40:
            risk_level = "HIGH"
            recommendations = ["Enable Burn Mode", "Consider IPFS Backup"]
            auto_burn = True
            auto_decoy = False
        elif threat_score >= 15:
            risk_level = "MODERATE"
            recommendations = ["Consider Encryption"]
            auto_burn = False
            auto_decoy = False
        else:
            auto_burn = False
            auto_decoy = False

        # Return standardized payload for the Frontend Dashboard
        return {
            "threat_score": min(threat_score, 100), # Cap at 100
            "risk_level": risk_level,
            "detected_issues": list(set(detected)), # Remove duplicates
            "recommendations": recommendations,
            "auto_enable_burn": auto_burn,
            "auto_enable_decoy": auto_decoy
        }

# Instantiate the Singleton
analyzer = ProductionContentAnalyzer()