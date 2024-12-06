from typing import List
from pydantic import BaseModel



# Modèle pour ajouter un utilisateur
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
class User2(BaseModel):
    name: str
    email: str
    role: str

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
    categoryId: int
    image: str
    price: float  

class EditProductRequest(BaseModel):
    name: str
    description: str
    rwIds: List[int]
    categoryId: int
    image: str

class EditCategoryRequest(BaseModel):
    title: str
