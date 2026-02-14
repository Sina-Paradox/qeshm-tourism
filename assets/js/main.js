const loop = document.getElementById("loop");
let position = 0;

// مقدار حداکثر اسکرول (نصف عرض کل)
const maxScroll = () => (loop.scrollWidth - loop.parentElement.clientWidth) / 2;

window.addEventListener("wheel", (e) => {
    e.preventDefault(); // جلوگیری از اسکرول عمودی صفحه

    const step = 80; // سرعت حرکت
    if (e.deltaY > 0) {
        position -= step;
    } else {
        position += step;
    }

    // محدود کردن موقعیت برای ایجاد لوپ بی‌نهایت
    const max = maxScroll();
    if (position > max) position = -max;
    if (position < -max) position = max;

    loop.style.transform = `translateX(${position}px)`;
}, { passive: false });

// لوپ بی‌نهایت با ریست نرم
setInterval(() => {
    const max = maxScroll();
    if (Math.abs(position) >= max - 50) {
        position = 0;
        loop.style.transform = `translateX(0px)`;
    }
}, 200);