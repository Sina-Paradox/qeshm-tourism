// ===== مدیریت ثبت‌نام =====
document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.getElementById('registerBtn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // دریافت مقادیر ورودی
            const fullname = document.getElementById('fullname').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // اعتبارسنجی
            if (!fullname || !mobile || !email || !username || !password || !confirmPassword) {
                alert('لطفاً تمام فیلدها را پر کنید');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('رمز عبور و تکرار آن مطابقت ندارند');
                return;
            }
            
            if (password.length < 6) {
                alert('رمز عبور باید حداقل ۶ کاراکتر باشد');
                return;
            }
            
            // بررسی شماره موبایل (ساده)
            if (!/^09[0-9]{9}$/.test(mobile)) {
                alert('شماره موبایل نامعتبر است');
                return;
            }
            
            // بررسی ایمیل (ساده)
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('ایمیل نامعتبر است');
                return;
            }
            
            // ایجاد شیء کاربر
            const user = {
                fullname: fullname,
                mobile: mobile,
                email: email,
                username: username,
                password: password,
                registeredAt: new Date().toISOString(),
                reservations: [], // رزروهای نهایی شده
                cart: [] // سبد خرید موقت
            };
            
            // ذخیره در localStorage
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // بررسی تکراری نبودن نام کاربری
            if (users.some(u => u.username === username)) {
                alert('این نام کاربری قبلاً ثبت شده است');
                return;
            }
            
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            
            // ورود خودکار
            localStorage.setItem('currentUser', username);
            
            alert('ثبت‌نام با موفقیت انجام شد');
            window.location.href = 'index.html';
        });
    }
});