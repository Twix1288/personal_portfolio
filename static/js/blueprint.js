/* ============================================================
   ARCHITECTURAL BLUEPRINT — Interactive Engine
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Scroll Reveal (IntersectionObserver) ----
    const revealElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Don't unobserve — keep watching for re-entry if needed
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ---- Navbar Scroll State ----
    const nav = document.querySelector('.bp-nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 60) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }


    // ---- Mobile Nav Toggle ----
    const navToggle = document.querySelector('.bp-nav-toggle');
    const navLinks  = document.querySelector('.bp-nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            navToggle.textContent = isOpen ? '[CLOSE]' : '[MENU]';
        });
    }


    // ---- Cursor Coordinate Tracker ----
    const tracker = document.getElementById('cursor-tracker');
    if (tracker) {
        let raf = null;
        document.addEventListener('mousemove', (e) => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                tracker.textContent = `X: ${e.clientX}  Y: ${e.clientY}`;
            });
        });
    }


    // ---- Parallax Grid (subtle) ----
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                document.body.style.setProperty(
                    '--parallax-offset',
                    `${scrollY * 0.15}px`
                );
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });


    // ---- Active Nav Link Highlight ----
    const currentPath = window.location.pathname;
    document.querySelectorAll('.bp-nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        }
    });

});
