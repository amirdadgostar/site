// 1. Loading Screen Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 2500); // Increased time slightly to allow animation to finish
    
    // Trigger Floating Button Tooltip
    setTimeout(() => {
        const tooltip = document.getElementById('wa-tooltip');
        if(tooltip) {
            tooltip.classList.add('tooltip-show');
            setTimeout(() => {
                tooltip.classList.remove('tooltip-show');
            }, 8000);
        }
    }, 4000);
});

// 2. Initialize Modern Icons
lucide.createIcons({
    attrs: {
        'stroke-width': 2
    }
});

// 3. AOS Animation Setup
AOS.init({
    once: true,
    offset: 20,
    easing: 'ease-out-cubic',
});

// 4. Typed.js Setup (لحن ساده و روان)
new Typed('#typed-text', {
    strings: ['حضور قدرتمند.', 'طراحی زیبا.', 'سرعت بی‌نظیر.'],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|'
});

// 5. Inject Niche Cards
const niches = [
    { name: 'سالن زیبایی', category: 'آرایشی و زیبایی', icon: 'sparkles' },
    { name: 'کلینیک زیبایی / لیزر', category: 'پزشکی و سلامت', icon: 'activity' },
    { name: 'مربی بدنسازی', category: 'ورزش و سلامت', icon: 'dumbbell' },
    { name: 'مربی زبان', category: 'آموزش', icon: 'languages' },
    { name: 'مربی کنکور', category: 'آموزش تحصیلی', icon: 'graduation-cap' },
    { name: 'دفتر وکالت', category: 'حقوقی', icon: 'scale' },
    { name: 'دفتر املاک', category: 'مستغلات', icon: 'home' },
    { name: 'آتلیه و عکاسی', category: 'هنر و رسانه', icon: 'camera' },
    { name: 'آرایشگاه مردانه', category: 'پیرایش', icon: 'scissors' },
    { name: 'مزون عروس', category: 'پوشاک و مد', icon: 'shirt' },
    { name: 'رستوران', category: 'غذا و نوشیدنی', icon: 'utensils-crossed' },
    { name: 'شیرینی فروشی', category: 'قنادی', icon: 'store' },
    { name: 'دکوراسیون داخلی', category: 'معماری', icon: 'sofa' },
    { name: 'دفتر طراحی و معماری', category: 'مهندسی', icon: 'pen-tool' },
    { name: 'دفتر مشاوره / مشاور', category: 'خدمات مشاوره‌ای', icon: 'users' },
    { name: 'بوتیک', category: 'پوشاک', icon: 'shopping-bag' },
    { name: 'طلافروشی', category: 'زیورآلات', icon: 'gem' },
    { name: 'سخنران', category: 'توسعه فردی', icon: 'mic' },
    { name: 'مؤسسه قرآنی', category: 'مذهبی و فرهنگی', icon: 'book' },
    { name: 'مکانیکی', category: 'خدمات خودرو', icon: 'wrench' },
    { name: 'خواننده', category: 'موسیقی', icon: 'music' },
    { name: 'مداح', category: 'مذهبی', icon: 'mic-2' },
    { name: 'بلاگر / صفحه رسمی', category: 'فضای مجازی', icon: 'instagram' }
];

const grid = document.getElementById('niche-grid');
niches.forEach((niche, index) => {
    grid.innerHTML += `
        <a href="#inquiry" class="anchor-link block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 group" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
            <div class="flex items-center gap-5">
                <div class="bg-slate-50 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                    <i data-lucide="${niche.icon}" class="w-6 h-6"></i>
                </div>
                <div class="text-right w-full">
                    <div class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">${niche.category}</div>
                    <div class="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">${niche.name}</div>
                </div>
            </div>
        </a>
    `;
});
lucide.createIcons({ attrs: { 'stroke-width': 2 }});

// 6. Smooth FAQ Accordion
function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    if (!content) return;

    const icon = btn.querySelector('[data-lucide="chevron-down"]');
    const iconContainer = btn.querySelector('div.bg-white, div.bg-blue-600');
    const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

    document.querySelectorAll('#faq .bg-slate-50').forEach(item => {
        const itemBtn = item.querySelector('button');
        const itemContent = itemBtn.nextElementSibling;
        const itemIcon = itemBtn.querySelector('[data-lucide="chevron-down"]');
        const itemIconContainer = itemBtn.querySelector('div');

        if (itemContent !== content && itemContent.style.maxHeight) {
            itemContent.style.maxHeight = null;
            itemContent.classList.remove('opacity-100');
            itemContent.classList.add('opacity-0');
            if(itemIcon) itemIcon.classList.remove('rotate-180');
            if(itemIconContainer) {
                itemIconContainer.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                itemIconContainer.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
            }
        }
    });

    if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.remove('opacity-0');
        content.classList.add('opacity-100');
        if(icon) icon.classList.add('rotate-180');
        if(iconContainer) {
            iconContainer.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
            iconContainer.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        }
    } else {
        content.style.maxHeight = null;
        content.classList.remove('opacity-100');
        content.classList.add('opacity-0');
        if(icon) icon.classList.remove('rotate-180');
        if(iconContainer) {
            iconContainer.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
            iconContainer.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
        }
    }
}

// 7. Light Parallax, Sticky Header & Floating Contact Visibility Logic
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const nav = document.getElementById('navbar');
    const headerTitle = document.getElementById('header-title-text');
    const mobileBtnIcon = document.getElementById('mobileBtn');
    const navLinks = document.querySelectorAll('#navbar nav a');
    const pricingSection = document.getElementById('pricing');
    const floatingContact = document.getElementById('floating-contact');

    if (scrolled > 20) {
        nav.classList.add('shadow-md');
    } else {
        nav.classList.remove('shadow-md');
    }

    if (floatingContact) {
        const windowHeight = window.innerHeight;
        if (scrolled < windowHeight * 0.8) {
            floatingContact.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            floatingContact.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            floatingContact.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            floatingContact.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
    }

    if (pricingSection && scrolled + 100 > pricingSection.offsetTop) {
        nav.classList.remove('bg-header-light', 'border-slate-200');
        nav.classList.add('bg-header-dark', 'border-slate-700');
        
        if (headerTitle) {
            headerTitle.classList.remove('text-slate-800');
            headerTitle.classList.add('text-white');
        }
        if (mobileBtnIcon) {
            mobileBtnIcon.classList.remove('text-slate-800', 'bg-slate-100', 'hover:bg-slate-200');
            mobileBtnIcon.classList.add('text-white', 'bg-slate-800', 'hover:bg-slate-700');
        }
        navLinks.forEach(link => {
            link.classList.remove('text-slate-600');
            link.classList.add('text-slate-300');
        });
    } else {
        nav.classList.add('bg-header-light', 'border-slate-200');
        nav.classList.remove('bg-header-dark', 'border-slate-700');
        
        if (headerTitle) {
            headerTitle.classList.add('text-slate-800');
            headerTitle.classList.remove('text-white');
        }
        if (mobileBtnIcon) {
            mobileBtnIcon.classList.add('text-slate-800', 'bg-slate-100', 'hover:bg-slate-200');
            mobileBtnIcon.classList.remove('text-white', 'bg-slate-800', 'hover:bg-slate-700');
        }
        navLinks.forEach(link => {
            link.classList.add('text-slate-600');
            link.classList.remove('text-slate-300');
        });
    }
});

// 8. Mobile Menu Toggle & Auto-Close Logic
const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileBtn.addEventListener('click', () => { mobileMenu.classList.toggle('active'); });
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => { mobileMenu.classList.remove('active'); });
});

// 9. Custom Smooth Scrolling
document.querySelectorAll('a[href^="#"], .anchor-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        let targetId = this.getAttribute('href');
        if(!targetId || targetId === '#') { return; }
        if(targetId === '#login') { return; }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    });
});

// 10. Toggle Functions for Form (Maps & Socials)
function toggleMaps() {
    const container = document.getElementById('maps-container');
    container.classList.toggle('hidden');
}

function toggleSocials() {
    const container = document.getElementById('socials-container');
    container.classList.toggle('hidden');
}

// 11. Form Logic (گسترش یافته برای تمام فیلدها و طبقه‌بندی‌های جدید)
function getFormData() {
    let message = "✦ *فرم سفارش طراحی سایت IrToWeb* ✦\n\n";
    
    // اطلاعات شخصی
    message += "👤 *اطلاعات شخصی سفارش‌دهنده:*\n";
    const f_name = document.getElementById('f_name').value.trim();
    if(f_name) message += `نام: ${f_name}\n`;
    const f_email = document.getElementById('f_email').value.trim();
    if(f_email) message += `ایمیل: ${f_email}\n`;
    
    message += "\n💼 *اطلاعات کسب و کار:*\n";
    const f_biz = document.getElementById('f_biz').value.trim();
    if(f_biz) message += `نام کسب و کار: ${f_biz}\n`;
    const f_tag = document.getElementById('f_tag').value.trim();
    if(f_tag) message += `شعار کاری: ${f_tag}\n`;
    const f_template = document.getElementById('f_template').value.trim();
    if(f_template) message += `قالب انتخابی: ${f_template}\n`;
    const f_bio = document.getElementById('f_bio').value.trim();
    if(f_bio) message += `توضیحات: ${f_bio}\n`;
    const f_address = document.getElementById('f_address').value.trim();
    if(f_address) message += `آدرس: ${f_address}\n`;
    const f_phone = document.getElementById('f_phone').value.trim();
    if(f_phone) message += `تلفن کسب و کار: ${f_phone}\n`;

    // درخواست دامنه
    const f_domain = document.getElementById('f_domain');
    if(f_domain && f_domain.checked) {
        message += `\n🌐 *درخواست دامنه:* بله (نیاز به ثبت دامنه .ir با هزینه ۱۵۰ هزار تومان دارد)\n`;
    } else {
        message += `\n🌐 *درخواست دامنه:* خیر\n`;
    }

    // لینک‌های مسیریاب
    const f_balad = document.getElementById('f_balad').value.trim();
    const f_neshan = document.getElementById('f_neshan').value.trim();
    if(f_balad || f_neshan) {
        message += "\n📍 *لینک‌های مسیریاب:*\n";
        if(f_balad) message += `بلد: ${f_balad}\n`;
        if(f_neshan) message += `نشان: ${f_neshan}\n`;
    }

    // شبکه‌های اجتماعی
    const f_ig = document.getElementById('f_ig').value.trim();
    const f_tg = document.getElementById('f_tg').value.trim();
    const f_wa = document.getElementById('f_wa').value.trim();
    const f_eitaa = document.getElementById('f_eitaa').value.trim();
    const f_rubika = document.getElementById('f_rubika').value.trim();
    
    if(f_ig || f_tg || f_wa || f_eitaa || f_rubika) {
        message += "\n📱 *شبکه‌های اجتماعی:*\n";
        if(f_ig) message += `اینستاگرام: ${f_ig}\n`;
        if(f_tg) message += `تلگرام: ${f_tg}\n`;
        if(f_wa) message += `واتساپ: ${f_wa}\n`;
        if(f_eitaa) message += `ایتا: ${f_eitaa}\n`;
        if(f_rubika) message += `روبیکا: ${f_rubika}\n`;
    }

    return encodeURIComponent(message);
}

function submitWhatsApp() { 
    window.open(`https://wa.me/989981426633?text=${getFormData()}`, '_blank'); 
}

// ارسال مستقیم اطلاعات در ایتا بدون کپی کردن
function submitEitaa() {
    const textData = getFormData();
    // ایتا پارامتر text را در URL استاندارد وب پشتیبانی می‌کند که برنامه را باز کرده و متن را آماده ارسال می‌کند
    const eitaaUrl = `https://eitaa.com/irtoweb?text=${textData}`;
    window.location.href = eitaaUrl;
}
