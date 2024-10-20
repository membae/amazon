#!/usr/bin/env python3

from app import app
from models import db, User, Category, Product, Order, OrderItem, Payment, ShoppingCart, Review

with app.app_context():

    # This will delete any existing rows
    # so you can run the seed file multiple times without having duplicate entries in your database
    print("Deleting data...")
    db.drop_all()  # Optionally drop all tables
    db.create_all()  # Recreate all tables

    print("Creating users...")
    user1 = User(name="John Doe", email="john@example.com", password="hashedpassword", role="customer")
    user2 = User(name="Jane Smith", email="jane@example.com", password="hashedpassword", role="admin")
    users = [user1, user2]

    print("Creating categories...")
    category1 = Category(name="Electronics", description="Devices and gadgets", level="VIP1")
    category2 = Category(name="Clothing", description="Apparel and accessories", level="VIP2")
    categories = [category1, category2]

    print("Creating products...")
    product1 = Product(name="Smartphone", description="Latest model smartphone", price=699.99, stock=100, category=category1)
    product2 = Product(name="Laptop", description="High-performance laptop", price=1299.99, stock=50, category=category1)
    product3 = Product(name="T-Shirt", description="Cotton t-shirt", price=19.99, stock=200, category=category2)
    products = [product1, product2, product3]

    print("Creating orders...")
    order1 = Order(user=user1, order_status="Pending", total_amount=719.99, shipping_address="123 Main St", payment_method="Credit Card")
    orders = [order1]

    print("Creating order items...")
    order_item1 = OrderItem(order=order1, product=product1, quantity=1, price_at_purchase=product1.price, total_price=product1.price)
    order_item2 = OrderItem(order=order1, product=product3, quantity=1, price_at_purchase=product3.price, total_price=product3.price)
    order_items = [order_item1, order_item2]

    print("Creating payments...")
    payment1 = Payment(order=order1, payment_status="Completed", payment_method="Credit Card", total_amount=order1.total_amount)
    payments = [payment1]

    print("Creating shopping cart...")
    shopping_cart_item1 = ShoppingCart(user=user1, product=product2, quantity=1)
    shopping_cart_items = [shopping_cart_item1]

    print("Creating reviews...")
    review1 = Review(product=product1, user=user1, rating=5, comment="Excellent phone!")
    reviews = [review1]

    db.session.add_all(users)
    db.session.add_all(categories)
    db.session.add_all(products)
    db.session.add_all(orders)
    db.session.add_all(order_items)
    db.session.add_all(payments)
    db.session.add_all(shopping_cart_items)
    db.session.add_all(reviews)
    db.session.commit()

    print("Seeding done!")
