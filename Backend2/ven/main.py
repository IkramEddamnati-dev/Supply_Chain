import json
from fastapi import FastAPI, HTTPException
from pathlib import Path
from pydantic import BaseModel
from web3 import Web3
from model import *
from fastapi.middleware.cors import CORSMiddleware

supply_chain_path = Path("./artifacts/SupplyChain.json")
with supply_chain_path.open("r") as file:
    supply_chain_data = json.load(file)
app = FastAPI()
CHAIN_ID=1337

# Connexion à Ganache (en utilisant le réseau local)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vous pouvez spécifier les origines autorisées
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Vérifiez si la connexion a réussi
if not w3.is_connected():
    raise Exception("Impossible de se connecter à Ganache")

# L'adresse du contrat déployé et son ABI
network_id =5777
network_data = supply_chain_data["networks"].get(str(network_id))

if not network_data:
    raise Exception(f"Adresse du contrat introuvable pour le réseau ID {network_id}.")
contract_abi =supply_chain_data.get("abi")

CONTRACT_ADDRESS = network_data["address"]
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)
# Connexion au contrat
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

# Adresse de l'owner (propriétaire du contrat)
owner_address = "0x1b8f1A385db53d8a882a2f199362BAb921E7a8b8"  # Par défaut, l'adresse générée par Ganache
private_key = "0x9778410360c9a3622550fc266aac832840a009775e7d515e7d44a25b2e017f3e"  # Utilisé pour signer les transactions


# Route pour obtenir les utilisateurs par rôle
@app.get("/get_users_by_role/{role}", response_model=list[User2])
async def get_users_by_role(role: str):
    try:
        # Appeler la fonction du contrat pour récupérer les utilisateurs par rôle
        users_data = contract.functions.getUsersByRole(role).call()

        # Si des utilisateurs existent, les retourner
        users_list = [User2(name=user[1], email=user[2]) for user in users_data]
        return users_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Route pour ajouter un utilisateur
@app.post("/add_user/")
async def add_user(user: UserCreate):
    nonce = w3.eth.get_transaction_count(owner_address)
    tx = contract.functions.addUser(
        user.name,
        user.email,
        user.password,
        user.role
    ).build_transaction({
        'chainId': 1337,  # Ganache utilise souvent le chainId 1337
        'gas': 2000000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'nonce': nonce,
    })

    # Signer la transaction
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Attendre que la transaction soit minée
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if receipt.status == 1:
        return {"status": "success", "tx_hash": tx_hash.hex()}
    else:
        raise HTTPException(status_code=400, detail="Transaction failed")


@app.post("/raw_materials/")
async def add_raw_material(raw_material: RawMaterialCreate):
    try:
        # Construction de la transaction
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.addRawMaterial(
            raw_material.name,
            raw_material.description,
            raw_material.price,
            raw_material.image,
            raw_material.origin,
            int(raw_material.latitude * 10**6),  # Conversion en int pour Solidity
            int(raw_material.longitude * 10**6)  # Conversion en int pour Solidity
        ).build_transaction({
            'chainId': 1337,  # ID de votre réseau (1337 = Ganache local)
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Attendre que la transaction soit minée
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        # Vérification du statut de la transaction
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route pour obtenir l'historique d'un produit
@app.get("/get_product_history/{product_id}")
async def get_product_history(product_id: int):
    try:
        history = contract.functions.getProductHistory(product_id).call()
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.get("/raw_materials/")
async def get_all_raw_materials():
    try:
        # Appel à la fonction `getAllRawMaterials` du contrat
        raw_materials_data = contract.functions.getAllRawMaterials().call()

        # Transformation des données en un format lisible
        raw_materials_list = [
            {
                "id": raw_material[0],  # ID
                "name": raw_material[1],  # Nom
                "description": raw_material[2],  # Description
                "price": raw_material[3],  # Prix
                "image": raw_material[5],  # Image
                "origin": {
                    "text": raw_material[6][0],  # Texte de l'adresse
                    "coordinate": [
                raw_material[6][1][0] / 10**6,  # Convertir la latitude de micro-degrés en degrés
                raw_material[6][1][1] / 10**6,  # Convertir la longitude de micro-degrés en degrés
            ], 
                },
            }
            for raw_material in raw_materials_data
        ]

        return {"raw_materials": raw_materials_list}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.post("/add_product/")
async def add_product(product: ProductCreate):
    try:
        # Construction de la transaction pour appeler addProduct dans le contrat
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.addProduct(
            product.name,
            product.description,
            product.rwIds,  # Liste des IDs des matières premières
            product.manufacturerId,
            product.categoryId,
            product.image
        ).build_transaction({
            'chainId': 1337,  # ID de votre réseau (1337 = Ganache local)
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        # Signer la transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        # Attendre que la transaction soit minée
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        # Vérification du statut de la transaction
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

