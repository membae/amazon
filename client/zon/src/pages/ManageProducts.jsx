import React, { useEffect, useState } from 'react';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    brand: '',
    image_url: '',
    commission: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5555/products'); // Corrected endpoint
      const data = await response.json();
      console.log(data); // Check the data structure
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle product editing
  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData(product);
  };

  // Handle form submission for adding/updating products
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editProduct) {
      await fetch(`http://127.0.0.1:5555/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('http://127.0.0.1:5555/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    // Clear form and refresh products
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      brand: '',
      image_url: '',
      commission: ''
    });
    setEditProduct(null);
    const response = await fetch('http://127.0.0.1:5555/products');
    const data = await response.json();
    setProducts(data);
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5555/products/${id}`, {
      method: 'DELETE',
    });
    setProducts(products.filter(product => product.id !== id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Manage Products</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Price"
          step="0.01"
          required
        />
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
          placeholder="Stock"
          required
        />
        <input
          type="text"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          placeholder="Category ID"
          required
        />
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          placeholder="Brand"
        />
        <input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleInputChange}
          placeholder="Image URL"
        />
        <input
          type="number"
          name="commission"
          value={formData.commission}
          onChange={handleInputChange}
          placeholder="Commission"
          step="0.01"
          required
        />
        <button type="submit">{editProduct ? 'Update Product' : 'Add Product'}</button>
      </form>

      <h2>Existing Products</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category ID</th>
            <th>Brand</th>
            <th>Image URL</th>
            <th>Commission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.category_id}</td>
              <td>{product.brand}</td>
              <td><img src={product.image_url} alt={product.name} width="50" /></td>
              <td>${product.commission}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageProducts;
