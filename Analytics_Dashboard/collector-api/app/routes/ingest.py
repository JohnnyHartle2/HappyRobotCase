from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CallEvent
from ..schemas import CallEventRequest, CallEventResponse, ErrorResponse
from ..auth import require_ingest_key
from datetime import datetime

router = APIRouter()

@router.post("/events/call-completed", response_model=CallEventResponse)
async def ingest_call_event(
    event_data: CallEventRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_ingest_key)
):
    """Receive call completion events from HappyRobot platform"""
    
    try:
        # Check if event already exists
        existing_event = db.query(CallEvent).filter(
            CallEvent.event_id == event_data.event_id
        ).first()
        
        if existing_event:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Event already exists"
            )
        
        # Create new call event
        call_event = CallEvent(
            event_id=event_data.event_id,
            call_id=event_data.call_id,
            carrier_mc_number=event_data.carrier["mc_number"],
            carrier_name=event_data.carrier["name"],
            load_id=event_data.load["load_id"],
            origin=event_data.load["origin"],
            destination=event_data.load["destination"],
            equipment_type=event_data.load["equipment_type"],
            loadboard_rate=event_data.load["loadboard_rate"],
            miles=event_data.load["miles"],
            negotiation_rounds=event_data.negotiation_rounds,
            final_agreed_rate=event_data.final_agreed_rate,
            outcome=event_data.outcome,
            sentiment_score=event_data.sentiment_score,
            started_at=event_data.started_at,
            ended_at=event_data.ended_at
        )
        
        db.add(call_event)
        db.commit()
        db.refresh(call_event)
        
        return call_event
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process event: {str(e)}"
        )
