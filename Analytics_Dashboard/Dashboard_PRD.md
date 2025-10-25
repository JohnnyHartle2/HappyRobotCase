# 🚛 HappyRobot Carrier Intelligence Dashboard

## 📘 Overview

The **HappyRobot Carrier Intelligence Dashboard** is a full-stack analytics platform built to visualize and analyze inbound carrier call data coming from the HappyRobot platform.  
It combines **Operational KPIs** (performance metrics) and **Carrier Intelligence** (behavioral insights + recommendations) into a single web dashboard.

This project consists of:

1. A **Collector API** (FastAPI) that receives call event data from HappyRobot or a database, processes it, and exposes analytics endpoints.
2. A **React Dashboard** (Tailwind + Recharts) that consumes those endpoints to show real-time and historical metrics.

---

## 🧩 Architecture

HappyRobot Platform → Collector API → PostgreSQL → Analytics Dashboard

- **HappyRobot Platform** — Source of truth for call + negotiation data (webhook or API feed)
- **Collector API** — Receives, normalizes, and aggregates call data
- **PostgreSQL** — Stores raw and aggregated event data
- **Dashboard (React)** — Displays KPIs, insights, and recommendations in a web UI

---

## 🧱 Tech Stack

| Layer       | Tech                                   |
| ----------- | -------------------------------------- |
| Backend API | FastAPI + SQLAlchemy + PostgreSQL      |
| Frontend    | React + TailwindCSS + Recharts + Axios |
| Deployment  | Render (Frontend + Backend)            |
| Data        | Render PostgreSQL add-on               |
| Auth        | API key-based (simple for case demo)   |

---

## 📁 Folder Structure

Analytics_Dashboard/
│
├── collector-api/
│ ├── app/
│ │ ├── main.py
│ │ ├── models.py
│ │ ├── routes/
│ │ │ ├── ingest.py
│ │ │ ├── metrics.py
│ │ │ └── intelligence.py
│ │ └── db.py
│ ├── requirements.txt
│ ├── Dockerfile
│ └── README.md
│
└── analytics-dashboard/
├── src/
│ ├── components/
│ │ ├── KPICard.jsx
│ │ ├── LineChart.jsx
│ │ ├── TableView.jsx
│ │ └── CarrierInsight.jsx
│ ├── pages/
│ │ ├── Performance.jsx
│ │ └── Intelligence.jsx
│ ├── api/
│ │ └── metrics.js
│ ├── App.jsx
│ ├── index.jsx
│ └── styles.css
├── package.json
├── Dockerfile
└── README.md

---

## ⚙️ Collector API (FastAPI)

### 🔑 Responsibilities

- Receive webhook or batched event data from the HappyRobot system
- Store call, load, and negotiation info in PostgreSQL
- Expose summarized metrics and analytics endpoints for the dashboard

---

### 📦 Example Endpoints

| Endpoint                        | Method | Description                                                 |
| ------------------------------- | ------ | ----------------------------------------------------------- |
| `/events/call.completed`        | POST   | Receives new call event                                     |
| `/metrics/overview`             | GET    | Returns summary KPIs                                        |
| `/metrics/trends`               | GET    | Returns conversion, rate, and sentiment trends              |
| `/breakdowns/by-route`          | GET    | Route-level aggregates                                      |
| `/breakdowns/by-equipment`      | GET    | Equipment-type metrics                                      |
| `/breakdowns/by-carrier`        | GET    | Carrier performance data                                    |
| `/intelligence/recommendations` | GET    | Suggests carriers for specific routes (mocked or heuristic) |

---

### 🧾 Example Event Payload

```json
{
  "event_id": "evt_123",
  "call_id": "call_456",
  "carrier": {"mc_number": "123456", "name": "Acme Transport"},
  "load": {
    "load_id": "L-901",
    "origin": "Chicago, IL",
    "destination": "Dallas, TX",
    "equipment_type": "Flatbed",
    "loadboard_rate": 1800,
    "miles": 925
  },
  "negotiation_rounds": 2,
  "final_agreed_rate": 1650,
  "outcome": "accepted",
  "sentiment_score": 0.42,
  "started_at": "2025-10-23T15:21:00Z",
  "ended_at": "2025-10-23T15:28:30Z"
}
🧠 Aggregation Logic
Conversion Rate: % of calls that ended with outcome = “accepted”

Average Negotiation Rounds

Rate Difference: (final_rate - loadboard_rate) / loadboard_rate

Sentiment Breakdown: percentage positive/neutral/negative

Route Performance: average rates & success ratios per origin-destination pair

Equipment Type Analysis

Carrier Behavior: preferred lanes, avg accepted rate, frequency

Recommendation Heuristic: carriers with lowest average rate + highest acceptance on similar lanes

🧰 Environment Variables (Render)
Variable	Description
DATABASE_URL	Render Postgres connection string
INGEST_API_KEY	Key for posting events
READ_API_KEY	Key for dashboard access
CORS_ORIGINS	Allowed origins (dashboard URL)

🐳 Dockerfile (Collector API)
dockerfile
Copy code
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
📊 Analytics Dashboard (React)
🔑 Responsibilities
Visualize metrics and insights fetched from the Collector API

Provide an intuitive, data-driven UI with filters

Showcase both performance KPIs and deeper carrier intelligence

📈 Dashboard Pages
1️⃣ Performance Metrics
Components

KPI Cards

Total Calls

Conversion Rate

Avg Negotiation Rounds

Avg Accepted Rate vs Loadboard Rate

Sentiment Distribution

Trend Charts

Conversion Rate over Time

Sentiment Over Time

Accepted Rate Trend

Recent Calls Table

Carrier, Route, Outcome, Negotiation Rounds, Rate Delta

2️⃣ Carrier Intelligence
Components

Carrier Insights Table

Carrier Name, Preferred Routes, Avg Rate per Mile, Booking Frequency

Route Heatmap

Most Profitable or Active Lanes

Negotiation Behavior Chart

Distribution of Rounds to Close

Recommendation Widget

“Top Recommended Carriers for [Origin → Destination]”

🔧 Environment Variables (Render)
Variable	Description
VITE_API_URL	Base URL of the Collector API
VITE_API_KEY	API key for read access

🐳 Dockerfile (Dashboard)
dockerfile
Copy code
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
🚀 Deployment Instructions (Render)
Deploy Collector API

Create new Web Service

Connect GitHub repo happyrobot-collector-api

Add environment variables

Add Render PostgreSQL add-on

Deploy

Deploy Dashboard

Create new Static Site or Node Web Service

Connect GitHub repo happyrobot-analytics-dashboard

Set VITE_API_URL = Collector API public URL

Add VITE_API_KEY

Deploy

Configure HappyRobot

If possible, set up webhook → https://<collector-api>/events/call.completed

Use your INGEST_API_KEY in headers

🧠 Future Enhancements
Add LLM-based “Weekly Insights” summary of performance

Export reports as CSV/PDF

Add user authentication (Clerk or Auth0)

Real-time updates via WebSocket

✅ Success Criteria
Dashboard shows both high-level KPIs and granular intelligence

All endpoints secured by API key

Data stored and aggregated in Postgres

Visualizations are responsive and intuitive

Deployed URLs for both API and Dashboard live on Render
```
