from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, time
from dotenv import load_dotenv
import os
import uuid
import qrcode
import io
import base64
from twilio.rest import Client

load_dotenv()

# --- ADD THESE LINES FOR DEBUGGING ---
print("--- Checking Twilio Credentials ---")
print(f"Loaded SID: {os.environ.get('TWILIO_ACCOUNT_SID')}")
print(f"Loaded Auth Token: {'Token is present' if os.environ.get('TWILIO_AUTH_TOKEN') else 'Token is MISSING'}")
print("---------------------------------")


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(MONGO_URL)
db = client.hospital_queue

# Twilio setup
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None

# Models
class Department(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_en: str
    name_hi: str
    active_counters: int = 1
    current_serving: Optional[str] = None
    total_waiting: int = 0
    avg_wait_time: int = 0  # in minutes
    total_completed: int = 0

class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department_id: str
    specialization: str
    patients_seen_today: int = 0
    avg_time_per_patient: int = 0  # in minutes

class Token(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_number: str
    patient_name: str
    patient_phone: str
    department_id: str
    department_name_en: str
    department_name_hi: str
    doctor_id: str
    doctor_name: str
    status: str = "waiting"  # waiting, in_progress, completed, cancelled
    position: int
    created_at: str
    called_at: Optional[str] = None
    completed_at: Optional[str] = None
    qr_code: Optional[str] = None
    notified_at_5: bool = False
    notified_at_3: bool = False
    notified_at_1: bool = False

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: str

class Analytics(BaseModel):
    hour: int  # 0-23
    patient_count: int
    department_id: str

# Helper Functions
def generate_qr_code(token_id: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(token_id)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()

async def send_sms(phone: str, message: str):
    """Send SMS via Twilio"""
    if not twilio_client:
        print(f"Twilio not configured. Would send SMS to {phone}: {message}")
        return {"status": "simulated", "message": "Twilio not configured"}
    
    try:
        message_obj = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        return {"status": "sent", "sid": message_obj.sid}
    except Exception as e:
        print(f"SMS error: {str(e)}")
        return {"status": "error", "error": str(e)}

async def check_and_notify_patients(department_id: str):
    """Check queue and send notifications at 5, 3, 1 positions away"""
    tokens = await db.tokens.find({
        "department_id": department_id,
        "status": "waiting"
    }).sort("position", 1).to_list(length=None)
    
    for idx, token in enumerate(tokens):
        position = idx + 1
        token_obj = Token(**token)
        
        # Notify at position 5
        if position == 5 and not token_obj.notified_at_5:
            await send_sms(
                token_obj.patient_phone,
                f"Hospital Queue Alert: Your token {token_obj.token_number} is 5 patients away. Please be ready. - {token_obj.department_name_en}"
            )
            await db.tokens.update_one(
                {"id": token_obj.id},
                {"$set": {"notified_at_5": True}}
            )
        
        # Notify at position 3
        elif position == 3 and not token_obj.notified_at_3:
            await send_sms(
                token_obj.patient_phone,
                f"Hospital Queue Alert: Your token {token_obj.token_number} is 3 patients away. Please proceed to waiting area. - {token_obj.department_name_en}"
            )
            await db.tokens.update_one(
                {"id": token_obj.id},
                {"$set": {"notified_at_3": True}}
            )
        
        # Notify at position 1
        elif position == 1 and not token_obj.notified_at_1:
            await send_sms(
                token_obj.patient_phone,
                f"Hospital Queue Alert: Your token {token_obj.token_number} is NEXT! Please come to the counter immediately. - {token_obj.department_name_en}"
            )
            await db.tokens.update_one(
                {"id": token_obj.id},
                {"$set": {"notified_at_1": True}}
            )

# API Endpoints

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Department Endpoints
@app.get("/api/departments")
async def get_departments():
    departments = await db.departments.find().to_list(length=None)
    return [{"id": d["id"], "name_en": d["name_en"], "name_hi": d["name_hi"], 
             "active_counters": d.get("active_counters", 1), "total_waiting": d.get("total_waiting", 0),
             "total_completed": d.get("total_completed", 0), "avg_wait_time": d.get("avg_wait_time", 0)} 
            for d in departments]

@app.post("/api/departments")
async def create_department(department: Department):
    await db.departments.insert_one(department.dict())
    return department

@app.put("/api/departments/{department_id}/counters")
async def update_counters(department_id: str, counters: int):
    result = await db.departments.update_one(
        {"id": department_id},
        {"$set": {"active_counters": counters}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"status": "success"}

# Doctor Endpoints
@app.get("/api/doctors")
async def get_doctors(department_id: Optional[str] = None):
    query = {"department_id": department_id} if department_id else {}
    doctors = await db.doctors.find(query).to_list(length=None)
    return [{"id": d["id"], "name": d["name"], "department_id": d["department_id"],
             "specialization": d["specialization"], "patients_seen_today": d.get("patients_seen_today", 0),
             "avg_time_per_patient": d.get("avg_time_per_patient", 0)} for d in doctors]

@app.post("/api/doctors")
async def create_doctor(doctor: Doctor):
    await db.doctors.insert_one(doctor.dict())
    return doctor

# Token Endpoints
@app.post("/api/tokens")
async def create_token(patient_name: str, patient_phone: str, department_id: str, doctor_id: str):
    # Get department info
    department = await db.departments.find_one({"id": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get doctor info
    doctor = await db.doctors.find_one({"id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Get next position in the entire history of the department
    total_department_tokens = await db.tokens.count_documents({"department_id": department_id})
    position = total_department_tokens + 1
    
    # Generate token number based on position
    token_number = f"{department['name_en'][:3].upper()}{position:03d}"
    
    token = Token(
        token_number=token_number,
        patient_name=patient_name,
        patient_phone=patient_phone,
        department_id=department_id,
        department_name_en=department["name_en"],
        department_name_hi=department["name_hi"],
        doctor_id=doctor_id,
        doctor_name=doctor["name"],
        position=position,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Generate QR code
    token.qr_code = generate_qr_code(token.id)
    
    await db.tokens.insert_one(token.dict())
    
    # Update department waiting count
    await db.departments.update_one(
        {"id": department_id},
        {"$inc": {"total_waiting": 1}}
    )
    
    # Track analytics
    current_hour = datetime.now(timezone.utc).hour
    await db.analytics.update_one(
        {"hour": current_hour, "department_id": department_id},
        {"$inc": {"patient_count": 1}},
        upsert=True
    )
    
    # Calculate current position in waiting queue
    waiting_position = await db.tokens.count_documents({
        "department_id": department_id, 
        "status": "waiting"
    })
    
    # Send initial SMS
    await send_sms(
        patient_phone,
        f"Token Generated! Your token is {token_number}. Position: {waiting_position}. Department: {department['name_en']}. Doctor: {doctor['name']}. You will receive alerts when your turn approaches."
    )
    
    # Return token with its current waiting position
    token_dict = token.dict()
    token_dict["current_position"] = waiting_position
    return token_dict

@app.get("/api/tokens/{token_id}")
async def get_token(token_id: str):
    token = await db.tokens.find_one({"id": token_id}, {"_id": 0})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Calculate current position
    if token["status"] == "waiting":
        position = await db.tokens.count_documents({
            "department_id": token["department_id"],
            "status": "waiting",
            "position": {"$lt": token["position"]}
        }) + 1
        token["current_position"] = position
    else:
        token["current_position"] = 0
    
    return token

@app.get("/api/tokens/department/{department_id}")
async def get_department_tokens(department_id: str, status: Optional[str] = None):
    query = {"department_id": department_id}
    if status:
        query["status"] = status
    else:
        query["status"] = {"$in": ["waiting", "in_progress"]}
    
    tokens = await db.tokens.find(query, {"_id": 0}).sort("position", 1).to_list(length=None)
    
    # Update current positions for waiting tokens
    waiting_tokens = [t for t in tokens if t['status'] == 'waiting']
    for idx, token in enumerate(waiting_tokens):
        token["current_position"] = idx + 1
        
    in_progress_tokens = [t for t in tokens if t['status'] == 'in_progress']
    for token in in_progress_tokens:
        token["current_position"] = 0

    return tokens

@app.post("/api/tokens/{token_id}/call")
async def call_next_patient(token_id: str):
    token = await db.tokens.find_one({"id": token_id})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Update token status
    await db.tokens.update_one(
        {"id": token_id},
        {"$set": {
            "status": "in_progress",
            "called_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update department
    await db.departments.update_one(
        {"id": token["department_id"]},
        {"$set": {"current_serving": token["token_number"]},
         "$inc": {"total_waiting": -1}}
    )
    
    # Send SMS
    await send_sms(
        token["patient_phone"],
        f"Your turn! Token {token['token_number']} is now being called. Please proceed to the counter immediately. - {token['department_name_en']}"
    )
    
    # Check and notify other patients
    await check_and_notify_patients(token["department_id"])
    
    return {"status": "success", "message": "Patient called"}

@app.post("/api/tokens/{token_id}/complete")
async def complete_token(token_id: str):
    token = await db.tokens.find_one({"id": token_id})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    completed_at = datetime.now(timezone.utc).isoformat()
    
    # Calculate wait time
    called = datetime.fromisoformat(token["called_at"]) if token["called_at"] else datetime.now(timezone.utc)
    completed = datetime.fromisoformat(completed_at)
    consultation_time = int((completed - called).total_seconds() / 60)
    
    # Update token
    await db.tokens.update_one(
        {"id": token_id},
        {"$set": {
            "status": "completed",
            "completed_at": completed_at
        }}
    )
    
    # Update department stats
    department = await db.departments.find_one({"id": token["department_id"]})
    total_completed = department.get("total_completed", 0) + 1
    # This calculation is simplified, a real-world avg wait time is more complex
    
    await db.departments.update_one(
        {"id": token["department_id"]},
        {"$inc": {"total_completed": 1},
         "$set": {"current_serving": None}}
    )
    
    # Update doctor stats
    doctor = await db.doctors.find_one({"id": token["doctor_id"]})
    patients_seen = doctor.get("patients_seen_today", 0) + 1
    avg_time = doctor.get("avg_time_per_patient", 0)
    new_avg_time = ((avg_time * (patients_seen - 1)) + consultation_time) / patients_seen if patients_seen > 0 else consultation_time
    
    await db.doctors.update_one(
        {"id": token["doctor_id"]},
        {"$inc": {"patients_seen_today": 1},
         "$set": {"avg_time_per_patient": int(new_avg_time)}}
    )
    
    # Check and notify other patients
    await check_and_notify_patients(token["department_id"])
    
    return {"status": "success", "message": "Token completed"}


# server.py - DEFINITIVE FIX (MUST BE RESTARTED AFTER THIS CHANGE)
# NEW ENDPOINT FOR CANCELLATION (Using DELETE method on resource path)
@app.delete("/api/tokens/{token_id}")
async def cancel_token(token_id: str):
    token = await db.tokens.find_one({"id": token_id})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    if token["status"] in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Token is already {token['status']}")

    # Update token status
    await db.tokens.update_one(
        {"id": token_id},
        {"$set": {"status": "cancelled"}}
    )
    
    # Decrement waiting count only if it was waiting
    if token["status"] == "waiting":
        await db.departments.update_one(
            {"id": token["department_id"]},
            {"$inc": {"total_waiting": -1}}
        )

    # Re-run notification logic for the rest of the queue
    await check_and_notify_patients(token["department_id"])
    
    return {"status": "success", "message": "Token cancelled"}

# Feedback Endpoints
@app.post("/api/feedback")
async def submit_feedback(token_id: str, rating: int, comment: Optional[str] = None):
    feedback = Feedback(
        token_id=token_id,
        rating=rating,
        comment=comment,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    await db.feedback.insert_one(feedback.dict())
    return feedback

@app.get("/api/feedback/stats")
async def get_feedback_stats():
    feedbacks = await db.feedback.find().to_list(length=None)
    if not feedbacks:
        return {"avg_rating": 0, "total_feedback": 0}
    
    total_rating = sum(f["rating"] for f in feedbacks)
    avg_rating = total_rating / len(feedbacks)
    return {"avg_rating": round(avg_rating, 2), "total_feedback": len(feedbacks)}

# Analytics Endpoints
@app.get("/api/analytics/peak-hours")
async def get_peak_hours():
    analytics = await db.analytics.find().to_list(length=None)
    
    # Aggregate by hour
    hour_counts = {}
    for record in analytics:
        hour = record["hour"]
        count = record.get("patient_count", 0)
        hour_counts[hour] = hour_counts.get(hour, 0) + count
    
    # Format for frontend
    result = []
    for hour in range(24):
        result.append({
            "hour": hour,
            "time": f"{hour:02d}:00",
            "patients": hour_counts.get(hour, 0)
        })
    
    return result

@app.get("/api/analytics/load-balancing")
async def get_load_balancing_suggestions():
    departments = await db.departments.find().to_list(length=None)
    suggestions = []
    
    for dept in departments:
        waiting = dept.get("total_waiting", 0)
        counters = dept.get("active_counters", 1)
        avg_wait = dept.get("avg_wait_time", 0)
        
        load_per_counter = waiting / counters if counters > 0 else 0
        
        if load_per_counter > 5:
            suggestions.append({
                "department_id": dept["id"],
                "department_name": dept["name_en"],
                "current_waiting": waiting,
                "active_counters": counters,
                "suggestion": f"High load detected! Consider adding 1-2 more counters. Current load: {int(load_per_counter)} patients/counter",
                "priority": "high" if load_per_counter > 10 else "medium"
            })
        elif avg_wait > 45:
            suggestions.append({
                "department_id": dept["id"],
                "department_name": dept["name_en"],
                "current_waiting": waiting,
                "active_counters": counters,
                "suggestion": f"Average wait time is {avg_wait} minutes. Consider optimizing counter efficiency.",
                "priority": "medium"
            })
    
    return suggestions

@app.get("/api/stats/overview")
async def get_overview_stats():
    total_tokens = await db.tokens.count_documents({})
    waiting_tokens = await db.tokens.count_documents({"status": "waiting"})
    completed_tokens = await db.tokens.count_documents({"status": "completed"})
    active_departments = await db.departments.count_documents({})
    
    return {
        "total_tokens": total_tokens,
        "waiting_tokens": waiting_tokens,
        "completed_tokens": completed_tokens,
        "active_departments": active_departments
    }

# Initialize default data
@app.on_event("startup")
async def startup_event():
    # Check if departments exist
    dept_count = await db.departments.count_documents({})
    if dept_count == 0:
        default_departments = [
            Department(name_en="General Medicine", name_hi="सामान्य चिकित्सा", active_counters=2),
            Department(name_en="Cardiology", name_hi="हृदय रोग", active_counters=1),
            Department(name_en="Orthopedics", name_hi="हड्डी रोग", active_counters=2),
            Department(name_en="Pediatrics", name_hi="बाल रोग", active_counters=1),
            Department(name_en="Emergency", name_hi="आपातकाल", active_counters=3)
        ]
        dept_ids = {}
        for dept in default_departments:
            await db.departments.insert_one(dept.dict())
            dept_ids[dept.name_en] = dept.id
    
    # Check if doctors exist
    doctor_count = await db.doctors.count_documents({})
    if doctor_count == 0:
        # Refetch departments to ensure we have their IDs
        departments_from_db = await db.departments.find().to_list(length=None)
        dept_map = {d["name_en"]: d["id"] for d in departments_from_db}

        default_doctors = [
            Doctor(name="Dr. Rajesh Kumar", department_id=dept_map["General Medicine"], specialization="General Physician"),
            Doctor(name="Dr. Priya Sharma", department_id=dept_map["General Medicine"], specialization="General Physician"),
            Doctor(name="Dr. Amit Verma", department_id=dept_map["Cardiology"], specialization="Cardiologist"),
            Doctor(name="Dr. Sunita Rao", department_id=dept_map["Orthopedics"], specialization="Orthopedic Surgeon"),
            Doctor(name="Dr. Anil Mehta", department_id=dept_map["Orthopedics"], specialization="Orthopedic Surgeon"),
            Doctor(name="Dr. Kavita Singh", department_id=dept_map["Pediatrics"], specialization="Pediatrician"),
            Doctor(name="Dr. Vikram Joshi", department_id=dept_map["Emergency"], specialization="Emergency Medicine")
        ]
        for doctor in default_doctors:
            await db.doctors.insert_one(doctor.dict())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)