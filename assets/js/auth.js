// ===== مدیریت ورود =====
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                alert('لطفاً نام کاربری و رمز عبور را وارد کنید');
                return;
            }
            
            // دریافت لیست کاربران
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // ذخیره نام کاربری کاربر فعلی
                localStorage.setItem('currentUser', username);
                alert('ورود با موفقیت انجام شد');
                window.location.href = 'index.html';
            } else {
                alert('نام کاربری یا رمز عبور اشتباه است');
            }
        });
    }
    
    // اگر کاربر قبلاً وارد شده بود، مستقیم به صفحه اصلی برود
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }
});