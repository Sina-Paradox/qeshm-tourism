document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
        return;
    }
    
    const user = users[userIndex];
    
    updateHeader(user.fullname);
    displayProfileInfo(user);
    displayReservations(user.reservations || []);
    displayCart(user.cart || []);
    setupTabs();
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        showDashboardToast('از حساب خود خارج شدید');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
    
    document.getElementById('paymentBtn').addEventListener('click', function() {
        processPayment(users, userIndex);
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'cart') {
        activateTab('cart');
    }
    
    window.addEventListener('cartUpdated', function() {
        refreshDashboardData();
    });
});

function refreshDashboardData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === currentUser);
    
    if (user) {
        displayCart(user.cart || []);
        displayReservations(user.reservations || []);
        updateHeader(user.fullname);
    }
}

function updateHeader(fullname) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        const firstName = fullname.split(' ')[0];
        usernameDisplay.textContent = firstName;
    }
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === currentUser);
            const count = (user?.cart?.length || 0);
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }
}

function displayProfileInfo(user) {
    document.getElementById('profile-fullname').textContent = user.fullname || '-';
    document.getElementById('profile-mobile').textContent = user.mobile || '-';
    document.getElementById('profile-email').textContent = user.email || '-';
    document.getElementById('profile-username').textContent = user.username || '-';
    
    document.querySelectorAll('.edit-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.dataset.field;
            editUserInfo(field, user);
        });
    });
}

function editUserInfo(field, user) {
    const currentValue = user[field];
    const labels = {
        fullname: 'نام و نام خانوادگی',
        mobile: 'شماره موبایل',
        email: 'ایمیل'
    };
    
    const newValue = prompt(`ویرایش ${labels[field]}:`, currentValue);
    
    if (newValue && newValue !== currentValue) {
        if (field === 'mobile' && !/^09[0-9]{9}$/.test(newValue)) {
            showDashboardToast('شماره موبایل نامعتبر است', 'error');
            return;
        }
        
        if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
            showDashboardToast('ایمیل نامعتبر است', 'error');
            return;
        }
        
        if (field === 'fullname' && newValue.length < 3) {
            showDashboardToast('نام باید حداقل ۳ کاراکتر باشد', 'error');
            return;
        }
        
        user[field] = newValue;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(u => u.username === user.username);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('users', JSON.stringify(users));
            displayProfileInfo(user);
            updateHeader(user.fullname);
            showDashboardToast('اطلاعات با موفقیت به‌روزرسانی شد');
        }
    }
}

function displayReservations(reservations) {
    const list = document.getElementById('reservationsList');
    
    if (!reservations || reservations.length === 0) {
        list.innerHTML = '<div class="empty-state">هنوز رزروی ندارید</div>';
        return;
    }
    
    list.innerHTML = reservations.map(res => {
        const price = res.price || '۰ تومان';
        
        if (res.type === 'package') {
            return `
                <div class="reservation-item">
                    <div class="reservation-header">
                        <span class="reservation-title">${res.title}</span>
                        <span class="reservation-type">پکیج گردشگری</span>
                    </div>
                    <div class="reservation-details">
                        <span class="reservation-date">📅 تاریخ: ${res.dateDisplay || res.date}</span>
                        <span class="reservation-price">💰 ${price}</span>
                    </div>
                    <div class="reservation-status">✅ پرداخت شده</div>
                </div>
            `;
        } else {
            return `
                <div class="reservation-item">
                    <div class="reservation-header">
                        <span class="reservation-title">${res.title}</span>
                        <span class="reservation-type">اقامتگاه</span>
                    </div>
                    <div class="reservation-details">
                        <span class="reservation-date">📅 ورود: ${res.checkInDisplay || res.checkIn}</span>
                        <span class="reservation-date">📅 خروج: ${res.checkOutDisplay || res.checkOut}</span>
                        <span class="reservation-price">💰 ${price}</span>
                    </div>
                    <div class="reservation-status">✅ پرداخت شده</div>
                </div>
            `;
        }
    }).join('');
}

function displayCart(cart) {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cart || cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-state">سبد خرید خالی است</div>';
        cartTotal.textContent = '۰ تومان';
        return;
    }
    
    let total = 0;
    
    cartItems.innerHTML = cart.map((item, index) => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        total += priceNum;
        
        if (item.type === 'package') {
            return `
                <div class="cart-item" data-index="${index}" data-id="${item.id}">
                    <div class="cart-item-header">
                        <span class="cart-item-title">${item.title}</span>
                        <span class="reservation-type">پکیج گردشگری</span>
                    </div>
                    <div class="cart-item-details">
                        <span class="cart-item-date">📅 تاریخ: ${item.dateDisplay || 'انتخاب نشده'}</span>
                        <span class="cart-item-price">💰 ${item.price}</span>
                    </div>
                    <div class="cart-item-actions">
                        <button class="edit-date-btn" onclick="editCartItemDate(${index})">ویرایش تاریخ</button>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">حذف</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="cart-item" data-index="${index}" data-id="${item.id}">
                    <div class="cart-item-header">
                        <span class="cart-item-title">${item.title}</span>
                        <span class="reservation-type">اقامتگاه</span>
                    </div>
                    <div class="cart-item-details">
                        <span class="cart-item-date">📅 ورود: ${item.checkInDisplay || 'انتخاب نشده'}</span>
                        <span class="cart-item-date">📅 خروج: ${item.checkOutDisplay || 'انتخاب نشده'}</span>
                        <span class="cart-item-price">💰 ${item.price}</span>
                    </div>
                    <div class="cart-item-actions">
                        <button class="edit-date-btn" onclick="editCartItemDates(${index})">ویرایش تاریخ</button>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">حذف</button>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    cartTotal.textContent = total.toLocaleString('fa-IR') + ' تومان';
    updateCartCount();
}

window.removeFromCart = function(index) {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex !== -1) {
        users[userIndex].cart.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        displayCart(users[userIndex].cart);
        showDashboardToast('آیتم از سبد خرید حذف شد');
        
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
};

window.editCartItemDate = function(index) {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    const item = users[userIndex].cart[index];
    
    const today = new Date().toISOString().split('T')[0];
    const newDate = prompt('تاریخ جدید را وارد کنید (YYYY-MM-DD):', item.date || today);
    
    if (newDate && newDate !== item.date) {
        if (new Date(newDate) < new Date(today)) {
            showDashboardToast('تاریخ نمی‌تواند در گذشته باشد', 'error');
            return;
        }
        
        item.date = newDate;
        item.dateDisplay = new Date(newDate).toLocaleDateString('fa-IR');
        localStorage.setItem('users', JSON.stringify(users));
        displayCart(users[userIndex].cart);
        showDashboardToast('تاریخ با موفقیت ویرایش شد');
    }
};

window.editCartItemDates = function(index) {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    const item = users[userIndex].cart[index];
    
    const today = new Date().toISOString().split('T')[0];
    
    const newCheckIn = prompt('تاریخ ورود جدید (YYYY-MM-DD):', item.checkIn || today);
    if (newCheckIn && newCheckIn !== item.checkIn) {
        if (new Date(newCheckIn) < new Date(today)) {
            showDashboardToast('تاریخ ورود نمی‌تواند در گذشته باشد', 'error');
            return;
        }
        item.checkIn = newCheckIn;
        item.checkInDisplay = new Date(newCheckIn).toLocaleDateString('fa-IR');
    }
    
    const newCheckOut = prompt('تاریخ خروج جدید (YYYY-MM-DD):', item.checkOut || today);
    if (newCheckOut && newCheckOut !== item.checkOut) {
        if (new Date(newCheckOut) <= new Date(item.checkIn)) {
            showDashboardToast('تاریخ خروج باید بعد از تاریخ ورود باشد', 'error');
            return;
        }
        item.checkOut = newCheckOut;
        item.checkOutDisplay = new Date(newCheckOut).toLocaleDateString('fa-IR');
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    displayCart(users[userIndex].cart);
    showDashboardToast('تاریخ‌ها با موفقیت ویرایش شدند');
};

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            activateTab(tabId);
        });
    });
}

function activateTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

function processPayment(users, userIndex) {
    const cart = users[userIndex].cart || [];
    
    if (cart.length === 0) {
        showDashboardToast('سبد خرید خالی است', 'error');
        return;
    }
    
    users[userIndex].reservations = users[userIndex].reservations || [];
    cart.forEach(item => {
        users[userIndex].reservations.push({
            ...item,
            paidAt: new Date().toISOString(),
            paidAtDisplay: new Date().toLocaleDateString('fa-IR')
        });
    });
    
    users[userIndex].cart = [];
    
    localStorage.setItem('users', JSON.stringify(users));
    
    showDashboardToast('پرداخت با موفقیت انجام شد');
    displayCart([]);
    displayReservations(users[userIndex].reservations);
    activateTab('reservations');
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function showDashboardToast(message, type = 'success') {
    const oldToast = document.querySelector('.toast-message');
    if (oldToast) {
        oldToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}