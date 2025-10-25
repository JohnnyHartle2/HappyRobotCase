from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import RouteBreakdown, EquipmentBreakdown, CarrierBreakdown, ErrorResponse
from ..auth import require_read_key
from ..utils.aggregations import get_route_breakdown, get_equipment_breakdown, get_carrier_breakdown

router = APIRouter()

@router.get("/breakdowns/by-route", response_model=List[RouteBreakdown])
async def get_route_breakdowns(
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get performance breakdown by route"""
    try:
        return get_route_breakdown(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get route breakdown: {str(e)}"
        )

@router.get("/breakdowns/by-equipment", response_model=List[EquipmentBreakdown])
async def get_equipment_breakdowns(
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get performance breakdown by equipment type"""
    try:
        return get_equipment_breakdown(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get equipment breakdown: {str(e)}"
        )

@router.get("/breakdowns/by-carrier", response_model=List[CarrierBreakdown])
async def get_carrier_breakdowns(
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get performance breakdown by carrier"""
    try:
        return get_carrier_breakdown(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get carrier breakdown: {str(e)}"
        )
