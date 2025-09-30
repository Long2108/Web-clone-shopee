// Utilities from data.js are available globally in this simple setup

const dom = {
	searchForm: document.getElementById('searchForm'),
	searchInput: document.getElementById('searchInput'),
	categoryFilter: document.getElementById('categoryFilter'),
	sortSelect: document.getElementById('sortSelect'),
	grid: document.getElementById('productGrid'),
	cartButton: document.getElementById('cartButton'),
	cartDrawer: document.getElementById('cartDrawer'),
	closeCart: document.getElementById('closeCart'),
	cartItems: document.getElementById('cartItems'),
	cartSubtotal: document.getElementById('cartSubtotal'),
	cartCount: document.getElementById('cartCount'),
	checkoutButton: document.getElementById('checkoutButton'),
	checkoutSection: document.getElementById('checkoutSection'),
	cancelCheckout: document.getElementById('cancelCheckout'),
	checkoutForm: document.getElementById('checkoutForm'),
	orderResult: document.getElementById('orderResult'),
	sellLink: document.getElementById('sellLink'),
	sellSection: document.getElementById('sell'),
	sellForm: document.getElementById('sellForm'),
	sellTitle: document.getElementById('sellTitle'),
	sellPrice: document.getElementById('sellPrice'),
	sellCategory: document.getElementById('sellCategory'),
	sellImage: document.getElementById('sellImage'),
	sellDescription: document.getElementById('sellDescription'),
	year: document.getElementById('year'),
	categoriesList: document.getElementById('categoriesList')
};

const state = {
	query: '',
	category: '',
	sort: 'popular'
};

function formatPrice(number){
	return `$${number.toFixed(2)}`;
}

function uniqueCategories(products){
	return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
}

function computeSorted(products){
	const items = products.slice();
	switch(state.sort){
		case 'price-asc': items.sort((a,b)=>a.price-b.price); break;
		case 'price-desc': items.sort((a,b)=>b.price-a.price); break;
		case 'newest': items.sort((a,b)=>b.createdAt-a.createdAt); break;
		default: items.sort((a,b)=>b.popularity-a.popularity); break;
	}
	return items;
}

function computeFiltered(products){
	const q = state.query.trim().toLowerCase();
	return products.filter(p => {
		const matchQuery = !q || (
			p.title.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q)
		);
		const matchCategory = !state.category || p.category === state.category;
		return matchQuery && matchCategory;
	});
}

function renderCategories(products){
	const cats = uniqueCategories(products);
	dom.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
		cats.map(c=>`<option value="${c}">${c}</option>`).join('');
	// datalist for seller form
	dom.categoriesList.innerHTML = cats.map(c=>`<option value="${c}"></option>`).join('');
}

function productCardHTML(p){
	const safeImg = p.image || 'https://via.placeholder.com/600x400?text=No+Image';
	return `
		<article class="card" data-id="${p.id}">
			<div class="thumb"><img src="${safeImg}" alt="${p.title}"></div>
			<div class="body">
				<h3 class="title">${p.title}</h3>
				<div class="price">${formatPrice(p.price)}</div>
				<div class="meta">${p.category || 'General'}</div>
				<div class="cta">
					<button class="button primary" data-action="add-to-cart">Add to Cart</button>
					<button class="button" data-action="buy-now">Buy Now</button>
				</div>
			</div>
		</article>`;
}

function renderGrid(){
	const products = getAllProducts();
	const filtered = computeFiltered(products);
	const sorted = computeSorted(filtered);
	dom.grid.innerHTML = sorted.map(productCardHTML).join('');
}

function renderCart(){
	const cart = getCart();
	let subtotal = 0;
	dom.cartItems.innerHTML = cart.map(item => {
		subtotal += item.price * item.quantity;
		return `
			<div class="cart-item" data-id="${item.id}">
				<img src="${item.image}" alt="${item.title}" width="64" height="64">
				<div>
					<div>${item.title}</div>
					<div class="sub">${formatPrice(item.price)}</div>
				</div>
				<div class="qty">
					<button data-action="dec">−</button>
					<span>${item.quantity}</span>
					<button data-action="inc">+</button>
					<button data-action="remove" title="Remove" style="margin-left:.5rem">🗑</button>
				</div>
			</div>`;
	}).join('');
	dom.cartSubtotal.textContent = formatPrice(subtotal);
	dom.cartCount.textContent = cart.reduce((n,i)=>n+i.quantity,0);
}

function addToCart(productId, quantity = 1){
	const all = getAllProducts();
	const product = all.find(p => p.id === productId);
	if(!product) return;
	const cart = getCart();
	const existing = cart.find(i => i.id === productId);
	if(existing){ existing.quantity += quantity; }
	else { cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity }); }
	setCart(cart);
	renderCart();
}

function updateCartItem(productId, action){
	let cart = getCart();
	const item = cart.find(i => i.id === productId);
	if(!item) return;
	if(action === 'inc') item.quantity += 1;
	if(action === 'dec') item.quantity = Math.max(1, item.quantity - 1);
	if(action === 'remove') cart = cart.filter(i => i.id !== productId);
	setCart(cart);
	renderCart();
}

function openCart(){ dom.cartDrawer.hidden = false; }
function closeCart(){ dom.cartDrawer.hidden = true; }

function startCheckout(){
	closeCart();
	dom.checkoutSection.hidden = false;
	window.scrollTo({ top: dom.checkoutSection.offsetTop - 20, behavior: 'smooth' });
}
function cancelCheckout(){
	dom.checkoutSection.hidden = true;
}

function handleCheckoutSubmit(e){
	e.preventDefault();
	const cart = getCart();
	if(cart.length === 0){ alert('Your cart is empty.'); return; }
	const order = {
		id: 'ord-' + Date.now(),
		items: cart,
		total: cart.reduce((n,i)=>n+i.price*i.quantity,0),
		buyer: {
			name: dom.fullName?.value || document.getElementById('fullName').value,
			phone: document.getElementById('phone').value,
			address: document.getElementById('address').value,
			payment: document.getElementById('payment').value,
			notes: document.getElementById('notes').value
		}
	};
	setCart([]);
	renderCart();
	dom.orderResult.hidden = false;
	dom.orderResult.innerHTML = `Thank you, ${order.buyer.name}! Your order <strong>${order.id}</strong> totaling <strong>${formatPrice(order.total)}</strong> has been placed.`;
	setTimeout(()=>{ dom.checkoutSection.hidden = true; }, 2000);
}

function showSectionFromHash(){
	const hash = location.hash.replace('#','');
	if(hash === 'sell'){
		dom.sellSection.hidden = false;
		dom.checkoutSection.hidden = true;
	} else {
		dom.sellSection.hidden = true;
	}
}

function handleSellSubmit(e){
	e.preventDefault();
	const title = dom.sellTitle.value.trim();
	const price = parseFloat(dom.sellPrice.value);
	const category = dom.sellCategory.value.trim() || 'General';
	const image = dom.sellImage.value.trim();
	const description = dom.sellDescription.value.trim();
	if(!title || isNaN(price) || price < 0 || !description){
		alert('Please fill out all required fields with valid values.');
		return;
	}
	const id = 'u-' + Date.now();
	addUserProduct({ id, title, price, category, image, description, popularity: 50, createdAt: Date.now() });
	// Reset and navigate back to home
	dom.sellForm.reset();
	location.hash = '';
	renderCategories(getAllProducts());
	renderGrid();
	window.scrollTo({top:0,behavior:'smooth'});
}

function wireEvents(){
	// Header interactions
	dom.searchForm.addEventListener('submit', (e)=>{ e.preventDefault(); state.query = dom.searchInput.value; renderGrid(); });
	dom.categoryFilter.addEventListener('change', ()=>{ state.category = dom.categoryFilter.value; renderGrid(); });
	dom.sortSelect.addEventListener('change', ()=>{ state.sort = dom.sortSelect.value; renderGrid(); });

	// Product grid delegation
	dom.grid.addEventListener('click', (e)=>{
		const btn = e.target.closest('button'); if(!btn) return;
		const card = e.target.closest('.card'); if(!card) return;
		const id = card.getAttribute('data-id');
		if(btn.dataset.action === 'add-to-cart') addToCart(id,1);
		if(btn.dataset.action === 'buy-now'){ addToCart(id,1); openCart(); }
	});

	// Cart controls
	dom.cartButton.addEventListener('click', ()=>{ openCart(); });
	dom.closeCart.addEventListener('click', ()=>{ closeCart(); });
	dom.cartDrawer.addEventListener('click', (e)=>{
		const btn = e.target.closest('button'); if(!btn) return;
		const row = e.target.closest('.cart-item'); if(!row) return;
		const id = row.getAttribute('data-id');
		updateCartItem(id, btn.dataset.action);
	});
	dom.checkoutButton.addEventListener('click', ()=>{ startCheckout(); });
	dom.cancelCheckout.addEventListener('click', ()=>{ cancelCheckout(); });
	dom.checkoutForm.addEventListener('submit', handleCheckoutSubmit);

	// Sell form
	dom.sellForm.addEventListener('submit', handleSellSubmit);
	window.addEventListener('hashchange', showSectionFromHash);
}

function init(){
	dom.year.textContent = new Date().getFullYear();
	renderCategories(getAllProducts());
	renderGrid();
	renderCart();
	showSectionFromHash();
	wireEvents();
}

document.addEventListener('DOMContentLoaded', init);




