// 1. Loader (Strict 1.5 Seconds Max Logic)
const loader = document.getElementById('loader');
let isLoaderHidden = false; // Flag to prevent multiple executions

// تابع محو کردن لودر با اطمینان کامل
function hideLoader() {
    // اگر قبلاً لودر حذف شده، دوباره اجرا نکن
    if (isLoaderHidden) return;
    
    if (loader) {
        isLoaderHidden = true;
        
        // اعمال کلاس برای انیمیشن محو شدن
        loader.classList.add('loader-hidden');
        
        // محض اطمینان: بعد از اتمام ترنزیشن، دیسپلی را نان کن که در صفحه نماند
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // 500ms مطابق با ترنزیشن CSS
    }
}

// دستور اول: اجرای تایمر مستقل (حداکثر 1.5 ثانیه)
// این دستور تضمین می‌کند حتی اگر سایت لود نشد، لودینگ برود
setTimeout(hideLoader, 1500);

// دستور دوم: اگر صفحه زودتر لود شد نیز لودر محو شود
window.addEventListener('load', hideLoader);


// 2. Sticky Navbar & Mobile Menu
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    const icon = hamburger.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
});

// Close menu on link click
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-xmark');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// 3. Project Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filter === 'all' || card.classList.contains(filter)) {
                card.style.display = 'block';
                // Trigger reflow/animation
                card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Add keyframes for JS animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(styleSheet);
