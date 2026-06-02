# Inventory & Order Management System

A full-stack production-ready application for managing products, customers, and orders.

## 🌐 Live Deployment

- **Frontend**: https://inventory-system-pro.netlify.app
- **Backend API**: https://inventory-backend-lx2t.onrender.com
- **API Documentation**: https://inventory-backend-lx2t.onrender.com/docs
- **Docker Hub Image**: shivu682/inventory-backend:latest

> **Note**: The Docker image can be built locally using:
> ```bash
> docker build -t shivu682/inventory-backend:latest ./backend
> docker push shivu682/inventory-backend:latest
> ```

## Stack
- **Frontend**: React 18 + Vite + Recharts + React Router
- **Backend**: Python 3.11 + FastAPI + SQLAlchemy
- **Database**: PostgreSQL (production) / SQLite (local dev)
- **Containerization**: Docker + Docker Compose

---

## 🚀 Quick Start (Local — No Docker)

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8000
- API Docs → http://localhost:8000/docs

---

## 🐳 Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8000

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point + CORS
│   │   ├── config.py        # Settings / env vars
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # DB models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py       # Pydantic schemas + validators
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
│   │   │   ├── Dashboard.jsx   # Charts + KPI cards
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── api.js              # Axios API calls
│   │   ├── App.jsx             # Router + sidebar layout
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── netlify.toml
├── docker-compose.yml
├── render.yaml
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Health status |
| **Products** | | |
| POST | `/products/` | Create product |
| GET | `/products/` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| **Customers** | | |
| POST | `/customers/` | Create customer |
| GET | `/customers/` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |
| **Orders** | | |
| POST | `/orders/` | Create order |
| GET | `/orders/` | List all orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |
| **Dashboard** | | |
| GET | `/dashboard/stats` | KPIs + charts data |

Interactive docs: `/docs` (Swagger UI)

---

## Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot be negative
- ✅ Orders rejected if stock is insufficient
- ✅ Stock automatically reduced on order creation
- ✅ Stock restored when order is cancelled
- ✅ Total order amount calculated automatically by backend
- ✅ All APIs return proper HTTP status codes (200, 201, 204, 400, 404, 422)
- ✅ All request data validated via Pydantic before processing

---

## Deployment

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin master
```

### 2. Backend → Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database on Render (free tier)
7. Add environment variable: `DATABASE_URL` → use the Internal Database URL from Render Postgres
8. Deploy — note your backend URL e.g. `https://inventory-backend.onrender.com`

### 3. Backend → Docker Hub

```bash
# Build image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Push to Docker Hub
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

### 4. Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
7. Deploy — note your frontend URL

### 5. Frontend → Netlify (alternative)

1. Go to https://netlify.com → Add new site → Import from Git
2. Set **Base directory**: `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
6. Deploy

---

## Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | App secret key | any random string |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://inventory-backend.onrender.com` |
