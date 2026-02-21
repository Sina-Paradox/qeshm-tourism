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
const cardItems = document.querySelectorAll('.card-item');

// ===== تشخیص حالت موبایل عمودی =====
function isMobilePortrait() {
    return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

// ===== حالت دسکتاپ (افقی) =====
if (cardsContainer && !isMobilePortrait()) {
    let position = 0;
    let targetPosition = 0;
    let animationFrame = null;
    let isDragging = false;
    let startX, startPosition;

    function getMaxScroll() {
        const containerWidth = cardsContainer.parentElement.clientWidth;
        const contentWidth = cardsContainer.scrollWidth;
        const containerPadding = 40;
        return Math.max(0, contentWidth - containerWidth + containerPadding);
    }

    function animateScroll() {
        const diff = targetPosition - position;
        if (Math.abs(diff) > 0.2) {
            position += diff * 0.05;
            cardsContainer.style.transform = `translateX(${position}px)`;
            animationFrame = requestAnimationFrame(animateScroll);
        } else {
            position = targetPosition;
            cardsContainer.style.transform = `translateX(${position}px)`;
            animationFrame = null;
        }
    }

    function smoothMove(direction) {
        const step = 15;
        const max = getMaxScroll();
        if (direction > 0) {
            targetPosition -= step;
        } else {
            targetPosition += step;
        }
        if (targetPosition < -max) targetPosition = -max;
        if (targetPosition > 0) targetPosition = 0;
        if (!animationFrame) animateScroll();
    }

    // رویداد اسکرول موس
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) smoothMove(0.5);
        else smoothMove(-0.5);
    }, { passive: false });

    // درگ با موس
    cardsContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.pageX;
        startPosition = targetPosition;
        cardsContainer.style.cursor = "grabbing";
        cardsContainer.style.transition = "none";
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const diff = e.pageX - startX;
        const max = getMaxScroll();
        targetPosition = startPosition + diff * 0.3;
        if (targetPosition > 0) targetPosition = 0;
        if (targetPosition < -max) targetPosition = -max;
        position = targetPosition;
        cardsContainer.style.transform = `translateX(${targetPosition}px)`;
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            cardsContainer.style.cursor = "grab";
            cardsContainer.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
            position = targetPosition;
            if (!animationFrame) animateScroll();
        }
    });

    // کلیک روی کارت‌ها
    cardItems.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.dataset.link;
            if (link) window.location.href = link;
        });
    });

    // مقدار اولیه
    targetPosition = -20;
    position = -20;
    cardsContainer.style.transform = `translateX(${position}px)`;
}

// ===== حالت موبایل عمودی =====
if (isMobilePortrait() && cardItems.length > 0) {
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

    // اسکرول موس عمودی
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) nextCard();
        else prevCard();
    }, { passive: false });

    // رویداد لمسی
    let touchStartY = null;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (touchStartY !== null) {
            const diff = touchStartY - e.touches[0].clientY;
            if (Math.abs(diff) > 20) {
                if (diff > 0) nextCard();
                else prevCard();
                touchStartY = null;
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
    });

    // کلیک روی کارت
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

// ===== تنظیم مجدد در تغییر اندازه صفحه (اختیاری) =====
window.addEventListener('resize', function() {
    // برای سادگی، صفحه ریلود می‌شود تا وضعیت به‌درستی اعمال شود
    location.reload();
});