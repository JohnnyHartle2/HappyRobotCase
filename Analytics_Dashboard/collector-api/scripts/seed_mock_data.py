#!/usr/bin/env python3
"""
Mock data generator for HappyRobot Analytics Dashboard
Generates 100 realistic call events across 5 carriers
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import CallEvent, Base
from datetime import datetime, timedelta
import random
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

# Sample data
CARRIERS = [
    {"mc_number": "123456", "name": "Acme Transport"},
    {"mc_number": "234567", "name": "Swift Logistics"},
    {"mc_number": "345678", "name": "Eagle Freight"},
    {"mc_number": "456789", "name": "Prime Haulers"},
    {"mc_number": "567890", "name": "Titan Carriers"}
]

ROUTES = [
    ("Chicago, IL", "Dallas, TX"),
    ("Los Angeles, CA", "Phoenix, AZ"),
    ("Atlanta, GA", "Miami, FL"),
    ("New York, NY", "Boston, MA"),
    ("Denver, CO", "Salt Lake City, UT"),
    ("Houston, TX", "New Orleans, LA"),
    ("Seattle, WA", "Portland, OR"),
    ("Detroit, MI", "Cleveland, OH"),
    ("Memphis, TN", "Nashville, TN"),
    ("Kansas City, MO", "St. Louis, MO")
]

EQUIPMENT_TYPES = ["Dry Van", "Flatbed", "Refrigerated", "Box Truck"]

OUTCOMES = ["accepted", "rejected", "no-answer"]
OUTCOME_WEIGHTS = [0.7, 0.2, 0.1]  # 70% accepted, 20% rejected, 10% no-answer

def generate_mock_call_events(num_events=100):
    """Generate mock call events"""
    events = []
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(num_events):
        # Random carrier
        carrier = random.choice(CARRIERS)
        
        # Random route
        origin, destination = random.choice(ROUTES)
        
        # Random equipment type
        equipment_type = random.choice(EQUIPMENT_TYPES)
        
        # Generate loadboard rate based on equipment and distance
        base_rates = {
            "Dry Van": 1.50,
            "Flatbed": 1.80,
            "Refrigerated": 2.20,
            "Box Truck": 1.30
        }
        
        # Estimate miles (simplified)
        estimated_miles = random.randint(200, 1200)
        loadboard_rate = round(estimated_miles * base_rates[equipment_type] * random.uniform(0.8, 1.2), 2)
        
        # Generate outcome
        outcome = random.choices(OUTCOMES, weights=OUTCOME_WEIGHTS)[0]
        
        # Generate negotiation rounds (1-4, weighted toward 2-3)
        negotiation_rounds = random.choices([1, 2, 3, 4], weights=[0.1, 0.4, 0.4, 0.1])[0]
        
        # Generate final rate based on outcome
        if outcome == "accepted":
            # Final rate is loadboard rate ±15%
            rate_variance = random.uniform(-0.15, 0.15)
            final_agreed_rate = round(loadboard_rate * (1 + rate_variance), 2)
        else:
            # For rejected/no-answer, use loadboard rate
            final_agreed_rate = loadboard_rate
        
        # Generate sentiment score based on outcome
        if outcome == "accepted":
            sentiment_score = random.uniform(0.2, 1.0)
        elif outcome == "rejected":
            sentiment_score = random.uniform(-1.0, -0.2)
        else:  # no-answer
            sentiment_score = random.uniform(-0.5, 0.5)
        
        # Generate timestamps
        call_start = base_time + timedelta(
            days=random.randint(0, 29),
            hours=random.randint(6, 22),
            minutes=random.randint(0, 59)
        )
        
        # Call duration: 2-15 minutes
        call_duration = timedelta(minutes=random.randint(2, 15))
        call_end = call_start + call_duration
        
        # Create event
        event = CallEvent(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            call_id=f"call_{uuid.uuid4().hex[:8]}",
            carrier_mc_number=carrier["mc_number"],
            carrier_name=carrier["name"],
            load_id=f"L-{random.randint(1000, 9999)}",
            origin=origin,
            destination=destination,
            equipment_type=equipment_type,
            loadboard_rate=loadboard_rate,
            miles=estimated_miles,
            negotiation_rounds=negotiation_rounds,
            final_agreed_rate=final_agreed_rate,
            outcome=outcome,
            sentiment_score=round(sentiment_score, 3),
            started_at=call_start,
            ended_at=call_end
        )
        
        events.append(event)
    
    return events

def seed_database():
    """Seed the database with mock data"""
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(CallEvent).delete()
        db.commit()
        
        # Generate and insert mock data
        print("Generating 100 mock call events...")
        events = generate_mock_call_events(100)
        
        print("Inserting events into database...")
        for event in events:
            db.add(event)
        
        db.commit()
        
        # Print summary
        total_calls = db.query(CallEvent).count()
        accepted_calls = db.query(CallEvent).filter(CallEvent.outcome == "accepted").count()
        conversion_rate = (accepted_calls / total_calls) * 100
        
        print(f"\n✅ Database seeded successfully!")
        print(f"📊 Total calls: {total_calls}")
        print(f"✅ Accepted calls: {accepted_calls}")
        print(f"📈 Conversion rate: {conversion_rate:.1f}%")
        print(f"🚛 Carriers: {len(CARRIERS)}")
        print(f"🛣️  Routes: {len(ROUTES)}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
