window.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerOffset = 80; // Height of the fixed header (px)

    // Listen for scroll events
    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - headerOffset) {
                current = section.getAttribute('id');
            }
        });

        // Set the active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        // If at the very top, set 'About' as active
        if (pageYOffset < sections[0].offsetTop - headerOffset) {
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[href="#about"]').classList.add('active');
        }
    });
});
