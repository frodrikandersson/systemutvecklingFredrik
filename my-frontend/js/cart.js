const BASE_URL = 'http://localhost:4000';
const cartContainer = document.getElementById('cart-items');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

let userId = null;

async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/Products`);
  return res.json();
}

function updateCart(productId, newQty) {
  const item = cart.find(item => item.product_id === productId);
  if (item) {
    item.quantity = parseInt(newQty);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
}

async function renderCart() {
  const products = await fetchProducts();
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const product = products.find(p => p._id === item.product_id);
    if (!product) return;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}" width="60" />
      <span><strong>${product.name}</strong></span>
      <input type="number" min="1" value="${item.quantity}" data-id="${item.product_id}" />
      <button class="remove-btn" data-id="${item.product_id}">Remove</button>
    `;
    cartContainer.appendChild(div);
  });

  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const newQty = e.target.value;
      updateCart(id, newQty);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      removeFromCart(productId);
    });
  });
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.product_id === productId);
  if (index !== -1) {
    cart.splice(index, 1);  
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart(); 
  }
}

document.getElementById('check-email').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  if (!email) return alert('Please enter an email.');

  const res = await fetch(`${BASE_URL}/Users/email/${email}`);
  const userForm = document.getElementById('user-form');
  
  if (res.ok) {
    const user = await res.json();
    userId = user._id;

    document.getElementById('name').value = user.first_name + ' ' + user.last_name || '';
    document.getElementById('street').value = user.address?.street || '';
    document.getElementById('city').value = user.address?.city || '';
    document.getElementById('state').value = user.address?.state || '';
    document.getElementById('zip').value = user.address?.zip || '';
    
    userForm.style.display = 'block';
  } else {
    alert('No user found. Please fill in your details.');

    const userDetailsForm = document.getElementById('user-details-form');
    userDetailsForm.style.display = 'block';

    userForm.style.display = 'none';
  }
});

document.getElementById('add-user-btn').addEventListener('click', async () => {
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  if (!firstName || !lastName || !password || !email) {
    return alert('Please fill in all required fields.');
  }

  const userRes = await fetch(`${BASE_URL}/Users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password
    })
  });

  if (userRes.ok) {
    const userData = await userRes.json();
    userId = userData.id;

    document.getElementById('user-details-form').style.display = 'none';
    document.getElementById('user-form').style.display = 'block';

    document.getElementById('name').value = firstName + ' ' + lastName;
  } else {
    alert('Error creating user.');
  }
});

document.getElementById('purchase-btn').addEventListener('click', async () => {
  if (cart.length === 0) return alert('Your cart is empty.');

  const name = document.getElementById('name').value;
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zip = document.getElementById('zip').value;

  const email = document.getElementById('email').value;

  if (!email || !name || !street || !city || !state || !zip) {
    return alert('Please fill in all required fields.');
  }


  if (!userId) {
    const [firstName, lastName] = name.split(' ');

    const password = document.getElementById('password').value || 'defaultPassword123';
    
    if(!firstName || !lastName || !password) {
      return alert('Missing required user info. Please fill in name and password.');
    }

    const userRes = await fetch(`${BASE_URL}/Users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password
      })
    });

    if (!userRes.ok) {
      return alert('Failed to create user.');
    }

    const userData = await userRes.json();
    userId = userData._id;
  }

  const orderPayload = {
    user_id: userId, 
    products: cart.filter(item => item.product_id).map(item => ({
      product_id: item.product_id,  
      quantity: parseInt(item.quantity) 
    })),
    status: "Pending",
    shipping_address: [{
      street: street,
      city: city,
      state: state,
      zip: zip
    }]
  };

  const newUserAddressPayload = {
      street: street,
      city: city,
      state: state,
      zip: zip
  };

  const orderRes = await fetch(`${BASE_URL}/Orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!orderRes.ok) {
    return alert('Error placing order');
  }

  const userRes = await fetch(`${BASE_URL}/Users/${userId}/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUserAddressPayload)
  });

  if (!userRes.ok) {
    return alert('Error updating user address.');
  }

  localStorage.removeItem('cart');
  window.location.href = 'success.html';
});

renderCart();