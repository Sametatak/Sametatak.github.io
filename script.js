window.addEventListener('DOMContentLoaded', () => {

    // 1. Navigasyon Menüsü için Scroll Takibi
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerOffset = 80; // Sabit header'ın yüksekliği (px)

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - headerOffset) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        if (pageYOffset < sections[0].offsetTop - headerOffset) {
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[href="#about"]').classList.add('active');
        }
    });

    // 2. Modal (Pop-up) Pencere Fonksiyonu
    const modalOpenButtons = document.querySelectorAll('[data-target-modal]');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    // Modal açma butonları (Başarı kutucukları + Proje Kartı)
    modalOpenButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetModalId = button.getAttribute('data-target-modal');
            const modal = document.querySelector(targetModalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });

    // Kapatma fonksiyonu
    const closeModal = (modal) => {
        modal.classList.remove('active');
    };

    // 'X' butonlarına tıklayınca kapat
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Arka plana (overlay) tıklayınca kapat
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            const modal = overlay.closest('.modal');
            closeModal(modal);
        });
    });

});
