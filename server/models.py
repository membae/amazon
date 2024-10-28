from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

# Users Table
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    serialize_only = ('id', 'name', 'email', 'address', 'phone_number', 'role', 'balance')  # Added 'balance' for serialization
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    phone_number = db.Column(db.String(15), nullable=True)
    # balance = db.Column(db.Float, default=0.0)
    role = db.Column(db.String(50), nullable=False, default='customer')  # 'admin' or 'customer'

    orders = db.relationship('Order', back_populates='user', lazy=True)
    reviews = db.relationship('Review', back_populates='user', lazy=True)
    shopping_cart = db.relationship('ShoppingCart', back_populates='user', lazy=True)
    balance = db.relationship('Balance', back_populates='user', uselist=False)  # One-to-One relationship with Balance

# Balance Table
class Balance(db.Model, SerializerMixin):
    __tablename__ = 'balances'
    serialize_only = ('user_id', 'amount')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)  # Initial balance is 0.0

    user = db.relationship('User', back_populates='balance')

# Categories Table
class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'
    serialize_only = ('id', 'name', 'description', 'level', 'parent_id')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    level = db.Column(db.String(50), nullable=False)  # VIP1, VIP2, VIP3
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    parent = db.relationship('Category', remote_side=[id], backref='subcategories', lazy=True)
    products = db.relationship('Product', back_populates='category', lazy=True)

# Products Table
# Products Table
class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'
    serialize_only = ('id', 'name', 'description', 'price', 'stock', 'category_id', 'brand', 'image_url', 'commission')  # Include 'commission' for serialization

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    commission = db.Column(db.Float, nullable=False, default=0.0)  # New commission column

    category = db.relationship('Category', back_populates='products')
    order_items = db.relationship('OrderItem', back_populates='product', lazy=True)
    reviews = db.relationship('Review', back_populates='product', lazy=True)
    cart_items = db.relationship('ShoppingCart', back_populates='product', lazy=True)

# Orders Table
class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'
    serialize_only = ('id', 'user_id', 'order_status', 'total_amount', 'shipping_address', 'payment_method')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_status = db.Column(db.String(50), nullable=False, default='Pending')  # e.g., Pending, Shipped, Delivered
    total_amount = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.String(255), nullable=True)
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., Credit Card, PayPal

    user = db.relationship('User', back_populates='orders')
    order_items = db.relationship('OrderItem', back_populates='order', lazy=True)
    payment = db.relationship('Payment', back_populates='order', lazy=True)

# Order_Items Table
class OrderItem(db.Model, SerializerMixin):
    __tablename__ = 'order_items'
    serialize_only = ('id', 'order_id', 'product_id', 'quantity', 'price_at_purchase', 'total_price')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    order = db.relationship('Order', back_populates='order_items')
    product = db.relationship('Product', back_populates='order_items')

# Payments Table
class Payment(db.Model, SerializerMixin):
    __tablename__ = 'payments'
    serialize_only = ('id', 'order_id', 'payment_status', 'payment_method', 'total_amount', 'transaction_id')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    payment_status = db.Column(db.String(50), nullable=False, default='Pending')  # e.g., Pending, Completed, Failed
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., Credit Card, PayPal
    total_amount = db.Column(db.Float, nullable=False)
    transaction_id = db.Column(db.String(255), unique=True, nullable=True)

    order = db.relationship('Order', back_populates='payment')

# Shopping_Cart Table
class ShoppingCart(db.Model, SerializerMixin):
    __tablename__ = 'shopping_cart'
    serialize_only = ('id', 'user_id', 'product_id', 'quantity')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    user = db.relationship('User', back_populates='shopping_cart')
    product = db.relationship('Product', back_populates='cart_items')

# Reviews Table
class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'
    serialize_only = ('id', 'product_id', 'user_id', 'rating', 'comment')  # Fields to serialize

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)

    product = db.relationship('Product', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')
