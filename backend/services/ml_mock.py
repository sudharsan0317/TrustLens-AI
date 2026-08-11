"""
Mock ML Service
Placeholder threat analysis logic until the real ML model is ready.
Returns a trust score and threat label based on simple heuristics.
"""
import random
import re


PHISHING_KEYWORDS = [
    "verify", "account", "suspended", "login", "update", "confirm",
    "click here", "urgent", "prize", "winner", "free", "limited time",
    "bank", "password", "credential", "secure-login", "paypal", "amazon-security"
]

SAFE_DOMAINS = [
    "google.com", "youtube.com", "github.com", "microsoft.com",
    "apple.com", "amazon.com", "amazon.in", "wikipedia.org",
    "stackoverflow.com", "reddit.com"
]


def analyze_url(url: str) -> dict:
    """Heuristic URL threat analysis."""
    score = 75.0
    reasons = []

    url_lower = url.lower()

    # Check against known safe domains
    for domain in SAFE_DOMAINS:
        if domain in url_lower:
            score = random.uniform(88, 99)
            reasons.append("Domain is in trusted whitelist.")
            label = "SAFE"
            return {"trust_score": round(score, 1), "threat_label": label, "details": {"reasons": reasons}}

    # Check for phishing keywords in URL
    keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in url_lower]
    if keyword_hits:
        score -= len(keyword_hits) * 12
        reasons.append(f"Suspicious keywords detected: {', '.join(keyword_hits)}")

    # Check for HTTPS
    if not url_lower.startswith("https://"):
        score -= 15
        reasons.append("No HTTPS — connection may be insecure.")
    else:
        reasons.append("HTTPS connection is active.")

    # Check for IP address instead of domain
    if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url):
        score -= 20
        reasons.append("URL uses a raw IP address — common in phishing attacks.")

    # Check for excessive subdomains
    try:
        domain_part = url.split("//")[-1].split("/")[0]
        if domain_part.count(".") > 3:
            score -= 10
            reasons.append("Excessive subdomains detected.")
    except Exception:
        pass

    score = max(0.0, min(100.0, score + random.uniform(-5, 5)))

    if score >= 75:
        label = "SAFE"
    elif score >= 45:
        label = "SUSPICIOUS"
    else:
        label = "PHISHING"

    return {"trust_score": round(score, 1), "threat_label": label, "details": {"reasons": reasons}}


def analyze_email(subject: str, body: str) -> dict:
    """Heuristic email threat analysis."""
    score = 70.0
    reasons = []
    text = f"{subject} {body}".lower()

    keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in text]
    if keyword_hits:
        score -= len(keyword_hits) * 8
        reasons.append(f"Phishing keywords found: {', '.join(keyword_hits)}")
    else:
        reasons.append("No common phishing keywords detected.")

    # Check for suspicious URLs inside the body
    urls_in_body = re.findall(r"https?://\S+", body)
    suspicious_urls = [u for u in urls_in_body if not any(d in u for d in SAFE_DOMAINS)]
    if suspicious_urls:
        score -= 15
        reasons.append(f"{len(suspicious_urls)} suspicious link(s) found in email body.")

    score = max(0.0, min(100.0, score + random.uniform(-5, 5)))

    if score >= 75:
        label = "SAFE"
    elif score >= 45:
        label = "SUSPICIOUS"
    else:
        label = "PHISHING"

    return {"trust_score": round(score, 1), "threat_label": label, "details": {"reasons": reasons}}


def analyze_message(message: str) -> dict:
    """Heuristic message/SMS threat analysis."""
    score = 72.0
    reasons = []
    text = message.lower()

    keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in text]
    if keyword_hits:
        score -= len(keyword_hits) * 10
        reasons.append(f"Suspicious terms found: {', '.join(keyword_hits)}")
    else:
        reasons.append("No suspicious terms found in message.")

    urls_in_message = re.findall(r"https?://\S+", message)
    if urls_in_message:
        score -= 10
        reasons.append("Message contains embedded links — verify before clicking.")

    score = max(0.0, min(100.0, score + random.uniform(-5, 5)))

    if score >= 75:
        label = "SAFE"
    elif score >= 45:
        label = "SUSPICIOUS"
    else:
        label = "PHISHING"

    return {"trust_score": round(score, 1), "threat_label": label, "details": {"reasons": reasons}}
