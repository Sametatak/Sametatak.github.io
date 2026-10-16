document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    /* Theme toggle */
    const toggle = document.querySelector('.theme-toggle');
    const isDark = () => root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggle?.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    /* Header border on scroll + active nav link */
    const topbar = document.querySelector('.topbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [...navLinks].map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const onScroll = () => {
        topbar.classList.toggle('scrolled', window.scrollY > 8);
        const y = window.scrollY + 120;
        let current = null;
        sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Reveal on scroll */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { threshold: 0.1 });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('in'));
    }

    /* Video tabs — play only the visible one, only while on screen */
    const project = document.querySelector('.project');
    if (project) {
        const slides = project.querySelectorAll('.video-slide');
        const tabs = project.querySelectorAll('.vtab');
        let current = 0, inView = false;
        const sync = () => {
            slides.forEach((s, i) => {
                const v = s.querySelector('video');
                if (i === current && inView) v.play().catch(() => {}); else v.pause();
            });
        };
        tabs.forEach((t) => t.addEventListener('click', () => {
            current = Number(t.dataset.slide);
            slides.forEach((s, i) => s.classList.toggle('active', i === current));
            tabs.forEach((b, i) => b.classList.toggle('active', i === current));
            sync();
        }));
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((e) => { inView = e[0].isIntersecting; sync(); }, { threshold: 0.4 })
                .observe(project.querySelector('.player'));
        }
    }

    /* Copy email */
    const toast = document.querySelector('.toast');
    let toastTimer;
    const showToast = (msg) => {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
    };
    document.querySelectorAll('.copy-email').forEach((b) => b.addEventListener('click', async () => {
        const email = b.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copied — ' + email);
        } catch (e) {
            window.location.href = 'mailto:' + email;
        }
    }));

    /* Modals */
    const open = (m) => { m.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = (m) => { if (!m) return; m.classList.remove('active'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-target-modal]').forEach((el) => el.addEventListener('click', () => {
        const m = document.querySelector(el.dataset.targetModal);
        if (m) open(m);
    }));
    document.querySelectorAll('.modal-close, .modal-overlay').forEach((el) =>
        el.addEventListener('click', () => close(el.closest('.modal'))));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(close);
    });
});
