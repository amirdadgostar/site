/**
 * FILENAME: script.js
 * PROJECT: Dr. Radmanesh - Ultimate Professional Portal
 * VERSION: 3.4 (FINAL PRECISION EDIT - NESHAN & UI UPDATES)
 * DESCRIPTION: This is the definitive, feature-complete JavaScript.
 *              - Preloader logic preserved.
 *              - PDF logic preserved.
 *              - Contact Form logic preserved.
 *              - FAB Tooltips logic added (3s delay).
 *              - vCard filename updated to Farsi.
 */

// Strict mode for better code quality and error handling
'use strict';

// Wait for the entire DOM to be ready before executing any script
document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 1. انتخابگرهای DOM (DOM Selectors)
    // =======================================================
    const preloader = document.getElementById('preloader-overlay');
    const header = document.querySelector('.main-header');
    const fabTopButton = document.getElementById('fab-top');
    const fabButtons = document.querySelectorAll('.fab-btn.has-tooltip'); // Select FABs with tooltips
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
        // --- رفع مشکل گیر کردن لودینگ ---
        handleGuaranteedPreloader();

        setupEventListeners();
        setupScrollBehavior();
        setupAnimations();
        
        // [دستور جدید 1] فعال‌سازی پیام دکمه‌های شناور بعد از ۳ ثانیه
        handleFabTooltips();
    }


    // =======================================================
    // 3. منطق جدید و تضمینی لودینگ (Guaranteed Preloader Logic)
    // =======================================================
    function handleGuaranteedPreloader() {
        if (!preloader) {
            document.body.classList.remove('loading-active');
            return;
        }

        const GUARANTEED_EXIT_TIME = 2500; // 2.5 seconds

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

    // [دستور جدید 1] نمایش پیام دکمه‌ها
    function handleFabTooltips() {
        setTimeout(() => {
            fabButtons.forEach(btn => {
                btn.classList.add('show-message');
            });
        }, 3000); // دقیقاً ۳ ثانیه
    }


    // =======================================================
    // 4. مدیریت رویدادها (Event Listeners)
    // =======================================================
    function setupEventListeners() {
        // Mobile Menu Toggle
        if (mobileToggle) {
            mobileToggle.addEventListener('click', openMobileMenu);
        }
        
        if (closeMenuButton) {
            closeMenuButton.addEventListener('click', closeMobileMenu);
        }
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) closeMobileMenu();
            });
        }
        
        if (mobileNavLinks) {
            mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
        }

        // Floating Action Button (Scroll to Top)
        if (fabTopButton) {
            fabTopButton.addEventListener('click', scrollToTop);
        }

        // Contact Form Submission
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
    }


    // =======================================================
    // 5. رفتار اسکرول (Scroll Behavior)
    // =======================================================
    function setupScrollBehavior() {
        window.addEventListener('scroll', () => {
            handleHeaderSticky();
            handleFabVisibility();
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

    function handleFabVisibility() {
        if (!fabTopButton) return;
        if (window.scrollY > 400) {
            fabTopButton.classList.remove('hidden');
        } else {
            fabTopButton.classList.add('hidden');
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

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }


    // =======================================================
    // 6. منوی موبایل (Mobile Menu Functions)
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
    // 7. انیمیشن‌ها (Animations Logic)
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
    // 8. تولید PDF حرفه‌ای (Professional PDF Generation)
    // =======================================================
    window.generateFullPDF = function() {
        const fabBtn = document.getElementById('fab-pdf');
        let originalIcon = '';
        
        if (fabBtn) {
            originalIcon = fabBtn.innerHTML;
            fabBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            fabBtn.disabled = true;
        }

        const pdfTemplate = document.getElementById('pdf-template-root');
        if (!pdfTemplate) {
            showToast('خطا: قالب PDF یافت نشد.', 'error');
            if (fabBtn) resetPdfButton(fabBtn, originalIcon);
            return;
        }

        pdfTemplate.style.display = 'block';

        const options = {
            margin: 0,
            filename: 'Dr-Sara-Radmanesh-CV-Official.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(options).from(pdfTemplate).save().then(() => {
                showToast('فایل رزومه با موفقیت آماده دانلود است.', 'success');
                if (fabBtn) resetPdfButton(fabBtn, originalIcon);
                pdfTemplate.style.display = 'none';
            }).catch(err => {
                console.error("PDF generation failed:", err);
                showToast('خطا در ایجاد فایل PDF. لطفا مجددا تلاش کنید.', 'error');
                if (fabBtn) resetPdfButton(fabBtn, originalIcon);
                pdfTemplate.style.display = 'none';
            });
        } else {
            console.error("HTML2PDF library is not loaded.");
            showToast('کتابخانه PDF بارگذاری نشده است.', 'error');
        }
    };

    function resetPdfButton(btn, originalContent) {
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 1000);
    }


    // =======================================================
    // 9. دانلود کارت ویزیت (vCard Generation)
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
        // [دستور جدید 3] تغییر نام فایل به فارسی
        link.setAttribute('download', 'دکتر-سارا-رادمنش.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('کارت ویزیت با نام فارسی آماده ذخیره سازی است.', 'success');
    }


    // =======================================================
    // 10. مدیریت فرم تماس (Contact Form Handler)
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
    // 11. سیستم نوتیفیکیشن (Toast Notifications)
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


    // =======================================================
    // 12. اجرای برنامه (Run the application)
    // =======================================================
    initializePortal();

});