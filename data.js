// Sample catalog and persistence utilities
const BUILTIN_PRODUCTS = [
	{ id: 'p-1001', title: 'Wireless Earbuds Pro', price: 39.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=1200&auto=format&fit=crop', description: 'Noise-cancelling Bluetooth earbuds with charging case', popularity: 98, createdAt: 1714600000000 },
	{ id: 'p-1002', title: 'Smart Watch S3', price: 59.0, category: 'Wearables', image: 'https://images.unsplash.com/photo-1517414204284-0b6f2fe0a68f?q=80&w=1200&auto=format&fit=crop', description: 'Health tracking smartwatch with heart-rate monitor', popularity: 90, createdAt: 1718600000000 },
	{ id: 'p-1003', title: 'Canvas Backpack', price: 24.5, category: 'Bags', image: 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=1200&auto=format&fit=crop', description: 'Durable, water-resistant everyday backpack', popularity: 80, createdAt: 1709600000000 },
	{ id: 'p-1004', title: 'Ceramic Mug', price: 9.99, category: 'Home', image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1200&auto=format&fit=crop', description: '12oz ceramic mug for coffee or tea', popularity: 60, createdAt: 1705600000000 },
	{ id: 'p-1005', title: 'Running Shoes', price: 49.99, category: 'Fashion', image: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?q=80&w=1200&auto=format&fit=crop', description: 'Lightweight breathable road runners', popularity: 85, createdAt: 1721600000000 },
	{ id: 'p-1006', title: 'Mechanical Keyboard', price: 79.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', description: 'Hot-swappable RGB mechanical keyboard', popularity: 92, createdAt: 1722600000000 },
	{ id: 'p-1007', title: 'LED Desk Lamp', price: 17.5, category: 'Home', image: 'https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=1200&auto=format&fit=crop', description: 'Adjustable LED lamp with USB charging', popularity: 70, createdAt: 1702600000000 },
	{ id: 'p-1008', title: 'Graphic T‑Shirt', price: 14.99, category: 'Fashion', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop', description: 'Soft cotton tee with modern print', popularity: 75, createdAt: 1712600000000 }
];

const STORAGE_KEYS = {
	USER_PRODUCTS: 'shoplite_user_products',
	CART: 'shoplite_cart',
	USERS: 'shoplite_users',
	AUTH_USER: 'shoplite_auth_user'
};

function readLocalStorageJson(key, fallback){
	try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch{ return fallback }
}
function writeLocalStorageJson(key, value){
	try{ localStorage.setItem(key, JSON.stringify(value)); }catch{}
}

function getUserProducts(){
	return readLocalStorageJson(STORAGE_KEYS.USER_PRODUCTS, []);
}
function addUserProduct(product){
	const existing = getUserProducts();
	existing.unshift(product);
	writeLocalStorageJson(STORAGE_KEYS.USER_PRODUCTS, existing);
}

function getAllProducts(){
	return [...getUserProducts(), ...BUILTIN_PRODUCTS];
}

function getCart(){
	return readLocalStorageJson(STORAGE_KEYS.CART, []);
}
function setCart(cart){
	writeLocalStorageJson(STORAGE_KEYS.CART, cart);
}


// --- Simple auth utilities (demo only; do not use in production) ---
function getUsers(){
	return readLocalStorageJson(STORAGE_KEYS.USERS, []);
}
function saveUsers(users){
	writeLocalStorageJson(STORAGE_KEYS.USERS, users);
}
function findUserByEmail(email){
	const users = getUsers();
	return users.find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}
function registerUser({ name, email, password }){
	const existing = findUserByEmail(email);
	if(existing) throw new Error('Email đã được sử dụng');
	const user = { id: 'u-' + Date.now(), name, email, password };
	const users = getUsers();
	users.push(user);
	saveUsers(users);
	return user;
}
function authenticateUser({ email, password }){
	const user = findUserByEmail(email);
	if(!user || user.password !== password) throw new Error('Email hoặc mật khẩu không đúng');
	return user;
}
function setCurrentUser(user){
	writeLocalStorageJson(STORAGE_KEYS.AUTH_USER, user ? { id: user.id, name: user.name, email: user.email } : null);
}
function getCurrentUser(){
	return readLocalStorageJson(STORAGE_KEYS.AUTH_USER, null);
}
function logoutCurrentUser(){
	try{ localStorage.removeItem(STORAGE_KEYS.AUTH_USER); }catch{}
}

// --- Forgot password (demo) ---
function requestPasswordReset(email){
	const user = findUserByEmail(email);
	if(!user) throw new Error('Email không tồn tại');
	// In a real app, send email. Here we simulate and store a token timestamp
	const key = 'shoplite_reset_'+user.id;
	try{ localStorage.setItem(key, String(Date.now())); }catch{}
	return true;
}

