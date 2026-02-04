document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. مدیریت لودینگ مدرن و انیمیشن ورود ---
    // زمان لودینگ را بهینه کردیم (1800 میلی‌ثانیه برای حس بهتر)
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const body = document.body;
        
        // اضافه کردن کلاس برای حرکت اسلایدی به بالا
        loader.classList.add('slide-up');
        
        // فعال کردن اسکرول و نمایش انیمیشن‌های صفحه
        setTimeout(() => {
            body.classList.remove('hidden-content');
            body.classList.add('loaded');
            
            // حذف کامل لودر از DOM بعد از اتمام انیمیشن
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800); // زمان هماهنگ با transition در CSS
            
        }, 300); // تاخیر کوچک برای شروع حرکت

    }, 1800); 

    // --- 2. منوی همبرگری موبایل ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // تغییر آیکون
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // بستن منو با کلیک روی لینک‌ها
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

});