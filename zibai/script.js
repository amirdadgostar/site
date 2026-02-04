document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. مدیریت لودینگ 3 ثانیه ---
    setTimeout(() => {
        const loader = document.getElementById('loader');
        
        // اول شفاف می‌شود (Fade Out)
        loader.style.transition = "opacity 0.5s ease";
        loader.style.opacity = '0';
        
        // بعد از تمام شدن انیمیشن، حذف می‌شود
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);

    }, 3000); // 3000 میلی‌ثانیه = 3 ثانیه دقیق

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