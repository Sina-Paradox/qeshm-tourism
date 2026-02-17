const cardsContainer = document.getElementById("cardsContainer");
let position = 0;
let isScrolling = false;
let scrollTimeout;
let targetPosition = 0;
let animationFrame = null;

// ===== منوی کلیکی =====
const hamburgerBtn = document.getElementById("hamburgerBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

if (hamburgerBtn && dropdownMenu) {
    hamburgerBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle("active");
    });
    
    // بستن منو با کلیک روی آیتم‌ها
    const dropItems = document.querySelectorAll(".drop-item");
    dropItems.forEach(item => {
        item.addEventListener("click", function() {
            dropdownMenu.classList.remove("active");
        });
    });
    
    // بستن منو با کلیک خارج از آن
    document.addEventListener("click", function(e) {
        if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove("active");
        }
    });
}

// ===== غیرفعال کردن اسکرول عمودی کل صفحه =====
function disableVerticalScroll(e) {
    e.preventDefault();
    return false;
}

// غیرفعال کردن اسکرول با موس (wheel)
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // حرکت کارت‌ها بر اساس جهت اسکرول با سرعت کمتر
    if (e.deltaY > 0) {
        smoothMove(0.5); // اسکرول به پایین (حرکت کارت‌ها به چپ) - سرعت کمتر
    } else {
        smoothMove(-0.5); // اسکرول به بالا (حرکت کارت‌ها به راست) - سرعت کمتر
    }
}, { passive: false });

// غیرفعال کردن اسکرول لمسی
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    // حرکت کارت‌ها بر اساس جهت اسکرول لمسی با سرعت کمتر
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (!lastTouchY) {
            lastTouchY = touch.clientY;
            return;
        }
        
        const deltaY = touch.clientY - lastTouchY;
        
        if (deltaY > 0) {
            smoothMove(-0.5); // حرکت به بالا (کارت‌ها به راست) - سرعت کمتر
        } else if (deltaY < 0) {
            smoothMove(0.5); // حرکت به پایین (کارت‌ها به چپ) - سرعت کمتر
        }
        
        lastTouchY = touch.clientY;
    }
}, { passive: false });

let lastTouchY = null;

document.addEventListener('touchstart', (e) => {
    lastTouchY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchend', () => {
    lastTouchY = null;
});

// همچنین کلیدهای صفحه کلید (جهت‌های بالا و پایین) را غیرفعال کنیم
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Home' || e.key === 'End' || e.key === ' ') {
        e.preventDefault();
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            smoothMove(0.5); // حرکت به پایین (کارت‌ها به چپ) - سرعت کمتر
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            smoothMove(-0.5); // حرکت به بالا (کارت‌ها به راست) - سرعت کمتر
        }
    }
});

// ===== کارت‌های اسکرول افقی =====

// تابع برای محاسبه حداکثر اسکرول مجاز
function getMaxScroll() {
    const containerWidth = cardsContainer.parentElement.clientWidth;
    const contentWidth = cardsContainer.scrollWidth;
    const containerPadding = 40;
    return Math.max(0, (contentWidth - containerWidth + containerPadding));
}

// تابع انیمیشن نرم با requestAnimationFrame - نرم‌تر و روان‌تر
function animateScroll() {
    const diff = targetPosition - position;
    if (Math.abs(diff) > 0.2) { // آستانه کمتر برای حرکت نرم‌تر
        position += diff * 0.05; // ضریب کمتر برای حرکت نرم‌تر
        cardsContainer.style.transform = `translateX(${position}px)`;
        animationFrame = requestAnimationFrame(animateScroll);
    } else {
        position = targetPosition;
        cardsContainer.style.transform = `translateX(${position}px)`;
        animationFrame = null;
    }
}

// تابع برای حرکت نرم با محدودیت - با سرعت قابل تنظیم
function smoothMove(direction) {
    const step = 15; // کاهش step از 30 به 15 برای حرکت آرام‌تر
    const max = getMaxScroll();
    
    if (direction > 0) { // اسکرول به پایین (حرکت به چپ)
        targetPosition -= step;
        console.log("اسکرول به پایین - حرکت به چپ ✅");
    } else { // اسکرول به بالا (حرکت به راست)
        targetPosition += step;
        console.log("اسکرول به بالا - حرکت به راست ✅");
    }
    
    // محدود کردن به محدوده مجاز
    if (targetPosition < -max) {
        targetPosition = -max;
    }
    if (targetPosition > 0) {
        targetPosition = 0;
    }
    
    if (!animationFrame) {
        animateScroll();
    }
}

// تنظیم موقعیت اولیه برای نمایش ۳ کارت
window.addEventListener("load", () => {
    setTimeout(() => {
        targetPosition = -20;
        position = targetPosition;
        cardsContainer.style.transition = "none";
        cardsContainer.style.transform = `translateX(${position}px)`;
    }, 100);
});

// تنظیم مجدد در صورت تغییر سایز صفحه
window.addEventListener("resize", () => {
    const max = getMaxScroll();
    if (position < -max) {
        targetPosition = -max;
        if (!animationFrame) animateScroll();
    }
    if (position > 0) {
        targetPosition = 0;
        if (!animationFrame) animateScroll();
    }
});

// جلوگیری از درگ کردن تصادفی
cardsContainer.addEventListener("dragstart", (e) => {
    e.preventDefault();
});

// قابلیت کشیدن با موس (دسکتاپ)
let isDragging = false;
let startX;
let startPosition;

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
    
    targetPosition = startPosition + diff * 0.3; // کاهش از 0.4 به 0.3 برای حرکت آرام‌تر
    position = targetPosition;
    
    if (targetPosition > 0) targetPosition = 0;
    if (targetPosition < -max) targetPosition = -max;
    
    cardsContainer.style.transform = `translateX(${targetPosition}px)`;
});

window.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        cardsContainer.style.cursor = "grab";
        cardsContainer.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)"; // افزایش زمان transition
        
        position = targetPosition;
        if (!animationFrame) {
            animateScroll();
        }
    }
});

cardsContainer.style.cursor = "grab";