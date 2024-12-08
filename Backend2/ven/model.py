from pydantic import BaseModel



### Models ###
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    userAddress: str


class RawMaterialCreate(BaseModel):
    name: str
    description: str
    price: int
    image: str
    origin: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductCreate(BaseModel):
    name: str
    description: str
    rwIds: list[int]
    manufacturerId: int
    distributorId: int
    price: int



class CreateShipmentRequest(BaseModel):
    sender_id: int
    receiver_id: int
    distributor_id: int
    pickup_time: int  # Adjusted to handle ISO 8601 datetime strings
    distance: int        # Adjusted to allow fractional values
    price: int
    description: str

class Shipment(BaseModel):
    senderId: int
    receiverId: int
    senderName: str
    receiverName: str
    distributorId: int
    pickupTime: int
    deliveryTime: int
    distance: int
    price: int
    description: str
    status: int  # Use an Enum or int for status (0: Pending, 1: InTransit, 2: Delivered, 3: Canceled)
    isPaid: bool
