/**
 * FILENAME: script.js
 * PROJECT: Dr. Radmanesh - Ultimate Professional Portal
 * VERSION: 5.0 (FINAL FIX: RTL & LAYOUT SHIFT)
 * DESCRIPTION: 
 *    - PDF Generation Logic completely rewritten to solve the right-side cut-off issue.
 *    - Implemented "Fixed Position + LTR Wrapper" trick to handle html2canvas RTL bug.
 *    - All previous functionalities (FAB, Toast, Preloader) preserved.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 1. انتخابگرهای DOM (DOM Selectors)
    // =======================================================
    const preloader = document.getElementById('preloader-overlay');
    const header = document.querySelector('.main-header');
    
    // انتخابگرهای سیستم منوی شناور
    const fabMainBtn = document.getElementById('fab-main-toggle');
    const fabMenuContainer = document.getElementById('fab-menu-container');
    const fabBadge = document.getElementById('fab-notification-badge');
    const fabIcon = document.querySelector('.fab-main-icon');
    
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuButton = document.querySelector('.close-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    const allNavLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('.section');
    const circleCharts = document.querySelectorAll('.circle-chart');
    const contactForm = document.getElementById('main-contact-form');


    // =======================================================
    // 2. تابع اصلی راه‌اندازی (Main Initializer)
    // =======================================================
    function initializePortal() {
        handleGuaranteedPreloader();
        setupEventListeners();
        setupScrollBehavior();
        setupAnimations();
        setupFabMenuBehavior();
    }


    // =======================================================
    // 3. منطق لودینگ (Preloader Logic)
    // =======================================================
    function handleGuaranteedPreloader() {
        if (!preloader) {
            document.body.classList.remove('loading-active');
            return;
        }

        const GUARANTEED_EXIT_TIME = 2500; 

        const progressBar = preloader.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.transition = `width ${GUARANTEED_EXIT_TIME}ms ease-out`;
            progressBar.style.width = '100%';
        }

        setTimeout(() => {
            preloader.style.opacity = '0';
            document.body.classList.remove('loading-active');

            preloader.addEventListener('transitionend', () => {
                preloader.remove();
            }, { once: true });
        }, GUARANTEED_EXIT_TIME);
    }


    // =======================================================
    // 4. منطق دکمه شناور چندمنظوره (FAB Logic)
    // =======================================================
    function setupFabMenuBehavior() {
        if (!fabMainBtn || !fabMenuContainer) return;

        // نمایش بج (عدد) بعد از 10 ثانیه
        setTimeout(() => {
            if (fabBadge) {
                fabBadge.classList.add('show');
                playSoftNotificationSound();
            }
        }, 10000); 

        // کلیک روی دکمه برای باز/بسته کردن منو
        fabMainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFabMenu();
        });

        // بستن منو با کلیک بیرون
        document.addEventListener('click', (e) => {
            if (!fabMenuContainer.contains(e.target) && !fabMainBtn.contains(e.target)) {
                fabMenuContainer.classList.remove('active');
                if(fabIcon) fabIcon.classList.replace('fa-xmark', 'fa-headset');
            }
        });
    }

    function toggleFabMenu() {
        const isActive = fabMenuContainer.classList.contains('active');
        
        if (isActive) {
            fabMenuContainer.classList.remove('active');
            if (fabIcon) {
                fabIcon.classList.remove('fa-xmark');
                fabIcon.classList.add('fa-headset');
            }
        } else {
            fabMenuContainer.classList.add('active');
            if (fabBadge) fabBadge.classList.remove('show');
            
            if (fabIcon) {
                fabIcon.classList.remove('fa-headset');
                fabIcon.classList.add('fa-xmark');
            }
        }
    }

    function playSoftNotificationSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 800; 
            gainNode.gain.value = 0.05; 
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } catch (e) {
            // Ignored
        }
    }


    // =======================================================
    // 5. مدیریت رویدادها (Event Listeners)
    // =======================================================
    function setupEventListeners() {
        if (mobileToggle) mobileToggle.addEventListener('click', openMobileMenu);
        if (closeMenuButton) closeMenuButton.addEventListener('click', closeMobileMenu);
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) closeMobileMenu();
            });
        }
        if (mobileNavLinks) {
            mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
        }
        if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);
    }


    // =======================================================
    // 6. رفتار اسکرول (Scroll Behavior)
    // =======================================================
    function setupScrollBehavior() {
        window.addEventListener('scroll', () => {
            handleHeaderSticky();
            updateActiveNavLink();
        }, { passive: true });
    }

    function handleHeaderSticky() {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    function updateActiveNavLink() {
        let currentSection = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const headerHeight = header ? header.offsetHeight : 85;
            if (pageYOffset >= sectionTop - headerHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }


    // =======================================================
    // 7. منوی موبایل (Mobile Menu Functions)
    // =======================================================
    function openMobileMenu() {
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }


    // =======================================================
    // 8. انیمیشن‌ها (Animations Logic)
    // =======================================================
    function setupAnimations() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out-cubic',
                once: true,
                offset: 10, 
            });
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const circle = entry.target;
                    const percent = circle.dataset.percent;
                    const meter = circle.querySelector('.meter');
                    if (meter) {
                        meter.style.strokeDasharray = `${percent}, 100`;
                    }
                    observer.unobserve(circle);
                }
            });
        }, observerOptions);

        circleCharts.forEach(chart => observer.observe(chart));
    }


    // =======================================================
    // 9. تولید PDF (REWRITTEN: FIXED POSITION + LTR WRAPPER TRICK)
    // =======================================================
    window.generateFullPDF = function() {
        const fabBtn = document.getElementById('btn-download-cv'); 
        let originalIcon = '';
        
        if (fabBtn) {
            originalIcon = fabBtn.innerHTML;
            fabBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> پردازش...';
            fabBtn.disabled = true;
        }

        // 1. دریافت قالب اصلی
        const originalTemplate = document.getElementById('pdf-template-root');
        
        if (!originalTemplate) {
            showToast('خطا: قالب PDF یافت نشد.', 'error');
            if (fabBtn) resetPdfButton(fabBtn, originalIcon);
            return;
        }

        // 2. ساخت کانتینر اصلی
        // نکته مهم: استفاده از LTR برای کانتینر مادر تا مختصات به هم نریزد
        const cloneContainer = document.createElement('div');
        
        // استایل‌های حیاتی برای رفع باگ شیفت خوردن
        cloneContainer.style.position = 'fixed'; // فیکس کردن در 0،0
        cloneContainer.style.top = '0';
        cloneContainer.style.left = '0';
        cloneContainer.style.width = '794px'; // عرض دقیق A4
        cloneContainer.style.zIndex = '-9999'; // پشت همه المان‌ها
        cloneContainer.style.direction = 'ltr'; // ترفند: اجبار به LTR برای محاسبه صحیح مختصات
        cloneContainer.style.margin = '0';
        cloneContainer.style.padding = '0';
        cloneContainer.style.background = '#ffffff';

        // کپی کردن محتوا درون کانتینر
        cloneContainer.innerHTML = originalTemplate.innerHTML;
        
        // اضافه کردن به body
        document.body.appendChild(cloneContainer);

        // تنظیم المان داخلی برای نمایش صحیح RTL
        const elementToPrint = cloneContainer.querySelector('.pdf-wrapper-modern');
        if(elementToPrint) {
            elementToPrint.style.display = 'block'; 
            elementToPrint.style.width = '100%';
            elementToPrint.style.direction = 'rtl'; // محتوای داخلی راست‌چین باقی بماند
        }

        // 3. تنظیمات html2pdf برای حذف کامل مارجین‌ها و تطبیق عرض
        const options = {
            margin: 0, // حذف مارجین‌های اضافی
            filename: 'Dr-Sara-Radmanesh-CV.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, 
                useCORS: true,
                logging: false,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 794, // اجبار به عرض دسکتاپ
                width: 794,       // محدود کردن عرض کپچر
                x: 0,             // شروع دقیق از مختصات صفر
                y: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // 4. اجرا
        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(options).from(cloneContainer).save().then(() => {
                showToast('رزومه با موفقیت دانلود شد.', 'success');
                // پاکسازی
                document.body.removeChild(cloneContainer);
                if (fabBtn) resetPdfButton(fabBtn, originalIcon);
            }).catch(err => {
                console.error("PDF Generation Error:", err);
                showToast('خطا در تولید فایل.', 'error');
                if(document.body.contains(cloneContainer)) {
                    document.body.removeChild(cloneContainer);
                }
                if (fabBtn) resetPdfButton(fabBtn, originalIcon);
            });
        } else {
            console.error("Library not loaded.");
            showToast('کتابخانه PDF لود نشد.', 'error');
            if(document.body.contains(cloneContainer)) {
                document.body.removeChild(cloneContainer);
            }
            if (fabBtn) resetPdfButton(fabBtn, originalIcon);
        }
    };

    function resetPdfButton(btn, originalContent) {
        setTimeout(() => {
            if(btn) {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        }, 1000);
    }


    // =======================================================
    // 10. دانلود کارت ویزیت (vCard Generation)
    // =======================================================
    window.downloadVCard = function() {
        const vCardString = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:رادمنش;سارا;;دکتر;',
            'FN:دکتر سارا رادمنش',
            'ORG:مرکز قلب تهران',
            'TITLE:متخصص قلب و عروق',
            'TEL;TYPE=WORK,VOICE:021-00000000',
            'TEL;TYPE=CELL,VOICE:09010000000',
            'ADR;TYPE=WORK:;;تهران، خیابان جردن، برج پزشکی نگین;تهران;;;',
            'EMAIL:info@drsara-radmanesh.com',
            'URL:https://drsara-radmanesh.com', 
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'دکتر-سارا-رادمنش.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('کارت ویزیت را در مخاطبین ذخیره کنید.', 'success');
    }


    // =======================================================
    // 11. مدیریت فرم تماس (Contact Form Handler)
    // =======================================================
    function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('.submit-btn');
        let originalButtonText = '';
        
        if (submitButton) {
            originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';
            submitButton.disabled = true;
        }

        setTimeout(() => {
            showToast('پیام شما با موفقیت ارسال شد.', 'success');
            form.reset();
            
            if (submitButton) {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        }, 2000);
    }


    // =======================================================
    // 12. سیستم نوتیفیکیشن (Toast Notifications)
    // =======================================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translate(-50%, 150%)',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '10001',
            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            opacity: '0',
            fontFamily: 'inherit',
            fontSize: '0.95rem'
        });

        const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translate(-50%, 0)';
            toast.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translate(-50%, 150%)';
            toast.style.opacity = '0';
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 4000);
    }

    initializePortal();
});
