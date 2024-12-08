## Full Project Setup Guide

This guide will help you set up the backend, frontend, and smart contracts for the project.

---

## 🚀 Backend Setup

### 1. Clone the project repository

Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/IkramEddamnati-dev/Supply_Chain.git
cd Supply_Chain
```

### 2. Navigate to the backend directory

```bash
cd Backend2
```


### 3. Set up a virtual environment

Create and activate a virtual environment (if using Python):

```bash
python -m venv ven
# Activate the virtual environment:
# On Windows:
.\ven\Scripts\activate
# On Mac/Linux:
source ven/bin/activate
```

### 4. Install backend dependencies

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### 5. Run the backend server

Start the backend server using **Uvicorn**:

```bash
uvicorn main:app --reload
```

Your backend should now be running on `http://127.0.0.1:8000` (or `http://localhost:8000`).

---

## 🖥 Frontend Setup

### 1. Navigate to the frontend directory

Move to the frontend directory:

```bash
cd client
```

### 2. Install frontend dependencies

Install all required frontend dependencies:

```bash
npm install
```

### 3. Start the frontend development server

Run the frontend development server:

```bash
npm run dev
```

Your frontend should now be running on `http://localhost:3000`.

---

## 📜 Smart Contract Setup

### 1. Install Truffle globally

Ensure you have **Truffle** installed globally on your system:

```bash
npm install -g truffle
```

### 2. Compile the smart contract

Navigate to the smart contracts directory and compile the contract:

```bash
cd contracts  # Ensure this is the correct folder for your contracts
truffle compile
```


### 3. Migrate the contract

Deploy the smart contract to your blockchain environment:

```bash
truffle migrate
```

> **Note**: Ensure you have a configured blockchain environment (e.g., Ganache or Infura).

### 4. Interact with the contract

Once migrated, you can interact with your smart contract from the backend or frontend.

---

## 💻 Additional Information

- **Backend**: Python backend using FastAPI or another framework.
- **Frontend**: ReactJS with TailwindCSS for UI design.
- **Smart Contracts**: Truffle and Ethereum blockchain.
- **Environment Variables**: Ensure you set up all required environment variables in a `.env` file.

---

### Common Problems and Fixes

1. **Virtual Environment Activation Fails**:
   - Ensure you're using the correct Python version and path. Try `python3` if `python` doesn't work.
   - On Linux/Mac, ensure the `ven` folder is executable:  
     ```bash
     chmod +x ven/bin/activate
     ```

2. **Missing Dependencies**:
   - For the backend, ensure `pip` is up-to-date:  
     ```bash
     python -m pip install --upgrade pip
     ```
   - For the frontend, ensure Node.js and npm are installed correctly.

3. **Smart Contract Migration Errors**:
   - Verify your blockchain environment (e.g., Ganache, Infura) is running.
   - Check your `truffle-config.js` for network configurations.


