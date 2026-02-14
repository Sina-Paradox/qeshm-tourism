const loop = document.getElementById("loop");
let position = 0;
let isScrolling = false;
let scrollTimeout;

// تابع برای محاسبه حداکثر اسکرول مجاز
function getMaxScroll() {
    const containerWidth = loop.parentElement.clientWidth;
    const contentWidth = loop.scrollWidth;
    return (contentWidth - containerWidth) / 2;
}

// تابع برای حرکت نرم
function smoothMove(direction) {
    const step = 60; // مقدار حرکت
    const max = getMaxScroll();
    
    if (direction > 0) { // اسکرول به پایین (حرکت به چپ)
        position -= step;
    } else { // اسکرول به بالا (حرکت به راست)
        position += step;
    }
    
    // محدود کردن موقعیت برای ایجاد لوپ
    if (position > max) position = -max;
    if (position < -max) position = max;
    
    // اعمال تغییر با transition
    loop.style.transition = "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    loop.style.transform = `translateX(${position}px)`;
}

// رویداد اسکرول ماوس
window.addEventListener("wheel", (e) => {
    e.preventDefault(); // جلوگیری از اسکرول عمودی
    
    // حرکت بر اساس جهت اسکرول
    if (e.deltaY > 0) {
        smoothMove(1); // حرکت به چپ
    } else {
        smoothMove(-1); // حرکت به راست
    }
    
    // نشانه‌گذاری برای توقف اسکرول
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    // بعد از توقف اسکرول، transition رو نرمتر میکنیم
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 100);
    
}, { passive: false });

// حرکت با کشیدن ماوس (اختیاری - برای تجربه بهتر)
let isDragging = false;
let startX;
let startPosition;

loop.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX;
    startPosition = position;
    loop.style.cursor = "grabbing";
    loop.style.transition = "none"; // موقع کشیدن transition نداشته باشه
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const diff = e.pageX - startX;
    const max = getMaxScroll();
    
    // حرکت با ماوس
    position = startPosition + diff * 0.5; // ضریب برای نرمی بیشتر
    
    // محدود کردن
    if (position > max) position = -max;
    if (position < -max) position = max;
    
    loop.style.transform = `translateX(${position}px)`;
});

window.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        loop.style.cursor = "grab";
        loop.style.transition = "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }
});

// جلوگیری از درگ کردن تصادفی
loop.addEventListener("dragstart", (e) => {
    e.preventDefault();
});

// تنظیم اولیه
loop.style.cursor = "grab";

// بررسی برای لوپ بی‌نهایت (ریست نرم)
setInterval(() => {
    if (!isScrolling && !isDragging) {
        const max = getMaxScroll();
        // اگه خیلی نزدیک به لبه شد، به آرومی ریست کن
        if (Math.abs(position) > max - 100) {
            position = 0;
            loop.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
            loop.style.transform = `translateX(0px)`;
        }
    }
}, 500);