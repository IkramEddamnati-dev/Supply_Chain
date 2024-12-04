import json
from fastapi import FastAPI, HTTPException
from pathlib import Path
from pydantic import BaseModel
from web3 import Web3
from model import *
supply_chain_path = Path("./artifacts/SupplyChain.json")
with supply_chain_path.open("r") as file:
    supply_chain_data = json.load(file)
app = FastAPI()
CHAIN_ID=1337

# Connexion à Ganache (en utilisant le réseau local)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))  

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
owner_address = "0x4115F405eAA384551455219aD1C7F4a53e86f51E"  # Par défaut, l'adresse générée par Ganache
private_key = "0x37cb69bd78274d9fb6b16a7fba58a3496cf2967a57ac786cb01d3a4d3e73f0ce"  # Utilisé pour signer les transactions


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



@app.post("/add_raw_material/")
async def add_raw_material(raw_material: RawMaterialCreate):
    nonce = w3.eth.get_transaction_count(owner_address)
    tx = contract.functions.addRawMaterial(
        raw_material.name,
        raw_material.description,
        raw_material.price,
        raw_material.image,
        raw_material.origin
    ).build_transaction({
        'chainId': 1337,
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

# Route pour obtenir l'historique d'un produit
@app.get("/get_product_history/{product_id}")
async def get_product_history(product_id: int):
    try:
        history = contract.functions.getProductHistory(product_id).call()
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
