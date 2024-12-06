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
    origin: str