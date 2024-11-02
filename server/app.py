from models import db,User,Category,Product,Order,OrderItem,Payment,ShoppingCart,Review,Balance
from flask_migrate import Migrate
from flask import Flask, request, make_response,jsonify,session
from flask_restful import Api, Resource
import os
from werkzeug.security import generate_password_hash
from flask_cors import CORS
from werkzeug.security import check_password_hash,generate_password_hash




BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.environ.get(
    "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

migrate = Migrate(app, db)

db.init_app(app)



from flask_mail import Mail, Message

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # or your email server
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Your email
app.config['MAIL_PASSWORD'] = 'your-email-password'   # Your email password or app password
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'  # Default sender email

mail = Mail(app)





#register
from werkzeug.security import generate_password_hash

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate user data
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"message": "All fields are required."}), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "Email already exists."}), 400
    
    # Hash the password using 'pbkdf2:sha256'
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        address=data.get('address'),
        phone_number=data.get('phone_number'),
        role=data.get('role', 'customer')  # Default to 'customer'
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

#login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid email or password."}), 401
    
    # Store user information in session
    session['user_id'] = user.id
    session['user_name'] = user.name
    session['user_email'] = user.email
    session['user_role'] = user.role

    return jsonify({"message": "Login successful!", "user": {"id": user.id, "name": user.name}}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear the session
    return jsonify({"message": "Logout successful!"}), 200

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in."}), 401

    user_id = session['user_id']
    user_name = session['user_name']
    return jsonify({"id": user_id, "name": user_name})


# Get all users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()  # Query all users
        user_data = []
        
        for user in users:
            user_info = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'balance': user.balance.amount if user.balance else 0.0 , # Access balance amount
                "total_earnings ": user.total_earnings  or 0 
            }
            user_data.append(user_info)

        return jsonify(user_data), 200  # Return the user data as JSON
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Return an error message if something goes wrong



# @app.route('/users', methods=['GET'])
# def get_current_user():
#     # Ensure the user is logged in and has a valid session
#     user_id = session.get('user_id')  # Assuming you store user ID in session
#     if user_id is None:
#         return jsonify({"error": "User not logged in"}), 401

#     user = User.query.get(user_id)
#     if user is None:
#         return jsonify({"error": "User not found"}), 404
    
#     return jsonify(user.to_dict()), 200


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
        user.password = generate_password_hash(data['password'])  # Hash the new password
    if 'address' in data:
        user.address = data['address']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'role' in data:
        user.role = data['role']
    if 'balance' in data:
        # Assuming balance is a one-to-one relationship with the user
        if user.balance:
            user.balance.amount = data['balance']  # Update existing balance
        else:
            # Create a new balance entry if it doesn't exist
            new_balance = Balance(user_id=user.id, amount=data['balance'])
            db.session.add(new_balance)

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


@app.route('/users/<int:user_id>/balance', methods=['GET'])
def get_user_balance(user_id):
    """Get the balance for a specific user by user ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    balance = user.balance
    if not balance:
        return jsonify({'message': 'Balance not found'}), 404

    return jsonify({
        'user_id': user.id,
        'balance': balance.amount
    }), 200

# # Alternative route to get balance by email
# @app.route('/api/user/balance', methods=['GET'])
# def get_balance_by_email():
#     """Get the balance for a specific user by email."""
#     email = request.args.get('email')
#     if not email:
#         return jsonify({'message': 'Email is required'}), 400

#     user = User.query.filter_by(email=email).first()
#     if not user:
#         return jsonify({'message': 'User not found'}), 404

#     balance = user.balance
#     if not balance:
#         return jsonify({'message': 'Balance not found'}), 404

#     return jsonify({
#         'user_id': user.id,
#         'balance': balance.amount
#     }), 200

@app.route('/users/<int:user_id>/balance', methods=['POST'])
def create_user_balance(user_id):
    """Create a balance for a specific user by user ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Get the amount from the request body
    data = request.get_json()
    if not data or 'amount' not in data:
        return jsonify({'message': 'Amount is required'}), 400

    amount = data['amount']

    # Create a new balance
    new_balance = Balance(user_id=user.id, amount=amount)
    db.session.add(new_balance)
    db.session.commit()

    return jsonify({
        'message': 'Balance created successfully',
        'user_id': user.id,
        'balance': new_balance.amount
    }), 201

@app.route('/users/<int:user_id>/balance', methods=['PATCH'])
def update_user_balance(user_id):
    """Update the balance for a specific user by user ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Get the new amount from the request body
    data = request.get_json()
    if not data or 'amount' not in data:
        return jsonify({'message': 'Amount is required'}), 400

    new_amount = data['amount']

    # Ensure new_amount is a valid number and not negative
    if not isinstance(new_amount, (int, float)) or new_amount < 0:
        return jsonify({'message': 'Invalid amount'}), 400

    # Check if the user has a balance entry
    if user.balance:
        user.balance.amount = new_amount  # Update the existing balance amount
    else:
        # Create a new balance entry if it doesn't exist
        user.balance = Balance(amount=new_amount, user_id=user.id)
    
    db.session.commit()

    return jsonify({
        'message': 'Balance updated successfully',
        'user_id': user.id,
        'balance': user.balance.amount  # Use user.balance to get the updated value
    }), 200

# @app.route('/users/<int:user_id>/update-earnings', methods=['PATCH'])
# def update_earnings(user_id):
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({"message": "User not found"}), 404

#     commission_amount = request.json.get('commission_amount', 0.0)
#     user.total_earnings += commission_amount  # Update the earnings
    
#     db.session.commit()  # Save changes to the database
#     return jsonify({"total_earnings": user.total_earnings}), 200
@app.route('/users/<int:user_id>/update-earnings', methods=['PATCH'])
def update_earnings(user_id):
    data = request.get_json()
    commission = data.get('commission')

    # Fetch the user from the database
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Increment the user's total earnings by the commission amount
    user.total_earnings += commission
    db.session.commit()

    return jsonify({'message': 'Total earnings updated successfully', 'total_earnings': user.total_earnings}), 200






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
        stock=data['stock'],
        category_id=data['category_id'],
        commission=data['commission']  # Assuming it has a foreign key relationship with Category
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
    if 'commission' in data:
        product.commission = data['commission']

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
    if 'commission' in data:
        product.commission = data['commission']

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
# @app.route('/orders', methods=['GET'])
# def get_orders():
#     orders = Order.query.all()
#     return jsonify([order.to_dict() for order in orders]), 200

# 2. Get a specific order by ID
@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order is None:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict()), 200


# Fetch all orders for the logged-in user
@app.route('/orders/<int:user_id>', methods=['GET'])
def get_orders_by_user(user_id):
    # Query for orders by user_id
    orders = Order.query.filter_by(user_id=user_id).all()  # Assuming 'user_id' is the foreign key in your Order model

    # Check if orders exist for the user
    if not orders:
        return jsonify({"error": "No orders found for this user."}), 404

    # Serialize orders into a list of dictionaries
    orders_list = [order.to_dict() for order in orders]  # Assuming you have a to_dict method in your Order model

    return jsonify(orders_list), 200
@app.route('/orders/<int:user_id>', methods=['POST'])
def create_user_order(user_id):
    # Check if the user exists
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Get the JSON data from the request
    data = request.get_json()

    # Validate incoming data
    if 'order_items' not in data or not isinstance(data['order_items'], list):
        return jsonify({"error": "Missing or invalid order items"}), 400

    # Create a new Order instance
    new_order = Order(
        user_id=user.id,
        total_amount=0,  # This will be calculated based on the order items
        shipping_address=data.get('shipping_address'),  # Optional field
        payment_method=data['payment_method'],  # Required field
    )

    total_amount = 0  # Initialize total amount for the order

    # Loop through order items to create OrderItem instances
    for item in data['order_items']:
        if not all(key in item for key in ['product_id', 'quantity', 'price_at_purchase']):
            return jsonify({"error": "Missing required fields in order items"}), 400
        
        # Create an OrderItem instance
        order_item = OrderItem(
            order=new_order,  # Set the relationship
            product_id=item['product_id'],
            quantity=item['quantity'],
            price_at_purchase=item['price_at_purchase'],
            total_price=item['quantity'] * item['price_at_purchase']  # Calculate total price
        )
        
        # Add to the order items list
        new_order.order_items.append(order_item)

        # Update total amount for the order
        total_amount += order_item.total_price

    # Set the total amount for the order
    new_order.total_amount = total_amount

    # Add the new order to the session and commit to the database
    db.session.add(new_order)
    db.session.commit()

    return jsonify(new_order.to_dict()), 201  # Return the created order with a 201 status





@app.route('/orders', methods=['GET'])
def get_orders():
    # Get the user ID from the cookies
    user_id = request.cookies.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID not found"}), 401

    # Fetch the orders for the logged-in user
    orders = Order.query.filter_by(user_id=user_id).all()

    if not orders:
        return jsonify({"message": "No orders found for this user"}), 404

    # Convert orders to dictionary format
    orders_dict = [order.to_dict() for order in orders]
    
    return jsonify({"orders": orders_dict}), 200

# Add a product to the cart (order)
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    user_id = request.cookies.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID not found"}), 401

    data = request.get_json()

    # Assume data contains 'product_id' and 'quantity'
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not product_id or not quantity:
        return jsonify({"error": "Product ID and quantity are required"}), 400

    # Add the product to the user's cart (this could be a separate Cart model or an Order with a 'cart' status)
    new_order = Order(user_id=user_id, product_id=product_id, quantity=quantity, status='cart')
    db.session.add(new_order)
    db.session.commit()

    return jsonify({"message": "Product added to cart"}), 201



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
# Get all orders for a specific user
@app.route('/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Fetch all orders for the user
    orders = Order.query.filter_by(user_id=user_id).all()
    if not orders:
        return jsonify({"message": "No orders found for this user"}), 200

    # Return the list of orders as JSON
    return jsonify([order.to_dict() for order in orders]), 200

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
def add_newitem_to_cart(user_id):
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