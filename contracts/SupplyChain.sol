// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract SupplyChain {
    address public Owner;

    constructor() public {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only the owner can perform this action.");
        _;
    }

    enum STAGE {
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    enum ShipmentStatus {
        PENDING,
        IN_TRANSIT,
        DELIVERED
    }

    uint256 public rmsCtr = 0;
    uint256 public productCtr = 0;
    uint256 public userCount = 0;
    uint256 public shipmentCount = 0;

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
        uint256 currentHandlerId;
        STAGE stage;
    }

    struct User {
        uint256 id;
        string name;
        string email;
        bytes32 passwordHash; 
        string role;
        string userAddress;
    }

    struct ProductHistory {
        uint256 timestamp;
        uint256 handlerId;
        STAGE stage;
    }

    struct Shipment {
        uint256 id;
        uint256 senderId;
        uint256 receiverId;
        uint256 distributorId;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        string description;
        ShipmentStatus status;
        bool isPaid;
    }

    mapping(uint256 => User) public users;
    mapping(uint256 => RW) public rms;
    mapping(uint256 => Product) public productStock;
    mapping(uint256 => ProductHistory[]) public productHistories;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => uint256[]) public shipmentsByDistributor; // New mapping to store shipment IDs by distributor

    // Events
    event RawMaterialAdded(uint256 id, string name);
    event ProductAdded(uint256 id, string name);
    event ProductStageUpdated(uint256 id, STAGE newStage);
    event ProductCreated(
        uint256 id,
        string name,
        string description,
        uint256 manufacturerId
    );
    event ShipmentCreated(
        uint256 id,
        uint256 senderId,
        uint256 receiverId,
        uint256 distributorId,
        uint256 pickupTime,
        uint256 distance,
        uint256 price,
        string description
    );
    event ShipmentInTransit(
        uint256 senderId,
        uint256 receiverId,
        uint256 pickupTime
    );
    event ShipmentDelivered(
        uint256 senderId,
        uint256 receiverId,
        uint256 deliveryTime
    );
    event ShipmentPaid(uint256 senderId, uint256 receiverId, uint256 amount);

    // Add a raw material
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

    // Add a user
    function addUser(
        string memory _name,
        string memory _email,
        string memory _password,
        string memory _role,
        string memory _userAddress
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty.");
        require(bytes(_email).length > 0, "Email cannot be empty.");
        require(bytes(_password).length > 0, "Password cannot be empty.");

        userCount++;
        users[userCount] = User({
            id: userCount,
            name: _name,
            email: _email,
            passwordHash: keccak256(abi.encodePacked(_password)),
            role: _role,
            userAddress: _userAddress
        });
    }

    // Create a product and trigger shipments for the raw materials used
    function createProduct(
        string memory _name,
        string memory _description,
        uint256[] memory _rwIds,
        uint256 _manufacturerId,
        uint256 _distributorId,
        uint256 _price
    ) public onlyByOwner {
        require(users[_manufacturerId].id != 0, "Manufacturer does not exist.");
        require(users[_distributorId].id != 0, "Distributor does not exist.");
        require(_rwIds.length > 0, "Product must contain raw materials.");

        productCtr++;
        productStock[productCtr] = Product({
            id: productCtr,
            name: _name,
            description: _description,
            rwIds: _rwIds,
            manufacturerId: _manufacturerId,
            distributorId: _distributorId,
            currentHandlerId: _manufacturerId,
            stage: STAGE.Manufacture
        });

        for (uint256 i = 0; i < _rwIds.length; i++) {
            uint256 rwId = _rwIds[i];
            require(rms[rwId].id != 0, "Invalid raw material ID.");
            createShipment(
                rms[rwId].userId,
                _manufacturerId,
                _distributorId,
                block.timestamp,
                100,
                _price,
                " "
            );
        }

        productHistories[productCtr].push(
            ProductHistory({
                timestamp: block.timestamp,
                handlerId: _manufacturerId,
                stage: STAGE.Manufacture
            })
        );

        emit ProductCreated(productCtr, _name, _description, _manufacturerId);
    }

    // Create Shipment
    function createShipment(
        uint256 _senderId,
        uint256 _receiverId,
        uint256 _distributorId,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _price,
        string memory _description
    ) public {
        shipmentCount++;
        shipments[shipmentCount] = Shipment({
            id: shipmentCount,
            senderId: _senderId,
            receiverId: _receiverId,
            distributorId: _distributorId,
            pickupTime: _pickupTime,
            deliveryTime: 0,
            distance: _distance,
            price: _price,
            description: _description,
            status: ShipmentStatus.PENDING,
            isPaid: false
        });

        shipmentsByDistributor[_distributorId].push(shipmentCount); // Add the shipment ID to the distributor's list

        emit ShipmentCreated(
            shipmentCount,
            _senderId,
            _receiverId,
            _distributorId,
            _pickupTime,
            _distance,
            _price,
            _description
        );
    }

    // Get shipments by distributor
    function getShipmentsByDistributor(uint256 distributorId) public view returns (Shipment[] memory) {
        uint256 count = shipmentsByDistributor[distributorId].length;
        
        // Create an array to store the result
        Shipment[] memory result = new Shipment[](count);

        // Populate the result array with shipments
        for (uint256 i = 0; i < count; i++) {
            result[i] = shipments[shipmentsByDistributor[distributorId][i]];
        }

        return result;
    }

    // Start Shipment
    function startShipment(uint256 _shipmentIndex) public {
        Shipment storage shipment = shipments[_shipmentIndex];
        require(
            shipment.status == ShipmentStatus.PENDING,
            "Shipment not pending."
        );
        shipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(
            shipment.senderId,
            shipment.receiverId,
            shipment.pickupTime
        );
    }

    // Complete Shipment
    function completeShipment(uint256 _shipmentIndex) public {
        Shipment storage shipment = shipments[_shipmentIndex];
        require(
            shipment.status == ShipmentStatus.IN_TRANSIT,
            "Shipment not in transit."
        );
        require(!shipment.isPaid, "Shipment already paid.");

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveryTime = block.timestamp;
        shipment.isPaid = true;

        emit ShipmentDelivered(
            shipment.senderId,
            shipment.receiverId,
            shipment.deliveryTime
        );
        emit ShipmentPaid(
            shipment.senderId,
            shipment.receiverId,
            shipment.price
        );
    }
}
