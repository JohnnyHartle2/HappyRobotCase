from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Index
from sqlalchemy.sql import func
from .database import Base

class CallEvent(Base):
    __tablename__ = "call_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    call_id = Column(String, index=True)
    
    # Carrier info
    carrier_mc_number = Column(String, index=True)
    carrier_name = Column(String)
    
    # Load info
    load_id = Column(String, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    equipment_type = Column(String, index=True)
    loadboard_rate = Column(Float)
    miles = Column(Integer)
    
    # Negotiation data
    negotiation_rounds = Column(Integer)
    final_agreed_rate = Column(Float)
    outcome = Column(String, index=True)  # accepted, rejected, no-answer
    sentiment_score = Column(Float)  # -1.0 to 1.0
    
    # Timestamps
    started_at = Column(DateTime, index=True)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_carrier_route', 'carrier_mc_number', 'origin', 'destination'),
        Index('idx_equipment_outcome', 'equipment_type', 'outcome'),
        Index('idx_started_at_outcome', 'started_at', 'outcome'),
    )
