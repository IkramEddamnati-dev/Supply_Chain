# Full Project Setup Guide

This guide will help you set up the backend, frontend, and smart contracts for the project.

---

## 🚀 Backend Setup

### 1. Clone the project repository

```bash
git clone https://github.com/IkramEddamnati-dev/Supply_Chain.git
cd Supply_Chain
```

````

### 2. Navigate to the backend directory

```bash
cd backend2
```

### 3. Set up a virtual environment

If you're using Python, create and activate a virtual environment:

```bash
python -m venv ven
.\ven\Scripts\Activate  # Windows
source ven/bin/activate  # Mac/Linux
```

### 4. Install backend dependencies

Make sure to install the required dependencies for the backend:

```bash
pip install -r requirements.txt
```

### 5. Run the backend server

Start the backend server using uvicorn:

```bash
uvicorn main:app --reload
```

Your backend should now be running on `http://localhost:8000`.

---

## 🖥 Frontend Setup

### 1. Navigate to the frontend directory

Go to the client directory where the frontend code is located:

```bash
cd client
```

### 2. Install frontend dependencies

Install the necessary dependencies for the frontend:

```bash
npm install
```

### 3. Start the frontend development server

Run the frontend with:

```bash
npm run dev
```

Your frontend should now be running on `http://localhost:3000`.

---

## 📜 Smart Contract Setup

### 1. Install Truffle globally

Make sure you have Truffle installed globally:

```bash
npm install -g truffle
```

### 2. Compile the smart contract

Navigate to the smart contract folder and compile the contract:

```bash
truffle compile
```

### 3. Migrate the contract

Run the migration to deploy your contract to the blockchain:

```bash
truffle migrate
```

### 4. Interact with the contract

Once migrated, you can interact with your smart contract from the backend or frontend as needed.

---

## 💻 Additional Information

- **Backend**: Python backend using FastAPI or another framework.
- **Frontend**: ReactJS with TailwindCSS for UI design.
- **Smart Contracts**: Truffle and Ethereum blockchain.
- **Environment Variables**: Make sure to set up all required environment variables for the backend (e.g., `.env` file).

---

Happy Coding! 🎉

