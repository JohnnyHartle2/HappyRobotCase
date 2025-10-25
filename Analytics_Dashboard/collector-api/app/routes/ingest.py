from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database import get_db
from ..models import CallEvent, Carrier, CarrierEquipment, CarrierLane
from ..schemas import CallEventRequest, CallEventResponse
from ..auth import require_ingest_key

router = APIRouter()

@router.post("/events/call-completed", response_model=CallEventResponse)
async def ingest_call_event(
    event: CallEventRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(require_ingest_key)
):
    """Ingest a new call event from HappyRobot"""
    
    try:
        # Find or create carrier
        carrier = db.query(Carrier).filter(Carrier.carrier_name == event.carrier_name).first()
        if not carrier:
            carrier = Carrier(
                carrier_name=event.carrier_name,
                status='active'
            )
            db.add(carrier)
            db.flush()  # Get the carrier_id
        
        # Create new call event
        call_event = CallEvent(
            call_id=event.call_id,
            carrier_id=carrier.carrier_id,
            carrier_name=event.carrier_name,
            lane=event.lane,
            miles=event.miles,
            equipment_type=event.equipment_type,
            commodity_type=event.commodity_type,
            weight=event.weight,
            loadboard_rate=event.loadboard_rate,
            offered_rate_initial=event.offered_rate_initial,
            carrier_counter_rate=event.carrier_counter_rate,
            final_rate_agreed=event.final_rate_agreed,
            kpi_rpm=event.kpi_rpm,
            kpi_rate_variance_pct=event.kpi_rate_variance_pct,
            num_negotiation_rounds=event.num_negotiation_rounds,
            num_loads_shown=event.num_loads_shown,
            outcome=event.outcome,
            group_outcome_simple=event.group_outcome_simple,
            rate_band=event.rate_band,
            carrier_sentiment=event.carrier_sentiment,
            group_sentiment_outcome=event.group_sentiment_outcome,
            call_duration_seconds=event.call_duration_seconds,
            objection_count=event.objection_count,
            positive_words_count=event.positive_words_count,
            negative_words_count=event.negative_words_count,
            call_date=event.call_date
        )
        
        db.add(call_event)
        db.commit()
        db.refresh(call_event)
        
        # Update carrier metrics
        update_carrier_metrics(db, carrier.carrier_id)
        
        return call_event
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest call event: {str(e)}"
        )

def update_carrier_metrics(db: Session, carrier_id: int):
    """Update carrier-level metrics after a new call event"""
    
    # Get all call events for this carrier
    calls = db.query(CallEvent).filter(CallEvent.carrier_id == carrier_id).all()
    
    if not calls:
        return
    
    # Calculate metrics
    total_calls = len(calls)
    successful_calls = len([c for c in calls if c.group_outcome_simple == "Successful"])
    success_rate = (successful_calls / total_calls) * 100 if total_calls > 0 else 0
    
    # Calculate averages
    avg_rpm = sum([float(c.kpi_rpm or 0) for c in calls if c.kpi_rpm]) / len([c for c in calls if c.kpi_rpm]) if any(c.kpi_rpm for c in calls) else 0
    avg_negotiation_rounds = sum([c.num_negotiation_rounds or 0 for c in calls]) / len([c for c in calls if c.num_negotiation_rounds]) if any(c.num_negotiation_rounds for c in calls) else 0
    avg_rate_variance = sum([float(c.kpi_rate_variance_pct or 0) for c in calls if c.kpi_rate_variance_pct]) / len([c for c in calls if c.kpi_rate_variance_pct]) if any(c.kpi_rate_variance_pct for c in calls) else 0
    avg_call_duration = sum([c.call_duration_seconds or 0 for c in calls]) / len([c for c in calls if c.call_duration_seconds]) if any(c.call_duration_seconds for c in calls) else 0
    avg_objections = sum([c.objection_count or 0 for c in calls]) / len([c for c in calls if c.objection_count]) if any(c.objection_count for c in calls) else 0
    avg_positive_words = sum([c.positive_words_count or 0 for c in calls]) / len([c for c in calls if c.positive_words_count]) if any(c.positive_words_count for c in calls) else 0
    avg_negative_words = sum([c.negative_words_count or 0 for c in calls]) / len([c for c in calls if c.negative_words_count]) if any(c.negative_words_count for c in calls) else 0
    avg_loads_per_call = sum([c.num_loads_shown for c in calls]) / len(calls)
    total_loads_shown = sum([c.num_loads_shown for c in calls])
    
    # Sentiment distribution
    positive_calls = len([c for c in calls if c.carrier_sentiment == "positive"])
    negative_calls = len([c for c in calls if c.carrier_sentiment == "negative"])
    neutral_calls = len([c for c in calls if c.carrier_sentiment == "neutral"])
    unknown_calls = len([c for c in calls if c.carrier_sentiment == "unknown"])
    
    # Last call date
    last_call_date = max([c.call_date for c in calls]) if calls else None
    
    # Update carrier
    carrier = db.query(Carrier).filter(Carrier.carrier_id == carrier_id).first()
    if carrier:
        carrier.total_calls = total_calls
        carrier.successful_calls = successful_calls
        carrier.success_rate = success_rate
        carrier.avg_rpm = avg_rpm
        carrier.avg_negotiation_rounds = avg_negotiation_rounds
        carrier.avg_rate_variance_pct = avg_rate_variance
        carrier.avg_call_duration_seconds = int(avg_call_duration)
        carrier.avg_objections = int(avg_objections)
        carrier.avg_positive_words = int(avg_positive_words)
        carrier.avg_negative_words = int(avg_negative_words)
        carrier.total_loads_shown = total_loads_shown
        carrier.avg_loads_per_call = avg_loads_per_call
        carrier.positive_sentiment_calls = positive_calls
        carrier.negative_sentiment_calls = negative_calls
        carrier.neutral_sentiment_calls = neutral_calls
        carrier.unknown_sentiment_calls = unknown_calls
        carrier.last_call_date = last_call_date
        
        db.commit()
        
        # Update equipment tracking
        update_equipment_tracking(db, carrier_id, calls)
        
        # Update lane tracking
        update_lane_tracking(db, carrier_id, calls)

def update_equipment_tracking(db: Session, carrier_id: int, calls: list):
    """Update carrier equipment tracking"""
    
    equipment_counts = {}
    for call in calls:
        eq_type = call.equipment_type
        if eq_type not in equipment_counts:
            equipment_counts[eq_type] = {"total": 0, "successful": 0}
        equipment_counts[eq_type]["total"] += 1
        if call.group_outcome_simple == "Successful":
            equipment_counts[eq_type]["successful"] += 1
    
    # Update or create equipment records
    for eq_type, counts in equipment_counts.items():
        existing = db.query(CarrierEquipment).filter(
            CarrierEquipment.carrier_id == carrier_id,
            CarrierEquipment.equipment_type == eq_type
        ).first()
        
        if existing:
            existing.call_count = counts["total"]
            existing.success_count = counts["successful"]
            existing.success_rate = (counts["successful"] / counts["total"]) * 100 if counts["total"] > 0 else 0
        else:
            new_equipment = CarrierEquipment(
                carrier_id=carrier_id,
                equipment_type=eq_type,
                call_count=counts["total"],
                success_count=counts["successful"],
                success_rate=(counts["successful"] / counts["total"]) * 100 if counts["total"] > 0 else 0
            )
            db.add(new_equipment)
    
    db.commit()

def update_lane_tracking(db: Session, carrier_id: int, calls: list):
    """Update carrier lane tracking"""
    
    lane_counts = {}
    for call in calls:
        lane = call.lane
        if lane not in lane_counts:
            lane_counts[lane] = {
                "total": 0, 
                "successful": 0, 
                "miles": call.miles,
                "rates": [],
                "loadboard_rates": [],
                "last_call": call.call_date
            }
        lane_counts[lane]["total"] += 1
        if call.group_outcome_simple == "Successful":
            lane_counts[lane]["successful"] += 1
        if call.final_rate_agreed:
            lane_counts[lane]["rates"].append(float(call.final_rate_agreed))
        if call.loadboard_rate:
            lane_counts[lane]["loadboard_rates"].append(float(call.loadboard_rate))
        if call.call_date > lane_counts[lane]["last_call"]:
            lane_counts[lane]["last_call"] = call.call_date
    
    # Update or create lane records
    for lane, counts in lane_counts.items():
        existing = db.query(CarrierLane).filter(
            CarrierLane.carrier_id == carrier_id,
            CarrierLane.lane == lane
        ).first()
        
        success_rate = (counts["successful"] / counts["total"]) * 100 if counts["total"] > 0 else 0
        avg_rpm = sum(counts["rates"]) / len(counts["rates"]) if counts["rates"] else 0
        avg_loadboard_rate = sum(counts["loadboard_rates"]) / len(counts["loadboard_rates"]) if counts["loadboard_rates"] else 0
        avg_final_rate = avg_rpm * counts["miles"] if counts["miles"] else 0
        
        if existing:
            existing.total_calls = counts["total"]
            existing.successful_calls = counts["successful"]
            existing.success_rate = success_rate
            existing.avg_rpm = avg_rpm
            existing.avg_loadboard_rate = avg_loadboard_rate
            existing.avg_final_rate = avg_final_rate
            existing.last_call_date = counts["last_call"]
        else:
            new_lane = CarrierLane(
                carrier_id=carrier_id,
                lane=lane,
                miles=counts["miles"],
                total_calls=counts["total"],
                successful_calls=counts["successful"],
                success_rate=success_rate,
                avg_rpm=avg_rpm,
                avg_loadboard_rate=avg_loadboard_rate,
                avg_final_rate=avg_final_rate,
                last_call_date=counts["last_call"]
            )
            db.add(new_lane)
    
    db.commit()