const productList = document.getElementById('product-list');
const orderList = document.getElementById('order-list');
const API_BASE = 'http://localhost:4000'; 

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/Products`);
  const products = await res.json();

  productList.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <h3>${product.name}</h3>
      <label>Price:</label>
      <input type="number" value="${product.price}" class="price-input" />
      <label>Stock:</label>
      <input type="number" value="${product.stock}" class="stock-input" />
      <label>Description:</label>
      <textarea class="description-input">${product.description}</textarea>
      <label>Image URL:</label>
      <input type="text" value="${product.image_url}" class="image-url-input" />
      <label>Category:</label>
      <input type="text" value="${product.category}" class="category-input" />
      <button class="update-btn">Update</button>
    `;

    const updateBtn = card.querySelector('.update-btn');
    updateBtn.addEventListener('click', async () => {
      const updatedProduct = {
        name: product.name,
        price: parseFloat(card.querySelector('.price-input').value),
        stock: parseInt(card.querySelector('.stock-input').value),
        description: card.querySelector('.description-input').value,
        image_url: card.querySelector('.image-url-input').value,
        category: card.querySelector('.category-input').value
      };

      const response = await fetch(`${API_BASE}/Products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });

      if (response.ok) {
        alert('Product updated');
      } else {
        alert('Failed to update product');
      }
    });

    productList.appendChild(card);
  });
}

let categories = [];

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/Categories`);
  categories = await res.json(); 

  const categorySelect = document.getElementById('new-category');

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category._id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

async function fetchProducts() {
  await fetchCategories(); 

  const res = await fetch(`${API_BASE}/Products`);
  const products = await res.json();

  productList.innerHTML = ''; 
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-card';

    const currentCategoryIds = product.categories ? product.categories.map(catObj => catObj.category_id) : [];

    const categoryOptions = categories.map(cat => `
      <option value="${cat._id}" ${currentCategoryIds.includes(cat._id) ? 'selected' : ''}>
        ${cat.name}
      </option>
    `).join('');

    card.innerHTML = `
      <h3>
        <input type="text" value="${product.name}" class="name-input" />
      </h3>
      <label>Price:</label>
      <input type="number" value="${product.price}" class="price-input" />
      <label>Stock:</label>
      <input type="number" value="${product.stock}" class="stock-input" />
      <label>Description:</label>
      <textarea class="description-input">${product.description}</textarea>
      <label>Image URL:</label>
      <input type="text" value="${product.image_url}" class="image-url-input" />
      <label>Categories:</label>
      <select class="category-select" multiple>${categoryOptions}</select>
      <button class="update-btn">Update</button>
    `;

    const updateBtn = card.querySelector('.update-btn');
    updateBtn.addEventListener('click', async () => {
      const selectedOptions = Array.from(card.querySelector('.category-select').selectedOptions);
      const selectedCategoryIds = selectedOptions.map(opt => opt.value);

      const categoriesArray = selectedCategoryIds.map(id => ({ category_id: id }));

      const updatedProduct = {
        name: card.querySelector('.name-input').value.trim(), 
        price: parseFloat(card.querySelector('.price-input').value),
        stock: parseInt(card.querySelector('.stock-input').value),
        description: card.querySelector('.description-input').value,
        image_url: card.querySelector('.image-url-input').value,
        categories: categoriesArray
      };

      const response = await fetch(`${API_BASE}/Products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });

      if (response.ok) {
        alert('Product updated');
      } else {
        alert('Failed to update product');
      }
    });

    productList.appendChild(card);
  });
}

async function displayOrders() {
  const res = await fetch(`${API_BASE}/Orders`);
  const orders = await res.json();

  orderList.innerHTML = '';
  
  for (const order of orders) {
    const card = document.createElement('div');
    card.className = 'admin-card';

    let userDisplay = 'Unknown User';
    try {
      const userRes = await fetch(`${API_BASE}/Users/${order.user_id}`);
      const user = await userRes.json();
      userDisplay = `${user.first_name} ${user.last_name}`;
    } catch (err) {
      console.error('Error fetching user:', err);
    }

    const productList = await Promise.all(order.products.map(async (p) => {
      try {
        const productRes = await fetch(`${API_BASE}/Products/${p.product_id}`);
        const product = await productRes.json();
        return `<li>${product.name} (x${p.quantity})</li>`;
      } catch (err) {
        return `<li>Unknown Product (x${p.quantity})</li>`;
      }
    }));

    card.innerHTML = `
      <h3>Order ID: ${order._id}</h3>
      <p>Status: 
        <select data-id="${order._id}" class="order-status-dropdown">
          ${['Pending', 'Shipped', 'Delivered'].map(status => `
            <option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>
          `).join('')}
        </select>
      </p>
      <p><strong>User:</strong> ${userDisplay}</p>
      <p><strong>Shipping:</strong> ${order.shipping_address?.[0].street}, ${order.shipping_address?.[0].city}</p>
      <ul>${productList.join('')}</ul>
    `;

    const statusDropdown = card.querySelector('.order-status-dropdown');
    statusDropdown.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.id;
      const newStatus = e.target.value;

      try {
        const response = await fetch(`${API_BASE}/Orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          alert('Order status updated!');
        } else {
          alert('Failed to update status');
        }
      } catch (err) {
        alert('Error updating order status');
        console.error(err);
      }
    });

    orderList.appendChild(card);
  };
}

const createForm = document.getElementById('create-product-form');
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  await fetchCategories(); 

  const selectedOptions = Array.from(document.getElementById('new-category').selectedOptions);
  const selectedCategoryIds = selectedOptions.map(opt => opt.value);

  if (selectedCategoryIds.length === 0) {
    alert('Please select at least one category.');
    return;
  }

  const categoriesArray = selectedCategoryIds.map(id => ({ category_id: id }));

  const newProduct = {
    name: document.getElementById('new-name').value.trim(),
    price: parseFloat(document.getElementById('new-price').value),
    stock: parseInt(document.getElementById('new-stock').value),
    categories: categoriesArray, 
    image_url: document.getElementById('new-image-url').value.trim(),
    description: document.getElementById('new-description').value.trim()
  };

  console.log("New Product Data:", newProduct); 

  const response = await fetch(`${API_BASE}/Products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct)
  });

  if (response.ok) {
    alert('Product created!');
    createForm.reset();
    fetchProducts();
  } else {
    const error = await response.json();
    alert('Failed to create product: ' + (error?.error || 'Unknown error'));
  }
});

fetchProducts();
displayOrders(); 