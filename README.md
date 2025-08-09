# EduVerify - Decentralized Certificate Verification System

EduVerify is a blockchain-based platform for issuing, verifying, updating, and revoking educational certificates.  
It uses **Ethereum smart contracts** for trustless certificate management and **IPFS (hash references)** for document storage.  
The backend is powered by **Node.js + Express**, and interacts with the smart contract using **Ethers.js (v6)**.

---

## Features

- **Approve Institutions** – Only the contract owner can approve institutions to issue certificates.
- **Register Students** – Only the contract owner can register students.
- **Issue Certificates** – Approved institutions can issue certificates to registered students.
- **Verify Certificates** – Anyone can verify certificate validity by IPFS hash and metadata.
- **Revoke Certificates** – Certificates can be revoked by the issuer or contract owner.
- **Update Certificate Hash** – Issuers can update certificate hashes (e.g., reissued PDF).
- **View Certificates** – Anyone can query all certificates for a student.
- **Local IPFS Hashing Simulation** – Backend generates a SHA-256 hash of uploaded PDF as a placeholder for IPFS.

---

## Technology Stack

- **Solidity 0.8.20** – Smart contract for certificate management.
- **OpenZeppelin** – Ownable access control.
- **Hardhat** – Smart contract development environment.
- **Node.js + Express** – Backend REST API.
- **Ethers.js v6** – Blockchain interaction.
- **Multer** – File upload handling.
- **Crypto (Node)** – PDF hash generation.
- **Ganache/Hardhat Network** – Local Ethereum blockchain.

---

## Smart Contract: `EduVerify.sol`

### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `approveInstitution(address)` | Owner | Approve an institution to issue certificates. |
| `registerStudent(address)` | Owner | Register a student in the system. |
| `issueCertificate(address student, string ipfsHash, uint256 expiresAt)` | Approved Institution | Issue a new certificate. |
| `revokeCertificate(address student, uint256 index)` | Owner/Issuer | Revoke an existing certificate. |
| `updateCertificateHash(address student, uint256 index, string newIpfsHash)` | Issuer | Update an issued certificate's IPFS hash. |
| `getCertificates(address student)` | Public | Retrieve all certificates for a student. |
| `isCertificateValid(address student, uint256 index)` | Public | Check if a certificate is valid. |
| `verifyCertificateByHash(string ipfsHash, address student, uint256 index)` | Public | Verify a certificate by comparing IPFS hash. |
| `getCertificateCount(address student)` | Public | Get total number of certificates for a student. |

---

## Backend API Endpoints

### **File Upload**
```http
POST /upload
```
- Uploads a PDF file and returns its SHA-256 hash.
- **Form-data field:** `pdf`

---

### **Issue Certificate**
```http
POST /issue
```
**Body:**
```json
{
  "student": "0xStudentAddress",
  "ipfsHash": "Qm...or_sha256hash",
  "expiresAt": 0
}
```

---

### **Verify Certificate**
```http
GET /verify/:student/:index/:ipfsHash
```
**Response:**
```json
{ "isValid": true }
```

---

### **Revoke Certificate**
```http
POST /revoke
```
**Body:**
```json
{
  "student": "0xStudentAddress",
  "index": 0
}
```

---

### **Get Certificates**
```http
GET /certificates/:student
```
**Response:**
```json
[
  {
    "certificateId": "0x...",
    "ipfsHash": "Qm...or_sha256hash",
    "issuedTo": "0x...",
    "issuedBy": "0x...",
    "issuedAt": "1691539200",
    "expiresAt": "0",
    "isRevoked": false
  }
]
```

---

### **Approve Institution** (Owner only)
```http
POST /approve-institution
```
**Body:**
```json
{
  "institution": "0xInstitutionAddress"
}
```

---

### **Register Student** (Owner only)
```http
POST /register-student
```
**Body:**
```json
{
  "student": "0xStudentAddress"
}
```

---

## Local Development Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/KWATRA55/EduVerify.git
cd EduVerify
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Start Local Blockchain
```bash
npx hardhat node
```

### 4️⃣ Deploy the Contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the deployed contract address into `index.js` (`contractAddress` variable).

### 5️⃣ Start Backend Server
```bash
node backend/index.js
```
Backend runs on: **http://localhost:3008**

---

## Notes
- This project uses a local SHA-256 hash instead of real IPFS for simplicity. Replace `/upload` logic to integrate with IPFS (e.g., Pinata, Infura) for production.
- Replace private keys in `index.js` with environment variables (`.env` file) for security.
- Currently configured for local Hardhat network; update provider to connect to testnets/mainnet.

---

## License
MIT License © 2025
