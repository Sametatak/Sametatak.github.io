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

    // Kapatma fonksiyonu (VİDEO DURDURMA EKLENDİ)
    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        // Modal kapanınca içindeki tüm videoları durdur ve başa sar
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
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

    // 3. Robot Projesi Video Slider'ı
    const robotModal = document.querySelector('#robot-modal');
    let currentRobotSlide = 0;
    let showRobotSlide = () => {};

    if (robotModal) {
        const slides = robotModal.querySelectorAll('.video-slide');
        const prevBtn = robotModal.querySelector('.prev-btn');
        const nextBtn = robotModal.querySelector('.next-btn');
        const numSlides = slides.length;

        // Belirli bir slide'ı gösteren fonksiyon
        showRobotSlide = (index) => {
            slides.forEach((slide, i) => {
                const video = slide.querySelector('video');
                if (i === index) {
                    slide.classList.add('active');
                    // Sadece aktif olan videoyu oynat
                    if (video) {
                        video.play().catch(e => console.warn("Video autoplay was blocked by the browser."));
                    }
                } else {
                    slide.classList.remove('active');
                    // Aktif olmayan videoları durdur
                    if (video) {
                        video.pause();
                    }
                }
            });
        };

        // İleri butonu
        nextBtn.addEventListener('click', () => {
            currentRobotSlide = (currentRobotSlide + 1) % numSlides;
            showRobotSlide(currentRobotSlide);
        });

        // Geri butonu
        prevBtn.addEventListener('click', () => {
            currentRobotSlide = (currentRobotSlide - 1 + numSlides) % numSlides;
            showRobotSlide(currentRobotSlide);
        });
    }

    // Modal açma butonları (SLIDER BAŞLATMA EKLENDİ)
    modalOpenButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;

            const targetModalId = button.getAttribute('data-target-modal');
            const modal = document.querySelector(targetModalId);
            if (modal) {
                modal.classList.add('active');
                
                // Eğer robot modalı açılıyorsa, slider'ı ilk slayttan başlat
                if (targetModalId === '#robot-modal') {
                    currentRobotSlide = 0;
                    showRobotSlide(currentRobotSlide);
                }
            }
        });
    });

});
