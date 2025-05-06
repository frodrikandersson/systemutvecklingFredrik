const BASE_URL = 'http://localhost:4000';

async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
}

function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;

  const totalRating = ratings.reduce((acc, review) => acc + review.rating, 0);
  return (totalRating / ratings.length).toFixed(1); 
}

function addToCart(productId, quantity) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(p => p.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product_id: productId, quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${quantity} item(s) added to cart`);
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const avgRating = calculateAverageRating(product.ratings);

  card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}" class="product-image">
    <h3>${product.name}</h3>
    <p><strong>Price:</strong> $${product.price}</p>
    <p><strong>Stock:</strong> ${product.stock}</p>
    <p><strong>Rating:</strong> ${avgRating} / 5</p>
    <div class="quantity-controls">
      <button class="decrease">-</button>
      <input type="number" min="1" value="1" class="quantity-input">
      <button class="increase">+</button>
    </div>
    <button class="add-to-cart">Add to Cart</button>
  `;

  const input = card.querySelector('.quantity-input');
  const decreaseBtn = card.querySelector('.decrease');
  const increaseBtn = card.querySelector('.increase');
  const addBtn = card.querySelector('.add-to-cart');

  decreaseBtn.addEventListener('click', () => {
    let value = parseInt(input.value);
    if (value > 1) input.value = value - 1;
  });

  increaseBtn.addEventListener('click', () => {
    let value = parseInt(input.value);
    if (value < product.stock) input.value = value + 1;
  });

  addBtn.addEventListener('click', () => {
    const quantity = parseInt(input.value);
    if (quantity <= 0 || quantity > product.stock) {
      alert('Invalid quantity');
    } else {
      addToCart(product._id, quantity);
    }
  });

  return card;
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('product-list');
  const products = await fetchProducts();
  products.forEach(product => {
    container.appendChild(createProductCard(product));
  });
});