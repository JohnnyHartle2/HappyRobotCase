from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import RecommendationsResponse, ErrorResponse
from ..auth import require_read_key
from ..utils.aggregations import get_carrier_recommendations

router = APIRouter()

@router.get("/intelligence/recommendations", response_model=RecommendationsResponse)
async def get_carrier_recommendations_endpoint(
    origin: str = Query(..., description="Origin city"),
    destination: str = Query(..., description="Destination city"),
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get carrier recommendations for a specific route"""
    try:
        recommendations = get_carrier_recommendations(db, origin, destination)
        
        return RecommendationsResponse(
            origin=origin,
            destination=destination,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )
