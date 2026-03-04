/**
 * Adventure Portfolio - Main JavaScript
 * Handles theme toggle, parallax effects, panel interactions, and localStorage
 */

class AdventurePortfolio {
    constructor() {
        this.body = document.body;
        this.themeToggle = document.getElementById('themeToggle');
        this.floatingPanel = document.getElementById('floatingPanel');
        this.panelDragHandle = document.getElementById('panelDragHandle');
        this.panelOverlay = document.getElementById('panelOverlay');
        this.panelTitle = document.getElementById('panelTitle');
        this.panelContent = document.getElementById('panelContent');
        this.closeFloatingPanel = document.getElementById('closeFloatingPanel');
        this.starsContainer = document.getElementById('stars');
        this.firefliesContainer = document.getElementById('fireflies');
        this.profileTooltip = document.getElementById('profileTooltip');
        this.tooltipText = document.getElementById('tooltipText');
        this.themeInstruction = document.getElementById('themeInstruction');

        // Theme state
        this.isNightMode = false;

        // Panel state
        this.activePanel = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.panelPosition = { x: 0, y: 0 };

        // Mobile detection
        this.isMobile = window.innerWidth <= 768;

        // Parallax elements
        this.parallaxLayers = document.querySelectorAll('.parallax-layer');

        // Animation frame ID for performance
        this.animationFrame = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadThemePreference();
        this.createStars();
        this.createFireflies();
        this.setupParallax();
        this.animateClouds();
        this.centerPanel(); // Initial panel positioning
        this.setupThemeInstruction(); // Setup theme instruction

        // Initial parallax position
        this.updateParallax();
    }

    setupEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const panelId = link.getAttribute('data-panel');
                this.openPanel(panelId);
            });
        });

        // Close floating panel button
        this.closeFloatingPanel.addEventListener('click', () => {
            this.closeActivePanel();
        });

        // Close panel when clicking on overlay
        this.panelOverlay.addEventListener('click', () => {
            if (this.activePanel) {
                this.closeActivePanel();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActivePanel();
            }
        });

        // Drag functionality (only on desktop)
        this.setupDragFunctionality();

        // Profile photo tooltip sequence
        this.setupProfileTooltip();

        // Contact form submission (event delegation for dynamically added forms)
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contactForm') {
                this.handleContactSubmit(e);
            }
        });

        // Theme instruction click to hide
        this.themeInstruction.addEventListener('click', () => {
            this.hideThemeInstruction();
        });

        // Theme toggle click to hide instruction
        this.themeToggle.addEventListener('click', () => {
            this.hideThemeInstruction();
        });

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    toggleTheme() {
        this.isNightMode = !this.isNightMode;
        this.applyTheme();
        this.saveThemePreference();

        // Update stars and fireflies visibility
        this.updateNightElements();

        // Hide theme instruction when theme is changed
        this.hideThemeInstruction();
    }

    applyTheme() {
        if (this.isNightMode) {
            this.body.classList.add('night-mode');
        } else {
            this.body.classList.remove('night-mode');
        }
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('adventure-portfolio-theme');
        if (savedTheme === 'night') {
            this.isNightMode = true;
            this.applyTheme();
            this.updateNightElements();
        }
    }

    saveThemePreference() {
        const theme = this.isNightMode ? 'night' : 'day';
        localStorage.setItem('adventure-portfolio-theme', theme);
    }

    updateNightElements() {
        if (this.isNightMode) {
            this.starsContainer.style.opacity = '1';
            this.firefliesContainer.style.opacity = '1';
        } else {
            this.starsContainer.style.opacity = '0';
            this.firefliesContainer.style.opacity = '0';
        }
    }

    // ============================================
    // STAR FIELD GENERATION (NIGHT MODE)
    // ============================================

    createStars() {
        const starCount = 100;
        const starsContainer = this.starsContainer;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 70 + '%'; // Keep stars in upper portion

            // Random size
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';

            // Random animation delay
            star.style.animationDelay = Math.random() * 2 + 's';

            starsContainer.appendChild(star);
        }
    }

    // ============================================
    // FIREFLIES GENERATION (NIGHT MODE)
    // ============================================

    createFireflies() {
        const fireflyCount = 15;
        const firefliesContainer = this.firefliesContainer;

        for (let i = 0; i < fireflyCount; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';

            // Random starting position
            firefly.style.left = Math.random() * 100 + '%';
            firefly.style.animationDelay = Math.random() * 8 + 's';
            firefly.style.animationDuration = (Math.random() * 4 + 6) + 's';

            firefliesContainer.appendChild(firefly);
        }
    }

    // ============================================
    // PARALLAX SYSTEM
    // ============================================

    setupParallax() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        };

        const handleMouseMove = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateMouseParallax(e);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Don't apply initial parallax - let it be natural
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;

        this.parallaxLayers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth);

            // Reduce parallax intensity and ensure no movement at top of page
            // Only apply parallax after scrolling down a bit (scrolled > 100px)
            let translateY = 0;
            if (scrolled > 100) {
                // Reduce the parallax effect by using a smaller multiplier
                translateY = -(scrolled * depth * 0.2);
            }

            // Don't apply parallax to clouds - they have their own drift animation
            if (layer.classList.contains('layer-clouds')) {
                // Keep clouds at natural position, let CSS animation handle movement
                layer.style.transform = `translate3d(0, 0, 0)`;
            } else {
                // Explicitly reset forest layer to ensure it stays in place
                if (layer.classList.contains('layer-forest')) {
                    layer.style.transform = `translate3d(0, 0, 0)`;
                } else {
                    layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
                }
            }
        });
    }

    updateMouseParallax(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        const scrolled = window.pageYOffset;

        // Only apply mouse parallax after scrolling down and make it very subtle
        if (scrolled > 100) {
            // Subtle mouse parallax for background elements
            this.parallaxLayers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth);
                const moveX = (mouseX - 0.5) * depth * 5; // Reduced from 20 to 5
                const moveY = (mouseY - 0.5) * depth * 5; // Reduced from 20 to 5

                if (layer.classList.contains('layer-forest') || layer.classList.contains('layer-foreground')) {
                    const currentTransform = layer.style.transform;
                    const translateMatch = currentTransform.match(/translate3d\(([^,]+), ([^,]+), ([^)]+)\)/);

                    if (translateMatch) {
                        const currentX = parseFloat(translateMatch[1]);
                        const currentY = parseFloat(translateMatch[2]);
                        layer.style.transform = `translate3d(${currentX + moveX}px, ${currentY + moveY}px, 0)`;
                    }
                }
            });
        }
    }

    animateClouds() {
        // Ensure clouds keep animating even without scroll
        const animate = () => {
            this.animationFrame = requestAnimationFrame(animate);
            // Cloud animation is handled by CSS, but we can add dynamic elements here if needed
        };
        animate();
    }

    // ============================================
    // DRAG AND RESIZE FUNCTIONALITY
    // ============================================

    setupDragFunctionality() {
        if (this.isMobile) return; // Disable drag on mobile

        this.panelDragHandle.addEventListener('mousedown', (e) => {
            this.startDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.endDrag();
        });

        // Prevent text selection during drag
        this.panelDragHandle.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }

    startDrag(e) {
        if (this.isMobile) return;

        this.isDragging = true;
        const rect = this.floatingPanel.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;

        this.floatingPanel.classList.add('dragging');
        document.body.style.cursor = 'move';
    }

    drag(e) {
        if (!this.isDragging || this.isMobile) return;

        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;

        // Keep panel within viewport bounds
        const rect = this.floatingPanel.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));

        this.panelPosition.x = clampedX;
        this.panelPosition.y = clampedY;

        this.floatingPanel.style.left = clampedX + 'px';
        this.floatingPanel.style.top = clampedY + 'px';
        // Remove transform to prevent conflicts with left/top positioning
        this.floatingPanel.style.transform = 'none';
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.floatingPanel.classList.remove('dragging');
            document.body.style.cursor = '';
        }
    }

    centerPanel() {
        // Reset to center position using viewport percentages for consistency
        this.panelPosition.x = 0;
        this.panelPosition.y = 0;

        this.floatingPanel.style.left = '50%';
        this.floatingPanel.style.top = '50%';
        this.floatingPanel.style.transform = 'translate(-50%, -50%)';
    }

    resetPanelSize() {
        // Reset panel to default size by removing inline width and height styles
        this.floatingPanel.style.width = '';
        this.floatingPanel.style.height = '';
    }

    setupProfileTooltip() {
        const profilePhoto = document.querySelector('.profile-photo');

        profilePhoto.addEventListener('mouseenter', () => {
            // Show "Hi! Welcome to my portfolio!" immediately
            this.tooltipText.textContent = 'Hi! 👋 Welcome to my portfolio!';
            this.profileTooltip.classList.add('show');
        });

        profilePhoto.addEventListener('mouseleave', () => {
            // Hide tooltip
            this.profileTooltip.classList.remove('show');
        });
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // If switching from mobile to desktop or vice versa, reset panel position
        if (wasMobile !== this.isMobile) {
            this.centerPanel();
            if (this.activePanel) {
                // Re-setup drag functionality if now on desktop
                if (!this.isMobile) {
                    this.setupDragFunctionality();
                }
            }
        }
    }

    // ============================================
    // PANEL MANAGEMENT
    // ============================================

    openPanel(panelId) {
        const contentElement = document.getElementById(panelId + 'Content');
        if (!contentElement) return;

        // Prevent opening the same panel multiple times
        if (this.activePanel === panelId) return;

        // Close any currently open panel
        if (this.activePanel) {
            this.closeActivePanel();
        }

        // Small delay to ensure clean opening
        setTimeout(() => {
            this.activePanel = panelId;

            // Reset panel to default size for each new panel
            this.resetPanelSize();

            // Update panel title
            const titles = {
                'about': 'About Me',
                'works': 'My Works',
                'skills': 'Skills',
                'certificates': 'Certificates',
                'resume': 'Resume',
                'contact': 'Contact Me'
            };
            this.panelTitle.textContent = titles[panelId] || 'Panel';

            // Clone and insert content
            this.panelContent.innerHTML = '';
            const contentClone = contentElement.cloneNode(true);
            contentClone.style.display = 'block';
            this.panelContent.appendChild(contentClone);

            // Show panel and overlay
            this.floatingPanel.classList.add('active');
            this.panelOverlay.classList.add('active');

            // Center the panel initially
            this.centerPanel();
        }, 10);

        // Update URL hash for bookmarking (optional)
        window.location.hash = panelId;
    }

    closePanel(panelId) {
        if (this.activePanel !== panelId) return;

        this.floatingPanel.classList.remove('active');
        this.panelOverlay.classList.remove('active');
        this.activePanel = null;

        setTimeout(() => {
            this.panelContent.innerHTML = '';
            window.location.hash = '';
        }, 300);
    }

    closeActivePanel() {
        if (this.activePanel) {
            this.closePanel(this.activePanel);
        }
    }

    // ============================================
    // FORM HANDLING
    // ============================================

    handleContactSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Simple form validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // In a real application, you would send this data to a server
        alert('Thank you for your message! I\'ll get back to you soon.');
        form.reset();
    }

    // ============================================
    // THEME INSTRUCTION
    // ============================================

    setupThemeInstruction() {
        // Show instruction after a brief delay
        setTimeout(() => {
            this.showThemeInstruction();
        }, 1000);

        // Hide instruction after 5 seconds total (4 seconds visible)
        setTimeout(() => {
            this.hideThemeInstruction();
        }, 5000);
    }

    showThemeInstruction() {
        if (this.themeInstruction) {
            this.themeInstruction.classList.add('show');
        }
    }

    hideThemeInstruction() {
        if (this.themeInstruction) {
            this.themeInstruction.classList.remove('show');
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Remove event listeners
        window.removeEventListener('scroll', this.updateParallax);
        window.removeEventListener('mousemove', this.updateMouseParallax);
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the portfolio
    const portfolio = new AdventurePortfolio();

    // Handle browser back/forward buttons for panels
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash + 'Content')) {
            portfolio.openPanel(hash);
        } else {
            portfolio.closeActivePanel();
        }
    });

    // Check for initial hash on page load
    if (window.location.hash) {
        const initialPanel = window.location.hash.substring(1);
        if (document.getElementById(initialPanel + 'Content')) {
            portfolio.openPanel(initialPanel);
        }
    }

    // Performance monitoring (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Adventure Portfolio initialized successfully');

        // Monitor scroll performance
        let scrollCount = 0;
        const scrollMonitor = portfolio.debounce(() => {
            scrollCount++;
            if (scrollCount % 10 === 0) {
                console.log(`Scroll events processed: ${scrollCount}`);
            }
        }, 100);

        window.addEventListener('scroll', scrollMonitor);
    }
});

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Preload critical assets
const preloadAssets = () => {
    const assets = [
        'assets/images/profile-placeholder.jpg',
        'assets/images/forest-silhouette-day.svg',
        'assets/images/forest-silhouette-night.svg',
        'assets/images/grass-sprite.svg'
    ];

    assets.forEach(asset => {
        const img = new Image();
        img.src = asset;
    });
};

// Start preloading after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(preloadAssets, 100);
});

// Add passive event listeners for better scroll performance
const addPassiveListeners = () => {
    const options = { passive: true, capture: false };

    // Override default passive listeners for touch events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
            options = { passive: true, ...options };
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
};

addPassiveListeners();
