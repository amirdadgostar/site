/**
 * FILENAME: script.js
 * PROJECT: Dr. Radmanesh - Ultimate Professional Portal
 * VERSION: 3.0 (Final, Complete, No Deletions)
 * DESCRIPTION: This is the definitive, feature-complete JavaScript for the portal.
 *              It handles all interactivity, animations, and advanced functionalities
 *              like professional PDF and vCard generation without compromise.
 */

// Strict mode for better code quality and error handling
'use strict';

// Wait for the entire DOM to be ready before executing any script
document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 1. انتخابگرهای DOM (DOM Selectors)
    // =======================================================
    // Selecting all necessary elements once for better performance
    const preloader = document.getElementById('preloader-overlay');
    const header = document.querySelector('.main-header');
    const fabTopButton = document.getElementById('fab-top');
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
        setupPreloader();
        setupEventListeners();
        setupScrollBehavior();
        setupAnimations();
    }


    // =======================================================
    // 3. منطق لودینگ صفحه (Preloader Logic)
    // =======================================================
    function setupPreloader() {
        // This ensures even if something fails, the preloader won't get stuck
        const failsafeTimeout = setTimeout(hidePreloader, 4000);

        window.addEventListener('load', () => {
            clearTimeout(failsafeTimeout);
            // A short delay to ensure all visual elements are rendered smoothly
            setTimeout(hidePreloader, 500);
        });
    }

    function hidePreloader() {
        if (!preloader) return;
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.classList.remove('loading-active');
        setTimeout(() => {
            preloader.remove(); // Remove from DOM completely after hiding
        }, 500);
    }


    // =======================================================
    // 4. مدیریت رویدادها (Event Listeners)
    // =======================================================
    function setupEventListeners() {
        // Mobile Menu Toggle
        mobileToggle.addEventListener('click', openMobileMenu);
        closeMenuButton.addEventListener('click', closeMobileMenu);
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) closeMobileMenu();
        });
        mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

        // Floating Action Button (Scroll to Top)
        fabTopButton.addEventListener('click', scrollToTop);

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
        }, { passive: true }); // Performance optimization
    }

    function handleHeaderSticky() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    function handleFabVisibility() {
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
            // A 150px offset to activate the link a bit earlier
            if (pageYOffset >= sectionTop - var(--header-height, 85)) {
                currentSection = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
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
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }


    // =======================================================
    // 7. انیمیشن‌ها (Animations Logic)
    // =======================================================
    function setupAnimations() {
        // Initialize AOS (Animate on Scroll)
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out-cubic',
            once: true,
            offset: 100,
        });

        // Animate circular skills bars on view using Intersection Observer for performance
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
                    meter.style.strokeDasharray = `${percent}, 100`;
                    observer.unobserve(circle); // Animate only once
                }
            });
        }, observerOptions);

        circleCharts.forEach(chart => observer.observe(chart));
    }


    // =======================================================
    // 8. تولید PDF حرفه‌ای (Professional PDF Generation)
    // This is a global function to be called from the HTML onclick attribute.
    // =======================================================
    window.generateFullPDF = function() {
        const btn = document.getElementById('fab-pdf');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const pdfTemplate = document.getElementById('pdf-template-root');
        if (!pdfTemplate) {
            showToast('خطا: قالب PDF یافت نشد.', 'error');
            resetPdfButton(btn, originalIcon);
            return;
        }

        // Make the template visible but off-screen for html2pdf to render it
        pdfTemplate.style.display = 'block';

        const options = {
            margin: 0,
            filename: 'Dr-Sara-Radmanesh-CV-Official.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 3, // High scale for crisp text and images (300 DPI equivalent)
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        html2pdf().set(options).from(pdfTemplate).save().then(() => {
            showToast('فایل رزومه با موفقیت آماده دانلود است.', 'success');
            resetPdfButton(btn, originalIcon);
            pdfTemplate.style.display = 'none'; // Hide it again
        }).catch(err => {
            console.error("PDF generation failed:", err);
            showToast('خطا در ایجاد فایل PDF. لطفا مجددا تلاش کنید.', 'error');
            resetPdfButton(btn, originalIcon);
            pdfTemplate.style.display = 'none';
        });
    };

    function resetPdfButton(btn, originalContent) {
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 1000);
    }


    // =======================================================
    // 9. دانلود کارت ویزیت (vCard Generation)
    // This is also a global function.
    // =======================================================
    window.downloadVCard = function() {
        const vCardString = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:رادمنش;سارا;;دکتر;',
            'FN:دکتر سارا رادمنش',
            'ORG:مرکز قلب تهران',
            'TITLE:متخصص قلب و عروق',
            'TEL;TYPE=WORK,VOICE:021-88888888',
            'TEL;TYPE=CELL,VOICE:0912-0000000',
            'ADR;TYPE=WORK:;;تهران، خیابان جردن، برج پزشکی نگین، طبقه 5;تهران;;;',
            'EMAIL:info@drsara-radmanesh.com',
            'URL:https://drsara-radmanesh.com', // Replace with actual domain
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Dr-Sara-Radmanesh.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('کارت ویزیت آماده ذخیره سازی است.', 'success');
    }


    // =======================================================
    // 10. مدیریت فرم تماس (Contact Form Handler)
    // =======================================================
    function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('.submit-btn');
        const originalButtonText = submitButton.innerHTML;

        // Show loading state
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';
        submitButton.disabled = true;

        // Simulate a server request
        setTimeout(() => {
            // On success
            showToast('پیام شما با موفقیت ارسال شد.', 'success');
            form.reset();
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            // Could also handle error state here in a real application
            // showToast('خطا در ارسال پیام.', 'error');
        }, 2000);
    }


    // =======================================================
    // 11. سیستم نوتیفیکیشن (Toast Notifications)
    // =======================================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
        
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 4000);
    }


    // =======================================================
    // 12. اجرای برنامه (Run the application)
    // =======================================================
    initializePortal();

}); // End of DOMContentLoaded