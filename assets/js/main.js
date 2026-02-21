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

// ===== مدیریت کارت‌های عمودی در صفحه اصلی =====
const verticalCards = document.querySelectorAll('.vertical-card');
if (verticalCards.length > 0) {
    // غیرفعال کردن اسکرول عمودی کل صفحه
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            nextCard();
        } else {
            prevCard();
        }
    }, { passive: false });

    // رویدادهای لمسی
    let touchStartY = null;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (touchStartY !== null) {
            const touchEndY = e.touches[0].clientY;
            const diff = touchStartY - touchEndY;
            if (Math.abs(diff) > 20) {
                if (diff > 0) {
                    nextCard();
                } else {
                    prevCard();
                }
                touchStartY = null;
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
    });

    // کلیدهای صفحه کلید
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            nextCard();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            prevCard();
        }
    });

    let currentIndex = 0;
    let isAnimating = false;
    const totalCards = verticalCards.length;

    function updateCards(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        isAnimating = true;

        verticalCards.forEach((card, index) => {
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
        const nextIndex = (currentIndex + 1) % totalCards;
        updateCards(nextIndex);
    }

    function prevCard() {
        const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCards(prevIndex);
    }

    // کلیک روی کارت (اگر لینک داشته باشد)
    verticalCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.dataset.link;
            if (link) {
                window.location.href = link;
            }
        });
    });

    // فعال کردن اولین کارت
    verticalCards[0].classList.add('active');
    for (let i = 1; i < totalCards; i++) {
        if (i === 1) verticalCards[i].classList.add('next');
        else if (i === totalCards - 1) verticalCards[i].classList.add('prev');
    }
}

// ===== رفع مشکل زوم در inputهای صفحه auth =====
// با کلیک بیرون از input، صفحه به حالت عادی برمی‌گردد
if (document.querySelector('.auth-page')) {
    const inputs = document.querySelectorAll('.glass-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            // اسکرول به موقعیت اصلی (اختیاری)
            window.scrollTo(0, 0);
        });
    });
    
    // کلیک روی document برای برگرداندن زوم
    document.addEventListener('touchstart', function(e) {
        if (!e.target.classList.contains('glass-input')) {
            // اگر روی input نبود، فوکوس را از input بردار
            if (document.activeElement && document.activeElement.classList.contains('glass-input')) {
                document.activeElement.blur();
            }
        }
    });
}