from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3

app = FastAPI()

# Connexion à Ganache (en utilisant le réseau local)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))  # Ganache écoute sur cette adresse

# Vérifiez si la connexion a réussi
if not w3.is_connected():
    raise Exception("Impossible de se connecter à Ganache")

# L'adresse du contrat déployé et son ABI
contract_address = "0x75cdbE61d79012446b2777250b44D95Ec4c5Bc2e"  # Remplacez par l'adresse du contrat déployé sur Ganache
contract_abi =[
    {
      "inputs": [],
      "payable": False,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "ProductAdded",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "enum SupplyChain.STAGE",
          "name": "newStage",
          "type": "uint8"
        }
      ],
      "name": "ProductStageUpdated",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "RawMaterialAdded",
      "type": "event"
    },
    {
      "constant": True,
      "inputs": [],
      "name": "Owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [],
      "name": "productCtr",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "productHistories",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "handlerId",
          "type": "uint256"
        },
        {
          "internalType": "enum SupplyChain.STAGE",
          "name": "stage",
          "type": "uint8"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "productStock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "manufacturerId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "distributorId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "retailerId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentHandlerId",
          "type": "uint256"
        },
        {
          "internalType": "enum SupplyChain.STAGE",
          "name": "stage",
          "type": "uint8"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "rms",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "userId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "origin",
          "type": "string"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [],
      "name": "rmsCtr",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [],
      "name": "userCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "bytes32",
          "name": "passwordHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "role",
          "type": "string"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": False,
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_image",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_origin",
          "type": "string"
        }
      ],
      "name": "addRawMaterial",
      "outputs": [],
      "payable": False,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": False,
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_password",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_role",
          "type": "string"
        }
      ],
      "name": "addUser",
      "outputs": [],
      "payable": False,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "string",
          "name": "_role",
          "type": "string"
        }
      ],
      "name": "getUsersByRole",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "passwordHash",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "role",
              "type": "string"
            }
          ],
          "internalType": "struct SupplyChain.User[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": False,
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256[]",
          "name": "_rwIds",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "_manufacturerId",
          "type": "uint256"
        }
      ],
      "name": "addProduct",
      "outputs": [],
      "payable": False,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": False,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_productId",
          "type": "uint256"
        },
        {
          "internalType": "enum SupplyChain.STAGE",
          "name": "_newStage",
          "type": "uint8"
        }
      ],
      "name": "updateProductStage",
      "outputs": [],
      "payable": False,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": True,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_productId",
          "type": "uint256"
        }
      ],
      "name": "getProductHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "handlerId",
              "type": "uint256"
            },
            {
              "internalType": "enum SupplyChain.STAGE",
              "name": "stage",
              "type": "uint8"
            }
          ],
          "internalType": "struct SupplyChain.ProductHistory[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "payable": False,
      "stateMutability": "view",
      "type": "function"
    }
  ]

# Connexion au contrat
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Adresse de l'owner (propriétaire du contrat)
owner_address = "0x4115F405eAA384551455219aD1C7F4a53e86f51E"  # Par défaut, l'adresse générée par Ganache
private_key = "0x37cb69bd78274d9fb6b16a7fba58a3496cf2967a57ac786cb01d3a4d3e73f0ce"  # Utilisé pour signer les transactions

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

# Route pour obtenir les utilisateurs par rôle
@app.get("/get_users_by_role/{role}", response_model=list[User2])
async def get_users_by_role(role: str):
    try:
        # Appeler la fonction du contrat pour récupérer les utilisateurs par rôle
        users_data = contract.functions.getUsersByRole(role).call()

        # Si des utilisateurs existent, les retourner
        users_list = [User2(name=user[0], email=user[1], role=user[2]) for user in users_data]
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

# Route pour ajouter une matière première
class RawMaterialCreate(BaseModel):
    name: str
    description: str
    price: int
    image: str
    origin: str

@app.post("/add_raw_material/")
async def add_raw_material(raw_material: RawMaterialCreate):
    nonce = w3.eth.getTransactionCount(owner_address)
    tx = contract.functions.addRawMaterial(
        raw_material.name,
        raw_material.description,
        raw_material.price,
        raw_material.image,
        raw_material.origin
    ).buildTransaction({
        'chainId': 1337,
        'gas': 2000000,
        'gasPrice': w3.toWei('20', 'gwei'),
        'nonce': nonce,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)

    receipt = w3.eth.waitForTransactionReceipt(tx_hash)

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
