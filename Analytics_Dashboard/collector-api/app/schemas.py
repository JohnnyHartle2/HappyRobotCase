from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

# Request schemas
class CallEventRequest(BaseModel):
    event_id: str
    call_id: str
    carrier: Dict[str, str]  # {"mc_number": "123456", "name": "Acme Transport"}
    load: Dict[str, Any]     # load details
    negotiation_rounds: int
    final_agreed_rate: float
    outcome: str
    sentiment_score: float
    started_at: datetime
    ended_at: datetime

# Response schemas
class CallEventResponse(BaseModel):
    id: int
    event_id: str
    call_id: str
    carrier_mc_number: str
    carrier_name: str
    load_id: str
    origin: str
    destination: str
    equipment_type: str
    loadboard_rate: float
    miles: int
    negotiation_rounds: int
    final_agreed_rate: float
    outcome: str
    sentiment_score: float
    started_at: datetime
    ended_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Metrics schemas
class OverviewMetrics(BaseModel):
    total_calls: int
    conversion_rate: float
    avg_negotiation_rounds: float
    avg_rate_delta: float
    avg_rate_delta_percent: float
    sentiment_distribution: Dict[str, int]  # positive, neutral, negative counts

class TrendDataPoint(BaseModel):
    date: str
    conversion_rate: float
    avg_sentiment: float
    avg_accepted_rate: float
    total_calls: int

class TrendsResponse(BaseModel):
    data: List[TrendDataPoint]
    interval: str

class RouteBreakdown(BaseModel):
    origin: str
    destination: str
    total_calls: int
    conversion_rate: float
    avg_rate: float
    avg_rate_per_mile: float

class EquipmentBreakdown(BaseModel):
    equipment_type: str
    total_calls: int
    conversion_rate: float
    avg_rate: float
    avg_negotiation_rounds: float

class CarrierBreakdown(BaseModel):
    carrier_mc_number: str
    carrier_name: str
    total_calls: int
    conversion_rate: float
    avg_rate_per_mile: float
    preferred_routes: List[str]
    booking_frequency: float  # calls per day

class Recommendation(BaseModel):
    carrier_mc_number: str
    carrier_name: str
    score: float
    reasons: List[str]

class RecommendationsResponse(BaseModel):
    origin: str
    destination: str
    recommendations: List[Recommendation]

# Error schemas
class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
