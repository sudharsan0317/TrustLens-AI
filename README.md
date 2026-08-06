# TrustLens AI

**An AI-based digital trust & threat detection engine.**
TrustLens AI scans links, emails, and messages in real time and returns an explainable Trust Score — before you click.

Built for **HackZen '26** by **Team The Solvers**, Department of Artificial Intelligence and Data Science, Sri Krishna College of Engineering and Technology.

---

## The problem

Phishing emails, spoofed websites, and impersonation scams are getting harder to tell apart from genuine communication. Existing spam filters rely on static blocklists — they miss zero-day phishing domains and give users a blunt block/allow decision with no explanation. Over 3.4 billion phishing emails are sent daily worldwide, and a single successful attempt can mean stolen credentials, financial loss, or a data breach.

## What TrustLens AI does

- **Scans** a URL, email, or message in real time
- **Scores** it 0–100 using a fusion of NLP content analysis and URL/domain heuristics
- **Explains** the verdict in plain language (e.g. "lookalike domain," "no valid SSL history," "urgent login language") instead of a binary block/allow flag
- **Logs** high-risk flags in a tamper-evident, SHA-256 backed incident trail

| Score | Verdict |
|---|---|
| 0–39 | 🔴 High Risk |
| 40–69 | 🟡 Caution |
| 70–100 | 🟢 Trusted |

## How it works

```
Ingest → Extract Signals → Fuse & Score → Classify → Explain → Log
```

1. **Ingest** — a URL, email, or message is submitted via the dashboard, API, or browser extension.
2. **Extract signals** — an NLP model flags urgency/impersonation language; a URL model checks domain age, SSL, and redirects.
3. **Fuse & score** — a fusion model combines both signal sets into a single 0–100 Trust Score.
4. **Classify** — the score maps to High Risk, Caution, or Trusted.
5. **Explain** — the user gets plain-language reasons behind the verdict.
6. **Log** — high-risk flags are recorded in a SHA-256 backed evidence trail.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ML | scikit-learn (TF-IDF + classifier), lexical URL feature extraction |
| Tooling | Git/GitHub, Postman, VS Code, pytest |

## Project structure

```
trustlens-ai/
├── backend/
│   ├── main.py              # FastAPI app, /scan and /history endpoints
│   ├── models/               # trained classifiers (.pkl)
│   ├── features/              # text + URL feature extraction
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # ScoreCard, ReasonChips, ScanHistory
│   │   └── App.jsx
│   └── package.json
├── notebooks/
│   └── train_model.ipynb      # model training & evaluation
├── docs/
│   └── screenshots/
└── README.md
```

## Getting started

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## API

**POST** `/scan`
```json
// Request
{ "input": "https://secure-paypa1-verify.com/login" }

// Response
{
  "score": 28,
  "verdict": "High Risk",
  "reasons": [
    "Lookalike domain",
    "No valid SSL history",
    "Urgent login language"
  ]
}
```

**GET** `/history`
Returns the most recent scans with their scores and timestamps.

## Screenshots

| Dashboard | Scan Result |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Scan Result](docs/screenshots/scan-result.png) |

## Roadmap

- [ ] Browser extension for inline scanning
- [ ] Multilingual phishing detection
- [ ] Org-wide threat analytics dashboard
- [ ] Enterprise API tier

## Team — The Solvers

| Name | Role |
|---|---|
| Priya S | Team Lead & Frontend Developer |
| Siva Surya P K | ML/AI Engineer |
| Sudharsan K | Backend Developer |
| Sachin R | Research & Documentation |

## License

This project was built for HackZen '26 and is currently unlicensed for external use. Add a license (e.g. MIT) before public release.
