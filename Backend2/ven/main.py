import json
from typing import Any
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
owner_address = "0x53C11588f217fdb6beaFFaa58ABa02051029caA8"  # Par défaut, l'adresse générée par Ganache
private_key = "0x9f0920b5b7b7f76feb563859ab0f892d0611ab98c67c6144cc8880c055bf2cc9"  # Utilisé pour signer les transactions


# Route pour obtenir les utilisateurs par rôle
@app.get("/users/{role}", response_model=list[User2])
async def get_users_by_role(role: str):
    try:
        # Appeler la fonction du contrat pour récupérer les utilisateurs par rôle
        users_data = contract.functions.getUsersByRole(role).call()

        # Si des utilisateurs existent, les retourner
        users_list = [User2(name=user[1], email=user[2], location=user[4]) for user in users_data]
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
        user.role,
        user.location
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

        return raw_materials_list
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
# Ajouter une catégorie
@app.post("/add_category/")
def add_category(request: AddCategoryRequest):
    try:
        tx = contract.functions.addCategory(request.title).transact({'from': w3.eth.accounts[0]})
        w3.eth.wait_for_transaction_receipt(tx)
        return {"message": "Category added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/products/")
def add_product(request: AddProductRequest):
    try:
        # Validation des IDs de matières premières
        if any(rw_id <= 0 for rw_id in request.rwIds):
            raise HTTPException(status_code=400, detail="Invalid raw material ID(s)")

        # Construction de la transaction pour appeler la fonction Solidity
        tx = contract.functions.addProduct(
            request.name,
            request.description,
            request.rwIds,
            int(request.price),
            
            request.manufacturerId,
            request.categoryId,
            request.productAddress,
            request.image
        ).transact({'from': w3.eth.accounts[0]})  # Adresse à remplacer si nécessaire

        # Attente de la réception de la transaction
        receipt = w3.eth.wait_for_transaction_receipt(tx)

        # Vérification du statut de la transaction
        if receipt['status'] == 1:
            return {
                "message": "Product added successfully",
                "transactionHash": receipt['transactionHash'].hex()
            }
        else:
            raise HTTPException(status_code=500, detail="Transaction failed on the blockchain")

    except ValueError as e:
        # Gestion des erreurs spécifiques à Web3 ou Solidity
        raise HTTPException(status_code=400, detail=f"Blockchain error: {str(e)}")
    except Exception as e:
        # Gestion des autres exceptions
        raise HTTPException(status_code=500, detail=f"Error adding product: {str(e)}")
# Récupérer une catégorie par ID
@app.get("/get_category/{category_id}")
def get_category(category_id: int):
    try:
        category = contract.functions.getCategoryById(category_id).call()
        if category[0] == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        return {
            "id": category[0],
            "title": category[1],
            "isActive": category[2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/products/{category_id}")
def get_category(category_id: int):
    try:
        category = contract.functions.getProductById(category_id).call()
        if category[0] == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        return {
            "id": category[0],
            "name": category[1],
            "rwIds": category[3],
            "ManufacteurId":category[6],
            "produitOriginID":category[11],
            "productAddress":category[8]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Récupérer une matière première par ID
@app.get("/get_raw_material/{raw_material_id}")
def get_raw_material(raw_material_id: int):
    try:
        raw_material = contract.functions.getRawMaterialById(raw_material_id).call()
        if raw_material[0] == 0:
            raise HTTPException(status_code=404, detail="Raw material not found")
        return {
            "id": raw_material[0],
            "name": raw_material[1],
            "description": raw_material[2],
            "price": raw_material[3],
            "userId": raw_material[4],
            "image": raw_material[5],
            "origin": {
                "text": raw_material[6],
                "coordinate": raw_material[7]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Modifier un produit
@app.put("/edit_product/{product_id}")
def edit_product(product_id: int, request: EditProductRequest):
    try:
        tx = contract.functions.editProduct(
            product_id,
            request.name,
            request.description,
            request.rwIds,
            request.categoryId,
            request.image
        ).transact({'from': w3.eth.accounts[0]})
        w3.eth.wait_for_transaction_receipt(tx)
        return {"message": "Product updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Modifier une catégorie
@app.put("/edit_category/{category_id}")
def edit_category(category_id: int, request: EditCategoryRequest):
    try:
        tx = contract.functions.editCategory(category_id, request.title).transact({'from': w3.eth.accounts[0]})
        w3.eth.wait_for_transaction_receipt(tx)
        return {"message": "Category updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/products/", response_model=List[Any])
async def get_all_products():
    try:
        # Appel de la fonction `getAllProducts` du contrat
        products_data = contract.functions.getAllProducts().call()

        # Transformation des données en un format lisible
        products_list = [
            {
                "id": product[0],  # ID du produit
                "name": product[1],  # Nom
                "description": product[2],  # Description
                "rwIds": product[3],  # Liste des IDs des matières premières utilisées
                "price": product[4],  # ID du fabricant
                "categoryId": {
                    "id": product[5][0],  # ID de la catégorie
                    "title": product[5][1],  # Nom de la catégorie
                    "isActive": product[5][2],  # Statut d'activation de la catégorie
                },

                "image": product[10],  
                "isActive": product[9],
                "ManufacteurId": product[6],
                "productAddress":product[8],
                "produitOriginID":product[11], 
                "stage":product[12]
            }
            for product in products_data
        ]

        return products_list
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/manufacturer/{manufacturer_id}")
async def get_products_by_manufacturer_id(manufacturer_id: int):
    try:
        # Appel de la fonction `getProductsByManufacturerId` du contrat
        products_data = contract.functions.getProductsByManufacturerId(manufacturer_id).call()

        # Transformation des données en un format lisible
        products_list = [
            {
                "id": product[0],  # ID du produit
                "name": product[1],  # Nom
                "description": product[2],  # Description
                "rawMaterialIds": product[3],  # Liste des IDs des matières premières utilisées
                "manufacturerId": product[4],  # ID du fabricant
                "categoryId": product[5],  # ID de la catégorie
                "image": product[6],  # URL de l'image
                "isActive": product[7],  # Statut d'activité
            }
            for product in products_data
        ]

        return {"products": products_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories/")
def get_all_categories():
    try:
        # Appel de la fonction Solidity `getAllCategories`
        categories = contract.functions.getAllCategories().call()

        # Transformation des données en un format lisible
        result = [
            {
                "id": category[0],
                "title": category[1],
                "isActive": category[2]
            }
            for category in categories
        ]

        return  result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")
@app.get("/users/", response_model=list[User2])
async def get_all_users():
    try:
        users_data = contract.functions.getAllUsers().call()

        users_list = [User2(name=user[1], email=user[2],role=user[4],location=user[5]) for user in users_data]
        return users_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UpdateStageProductRequest(BaseModel):
    product_id: int
    stage: int  # Par exemple : "manufacturing", "shipping", "delivered"

@app.put("/update_stage_product/{product_id}")
async def update_stage_product(product_id: int, request: UpdateStageProductRequest):
    try:
        # Appel à la fonction de mise à jour de l'état du produit sur le contrat
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.updateProductStage(
            product_id,
            request.stage
        ).build_transaction({
            'chainId': 1337,  # ID de la chaîne Ganache
            'gas': 2000000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
        })

        # Signature de la transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Attente de la confirmation de la transaction
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            return {"status": "success", "tx_hash": tx_hash.hex()}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Route pour obtenir l'historique complet d'un produit par son ID
@app.get("/get_product_history/{product_id}")
async def get_product_history(product_id: int):
    try:
        # Vérification de la validité du produit
        if product_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid product ID")

        # Appel à la fonction Solidity pour récupérer l'historique du produit
        history = contract.functions.getProductHistory(product_id).call()

        # Retourner l'historique sous forme d'une réponse JSON
        return {"history": history}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.post("/duplicate_product")
async def duplicate_product(request: DuplicateProductRequest):
    try:
        if any(rw_id <= 0 for rw_id in request.rwIds):
            raise HTTPException(status_code=400, detail="Invalid raw material ID(s)")

        # Extraire les paramètres de la requête
        produitOriginID = request.produitOriginID
        newName = request.newName
        newDescription=request.newDescription
        newPrice =int( request.newPrice  ) 
        rwIds =request.rwIds
        newImage = request.newImage
        newAddress=request.newAddress
        manufacturerIdNew=request.manufacturerIdNew

        # Appel à la fonction Solidity "duplicateProduct"
        nonce = w3.eth.get_transaction_count(owner_address)
        tx = contract.functions.duplicateProduct(
            produitOriginID,
            newName,
            newDescription,
            rwIds,
            newPrice,
            manufacturerIdNew,
            newAddress,
            newImage,
            
            
        ).build_transaction({
            'chainId': 1337,  # ID du réseau, ici pour Ganache
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