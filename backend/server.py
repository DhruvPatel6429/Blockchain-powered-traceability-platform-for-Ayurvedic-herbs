from fastapi import FastAPI, APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import hashlib
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
import qrcode
import io
import base64
import csv
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure JSON encoder for datetime objects
from fastapi.encoders import jsonable_encoder

# Enums
class HerbType(str, Enum):
    ASHWAGANDHA = "ashwagandha"
    TURMERIC = "turmeric"
    BRAHMI = "brahmi"
    NEEM = "neem"
    TULSI = "tulsi"
    GINGER = "ginger"
    OTHER = "other"

class EventType(str, Enum):
    COLLECTION = "collection"
    PROCESSING = "processing"
    TESTING = "testing"
    PACKAGING = "packaging"
    DISTRIBUTION = "distribution"
    RETAIL = "retail"

class ProcessingType(str, Enum):
    DRYING = "drying"
    CLEANING = "cleaning"
    GRINDING = "grinding"
    EXTRACTION = "extraction"
    QUALITY_CHECK = "quality_check"

class PackagingType(str, Enum):
    BOTTLING = "bottling"
    POUCHING = "pouching"
    BOXING = "boxing"
    LABELING = "labeling"
    SEALING = "sealing"

class DistributionMode(str, Enum):
    TRUCK = "truck"
    RAIL = "rail"
    AIR = "air"
    SEA = "sea"
    LOCAL = "local"

# Models
class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class CollectionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    herb_type: HerbType
    quantity_kg: float
    location: Location
    collector_name: str
    collector_id: Optional[str] = None
    collection_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    weather_conditions: Optional[str] = None
    soil_type: Optional[str] = None
    harvesting_method: Optional[str] = None
    notes: Optional[str] = None

class ProcessingEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    processing_type: ProcessingType
    processor_name: str
    processor_id: Optional[str] = None
    processing_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: Optional[Location] = None
    temperature: Optional[float] = None
    duration_hours: Optional[float] = None
    equipment_used: Optional[str] = None
    notes: Optional[str] = None

class TestResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    test_type: str
    result_value: str
    unit: Optional[str] = None
    pass_status: bool
    lab_name: str
    test_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    certificate_number: Optional[str] = None

class TestingEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lab_name: str
    lab_id: Optional[str] = None
    testing_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    test_results: List[TestResult]
    overall_grade: Optional[str] = None
    compliance_status: bool = True
    notes: Optional[str] = None

class PackagingEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    packaging_type: PackagingType
    packager_name: str
    packager_id: Optional[str] = None
    packaging_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: Optional[Location] = None
    package_size: Optional[str] = None
    package_count: Optional[int] = None
    batch_codes: Optional[List[str]] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class DistributionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    distributor_name: str
    distributor_id: Optional[str] = None
    distribution_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    distribution_mode: DistributionMode
    origin_location: Optional[Location] = None
    destination_location: Optional[Location] = None
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    expected_delivery: Optional[datetime] = None
    temperature_controlled: bool = False
    notes: Optional[str] = None

class RetailEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    retailer_name: str
    retailer_id: Optional[str] = None
    received_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: Location
    quantity_received: Optional[float] = None
    condition_on_arrival: Optional[str] = None
    storage_conditions: Optional[str] = None
    notes: Optional[str] = None


class BlockchainEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_id: str
    event_type: EventType
    event_data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    previous_hash: str = ""
    hash: str = ""
    block_number: int = 0

class HerbBatch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_number: str
    herb_type: HerbType
    total_quantity_kg: float
    origin_location: Location
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_status: str = "collected"
    qr_code: Optional[str] = None
    blockchain_events: List[str] = Field(default_factory=list)  # List of event IDs

# Request Models
class CollectionEventCreate(BaseModel):
    herb_type: HerbType
    quantity_kg: float
    location: Location
    collector_name: str
    collector_id: Optional[str] = None
    weather_conditions: Optional[str] = None
    soil_type: Optional[str] = None
    harvesting_method: Optional[str] = None
    notes: Optional[str] = None

class ProcessingEventCreate(BaseModel):
    batch_id: str
    processing_type: ProcessingType
    processor_name: str
    processor_id: Optional[str] = None
    location: Optional[Location] = None
    temperature: Optional[float] = None
    duration_hours: Optional[float] = None
    equipment_used: Optional[str] = None
    notes: Optional[str] = None

class TestingEventCreate(BaseModel):
    batch_id: str
    lab_name: str
    lab_id: Optional[str] = None
    test_results: List[TestResult]
    overall_grade: Optional[str] = None
    compliance_status: bool = True
    notes: Optional[str] = None

class PackagingEventCreate(BaseModel):
    batch_id: str
    packaging_type: PackagingType
    packager_name: str
    packager_id: Optional[str] = None
    location: Optional[Location] = None
    package_size: Optional[str] = None
    package_count: Optional[int] = None
    batch_codes: Optional[List[str]] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class DistributionEventCreate(BaseModel):
    batch_id: str
    distributor_name: str
    distributor_id: Optional[str] = None
    distribution_mode: DistributionMode
    origin_location: Optional[Location] = None
    destination_location: Optional[Location] = None
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    expected_delivery: Optional[datetime] = None
    temperature_controlled: bool = False
    notes: Optional[str] = None

class RetailEventCreate(BaseModel):
    batch_id: str
    retailer_name: str
    retailer_id: Optional[str] = None
    location: Location
    quantity_received: Optional[float] = None
    condition_on_arrival: Optional[str] = None
    storage_conditions: Optional[str] = None
    notes: Optional[str] = None


# Blockchain simulation functions
def calculate_hash(event_data: dict, previous_hash: str, timestamp: str) -> str:
    """Calculate hash for blockchain event"""
    content = json.dumps({
        "event_data": event_data,
        "previous_hash": previous_hash,
        "timestamp": timestamp
    }, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()

async def get_last_block_hash(batch_id: str) -> tuple[str, int]:
    """Get the hash and block number of the last event for a batch"""
    last_event = await db.blockchain_events.find_one(
        {"batch_id": batch_id},
        sort=[("block_number", -1)]
    )
    if last_event:
        return last_event["hash"], last_event["block_number"]
    return "genesis", 0

async def create_blockchain_event(batch_id: str, event_type: EventType, event_data: dict) -> BlockchainEvent:
    """Create a new blockchain event with proper hash chaining"""
    previous_hash, last_block_number = await get_last_block_hash(batch_id)
    
    event = BlockchainEvent(
        batch_id=batch_id,
        event_type=event_type,
        event_data=event_data,
        previous_hash=previous_hash,
        block_number=last_block_number + 1
    )
    
    # Calculate hash
    event.hash = calculate_hash(
        event_data,
        previous_hash,
        event.timestamp.isoformat()
    )
    
    return event

# Helper functions
def prepare_for_mongo(data: dict) -> dict:
    """Prepare data for MongoDB storage"""
    if isinstance(data.get('timestamp'), datetime):
        data['timestamp'] = data['timestamp'].isoformat()
    if isinstance(data.get('collection_date'), datetime):
        data['collection_date'] = data['collection_date'].isoformat()
    if isinstance(data.get('processing_date'), datetime):
        data['processing_date'] = data['processing_date'].isoformat()
    if isinstance(data.get('testing_date'), datetime):
        data['testing_date'] = data['testing_date'].isoformat()
    if isinstance(data.get('created_date'), datetime):
        data['created_date'] = data['created_date'].isoformat()
    if isinstance(data.get('test_date'), datetime):
        data['test_date'] = data['test_date'].isoformat()
    
    # Handle nested test_results
    if 'test_results' in data and isinstance(data['test_results'], list):
        for test_result in data['test_results']:
            if isinstance(test_result, dict) and isinstance(test_result.get('test_date'), datetime):
                test_result['test_date'] = test_result['test_date'].isoformat()
    
    return data

def parse_from_mongo(item: dict) -> dict:
    """Parse data from MongoDB"""
    if isinstance(item.get('timestamp'), str):
        item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    if isinstance(item.get('collection_date'), str):
        item['collection_date'] = datetime.fromisoformat(item['collection_date'])
    if isinstance(item.get('processing_date'), str):
        item['processing_date'] = datetime.fromisoformat(item['processing_date'])
    if isinstance(item.get('testing_date'), str):
        item['testing_date'] = datetime.fromisoformat(item['testing_date'])
    if isinstance(item.get('created_date'), str):
        item['created_date'] = datetime.fromisoformat(item['created_date'])
    if isinstance(item.get('test_date'), str):
        item['test_date'] = datetime.fromisoformat(item['test_date'])
    return item

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Ayurvedic Herb Traceability Platform API"}

@api_router.post("/collection")
async def create_collection_event(input: CollectionEventCreate):
    """Record a new herb collection event and create a batch"""
    try:
        # Create collection event
        collection_event = CollectionEvent(**input.dict())
        
        # Create herb batch
        batch_number = f"BATCH-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        herb_batch = HerbBatch(
            batch_number=batch_number,
            herb_type=input.herb_type,
            total_quantity_kg=input.quantity_kg,
            origin_location=input.location
        )
        
        # Create blockchain event with serialized data
        collection_data = prepare_for_mongo(collection_event.dict())
        blockchain_event = await create_blockchain_event(
            herb_batch.id,
            EventType.COLLECTION,
            collection_data
        )
        
        # Store in MongoDB
        collection_dict = prepare_for_mongo(collection_event.dict())
        await db.collection_events.insert_one(collection_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        herb_batch.blockchain_events.append(blockchain_event.id)
        batch_dict = prepare_for_mongo(herb_batch.dict())
        await db.herb_batches.insert_one(batch_dict)
        
        # Return the batch with properly serialized data using jsonable_encoder
        return jsonable_encoder(herb_batch)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/processing")
async def add_processing_event(input: ProcessingEventCreate):
    """Add a processing event to an existing batch"""
    try:
        # Check if batch exists
        batch = await db.herb_batches.find_one({"id": input.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create processing event
        processing_event = ProcessingEvent(**input.dict(exclude={"batch_id"}))
        
        # Create blockchain event with serialized data
        processing_data = prepare_for_mongo(processing_event.dict())
        blockchain_event = await create_blockchain_event(
            input.batch_id,
            EventType.PROCESSING,
            processing_data
        )
        
        # Store in MongoDB
        processing_dict = prepare_for_mongo(processing_event.dict())
        await db.processing_events.insert_one(processing_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        # Update batch
        await db.herb_batches.update_one(
            {"id": input.batch_id},
            {"$push": {"blockchain_events": blockchain_event.id}}
        )
        
        return {"message": "Processing event added successfully", "event_id": processing_event.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/testing")
async def add_testing_event(input: TestingEventCreate):
    """Add a testing/lab results event to an existing batch"""
    try:
        # Check if batch exists
        batch = await db.herb_batches.find_one({"id": input.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create testing event
        testing_event = TestingEvent(**input.dict(exclude={"batch_id"}))
        
        # Create blockchain event with serialized data
        testing_data = prepare_for_mongo(testing_event.dict())
        blockchain_event = await create_blockchain_event(
            input.batch_id,
            EventType.TESTING,
            testing_data
        )
        
        # Store in MongoDB
        testing_dict = prepare_for_mongo(testing_event.dict())
        await db.testing_events.insert_one(testing_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        # Update batch
        await db.herb_batches.update_one(
            {"id": input.batch_id},
            {"$push": {"blockchain_events": blockchain_event.id}}
        )
        
        return {"message": "Testing event added successfully", "event_id": testing_event.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/packaging")
async def add_packaging_event(input: PackagingEventCreate):
    """Add a packaging event to an existing batch"""
    try:
        # Check if batch exists
        batch = await db.herb_batches.find_one({"id": input.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create packaging event
        packaging_event = PackagingEvent(**input.dict(exclude={"batch_id"}))
        
        # Create blockchain event with serialized data
        packaging_data = prepare_for_mongo(packaging_event.dict())
        blockchain_event = await create_blockchain_event(
            input.batch_id,
            EventType.PACKAGING,
            packaging_data
        )
        
        # Store in MongoDB
        packaging_dict = prepare_for_mongo(packaging_event.dict())
        await db.packaging_events.insert_one(packaging_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        # Update batch status
        await db.herb_batches.update_one(
            {"id": input.batch_id},
            {
                "$push": {"blockchain_events": blockchain_event.id},
                "$set": {"current_status": "packaged"}
            }
        )
        
        return {"message": "Packaging event added successfully", "event_id": packaging_event.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/distribution")
async def add_distribution_event(input: DistributionEventCreate):
    """Add a distribution event to an existing batch"""
    try:
        # Check if batch exists
        batch = await db.herb_batches.find_one({"id": input.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create distribution event
        distribution_event = DistributionEvent(**input.dict(exclude={"batch_id"}))
        
        # Create blockchain event with serialized data
        distribution_data = prepare_for_mongo(distribution_event.dict())
        blockchain_event = await create_blockchain_event(
            input.batch_id,
            EventType.DISTRIBUTION,
            distribution_data
        )
        
        # Store in MongoDB
        distribution_dict = prepare_for_mongo(distribution_event.dict())
        await db.distribution_events.insert_one(distribution_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        # Update batch status
        await db.herb_batches.update_one(
            {"id": input.batch_id},
            {
                "$push": {"blockchain_events": blockchain_event.id},
                "$set": {"current_status": "in_transit"}
            }
        )
        
        return {"message": "Distribution event added successfully", "event_id": distribution_event.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/retail")
async def add_retail_event(input: RetailEventCreate):
    """Add a retail event to an existing batch"""
    try:
        # Check if batch exists
        batch = await db.herb_batches.find_one({"id": input.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create retail event
        retail_event = RetailEvent(**input.dict(exclude={"batch_id"}))
        
        # Create blockchain event with serialized data
        retail_data = prepare_for_mongo(retail_event.dict())
        blockchain_event = await create_blockchain_event(
            input.batch_id,
            EventType.RETAIL,
            retail_data
        )
        
        # Store in MongoDB
        retail_dict = prepare_for_mongo(retail_event.dict())
        await db.retail_events.insert_one(retail_dict)
        
        blockchain_dict = prepare_for_mongo(blockchain_event.dict())
        await db.blockchain_events.insert_one(blockchain_dict)
        
        # Update batch status
        await db.herb_batches.update_one(
            {"id": input.batch_id},
            {
                "$push": {"blockchain_events": blockchain_event.id},
                "$set": {"current_status": "retail_ready"}
            }
        )
        
        return {"message": "Retail event added successfully", "event_id": retail_event.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/batch/{batch_id}")
async def get_batch(batch_id: str):
    """Get batch details"""
    batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch = parse_from_mongo(batch)
    return jsonable_encoder(HerbBatch(**batch))

@api_router.get("/batch/{batch_id}/provenance")
async def get_batch_provenance(batch_id: str):
    """Get complete provenance chain for a batch"""
    try:
        # Get batch
        batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Get all blockchain events for this batch
        events = await db.blockchain_events.find(
            {"batch_id": batch_id},
            {"_id": 0}  # Exclude MongoDB _id field
        ).sort("block_number", 1).to_list(length=None)
        
        # Parse events
        parsed_events = [parse_from_mongo(event) for event in events]
        
        # Verify blockchain integrity
        for i, event in enumerate(parsed_events):
            if i == 0:
                expected_previous_hash = "genesis"
            else:
                expected_previous_hash = parsed_events[i-1]["hash"]
            
            if event["previous_hash"] != expected_previous_hash:
                raise HTTPException(status_code=400, detail=f"Blockchain integrity compromised at block {event['block_number']}")
        
        result = {
            "batch": parse_from_mongo(batch),
            "provenance_chain": parsed_events,
            "chain_verified": True,
            "total_events": len(parsed_events)
        }
        return jsonable_encoder(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/batches")
async def get_all_batches():
    """Get all herb batches"""
    batches = await db.herb_batches.find({}, {"_id": 0}).to_list(1000)
    parsed_batches = [parse_from_mongo(batch) for batch in batches]
    return jsonable_encoder([HerbBatch(**batch) for batch in parsed_batches])

@api_router.get("/qr/{batch_id}")
async def generate_qr_info(batch_id: str):
    """Generate QR code information for a batch"""
    batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # QR code data
    qr_data = {
        "batch_id": batch_id,
        "batch_number": batch["batch_number"],
        "herb_type": batch["herb_type"],
        "scan_url": f"/scan/{batch_id}",
        "verification_hash": hashlib.sha256(f"{batch_id}{batch['batch_number']}".encode()).hexdigest()[:16]
    }
    
    return qr_data


@api_router.get("/qr/{batch_id}/image")
async def generate_qr_image(batch_id: str):
    """Generate actual QR code image for a batch"""
    try:
        batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create QR code URL
        qr_url = f"{os.environ.get('FRONTEND_URL', 'https://app.example.com')}/scan/{batch_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to bytes buffer
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return StreamingResponse(img_buffer, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/qr/{batch_id}/base64")
async def generate_qr_base64(batch_id: str):
    """Generate QR code as base64 string"""
    try:
        batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Create QR code URL
        qr_url = f"{os.environ.get('FRONTEND_URL', 'https://app.example.com')}/scan/{batch_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return {
            "batch_id": batch_id,
            "qr_code_base64": f"data:image/png;base64,{img_base64}",
            "scan_url": qr_url
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/search/batches")
async def search_batches(
    herb_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    min_quantity: Optional[float] = Query(None),
    max_quantity: Optional[float] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
):
    """Advanced search and filter for batches"""
    try:
        # Build query
        query = {}
        
        if herb_type:
            query["herb_type"] = herb_type
        
        if status:
            query["current_status"] = status
        
        if from_date or to_date:
            date_query = {}
            if from_date:
                date_query["$gte"] = from_date
            if to_date:
                date_query["$lte"] = to_date
            if date_query:
                query["created_date"] = date_query
        
        if min_quantity is not None or max_quantity is not None:
            quantity_query = {}
            if min_quantity is not None:
                quantity_query["$gte"] = min_quantity
            if max_quantity is not None:
                quantity_query["$lte"] = max_quantity
            if quantity_query:
                query["total_quantity_kg"] = quantity_query
        
        if district:
            query["origin_location.district"] = {"$regex": district, "$options": "i"}
        
        if state:
            query["origin_location.state"] = {"$regex": state, "$options": "i"}
        
        # Execute search
        batches = await db.herb_batches.find(query, {"_id": 0}).to_list(1000)
        parsed_batches = [parse_from_mongo(batch) for batch in batches]
        
        return {
            "total_results": len(parsed_batches),
            "batches": jsonable_encoder([HerbBatch(**batch) for batch in parsed_batches])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/analytics/overview")
async def get_analytics_overview():
    """Get comprehensive analytics for the platform"""
    try:
        # Get all batches
        batches = await db.herb_batches.find({}, {"_id": 0}).to_list(10000)
        
        # Calculate statistics
        total_batches = len(batches)
        total_quantity = sum(batch.get("total_quantity_kg", 0) for batch in batches)
        
        # Herb type distribution
        herb_distribution = {}
        for batch in batches:
            herb_type = batch.get("herb_type", "unknown")
            herb_distribution[herb_type] = herb_distribution.get(herb_type, 0) + 1
        
        # Status distribution
        status_distribution = {}
        for batch in batches:
            status = batch.get("current_status", "unknown")
            status_distribution[status] = status_distribution.get(status, 0) + 1
        
        # Location distribution
        location_distribution = {}
        for batch in batches:
            location = batch.get("origin_location", {})
            state = location.get("state", "Unknown")
            location_distribution[state] = location_distribution.get(state, 0) + 1
        
        # Blockchain events count
        total_events = await db.blockchain_events.count_documents({})
        
        # Events by type
        event_types = ["collection", "processing", "testing", "packaging", "distribution", "retail"]
        events_by_type = {}
        for event_type in event_types:
            count = await db.blockchain_events.count_documents({"event_type": event_type})
            events_by_type[event_type] = count
        
        # Monthly batch creation trend (last 12 months)
        monthly_trend = []
        for i in range(12):
            month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start.replace(month=month_start.month - i if month_start.month > i else 12 + month_start.month - i)
            
            # Count batches created in this month
            count = sum(1 for batch in batches 
                       if isinstance(batch.get("created_date"), str) and 
                       batch.get("created_date", "").startswith(month_start.strftime("%Y-%m")))
            
            monthly_trend.insert(0, {
                "month": month_start.strftime("%Y-%m"),
                "count": count
            })
        
        return {
            "overview": {
                "total_batches": total_batches,
                "total_quantity_kg": round(total_quantity, 2),
                "total_blockchain_events": total_events,
                "average_events_per_batch": round(total_events / total_batches, 2) if total_batches > 0 else 0
            },
            "herb_distribution": herb_distribution,
            "status_distribution": status_distribution,
            "location_distribution": location_distribution,
            "events_by_type": events_by_type,
            "monthly_trend": monthly_trend
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/export/batches/csv")
async def export_batches_csv():
    """Export all batches to CSV format"""
    try:
        batches = await db.herb_batches.find({}, {"_id": 0}).to_list(10000)
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "Batch Number", "Herb Type", "Quantity (kg)", "Status", 
            "Created Date", "District", "State", "Blockchain Events"
        ])
        
        # Write data
        for batch in batches:
            location = batch.get("origin_location", {})
            writer.writerow([
                batch.get("batch_number", ""),
                batch.get("herb_type", ""),
                batch.get("total_quantity_kg", 0),
                batch.get("current_status", ""),
                batch.get("created_date", ""),
                location.get("district", ""),
                location.get("state", ""),
                len(batch.get("blockchain_events", []))
            ])
        
        # Prepare response
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=herb_batches.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/export/batch/{batch_id}/json")
async def export_batch_json(batch_id: str):
    """Export single batch with full provenance as JSON"""
    try:
        # Get batch
        batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Get all events
        events = await db.blockchain_events.find(
            {"batch_id": batch_id}, {"_id": 0}
        ).sort("block_number", 1).to_list(length=None)
        
        export_data = {
            "batch": batch,
            "blockchain_events": events,
            "export_date": datetime.now(timezone.utc).isoformat()
        }
        
        return export_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/export/batch/{batch_id}/pdf")
async def export_batch_pdf(batch_id: str):
    """Generate PDF report for a batch"""
    try:
        # Get batch with provenance
        batch = await db.herb_batches.find_one({"id": batch_id}, {"_id": 0})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        events = await db.blockchain_events.find(
            {"batch_id": batch_id}, {"_id": 0}
        ).sort("block_number", 1).to_list(length=None)
        
        # Create PDF
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=30,
        )
        story.append(Paragraph("Ayurvedic Herb Traceability Report", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Batch Information
        story.append(Paragraph("<b>Batch Information</b>", styles['Heading2']))
        batch_data = [
            ["Batch Number:", batch.get("batch_number", "N/A")],
            ["Herb Type:", batch.get("herb_type", "N/A").capitalize()],
            ["Quantity:", f"{batch.get('total_quantity_kg', 0)} kg"],
            ["Status:", batch.get("current_status", "N/A").capitalize()],
            ["Created Date:", str(batch.get("created_date", "N/A"))[:10]],
        ]
        batch_table = Table(batch_data, colWidths=[2*inch, 4*inch])
        batch_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(batch_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Blockchain Events
        story.append(Paragraph("<b>Blockchain Verified Events</b>", styles['Heading2']))
        story.append(Paragraph(f"Total Events: {len(events)} | Chain Verified: ✓", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        for event in events:
            event_data = [
                ["Event Type:", event.get("event_type", "").capitalize()],
                ["Block Number:", str(event.get("block_number", ""))],
                ["Timestamp:", str(event.get("timestamp", ""))[:19]],
                ["Hash:", event.get("hash", "")[:32] + "..."],
            ]
            event_table = Table(event_data, colWidths=[1.5*inch, 4.5*inch])
            event_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
            ]))
            story.append(event_table)
            story.append(Spacer(1, 0.15*inch))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=batch_{batch_id}_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
