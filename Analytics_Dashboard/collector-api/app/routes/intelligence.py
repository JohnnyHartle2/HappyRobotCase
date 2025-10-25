from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import MatchingResponse, MatchingRequest, CarrierResponse, CarrierEquipmentResponse, CarrierLaneResponse, ErrorResponse
from ..auth import require_read_key
from ..utils.aggregations import get_smart_matching
from ..models import Carrier, CarrierEquipment, CarrierLane

router = APIRouter()

@router.post("/matching/find-carriers", response_model=MatchingResponse)
async def find_carriers(
    request: MatchingRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get smart carrier matching for a load"""
    try:
        return get_smart_matching(db, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find carriers: {str(e)}"
        )

@router.get("/carriers", response_model=List[CarrierResponse])
async def get_carriers(
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get all carriers"""
    try:
        carriers = db.query(Carrier).all()
        return carriers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get carriers: {str(e)}"
        )

@router.get("/carriers/{carrier_id}", response_model=CarrierResponse)
async def get_carrier(
    carrier_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get carrier by ID"""
    try:
        carrier = db.query(Carrier).filter(Carrier.carrier_id == carrier_id).first()
        if not carrier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Carrier not found"
            )
        return carrier
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get carrier: {str(e)}"
        )

@router.get("/carriers/{carrier_id}/equipment", response_model=List[CarrierEquipmentResponse])
async def get_carrier_equipment(
    carrier_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get carrier equipment"""
    try:
        equipment = db.query(CarrierEquipment).filter(CarrierEquipment.carrier_id == carrier_id).all()
        return equipment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get carrier equipment: {str(e)}"
        )

@router.get("/carriers/{carrier_id}/lanes", response_model=List[CarrierLaneResponse])
async def get_carrier_lanes(
    carrier_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_read_key)
):
    """Get carrier lanes"""
    try:
        lanes = db.query(CarrierLane).filter(CarrierLane.carrier_id == carrier_id).all()
        return lanes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get carrier lanes: {str(e)}"
        )