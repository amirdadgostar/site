document.addEventListener('DOMContentLoaded', () => {
    
    // ۱. مدیریت لودینگ اسکرین و نمایش شناورها با تاخیر ۳ ثانیه‌ای
    const loader = document.getElementById('loader-wrapper');
    const fabContainer = document.getElementById('fab-container');
    const fabButtons = document.querySelectorAll('.fab-btn');
    let loaderFinished = false;

    // شبیه‌سازی لودینگ
    setTimeout(() => {
        // محو کردن لودر
        loader.style.opacity = '0';
        
        // حذف کامل لودر از صفحه
        setTimeout(() => {
            loader.style.display = 'none';
            loaderFinished = true; // علامت گذاری اتمام لودینگ

            // --- نمایش انیمیشنی دکمه‌های شناور (دستور شماره ۲) ---
            // تاخیر ۳ ثانیه‌ای پس از اتمام لودینگ (مجموعا حدود ۵ ثانیه از شروع)
            setTimeout(() => {
                // اگر کاربر اسکرول نکرده باشد به بخش تماس، دکمه‌ها را نشان بده
                if (!isContactInView) {
                    showFabs();
                }
            }, 3000); 

        }, 500);

    }, 2000);

    // تابع نمایش دکمه‌ها (پایین به بالا)
    function showFabs() {
        fabContainer.classList.add('show');
        fabButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('slide-in-bottom');
            }, index * 200);
        });
    }

    // تابع مخفی کردن دکمه‌ها (بالا به پایین - معکوس)
    function hideFabs() {
        // برای مخفی کردن دانه‌دانه از بالا به پایین:
        // چون در HTML ترتیب: اینستا، واتساپ، تماس است
        // و در CSS فلکس معکوس است (تماس بالا دیده می‌شود)
        // پس برای بستن از بالا (تماس) باید از آخر آرایه شروع کنیم یا کلاس را برداریم.
        
        // اینجا روش ساده‌تر و تمیزتر: حذف کلاس show از کانتینر و دکمه‌ها
        const reversedButtons = Array.from(fabButtons).reverse(); // تماس، واتساپ، اینستا
        
        reversedButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.remove('slide-in-bottom');
            }, index * 100);
        });

        // بعد از اینکه انیمیشن تمام شد کانتینر را مخفی کن
        setTimeout(() => {
            fabContainer.classList.remove('show');
        }, 500);
    }

    // ۲. مدیریت هوشمند دکمه‌ها در بخش تماس (دستور شماره ۵)
    const contactSection = document.getElementById('contact');
    let isContactInView = false;

    // استفاده از Intersection Observer برای تشخیص رسیدن به بخش تماس
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // کاربر به بخش تماس رسیده -> دکمه‌ها بسته شوند
                isContactInView = true;
                if (loaderFinished) {
                    hideFabs();
                }
            } else {
                // کاربر از بخش تماس خارج شد -> دکمه‌ها باز شوند (اگر لودینگ تمام شده بود)
                isContactInView = false;
                if (loaderFinished) {
                    // یک تاخیر کوچک برای جلوگیری از پرش
                    setTimeout(() => {
                        if(!isContactInView) showFabs();
                    }, 200);
                }
            }
        });
    }, { threshold: 0.2 }); // وقتی ۲۰ درصد باکس تماس دیده شد

    if (contactSection) {
        observer.observe(contactSection);
    }

    // ۳. مدیریت منوی موبایلی
    const menuBtn = document.getElementById('menu-btn');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-item');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navOverlay.classList.toggle('open');
    });

    // بستن منو وقتی روی لینک کلیک شد
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navOverlay.classList.remove('open');
        });
    });

    // ۴. تغییر رنگ هدر هنگام اسکرول
    const header = document.querySelector('.mobile-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ۵. افکت ریز برای کلیک روی باکس‌ها
    const interactiveCards = document.querySelectorAll('.card-interaction');
    interactiveCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});