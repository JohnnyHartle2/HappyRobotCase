from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from ..models import CallEvent, Carrier, CarrierEquipment, CarrierLane
from ..schemas import OverviewMetrics, TrendDataPoint, LaneBreakdown, EquipmentBreakdown, CarrierBreakdown, Recommendation, MatchingRequest, MatchingResponse

def get_overview_metrics(db: Session) -> OverviewMetrics:
    """Calculate overview metrics for all calls"""
    
    # Total calls
    total_calls = db.query(CallEvent).count()
    
    if total_calls == 0:
        return OverviewMetrics(
            total_calls=0,
            successful_calls=0,
            success_rate=0.0,
            avg_call_duration_seconds=0.0,
            avg_loads_per_call=0.0,
            avg_negotiation_rounds=0.0,
            avg_rate_variance_pct=0.0,
            sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0, "unknown": 0}
        )
    
    # Successful calls
    successful_calls = db.query(CallEvent).filter(CallEvent.group_outcome_simple == "Successful").count()
    success_rate = (successful_calls / total_calls) * 100
    
    # Average call duration
    avg_duration = db.query(func.avg(CallEvent.call_duration_seconds)).scalar() or 0
    
    # Average loads per call
    avg_loads = db.query(func.avg(CallEvent.num_loads_shown)).scalar() or 0
    
    # Average negotiation rounds
    avg_rounds = db.query(func.avg(CallEvent.num_negotiation_rounds)).scalar() or 0
    
    # Average rate variance
    avg_variance = db.query(func.avg(CallEvent.kpi_rate_variance_pct)).scalar() or 0
    
    # Sentiment distribution
    positive = db.query(CallEvent).filter(CallEvent.carrier_sentiment == "positive").count()
    negative = db.query(CallEvent).filter(CallEvent.carrier_sentiment == "negative").count()
    neutral = db.query(CallEvent).filter(CallEvent.carrier_sentiment == "neutral").count()
    unknown = db.query(CallEvent).filter(CallEvent.carrier_sentiment == "unknown").count()
    
    sentiment_dist = {
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
        "unknown": unknown
    }
    
    return OverviewMetrics(
        total_calls=total_calls,
        successful_calls=successful_calls,
        success_rate=round(success_rate, 2),
        avg_call_duration_seconds=round(avg_duration, 0),
        avg_loads_per_call=round(avg_loads, 2),
        avg_negotiation_rounds=round(avg_rounds, 2),
        avg_rate_variance_pct=round(avg_variance, 2),
        sentiment_distribution=sentiment_dist
    )

def get_trends_data(db: Session, start_date: datetime, end_date: datetime, interval: str = "day") -> List[TrendDataPoint]:
    """Get time-series trend data"""
    
    # Determine the date truncation based on interval
    if interval == "hour":
        date_trunc = func.date_trunc('hour', CallEvent.call_date)
    elif interval == "day":
        date_trunc = func.date_trunc('day', CallEvent.call_date)
    elif interval == "week":
        date_trunc = func.date_trunc('week', CallEvent.call_date)
    else:
        date_trunc = func.date_trunc('day', CallEvent.call_date)
    
    # Query aggregated data by time period
    trends = db.query(
        date_trunc.label('date'),
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.group_outcome_simple == "Successful", 1),
                else_=0
            )
        ).label('success_rate'),
        func.avg(
            func.case(
                (CallEvent.carrier_sentiment == "positive", 1),
                (CallEvent.carrier_sentiment == "negative", -1),
                else_=0
            )
        ).label('avg_sentiment'),
        func.avg(CallEvent.kpi_rpm).label('avg_rpm')
    ).filter(
        and_(
            CallEvent.call_date >= start_date.date(),
            CallEvent.call_date <= end_date.date()
        )
    ).group_by(
        date_trunc
    ).order_by(
        date_trunc
    ).all()
    
    return [
        TrendDataPoint(
            date=trend.date.strftime("%Y-%m-%d %H:%M:%S"),
            success_rate=round(trend.success_rate * 100, 2) if trend.success_rate else 0,
            avg_sentiment=round(trend.avg_sentiment, 3) if trend.avg_sentiment else 0,
            avg_rpm=round(trend.avg_rpm, 2) if trend.avg_rpm else 0,
            total_calls=trend.total_calls
        )
        for trend in trends
    ]

def get_lane_breakdown(db: Session) -> List[LaneBreakdown]:
    """Get performance breakdown by lane"""
    
    lanes = db.query(
        CallEvent.lane,
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.group_outcome_simple == "Successful", 1),
                else_=0
            )
        ).label('success_rate'),
        func.avg(CallEvent.kpi_rpm).label('avg_rpm'),
        func.avg(CallEvent.loadboard_rate).label('avg_loadboard_rate'),
        func.avg(CallEvent.final_rate_agreed).label('avg_final_rate')
    ).group_by(
        CallEvent.lane
    ).order_by(
        desc('total_calls')
    ).all()
    
    return [
        LaneBreakdown(
            lane=lane.lane,
            total_calls=lane.total_calls,
            success_rate=round(lane.success_rate * 100, 2),
            avg_rpm=round(lane.avg_rpm, 2) if lane.avg_rpm else 0,
            avg_loadboard_rate=round(lane.avg_loadboard_rate, 2) if lane.avg_loadboard_rate else 0,
            avg_final_rate=round(lane.avg_final_rate, 2) if lane.avg_final_rate else 0
        )
        for lane in lanes
    ]

def get_equipment_breakdown(db: Session) -> List[EquipmentBreakdown]:
    """Get performance breakdown by equipment type"""
    
    equipment = db.query(
        CallEvent.equipment_type,
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.group_outcome_simple == "Successful", 1),
                else_=0
            )
        ).label('success_rate'),
        func.avg(CallEvent.kpi_rpm).label('avg_rpm'),
        func.avg(CallEvent.num_negotiation_rounds).label('avg_rounds')
    ).group_by(
        CallEvent.equipment_type
    ).order_by(
        desc('total_calls')
    ).all()
    
    return [
        EquipmentBreakdown(
            equipment_type=eq.equipment_type,
            total_calls=eq.total_calls,
            success_rate=round(eq.success_rate * 100, 2),
            avg_rpm=round(eq.avg_rpm, 2) if eq.avg_rpm else 0,
            avg_negotiation_rounds=round(eq.avg_rounds, 2) if eq.avg_rounds else 0
        )
        for eq in equipment
    ]

def get_carrier_breakdown(db: Session) -> List[CarrierBreakdown]:
    """Get performance breakdown by carrier"""
    
    carriers = db.query(Carrier).all()
    
    carrier_breakdowns = []
    for carrier in carriers:
        # Get top 3 lanes for this carrier
        top_lanes = db.query(
            CallEvent.lane,
            func.count(CallEvent.id).label('lane_calls')
        ).filter(
            CallEvent.carrier_id == carrier.carrier_id
        ).group_by(
            CallEvent.lane
        ).order_by(
            desc('lane_calls')
        ).limit(3).all()
        
        preferred_lanes = [lane.lane for lane in top_lanes]
        
        carrier_breakdowns.append(
            CarrierBreakdown(
                carrier_id=carrier.carrier_id,
                carrier_name=carrier.carrier_name,
                total_calls=carrier.total_calls,
                success_rate=float(carrier.success_rate) if carrier.success_rate else 0,
                avg_rpm=float(carrier.avg_rpm) if carrier.avg_rpm else 0,
                avg_loads_per_call=float(carrier.avg_loads_per_call) if carrier.avg_loads_per_call else 0,
                preferred_lanes=preferred_lanes,
                last_call_date=carrier.last_call_date
            )
        )
    
    return carrier_breakdowns

def get_smart_matching(db: Session, request: MatchingRequest) -> MatchingResponse:
    """Get smart carrier matching for a load"""
    
    lane = f"{request.lane}"
    equipment_type = request.equipment_type
    
    # Get carriers who have handled this exact lane and equipment
    exact_matches = db.query(
        Carrier.carrier_id,
        Carrier.carrier_name,
        Carrier.success_rate,
        Carrier.avg_rpm,
        Carrier.avg_negotiation_rounds,
        Carrier.avg_loads_per_call,
        Carrier.last_call_date,
        func.count(CallEvent.id).label('lane_calls')
    ).join(
        CallEvent, Carrier.carrier_id == CallEvent.carrier_id
    ).filter(
        and_(
            CallEvent.lane == lane,
            CallEvent.equipment_type == equipment_type
        )
    ).group_by(
        Carrier.carrier_id, Carrier.carrier_name, Carrier.success_rate,
        Carrier.avg_rpm, Carrier.avg_negotiation_rounds, Carrier.avg_loads_per_call,
        Carrier.last_call_date
    ).all()
    
    # If no exact matches, get carriers with same equipment type
    if not exact_matches:
        exact_matches = db.query(
            Carrier.carrier_id,
            Carrier.carrier_name,
            Carrier.success_rate,
            Carrier.avg_rpm,
            Carrier.avg_negotiation_rounds,
            Carrier.avg_loads_per_call,
            Carrier.last_call_date,
            func.count(CallEvent.id).label('lane_calls')
        ).join(
            CallEvent, Carrier.carrier_id == CallEvent.carrier_id
        ).filter(
            CallEvent.equipment_type == equipment_type
        ).group_by(
            Carrier.carrier_id, Carrier.carrier_name, Carrier.success_rate,
            Carrier.avg_rpm, Carrier.avg_negotiation_rounds, Carrier.avg_loads_per_call,
            Carrier.last_call_date
        ).order_by(
            desc('lane_calls')
        ).limit(10).all()
    
    recommendations = []
    for carrier in exact_matches:
        # Calculate match score (0-100)
        lane_success_score = float(carrier.success_rate or 0) * 0.30  # Max 30 points
        equipment_match_score = 20  # Max 20 points (has the equipment)
        rate_competitiveness = max(0, 20 - abs(float(carrier.avg_rpm or 0) - 2.0) * 5)  # Max 20 points
        recent_activity = 15 if carrier.last_call_date and (date.today() - carrier.last_call_date).days <= 7 else 5  # Max 15 points
        sentiment_score = 10  # Max 10 points (assume positive if in system)
        efficiency_score = max(0, (5 - float(carrier.avg_negotiation_rounds or 0)) * 2)  # Max 10 points
        
        total_score = lane_success_score + equipment_match_score + rate_competitiveness + recent_activity + sentiment_score + efficiency_score
        
        # Generate reasons
        reasons = []
        if carrier.lane_calls > 0:
            reasons.append(f"{carrier.lane_calls} calls on this lane")
        if carrier.success_rate and carrier.success_rate > 70:
            reasons.append(f"{carrier.success_rate:.0f}% success rate")
        if carrier.avg_rpm and carrier.avg_rpm < 2.5:
            reasons.append("Competitive rates")
        if carrier.avg_negotiation_rounds and carrier.avg_negotiation_rounds < 2.5:
            reasons.append("Quick to close deals")
        if carrier.last_call_date and (date.today() - carrier.last_call_date).days <= 3:
            reasons.append("Recently active")
        
        # Calculate expected rate range
        base_rate = request.miles * 2.0  # Base rate calculation
        expected_min = base_rate * 0.9
        expected_max = base_rate * 1.1
        
        confidence = "High" if total_score > 70 else "Medium" if total_score > 50 else "Low"
        
        recommendations.append(
            Recommendation(
                carrier_id=carrier.carrier_id,
                carrier_name=carrier.carrier_name,
                match_score=round(total_score, 1),
                expected_rate_min=round(expected_min, 2),
                expected_rate_max=round(expected_max, 2),
                confidence=confidence,
                reasons=reasons
            )
        )
    
    # Sort by score and return top 5
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return MatchingResponse(
        lane=lane,
        equipment_type=equipment_type,
        recommendations=recommendations[:5]
    )
