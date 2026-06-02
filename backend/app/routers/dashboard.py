from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app import models, schemas
from app.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


class OrderTrend(BaseModel):
    date: str
    orders: int
    revenue: float


class TopProduct(BaseModel):
    name: str
    total_sold: int


class DashboardFull(schemas.DashboardStats):
    total_revenue: float
    order_trends: List[OrderTrend]
    top_products: List[TopProduct]
    inventory_summary: List[dict]


@router.get("/stats", response_model=DashboardFull)
def get_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0

    low_stock = db.query(models.Product).filter(
        models.Product.quantity <= LOW_STOCK_THRESHOLD
    ).all()

    # Order trends — last 7 orders grouped by date
    orders = db.query(models.Order).order_by(models.Order.created_at).all()
    trend_map = {}
    for o in orders:
        day = o.created_at.strftime("%b %d") if o.created_at else "Unknown"
        if day not in trend_map:
            trend_map[day] = {"orders": 0, "revenue": 0.0}
        trend_map[day]["orders"] += 1
        trend_map[day]["revenue"] += o.total_amount
    order_trends = [
        OrderTrend(date=k, orders=v["orders"], revenue=round(v["revenue"], 2))
        for k, v in list(trend_map.items())[-7:]
    ]

    # Top 5 products by quantity sold
    top_raw = (
        db.query(models.Product.name, func.sum(models.OrderItem.quantity).label("total_sold"))
        .join(models.OrderItem, models.OrderItem.product_id == models.Product.id)
        .group_by(models.Product.name)
        .order_by(func.sum(models.OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [TopProduct(name=r[0], total_sold=r[1]) for r in top_raw]

    # Inventory summary for pie chart
    out_of_stock = db.query(models.Product).filter(models.Product.quantity == 0).count()
    low = db.query(models.Product).filter(
        models.Product.quantity > 0, models.Product.quantity <= LOW_STOCK_THRESHOLD
    ).count()
    healthy = db.query(models.Product).filter(models.Product.quantity > LOW_STOCK_THRESHOLD).count()
    inventory_summary = [
        {"name": "Healthy Stock", "value": healthy},
        {"name": "Low Stock", "value": low},
        {"name": "Out of Stock", "value": out_of_stock},
    ]

    return DashboardFull(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        low_stock_products=low_stock,
        order_trends=order_trends,
        top_products=top_products,
        inventory_summary=inventory_summary,
    )
