from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    order_items = []

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        subtotal = product.price * item.quantity
        total_amount += subtotal
        order_items.append((product, item.quantity, product.price))

    # Create order
    db_order = models.Order(customer_id=order.customer_id, total_amount=round(total_amount, 2))
    db.add(db_order)
    db.flush()  # get db_order.id without committing

    for product, qty, unit_price in order_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price,
        )
        db.add(db_item)
        product.quantity -= qty  # reduce stock

    db.commit()
    db.refresh(db_order)

    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == db_order.id).first()


@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(
        joinedload(models.Order.customer),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(
        joinedload(models.Order.items)
    ).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
