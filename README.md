# HappyRobot Case Study

This repository contains the complete implementation for the HappyRobot Forward Deployed Engineer technical challenge.

## Project Structure

```
HappyRobotCase/
├── Inbound_API/           # Loads API (Complete)
│   ├── src/              # Fastify + TypeScript API
│   ├── prisma/           # Database schema & migrations
│   ├── scripts/          # Deployment scripts
│   ├── Dockerfile        # Container configuration
│   └── README.md         # API documentation
├── Analytics_Dashboard/   # Analytics UI (Future)
│   └── README.md         # Dashboard documentation
└── casecontext.md        # Original requirements
```

## Components

### ✅ Inbound_API (Complete)
- **Purpose**: RESTful API for managing freight loads
- **Tech Stack**: Node.js + Fastify + TypeScript + Prisma + PostgreSQL
- **Features**: CRUD operations, advanced search, API key auth, rate limiting
- **Deployment**: Live on Render.com
- **Status**: Production ready

### 🚧 Analytics_Dashboard (Future)
- **Purpose**: Analytics dashboard for load insights
- **Status**: Not yet implemented
- **Planned**: Data visualization, reporting, carrier metrics

## Quick Start

### API Usage
```bash
# Health check
curl https://happyrobot-loads-api.onrender.com/api/v1/healthz

# Get loads
curl -H "x-api-key: demo-key-abc123" \
  "https://happyrobot-loads-api.onrender.com/api/v1/loads?page=1&page_size=10"
```

### Local Development
```bash
cd Inbound_API
npm install
npm run dev
```

## Documentation

- [Inbound API Documentation](./Inbound_API/README.md)
- [Deployment Guide](./Inbound_API/DEPLOYMENT.md)
- [Original Requirements](./casecontext.md)

## Interview Demo

This implementation demonstrates:
- Full-stack development with modern TypeScript
- Production-ready API with security features
- Database design with performance optimization
- Docker containerization and cloud deployment
- Comprehensive documentation and testing

---

**Built for HappyRobot Forward Deployed Engineer Interview**
