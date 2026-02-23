// ===== منوی همبرگری =====
const hamburgerBtn = document.getElementById("hamburgerBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

if (hamburgerBtn && dropdownMenu) {
    hamburgerBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle("active");
    });
    
    const dropItems = document.querySelectorAll(".drop-item");
    dropItems.forEach(item => {
        item.addEventListener("click", function() {
            dropdownMenu.classList.remove("active");
        });
    });
    
    document.addEventListener("click", function(e) {
        if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove("active");
        }
    });
}

// ===== مدیریت هدر براساس وضعیت ورود =====
function updateHeaderForAuth() {
    const authBtn = document.querySelector('.auth-btn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (authBtn) {
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === currentUser);
            
            if (user) {
                const firstName = user.fullname.split(' ')[0];
                authBtn.textContent = firstName;
                authBtn.onclick = function() {
                    window.location.href = 'dashboard.html';
                };
                
                // ایجاد ساختار جدید هدر برای کاربر وارد شده
                const header = document.querySelector('.header');
                
                // حذف دکمه سبد خرید قبلی اگر وجود دارد
                const oldCartBtn = document.querySelector('.cart-btn');
                if (oldCartBtn) {
                    oldCartBtn.remove();
                }
                
                // ایجاد باکس کاربری جدید
                const userHeader = document.createElement('div');
                userHeader.className = 'user-header';
                
                // ایجاد دکمه سبد خرید
                const cartBtn = document.createElement('button');
                cartBtn.className = 'cart-btn';
                cartBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 22C9.10457 22 10 21.1046 10 20C10 18.8954 9.10457 18 8 18C6.89543 18 6 18.8954 6 20C6 21.1046 6.89543 22 8 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20 22C21.1046 22 22 21.1046 22 20C22 18.8954 21.1046 18 20 18C18.8954 18 18 18.8954 18 20C18 21.1046 18.8954 22 20 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 2H8L10 16H20L22 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="cart-count" id="headerCartCount">0</span>
                `;
                cartBtn.onclick = function() {
                    window.location.href = 'dashboard.html?tab=cart';
                };
                
                // ایجاد دکمه نام کاربری
                const usernameSpan = document.createElement('span');
                usernameSpan.className = 'username-display';
                usernameSpan.textContent = firstName;
                usernameSpan.onclick = function() {
                    window.location.href = 'dashboard.html';
                };
                
                // اضافه کردن المان‌ها به userHeader
                userHeader.appendChild(usernameSpan);
                userHeader.appendChild(cartBtn);
                
                // جایگزینی دکمه auth با userHeader
                authBtn.parentNode.replaceChild(userHeader, authBtn);
                
                // به‌روزرسانی تعداد سبد خرید
                const cartCount = user.cart?.length || 0;
                const headerCartCount = document.getElementById('headerCartCount');
                if (headerCartCount) {
                    headerCartCount.textContent = cartCount;
                    headerCartCount.style.display = cartCount > 0 ? 'flex' : 'none';
                }
            } else {
                localStorage.removeItem('currentUser');
                resetAuthButton();
            }
        } else {
            resetAuthButton();
        }
    }
}

function resetAuthButton() {
    const authBtn = document.querySelector('.auth-btn');
    const userHeader = document.querySelector('.user-header');
    
    if (userHeader) {
        // ایجاد دکمه auth جدید
        const newAuthBtn = document.createElement('button');
        newAuthBtn.className = 'auth-btn';
        newAuthBtn.textContent = 'ورود / عضویت';
        newAuthBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
        
        // جایگزینی userHeader با authBtn
        userHeader.parentNode.replaceChild(newAuthBtn, userHeader);
    } else if (authBtn) {
        authBtn.textContent = 'ورود / عضویت';
        authBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
    }
}

// ===== دریافت المان‌های کارت =====
const cardsContainer = document.getElementById("cardsContainer");
let cardItems = document.querySelectorAll('.card-item');

function isMobile() {
    return window.innerWidth <= 768;
}

// ===== حالت دسکتاپ =====
if (cardsContainer && !isMobile()) {
    const originalCards = Array.from(cardItems);
    cardsContainer.innerHTML = '';

    const group0 = document.createElement('div');
    group0.className = 'card-group';
    const group1 = document.createElement('div');
    group1.className = 'card-group';

    originalCards.slice(0, 3).forEach(card => {
        const clonedCard = card.cloneNode(true);
        clonedCard.dataset.link = card.dataset.link;
        group0.appendChild(clonedCard);
    });
    originalCards.slice(3, 6).forEach(card => {
        const clonedCard = card.cloneNode(true);
        clonedCard.dataset.link = card.dataset.link;
        group1.appendChild(clonedCard);
    });

    cardsContainer.appendChild(group0);
    cardsContainer.appendChild(group1);

    const newCardItems = document.querySelectorAll('.card-group .card-item');
    
    let activeGroup = 0;
    group0.classList.add('active');
    group1.classList.add('next');

    let isAnimating = false;

    function updateGroups(newGroup) {
        if (isAnimating || newGroup === activeGroup) return;
        isAnimating = true;

        const currentGroup = activeGroup === 0 ? group0 : group1;
        const nextGroup = newGroup === 0 ? group0 : group1;

        if (newGroup > activeGroup) {
            currentGroup.classList.remove('active');
            currentGroup.classList.add('prev');
            nextGroup.classList.remove('next');
            nextGroup.classList.add('active');
        } else {
            currentGroup.classList.remove('active');
            currentGroup.classList.add('next');
            nextGroup.classList.remove('prev');
            nextGroup.classList.add('active');
        }

        activeGroup = newGroup;

        setTimeout(() => {
            [group0, group1].forEach(g => {
                g.classList.remove('prev', 'next');
            });
            isAnimating = false;
        }, 500);
    }

    let scrollTimeout = null;
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!isAnimating && !scrollTimeout) {
            if (e.deltaY > 0 && activeGroup === 0) {
                updateGroups(1);
            } else if (e.deltaY < 0 && activeGroup === 1) {
                updateGroups(0);
            }
            scrollTimeout = setTimeout(() => scrollTimeout = null, 300);
        }
    }, { passive: false });

    let touchStartY = null;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isAnimating && touchStartY !== null && !scrollTimeout) {
            const deltaY = touchStartY - e.touches[0].clientY;
            if (Math.abs(deltaY) > 20) {
                if (deltaY > 0 && activeGroup === 0) {
                    updateGroups(1);
                } else if (deltaY < 0 && activeGroup === 1) {
                    updateGroups(0);
                }
                touchStartY = null;
                scrollTimeout = setTimeout(() => scrollTimeout = null, 300);
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
    });

    newCardItems.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.dataset.link;
            if (link) window.location.href = link;
        });
    });
}

// ===== حالت موبایل =====
else if (isMobile() && cardItems.length > 0) {
    cardItems.forEach((card, index) => {
        card.classList.remove('active', 'prev', 'next');
        if (index === 0) card.classList.add('active');
        else if (index === 1) card.classList.add('next');
        else if (index === cardItems.length - 1) card.classList.add('prev');
    });

    let currentIndex = 0;
    let isAnimating = false;
    const totalCards = cardItems.length;

    function updateCards(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        isAnimating = true;

        cardItems.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            if (index === newIndex) {
                card.classList.add('active');
            } else if (index === newIndex - 1 || (newIndex === 0 && index === totalCards - 1)) {
                card.classList.add('prev');
            } else if (index === newIndex + 1 || (newIndex === totalCards - 1 && index === 0)) {
                card.classList.add('next');
            }
        });

        currentIndex = newIndex;
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextCard() {
        updateCards((currentIndex + 1) % totalCards);
    }

    function prevCard() {
        updateCards((currentIndex - 1 + totalCards) % totalCards);
    }

    let scrollTimeout = null;
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!isAnimating && !scrollTimeout) {
            if (e.deltaY > 0) nextCard();
            else prevCard();
            scrollTimeout = setTimeout(() => scrollTimeout = null, 300);
        }
    }, { passive: false });

    let touchStartY = null;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isAnimating && touchStartY !== null && !scrollTimeout) {
            const diff = touchStartY - e.touches[0].clientY;
            if (Math.abs(diff) > 20) {
                if (diff > 0) nextCard();
                else prevCard();
                touchStartY = null;
                scrollTimeout = setTimeout(() => scrollTimeout = null, 300);
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
    });

    cardItems.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.dataset.link;
            if (link) window.location.href = link;
        });
    });
}

// ===== رفع مشکل زوم =====
if (document.querySelector('.auth-page')) {
    const inputs = document.querySelectorAll('.glass-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            window.scrollTo(0, 0);
        });
    });
    
    document.addEventListener('touchstart', function(e) {
        if (!e.target.classList.contains('glass-input')) {
            if (document.activeElement && document.activeElement.classList.contains('glass-input')) {
                document.activeElement.blur();
            }
        }
    });
}

// ===== به‌روزرسانی هدر =====
document.addEventListener('DOMContentLoaded', function() {
    updateHeaderForAuth();
});