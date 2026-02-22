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

// 4. Typed.js Setup
new Typed('#typed-text', {
    strings: ['Modern.', 'Fast.', 'Reliable.'],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|'
});

// 5. Inject Niche Cards
const niches = [
    { name: 'Personal Branding', category: 'Identity', icon: 'user' },
    { name: 'Beauty & Wellness', category: 'Lifestyle', icon: 'sparkles' },
    { name: 'Fitness Coach', category: 'Health', icon: 'dumbbell' },
    { name: 'Legal Consulting', category: 'Corporate', icon: 'scale' },
    { name: 'Luxury Real Estate', category: 'Property', icon: 'home' },
    { name: 'Photography Studio', category: 'Creative', icon: 'camera' },
    { name: 'Interior Design', category: 'Architecture', icon: 'building-2' },
    { name: 'Language Tutors', category: 'Education', icon: 'graduation-cap' },
    { name: 'Gourmet & Bistro', category: 'Culinary', icon: 'utensils-crossed' }
];

const grid = document.getElementById('niche-grid');
niches.forEach((niche, index) => {
    grid.innerHTML += `
        <a href="#inquiry" class="anchor-link block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 group" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
            <div class="flex items-center gap-5">
                <div class="bg-slate-50 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                    <i data-lucide="${niche.icon}" class="w-6 h-6"></i>
                </div>
                <div class="text-left">
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
    if (!content) return; // Defensive check

    const icon = btn.querySelector('[data-lucide="chevron-down"]');
    const iconContainer = btn.querySelector('div.bg-white, div.bg-blue-600');
    const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

    // Close all other FAQ items first
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

    // Header Shadow
    if (scrolled > 20) {
        nav.classList.add('shadow-md');
    } else {
        nav.classList.remove('shadow-md');
    }

    // Floating Contact Visibility (Hide in Hero section, show smoothly afterwards)
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

    // Pricing Dark Mode Header
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
        // For special links like User Account, do not smooth scroll
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

// 10. Toggle Function for Socials (Requested feature)
function toggleSocials() {
    const container = document.getElementById('socials-container');
    if (container) {
        container.classList.toggle('hidden');
    }
}

// 11. Form Logic (Reads categorized data and sends directly without copying)
function getFormData() {
    let message = "✦ *New Website Project Inquiry* ✦\n\n";
    
    // Personal Details
    message += "👤 *Personal Details:*\n";
    const f_name = document.getElementById('f_name') ? document.getElementById('f_name').value.trim() : '';
    if(f_name) message += `Name: ${f_name}\n`;
    const f_email = document.getElementById('f_email') ? document.getElementById('f_email').value.trim() : '';
    if(f_email) message += `Personal Email: ${f_email}\n`;
    
    // Business Details
    message += "\n💼 *Business Details (For the Website):*\n";
    const f_biz = document.getElementById('f_biz') ? document.getElementById('f_biz').value.trim() : '';
    if(f_biz) message += `Business Name: ${f_biz}\n`;
    const f_tag = document.getElementById('f_tag') ? document.getElementById('f_tag').value.trim() : '';
    if(f_tag) message += `Tagline: ${f_tag}\n`;
    const f_template = document.getElementById('f_template') ? document.getElementById('f_template').value.trim() : '';
    if(f_template) message += `Selected Template: ${f_template}\n`;
    const f_bio = document.getElementById('f_bio') ? document.getElementById('f_bio').value.trim() : '';
    if(f_bio) message += `About / Bio: ${f_bio}\n`;
    const f_address = document.getElementById('f_address') ? document.getElementById('f_address').value.trim() : '';
    if(f_address) message += `Business Address: ${f_address}\n`;
    const f_phone = document.getElementById('f_phone') ? document.getElementById('f_phone').value.trim() : '';
    if(f_phone) message += `Business Phone: ${f_phone}\n`;
    const f_maps = document.getElementById('f_maps') ? document.getElementById('f_maps').value.trim() : '';
    if(f_maps) message += `Google Maps Link: ${f_maps}\n`;

    // Added Social & Contact Links (From Toggle)
    const f_biz_email = document.getElementById('f_biz_email') ? document.getElementById('f_biz_email').value.trim() : '';
    const f_ig = document.getElementById('f_ig') ? document.getElementById('f_ig').value.trim() : '';
    const f_tg = document.getElementById('f_tg') ? document.getElementById('f_tg').value.trim() : '';
    const f_wa = document.getElementById('f_wa') ? document.getElementById('f_wa').value.trim() : '';
    const f_linkedin = document.getElementById('f_linkedin') ? document.getElementById('f_linkedin').value.trim() : '';
    
    if(f_biz_email || f_ig || f_tg || f_wa || f_linkedin) {
        message += "\n📱 *Business Contact & Socials:*\n";
        if(f_biz_email) message += `Business Email: ${f_biz_email}\n`;
        if(f_ig) message += `Instagram: ${f_ig}\n`;
        if(f_tg) message += `Telegram: ${f_tg}\n`;
        if(f_wa) message += `WhatsApp: ${f_wa}\n`;
        if(f_linkedin) message += `LinkedIn: ${f_linkedin}\n`;
    }

    return encodeURIComponent(message);
}

// Sends directly to the apps without clipboard copy logic
function submitWhatsApp() { 
    window.open(`https://wa.me/989981426633?text=${getFormData()}`, '_blank'); 
}

function submitEmail() { 
    window.location.href = `mailto:Irtoweb@gmail.com?subject=New Website Project Inquiry&body=${getFormData()}`; 
}
