// ======================= الهيدرز =======================

document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", function () {
            mobileMenu.style.display =
                mobileMenu.style.display === "block" ? "none" : "block";
        });
    }

    // ===================== سلايدر البانر الرئيسي التلقائي =====================
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 1) {
        let currentHeroIndex = 0;
        setInterval(() => {
            heroSlides[currentHeroIndex].classList.remove('active');
            currentHeroIndex = (currentHeroIndex + 1) % heroSlides.length;
            heroSlides[currentHeroIndex].classList.add('active');
        }, 5000); // تغيير الصورة كل 5 ثوانٍ
    }

});


// =====================بينات المحطات والكلام دا ===================
const counters = document.querySelectorAll('.stat-number');
const speed = 80; // كلما قلّ الرقم → زادت سرعة العد

const startCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    const hasExternalPlus = counter.parentElement && counter.parentElement.querySelector('.stat-plus');

    const updateCount = () => {
        const current = parseInt(counter.innerText, 10) || 0;
        const increment = Math.ceil(target / speed);

        if (current < target) {
            counter.innerText = current + increment;
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = hasExternalPlus ? target : (target + "+");
        }
    };

    updateCount();
};

// تشغيل العد عند ظهور القسم
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounter(entry.target);
            observer.unobserve(entry.target); // تشغيل مرة واحدة فقط
        }
    });
}, {
    threshold: 0.5
});

counters.forEach(counter => observer.observe(counter));
const supplierCounter = document.querySelector(".supplier-number");
if (supplierCounter) observer.observe(supplierCounter);




//===============الخدمات (نسخة موحّدة تعتمد على سكرول أصلي في كل الأحجام - ديسكتوب وموبايل)=============
const slider = document.querySelector(".slider");
const slides = Array.from(document.querySelectorAll(".slide"));
const dotsContainer = document.getElementById("sliderDots");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let dots = [];
let currentIndex = 0;
let scrollRAF = null;

// إنشاء النقاط تلقائياً بناءً على عدد الخدمات
if (dotsContainer) {
    slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToIndex(index));
        dotsContainer.appendChild(dot);
    });
    dots = document.querySelectorAll(".dot");
}

function setActiveDot(index) {
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

// بتحدد أي كارت هو الأقرب لمنتصف الحاوية فعليًا وتلونه كـ "active"
function updateActiveSlide() {
    if (!slider || !slides.length) return;

    const containerRect = slider.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(center - containerCenter);
        if (dist < minDist) {
            minDist = dist;
            closestIndex = i;
        }
    });

    currentIndex = closestIndex;

    slides.forEach((slide, i) => {
        slide.classList.remove("active", "side-visible");
        if (i === closestIndex) {
            slide.classList.add("active");
        } else if (Math.abs(i - closestIndex) === 1) {
            slide.classList.add("side-visible");
        }
    });

    setActiveDot(closestIndex);
}

// أثناء السحب/السكرول، بنحدث الكارت النشط بس مرة كل فريم (أداء أفضل)
function onSliderScroll() {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(updateActiveSlide);
}

if (slider) {
    slider.addEventListener("scroll", onSliderScroll, { passive: true });
}

// النقل لكارت معين
function scrollSliderToSlide(index, behavior) {
    if (!slider || !slides[index]) return;

    const sliderRect = slider.getBoundingClientRect();
    const slideRect = slides[index].getBoundingClientRect();

    // الفرق بين مركز الكارت ومركز الحاوية
    const centerDiff =
        (slideRect.left + slideRect.width / 2) -
        (sliderRect.left + sliderRect.width / 2);

    slider.scrollTo({
        left: slider.scrollLeft + centerDiff,
        behavior: behavior
    });
}

function goToIndex(index) {
    if (!slides.length) return;
    const len = slides.length;
    const target = ((index % len) + len) % len; // تدوير: بعد آخر كارت يرجع للأول والعكس
    scrollSliderToSlide(target, "smooth");
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => goToIndex(currentIndex + 1));
}
if (prevBtn) {
    prevBtn.addEventListener("click", () => goToIndex(currentIndex - 1));
}

// تحديث أولي: نبدأ بعرض الكارت الأول (index 0) كـ افتراضي
window.addEventListener("load", () => {
    const defaultIndex = 0; // الكارت الأول
    scrollSliderToSlide(defaultIndex, "auto");
    updateActiveSlide();
});

window.addEventListener("resize", () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(updateActiveSlide);
});


// ============الجزء الخاص بارسال الارقام الي جوجل شيت من الموقع ==================
// تأمين كود فورم الهاتف ليشتغل في جميع الصفحات بدون خطأ
const phoneForm = document.getElementById('phoneForm');

if (phoneForm) {
    phoneForm.addEventListener('submit', function(e) {
        e.preventDefault(); // منع الصفحة من إعادة التحميل
        
        const form = e.target;
        const submitBtn = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        
        submitBtn.innerText = "جاري الإرسال...";
        submitBtn.disabled = true;

        // إرسال البيانات لجوجل شيت في الخلفية
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            mode: 'no-cors'
        })
        .then(() => {
            if (successMessage) successMessage.style.display = 'block';
            form.reset(); 
            submitBtn.innerText = "إرسال";
            submitBtn.disabled = false;
            
            setTimeout(() => { 
                if (successMessage) successMessage.style.display = 'none'; 
            }, 4000);
        })
        .catch(error => {
            console.error('Error!', error.message);
            submitBtn.innerText = "فشل الإرسال، حاول مجدداً";
            submitBtn.disabled = false;
        });
    });
}
// ============الجزء الخاص بارسال الارقام الي جوجل شيت من الموقع ==================


// ===================== تغيير صورة المعرض في صفحات المشاريع =====================
function changeImg(src) {
    const mainImg = document.querySelector('.main-img') || document.querySelector('.project-main-img');
    if (mainImg) {
        mainImg.src = src;
    }
}
