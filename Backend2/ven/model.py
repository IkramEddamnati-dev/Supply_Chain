from typing import List
from pydantic import BaseModel



### Models ###
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    location:str
class User2(BaseModel):
    name: str
    email: str
    role: str
    userAddress: str


class RawMaterialCreate(BaseModel):
    name: str
    description: str
    price: int
    image: str
    origin: str  # Adresse sous forme de texte
    latitude: float
    longitude: float

class AddCategoryRequest(BaseModel):
    title: str

class AddProductRequest(BaseModel):
    name: str
    description: str
    rwIds: list[int]  # Liste des IDs des matières premières
    manufacturerId: int
    distributorId:int
    categoryId: int
    image: str
    price: float  
    productAddress:str

class EditProductRequest(BaseModel):
    name: str
    description: str
    rwIds: List[int]
    categoryId: int
    image: str

class EditCategoryRequest(BaseModel):
    title: str
class DuplicateProductRequest(BaseModel):
    produitOriginID: int
    newName: str
    newDescription:str
    newAddress:str
    manufacturerIdNew:int
    distributorId:int
    newPrice: float
    newImage: str
    rwIds: list[int]
