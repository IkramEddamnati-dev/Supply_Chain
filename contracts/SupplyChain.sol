// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract SupplyChain {
    // Propriétaire du contrat
    address public Owner;

    constructor() public {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner);
        _;
    }

    enum STAGE {
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    uint256 public rmsCtr = 0;
    uint256 public productCtr = 0;
    uint256 public userCount = 0;

    struct RW {
        uint256 id;
        string name;
        string description;
        uint256 price;
        uint256 userId;
        string image;
        string origin;
    }

    struct Product {
        uint256 id;
        string name;
        string description;
        uint256[] rwIds;
        uint256 manufacturerId;
        uint256 distributorId;
        uint256 retailerId;
        uint256 currentHandlerId;
        STAGE stage;
    }

    struct User {
        uint256 id;
        string name;
        string email;
        bytes32 passwordHash; // Stockage sécurisé avec un hash
        string role; // Role de l'utilisateur comme une chaîne de caractères
    }

    struct ProductHistory {
        uint256 timestamp;
        uint256 handlerId;
        STAGE stage;
    }

    mapping(uint256 => User) public users;
    mapping(uint256 => RW) public rms;
    mapping(uint256 => Product) public productStock;
    mapping(uint256 => ProductHistory[]) public productHistories;

    // Événements
    event RawMaterialAdded(uint256 id, string name);
    event ProductAdded(uint256 id, string name);
    event ProductStageUpdated(uint256 id, STAGE newStage);

    // Ajouter une matière première
    function addRawMaterial(
    string memory _name,
    string memory _description,
    uint256 _price,
    string memory _image,
    string memory _origin
) public onlyByOwner {
    rmsCtr++;
    rms[rmsCtr] = RW({
        id: rmsCtr,
        name: _name,
        description: _description,
        price: _price,
        userId: 0,
        image: _image,
        origin: _origin
    });
    emit RawMaterialAdded(rmsCtr, _name);
}


    // Ajouter un utilisateur
    function addUser(
        string memory _name,
        string memory _email,
        string memory _password,
        string memory _role
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");

        userCount++;
        users[userCount] = User({
            id: userCount,
            name: _name,
            email: _email,
            passwordHash: keccak256(abi.encodePacked(_password)),
            role: _role
        });
    }

    // Obtenir les utilisateurs par rôle
    function getUsersByRole(string memory _role) public view returns (User[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= userCount; i++) {
            if (
                keccak256(abi.encodePacked(users[i].role)) == keccak256(abi.encodePacked(_role))
            ) {
                count++;
            }
        }

        User[] memory filteredUsers = new User[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= userCount; i++) {
            if (
                keccak256(abi.encodePacked(users[i].role)) == keccak256(abi.encodePacked(_role))
            ) {
                filteredUsers[index] = users[i];
                index++;
            }
        }
        return filteredUsers;
    }

    // Ajouter un produit
    function addProduct(
        string memory _name,
        string memory _description,
        uint256[] memory _rwIds,
        uint256 _manufacturerId
    ) public onlyByOwner {
        for (uint256 i = 0; i < _rwIds.length; i++) {
            require(_rwIds[i] > 0 && _rwIds[i] <= rmsCtr, "Invalid raw material ID");
        }

        productCtr++;
        productStock[productCtr] = Product({
            id: productCtr,
            name: _name,
            description: _description,
            rwIds: _rwIds,
            manufacturerId: _manufacturerId,
            distributorId: 0,
            retailerId: 0,
            currentHandlerId: _manufacturerId,
            stage: STAGE.Manufacture
        });

        emit ProductAdded(productCtr, _name);
    }

    // Mettre à jour le stade d'un produit
    function updateProductStage(uint256 _productId, STAGE _newStage) public onlyByOwner {
        require(_productId > 0 && _productId <= productCtr, "Produit inexistant");
        require(
            uint8(_newStage) > uint8(productStock[_productId].stage),
            "Stade invalide"
        );
        productStock[_productId].stage = _newStage;

        productHistories[_productId].push(
            ProductHistory({
                timestamp: block.timestamp,
                handlerId: productStock[_productId].currentHandlerId,
                stage: _newStage
            })
        );

        emit ProductStageUpdated(_productId, _newStage);
    }

    // Obtenir l'historique d'un produit
    function getProductHistory(uint256 _productId) public view returns (ProductHistory[] memory) {
        require(_productId > 0 && _productId <= productCtr, "Produit inexistant");
        return productHistories[_productId];
    }
   // Fonction pour obtenir toutes les matières premières
function getAllRawMaterials() public view returns (RW[] memory) {
    uint256 count = rmsCtr; // Nombre total de matières premières

    // Créer un tableau dynamique avec le nombre total de matières premières
    RW[] memory allRawMaterials = new RW[](count);

    // Remplir le tableau avec toutes les matières premières
    for (uint256 i = 1; i <= rmsCtr; i++) {
        allRawMaterials[i - 1] = rms[i];
    }

    return allRawMaterials;
}



}
