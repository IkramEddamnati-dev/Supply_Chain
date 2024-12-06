import json
from pathlib import Path
from pydantic import BaseModel
from web3 import Web3
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends
import jwt
from datetime import datetime, timedelta
# OAuth2 Scheme for token verification
from fastapi.security import OAuth2PasswordBearer
# Load contract details
supply_chain_path = Path("./artifacts/SupplyChain.json")
with supply_chain_path.open("r") as file:
    supply_chain_data = json.load(file)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost",  # Allow localhost
    "http://localhost:5173",  # React dev server (if applicable)
    
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow these origins to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Blockchain setup
CHAIN_ID = 1337
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

if not w3.is_connected():
    raise Exception("Unable to connect to Ganache")

# Contract details
network_id = 5777
network_data = supply_chain_data["networks"].get(str(network_id))
if not network_data:
    raise Exception(f"Contract address not found for network ID {network_id}.")

contract_abi = supply_chain_data.get("abi")
CONTRACT_ADDRESS = network_data["address"]
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

# Owner account details
owner_address = "0x3A822f960C890A3299288A4888352c5cad0faEb0"
private_key = "0xe01c2c3dc9b80354fa51ea459c3cbd6016181d0577ec7c94ee7ac6b97d8d0145"

# JWT Secret Key for token generation
SECRET_KEY = "AZERTGUYIMJLKJ?V123456789LK?NB0JHGFFDJ"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
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

### Helper Functions ###

# Function to generate JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Function to hash the password and verify against the contract's password hash
def verify_password(plain_password: str, stored_password_hash: bytes):
    # Generate the hash from the plain password
    hashed_password = Web3.keccak(plain_password.encode('utf-8'))
    
    # Debugging
    print(f"Debug: Hashed Password = {hashed_password}, Stored Hash = {stored_password_hash}")
    
    # Compare the raw binary hash with the stored hash
    return hashed_password == stored_password_hash

# Function to get user from the blockchain (in real use, retrieve from a DB or blockchain)
def get_user_from_blockchain(email: str):
    # Example function that retrieves user details from blockchain
    users_count = contract.functions.userCount().call()
    for i in range(1, users_count + 1):
        user = contract.functions.users(i).call()  # Assuming this returns (name, email, password, role, address)
        if user[2] == email:
            return user
    return None

### API Endpoints ###
@app.post("/login/", response_model=Token)
async def login(user: UserLogin):
    # Fetch the user from blockchain (simulating a DB lookup)
    db_user = get_user_from_blockchain(user.email)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="user not found")
    
    # Verify the password (In real implementation, it would be hashed)
    if not verify_password(user.password, db_user[3]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user.email, "role": db_user[4]}) 
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/add_user/")
async def add_user(user: UserCreate):
    try:
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.addUser(
            user.name,
            user.email,
            user.password,
            user.role,
            user.userAddress
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Protected route that requires JWT authentication
@app.get("/protected/")
async def protected_route(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Here, you can fetch the user from blockchain or DB based on the email
        user = get_user_from_blockchain(email)
        if user:
            return {"msg": f"Hello {user[0]}, you have access to this protected route!"}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
@app.post("/add_raw_material/")
async def add_raw_material(raw_material: RawMaterialCreate):
    try:
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.addRawMaterial(
            raw_material.name,
            raw_material.description,
            raw_material.price,
            raw_material.image,
            raw_material.origin
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/create_product/")
async def create_product(product: ProductCreate):
    try:
        # Ensure manufacturer and distributor exist
        manufacturer_exists = contract.functions.getUser(product.manufacturerId).call()
        distributor_exists = contract.functions.getUser(product.distributorId).call()
        
        if not manufacturer_exists[0] or not distributor_exists[0]:  # Assuming 'getUser' returns user data
            raise HTTPException(status_code=400, detail="Manufacturer or Distributor does not exist.")

        # Ensure raw materials are valid
        for rwId in product.rwIds:
            raw_material_exists = contract.functions.getRawMaterial(rwId).call()
            if not raw_material_exists[0]:  # Assuming 'getRawMaterial' returns material data
                raise HTTPException(status_code=400, detail=f"Invalid raw material ID: {rwId}")

        # Call createProduct function in smart contract
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.createProduct(
            product.name,
            product.description,
            product.rwIds,
            product.manufacturerId,
            product.distributorId,
            product.price
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        # Sign and send the transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/start_shipment/{shipment_index}")
async def start_shipment(shipment_index: int):
    try:
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.startShipment(shipment_index).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/complete_shipment/{shipment_index}")
async def complete_shipment(shipment_index: int):
    try:
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.completeShipment(shipment_index).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# New endpoint: Get users by role
@app.get("/get_users_by_role/{role}")
async def get_users_by_role(role: str):
    try:
        users_count = contract.functions.getUsersCount().call()
        users = []

        for i in range(users_count):
            user = contract.functions.getUser(i).call()
            if user[3].lower() == role.lower():  # Assuming 'role' is the 4th element in the user data
                users.append({
                    "name": user[0],
                    "email": user[1],
                    "role": user[3],
                    "userAddress": user[4]
                })
        
        return {"users": users}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# New endpoint: Get product history
@app.get("/get_product_history/{product_id}")
async def get_product_history(product_id: int):
    try:
        product_history = contract.functions.getProductHistory(product_id).call()
        history = []

        for entry in product_history:
            history.append({
                "timestamp": entry[0],
                "status": entry[1],  # Assuming status is the 2nd element
                "location": entry[2],  # Assuming location is the 3rd element
            })

        return {"product_id": product_id, "history": history}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
