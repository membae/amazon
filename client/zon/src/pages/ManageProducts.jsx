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
  const [isHovered, setIsHovered] = useState(false);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch('https://amazon-cp0v.onrender.com/products');
      const data = await response.json();
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
      await fetch(`https://amazon-cp0v.onrender.com/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('https://amazon-cp0v.onrender.com/products', {
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
    const response = await fetch('https://amazon-cp0v.onrender.com/products');
    const data = await response.json();
    setProducts(data);
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    await fetch(`https://amazon-cp0v.onrender.com/products/${id}`, {
      method: 'DELETE',
    });
    setProducts(products.filter(product => product.id !== id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Manage Products</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          required
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Price"
          step="0.01"
          required
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
          placeholder="Stock"
          required
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          placeholder="Category ID"
          required
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          placeholder="Brand"
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleInputChange}
          placeholder="Image URL"
          style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          name="commission"
          value={formData.commission}
          onChange={handleInputChange}
          placeholder="Commission"
          step="0.01"
          required
          style={{ marginBottom: '20px', display: 'block', width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: isHovered ? '#45a049' : '#4caf50',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            width: '100%',
            fontWeight: 'bold'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {editProduct ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      <h2>Existing Products</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Stock</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Category ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Brand</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Image</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Commission</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.description}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.price}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.stock}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.category_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.brand}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}><img src={product.image_url} alt={product.name} style={{ maxWidth: '50px' }} /></td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.commission}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => handleEdit(product)} style={{ marginRight: '5px', backgroundColor: '#008cba', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(product.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageProducts;
