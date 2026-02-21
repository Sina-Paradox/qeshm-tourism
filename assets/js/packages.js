// ===== مدیریت پکیج‌های سفر =====
document.addEventListener('DOMContentLoaded', function() {
    const packageCards = document.querySelectorAll('.package-card');
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartY = null;
    
    // تعداد کل پکیج‌ها
    const totalPackages = packageCards.length;
    
    // ایجاد نشانگر پایین صفحه
    createIndicator();
    
    // فعال کردن اولین پکیج
    updatePackages(currentIndex);
    
    // ===== توابع کمکی =====
    function createIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'package-indicator';
        indicator.innerHTML = `
            <span class="indicator-text">پکیج <span id="current-package">1</span> از ${totalPackages}</span>
            <div class="indicator-dots" id="indicatorDots">
                ${Array(totalPackages).fill().map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
        `;
        document.body.appendChild(indicator);
        
        // رویداد کلیک روی دات‌ها
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (!isAnimating && index !== currentIndex) {
                    goToPackage(index);
                }
            });
        });
    }
    
    function updateIndicator() {
        document.getElementById('current-package').textContent = currentIndex + 1;
        document.querySelectorAll('.dot').forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function updatePackages(newIndex) {
        if (isAnimating) return;
        isAnimating = true;
        
        // حذف کلاس‌های قبلی
        packageCards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });
        
        // تنظیم کلاس‌های جدید
        packageCards.forEach((card, index) => {
            if (index === newIndex) {
                card.classList.add('active');
            } else if (index === newIndex - 1 || (newIndex === 0 && index === totalPackages - 1)) {
                card.classList.add('prev');
            } else if (index === newIndex + 1 || (newIndex === totalPackages - 1 && index === 0)) {
                card.classList.add('next');
            }
        });
        
        // به‌روزرسانی ایندکس جاری
        currentIndex = newIndex;
        
        // به‌روزرسانی نشانگر
        updateIndicator();
        
        // پایان انیمیشن
        setTimeout(() => {
            isAnimating = false;
        }, 500); // مطابق با transition در CSS
    }
    
    function nextPackage() {
        if (isAnimating) return;
        const nextIndex = (currentIndex + 1) % totalPackages;
        goToPackage(nextIndex);
    }
    
    function prevPackage() {
        if (isAnimating) return;
        const prevIndex = (currentIndex - 1 + totalPackages) % totalPackages;
        goToPackage(prevIndex);
    }
    
    function goToPackage(index) {
        if (isAnimating || index === currentIndex) return;
        updatePackages(index);
    }
    
    // ===== رویدادهای اسکرول =====
    
    // غیرفعال کردن اسکرول عمودی صفحه
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (!isAnimating) {
            if (e.deltaY > 0) {
                // اسکرول به پایین - پکیج بعدی
                nextPackage();
            } else {
                // اسکرول به بالا - پکیج قبلی
                prevPackage();
            }
        }
    }, { passive: false });
    
    // رویدادهای لمسی
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (touchStartY !== null && !isAnimating) {
            const touchEndY = e.touches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 30) { // آستانه حرکت
                if (diff > 0) {
                    // swipe up - پکیج بعدی
                    nextPackage();
                } else {
                    // swipe down - پکیج قبلی
                    prevPackage();
                }
                touchStartY = null; // جلوگیری از چندبار اجرا
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
            nextPackage();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            prevPackage();
        }
    });
    
    // ===== رویداد کلیک روی آیتم پکیج در صفحه اصلی =====
    // این قسمت برای زمانی که از صفحه اصلی به این صفحه می‌آییم
    const urlParams = new URLSearchParams(window.location.search);
    const packageParam = urlParams.get('package');
    if (packageParam !== null) {
        const index = parseInt(packageParam);
        if (!isNaN(index) && index >= 0 && index < totalPackages) {
            setTimeout(() => {
                goToPackage(index);
            }, 100);
        }
    }
    
    // اضافه کردن رویداد کلیک به کارت "پکیج های گشت جزیره" در صفحه اصلی
    // این قسمت باید در main.js اضافه شود
});