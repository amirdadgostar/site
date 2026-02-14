document.addEventListener('DOMContentLoaded', () => {
    
    // مدیریت لودینگ اسکرین (با محدودیت حداکثر 2 ثانیه)
    const loader = document.getElementById('loader');
    let isLoaded = false;

    // تابع نهایی کردن لودینگ و ورود به صفحه
    const finishLoading = () => {
        if (isLoaded) return; // جلوگیری از اجرای تکراری
        isLoaded = true;

        // فید اوت کردن لودر
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden'; 
        
        setTimeout(() => {
            loader.style.display = 'none';
            // فراخوانی انیمیشن ورود دکمه‌های شناور پس از اتمام لودینگ
            initWidgetAnimation();
        }, 500);
    };

    // سناریوی 1: اگر صفحه زودتر لود شد
    window.addEventListener('load', finishLoading);

    // سناریوی 2: اگر لود طول کشید، سر 2 ثانیه به زور وارد شو (طبق دستور)
    setTimeout(finishLoading, 2000);

    // انیمیشن ملایم ظاهر شدن المان‌ها هنگام اسکرول (Intersection Observer)
    const observerOptions = {
        threshold: 0.1, // وقتی ۱۰ درصد المان دیده شد انیمیشن اجرا شود
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // فقط یک‌بار اجرا شود تا پرفورمنس بالا باشد
            }
        });
    }, observerOptions);

    // انتخاب تمام المان‌هایی که کلاس fade-in دارند
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });


    /* ----------------------------------------------------
       منطق ویجت هوشمند ارتباطی
       ---------------------------------------------------- */
    const widgetContainer = document.getElementById('smartWidget');
    const widgetTrigger = document.getElementById('widgetTrigger');
    const notifBadge = document.getElementById('notifBadge');
    const notifSound = document.getElementById('notification-sound');
    let isMenuOpen = false;
    let notificationTriggered = false;

    // تابع مخصوص انیمیشن ورود ویجت (طبق دستور جدید)
    function initWidgetAnimation() {
        // 1 ثانیه صبر بعد از ورود به صفحه
        setTimeout(() => {
            // ظاهر شدن خود دکمه (ویجت)
            widgetContainer.classList.add('intro-visible');

            // 1 ثانیه صبر بعد از ظاهر شدن دکمه برای نمایش عددها
            setTimeout(() => {
                if (!isMenuOpen && !notificationTriggered) {
                    // نمایش بج قرمز
                    notifBadge.classList.add('show');
                    
                    // تلاش برای پخش صدا
                    try {
                        const playPromise = notifSound.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.log('Autoplay prevented by browser (normal behavior).');
                            });
                        }
                    } catch (e) { console.log(e); }

                    // شروع اولین لرزش
                    shakeWidget();
                    
                    notificationTriggered = true;
                }
            }, 1000); // 1 ثانیه بعد از نمایش دکمه
        }, 1000); // 1 ثانیه بعد از محو شدن لودینگ
    }

    // 1. باز و بسته کردن منو با کلیک
    widgetTrigger.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            widgetContainer.classList.add('active');
            // اگر کاربر کلیک کرد، بج نوتیفیکیشن را مخفی کن چون دیده است
            notifBadge.classList.remove('show');
            // لرزش را متوقف کن
            widgetTrigger.classList.remove('shaking');
        } else {
            widgetContainer.classList.remove('active');
        }
    });

    // بستن منو اگر جایی بیرون از ویجت کلیک شد
    document.addEventListener('click', (event) => {
        if (!widgetContainer.contains(event.target) && isMenuOpen) {
            isMenuOpen = false;
            widgetContainer.classList.remove('active');
        }
    });

    // 3. تابع لرزش ویجت
    function shakeWidget() {
        if (!isMenuOpen) {
            widgetTrigger.classList.add('shaking');
            // حذف کلاس بعد از اتمام انیمیشن (1 ثانیه)
            setTimeout(() => {
                widgetTrigger.classList.remove('shaking');
            }, 1000);
        }
    }

    // 4. تنظیم لرزش دوره‌ای (هر 8 ثانیه یکبار تکون بخوره تا توجه جلب کنه)
    setInterval(() => {
        if (notificationTriggered && !isMenuOpen) {
            shakeWidget();
        }
    }, 8000);

});
