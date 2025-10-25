from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from ..database import get_db
from ..schemas import OverviewMetrics, TrendsResponse, ErrorResponse, CallEventResponse, RateVarianceDistribution, ConversionFunnel
from ..auth import require_read_key
from ..utils.aggregations import get_overview_metrics, get_trends_data, get_rate_variance_distribution, get_conversion_funnel
from ..models import CallEvent

router = APIRouter()

@router.get("/metrics/overview", response_model=OverviewMetrics)
async def get_overview(
    request: Request,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get overview metrics for all calls"""
    try:
        return get_overview_metrics(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get overview metrics: {str(e)}"
        )

@router.get("/metrics/trends", response_model=TrendsResponse)
async def get_trends(
    request: Request,
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    interval: str = Query("day", description="Time interval: hour, day, or week"),
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get time-series trend data"""
    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Validate interval
        if interval not in ["hour", "day", "week"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interval must be 'hour', 'day', or 'week'"
            )
        
        data = get_trends_data(db, start_date, end_date, interval)
        
        return TrendsResponse(
            data=data,
            interval=interval
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trends data: {str(e)}"
        )

@router.get("/metrics/recent-calls", response_model=List[CallEventResponse])
async def get_recent_calls(
    request: Request,
    limit: int = Query(10, description="Number of recent calls to return"),
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get most recent call events"""
    try:
        calls = db.query(CallEvent).order_by(
            CallEvent.created_at.desc()
        ).limit(limit).all()
        
        return calls
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recent calls: {str(e)}"
        )

@router.get("/metrics/rate-variance-distribution", response_model=RateVarianceDistribution)
async def get_rate_variance_dist(
    request: Request,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get rate variance distribution"""
    try:
        buckets = get_rate_variance_distribution(db)
        return RateVarianceDistribution(buckets=buckets)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rate variance distribution: {str(e)}"
        )

@router.get("/metrics/conversion-funnel", response_model=ConversionFunnel)
async def get_funnel(
    request: Request,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get conversion funnel data"""
    try:
        stages = get_conversion_funnel(db)
        return ConversionFunnel(stages=stages)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversion funnel: {str(e)}"
        )
