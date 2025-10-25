from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from decimal import Decimal

# Request schemas
class CallEventRequest(BaseModel):
    call_id: str
    carrier_name: str
    lane: str
    miles: int
    equipment_type: str
    commodity_type: Optional[str] = None
    weight: Optional[int] = None
    loadboard_rate: float
    offered_rate_initial: Optional[float] = None
    carrier_counter_rate: Optional[float] = None
    final_rate_agreed: Optional[float] = None
    kpi_rpm: Optional[float] = None
    kpi_rate_variance_pct: Optional[float] = None
    num_negotiation_rounds: Optional[int] = None
    num_loads_shown: int = 1
    outcome: Optional[str] = None
    group_outcome_simple: str
    rate_band: Optional[str] = None
    carrier_sentiment: str
    group_sentiment_outcome: Optional[str] = None
    call_duration_seconds: Optional[int] = None
    objection_count: Optional[int] = None
    positive_words_count: Optional[int] = None
    negative_words_count: Optional[int] = None
    call_date: date

# Response schemas
class CarrierResponse(BaseModel):
    carrier_id: int
    carrier_name: str
    mc_number: Optional[str]
    total_calls: int
    successful_calls: int
    success_rate: Optional[Decimal]
    avg_rpm: Optional[Decimal]
    avg_negotiation_rounds: Optional[Decimal]
    avg_rate_variance_pct: Optional[Decimal]
    avg_call_duration_seconds: Optional[int]
    avg_objections: Optional[int]
    avg_positive_words: Optional[int]
    avg_negative_words: Optional[int]
    positive_sentiment_calls: int
    negative_sentiment_calls: int
    neutral_sentiment_calls: int
    unknown_sentiment_calls: int
    total_loads_shown: int
    avg_loads_per_call: Optional[Decimal]
    status: str
    preferred: bool
    last_call_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CarrierEquipmentResponse(BaseModel):
    id: int
    carrier_id: int
    equipment_type: str
    call_count: int
    success_count: int
    success_rate: Optional[Decimal]

    class Config:
        from_attributes = True

class CarrierLaneResponse(BaseModel):
    id: int
    carrier_id: int
    lane: str
    miles: Optional[int]
    total_calls: int
    successful_calls: int
    success_rate: Optional[Decimal]
    avg_rpm: Optional[Decimal]
    avg_loadboard_rate: Optional[Decimal]
    avg_final_rate: Optional[Decimal]
    last_call_date: Optional[date]

    class Config:
        from_attributes = True

class CallEventResponse(BaseModel):
    id: int
    call_id: str
    carrier_id: Optional[int]
    carrier_name: str
    lane: str
    miles: int
    equipment_type: str
    commodity_type: Optional[str]
    weight: Optional[int]
    loadboard_rate: Decimal
    offered_rate_initial: Optional[Decimal]
    carrier_counter_rate: Optional[Decimal]
    final_rate_agreed: Optional[Decimal]
    kpi_rpm: Optional[Decimal]
    kpi_rate_variance_pct: Optional[Decimal]
    num_negotiation_rounds: Optional[int]
    num_loads_shown: int
    outcome: Optional[str]
    group_outcome_simple: str
    rate_band: Optional[str]
    carrier_sentiment: str
    group_sentiment_outcome: Optional[str]
    call_duration_seconds: Optional[int]
    objection_count: Optional[int]
    positive_words_count: Optional[int]
    negative_words_count: Optional[int]
    call_date: date
    created_at: datetime

    class Config:
        from_attributes = True

# Metrics schemas
class OverviewMetrics(BaseModel):
    total_calls: int
    successful_calls: int
    success_rate: float
    avg_call_duration_seconds: float
    avg_loads_per_call: float
    avg_negotiation_rounds: float
    avg_rate_variance_pct: float
    sentiment_distribution: Dict[str, int]  # positive, neutral, negative, unknown counts

class TrendDataPoint(BaseModel):
    date: str
    success_rate: float
    avg_sentiment: float
    avg_rpm: float
    total_calls: int

class TrendsResponse(BaseModel):
    data: List[TrendDataPoint]
    interval: str

class LaneBreakdown(BaseModel):
    lane: str
    total_calls: int
    success_rate: float
    avg_rpm: float
    avg_loadboard_rate: float
    avg_final_rate: float

class EquipmentBreakdown(BaseModel):
    equipment_type: str
    total_calls: int
    success_rate: float
    avg_rpm: float
    avg_negotiation_rounds: float

class CarrierBreakdown(BaseModel):
    carrier_id: int
    carrier_name: str
    total_calls: int
    success_rate: float
    avg_rpm: float
    avg_loads_per_call: float
    preferred_lanes: List[str]
    last_call_date: Optional[date]

class MatchingRequest(BaseModel):
    lane: str
    equipment_type: str
    miles: int
    commodity_type: Optional[str] = None
    weight: Optional[int] = None
    target_rate: Optional[float] = None

class Recommendation(BaseModel):
    carrier_id: int
    carrier_name: str
    match_score: float
    expected_rate_min: float
    expected_rate_max: float
    confidence: str  # "High", "Medium", "Low"
    reasons: List[str]

class MatchingResponse(BaseModel):
    lane: str
    equipment_type: str
    recommendations: List[Recommendation]

# Error schemas
class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
