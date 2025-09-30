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
	categoriesList: document.getElementById('categoriesList'),
	loginButton: document.getElementById('loginButton'),
	userMenu: document.getElementById('userMenu'),
	userName: document.getElementById('userName'),
	logoutButton: document.getElementById('logoutButton'),
	authDialog: document.getElementById('authDialog'),
	authForm: document.getElementById('authForm'),
	closeAuth: document.getElementById('closeAuth'),
    authTabs: document.querySelectorAll('#authDialog .tab'),
	authPanels: document.querySelectorAll('#authDialog .panel'),
	loginEmail: document.getElementById('loginEmail'),
	loginPassword: document.getElementById('loginPassword'),
	regName: document.getElementById('regName'),
	regEmail: document.getElementById('regEmail'),
	regPassword: document.getElementById('regPassword'),
	authError: document.getElementById('authError'),
	forgotEmail: document.getElementById('forgotEmail'),
	forgotSubmit: document.getElementById('forgotSubmit'),
	forgotPasswordBtn: document.getElementById('forgotPassword'),
	facebookLogin: document.getElementById('facebookLogin'),
	facebookSignup: document.getElementById('facebookSignup'),
	phoneLogin: document.getElementById('phoneLogin'),
	phoneSignup: document.getElementById('phoneSignup'),
	phonePanel: document.querySelector('[data-panel="phone"]'),
	phoneNumber: document.getElementById('phoneNumber'),
	phoneCode: document.getElementById('phoneCode'),
	sendOtp: document.getElementById('sendOtp'),
    confirmOtp: document.getElementById('confirmOtp'),
    authBody: document.querySelector('#authDialog .auth-body'),
    toggleBtn: document.getElementById('toggleBtn'),
    toggleText: document.getElementById('toggleText')
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

// --- Auth UI helpers ---
function updateAuthUI(){
	const me = getCurrentUser();
	if(me){
		dom.loginButton.hidden = true;
		dom.userMenu.hidden = false;
		dom.userName.textContent = me.name || me.email;
	} else {
		dom.loginButton.hidden = false;
		dom.userMenu.hidden = true;
		dom.userName.textContent = '';
	}
}

function openAuth(tab = 'login'){
	setAuthTab(tab);
	if(typeof dom.authDialog.showModal === 'function') dom.authDialog.showModal();
	else dom.authDialog.open = true;
}
function closeAuth(){
	if(typeof dom.authDialog.close === 'function') dom.authDialog.close();
	else dom.authDialog.open = false;
}

function setAuthTab(tab){
	dom.authTabs.forEach(btn => {
		const active = btn.dataset.tab === tab;
		btn.classList.toggle('active', active);
	});
    const isSlide = tab === 'login' || tab === 'register';
    const slideWrapper = dom.authBody.querySelector('.slide-wrapper');

    // Toggle sliding states
    dom.authBody.classList.toggle('sign-in', tab === 'login');
    dom.authBody.classList.toggle('sign-up', tab === 'register');

    // Show/hide the slider container vs standalone panels
    if(slideWrapper){ slideWrapper.hidden = !isSlide; }

    // Only toggle visibility for non-sliding panels (forgot/phone)
    dom.authPanels.forEach(panel => {
        const name = panel.dataset.panel;
        const isSlidingPanel = name === 'login' || name === 'register';
        if(isSlidingPanel){
            panel.hidden = false; // keep both visible for layout when sliding
        } else {
            panel.hidden = name !== tab; // show only the selected standalone panel
        }
    });
    dom.authError.hidden = true;
    dom.authError.textContent = '';

    // Update title and toggle text/button if present
    const title = document.getElementById('authTitle');
    if(title){ title.textContent = tab === 'register' ? 'Sign Up' : 'Sign In'; }
    if(dom.toggleBtn && dom.toggleText){
        if(tab === 'login'){
            dom.toggleText.textContent = 'Chưa có tài khoản?';
            dom.toggleBtn.textContent = 'Đăng ký';
        } else if(tab === 'register'){
            dom.toggleText.textContent = 'Đã có tài khoản?';
            dom.toggleBtn.textContent = 'Đăng nhập';
        }
    }
}

function simulateFacebookAuth(){
	// demo user
	const user = { id: 'fb-' + Date.now(), name: 'Facebook User', email: 'fbuser@example.com' };
	setCurrentUser(user);
	closeAuth();
	updateAuthUI();
}

function simulateSendOtp(phone){
	if(!/^\d{9,12}$/.test(phone.replace(/\D/g,''))) throw new Error('Số điện thoại không hợp lệ');
	try{ localStorage.setItem('shoplite_last_phone', phone); }catch{}
	return '1234';
}

function simulateVerifyOtp(code){
	return code === '1234';
}

function startCheckout(){
	const me = getCurrentUser();
	if(!me){ openAuth('login'); return; }
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
		const me = getCurrentUser();
		if(!me){ openAuth('login'); location.hash = ''; return; }
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

	// Auth open/close
	dom.loginButton.addEventListener('click', ()=> openAuth('login'));
	dom.closeAuth.addEventListener('click', ()=> closeAuth());
	dom.logoutButton.addEventListener('click', ()=>{ logoutCurrentUser(); updateAuthUI(); alert('Đã đăng xuất'); });
	dom.authTabs.forEach(btn => btn.addEventListener('click', ()=> setAuthTab(btn.dataset.tab)));

    // Toggle link behavior
    if(dom.toggleBtn){
        dom.toggleBtn.addEventListener('click', ()=>{
            const next = dom.authBody.classList.contains('sign-in') ? 'register' : 'login';
            setAuthTab(next);
        });
    }

	// Toggle password visibility
	document.querySelectorAll('.peek-btn').forEach(btn => {
		btn.addEventListener('click', ()=>{
			const targetId = btn.getAttribute('data-target');
			const input = document.getElementById(targetId);
			if(!input) return;
			input.type = input.type === 'password' ? 'text' : 'password';
			btn.textContent = input.type === 'password' ? '👁' : '🙈';
		});
	});

	// Forgot password
	dom.forgotPasswordBtn.addEventListener('click', ()=> setAuthTab('forgot'));
	dom.forgotSubmit.addEventListener('click', ()=>{
		try{
			const email = dom.forgotEmail.value.trim();
			if(!email) throw new Error('Vui lòng nhập email');
			requestPasswordReset(email);
			alert('Đã gửi liên kết đặt lại (mô phỏng). Vui lòng kiểm tra email.');
			setAuthTab('login');
		}catch(err){ dom.authError.textContent = err?.message || 'Đã xảy ra lỗi'; dom.authError.hidden = false; }
	});

	// Social/phone handlers
	dom.facebookLogin.addEventListener('click', simulateFacebookAuth);
	dom.facebookSignup.addEventListener('click', simulateFacebookAuth);
	dom.phoneLogin.addEventListener('click', ()=> setAuthTab('phone'));
	dom.phoneSignup.addEventListener('click', ()=> setAuthTab('phone'));
	dom.sendOtp.addEventListener('click', ()=>{
		try{
			const phone = dom.phoneNumber.value.trim();
			simulateSendOtp(phone);
			alert('Đã gửi OTP: 1234 (mô phỏng)');
		}catch(err){ dom.authError.textContent = err?.message || 'Lỗi gửi OTP'; dom.authError.hidden = false; }
	});
	dom.confirmOtp.addEventListener('click', ()=>{
		const code = dom.phoneCode.value.trim();
		if(simulateVerifyOtp(code)){
			const phone = dom.phoneNumber.value.trim();
			const user = { id: 'ph-' + Date.now(), name: 'User '+phone.slice(-4), email: phone+'@phone.local' };
			setCurrentUser(user);
			closeAuth();
			updateAuthUI();
		}else{
			dom.authError.textContent = 'Mã OTP không đúng';
			dom.authError.hidden = false;
		}
	});

	// Auth form submit
	dom.authForm.addEventListener('submit', (e)=>{
		e.preventDefault();
		const activeTab = [...dom.authTabs].find(b=>b.classList.contains('active'))?.dataset.tab || 'login';
		dom.authError.hidden = true; dom.authError.textContent = '';
		try{
			if(activeTab === 'login'){
				const email = dom.loginEmail.value.trim();
				const password = dom.loginPassword.value;
				const user = authenticateUser({ email, password });
				setCurrentUser(user);
				closeAuth();
				updateAuthUI();
			} else {
				const name = dom.regName.value.trim();
				const email = dom.regEmail.value.trim();
				const password = dom.regPassword.value;
				if(!name){ throw new Error('Vui lòng nhập họ tên'); }
				const user = registerUser({ name, email, password });
				setCurrentUser(user);
				closeAuth();
				updateAuthUI();
			}
		}catch(err){
			dom.authError.textContent = err?.message || 'Đã xảy ra lỗi';
			dom.authError.hidden = false;
		}
	});
}

function init(){
	dom.year.textContent = new Date().getFullYear();
	renderCategories(getAllProducts());
	renderGrid();
	renderCart();
	showSectionFromHash();
	updateAuthUI();
	wireEvents();
}

document.addEventListener('DOMContentLoaded', init);



