#!/usr/bin/env python3

from app import app
from models import db, User, Category, Product, Order, OrderItem, Payment, ShoppingCart, Review

with app.app_context():

    # This will delete any existing rows so you can run the seed file multiple times without having duplicate entries in your database
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
    category3 = Category(name="Luxury", description="High-end items", level="VIP3")
    categories = [category1, category2, category3]

    print("Creating products...")

    # VIP1 products (cheapest)
    vip1_products = [
        Product(name=f"VIP1 Product {i}", description=f"Affordable VIP1 product {i}", price=10.99 + i, stock=100, category=category1)
        for i in range(1, 11)
    ]

    # VIP2 products (mid-range)
    vip2_products = [
        Product(name=f"VIP2 Product {i}", description=f"Mid-range VIP2 product {i}", price=50.99 + i * 2, stock=50, category=category2)
        for i in range(1, 11)
    ]

    # VIP3 products (expensive)
    vip3_products = [
        Product(name=f"VIP3 Product {i}", description=f"Premium VIP3 product {i}", price=500.99 + i * 10, stock=10, category=category3)
        for i in range(1, 11)
    ]

    products = vip1_products + vip2_products + vip3_products

    print("Creating orders...")
    order1 = Order(user=user1, order_status="Pending", total_amount=719.99, shipping_address="123 Main St", payment_method="Credit Card")
    orders = [order1]

    print("Creating order items...")
    order_item1 = OrderItem(order=order1, product=vip1_products[0], quantity=1, price_at_purchase=vip1_products[0].price, total_price=vip1_products[0].price)
    order_item2 = OrderItem(order=order1, product=vip2_products[0], quantity=1, price_at_purchase=vip2_products[0].price, total_price=vip2_products[0].price)
    order_items = [order_item1, order_item2]

    print("Creating payments...")
    payment1 = Payment(order=order1, payment_status="Completed", payment_method="Credit Card", total_amount=order1.total_amount)
    payments = [payment1]

    print("Creating shopping cart...")
    shopping_cart_item1 = ShoppingCart(user=user1, product=vip3_products[0], quantity=1)
    shopping_cart_items = [shopping_cart_item1]

    print("Creating reviews...")
    review1 = Review(product=vip1_products[0], user=user1, rating=5, comment="Great value for money!")
    review2 = Review(product=vip2_products[0], user=user2, rating=4, comment="Good quality for the price.")
    reviews = [review1, review2]

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
