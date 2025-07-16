from fastapi import FastAPI, HTTPException, Depends, Request, Form, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
import jwt
import hashlib
import uuid
import base64
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import httpx
from telegram import Bot
import asyncio
import json

# Initialize FastAPI app
app = FastAPI(title="Car Dealer API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/cardealer")
client = MongoClient(MONGO_URL)
db = client.cardealer

# Collections
cars_collection = db.cars
users_collection = db.users
orders_collection = db.orders
payment_transactions_collection = db.payment_transactions
admin_collection = db.admin
car_inquiries_collection = db.car_inquiries

# JWT Secret
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")

# Security
security = HTTPBearer()

# Telegram Bot Setup
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-1001234567890")  # Group chat ID
telegram_bot = Bot(token=TELEGRAM_TOKEN) if TELEGRAM_TOKEN else None

# Pydantic Models
class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = "user"  # user, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Car(BaseModel):
    car_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    make: str
    model: str
    year: int
    price: float
    mileage: int
    fuel_type: str
    transmission: str
    engine_size: str
    color: str
    interior_type: str
    safety_features: List[str] = []
    entertainment_system: str
    vin_number: str
    description: str
    images: List[str] = []  # base64 encoded images
    main_image: str  # base64 encoded main image
    status: str = "available"  # available, sold, pending
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Order(BaseModel):
    order_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    financing_needed: bool = False
    payment_method: str
    order_status: str = "pending"  # pending, confirmed, completed, cancelled
    total_amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentTransaction(BaseModel):
    transaction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    car_id: str
    amount: float
    currency: str = "usd"
    payment_status: str = "pending"  # pending, paid, failed, expired
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CarInquiry(BaseModel):
    inquiry_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    car_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    message: Optional[str] = None
    financing_needed: bool = False
    preferred_contact_method: str = "email"  # email, phone, telegram
    inquiry_status: str = "new"  # new, contacted, interested, closed
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Auth Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_jwt_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user = users_collection.find_one({"user_id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user = users_collection.find_one({"user_id": payload["user_id"]})
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Telegram Functions
async def send_telegram_notification(message: str):
    if telegram_bot and TELEGRAM_CHAT_ID:
        try:
            await telegram_bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=message,
                parse_mode="Markdown"
            )
        except Exception as e:
            print(f"Failed to send Telegram notification: {e}")

def escape_markdown(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2"""
    special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in special_chars:
        text = text.replace(char, f'\\{char}')
    return text

# Stripe Payment Setup
def get_stripe_checkout():
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")

# API Endpoints

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication Endpoints
@app.post("/api/auth/register")
async def register_user(user: User):
    # Check if user exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    user.password = hash_password(user.password)
    
    # Insert user
    result = users_collection.insert_one(user.dict())
    if result.inserted_id:
        token = create_jwt_token(user.user_id, user.role)
        return {"message": "User registered successfully", "token": token, "user_id": user.user_id}
    
    raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login")
async def login_user(email: str = Form(...), password: str = Form(...)):
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"], user["role"])
    return {"token": token, "user_id": user["user_id"], "role": user["role"]}

@app.get("/api/auth/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    user.pop("password", None)
    return user

# Car Inventory Endpoints
@app.get("/api/cars")
async def get_cars(skip: int = 0, limit: int = 20, search: Optional[str] = None):
    query = {}
    if search:
        query = {
            "$or": [
                {"make": {"$regex": search, "$options": "i"}},
                {"model": {"$regex": search, "$options": "i"}},
                {"color": {"$regex": search, "$options": "i"}}
            ]
        }
    
    cars = list(cars_collection.find(query).skip(skip).limit(limit))
    for car in cars:
        car.pop("_id", None)
    return cars

@app.get("/api/cars/{car_id}")
async def get_car(car_id: str):
    car = cars_collection.find_one({"car_id": car_id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    car.pop("_id", None)
    return car

@app.post("/api/cars")
async def create_car(car: Car, admin: dict = Depends(get_admin_user)):
    result = cars_collection.insert_one(car.dict())
    if result.inserted_id:
        return {"message": "Car created successfully", "car_id": car.car_id}
    raise HTTPException(status_code=500, detail="Failed to create car")

@app.put("/api/cars/{car_id}")
async def update_car(car_id: str, car: Car, admin: dict = Depends(get_admin_user)):
    result = cars_collection.update_one({"car_id": car_id}, {"$set": car.dict()})
    if result.modified_count:
        return {"message": "Car updated successfully"}
    raise HTTPException(status_code=404, detail="Car not found")

@app.delete("/api/cars/{car_id}")
async def delete_car(car_id: str, admin: dict = Depends(get_admin_user)):
    result = cars_collection.delete_one({"car_id": car_id})
    if result.deleted_count:
        return {"message": "Car deleted successfully"}
    raise HTTPException(status_code=404, detail="Car not found")

# Order Endpoints
@app.post("/api/orders")
async def create_order(order: Order, user: dict = Depends(get_current_user)):
    # Check if car exists and is available
    car = cars_collection.find_one({"car_id": order.car_id})
    if not car or car["status"] != "available":
        raise HTTPException(status_code=400, detail="Car not available")
    
    order.user_id = user["user_id"]
    order.total_amount = car["price"]
    
    result = orders_collection.insert_one(order.dict())
    if result.inserted_id:
        return {"message": "Order created successfully", "order_id": order.order_id}
    raise HTTPException(status_code=500, detail="Failed to create order")

@app.get("/api/orders")
async def get_orders(user: dict = Depends(get_current_user)):
    orders = list(orders_collection.find({"user_id": user["user_id"]}))
    for order in orders:
        order.pop("_id", None)
    return orders

@app.get("/api/admin/orders")
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    orders = list(orders_collection.find())
    for order in orders:
        order.pop("_id", None)
    return orders

# Payment Endpoints
@app.post("/api/payments/checkout")
async def create_checkout_session(
    car_id: str = Form(...),
    request: Request = None,
    user: dict = Depends(get_current_user)
):
    # Get car details
    car = cars_collection.find_one({"car_id": car_id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Get host URL from request
    host_url = str(request.base_url).rstrip('/')
    
    # Create success and cancel URLs
    success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/payment-cancel"
    
    # Create checkout session
    stripe_checkout = get_stripe_checkout()
    
    metadata = {
        "car_id": car_id,
        "user_id": user["user_id"],
        "car_make": car["make"],
        "car_model": car["model"],
        "car_year": str(car["year"])
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=float(car["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        user_id=user["user_id"],
        car_id=car_id,
        amount=car["price"],
        currency="usd",
        payment_status="pending",
        metadata=metadata
    )
    
    payment_transactions_collection.insert_one(transaction.dict())
    
    return {"url": session.url, "session_id": session.session_id}

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    # Get payment transaction
    transaction = payment_transactions_collection.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    # Check status with Stripe
    stripe_checkout = get_stripe_checkout()
    checkout_status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    if checkout_status.payment_status != transaction["payment_status"]:
        payment_transactions_collection.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": checkout_status.payment_status}}
        )
        
        # If payment is successful, send Telegram notification
        if checkout_status.payment_status == "paid":
            car = cars_collection.find_one({"car_id": transaction["car_id"]})
            user = users_collection.find_one({"user_id": transaction["user_id"]})
            
            # Send Telegram notification
            message = f"""
🚗 *New Car Sale Alert!*

*Car Details:*
• Make: {car['make']}
• Model: {car['model']}
• Year: {car['year']}
• Price: ${car['price']:,.2f}

*Customer Info:*
• Name: {user['first_name']} {user['last_name']}
• Email: {user['email']}
• Phone: {user.get('phone', 'N/A')}

*Payment:*
• Amount: ${checkout_status.amount_total / 100:.2f}
• Status: PAID ✅
• Session ID: {session_id}

*Contact:*
📱 {'+1 470-499-8139'}
💬 https://t.me/carsforsaleunder3000

_Payment processed at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC_
            """
            
            await send_telegram_notification(message)
            
            # Update car status to sold
            cars_collection.update_one(
                {"car_id": transaction["car_id"]},
                {"$set": {"status": "sold"}}
            )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency
    }

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    # Handle Stripe webhooks
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    # For now, just return success
    # In production, you would verify the signature and process the webhook
    return {"status": "success"}

# Contact Endpoints
@app.post("/api/contact")
async def submit_contact_message(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    subject: str = Form(...),
    message: str = Form(...)
):
    contact_message = ContactMessage(
        name=name,
        email=email,
        phone=phone,
        subject=subject,
        message=message
    )
    
    result = db.contact_messages.insert_one(contact_message.dict())
    if result.inserted_id:
        # Send notification to Telegram
        notification = f"""
📧 *New Contact Message*

*From:* {name}
*Email:* {email}
*Phone:* {phone or 'N/A'}
*Subject:* {subject}

*Message:*
{message}

*Contact:*
📱 {'+1 470-499-8139'}
💬 https://t.me/carsforsaleunder3000
        """
        await send_telegram_notification(notification)
        
        return {"message": "Message sent successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to send message")

# Admin Dashboard Endpoints
@app.get("/api/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(get_admin_user)):
    # Get statistics
    total_cars = cars_collection.count_documents({})
    available_cars = cars_collection.count_documents({"status": "available"})
    sold_cars = cars_collection.count_documents({"status": "sold"})
    total_users = users_collection.count_documents({})
    total_orders = orders_collection.count_documents({})
    total_revenue = sum([t["amount"] for t in payment_transactions_collection.find({"payment_status": "paid"})])
    
    return {
        "total_cars": total_cars,
        "available_cars": available_cars,
        "sold_cars": sold_cars,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }

# Initialize admin user
@app.on_event("startup")
async def create_admin_user():
    # Create default admin user if not exists
    admin_email = "admin@cardealer.com"
    if not users_collection.find_one({"email": admin_email}):
        admin_user = User(
            email=admin_email,
            password="admin123",  # Will be hashed
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        admin_user.password = hash_password(admin_user.password)
        users_collection.insert_one(admin_user.dict())
        print(f"Admin user created: {admin_email} / admin123")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)