
   /**
 * FILENAME: script.js
 * PROJECT: Master Teacher Portal (Final Fix)
 * VERSION: 7.0 (Fixed Loading Logic & Modern Modal)
 * DESCRIPTION: 
 *    - Preloader logic fixed: Now allows access immediately after animation, doesn't wait for heavy assets.
 *    - Modal Logic preserved.
 *    - Form Logic removed (as requested).
 *    - PDF & vCard logic preserved.
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
    
    // انتخابگرهای مودال تماس
    const contactModal = document.getElementById('contact-modal-overlay');
    const openContactBtns = document.querySelectorAll('.btn-open-contact');
    const closeContactBtn = document.querySelector('.close-modal-btn');


    // =======================================================
    // 2. تابع اصلی راه‌اندازی (Main Initializer)
    // =======================================================
    function initializePortal() {
        handleFastPreloader(); // منطق جدید و سریع لودینگ
        setupEventListeners();
        setupScrollBehavior();
        setupAnimations();
        setupFabMenuBehavior();
        setupContactModal();
    }


    // =======================================================
    // 3. منطق لودینگ سریع و ایمن (Fixed Preloader Logic)
    // =======================================================
    function handleFastPreloader() {
        if (!preloader) {
            document.body.classList.remove('loading-active');
            return;
        }

        // مدت زمان انیمیشن پر شدن نوار (سریع‌تر شده)
        const ANIMATION_TIME = 1500; 

        const progressBar = preloader.querySelector('.progress-fill');
        if (progressBar) {
            // شروع انیمیشن پر شدن
            requestAnimationFrame(() => {
                progressBar.style.width = '100%';
            });
        }

        // اجبار به بستن لودینگ بعد از زمان مشخص (بدون توجه به لود شدن عکس‌های سنگین)
        setTimeout(() => {
            closePreloader();
        }, ANIMATION_TIME);

        // تابع بستن لودینگ
        function closePreloader() {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            document.body.classList.remove('loading-active');
            
            // حذف کامل از DOM بعد از محو شدن
            setTimeout(() => {
                if(preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }
    }


    // =======================================================
    // 4. منطق دکمه شناور چندمنظوره (FAB Logic)
    // =======================================================
    function setupFabMenuBehavior() {
        if (!fabMainBtn || !fabMenuContainer) return;

        // نمایش بج (عدد) بعد از 5 ثانیه
        setTimeout(() => {
            if (fabBadge) {
                fabBadge.classList.add('show');
                playSoftNotificationSound();
            }
        }, 5000); 

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
    }

    // =======================================================
    // 5.1. مدیریت مودال تماس (Contact Modal Logic)
    // =======================================================
    function setupContactModal() {
        if (!contactModal) return;

        openContactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                contactModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (closeContactBtn) {
            closeContactBtn.addEventListener('click', () => {
                closeContactModal();
            });
        }

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeContactModal();
            }
        });
    }

    function closeContactModal() {
        if (contactModal) {
            contactModal.classList.remove('active');
            document.body.style.overflow = '';
        }
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
    // 9. تولید PDF حرفه‌ای
    // =======================================================
    window.generateFullPDF = function() {
        const btn = document.getElementById('btn-download-cv');
        if (!btn) return;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> پردازش...';
        btn.disabled = true;

        const element = document.getElementById('pdf-template-root');
        if (!element) {
            showToast('خطا: قالب PDF یافت نشد.', 'error');
            resetPdfButton(btn, originalContent);
            return;
        }

        const initialY = window.scrollY;
        element.style.display = 'block';

        const options = {
            margin: 0,
            filename: 'Tutor-Maryam-Kaviani-CV.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 2, 
                useCORS: true,
                logging: false,
                letterRendering: true,
                scrollY: 0, 
                scrollX: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        html2pdf().from(element).set(options).save().then(() => {
            element.style.display = 'none'; 
            window.scrollTo(0, initialY); 
            resetPdfButton(btn, originalContent);
            showToast('رزومه با موفقیت دانلود شد.', 'success');
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            element.style.display = 'none'; 
            window.scrollTo(0, initialY);
            resetPdfButton(btn, originalContent);
            showToast('خطا در تولید فایل.', 'error');
        });
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
    // 10. دانلود کارت ویزیت
    // =======================================================
    window.downloadVCard = function() {
        const vCardString = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:کاویانی;مریم;;استاد;',
            'FN:استاد مریم کاویانی',
            'ORG:آکادمی زبان انگلیسی کاویانی',
            'TITLE:مدرس ارشد آیلتس و تافل',
            'TEL;TYPE=WORK,VOICE:021-88888888',
            'TEL;TYPE=CELL,VOICE:09120000000',
            'ADR;TYPE=WORK:;;تهران، سعادت آباد، بلوار دریا;تهران;;;',
            'EMAIL:teach@maryam-kaviani.com',
            'URL:https://maryam-kaviani.com', 
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'استاد-مریم-کاویانی.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('کارت ویزیت در مخاطبین ذخیره شد.', 'success');
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
            backgroundColor: type === 'success' ? '#4f46e5' : '#ef4444',
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
