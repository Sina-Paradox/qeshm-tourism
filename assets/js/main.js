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

// ===== دریافت المان‌های کارت =====
const cardsContainer = document.getElementById("cardsContainer");
let cardItems = document.querySelectorAll('.card-item');

// ===== تشخیص حالت موبایل (فقط بر اساس عرض) =====
function isMobile() {
    return window.innerWidth <= 768;
}

// ===== حالت دسکتاپ (گروه‌های سه‌تایی افقی با اسکرول عمودی) =====
if (cardsContainer && !isMobile()) {
    // پاک کردن محتوای فعلی و آماده‌سازی برای گروه‌بندی
    const originalCards = Array.from(cardItems);
    cardsContainer.innerHTML = ''; // خالی کردن کانتینر

    // ایجاد دو گروه
    const group0 = document.createElement('div');
    group0.className = 'card-group';
    const group1 = document.createElement('div');
    group1.className = 'card-group';

    // توزیع کارت‌ها در گروه‌ها (هر گروه سه کارت)
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

    // throttle برای اسکرول
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

    let keyTimeout = null;
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            if (!isAnimating && !keyTimeout && activeGroup === 0) {
                updateGroups(1);
                keyTimeout = setTimeout(() => keyTimeout = null, 300);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            if (!isAnimating && !keyTimeout && activeGroup === 1) {
                updateGroups(0);
                keyTimeout = setTimeout(() => keyTimeout = null, 300);
            }
        }
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
    // تنظیم کلاس‌های اولیه
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

    // throttle
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

// ===== رفع مشکل زوم در صفحه auth =====
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

// ===== تنظیم مجدد در تغییر اندازه صفحه با debounce =====
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        location.reload();
    }, 250);
});