/**
 * PlatformDetector.js
 * Utility for detecting device platforms and applying appropriate styles
 */

//=============================================================================
// PLATFORM DETECTOR
//=============================================================================

(function() {
    /**
     * PlatformDetector class that identifies the user's platform and
     * applies appropriate visual adjustments for optimal display
     */
    class PlatformDetector {
        //=============================================================================
        // INITIALIZATION
        //=============================================================================
        
        /**
         * Create a new PlatformDetector and initialize platform detection
         */
        constructor() {
            // Platform flags
            this.isMac = this.detectMac();
            this.isMacBookAir = this.detectMacBookAir();
            
            // Initialize platform adjustments
            this.init();
            
            // Watch for class changes on document element
            this.setupClassObserver();
        }

        /**
         * Initializes platform-specific adjustments
         */
        init() {
            document.addEventListener('DOMContentLoaded', () => {
                // Apply Mac styles if needed
                if (this.isMac) {
                    this.applyMacStyles();
                }
                
                // Set up resize handling for all platforms
                this.setupResizeHandler();
            });
        }
        
        //=============================================================================
        // PLATFORM DETECTION
        //=============================================================================

        /**
         * Detects if the device is a Mac
         * @returns {boolean} True if device is a Mac
         */
        detectMac() {
            const ua = navigator.userAgent.toLowerCase();
            return ua.includes('macintosh') || ua.includes('mac os x');
        }

        /**
         * Attempts to detect if the device is a MacBook Air
         * @returns {boolean} True if device might be a MacBook Air
         */
        detectMacBookAir() {
            // Best guess detection based on screen dimensions
            return this.isMac && 
                   window.screen.availHeight <= 900 && 
                   window.screen.availWidth <= 1440;
        }
        
        //=============================================================================
        // DOM OBSERVERS
        //=============================================================================
        
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
         * Sets up a resize handler to reapply styles when window size changes
         */
        setupResizeHandler() {
            let resizeTimeout;
            
            window.addEventListener('resize', () => {
                // Debounce resize events to avoid performance issues
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.adjustGridSizes();
                }, 250);
            });
            
            // Initial adjustment
            this.adjustGridSizes();
        }

        //=============================================================================
        // STYLING ADJUSTMENTS
        //=============================================================================
        
        /**
         * Applies Mac-specific styles by loading the CSS file
         */
        applyMacStyles() {
            // Add the Mac compatibility CSS file if it doesn't already exist
            if (!document.getElementById('mac-compatibility-styles')) {
                const link = document.createElement('link');
                link.id = 'mac-compatibility-styles';
                link.rel = 'stylesheet';
                link.href = 'src/assets/styles/mac-compatibility.css';
                document.head.appendChild(link);
            }
            
            // Add classes to the body for CSS targeting
            document.body.classList.add('mac-device');
            
            if (this.isMacBookAir) {
                document.body.classList.add('macbook-air');
            }
            
            // Apply immediate fixes for grid dimensions
            this.adjustGridSizes();
        }

        /**
         * Adjusts grid sizes based on current window dimensions and platform
         */
        adjustGridSizes() {
            const dijkstraGrid = document.getElementById('dijkstra-grid');
            const astarGrid = document.getElementById('astar-grid');
            
            // Exit if grids aren't available
            if (!dijkstraGrid || !astarGrid) return;
            
            // Check if in responsive mode (mobile view)
            const isResponsiveMode = window.innerWidth <= 768 || 
                                     document.documentElement.classList.contains('responsive-mode');
            
            // In responsive mode, apply mobile layout
            if (isResponsiveMode) {
                this.applyResponsiveFixes();
                return;
            }
            
            // Check if Mac mode is active (either real Mac or simulated via class)
            const isMacMode = this.isMac || document.documentElement.classList.contains('mac-device');
            
            if (isMacMode) {
                this.applyMacGridSizes(dijkstraGrid, astarGrid);
            } else {
                this.applyStandardGridSizes(dijkstraGrid, astarGrid);
            }
        }
        
        /**
         * Applies Mac-specific grid sizes
         * @param {HTMLElement} dijkstraGrid - The Dijkstra algorithm grid
         * @param {HTMLElement} astarGrid - The A* algorithm grid
         */
        applyMacGridSizes(dijkstraGrid, astarGrid) {
            // The CSS will handle most sizing via the mac-device class,
            // but we set reasonable default sizes to ensure proper display
            const viewportHeight = window.innerHeight;
            const largeGridSize = Math.min(viewportHeight * 0.75, 700); // Cap at 700px or 75% of viewport
            
            [dijkstraGrid, astarGrid].forEach(grid => {
                if (grid) {
                    grid.style.minWidth = `${largeGridSize}px`;
                    grid.style.minHeight = `${largeGridSize}px`;
                }
            });
        }
        
        /**
         * Applies standard grid sizes for non-Mac devices
         * @param {HTMLElement} dijkstraGrid - The Dijkstra algorithm grid
         * @param {HTMLElement} astarGrid - The A* algorithm grid
         */
        applyStandardGridSizes(dijkstraGrid, astarGrid) {
            // Get the available height for the grid containers
            const comparisonContainer = document.querySelector('.algorithm-comparison');
            const availableHeight = comparisonContainer ? 
                                    comparisonContainer.clientHeight : 
                                    window.innerHeight * 0.8;
            
            // Calculate the ideal size (slightly smaller than the container to ensure it fits)
            const idealSize = Math.min(availableHeight * 0.9, window.innerWidth * 0.4);
            
            // Apply the size to both grids
            [dijkstraGrid, astarGrid].forEach(grid => {
                if (grid) {
                    grid.style.height = `${idealSize}px`;
                    grid.style.width = `${idealSize}px`;
                }
            });
        }
        
        /**
         * Applies additional fixes for responsive/mobile mode
         */
        applyResponsiveFixes() {
            // Adjust container heights for mobile
            const gridContainers = document.querySelectorAll('.grid-container');
            gridContainers.forEach(container => {
                container.style.height = 'auto';
            });
            
            // Adjust grid dimensions for mobile
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

    // Initialize the platform detector singleton
    window.platformDetector = new PlatformDetector();
})(); 