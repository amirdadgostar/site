/* ==========================================================================
   Main JavaScript File
   Project: Dr. Alireza Shayegan Resume
   Version: 1.0 (2025 Standard)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INITIALIZATION & AOS (Animate On Scroll)
    // --------------------------------------------------
    AOS.init({
        duration: 800,   // سرعت انیمیشن‌ها
        easing: 'ease-in-out',
        once: true,      // انیمیشن فقط یکبار اجرا شود
        mirror: false,
        offset: 100
    });

    // 2. PRELOADER HANDLING
    // --------------------------------------------------
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', () => {
        // تاخیر کوچک برای اطمینان از لود کامل استایل‌ها
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 800);
    });

    // 3. THEME SWITCHER (Dark/Light Mode)
    // --------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    // چک کردن حافظه برای تم ذخیره شده
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // 4. MOBILE MENU TOGGLE
    // --------------------------------------------------
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-list a');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        menuToggle.classList.toggle('active'); // برای انیمیشن آیکون همبرگری
    });

    // بستن منو وقتی روی لینک کلیک شد
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // 5. TYPEWRITER EFFECT (افکت تایپ متن)
    // --------------------------------------------------
    const typeTarget = document.querySelector('.type-writer');
    if (typeTarget) {
        const texts = typeTarget.getAttribute('data-text').split(',');
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typeTarget.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50; // سرعت پاک کردن بیشتر است
            } else {
                typeTarget.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100; // سرعت نوشتن معمولی
            }

            if (!isDeleting && charIndex === currentText.length) {
                // متن کامل شد، مکث کن
                isDeleting = true;
                typeSpeed = 2000; 
            } else if (isDeleting && charIndex === 0) {
                // متن پاک شد، برو بعدی
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }
        
        // شروع تایپ
        setTimeout(type, 1000);
    }

    // 6. PORTFOLIO TABS (فیلتر کردن نمونه کارها)
    // --------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // حذف کلاس اکتیو از همه دکمه‌ها
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    // انیمیشن کوچک هنگام ظاهر شدن
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 7. ACTIVE LINK ON SCROLL (لینک فعال در منو)
    // --------------------------------------------------
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(li => {
            li.classList.remove('active-link');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active-link');
            }
        });
    });

    // 8. CONTACT FORM HANDLING
    // --------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // شبیه‌سازی ارسال
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> ارسال شد';
                btn.style.background = '#10b981'; // رنگ سبز موفقیت
                
                // ریست کردن فرم
                contactForm.reset();
                
                // نمایش پیام موفقیت (می‌توانید از SweetAlert استفاده کنید)
                alert('پیام شما با موفقیت برای دکتر شایگان ارسال شد. به زودی پاسخ داده خواهد شد.');

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = ''; // بازگشت به رنگ اصلی
                }, 3000);
            }, 2000);
        });
    }

});

// 9. MODAL & DOWNLOAD LOGIC (خارج از DOMContentLoaded برای دسترسی عمومی)
// --------------------------------------------------
const modal = document.getElementById('downloadModal');

// باز کردن مودال
function openDownloadModal() {
    modal.style.display = 'flex';
}

// بستن مودال
function closeDownloadModal() {
    modal.style.display = 'none';
}

// بستن با کلیک بیرون کادر
window.onclick = function(event) {
    if (event.target == modal) {
        closeDownloadModal();
    }
}

// تابع اصلی تولید PDF و vCard
function downloadPDF(type) {
    if (type === 'full') {
        // تنظیمات PDF حرفه‌ای
        const element = document.querySelector('main'); // فقط بخش اصلی سایت پرینت شود
        
        // اطمینان از اینکه در حالت لایت مود پرینت گرفته می‌شود
        const wasDark = document.body.classList.contains('dark-mode');
        if(wasDark) document.body.classList.remove('dark-mode');

        const opt = {
            margin:       [10, 10, 10, 10], // حاشیه به میلی‌متر
            filename:     'Resume-Dr-Shayegan.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // نمایش پیام شروع دانلود
        const btnText = document.querySelector('.dl-option:first-child .text strong');
        const originalText = btnText.textContent;
        btnText.textContent = "در حال ساخت PDF...";

        // تولید PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // بازگرداندن تنظیمات
            if(wasDark) document.body.classList.add('dark-mode');
            btnText.textContent = originalText;
            closeDownloadModal();
        });

    } else if (type === 'summary') {
        // تولید کارت ویزیت (vCard)
        generateVCard();
    }
}

// تابع تولید کارت ویزیت مجازی (vCard)
function generateVCard() {
    // اطلاعات مخاطب
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:شایگان;علیرضا;;دکتر;
FN:دکتر علیرضا شایگان
ORG:آموزش و پرورش تهران
TITLE:دبیر ادبیات و پژوهشگر
TEL;TYPE=CELL:+989123456789
EMAIL:info@alirezashayegan.ir
URL:https://alirezashayegan.ir
ADR;TYPE=WORK:;;میدان انقلاب;تهران;;;ایران
NOTE:مدرس کنکور، ویراستار و مولف کتب آموزشی
END:VCARD`;

    // ایجاد لینک دانلود
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Dr-Shayegan.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    closeDownloadModal();
}