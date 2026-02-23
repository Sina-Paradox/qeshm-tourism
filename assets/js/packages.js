// ===== مدیریت پکیج‌های سفر =====
document.addEventListener('DOMContentLoaded', function() {
    const packageCards = document.querySelectorAll('.package-card');
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartY = null;
    let touchStartX = null;
    
    // متغیرهای جمع‌آوری دلتا برای اسکرول
    let accumulatedDelta = 0;
    const deltaThreshold = 50; // آستانه حرکت
    let wheelTimeout = null;
    
    const totalPackages = packageCards.length;
    
    // تشخیص حالت موبایل عمودی
    function isMobilePortrait() {
        return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    }
    
    // ایجاد نشانگر پایین صفحه
    createIndicator();
    
    // تنظیم دستی کلاس‌های اولیه برای نمایش اولین کارت
    packageCards.forEach((card, index) => {
        card.classList.remove('active', 'prev', 'next');
        if (index === 0) {
            card.classList.add('active');
        } else if (index === 1) {
            card.classList.add('next');
        } else if (index === totalPackages - 1) {
            card.classList.add('prev');
        }
    });
    currentIndex = 0;
    updateIndicator();
    
    // ===== توابع کمکی =====
    function createIndicator() {
        // حذف اندیکاتور قبلی اگر وجود دارد
        const oldIndicator = document.querySelector('.package-indicator');
        if (oldIndicator) oldIndicator.remove();
        
        const indicator = document.createElement('div');
        indicator.className = 'package-indicator';
        indicator.innerHTML = `
            <span class="indicator-text">پکیج <span id="current-package">1</span> از ${totalPackages}</span>
            <div class="indicator-dots" id="indicatorDots">
                ${Array(totalPackages).fill().map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
        `;
        document.body.appendChild(indicator);
        
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
        const currentPackageEl = document.getElementById('current-package');
        if (currentPackageEl) {
            currentPackageEl.textContent = currentIndex + 1;
        }
        document.querySelectorAll('.dot').forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function updatePackages(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        isAnimating = true;

        packageCards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            if (index === newIndex) {
                card.classList.add('active');
            } else if (index === newIndex - 1 || (newIndex === 0 && index === totalPackages - 1)) {
                card.classList.add('prev');
            } else if (index === newIndex + 1 || (newIndex === totalPackages - 1 && index === 0)) {
                card.classList.add('next');
            }
        });

        currentIndex = newIndex;
        updateIndicator();

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextPackage() {
        if (isAnimating) return;
        const nextIndex = (currentIndex + 1) % totalPackages;
        updatePackages(nextIndex);
    }

    function prevPackage() {
        if (isAnimating) return;
        const prevIndex = (currentIndex - 1 + totalPackages) % totalPackages;
        updatePackages(prevIndex);
    }

    function goToPackage(index) {
        if (isAnimating || index === currentIndex) return;
        updatePackages(index);
    }

    // ===== رویدادهای اسکرول با جمع‌آوری دلتا =====
    function handleWheel(e) {
        e.preventDefault();
        if (isAnimating) return;
        
        accumulatedDelta += e.deltaY;
        
        if (wheelTimeout) clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            accumulatedDelta = 0;
            wheelTimeout = null;
        }, 150);
        
        if (Math.abs(accumulatedDelta) >= deltaThreshold) {
            if (accumulatedDelta > 0) {
                nextPackage();
            } else {
                prevPackage();
            }
            accumulatedDelta = 0;
            if (wheelTimeout) {
                clearTimeout(wheelTimeout);
                wheelTimeout = null;
            }
        }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });

    // رویدادهای لمسی
    let touchAccumulatedDelta = 0;
    let touchTimeout = null;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchAccumulatedDelta = 0;
        if (touchTimeout) clearTimeout(touchTimeout);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isAnimating || touchStartY === null || touchStartX === null) return;
        
        const deltaY = touchStartY - e.touches[0].clientY;
        const deltaX = touchStartX - e.touches[0].clientX;
        
        if (isMobilePortrait()) {
            touchAccumulatedDelta += deltaY;
            if (touchTimeout) clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                touchAccumulatedDelta = 0;
                touchTimeout = null;
            }, 150);
            
            if (Math.abs(touchAccumulatedDelta) >= deltaThreshold) {
                if (touchAccumulatedDelta > 0) {
                    nextPackage();
                } else {
                    prevPackage();
                }
                touchAccumulatedDelta = 0;
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                    touchTimeout = null;
                }
                touchStartY = null;
                touchStartX = null;
            }
        } else {
            touchAccumulatedDelta += deltaX;
            if (touchTimeout) clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                touchAccumulatedDelta = 0;
                touchTimeout = null;
            }, 150);
            
            if (Math.abs(touchAccumulatedDelta) >= deltaThreshold) {
                if (touchAccumulatedDelta > 0) {
                    nextPackage();
                } else {
                    prevPackage();
                }
                touchAccumulatedDelta = 0;
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                    touchTimeout = null;
                }
                touchStartY = null;
                touchStartX = null;
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
        touchStartX = null;
        touchAccumulatedDelta = 0;
        if (touchTimeout) clearTimeout(touchTimeout);
    });

    // کلیدهای صفحه کلید
    let keyTimeout = null;
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            if (isAnimating || keyTimeout) return;
            nextPackage();
            keyTimeout = setTimeout(() => keyTimeout = null, 300);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            if (isAnimating || keyTimeout) return;
            prevPackage();
            keyTimeout = setTimeout(() => keyTimeout = null, 300);
        }
    });

    // ===== پارامتر URL برای لینک مستقیم =====
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
});