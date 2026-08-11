import re
import ssl
import socket
import datetime
import sys
from pathlib import Path
from urllib.parse import urlparse

# ─── ML Model Integration ────────────────────────────────────────────────────
# Add the model/src directory to the path so we can import the predictors
MODEL_SRC = Path(__file__).resolve().parent.parent.parent / "model" / "src"
if str(MODEL_SRC) not in sys.path:
    sys.path.insert(0, str(MODEL_SRC))

_ml_available = False
try:
    from fusion_predictor import predict_combined
    from predictor import predict_url as _ml_predict_url
    from email_predictor import predict_email as _ml_predict_email
    from text_predictor import predict_text as _ml_predict_text
    _ml_available = True
    print("[TrustLens] ML models loaded successfully.")
except Exception as e:
    print(f"[TrustLens] WARNING: ML models unavailable, falling back to heuristics: {e}")

# ─── Helpers ─────────────────────────────────────────────────────────────────

def extract_domain(url: str) -> str:
    """Extracts the domain from a URL or email."""
    if "@" in url and not url.startswith("http"):
        return url.split("@")[-1]
    if not url.startswith("http"):
        url = "http://" + url
    parsed = urlparse(url)
    domain = parsed.netloc
    if ":" in domain:
        domain = domain.split(":")[0]
    return domain


def check_ssl(domain: str) -> dict:
    """Connects to the domain and validates its SSL certificate."""
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                not_after = ssl.cert_time_to_seconds(cert['notAfter'])
                days_left = (datetime.datetime.fromtimestamp(not_after) - datetime.datetime.now()).days
                issuer = dict(x[0] for x in cert['issuer'])
                issuer_name = issuer.get('organizationName', 'Unknown Issuer')
                return {"valid": True, "days_left": days_left, "issuer": issuer_name}
    except Exception as e:
        return {"valid": False, "error": str(e)}


def calculate_verdict(score: int) -> str:
    if score >= 80: return "SAFE"
    if score >= 50: return "SUSPICIOUS"
    return "CRITICAL"


def _ml_verdict_to_label(verdict: str) -> str:
    mapping = {
        "trusted": "SAFE",
        "review": "SUSPICIOUS",
        "caution": "SUSPICIOUS",
        "high_risk": "CRITICAL",
    }
    return mapping.get(verdict, "SUSPICIOUS")


# ─── Public API ──────────────────────────────────────────────────────────────

def analyze_url(url: str, options: dict = None) -> dict:
    options = options or {}

    if _ml_available:
        try:
            result = _ml_predict_url(url)
            trust_score = result.get("trust_score", 50)
            verdict = _ml_verdict_to_label(result.get("verdict", "caution"))
            reasons = result.get("reasons", [])

            # Augment with live SSL info for extra depth
            domain = extract_domain(url)
            ssl_info = check_ssl(domain)
            if ssl_info["valid"] and ssl_info.get("days_left", 0) < 14:
                reasons.append(f"SSL certificate expires soon ({ssl_info['days_left']} days left)")
                trust_score = max(0, trust_score - 10)
                verdict = calculate_verdict(trust_score)

            return {
                "trust_score": trust_score,
                "threat_label": verdict,
                "details": {"reasons": reasons, "domain": domain}
            }
        except Exception as e:
            print(f"[TrustLens] ML predict_url failed: {e}")

    # ── Heuristic fallback ──────────────────────────────────────────────────
    domain = extract_domain(url)
    score = 100
    reasons = []

    if re.search(r'(login|verify|update|billing|secure|account|bank)', url.lower()):
        score -= 15
        reasons.append("Suspicious keywords in URL structure")
    if url.count('-') > 3:
        score -= 10
        reasons.append("Excessive hyphens (common in phishing)")
    if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
        score -= 40
        reasons.append("Direct IP address used instead of domain name")

    ssl_info = check_ssl(domain)
    if not ssl_info["valid"]:
        score -= 50
        reasons.append(f"Invalid or missing SSL Certificate ({ssl_info.get('error', 'Unknown')})")
    else:
        if ssl_info["days_left"] < 14:
            score -= 15
            reasons.append(f"SSL certificate expires soon ({ssl_info['days_left']} days left)")

    score = max(0, min(100, score))
    return {
        "trust_score": score,
        "threat_label": calculate_verdict(score),
        "details": {"reasons": reasons, "domain": domain}
    }


def analyze_email(subject: str, body: str, options: dict = None) -> dict:
    options = options or {}

    # The ML email model works on email addresses, not full bodies.
    # Extract any email address found in the combined text first.
    combined = f"{subject} {body}".strip()
    email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.]+', combined)

    if _ml_available and email_match:
        try:
            email_addr = email_match.group(0)
            result = _ml_predict_email(email_addr)
            trust_score = result.get("trust_score", 50)
            verdict = _ml_verdict_to_label(result.get("verdict", "caution"))
            reasons = result.get("reasons", [])

            # Also run the text model on the body for deeper NLP analysis
            if body.strip():
                text_result = _ml_predict_text(body)
                text_reasons = text_result.get("reasons", [])
                seen = {r.lower() for r in reasons}
                for r in text_reasons:
                    if r.lower() not in seen:
                        reasons.append(r)
                        seen.add(r.lower())
                # Blend scores: email addr weight 0.4, body text weight 0.6
                blended_score = round(trust_score * 0.4 + text_result.get("trust_score", 50) * 0.6)
                trust_score = blended_score
                verdict = calculate_verdict(trust_score)

            return {
                "trust_score": trust_score,
                "threat_label": verdict,
                "details": {"reasons": reasons}
            }
        except Exception as e:
            print(f"[TrustLens] ML predict_email failed: {e}")

    # ── Heuristic fallback ──────────────────────────────────────────────────
    text = combined.lower()
    score = 100
    reasons = []

    phishing_keywords = ['urgent', 'verify your account', 'password reset', 'invoice attached', 'suspended', 'unauthorized login']
    found_keywords = [k for k in phishing_keywords if k in text]
    if found_keywords:
        score -= 15 * len(found_keywords)
        reasons.append(f"Phishing trigger words detected: {', '.join(found_keywords)}")

    links = re.findall(r'(https?://[^\s]+)', text)
    if links:
        reasons.append(f"Found {len(links)} embedded links")

    if not links and not found_keywords:
        score = 95
        reasons.append("Standard textual pattern, low risk")

    score = max(0, min(100, int(score)))
    return {
        "trust_score": score,
        "threat_label": calculate_verdict(score),
        "details": {"reasons": reasons}
    }


def analyze_message(message: str, options: dict = None) -> dict:
    options = options or {}

    if _ml_available:
        try:
            result = _ml_predict_text(message)
            trust_score = result.get("trust_score", 50)
            verdict = _ml_verdict_to_label(result.get("verdict", "caution"))
            reasons = result.get("reasons", [])
            return {
                "trust_score": trust_score,
                "threat_label": verdict,
                "details": {"reasons": reasons}
            }
        except Exception as e:
            print(f"[TrustLens] ML predict_text failed: {e}")

    # ── Heuristic fallback ──────────────────────────────────────────────────
    text = message.lower()
    score = 100
    reasons = []

    scam_patterns = [
        (r'\b(lottery|winner|won|prize)\b', 30, "Lottery/Prize scam patterns"),
        (r'\b(crypto|bitcoin|wallet|seed phrase)\b', 25, "Cryptocurrency scam indicators"),
        (r'\b(kindly|dear sir|madam)\b', 10, "Unusual formal salutations common in scams"),
        (r'\b(gift card|amazon card|itunes)\b', 35, "Gift card extortion pattern")
    ]
    for pattern, penalty, desc in scam_patterns:
        if re.search(pattern, text):
            score -= penalty
            reasons.append(desc)

    links = re.findall(r'(https?://[^\s]+)', text)
    if links:
        score -= 15
        reasons.append("Message contains external links (SMS Phishing/Smishing risk)")

    score = max(0, min(100, score))
    return {
        "trust_score": score,
        "threat_label": calculate_verdict(score),
        "details": {"reasons": reasons}
    }


def analyze_fusion(url: str = None, message: str = None, email: str = None) -> dict:
    """Run the full ML Fusion model across all provided inputs and return a combined verdict."""
    if _ml_available:
        try:
            result = predict_combined(
                url=url or None,
                message=message or None,
                email=email or None,
            )
            if result.get("error"):
                raise ValueError(result["error"])

            trust_score = result.get("trust_score", 50)
            risk_probability = result.get("risk_probability", 0.5)
            verdict_raw = result.get("verdict", "caution")
            reasons = result.get("reasons", [])
            signals = result.get("signals", {})

            # Map fusion verdicts to our labels
            verdict = _ml_verdict_to_label(verdict_raw)

            return {
                "trust_score": trust_score,
                "threat_label": verdict,
                "risk_probability": round(risk_probability * 100, 1),
                "details": {
                    "reasons": reasons,
                    "signals": signals,
                    "fusion_mode": True,
                    "inputs": {
                        "url": url,
                        "message": message,
                        "email": email,
                    }
                }
            }
        except Exception as e:
            print(f"[TrustLens] Fusion predict failed: {e}, falling back.")

    # Fallback: run whichever individual analyzer fits best
    if url:
        return analyze_url(url)
    if email:
        return analyze_email("", email)
    if message:
        return analyze_message(message)
    return {"trust_score": 50, "threat_label": "SUSPICIOUS", "details": {"reasons": ["No valid input provided."]}}
