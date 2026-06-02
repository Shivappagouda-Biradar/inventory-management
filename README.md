# Inventory & Order Management System

A full-stack production-ready application for managing products, customers, and orders.

## Stack
- **Frontend**: React 18 + React Router + Axios
- **Backend**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose

---

## 🚀 Quick Start (Docker)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your values (optional for local dev)

# 3. Build and start all services
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Settings / env vars
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   ├── Orders.js
│   │   │   └── OrderDetail.js
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| **Products** | | |
| POST | `/products/` | Create product |
| GET | `/products/` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| **Customers** | | |
| POST | `/customers/` | Create customer |
| GET | `/customers/` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |
| **Orders** | | |
| POST | `/orders/` | Create order |
| GET | `/orders/` | List orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order |
| **Dashboard** | | |
| GET | `/dashboard/stats` | Summary statistics |

Interactive docs available at `/docs` (Swagger UI).

---

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Quantity cannot be negative
- Orders fail if stock is insufficient
- Stock is automatically reduced on order creation
- Stock is restored when an order is cancelled
- Total order amount is calculated automatically

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` (from a Render PostgreSQL instance)

### Frontend → Vercel / Netlify

1. Connect your GitHub repo
2. Set root directory to `frontend/`
3. Build command: `npm run build`
4. Output directory: `build`
5. Add env variable: `REACT_APP_API_URL=https://your-backend.onrender.com`
