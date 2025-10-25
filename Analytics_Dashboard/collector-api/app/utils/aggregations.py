from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..models import CallEvent
from ..schemas import OverviewMetrics, TrendDataPoint, RouteBreakdown, EquipmentBreakdown, CarrierBreakdown, Recommendation

def get_overview_metrics(db: Session) -> OverviewMetrics:
    """Calculate overview metrics for all calls"""
    
    # Total calls
    total_calls = db.query(CallEvent).count()
    
    if total_calls == 0:
        return OverviewMetrics(
            total_calls=0,
            conversion_rate=0.0,
            avg_negotiation_rounds=0.0,
            avg_rate_delta=0.0,
            avg_rate_delta_percent=0.0,
            sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0}
        )
    
    # Conversion rate
    accepted_calls = db.query(CallEvent).filter(CallEvent.outcome == "accepted").count()
    conversion_rate = (accepted_calls / total_calls) * 100
    
    # Average negotiation rounds
    avg_rounds = db.query(func.avg(CallEvent.negotiation_rounds)).scalar() or 0
    
    # Rate delta calculations
    rate_deltas = db.query(
        CallEvent.final_agreed_rate - CallEvent.loadboard_rate
    ).filter(CallEvent.outcome == "accepted").all()
    
    avg_rate_delta = sum([delta[0] for delta in rate_deltas]) / len(rate_deltas) if rate_deltas else 0
    
    # Rate delta percentage
    rate_delta_percents = db.query(
        ((CallEvent.final_agreed_rate - CallEvent.loadboard_rate) / CallEvent.loadboard_rate * 100)
    ).filter(CallEvent.outcome == "accepted").all()
    
    avg_rate_delta_percent = sum([pct[0] for pct in rate_delta_percents]) / len(rate_delta_percents) if rate_delta_percents else 0
    
    # Sentiment distribution
    sentiment_counts = db.query(
        func.count(CallEvent.id)
    ).group_by(
        func.case(
            (CallEvent.sentiment_score > 0.1, "positive"),
            (CallEvent.sentiment_score < -0.1, "negative"),
            else_="neutral"
        )
    ).all()
    
    sentiment_dist = {"positive": 0, "neutral": 0, "negative": 0}
    for count in sentiment_counts:
        # This is a simplified approach - in practice you'd need to map the counts properly
        pass
    
    # Better sentiment distribution calculation
    positive = db.query(CallEvent).filter(CallEvent.sentiment_score > 0.1).count()
    negative = db.query(CallEvent).filter(CallEvent.sentiment_score < -0.1).count()
    neutral = total_calls - positive - negative
    
    sentiment_dist = {
        "positive": positive,
        "neutral": neutral,
        "negative": negative
    }
    
    return OverviewMetrics(
        total_calls=total_calls,
        conversion_rate=round(conversion_rate, 2),
        avg_negotiation_rounds=round(avg_rounds, 2),
        avg_rate_delta=round(avg_rate_delta, 2),
        avg_rate_delta_percent=round(avg_rate_delta_percent, 2),
        sentiment_distribution=sentiment_dist
    )

def get_trends_data(db: Session, start_date: datetime, end_date: datetime, interval: str = "day") -> List[TrendDataPoint]:
    """Get time-series trend data"""
    
    # Determine the date truncation based on interval
    if interval == "hour":
        date_trunc = func.date_trunc('hour', CallEvent.started_at)
    elif interval == "day":
        date_trunc = func.date_trunc('day', CallEvent.started_at)
    elif interval == "week":
        date_trunc = func.date_trunc('week', CallEvent.started_at)
    else:
        date_trunc = func.date_trunc('day', CallEvent.started_at)
    
    # Query aggregated data by time period
    trends = db.query(
        date_trunc.label('date'),
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", 1),
                else_=0
            )
        ).label('conversion_rate'),
        func.avg(CallEvent.sentiment_score).label('avg_sentiment'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", CallEvent.final_agreed_rate),
                else_=None
            )
        ).label('avg_accepted_rate')
    ).filter(
        and_(
            CallEvent.started_at >= start_date,
            CallEvent.started_at <= end_date
        )
    ).group_by(
        date_trunc
    ).order_by(
        date_trunc
    ).all()
    
    return [
        TrendDataPoint(
            date=trend.date.strftime("%Y-%m-%d %H:%M:%S"),
            conversion_rate=round(trend.conversion_rate * 100, 2) if trend.conversion_rate else 0,
            avg_sentiment=round(trend.avg_sentiment, 3) if trend.avg_sentiment else 0,
            avg_accepted_rate=round(trend.avg_accepted_rate, 2) if trend.avg_accepted_rate else 0,
            total_calls=trend.total_calls
        )
        for trend in trends
    ]

def get_route_breakdown(db: Session) -> List[RouteBreakdown]:
    """Get performance breakdown by route"""
    
    routes = db.query(
        CallEvent.origin,
        CallEvent.destination,
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", 1),
                else_=0
            )
        ).label('conversion_rate'),
        func.avg(CallEvent.final_agreed_rate).label('avg_rate'),
        func.avg(CallEvent.miles).label('avg_miles')
    ).group_by(
        CallEvent.origin, CallEvent.destination
    ).order_by(
        desc('total_calls')
    ).all()
    
    return [
        RouteBreakdown(
            origin=route.origin,
            destination=route.destination,
            total_calls=route.total_calls,
            conversion_rate=round(route.conversion_rate * 100, 2),
            avg_rate=round(route.avg_rate, 2),
            avg_rate_per_mile=round(route.avg_rate / route.avg_miles, 2) if route.avg_miles else 0
        )
        for route in routes
    ]

def get_equipment_breakdown(db: Session) -> List[EquipmentBreakdown]:
    """Get performance breakdown by equipment type"""
    
    equipment = db.query(
        CallEvent.equipment_type,
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", 1),
                else_=0
            )
        ).label('conversion_rate'),
        func.avg(CallEvent.final_agreed_rate).label('avg_rate'),
        func.avg(CallEvent.negotiation_rounds).label('avg_rounds')
    ).group_by(
        CallEvent.equipment_type
    ).order_by(
        desc('total_calls')
    ).all()
    
    return [
        EquipmentBreakdown(
            equipment_type=eq.equipment_type,
            total_calls=eq.total_calls,
            conversion_rate=round(eq.conversion_rate * 100, 2),
            avg_rate=round(eq.avg_rate, 2),
            avg_negotiation_rounds=round(eq.avg_rounds, 2)
        )
        for eq in equipment
    ]

def get_carrier_breakdown(db: Session) -> List[CarrierBreakdown]:
    """Get performance breakdown by carrier"""
    
    carriers = db.query(
        CallEvent.carrier_mc_number,
        CallEvent.carrier_name,
        func.count(CallEvent.id).label('total_calls'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", 1),
                else_=0
            )
        ).label('conversion_rate'),
        func.avg(CallEvent.final_agreed_rate / CallEvent.miles).label('avg_rate_per_mile')
    ).group_by(
        CallEvent.carrier_mc_number, CallEvent.carrier_name
    ).order_by(
        desc('total_calls')
    ).all()
    
    # Get preferred routes for each carrier
    carrier_breakdowns = []
    for carrier in carriers:
        # Get top 3 routes for this carrier
        top_routes = db.query(
            CallEvent.origin,
            CallEvent.destination,
            func.count(CallEvent.id).label('route_calls')
        ).filter(
            CallEvent.carrier_mc_number == carrier.carrier_mc_number
        ).group_by(
            CallEvent.origin, CallEvent.destination
        ).order_by(
            desc('route_calls')
        ).limit(3).all()
        
        preferred_routes = [f"{route.origin} → {route.destination}" for route in top_routes]
        
        # Calculate booking frequency (calls per day over last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_calls = db.query(CallEvent).filter(
            and_(
                CallEvent.carrier_mc_number == carrier.carrier_mc_number,
                CallEvent.started_at >= thirty_days_ago
            )
        ).count()
        
        booking_frequency = recent_calls / 30.0
        
        carrier_breakdowns.append(
            CarrierBreakdown(
                carrier_mc_number=carrier.carrier_mc_number,
                carrier_name=carrier.carrier_name,
                total_calls=carrier.total_calls,
                conversion_rate=round(carrier.conversion_rate * 100, 2),
                avg_rate_per_mile=round(carrier.avg_rate_per_mile, 2),
                preferred_routes=preferred_routes,
                booking_frequency=round(booking_frequency, 2)
            )
        )
    
    return carrier_breakdowns

def get_carrier_recommendations(db: Session, origin: str, destination: str) -> List[Recommendation]:
    """Get carrier recommendations for a specific route"""
    
    # Get carriers who have handled this exact route
    route_carriers = db.query(
        CallEvent.carrier_mc_number,
        CallEvent.carrier_name,
        func.count(CallEvent.id).label('route_calls'),
        func.avg(
            func.case(
                (CallEvent.outcome == "accepted", 1),
                else_=0
            )
        ).label('conversion_rate'),
        func.avg(CallEvent.final_agreed_rate).label('avg_rate'),
        func.avg(CallEvent.negotiation_rounds).label('avg_rounds')
    ).filter(
        and_(
            CallEvent.origin == origin,
            CallEvent.destination == destination
        )
    ).group_by(
        CallEvent.carrier_mc_number, CallEvent.carrier_name
    ).all()
    
    # If no carriers for this exact route, get carriers for similar routes
    if not route_carriers:
        # Get carriers who have handled routes with same origin or destination
        similar_carriers = db.query(
            CallEvent.carrier_mc_number,
            CallEvent.carrier_name,
            func.count(CallEvent.id).label('total_calls'),
            func.avg(
                func.case(
                    (CallEvent.outcome == "accepted", 1),
                    else_=0
                )
            ).label('conversion_rate'),
            func.avg(CallEvent.final_agreed_rate).label('avg_rate'),
            func.avg(CallEvent.negotiation_rounds).label('avg_rounds')
        ).filter(
            or_(
                CallEvent.origin == origin,
                CallEvent.destination == destination
            )
        ).group_by(
            CallEvent.carrier_mc_number, CallEvent.carrier_name
        ).order_by(
            desc('total_calls')
        ).limit(5).all()
        
        route_carriers = similar_carriers
    
    recommendations = []
    for carrier in route_carriers:
        # Calculate recommendation score (0-100)
        # Higher conversion rate = higher score
        # Lower negotiation rounds = higher score
        # More calls = higher score (experience)
        
        conversion_score = carrier.conversion_rate * 40  # Max 40 points
        experience_score = min(carrier.route_calls * 2, 30)  # Max 30 points
        efficiency_score = max(0, (5 - carrier.avg_rounds) * 6)  # Max 30 points
        
        total_score = conversion_score + experience_score + efficiency_score
        
        # Generate reasons
        reasons = []
        if carrier.conversion_rate > 0.7:
            reasons.append("High conversion rate")
        if carrier.route_calls > 5:
            reasons.append("Experienced on this route")
        if carrier.avg_rounds < 2.5:
            reasons.append("Quick to close deals")
        if carrier.avg_rate < 2000:  # Assuming reasonable rate threshold
            reasons.append("Competitive rates")
        
        recommendations.append(
            Recommendation(
                carrier_mc_number=carrier.carrier_mc_number,
                carrier_name=carrier.carrier_name,
                score=round(total_score, 1),
                reasons=reasons
            )
        )
    
    # Sort by score and return top 5
    recommendations.sort(key=lambda x: x.score, reverse=True)
    return recommendations[:5]
