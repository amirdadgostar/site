document.addEventListener("DOMContentLoaded", () => {
    
    // ۱. مدیریت لودینگ پرده‌ای (دقیقاً ۲ ثانیه)
    const loaderOverlay = document.getElementById('loader-overlay');
    
    // شروع پروسه حذف لودینگ بعد از 2000 میلی‌ثانیه (2 ثانیه)
    setTimeout(() => {
        // افزودن کلاس برای کنار رفتن پرده‌ها
        document.body.classList.add('loaded');
        
        // باز کردن اسکرول صفحه
        document.body.style.overflow = 'auto'; 

        // حذف کامل از DOM بعد از اتمام انیمیشن CSS
        setTimeout(() => {
            loaderOverlay.style.display = 'none';
            // شروع تایمر ویجت تماس بعد از لود کامل
            initFloatingWidget();
        }, 1200); // زمان انیمیشن CSS
    }, 2000); // این عدد دقیقاً 2 ثانیه صبر می‌کند

    // ۲. نوار ناوبری هوشمند (تغییر رنگ در اسکرول)
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ۳. مدیریت ویجت تماس شناور
    const floatTrigger = document.getElementById('floatTrigger');
    const floatMenu = document.getElementById('floatMenu');
    const notifBadge = document.getElementById('notifBadge');
    const iconElement = floatTrigger.querySelector('i');
    const textElement = floatTrigger.querySelector('.float-text');
    let isMenuOpen = false;

    // صدای ملایم نوتیفیکیشن
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                // صدای دینگ ملایم
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch(e) {
            console.log("Audio API not supported");
        }
    };

    function initFloatingWidget() {
        // بعد از ۴ ثانیه از لود شدن صفحه
        setTimeout(() => {
            // نمایش بج قرمز
            notifBadge.style.display = 'flex';
            
            // لرزش دکمه
            floatTrigger.classList.add('ringing');
            
            // پخش صدا
            playNotificationSound();

            // حذف کلاس لرزش
            setTimeout(() => {
                floatTrigger.classList.remove('ringing');
            }, 1000);

            // تکرار لرزش ملایم هر ۱۰ ثانیه اگر منو بسته بود
            setInterval(() => {
                if(!isMenuOpen) {
                    floatTrigger.classList.add('ringing');
                    setTimeout(() => floatTrigger.classList.remove('ringing'), 1000);
                }
            }, 10000);

        }, 4000);
    }

    // باز و بسته کردن منو
    floatTrigger.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            floatMenu.classList.add('active');
            notifBadge.style.display = 'none'; // مخفی کردن عدد
            iconElement.classList.remove('fa-headset');
            iconElement.classList.remove('pulse-icon'); // توقف پالس وقتی باز است
            iconElement.classList.add('fa-xmark'); // آیکون ضربدر
            textElement.textContent = "بستن";
        } else {
            floatMenu.classList.remove('active');
            iconElement.classList.remove('fa-xmark');
            iconElement.classList.add('fa-headset');
            iconElement.classList.add('pulse-icon');
            textElement.textContent = "مشاوره رایگان";
        }
    });
});

// تابع اسکرول نرم به بخش تماس
function scrollToContact() {
    const contactSection = document.getElementById('contact-area');
    if(contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}