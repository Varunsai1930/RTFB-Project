# InvisiWork — Invisible Work Analytics System

InvisiWork is an analytics platform designed for software engineering teams to measure, recognize, and balance "invisible work" (such as code reviews, debugging, mentoring, knowledge sharing, documentation, incident triage, and architectural planning) alongside traditional visible output.

---

## 🌟 Overview

Developers spend significant time on vital work that rarely appears on sprint boards or commit logs. Traditional productivity metrics penalize these team contributors, leading to unfair reviews and higher burnout rates. InvisiWork makes this critical work visible, measurable, and actionable.

### Core Metrics
- **IWR (Invisible Work Ratio)**: Percentage of total logged hours spent on invisible work:  
  $$\text{IWR} = \left(\frac{\text{Invisible Work Hours}}{\text{Total Work Hours}}\right) \times 100$$
- **BCS (Burnout Correlation Score)**: A 0–100 composite index tracking burnout risk based on workload velocity, sustained high IWR, and context-switching.

---

## 📂 Repository Structure

```
├── invisiwork/               # Frontend web application (HTML5, Vanilla CSS, JS)
│   ├── index.html            # Landing page
│   ├── dashboard.html        # Main overview dashboard
│   ├── personal-dashboard.html # Developer personal analytics
│   ├── team-dashboard.html   # Team metrics & comparison
│   ├── manager-dashboard.html # Manager high-level overview
│   ├── weekly-summary.html   # Weekly report & retro view
│   ├── reports.html          # Custom report generator
│   ├── admin.html            # Team & role administration
│   ├── css/                  # Styling & modular design system
│   └── js/                   # Dashboard logic, API client & auth guards
├── invisiwork-backend/       # Backend REST API (Flask & MongoDB)
│   ├── run.py                # Server entry point
│   ├── app/
│   │   ├── auth/             # JWT auth & team membership
│   │   ├── activities/       # Activity logging & classifier
│   │   ├── metrics/          # IWR and BCS calculation engine
│   │   ├── pipeline/         # Ingestion, sheets & scheduler
│   │   ├── manager/          # Manager endpoints & summaries
│   │   └── admin/            # System & user management
│   ├── tests/                # Pytest unit & integration test suite
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
├── BUILD_BRIEF.md            # Frontend build brief & UX requirements
├── BACKEND_BUILD_BRIEF.md    # Backend architecture & data models
└── RTFBP-Project Document.txt # Project notes & documentation
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd invisiwork-backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

Runs the Flask API on `http://127.0.0.1:5000`.

### 2. Frontend Setup

The frontend is built with vanilla HTML, CSS, and modern JavaScript:

```bash
cd invisiwork
# Serve with Python or any static web server:
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

### 3. Running Tests

```bash
cd invisiwork-backend
pytest tests/
```

---

## 📄 License
All rights reserved.
