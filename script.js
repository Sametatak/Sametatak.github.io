window.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerOffset = 80; // Sabit header'ın yüksekliği (px)

    // Sayfa kaydırma olayını dinle
    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - headerOffset) {
                current = section.getAttribute('id');
            }
        });

        // Aktif linki ayarla
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        // Eğer en üstteysek "Hakkında" linkini aktif yap
        if (pageYOffset < sections[0].offsetTop - headerOffset) {
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[href="#hakkinda"]').classList.add('active');
        }
    });
});
