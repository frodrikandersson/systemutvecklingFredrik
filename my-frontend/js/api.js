const BASE_URL = 'http://localhost:4000/'; // adjust if needed

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
}

export async function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(p => p.product_id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product_id: productId, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

export async function getCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return { products: cart };
}

export async function checkout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: "your-user-id",
      products: cart,
      status: "Pending",
      shipping_address: {
        street: "123 Fake St",
        city: "Testville",
        state: "Nowhere",
        zip: "00000"
      }
    })
  });
  localStorage.removeItem('cart');
}

export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
}

export async function updateProduct(id, data) {
  await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}