#!/usr/bin/env python3
"""
Script to populate the car dealer database with affordable cars
"""

import os
import sys
import base64
import requests
from pymongo import MongoClient
from datetime import datetime
import uuid

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client.cardealer
cars_collection = db.cars

def convert_image_to_base64(image_url):
    """Convert image URL to base64 string"""
    try:
        response = requests.get(image_url)
        if response.status_code == 200:
            return base64.b64encode(response.content).decode('utf-8')
        else:
            print(f"Failed to download image: {image_url}")
            return None
    except Exception as e:
        print(f"Error converting image {image_url}: {e}")
        return None

# Affordable car data with professional images
affordable_cars = [
    {
        "make": "Honda",
        "model": "Civic",
        "year": 2018,
        "price": 12500,
        "mileage": 85000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "1.5L",
        "color": "Silver",
        "interior_type": "Fabric",
        "safety_features": ["ABS", "Airbags", "Stability Control", "Backup Camera"],
        "entertainment_system": "Touch Screen Display",
        "vin_number": "1HGBH41JXMN109186",
        "description": "Reliable and fuel-efficient Honda Civic in excellent condition. Well-maintained with recent service records. Perfect for daily commuting with great gas mileage.",
        "image_url": "https://images.unsplash.com/photo-1673905190370-58c991e71423?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxhZmZvcmRhYmxlJTIwY2Fyc3xlbnwwfHx8fDE3NTI2NzQ3NzZ8MA&ixlib=rb-4.1.0&q=85",
        "status": "available"
    },
    {
        "make": "Toyota",
        "model": "Camry",
        "year": 2017,
        "price": 13900,
        "mileage": 92000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "2.5L",
        "color": "White",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Traction Control", "Blind Spot Monitor"],
        "entertainment_system": "Bluetooth Audio",
        "vin_number": "4T1BF1FK5HU123456",
        "description": "Spacious and reliable Toyota Camry with excellent safety ratings. Low maintenance costs and proven reliability. Great family car with comfortable seating.",
        "image_url": "https://images.unsplash.com/photo-1711270923260-51b550c7eaa8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxhZmZvcmRhYmxlJTIwY2Fyc3xlbnwwfHx8fDE3NTI2NzQ3NzZ8MA&ixlib=rb-4.1.0&q=85",
        "status": "available"
    },
    {
        "make": "Mazda",
        "model": "3",
        "year": 2019,
        "price": 11800,
        "mileage": 68000,
        "fuel_type": "Gasoline",
        "transmission": "Manual",
        "engine_size": "2.0L",
        "color": "Red",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Stability Control", "Lane Departure Warning"],
        "entertainment_system": "Infotainment System",
        "vin_number": "3MZBN1V75KM123789",
        "description": "Sporty and efficient Mazda3 with manual transmission. Great handling and fun to drive. Perfect for those who enjoy driving experience.",
        "image_url": "https://images.unsplash.com/photo-1705769942705-45266e50628b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxhZmZvcmRhYmxlJTIwY2Fyc3xlbnwwfHx8fDE3NTI2NzQ3NzZ8MA&ixlib=rb-4.1.0&q=85",
        "status": "available"
    },
    {
        "make": "Nissan",
        "model": "Sentra",
        "year": 2018,
        "price": 10500,
        "mileage": 78000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "1.8L",
        "color": "Gray",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Stability Control"],
        "entertainment_system": "AM/FM Radio",
        "vin_number": "3N1AB7AP9JY123456",
        "description": "Affordable and reliable Nissan Sentra perfect for first-time buyers. Great fuel economy and comfortable interior. Well-maintained with clean title.",
        "image_url": "https://images.pexels.com/photos/25286597/pexels-photo-25286597.jpeg",
        "status": "available"
    },
    {
        "make": "Hyundai",
        "model": "Elantra",
        "year": 2017,
        "price": 9800,
        "mileage": 95000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "2.0L",
        "color": "Blue",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Electronic Stability Control"],
        "entertainment_system": "Bluetooth Connectivity",
        "vin_number": "KMHD84LF1HU123789",
        "description": "Budget-friendly Hyundai Elantra with good reliability record. Excellent warranty coverage and fuel efficiency. Perfect for daily commuting needs.",
        "image_url": "https://images.pexels.com/photos/33021558/pexels-photo-33021558.jpeg",
        "status": "available"
    },
    {
        "make": "Ford",
        "model": "Focus",
        "year": 2016,
        "price": 8900,
        "mileage": 88000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "2.0L",
        "color": "Black",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Traction Control"],
        "entertainment_system": "SYNC System",
        "vin_number": "1FADP3F26GL123456",
        "description": "Practical Ford Focus with good handling and fuel economy. Recent maintenance performed. Great value for money with modern features.",
        "image_url": "https://images.pexels.com/photos/11283500/pexels-photo-11283500.jpeg",
        "status": "available"
    },
    {
        "make": "Chevrolet",
        "model": "Cruze",
        "year": 2018,
        "price": 11200,
        "mileage": 82000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "1.4L Turbo",
        "color": "Silver",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Stability Control", "Rear Cross Traffic Alert"],
        "entertainment_system": "MyLink Infotainment",
        "vin_number": "1G1BC5SM3J7123789",
        "description": "Efficient Chevrolet Cruze with turbocharged engine. Great fuel economy and modern safety features. Well-maintained interior and exterior.",
        "image_url": "https://images.unsplash.com/photo-1565043666747-69f6646db940?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHx1c2VkJTIwY2Fyc3xlbnwwfHx8fDE3NTI2NzQ3ODN8MA&ixlib=rb-4.1.0&q=85",
        "status": "available"
    },
    {
        "make": "Kia",
        "model": "Forte",
        "year": 2019,
        "price": 12800,
        "mileage": 65000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "2.0L",
        "color": "White",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Vehicle Stability Management", "Forward Collision Warning"],
        "entertainment_system": "UVO Infotainment",
        "vin_number": "3KPF24AD6KE123456",
        "description": "Modern Kia Forte with excellent warranty coverage. Advanced safety features and comfortable ride. Great value with low mileage.",
        "image_url": "https://images.unsplash.com/uploads/1413425985184f77e9d23/46107d09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHx1c2VkJTIwY2Fyc3xlbnwwfHx8fDE3NTI2NzQ3ODN8MA&ixlib=rb-4.1.0&q=85",
        "status": "available"
    },
    {
        "make": "Volkswagen",
        "model": "Jetta",
        "year": 2017,
        "price": 10900,
        "mileage": 89000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": "1.4L Turbo",
        "color": "Gray",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "Electronic Stability Control", "Post-Collision Braking"],
        "entertainment_system": "MIB Infotainment",
        "vin_number": "3VW2B7AJ9HM123789",
        "description": "German-engineered Volkswagen Jetta with turbo engine. Excellent build quality and ride comfort. Well-maintained with service records.",
        "image_url": "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
        "status": "available"
    },
    {
        "make": "Subaru",
        "model": "Impreza",
        "year": 2018,
        "price": 13500,
        "mileage": 72000,
        "fuel_type": "Gasoline",
        "transmission": "CVT",
        "engine_size": "2.0L",
        "color": "Blue",
        "interior_type": "Cloth",
        "safety_features": ["ABS", "Airbags", "EyeSight Safety Suite", "All-Wheel Drive"],
        "entertainment_system": "STARLINK Multimedia",
        "vin_number": "4S3GKAC60J3123456",
        "description": "All-wheel drive Subaru Impreza perfect for all weather conditions. Excellent safety ratings and proven reliability. Great for outdoor enthusiasts.",
        "image_url": "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
        "status": "available"
    }
]

def populate_database():
    """Populate the database with affordable cars"""
    print("Starting to populate database with affordable cars...")
    
    # Clear existing cars (optional)
    cars_collection.delete_many({})
    print("Cleared existing cars from database")
    
    for i, car_data in enumerate(affordable_cars):
        print(f"Processing car {i+1}/{len(affordable_cars)}: {car_data['make']} {car_data['model']}")
        
        # Convert image URL to base64
        if car_data.get('image_url'):
            base64_image = convert_image_to_base64(car_data['image_url'])
            if base64_image:
                car_data['main_image'] = f"data:image/jpeg;base64,{base64_image}"
                car_data['images'] = [f"data:image/jpeg;base64,{base64_image}"]
            else:
                car_data['main_image'] = "https://via.placeholder.com/400x300?text=Car+Image"
                car_data['images'] = []
        
        # Remove the image_url field as it's not needed in the database
        car_data.pop('image_url', None)
        
        # Add required fields
        car_data['car_id'] = str(uuid.uuid4())
        car_data['created_at'] = datetime.utcnow()
        
        # Insert into database
        try:
            result = cars_collection.insert_one(car_data)
            print(f"✓ Successfully added {car_data['make']} {car_data['model']} (ID: {car_data['car_id']})")
        except Exception as e:
            print(f"✗ Error adding {car_data['make']} {car_data['model']}: {e}")
    
    print(f"\nDatabase population complete! Added {len(affordable_cars)} cars.")
    print(f"Total cars in database: {cars_collection.count_documents({})}")

if __name__ == "__main__":
    populate_database()