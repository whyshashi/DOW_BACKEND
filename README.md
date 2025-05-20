# 🛠️ EHS Web Admin Panel – Backend

This is the backend API for the EHS (Environment, Health & Safety) Web Admin Panel. It provides secure and scalable services for incident tracking, compliance management, safety training, document control, and more.

---

## 🚀 Features

- 🔒 Secure authentication (JWT-based)
- 🧾 Incident and near-miss reporting
- ✅ Safety audit/inspection tracking
- 📚 Training and certification management
- 📄 Document and policy storage
- 📊 KPI data aggregation
- 🔁 Role-based access control (RBAC)
- 🧠 Modular architecture with services for each EHS domain

---

## ⚙️ Tech Stack

| Component     | Technology         |
|---------------|--------------------|
| Language      | JavaScript         |
| Runtime       | Node.js            |
| Framework     | Express.js         |
| Database      | MongoDB            |
| Auth          | JWT + Bcrypt       |
| ORM           | Mongoose           |
| Logging       | Morgan             |
| Deployment    | CI/CD via GitHub   |

---

## 📦 Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB
- Docker (optional)

### Installation

```bash
# Clone repo
git clone https://github.com/whyshashi/DOW_BACKEND.git
cd ehs-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with DB credentials, secret keys, etc.

# Start the development server
npm start



