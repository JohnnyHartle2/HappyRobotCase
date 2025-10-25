from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Index, Date, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Carrier(Base):
    __tablename__ = "carriers"
    
    carrier_id = Column(Integer, primary_key=True, index=True)
    carrier_name = Column(String(100), unique=True, nullable=False)
    mc_number = Column(String(20), unique=True, nullable=True)
    
    # Performance metrics (calculated from call_events)
    total_calls = Column(Integer, default=0)
    successful_calls = Column(Integer, default=0)
    success_rate = Column(Numeric(5,2))  # percentage
    avg_rpm = Column(Numeric(6,2))  # rate per mile
    avg_negotiation_rounds = Column(Numeric(4,2))
    avg_rate_variance_pct = Column(Numeric(6,2))
    
    # Engagement metrics
    avg_call_duration_seconds = Column(Integer)
    avg_objections = Column(Integer)
    avg_positive_words = Column(Integer)
    avg_negative_words = Column(Integer)
    
    # Sentiment distribution
    positive_sentiment_calls = Column(Integer, default=0)
    negative_sentiment_calls = Column(Integer, default=0)
    neutral_sentiment_calls = Column(Integer, default=0)
    unknown_sentiment_calls = Column(Integer, default=0)
    
    # Multi-load behavior
    total_loads_shown = Column(Integer, default=0)
    avg_loads_per_call = Column(Numeric(4,2))
    
    # Status
    status = Column(String(20), default='active')
    preferred = Column(Boolean, default=False)
    last_call_date = Column(Date)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    equipment = relationship("CarrierEquipment", back_populates="carrier", cascade="all, delete-orphan")
    lanes = relationship("CarrierLane", back_populates="carrier", cascade="all, delete-orphan")
    call_events = relationship("CallEvent", back_populates="carrier")
    
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'watch_list')"),
        Index('idx_carriers_success_rate', 'success_rate'),
        Index('idx_carriers_avg_rpm', 'avg_rpm'),
    )

class CarrierEquipment(Base):
    __tablename__ = "carrier_equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    carrier_id = Column(Integer, ForeignKey('carriers.carrier_id', ondelete='CASCADE'), nullable=False)
    equipment_type = Column(String(50), nullable=False)
    call_count = Column(Integer, default=1)
    success_count = Column(Integer, default=0)
    success_rate = Column(Numeric(5,2))
    
    # Relationships
    carrier = relationship("Carrier", back_populates="equipment")
    
    __table_args__ = (
        Index('idx_carrier_equipment_carrier_id', 'carrier_id'),
        Index('idx_carrier_equipment_type', 'equipment_type'),
    )

class CarrierLane(Base):
    __tablename__ = "carrier_lanes"
    
    id = Column(Integer, primary_key=True, index=True)
    carrier_id = Column(Integer, ForeignKey('carriers.carrier_id', ondelete='CASCADE'), nullable=False)
    lane = Column(String(200), nullable=False)
    miles = Column(Integer)
    
    # Performance
    total_calls = Column(Integer, default=0)
    successful_calls = Column(Integer, default=0)
    success_rate = Column(Numeric(5,2))
    avg_rpm = Column(Numeric(6,2))
    avg_loadboard_rate = Column(Numeric(10,2))
    avg_final_rate = Column(Numeric(10,2))
    last_call_date = Column(Date)
    
    # Relationships
    carrier = relationship("Carrier", back_populates="lanes")
    
    __table_args__ = (
        Index('idx_carrier_lanes_carrier_id', 'carrier_id'),
        Index('idx_carrier_lanes_lane', 'lane'),
    )

class CallEvent(Base):
    __tablename__ = "call_events"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50), unique=True, nullable=False)
    carrier_id = Column(Integer, ForeignKey('carriers.carrier_id'), nullable=True)
    carrier_name = Column(String(100), nullable=False)
    
    # Load/Lane
    lane = Column(String(200), nullable=False)
    miles = Column(Integer, nullable=False)
    equipment_type = Column(String(50), nullable=False)
    commodity_type = Column(String(100))
    weight = Column(Integer)
    
    # Rates
    loadboard_rate = Column(Numeric(10,2), nullable=False)
    offered_rate_initial = Column(Numeric(10,2))
    carrier_counter_rate = Column(Numeric(10,2))
    final_rate_agreed = Column(Numeric(10,2))
    kpi_rpm = Column(Numeric(6,2))
    kpi_rate_variance_pct = Column(Numeric(6,2))
    
    # Negotiation
    num_negotiation_rounds = Column(Integer)
    num_loads_shown = Column(Integer, default=1)
    
    # Outcomes
    outcome = Column(String(50))
    group_outcome_simple = Column(String(20))
    rate_band = Column(String(20))
    
    # Sentiment & Engagement
    carrier_sentiment = Column(String(20))
    group_sentiment_outcome = Column(String(50))
    call_duration_seconds = Column(Integer)
    objection_count = Column(Integer)
    positive_words_count = Column(Integer)
    negative_words_count = Column(Integer)
    
    # Metadata
    call_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    carrier = relationship("Carrier", back_populates="call_events")
    
    __table_args__ = (
        CheckConstraint("group_outcome_simple IN ('Successful', 'Unsuccessful', 'Pending')"),
        CheckConstraint("carrier_sentiment IN ('positive', 'negative', 'neutral', 'unknown')"),
        Index('idx_call_events_carrier_id', 'carrier_id'),
        Index('idx_call_events_carrier_name', 'carrier_name'),
        Index('idx_call_events_lane', 'lane'),
        Index('idx_call_events_equipment_type', 'equipment_type'),
        Index('idx_call_events_outcome', 'group_outcome_simple'),
        Index('idx_call_events_created_at', 'created_at'),
    )
