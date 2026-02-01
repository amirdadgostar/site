/**
 * Project: Dr. Radmanesh Official Resume
 * Version: 2.0 (2026 Edition)
 * Author: Senior Developer
 * Description: Main interactivity, PDF generation, and Contact Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // -------------------------------------------------------------------------
    // 1. تنظیمات اولیه و انیمیشن‌ها (Initialization)
    // -------------------------------------------------------------------------
    
    // راه‌اندازی کتابخانه انیمیشن اسکرول (AOS)
    AOS.init({
        duration: 1000, // مدت زمان انیمیشن‌ها
        easing: 'ease-in-out', // نوع حرکت
        once: true, // انیمیشن فقط یک بار اجرا شود
        offset: 100, // فاصله از پایین صفحه برای شروع
    });

    // مدیریت صفحه لودینگ (Preloader)
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        // تاخیر کوتاه برای اطمینان از لود کامل عکس‌ها
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            document.body.classList.remove('loading-state');
        }, 800);
    });

    // به روز رسانی سال کپی‌رایت به صورت خودکار
    const yearSpan = document.querySelector('.footer-bottom p');
    if(yearSpan) {
        const currentYear = new Date().getFullYear();
        if(currentYear > 2026) yearSpan.innerHTML = yearSpan.innerHTML.replace('2026', currentYear);
    }

    // -------------------------------------------------------------------------
    // 2. مدیریت نوار پیمایش و منوی موبایل (Navigation)
    // -------------------------------------------------------------------------
    
    const header = document.querySelector('.main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const scrollTopBtn = document.getElementById('scroll-top');

    // تغییر استایل هدر هنگام اسکرول
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            header.style.padding = '0'; // فشرده‌تر شدن هدر
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
            header.style.padding = ''; // بازگشت به حالت اولیه
        }

        // نمایش/عدم نمایش دکمه بازگشت به بالا
        if (window.scrollY > 500) {
            scrollTopBtn.classList.remove('hide');
        } else {
            scrollTopBtn.classList.add('hide');
        }

        // فعال‌سازی لینک‌های منو بر اساس موقعیت اسکرول
        activeMenuOnScroll();
    });

    // باز و بسته کردن منوی موبایل
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // تغییر آیکون همبرگری به ضربدر
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            navLinks.style.display = ''; // بازگشت به css اصلی
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });

    // اسکرول نرم به بالا
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // اسکرول نرم برای لینک‌های منو
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            // بستن منو در موبایل اگر باز باشد
            if(window.innerWidth < 768 && navLinks.classList.contains('active')) {
                menuToggle.click();
            }
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. توابع پیشرفته: دانلود PDF و کارت ویزیت
    // -------------------------------------------------------------------------

    // اتصال دکمه شناور PDF به تابع اصلی
    const floatPdfBtn = document.getElementById('download-pdf-float');
    if(floatPdfBtn) {
        floatPdfBtn.addEventListener('click', downloadPDF);
    }

    // اتصال فرم تماس
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

/**
 * تابع تولید و دانلود فایل PDF رزومه
 * استفاده از کتابخانه html2pdf برای رندر دقیق
 */
function downloadPDF() {
    // انتخاب المانی که باید تبدیل شود
    const element = document.getElementById('resume-content-area');
    
    // تغییر متن دکمه برای اطلاع کاربر
    const btn = document.querySelector('.hero-btns .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ایجاد فایل...';
    
    // تنظیمات پیشرفته برای کیفیت بالا
    const opt = {
        margin:       [0, 0, 0, 0], // حذف حاشیه‌ها
        filename:     'Dr-Sara-Radmanesh-Resume-2026.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, // افزایش رزولوشن (2x)
            useCORS: true, // اجازه لود عکس‌های خارجی
            scrollY: 0,
            letterRendering: true
        },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // اجرای عملیات تبدیل
    // نکته: ما از Promise استفاده می‌کنیم تا بعد از اتمام دکمه را برگردانیم
    html2pdf().set(opt).from(element).save().then(() => {
        // بازگرداندن متن دکمه بعد از دانلود
        setTimeout(() => {
            btn.innerHTML = originalText;
            showNotification('فایل رزومه با موفقیت دانلود شد', 'success');
        }, 1000);
    }).catch(err => {
        console.error('PDF Error:', err);
        btn.innerHTML = originalText;
        showNotification('خطا در دانلود فایل. لطفاً مجدد تلاش کنید.', 'error');
    });
}

/**
 * تابع تولید و دانلود کارت ویزیت الکترونیکی (vCard)
 * قابل ذخیره در مخاطبین گوشی (اندروید و آیفون)
 */
function saveVCard() {
    // اطلاعات مخاطب (دکتر سارا رادمنش)
    const contact = {
        name: "Radmanesh;Sara;;Dr.;",
        fn: "Dr. Sara Radmanesh",
        org: "Tehran Heart Center",
        title: "Cardiologist & Interventionist",
        tel: "+982188888888",
        cell: "+989120000000",
        email: "info@drradmanesh.com",
        url: "https://drsara-radmanesh.com",
        adr: ";;Jordan St, Negin Tower;Tehran;;;Iran"
    };

    // ساختار استاندارد VCF نسخه 3.0
    const vCardData = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${contact.name}`,
        `FN:${contact.fn}`,
        `ORG:${contact.org}`,
        `TITLE:${contact.title}`,
        `TEL;TYPE=WORK,VOICE:${contact.tel}`,
        `TEL;TYPE=CELL,VOICE:${contact.cell}`,
        `EMAIL;TYPE=WORK,INTERNET:${contact.email}`,
        `URL:${contact.url}`,
        `ADR;TYPE=WORK:;;${contact.adr}`,
        `NOTE:متخصص قلب و عروق - فلوشیپ اینترونشنال`,
        "END:VCARD"
    ].join("\n");

    // ایجاد فایل برای دانلود
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    // ایجاد لینک موقت و کلیک روی آن
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute("download", "Dr-Radmanesh.vcf");
    document.body.appendChild(link);
    link.click();
    
    // پاکسازی
    document.body.removeChild(link);
    showNotification('کارت ویزیت آماده ذخیره در مخاطبین است', 'success');
}

/**
 * مدیریت ارسال فرم تماس (شبیه‌سازی)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    // حالت لودینگ
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';
    btn.disabled = true;

    // شبیه‌سازی ارسال به سرور (2 ثانیه تاخیر)
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> ارسال شد';
        btn.style.background = '#10b981'; // رنگ سبز موفقیت
        
        showNotification('پیام شما با موفقیت ارسال شد. به زودی پاسخ می‌دهیم.', 'success');
        e.target.reset();

        // بازگشت به حالت اول
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = ''; // حذف استایل اینلاین
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

/**
 * سیستم نوتیفیکیشن ساده و زیبا (Toast)
 * بدون نیاز به کتابخانه خارجی
 */
function showNotification(message, type = 'info') {
    // ساخت المان نوتیفیکیشن
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    let icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    // استایل‌دهی دینامیک (اضافه کردن به DOM)
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? '#0f766e' : '#e11d48',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '10000',
        transform: 'translateY(100px)',
        opacity: '0',
        transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        fontFamily: '"Vazirmatn", sans-serif',
        fontSize: '0.95rem'
    });

    document.body.appendChild(toast);

    // انیمیشن ورود
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 100);

    // حذف خودکار بعد از 4 ثانیه
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

/**
 * تشخیص آیتم فعال منو هنگام اسکرول
 */
function activeMenuOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLi = document.querySelectorAll('.nav-links li a');
    
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // 150 پیکسل افست برای دقت بیشتر
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLi.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href').includes(current)) {
            a.classList.add('active');
        }
    });
}