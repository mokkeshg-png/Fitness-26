import os
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = FastAPI(title="FitTrack Backend - Python MCP")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Initialization
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise RuntimeError("Missing Supabase credentials in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Models
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_goal: Optional[str] = None
    daily_cal_goal: Optional[int] = None

class FoodLogEntry(BaseModel):
    food_name: str
    calories: int
    meal_type: str
    consumed_at: Optional[str] = None

class WorkoutEntry(BaseModel):
    workout_type: str
    duration_min: int
    calories_burned: int
    completed_at: Optional[str] = None

class WeightLogEntry(BaseModel):
    weight_kg: float
    logged_at: Optional[str] = None

# Business Logic Helpers
def calculate_daily_calorie_goal(weight: float, height: float, goal: str) -> int:
    bmr = (10 * weight) + (6.25 * height) - (5 * 30) + 5
    tdee = bmr * 1.375
    target = round(tdee)
    if goal == 'weight_loss': target = round(tdee - 500)
    elif goal == 'weight_gain': target = round(tdee + 500)
    return max(target, 1200)

async def get_user_from_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="User not found")
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

# Routes
@app.get("/")
async def root():
    return {"status": "healthy", "service": "FitTrack Python Backend"}

@app.get("/health")
async def health_check():
    health = {
        "api_status": "online",
        "supabase_connection": "failed",
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        # Simple selective query to check database connectivity
        supabase.table("users").select("id").limit(1).execute()
        health["supabase_connection"] = "online"
    except Exception as e:
        health["api_status"] = "degraded"
        health["supabase_connection"] = f"error: {str(e)}"
    return health

# --- AUTH & USER ---
@app.get("/user/profile")
async def get_profile(user = Depends(get_user_from_token)):
    response = supabase.table("users").select("*").eq("id", user.id).single().execute()
    return response.data

@app.put("/user/profile")
async def update_profile(updates: UserUpdate, user = Depends(get_user_from_token)):
    update_data = updates.model_dump(exclude_none=True)
    if any(k in update_data for k in ["weight_kg", "height_cm", "fitness_goal"]):
        current = supabase.table("users").select("*").eq("id", user.id).single().execute().data
        weight = update_data.get("weight_kg", current["weight_kg"])
        height = update_data.get("height_cm", current["height_cm"])
        goal = update_data.get("fitness_goal", current["fitness_goal"])
        update_data["daily_cal_goal"] = calculate_daily_calorie_goal(weight, height, goal)
    response = supabase.table("users").update(update_data).eq("id", user.id).execute()
    return response.data[0] if response.data else {"error": "Update failed"}

# --- TRACKING ---
@app.get("/tracking/daily-summary/{date}")
async def get_daily_summary(date: str, user = Depends(get_user_from_token)):
    try:
        profile_resp = supabase.table("users").select("daily_cal_goal").eq("id", user.id).single().execute()
        goal = profile_resp.data.get("daily_cal_goal", 2000) if profile_resp.data else 2000
    except Exception:
        goal = 2000

    food_response = supabase.table("food_logs").select("calories").eq("user_id", user.id)\
        .gte("consumed_at", f"{date}T00:00:00").lte("consumed_at", f"{date}T23:59:59").execute()
    workout_response = supabase.table("workouts").select("calories_burned").eq("user_id", user.id)\
        .gte("completed_at", f"{date}T00:00:00").lte("completed_at", f"{date}T23:59:59").execute()
        
    consumed = sum(row.get("calories", 0) for row in food_response.data) if food_response.data else 0
    burned = sum(row.get("calories_burned", 0) for row in workout_response.data) if workout_response.data else 0
    net = consumed - burned

    return {
        "calorie_goal": goal,
        "total_consumed": consumed,
        "total_burned": burned,
        "net_calories": net,
        "remaining": goal - net
    }

@app.post("/tracking/food")
async def log_food(entry: FoodLogEntry, user = Depends(get_user_from_token)):
    data = entry.model_dump()
    data["user_id"] = str(user.id)
    if not data["consumed_at"]: data["consumed_at"] = datetime.utcnow().isoformat()
    response = supabase.table("food_logs").insert([data]).execute()
    return response.data[0]

@app.post("/tracking/workout")
async def log_workout(entry: WorkoutEntry, user = Depends(get_user_from_token)):
    data = entry.model_dump()
    data["user_id"] = str(user.id)
    if not data["completed_at"]: data["completed_at"] = datetime.utcnow().isoformat()
    response = supabase.table("workouts").insert([data]).execute()
    return response.data[0]

@app.post("/tracking/weight")
async def log_weight(entry: WeightLogEntry, user = Depends(get_user_from_token)):
    data = entry.model_dump()
    data["user_id"] = str(user.id)
    if not data["logged_at"]: data["logged_at"] = datetime.utcnow().isoformat()
    # Update profile weight too
    supabase.table("users").update({"weight_kg": entry.weight_kg}).eq("id", user.id).execute()
    response = supabase.table("weight_logs").insert([data]).execute()
    return response.data[0]

@app.delete("/tracking/food/{id}")
async def delete_food(id: str, user = Depends(get_user_from_token)):
    response = supabase.table("food_logs").delete().eq("id", id).eq("user_id", user.id).execute()
    return {"status": "success"}

@app.delete("/tracking/workout/{id}")
async def delete_workout(id: str, user = Depends(get_user_from_token)):
    response = supabase.table("workouts").delete().eq("id", id).eq("user_id", user.id).execute()
    return {"status": "success"}

# --- ANALYTICS ---
@app.get("/analytics/bmi")
async def calculate_bmi(user = Depends(get_user_from_token)):
    profile = (supabase.table("users").select("weight_kg, height_cm").eq("id", user.id).single().execute()).data
    weight = profile["weight_kg"]
    height_m = profile["height_cm"] / 100
    bmi = weight / (height_m * height_m)
    category = "Normal"
    if bmi < 18.5: category = "Underweight"
    elif bmi < 25: category = "Normal"
    elif bmi < 30: category = "Overweight"
    else: category = "Obese"
    return {"bmi": round(bmi, 1), "category": category}

@app.get("/analytics/history")
async def get_analytics_history(days: int = 30, user = Depends(get_user_from_token)):
    from datetime import timedelta
    start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
    food_logs = supabase.table("food_logs").select("calories, consumed_at").eq("user_id", user.id).gte("consumed_at", start_date).execute()
    workouts = supabase.table("workouts").select("calories_burned, completed_at").eq("user_id", user.id).gte("completed_at", start_date).execute()
    weight_logs = supabase.table("weight_logs").select("weight_kg, logged_at").eq("user_id", user.id).gte("logged_at", start_date).order("logged_at").execute()
    
    return {
        "food_logs": food_logs.data,
        "workouts": workouts.data,
        "weight_logs": weight_logs.data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
