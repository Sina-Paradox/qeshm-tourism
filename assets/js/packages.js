// ===== مدیریت پکیج‌های سفر =====
document.addEventListener('DOMContentLoaded', function() {
    const packageCards = document.querySelectorAll('.package-card');
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartY = null;
    let touchStartX = null;
    
    const totalPackages = packageCards.length;
    
    // تشخیص حالت موبایل عمودی
    function isMobilePortrait() {
        return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    }
    
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
                nextPackage();
            } else {
                prevPackage();
            }
        }
    }, { passive: false });

    // رویدادهای لمسی (عمودی برای موبایل، افقی برای دسکتاپ)
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isAnimating && touchStartY !== null && touchStartX !== null) {
            const deltaY = touchStartY - e.touches[0].clientY;
            const deltaX = touchStartX - e.touches[0].clientX;
            
            // در موبایل عمودی، جهت عمودی ملاک است
            if (isMobilePortrait()) {
                if (Math.abs(deltaY) > 30) {
                    if (deltaY > 0) {
                        nextPackage();
                    } else {
                        prevPackage();
                    }
                    touchStartY = null;
                    touchStartX = null;
                }
            } else {
                // در دسکتاپ (افقی)، جهت افقی ملاک است
                if (Math.abs(deltaX) > 30) {
                    if (deltaX > 0) {
                        nextPackage(); // swipe left
                    } else {
                        prevPackage(); // swipe right
                    }
                    touchStartY = null;
                    touchStartX = null;
                }
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        touchStartY = null;
        touchStartX = null;
    });

    // کلیدهای صفحه کلید (عمودی برای همه)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            nextPackage();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            prevPackage();
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