document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.menu');
    const overlay = document.createElement('div');
    
    overlay.classList.add('menu-overlay');
    document.body.appendChild(overlay);

    function toggleMenu() {
        navToggle.classList.toggle('open');
        menu.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (menu.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking on a link (important for single-page feel or navigation)
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            toggleMenu();
        }
    });

    // Resize listener to clean up state if switching back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && menu.classList.contains('open')) {
            toggleMenu();
        }
    });
});
