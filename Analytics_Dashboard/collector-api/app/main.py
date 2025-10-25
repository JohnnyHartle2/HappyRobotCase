from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from .database import engine, Base
from .routes import ingest, metrics, breakdowns, intelligence

load_dotenv()

# Create tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="HappyRobot Analytics Collector API",
    description="API for collecting and analyzing carrier call data",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "collector-api"}

# Include routers
app.include_router(ingest.router, prefix="/api/v1", tags=["ingest"])
app.include_router(metrics.router, prefix="/api/v1", tags=["metrics"])
app.include_router(breakdowns.router, prefix="/api/v1", tags=["breakdowns"])
app.include_router(intelligence.router, prefix="/api/v1", tags=["intelligence"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
