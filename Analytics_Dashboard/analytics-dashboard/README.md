# HappyRobot Analytics Dashboard

React frontend for visualizing carrier call analytics and intelligence insights.

## Features

- **Performance Metrics**: KPIs, trends, and recent calls
- **Carrier Intelligence**: Insights, recommendations, and behavior analysis
- **Real-time Data**: Live updates from the Collector API
- **Responsive Design**: Mobile-friendly interface
- **Interactive Charts**: Recharts-powered visualizations

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL and key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Docker

```bash
docker build -t analytics-dashboard .
docker run -p 3000:3000 --env-file .env analytics-dashboard
```

## Environment Variables

- `VITE_API_URL` - Base URL of the Collector API
- `VITE_API_KEY` - API key for authentication

## Pages

### Performance Metrics (`/`)
- KPI cards showing key metrics
- Conversion rate and sentiment trends
- Recent calls table

### Carrier Intelligence (`/intelligence`)
- Carrier performance analysis
- Route performance breakdown
- Equipment type analysis
- Carrier recommendation search

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client

## API Integration

The dashboard connects to the Collector API endpoints:

- `GET /api/v1/metrics/overview` - Overview KPIs
- `GET /api/v1/metrics/trends` - Time-series data
- `GET /api/v1/breakdowns/by-route` - Route performance
- `GET /api/v1/breakdowns/by-equipment` - Equipment analysis
- `GET /api/v1/breakdowns/by-carrier` - Carrier insights
- `GET /api/v1/intelligence/recommendations` - Carrier recommendations
