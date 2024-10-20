from models import db,User,Category,Product,Order,OrderItem,Payment,ShoppingCart,Review
from flask_migrate import Migrate
from flask import Flask, request, make_response,jsonify
from flask_restful import Api, Resource
import os
from werkzeug.security import generate_password_hash
from flask_cors import CORS

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.environ.get(
    "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"]) 
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

migrate = Migrate(app, db)

db.init_app(app)


# Get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Get a specific user by ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


# Create a new user
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()

    # Validate required fields
    if 'name' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields (name, email, password)"}), 400

    # Optional fields
    address = data.get('address')
    phone_number = data.get('phone_number')

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),  # Hash the password
        address=address,
        phone_number=phone_number,
        role=data['role']
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

# Partially edit a specific user by ID (PATCH)
@app.route('/users/<int:user_id>', methods=['PATCH'])
def patch_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # Update only the provided fields in the request
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.password = data['password']  # Add password hashing if necessary
    if 'address' in data:
        user.address = data['address']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'role' in data:
        user.role = data['role']

    db.session.commit()
    return jsonify(user.to_dict()), 200

# Delete a user by ID
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

#categories


# 1. Get all categories
@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories]), 200

# 2. Get a specific category by ID
@app.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get(category_id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404
    return jsonify(category.to_dict()), 200

# 3. Create a new category
@app.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    
    if 'name' not in data:
        return jsonify({"error": "Category name is required"}), 400

    new_category = Category(
        name=data['name'],
        description=data.get('description', '')  # Optional field
    )
    
    db.session.add(new_category)
    db.session.commit()
    
    return jsonify(new_category.to_dict()), 201

# 4. Edit a category (PUT)
@app.route('/categories/<int:category_id>', methods=['PUT'])
def edit_category(category_id):
    category = Category.query.get(category_id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404
    
    data = request.get_json()
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    
    db.session.commit()
    return jsonify(category.to_dict()), 200

# 5. Partially update a category (PATCH)
@app.route('/categories/<int:category_id>', methods=['PATCH'])
def patch_category(category_id):
    category = Category.query.get(category_id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404

    data = request.get_json()
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']

    db.session.commit()
    return jsonify(category.to_dict()), 200

# 6. Delete a category
@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = Category.query.get(category_id)
    if category is None:
        return jsonify({"error": "Category not found"}), 404
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({"message": "Category deleted successfully"}), 200


#products


# 1. Get all products
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

# 2. Get a specific product by ID
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.to_dict()), 200

# 3. Create a new product
@app.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    
    if 'name' not in data or 'price' not in data or 'category_id' not in data:
        return jsonify({"error": "Missing required fields (name, price, category_id)"}), 400

    new_product = Product(
        name=data['name'],
        description=data.get('description', ''),  # Optional
        price=data['price'],
        category_id=data['category_id']  # Assuming it has a foreign key relationship with Category
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify(new_product.to_dict()), 201

# 4. Edit a product (PUT)
@app.route('/products/<int:product_id>', methods=['PUT'])
def edit_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    
    data = request.get_json()

    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'category_id' in data:
        product.category_id = data['category_id']
    
    db.session.commit()
    return jsonify(product.to_dict()), 200

# 5. Partially update a product (PATCH)
@app.route('/products/<int:product_id>', methods=['PATCH'])
def patch_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'category_id' in data:
        product.category_id = data['category_id']

    db.session.commit()
    return jsonify(product.to_dict()), 200

# 6. Delete a product
@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({"message": "Product deleted successfully"}), 200





# ------------------------------
# Routes for Orders
# ------------------------------

# 1. Get all orders
@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders]), 200

# 2. Get a specific order by ID
@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict()), 200

# 3. Create a new order
@app.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    
    if 'user_id' not in data or 'status' not in data:
        return jsonify({"error": "Missing required fields (user_id, status)"}), 400

    new_order = Order(
        user_id=data['user_id'],
        status=data['status'],
        total=data.get('total', 0)  # Optional total, can be calculated later
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify(new_order.to_dict()), 201

# 4. Edit an order (PUT)
@app.route('/orders/<int:order_id>', methods=['PUT'])
def edit_order(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    data = request.get_json()
    if 'user_id' in data:
        order.user_id = data['user_id']
    if 'status' in data:
        order.status = data['status']
    if 'total' in data:
        order.total = data['total']
    
    db.session.commit()
    return jsonify(order.to_dict()), 200

# 5. Partially update an order (PATCH)
@app.route('/orders/<int:order_id>', methods=['PATCH'])
def patch_order(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    if 'status' in data:
        order.status = data['status']
    if 'total' in data:
        order.total = data['total']

    db.session.commit()
    return jsonify(order.to_dict()), 200

# 6. Delete an order
@app.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({"message": "Order deleted successfully"}), 200


# ------------------------------
# Routes for Order Items
# ------------------------------

# 1. Get all items for a specific order
@app.route('/orders/<int:order_id>/items', methods=['GET'])
def get_order_items(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    items = OrderItem.query.filter_by(order_id=order_id).all()
    return jsonify([item.to_dict() for item in items]), 200

# 2. Add a new item to an order
@app.route('/orders/<int:order_id>/items', methods=['POST'])
def add_order_item(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    if 'product_id' not in data or 'quantity' not in data or 'price' not in data:
        return jsonify({"error": "Missing required fields (product_id, quantity, price)"}), 400

    new_item = OrderItem(
        order_id=order_id,
        product_id=data['product_id'],
        quantity=data['quantity'],
        price=data['price']
    )
    
    db.session.add(new_item)
    db.session.commit()

    # Optionally update the order total
    order.total += new_item.price * new_item.quantity
    db.session.commit()
    
    return jsonify(new_item.to_dict()), 201

# 3. Edit an item in an order (PUT)
@app.route('/orders/<int:order_id>/items/<int:item_id>', methods=['PUT'])
def edit_order_item(order_id, item_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    item = OrderItem.query.get(item_id)
    if item is None or item.order_id != order_id:
        return jsonify({"error": "Item not found in this order"}), 404
    
    data = request.get_json()
    if 'product_id' in data:
        item.product_id = data['product_id']
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'price' in data:
        item.price = data['price']
    
    db.session.commit()

    # Optionally recalculate the order total
    recalculate_order_total(order)
    
    return jsonify(item.to_dict()), 200

# 4. Partially update an item in an order (PATCH)
@app.route('/orders/<int:order_id>/items/<int:item_id>', methods=['PATCH'])
def patch_order_item(order_id, item_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    item = OrderItem.query.get(item_id)
    if item is None or item.order_id != order_id:
        return jsonify({"error": "Item not found in this order"}), 404
    
    data = request.get_json()
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'price' in data:
        item.price = data['price']
    
    db.session.commit()

    # Optionally recalculate the order total
    recalculate_order_total(order)
    
    return jsonify(item.to_dict()), 200

# 5. Remove an item from an order
@app.route('/orders/<int:order_id>/items/<int:item_id>', methods=['DELETE'])
def delete_order_item(order_id, item_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    
    item = OrderItem.query.get(item_id)
    if item is None or item.order_id != order_id:
        return jsonify({"error": "Item not found in this order"}), 404

    db.session.delete(item)
    db.session.commit()

    # Optionally recalculate the order total
    recalculate_order_total(order)
    
    return jsonify({"message": "Item deleted successfully"}), 200

# Utility to recalculate the total of the order
def recalculate_order_total(order):
    total = sum(item.price * item.quantity for item in order.items)
    order.total = total
    db.session.commit()

# ------------------------------
# Routes for Payments
# ------------------------------

# 1. Get all payments
@app.route('/payments', methods=['GET'])
def get_payments():
    payments = Payment.query.all()
    return jsonify([payment.to_dict() for payment in payments]), 200

# 2. Get a specific payment by ID
@app.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404
    return jsonify(payment.to_dict()), 200

# 3. Create a new payment
@app.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()

    if 'order_id' not in data or 'amount' not in data or 'method' not in data:
        return jsonify({"error": "Missing required fields (order_id, amount, method)"}), 400

    new_payment = Payment(
        order_id=data['order_id'],
        amount=data['amount'],
        method=data['method'],
        status=data.get('status', 'pending')  # Optional, default to 'pending'
    )
    
    db.session.add(new_payment)
    db.session.commit()

    return jsonify(new_payment.to_dict()), 201

# 4. Edit a payment (PUT)
@app.route('/payments/<int:payment_id>', methods=['PUT'])
def edit_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    data = request.get_json()
    if 'order_id' in data:
        payment.order_id = data['order_id']
    if 'amount' in data:
        payment.amount = data['amount']
    if 'method' in data:
        payment.method = data['method']
    if 'status' in data:
        payment.status = data['status']

    db.session.commit()
    return jsonify(payment.to_dict()), 200

# 5. Partially update a payment (PATCH)
@app.route('/payments/<int:payment_id>', methods=['PATCH'])
def patch_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    data = request.get_json()
    if 'status' in data:
        payment.status = data['status']

    db.session.commit()
    return jsonify(payment.to_dict()), 200

# 6. Delete a payment
@app.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment is None:
        return jsonify({"error": "Payment not found"}), 404
    
    db.session.delete(payment)
    db.session.commit()

    return jsonify({"message": "Payment deleted successfully"}), 200

# ------------------------------
# Routes for ShoppingCart
# ------------------------------

# 1. Get the shopping cart for a specific user
@app.route('/users/<int:user_id>/cart', methods=['GET'])
def get_shopping_cart(user_id):
    cart = ShoppingCart.query.filter_by(user_id=user_id).all()
    if not cart:
        return jsonify({"error": "Shopping cart is empty or user not found"}), 404
    return jsonify([item.to_dict() for item in cart]), 200

# 2. Add a product to the shopping cart
@app.route('/users/<int:user_id>/cart', methods=['POST'])
def add_to_cart(user_id):
    data = request.get_json()

    if 'product_id' not in data or 'quantity' not in data:
        return jsonify({"error": "Missing required fields (product_id, quantity)"}), 400

    new_cart_item = ShoppingCart(
        user_id=user_id,
        product_id=data['product_id'],
        quantity=data['quantity']
    )
    
    db.session.add(new_cart_item)
    db.session.commit()

    return jsonify(new_cart_item.to_dict()), 201

# 3. Edit a product in the shopping cart (PUT)
@app.route('/users/<int:user_id>/cart/<int:cart_item_id>', methods=['PUT'])
def edit_cart_item(user_id, cart_item_id):
    cart_item = ShoppingCart.query.get(cart_item_id)
    if cart_item is None or cart_item.user_id != user_id:
        return jsonify({"error": "Cart item not found"}), 404

    data = request.get_json()
    if 'product_id' in data:
        cart_item.product_id = data['product_id']
    if 'quantity' in data:
        cart_item.quantity = data['quantity']

    db.session.commit()
    return jsonify(cart_item.to_dict()), 200

# 4. Partially update a product in the shopping cart (PATCH)
@app.route('/users/<int:user_id>/cart/<int:cart_item_id>', methods=['PATCH'])
def patch_cart_item(user_id, cart_item_id):
    cart_item = ShoppingCart.query.get(cart_item_id)
    if cart_item is None or cart_item.user_id != user_id:
        return jsonify({"error": "Cart item not found"}), 404

    data = request.get_json()
    if 'quantity' in data:
        cart_item.quantity = data['quantity']

    db.session.commit()
    return jsonify(cart_item.to_dict()), 200

# 5. Remove a product from the shopping cart
@app.route('/users/<int:user_id>/cart/<int:cart_item_id>', methods=['DELETE'])
def remove_from_cart(user_id, cart_item_id):
    cart_item = ShoppingCart.query.get(cart_item_id)
    if cart_item is None or cart_item.user_id != user_id:
        return jsonify({"error": "Cart item not found"}), 404

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Item removed from cart"}), 200


# ------------------------------
# Routes for Reviews
# ------------------------------

# 1. Get all reviews for a product
@app.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).all()
    if not reviews:
        return jsonify({"message": "No reviews found for this product"}), 404
    return jsonify([review.to_dict() for review in reviews]), 200

# 2. Get a specific review by ID
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    review = Review.query.get(review_id)
    if review is None:
        return jsonify({"error": "Review not found"}), 404
    return jsonify(review.to_dict()), 200

# 3. Create a new review for a product
@app.route('/products/<int:product_id>/reviews', methods=['POST'])
def create_review(product_id):
    data = request.get_json()

    if 'user_id' not in data or 'rating' not in data or 'content' not in data:
        return jsonify({"error": "Missing required fields (user_id, rating, content)"}), 400

    new_review = Review(
        user_id=data['user_id'],
        product_id=product_id,
        rating=data['rating'],
        content=data['content']
    )
    
    db.session.add(new_review)
    db.session.commit()

    return jsonify(new_review.to_dict()), 201

# 4. Edit a review (PUT)
@app.route('/reviews/<int:review_id>', methods=['PUT'])
def edit_review(review_id):
    review = Review.query.get(review_id)
    if review is None:
        return jsonify({"error": "Review not found"}), 404

    data = request.get_json()
    if 'rating' in data:
        review.rating = data['rating']
    if 'content' in data:
        review.content = data['content']

    db.session.commit()
    return jsonify(review.to_dict()), 200

# 5. Partially update a review (PATCH)
@app.route('/reviews/<int:review_id>', methods=['PATCH'])
def patch_review(review_id):
    review = Review.query.get(review_id)
    if review is None:
        return jsonify({"error": "Review not found"}), 404

    data = request.get_json()
    if 'rating' in data:
        review.rating = data['rating']
    if 'content' in data:
        review.content = data['content']

    db.session.commit()
    return jsonify(review.to_dict()), 200

# 6. Delete a review
@app.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    review = Review.query.get(review_id)
    if review is None:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully"}), 200



if __name__ == '__main__':
    app.run(port=5555, debug=True)