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

// ===== کارت‌های اسکرول افقی =====

// تابع برای محاسبه حداکثر اسکرول مجاز
function getMaxScroll() {
    const containerWidth = cardsContainer.parentElement.clientWidth;
    const contentWidth = cardsContainer.scrollWidth;
    const containerPadding = 40;
    return Math.max(0, (contentWidth - containerWidth + containerPadding));
}

// تابع انیمیشن نرم با requestAnimationFrame
function animateScroll() {
    const diff = targetPosition - position;
    if (Math.abs(diff) > 0.5) {
        position += diff * 0.08;
        cardsContainer.style.transform = `translateX(${position}px)`;
        animationFrame = requestAnimationFrame(animateScroll);
    } else {
        position = targetPosition;
        cardsContainer.style.transform = `translateX(${position}px)`;
        animationFrame = null;
    }
}

// تابع برای حرکت نرم با محدودیت - جهت درست شد
function smoothMove(direction) {
    const step = 30;
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

// رویداد اسکرول ماوس
window.addEventListener("wheel", (e) => {
    e.preventDefault();
    
    if (e.deltaY > 0) {
        smoothMove(1); // اسکرول به پایین
    } else {
        smoothMove(-1); // اسکرول به بالا
    }
    
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 150);
    
}, { passive: false });

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

// قابلیت کشیدن با موس
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
    
    targetPosition = startPosition + diff * 0.4;
    position = targetPosition;
    
    if (targetPosition > 0) targetPosition = 0;
    if (targetPosition < -max) targetPosition = -max;
    
    cardsContainer.style.transform = `translateX(${targetPosition}px)`;
});

window.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        cardsContainer.style.cursor = "grab";
        cardsContainer.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        
        position = targetPosition;
        if (!animationFrame) {
            animateScroll();
        }
    }
});

cardsContainer.style.cursor = "grab";