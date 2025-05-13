/**
 * PlatformDetector.js
 * Utility for detecting device platforms and applying appropriate styles
 */

(function() {
    class PlatformDetector {
        constructor() {
            this.isMac = this.detectMac();
            this.isMacBookAir = this.detectMacBookAir();
            this.init();
            
            // Watch for class changes on document element to handle manual toggling
            this.setupClassObserver();
        }

        /**
         * Detects if the device is a Mac
         * @returns {boolean} True if device is a Mac
         */
        detectMac() {
            return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
                navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
        }

        /**
         * Attempts to detect if the device is a MacBook Air
         * @returns {boolean} True if device might be a MacBook Air
         */
        detectMacBookAir() {
            // This is a best guess since there's no definitive way to detect a MacBook Air
            return this.isMac && window.screen.availHeight <= 900 && window.screen.availWidth <= 1440;
        }
        
        /**
         * Sets up an observer to watch for class changes on the documentElement
         * This allows us to respond to manual toggling of classes
         */
        setupClassObserver() {
            // Use MutationObserver if available
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'class') {
                            // Check if mac-device class was added manually
                            const hasMacClass = document.documentElement.classList.contains('mac-device');
                            
                            if (hasMacClass && !document.getElementById('mac-compatibility-styles')) {
                                this.applyMacStyles();
                            }
                            
                            // Always adjust grid sizes when classes change
                            setTimeout(() => this.adjustGridSizes(), 50);
                        }
                    });
                });
                
                observer.observe(document.documentElement, { attributes: true });
            }
        }

        /**
         * Initializes platform-specific adjustments
         */
        init() {
            if (this.isMac) {
                document.addEventListener('DOMContentLoaded', () => {
                    this.applyMacStyles();
                    this.setupResizeHandler();
                });
            } else {
                // Even if not a Mac, set up resize handler for responsive behavior
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupResizeHandler();
                });
            }
        }

        /**
         * Applies Mac-specific styles by loading the CSS file
         */
        applyMacStyles() {
            // Add the Mac compatibility CSS file
            if (!document.getElementById('mac-compatibility-styles')) {
                const link = document.createElement('link');
                link.id = 'mac-compatibility-styles';
                link.rel = 'stylesheet';
                link.href = 'src/assets/styles/mac-compatibility.css';
                document.head.appendChild(link);
            }
            
            // Add a class to the body for any additional styling
            document.body.classList.add('mac-device');
            
            if (this.isMacBookAir) {
                document.body.classList.add('macbook-air');
            }
            
            // Apply immediate fixes
            this.adjustGridSizes();
        }

        /**
         * Sets up a resize handler to reapply styles when window size changes
         */
        setupResizeHandler() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.adjustGridSizes();
                }, 250); // debounce resize events
            });
            
            // Initial adjustment
            this.adjustGridSizes();
        }

        /**
         * Adjusts grid sizes based on current window dimensions
         */
        adjustGridSizes() {
            const dijkstraGrid = document.getElementById('dijkstra-grid');
            const astarGrid = document.getElementById('astar-grid');
            
            if (!dijkstraGrid || !astarGrid) return;
            
            // Check if we're in responsive mode
            const isResponsiveMode = window.innerWidth <= 768 || 
                                    document.documentElement.classList.contains('responsive-mode');
            
            if (isResponsiveMode) {
                // In responsive mode, use mobile layout
                this.applyResponsiveFixes();
                return;
            }
            
            // Check if we're simulating Mac mode
            const isSimulatedMac = document.documentElement.classList.contains('mac-device');
            
            if (isSimulatedMac) {
                // If in Mac mode, let the CSS handle the sizing
                // This gives us larger grids on Mac devices
                [dijkstraGrid, astarGrid].forEach(grid => {
                    if (grid) {
                        // The CSS will handle this with min-width/height and percentages
                        // But we'll set a reasonable default size to ensure it works properly
                        const viewportHeight = window.innerHeight;
                        const largeGridSize = Math.min(viewportHeight * 0.75, 700); // Cap at 700px or 75% of viewport
                        
                        grid.style.minWidth = `${largeGridSize}px`;
                        grid.style.minHeight = `${largeGridSize}px`;
                    }
                });
                
                return;
            }
            
            // For non-Mac, non-responsive mode, use the regular sizing logic
            // Get the available height for the grid containers
            const comparisonContainer = document.querySelector('.algorithm-comparison');
            const availableHeight = comparisonContainer ? comparisonContainer.clientHeight : window.innerHeight * 0.8;
            
            // Calculate the ideal size (slightly smaller than the container to ensure it fits)
            let idealSize = Math.min(availableHeight * 0.9, window.innerWidth * 0.4);
            
            // Apply the size
            [dijkstraGrid, astarGrid].forEach(grid => {
                if (grid) {
                    grid.style.height = `${idealSize}px`;
                    grid.style.width = `${idealSize}px`;
                }
            });
        }
        
        /**
         * Applies additional fixes for responsive mode
         */
        applyResponsiveFixes() {
            const gridContainers = document.querySelectorAll('.grid-container');
            gridContainers.forEach(container => {
                container.style.height = 'auto';
            });
            
            const grids = document.querySelectorAll('.grid');
            grids.forEach(grid => {
                // Make grid take up most of the available width
                grid.style.height = 'auto';
                grid.style.width = '90vw';
                grid.style.maxWidth = '90vw';
                grid.style.maxHeight = '90vw';
                grid.style.aspectRatio = '1/1';
            });
        }
    }

    // Initialize the platform detector
    window.platformDetector = new PlatformDetector();
})(); 