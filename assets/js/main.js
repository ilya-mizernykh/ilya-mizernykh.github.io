(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-menu]');
    const toast = document.querySelector('[data-toast]');
    const progressBar = document.querySelector('.page-progress span');
    const airRoute = document.querySelector('.air-route');
    const videoModal = document.querySelector('[data-video-modal]');
    const videoFrame = document.querySelector('[data-video-frame]');
    const videoClose = document.querySelector('[data-video-close]');
    const videoTitle = document.querySelector('#video-modal-title');
    const navLinks = [...document.querySelectorAll('[data-section-nav] a[href^="#"]')];
    const trackedSections = [...document.querySelectorAll('main section[id]')];
    let toastTimer;
    let scrollQueued = false;
    let menuReturnFocus = null;
    let videoReturnFocus = null;

    const closeMenu = () => {
        if (!menuButton || !menu) return;
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
    };

    menuButton?.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
        menu?.setAttribute('aria-hidden', String(isOpen));
        menu?.classList.toggle('is-open', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
        if (!isOpen) {
            menuReturnFocus = document.activeElement;
            menu?.querySelector('a')?.focus();
        } else {
            menuReturnFocus?.focus();
        }
    });

    menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        closeMenu();
        menuButton?.focus({ preventScroll: true });
    }));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && videoModal?.open) {
            event.preventDefault();
            closeVideo();
            return;
        }
        if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menuButton.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu();
    });

    const showToast = (message) => {
        if (!toast || !message) return;
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('is-visible');
        toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
    };

    const closeVideo = () => {
        if (!videoModal?.open) return;
        videoModal.close();
        if (videoFrame) videoFrame.removeAttribute('src');
        videoReturnFocus?.focus({ preventScroll: true });
    };

    document.querySelectorAll('[data-video-id]').forEach((button) => {
        button.addEventListener('click', () => {
            if (window.location.protocol === 'file:') {
                showToast('Видео доступно в опубликованной версии сайта.');
                return;
            }
            if (button.dataset.videoId && videoModal && videoFrame) {
                videoReturnFocus = button;
                if (videoTitle) videoTitle.textContent = button.dataset.videoTitle || 'Видео Ильи Мизерных';
                const params = new URLSearchParams({
                    autoplay: '1',
                    rel: '0',
                    playsinline: '1',
                    origin: window.location.origin,
                });
                videoFrame.src = `https://www.youtube.com/embed/${encodeURIComponent(button.dataset.videoId)}?${params}`;
                videoModal.showModal();
                return;
            }
            showToast('Видео временно недоступно.');
        });
    });

    const performanceControls = [...document.querySelectorAll('[data-performance-target]')];
    const performanceSlides = [...document.querySelectorAll('[data-performance-slide]')];
    const performanceCopies = [...document.querySelectorAll('[data-performance-copy]')];

    const showPerformance = (target) => {
        if (!target) return;
        performanceSlides.forEach((slide) => slide.classList.toggle('is-active', slide.dataset.performanceSlide === target));
        performanceCopies.forEach((copy) => copy.classList.toggle('is-active', copy.dataset.performanceCopy === target));
        performanceControls.forEach((control) => {
            const isActive = control.dataset.performanceTarget === target;
            control.classList.toggle('is-active', isActive);
            control.setAttribute('aria-pressed', String(isActive));
        });
    };

    performanceControls.forEach((control) => {
        control.addEventListener('click', () => showPerformance(control.dataset.performanceTarget));
    });

    videoClose?.addEventListener('click', closeVideo);
    videoModal?.addEventListener('click', (event) => {
        if (event.target === videoModal) closeVideo();
    });
    videoModal?.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeVideo();
    });
    videoModal?.addEventListener('close', () => {
        if (videoFrame) videoFrame.removeAttribute('src');
    });

    document.querySelectorAll('[data-current-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
    } else {
        document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    }

    const animateCounter = (element) => {
        const target = Number(element.dataset.counter);
        if (!Number.isFinite(target) || element.dataset.counted === '1') return;
        element.dataset.counted = '1';
        if (prefersReducedMotion) {
            element.textContent = String(target);
            return;
        }
        const duration = 1100;
        const startedAt = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.55 });
        document.querySelectorAll('[data-counter]').forEach((element) => counterObserver.observe(element));
    } else {
        document.querySelectorAll('[data-counter]').forEach(animateCounter);
    }

    const updateActiveNavigation = () => {
        const marker = window.scrollY + window.innerHeight * 0.35;
        let activeId = '';
        trackedSections.forEach((section) => {
            if (section.offsetTop <= marker) activeId = section.id;
        });
        navLinks.forEach((link) => {
            const isCurrent = activeId !== 'top' && link.getAttribute('href') === `#${activeId}`;
            if (isCurrent) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    };

    const updateScrollEffects = () => {
        scrollQueued = false;
        const scrollTop = window.scrollY;
        const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(scrollTop / scrollable, 0), 1);
        const isMobileRoute = window.innerWidth <= 600;
        header?.classList.toggle('is-scrolled', scrollTop > 36);
        updateActiveNavigation();
        if (isMobileRoute) {
            const routeOffset = progress * 2600;
            airRoute?.setAttribute('viewBox', `0 ${routeOffset.toFixed(2)} 1000 1000`);
            root.style.setProperty('--route-progress', '0');
        } else {
            airRoute?.setAttribute('viewBox', '0 0 1000 3600');
            root.style.setProperty('--route-progress', String(1 - Math.min(progress * 1.35, 1)));
        }
        root.style.setProperty('--hero-shift', `${Math.min(scrollTop * 0.12, 90)}px`);
        root.style.setProperty('--hero-scale', String(1 + Math.min(scrollTop / 16000, 0.035)));
        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener('scroll', () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(updateScrollEffects);
    }, { passive: true });
    window.addEventListener('resize', () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(updateScrollEffects);
    }, { passive: true });
    updateScrollEffects();

    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach((element) => {
            element.addEventListener('pointermove', (event) => {
                const rect = element.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
                const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
                element.style.setProperty('--mx', `${x}px`);
                element.style.setProperty('--my', `${y}px`);
            });
            element.addEventListener('pointerleave', () => {
                element.style.setProperty('--mx', '0px');
                element.style.setProperty('--my', '0px');
            });
        });
    }
})();
