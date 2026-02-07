document.addEventListener('DOMContentLoaded', () => {

    // 1. متغیرها
    const loader = document.getElementById('loader');
    const floatingDock = document.getElementById('floatingDock');
    
    // منوی موبایل
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    // دکمه شناور نئونی
    const mainWidgetBtn = document.getElementById('mainWidgetBtn');
    const widgetOptions = document.getElementById('widgetOptions');
    const widgetMessage = document.getElementById('widgetMessage');
    const notifDot = document.getElementById('notifDot');
    const notifSound = document.getElementById('notifSound');

    // 2. لودینگ و شروع انیمیشن‌ها
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.style.overflow = 'auto'; // فعال کردن اسکرول
                initScrollAnimations();
                floatingDock.classList.add('visible');
                initWidgetNotification();
            }, 500);
        }, 1500); // زمان لودینگ سینمایی
    });

    // 3. ناتیفیکیشن ویجت شناور
    function initWidgetNotification() {
        setTimeout(() => {
            widgetMessage.classList.add('show-msg');
            notifDot.style.display = 'block';
            try {
                // تلاش برای پخش صدا
                notifSound.play().catch(() => console.log('Autoplay prevented by browser'));
            } catch (e) {}
            // مخفی کردن پیام بعد از 6 ثانیه
            setTimeout(() => { widgetMessage.classList.remove('show-msg'); }, 6000);
        }, 4000); // 4 ثانیه تاخیر
    }

    // منطق باز/بسته کردن دکمه شناور
    if(mainWidgetBtn) {
        mainWidgetBtn.addEventListener('click', () => {
            widgetOptions.classList.toggle('active');
            const icon = mainWidgetBtn.querySelector('i');
            if (widgetOptions.classList.contains('active')) {
                icon.classList.remove('fa-message');
                icon.classList.add('fa-xmark');
                notifDot.style.display = 'none';
                widgetMessage.classList.remove('show-msg');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-message');
            }
        });
    }

    // 4. مدیریت منوی موبایل
    function toggleMenu() {
        mobileNav.classList.toggle('active');
    }
    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(l => l.addEventListener('click', toggleMenu));

    // بستن منو با کلیک بیرون از آن (اختیاری ولی کاربردی)
    window.addEventListener('click', (e) => {
        if (e.target === mobileNav) {
            mobileNav.classList.remove('active');
        }
    });

    // 5. انیمیشن اسکرول (Intersection Observer)
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-anim');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
    }

    // 6. اسکرول نرم برای تمام لینک‌های لنگر دار
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#' || targetId === '') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});