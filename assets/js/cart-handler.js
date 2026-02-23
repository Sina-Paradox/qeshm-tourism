// ===== مدیریت سبد خرید =====
let currentItemForCart = null;

// تابع ایجاد مودال انتخاب تاریخ
function createDateModal() {
    console.log('ایجاد مودال تاریخ');
    const existingModal = document.querySelector('.cart-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'cart-modal-overlay';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <button class="modal-close" id="closeDateModal">&times;</button>
            <h3 class="cart-modal-title">انتخاب تاریخ</h3>
            <div class="cart-modal-subtitle" id="modalItemTitle"></div>
            <div class="cart-date-inputs" id="modalDateInputs"></div>
            <div class="cart-modal-actions">
                <button class="cart-modal-btn confirm" id="confirmAddToCart">افزودن به سبد خرید</button>
                <button class="cart-modal-btn cancel" id="cancelAddToCart">انصراف</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmAddToCart').addEventListener('click', confirmAddToCart);
    document.getElementById('cancelAddToCart').addEventListener('click', closeDateModal);
    document.getElementById('closeDateModal').addEventListener('click', closeDateModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDateModal();
        }
    });
}

// این تابع اکنون از persian-datepicker.js استفاده می‌کند
function showDateModal(item) {
    console.log('استفاده از تقویم جدید برای:', item);
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('لطفاً ابتدا وارد شوید', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
        return;
    }
    
    currentItemForCart = item;
    
    // فراخوانی تابع از persian-datepicker.js
    if (typeof window.showDateSelectionModal === 'function') {
        window.showDateSelectionModal(item);
    } else {
        console.error('تابع showDateSelectionModal یافت نشد');
        showToast('خطا در بارگذاری تقویم', 'error');
    }
}

function closeDateModal() {
    console.log('بستن مودال');
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
    currentItemForCart = null;
}

function confirmAddToCart() {
    console.log('تأیید افزودن به سبد خرید - این تابع دیگر استفاده نمی‌شود');
    // این تابع دیگر استفاده نمی‌شود - به جای آن از confirmDateSelection استفاده می‌شود
}

function updateCartCountDisplay() {
    console.log('به‌روزرسانی تعداد سبد خرید');
    const cartCounts = document.querySelectorAll('.cart-count');
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === currentUser);
        const count = (user?.cart?.length || 0);
        
        cartCounts.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    } else {
        cartCounts.forEach(el => {
            el.textContent = '0';
            el.style.display = 'none';
        });
    }
}

function showToast(message, type = 'success') {
    console.log('نمایش پیام:', message);
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

function setupReservationButtons() {
    console.log('تنظیم دکمه‌های رزرو');
    const buttons = document.querySelectorAll('.package-btn.reservation-btn');
    console.log('تعداد دکمه‌های پیدا شده:', buttons.length);
    
    buttons.forEach(btn => {
        btn.removeEventListener('click', handleReservationClick);
        btn.addEventListener('click', handleReservationClick);
    });
}

function handleReservationClick(e) {
    console.log('کلیک روی دکمه رزرو');
    e.preventDefault();
    e.stopPropagation();
    
    const card = e.target.closest('.package-card');
    if (!card) {
        console.log('کارت پیدا نشد');
        return;
    }
    
    console.log('کلاس‌های کارت:', card.classList);
    
    // بررسی اینکه کارت فعال است
    if (!card.classList.contains('active')) {
        console.log('کارت فعال نیست');
        return;
    }
    
    const isAccommodation = window.location.pathname.includes('accommodations.html');
    console.log('نوع صفحه:', isAccommodation ? 'اقامت' : 'پکیج');
    
    const title = card.querySelector('.package-title')?.textContent?.trim() || '';
    const description = card.querySelector('.package-description')?.textContent?.trim() || '';
    const duration = card.querySelector('.package-duration')?.textContent?.trim() || '';
    const priceElement = card.querySelector('.package-price');
    let price = priceElement ? priceElement.textContent?.replace('قیمت:', '').trim() : '';
    
    console.log('عنوان:', title);
    console.log('قیمت:', price);
    
    const priceMatch = price.match(/[\d,]+/);
    if (priceMatch) {
        price = priceMatch[0] + ' تومان';
    }
    
    // استفاده از تابع showDateModal (که اکنون به persian-datepicker.js متصل است)
    showDateModal({
        type: isAccommodation ? 'accommodation' : 'package',
        title: title,
        description: description,
        duration: duration,
        price: price,
        originalElement: card
    });
}

// اجرا بعد از لود صفحه
document.addEventListener('DOMContentLoaded', function() {
    console.log('cart-handler.js لود شد');
    setupReservationButtons();
    updateCartCountDisplay();
    
    // نظارت بر تغییرات DOM برای اضافه شدن کارت‌های جدید
    const observer = new MutationObserver(function(mutations) {
        console.log('تغییر در DOM شناسایی شد');
        setupReservationButtons();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    window.addEventListener('popstate', function() {
        console.log('popstate رویداد');
        setTimeout(setupReservationButtons, 100);
    });
    
    window.addEventListener('cartUpdated', function() {
        console.log('cartUpdated رویداد');
        updateCartCountDisplay();
    });
});

// اطمینان از وجود توابع در پنجره
window.cartHandler = {
    showDateModal,
    closeDateModal,
    updateCartCountDisplay,
    showToast
};