document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Reveal on scroll ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('in'));
    }

    /* ---------- Active nav link ---------- */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [...navLinks].map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const setActive = () => {
        const y = window.scrollY + 140;
        let current = null;
        sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();

    /* ---------- Video spotlight ---------- */
    const stage = document.querySelector('.video-stage');
    if (stage) {
        const slides = stage.querySelectorAll('.video-slide');
        const btns = stage.querySelectorAll('.cam-btn');
        const camIdx = document.getElementById('cam-idx');
        let current = 0;
        let inView = false;

        const playCurrent = () => {
            slides.forEach((s, i) => {
                const v = s.querySelector('video');
                if (!v) return;
                if (i === current && inView) { v.play().catch(() => {}); } else { v.pause(); }
            });
        };
        const show = (i) => {
            current = i;
            slides.forEach((s, k) => s.classList.toggle('active', k === i));
            btns.forEach((b, k) => b.classList.toggle('active', k === i));
            if (camIdx) camIdx.textContent = String(i + 1).padStart(2, '0');
            playCurrent();
        };
        btns.forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.slide))));

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
                playCurrent();
            }, { threshold: 0.35 }).observe(stage);
        }
    }

    /* ---------- Modals ---------- */
    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modal.querySelectorAll('video').forEach((v) => { v.pause(); });
    };
    document.querySelectorAll('[data-target-modal]').forEach((el) => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const modal = document.querySelector(el.dataset.targetModal);
            if (modal) openModal(modal);
        });
    });
    document.querySelectorAll('.modal-close, .modal-overlay').forEach((el) => {
        el.addEventListener('click', () => closeModal(el.closest('.modal')));
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(closeModal);
    });

    /* ---------- Hero: MPPI-style rollout animation ---------- */
    const canvas = document.getElementById('rollouts');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth; h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 46, STEPS = 34;
    const robot = { x: 0, y: 0, th: 0 };
    let goal = { x: 0, y: 0 };
    const obstacles = [];
    let nominal = new Array(STEPS).fill(0);

    const reset = () => {
        robot.x = w * 0.08; robot.y = h * (0.35 + Math.random() * 0.4); robot.th = (Math.random() - 0.5) * 0.6;
        goal = { x: w * 0.92, y: h * (0.25 + Math.random() * 0.5) };
        obstacles.length = 0;
        for (let i = 0; i < 6; i++) {
            obstacles.push({ x: w * (0.3 + Math.random() * 0.5), y: h * (0.15 + Math.random() * 0.7), r: 18 + Math.random() * 30 });
        }
        nominal.fill(0);
    };
    reset();

    const rollout = (noise) => {
        let x = robot.x, y = robot.y, th = robot.th, cost = 0;
        const pts = [[x, y]];
        const v = Math.min(w, 1400) * 0.009;
        for (let t = 0; t < STEPS; t++) {
            th += nominal[t] + noise[t];
            x += Math.cos(th) * v; y += Math.sin(th) * v;
            pts.push([x, y]);
            for (const o of obstacles) {
                const d = Math.hypot(x - o.x, y - o.y) - o.r;
                if (d < 22) cost += (22 - Math.max(d, 0)) * 6;
            }
            if (y < 20 || y > h - 20) cost += 50;
        }
        cost += Math.hypot(x - goal.x, y - goal.y) * 1.2;
        return { pts, cost };
    };

    const randn = () => Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(2 * Math.PI * Math.random());
    const trail = [];

    const draw = () => {
        ctx.clearRect(0, 0, w, h);

        // obstacles
        obstacles.forEach((o) => {
            ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]);
        });

        // sample rollouts
        const samples = [];
        for (let k = 0; k < N; k++) {
            const noise = Array.from({ length: STEPS }, () => randn() * 0.07);
            samples.push({ noise, ...rollout(noise) });
        }
        const minC = Math.min(...samples.map((s) => s.cost));
        const lambda = 40;
        let wsum = 0;
        samples.forEach((s) => { s.wt = Math.exp(-(s.cost - minC) / lambda); wsum += s.wt; });

        samples.forEach((s) => {
            ctx.beginPath();
            s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            const a = 0.04 + 0.22 * (s.wt / (wsum / N + 1e-9)) / N * 6;
            ctx.strokeStyle = `rgba(61,224,255,${Math.min(a, 0.35)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // weighted update
        const upd = new Array(STEPS).fill(0);
        samples.forEach((s) => s.noise.forEach((n, t) => { upd[t] += (s.wt / wsum) * n; }));
        nominal = nominal.map((u, t) => u + upd[t]);

        // best trajectory
        const best = rollout(new Array(STEPS).fill(0));
        ctx.beginPath();
        best.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = 'rgba(198,255,61,0.9)'; ctx.lineWidth = 2.2;
        ctx.shadowColor = '#c6ff3d'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;

        // trail
        ctx.beginPath();
        trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = 'rgba(198,255,61,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();

        // goal
        ctx.beginPath(); ctx.arc(goal.x, goal.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#c6ff3d'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(goal.x, goal.y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(198,255,61,0.3)'; ctx.lineWidth = 1; ctx.stroke();

        // robot
        ctx.save(); ctx.translate(robot.x, robot.y); ctx.rotate(robot.th);
        ctx.fillStyle = '#c6ff3d';
        ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-7, 7); ctx.lineTo(-4, 0); ctx.lineTo(-7, -7); ctx.closePath(); ctx.fill();
        ctx.restore();
    };

    const step = () => {
        // apply first control, shift sequence
        const v = Math.min(w, 1400) * 0.009;
        robot.th += nominal[0];
        robot.x += Math.cos(robot.th) * v * 0.5;
        robot.y += Math.sin(robot.th) * v * 0.5;
        nominal = [...nominal.slice(1), 0];
        trail.push([robot.x, robot.y]);
        if (trail.length > 200) trail.shift();
        if (Math.hypot(robot.x - goal.x, robot.y - goal.y) < 24 || robot.x > w + 40 || robot.x < -40) {
            trail.length = 0; reset();
        }
    };

    if (reduceMotion) { draw(); return; }

    let last = 0, visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
    const loop = (t) => {
        if (visible && t - last > 33) { step(); draw(); last = t; }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
});
