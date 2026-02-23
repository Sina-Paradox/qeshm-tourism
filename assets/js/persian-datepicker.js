// ===== تقویم شمسی اختصاصی با قابلیت رزروهای جهانی =====
class PersianDatepicker {
    constructor(options = {}) {
        this.options = options;
        this.currentDate = options.initialDate ? new Date(options.initialDate) : new Date();
        this.selectedDate = options.initialDate || null;
        this.onSelect = options.onSelect || function() {};
        this.onClose = options.onClose || function() {};
        this.availableDates = options.availableDates || [];
        this.unavailableDates = options.unavailableDates || [];
        this.reservedDates = options.reservedDates || [];
        this.itemType = options.itemType || 'package';
        this.itemId = options.itemId || '';
        
        this.init();
    }
    
    init() {
        this.createDatepicker();
        this.render();
    }
    
    createDatepicker() {
        const oldDatepicker = document.querySelector('.persian-datepicker-overlay');
        if (oldDatepicker) {
            oldDatepicker.remove();
        }
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'persian-datepicker-overlay';
        this.overlay.innerHTML = `
            <div class="persian-datepicker-container">
                <div class="persian-datepicker-header">
                    <h3 class="persian-datepicker-title">انتخاب تاریخ</h3>
                    <button class="persian-datepicker-close">&times;</button>
                </div>
                <div class="persian-datepicker-month-year">
                    <button class="persian-datepicker-nav-btn" id="prevMonth">‹</button>
                    <span id="displayMonthYear"></span>
                    <button class="persian-datepicker-nav-btn" id="nextMonth">›</button>
                </div>
                <div class="persian-datepicker-weekdays">
                    <div class="persian-datepicker-weekday">ش</div>
                    <div class="persian-datepicker-weekday">ی</div>
                    <div class="persian-datepicker-weekday">د</div>
                    <div class="persian-datepicker-weekday">س</div>
                    <div class="persian-datepicker-weekday">چ</div>
                    <div class="persian-datepicker-weekday">پ</div>
                    <div class="persian-datepicker-weekday">ج</div>
                </div>
                <div class="persian-datepicker-days" id="daysContainer"></div>
                <div class="persian-datepicker-footer">
                    <button class="persian-datepicker-btn cancel" id="cancelDate">انصراف</button>
                    <button class="persian-datepicker-btn confirm" id="confirmDate">تأیید</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        const self = this;
        
        this.overlay.querySelector('.persian-datepicker-close').addEventListener('click', function() {
            self.hide();
        });
        
        this.overlay.querySelector('#cancelDate').addEventListener('click', function() {
            self.hide();
        });
        
        this.overlay.querySelector('#confirmDate').addEventListener('click', function() {
            self.confirm();
        });
        
        this.overlay.querySelector('#prevMonth').addEventListener('click', function() {
            self.changeMonth(-1);
        });
        
        this.overlay.querySelector('#nextMonth').addEventListener('click', function() {
            self.changeMonth(1);
        });
        
        this.overlay.addEventListener('click', function(e) {
            if (e.target === self.overlay) {
                self.hide();
            }
        });
        
        this.displayMonthYear = this.overlay.querySelector('#displayMonthYear');
        this.daysContainer = this.overlay.querySelector('#daysContainer');
    }
    
    // ===== توابع تبدیل تاریخ با استفاده از jalaali-js =====
    
    // تبدیل تاریخ میلادی به شمسی
    gregorianToJalali(gy, gm, gd) {
        if (typeof jalaali === 'undefined') {
            console.error('jalaali-js library not loaded');
            return { year: 1403, month: 1, day: 1 };
        }
        const jDate = jalaali.toJalaali(gy, gm, gd);
        return { year: jDate.jy, month: jDate.jm, day: jDate.jd };
    }
    
    // تبدیل تاریخ شمسی به میلادی
    jalaliToGregorian(jy, jm, jd) {
        if (typeof jalaali === 'undefined') {
            console.error('jalaali-js library not loaded');
            return new Date();
        }
        const gDate = jalaali.toGregorian(jy, jm, jd);
        return new Date(gDate.gy, gDate.gm - 1, gDate.gd);
    }
    
    // دریافت تاریخ شمسی فعلی
    getCurrentJalaliDate() {
        const now = new Date();
        return this.gregorianToJalali(
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
        );
    }
    
    // دریافت تعداد روزهای ماه شمسی
    getJalaliDaysInMonth(year, month) {
        if (typeof jalaali === 'undefined') {
            if (month <= 6) return 31;
            if (month <= 11) return 30;
            return 29;
        }
        return jalaali.jalaaliMonthLength(year, month);
    }
    
    // دریافت اولین روز ماه شمسی (0 = شنبه)
    getJalaliFirstDayOfMonth(year, month) {
        const gregorianDate = this.jalaliToGregorian(year, month, 1);
        let day = gregorianDate.getDay(); // 0 = یکشنبه، 1 = دوشنبه، ...
        // تبدیل به شنبه = 0
        return day === 6 ? 0 : day + 1;
    }
    
    // بررسی رزرو بودن تاریخ
    isDateReserved(year, month, day) {
        const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
        
        if (this.reservedDates.includes(dateStr)) {
            return true;
        }
        
        // بررسی در رزروهای همه کاربران
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        for (const user of users) {
            if (user.reservations) {
                for (const reservation of user.reservations) {
                    if (this.itemType === 'package' && reservation.type === 'package') {
                        if (reservation.title === this.itemId && reservation.date === dateStr) {
                            return true;
                        }
                    } else if (this.itemType === 'accommodation' && reservation.type === 'accommodation') {
                        if (reservation.title === this.itemId) {
                            const checkIn = this.parseJalaliDate(reservation.checkIn);
                            const checkOut = this.parseJalaliDate(reservation.checkOut);
                            const current = { year, month, day };
                            
                            if (this.isDateInRange(current, checkIn, checkOut)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    parseJalaliDate(dateStr) {
        const parts = dateStr.split('/');
        return {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2])
        };
    }
    
    isDateInRange(date, start, end) {
        const dateNum = date.year * 10000 + date.month * 100 + date.day;
        const startNum = start.year * 10000 + start.month * 100 + start.day;
        const endNum = end.year * 10000 + end.month * 100 + end.day;
        
        return dateNum >= startNum && dateNum <= endNum;
    }
    
    // بررسی قابل انتخاب بودن تاریخ
    isDateAvailable(year, month, day) {
        // بررسی رزرو بودن
        if (this.isDateReserved(year, month, day)) {
            return false;
        }
        
        const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
        
        if (this.unavailableDates.includes(dateStr)) {
            return false;
        }
        
        if (this.availableDates.length > 0 && !this.availableDates.includes(dateStr)) {
            return false;
        }
        
        // بررسی تاریخ‌های گذشته
        const today = this.getCurrentJalaliDate();
        if (year < today.year || 
            (year === today.year && month < today.month) || 
            (year === today.year && month === today.month && day < today.day)) {
            return false;
        }
        
        return true;
    }
    
    isToday(year, month, day) {
        const today = this.getCurrentJalaliDate();
        return today.year === year && today.month === month && today.day === day;
    }
    
    isSelected(year, month, day) {
        if (!this.selectedDate) return false;
        const selected = this.gregorianToJalali(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate()
        );
        return selected.year === year && selected.month === month && selected.day === day;
    }
    
    getCurrentJalaliDateFromDate(date) {
        return this.gregorianToJalali(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );
    }
    
    // رندر کردن تقویم
    render() {
        const jalali = this.getCurrentJalaliDateFromDate(this.currentDate);
        const daysInMonth = this.getJalaliDaysInMonth(jalali.year, jalali.month);
        const firstDay = this.getJalaliFirstDayOfMonth(jalali.year, jalali.month);
        
        // نمایش ماه و سال
        const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                           'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        this.displayMonthYear.textContent = `${monthNames[jalali.month - 1]} ${jalali.year}`;
        
        // ایجاد روزها
        let daysHTML = '';
        
        // روزهای خالی قبل از اول ماه
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="persian-datepicker-day"></div>';
        }
        
        // روزهای ماه
        for (let day = 1; day <= daysInMonth; day++) {
            const available = this.isDateAvailable(jalali.year, jalali.month, day);
            const reserved = this.isDateReserved(jalali.year, jalali.month, day);
            const today = this.isToday(jalali.year, jalali.month, day);
            const selected = this.isSelected(jalali.year, jalali.month, day);
            
            let classes = 'persian-datepicker-day';
            if (reserved) {
                classes += ' unavailable reserved';
            } else if (available) {
                classes += ' available';
            } else {
                classes += ' unavailable';
            }
            if (today) classes += ' today';
            if (selected) classes += ' selected';
            
            daysHTML += `
                <div class="${classes}" data-year="${jalali.year}" data-month="${jalali.month}" data-day="${day}">
                    <span class="day-circle">${day}</span>
                </div>
            `;
        }
        
        this.daysContainer.innerHTML = daysHTML;
        
        // اضافه کردن رویداد کلیک به روزها
        const self = this;
        this.daysContainer.querySelectorAll('.persian-datepicker-day.available').forEach(dayElement => {
            dayElement.addEventListener('click', function(e) {
                const year = parseInt(this.dataset.year);
                const month = parseInt(this.dataset.month);
                const day = parseInt(this.dataset.day);
                
                self.daysContainer.querySelectorAll('.persian-datepicker-day').forEach(el => {
                    el.classList.remove('selected');
                });
                
                this.classList.add('selected');
                
                self.selectedDate = self.jalaliToGregorian(year, month, day);
            });
        });
    }
    
    // تغییر ماه
    changeMonth(delta) {
        const jalali = this.getCurrentJalaliDateFromDate(this.currentDate);
        jalali.month += delta;
        
        if (jalali.month > 12) {
            jalali.month = 1;
            jalali.year++;
        } else if (jalali.month < 1) {
            jalali.month = 12;
            jalali.year--;
        }
        
        this.currentDate = this.jalaliToGregorian(jalali.year, jalali.month, 1);
        this.render();
    }
    
    show() {
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
    }
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        this.onClose();
    }
    
    confirm() {
        if (this.selectedDate) {
            const jalali = this.gregorianToJalali(
                this.selectedDate.getFullYear(),
                this.selectedDate.getMonth() + 1,
                this.selectedDate.getDate()
            );
            const dateStr = `${jalali.year}/${jalali.month.toString().padStart(2, '0')}/${jalali.day.toString().padStart(2, '0')}`;
            this.onSelect(dateStr, this.selectedDate);
        }
        this.hide();
    }
    
    setDate(date) {
        this.selectedDate = date;
        this.currentDate = date || new Date();
        this.render();
    }
}

// ===== مدیریت مودال انتخاب تاریخ =====
let currentDateSelection = null;

function createDateSelectionModal() {
    const existingModal = document.querySelector('.date-selection-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'date-selection-modal';
    modal.innerHTML = `
        <div class="date-selection-content">
            <h3 class="date-selection-title">انتخاب تاریخ</h3>
            <div class="date-selection-subtitle" id="selectionItemTitle"></div>
            <div id="dateSelectionFields"></div>
            <div class="date-selection-actions">
                <button class="date-selection-btn confirm" id="confirmDateSelection">افزودن به سبد خرید</button>
                <button class="date-selection-btn cancel" id="cancelDateSelection">انصراف</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmDateSelection').addEventListener('click', confirmDateSelection);
    document.getElementById('cancelDateSelection').addEventListener('click', closeDateSelectionModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDateSelectionModal();
        }
    });
}

function getReservedDatesForItem(itemType, itemTitle) {
    const reservedDates = [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    for (const user of users) {
        if (user.reservations) {
            for (const reservation of user.reservations) {
                if (itemType === 'package' && reservation.type === 'package' && reservation.title === itemTitle) {
                    reservedDates.push(reservation.date);
                } else if (itemType === 'accommodation' && reservation.type === 'accommodation' && reservation.title === itemTitle) {
                    const start = parseJalaliDate(reservation.checkIn);
                    const end = parseJalaliDate(reservation.checkOut);
                    
                    let current = { ...start };
                    while (!isDateGreater(current, end)) {
                        const dateStr = `${current.year}/${current.month.toString().padStart(2, '0')}/${current.day.toString().padStart(2, '0')}`;
                        reservedDates.push(dateStr);
                        current = addOneDay(current);
                    }
                }
            }
        }
    }
    
    return reservedDates;
}

function parseJalaliDate(dateStr) {
    const parts = dateStr.split('/');
    return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
    };
}

function isDateGreater(date1, date2) {
    const num1 = date1.year * 10000 + date1.month * 100 + date1.day;
    const num2 = date2.year * 10000 + date2.month * 100 + date2.day;
    return num1 > num2;
}

function addOneDay(date) {
    let { year, month, day } = date;
    const daysInMonth = getJalaliDaysInMonthStatic(year, month);
    
    if (day < daysInMonth) {
        day++;
    } else {
        day = 1;
        if (month < 12) {
            month++;
        } else {
            month = 1;
            year++;
        }
    }
    
    return { year, month, day };
}

function getJalaliDaysInMonthStatic(year, month) {
    if (typeof jalaali !== 'undefined') {
        return jalaali.jalaaliMonthLength(year, month);
    }
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return 29;
}

function showDateSelectionModal(item) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('لطفاً ابتدا وارد شوید', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
        return;
    }
    
    currentDateSelection = item;
    
    let modal = document.querySelector('.date-selection-modal');
    if (!modal) {
        createDateSelectionModal();
        modal = document.querySelector('.date-selection-modal');
    }
    
    document.getElementById('selectionItemTitle').textContent = item.title;
    
    const fieldsContainer = document.getElementById('dateSelectionFields');
    const reservedDates = getReservedDatesForItem(item.type, item.title);
    
    if (item.type === 'package') {
        fieldsContainer.innerHTML = `
            <div class="date-selection-field">
                <label class="date-selection-label">تاریخ اجرای پکیج:</label>
                <input type="text" class="date-selection-input" id="packageDateInput" placeholder="انتخاب تاریخ" readonly>
            </div>
        `;
        
        const packageDateInput = document.getElementById('packageDateInput');
        
        packageDateInput.addEventListener('click', function() {
            const datepicker = new PersianDatepicker({
                initialDate: this._selectedDate || new Date(),
                onSelect: (jalaliDate, gregorianDate) => {
                    this.value = jalaliDate;
                    this._selectedDate = gregorianDate;
                },
                reservedDates: reservedDates,
                itemType: item.type,
                itemId: item.title
            });
            datepicker.show();
        });
        
        setTimeout(() => {
            packageDateInput.click();
        }, 100);
        
    } else {
        fieldsContainer.innerHTML = `
            <div class="date-selection-field">
                <label class="date-selection-label">تاریخ ورود:</label>
                <input type="text" class="date-selection-input" id="checkInDateInput" placeholder="انتخاب تاریخ" readonly>
            </div>
            <div class="date-selection-field">
                <label class="date-selection-label">تاریخ خروج:</label>
                <input type="text" class="date-selection-input" id="checkOutDateInput" placeholder="انتخاب تاریخ" readonly>
            </div>
        `;
        
        const checkInInput = document.getElementById('checkInDateInput');
        const checkOutInput = document.getElementById('checkOutDateInput');
        
        checkInInput.addEventListener('click', function() {
            const datepicker = new PersianDatepicker({
                initialDate: this._selectedDate || new Date(),
                onSelect: (jalaliDate, gregorianDate) => {
                    this.value = jalaliDate;
                    this._selectedDate = gregorianDate;
                },
                reservedDates: reservedDates,
                itemType: item.type,
                itemId: item.title
            });
            datepicker.show();
        });
        
        checkOutInput.addEventListener('click', function() {
            if (!checkInInput._selectedDate) {
                showToast('لطفاً ابتدا تاریخ ورود را انتخاب کنید', 'error');
                return;
            }
            
            const datepicker = new PersianDatepicker({
                initialDate: this._selectedDate || new Date(checkInInput._selectedDate.getTime() + 86400000),
                onSelect: (jalaliDate, gregorianDate) => {
                    if (gregorianDate <= checkInInput._selectedDate) {
                        showToast('تاریخ خروج باید بعد از تاریخ ورود باشد', 'error');
                        return;
                    }
                    this.value = jalaliDate;
                    this._selectedDate = gregorianDate;
                },
                reservedDates: reservedDates,
                itemType: item.type,
                itemId: item.title
            });
            datepicker.show();
        });
        
        setTimeout(() => {
            checkInInput.click();
        }, 100);
    }
    
    modal.classList.add('active');
}

function closeDateSelectionModal() {
    const modal = document.querySelector('.date-selection-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentDateSelection = null;
}

function confirmDateSelection() {
    if (!currentDateSelection) return;
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('لطفاً ابتدا وارد شوید', 'error');
        window.location.href = 'auth.html';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) {
        localStorage.removeItem('currentUser');
        showToast('خطا در دریافت اطلاعات کاربر', 'error');
        window.location.href = 'auth.html';
        return;
    }
    
    const cartItem = {
        ...currentDateSelection,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString()
    };
    
    if (cartItem.type === 'package') {
        const packageDateInput = document.getElementById('packageDateInput');
        if (!packageDateInput || !packageDateInput.value) {
            showToast('لطفاً تاریخ را انتخاب کنید', 'error');
            return;
        }
        cartItem.date = packageDateInput.value;
        cartItem.dateDisplay = packageDateInput.value;
    } else {
        const checkInInput = document.getElementById('checkInDateInput');
        const checkOutInput = document.getElementById('checkOutDateInput');
        
        if (!checkInInput || !checkInInput.value || !checkOutInput || !checkOutInput.value) {
            showToast('لطفاً تاریخ ورود و خروج را انتخاب کنید', 'error');
            return;
        }
        
        cartItem.checkIn = checkInInput.value;
        cartItem.checkOut = checkOutInput.value;
        cartItem.checkInDisplay = checkInInput.value;
        cartItem.checkOutDisplay = checkOutInput.value;
    }
    
    if (!users[userIndex].cart) {
        users[userIndex].cart = [];
    }
    users[userIndex].cart.push(cartItem);
    
    localStorage.setItem('users', JSON.stringify(users));
    
    if (typeof window.updateCartCountDisplay === 'function') {
        window.updateCartCountDisplay();
    }
    
    showToast('آیتم با موفقیت به سبد خرید اضافه شد');
    closeDateSelectionModal();
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function showToast(message, type = 'success') {
    const oldToast = document.querySelector('.toast-message');
    if (oldToast) {
        oldToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== ادغام با سیستم موجود =====
window.showDateModal = showDateSelectionModal;

if (typeof window.updateCartCountDisplay !== 'function') {
    window.updateCartCountDisplay = function() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === currentUser);
            const count = (user?.cart?.length || 0);
            
            cartCounts.forEach(el => {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            });
        } else {
            cartCounts.forEach(el => {
                el.textContent = '0';
                el.style.display = 'none';
            });
        }
    };
}

// ایجاد مودال به صورت خودکار
document.addEventListener('DOMContentLoaded', function() {
    createDateSelectionModal();
});