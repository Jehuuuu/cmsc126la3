/**
 * ResponsiveTester.js
 * Tool for testing responsive layouts in the application
 */

(function() {
    class ResponsiveTester {
        constructor() {
            this.isEnabled = false;
            this.originalClassName = '';
            this.originalWidth = window.innerWidth;
        }
        
        /**
         * Creates the responsive testing interface
         */
        init() {
            // Only initialize once
            if (document.getElementById('responsive-tester')) return;
            
            // Create the tester UI
            const tester = document.createElement('div');
            tester.id = 'responsive-tester';
            tester.className = 'responsive-tester';
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .responsive-tester {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background-color: rgba(0, 0, 0, 0.7);
                    padding: 10px;
                    border-radius: 5px;
                    z-index: 10000;
                    color: white;
                    font-family: sans-serif;
                    font-size: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    border: 1px solid #555;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease;
                }
                .responsive-tester.minimized {
                    width: 30px;
                    height: 30px;
                    overflow: hidden;
                    border-radius: 50%;
                }
                .responsive-tester.minimized:hover {
                    transform: scale(1.1);
                }
                .responsive-tester select, 
                .responsive-tester button {
                    padding: 5px;
                    background: #444;
                    color: white;
                    border: 1px solid #666;
                    border-radius: 3px;
                    font-size: 12px;
                    cursor: pointer;
                }
                .responsive-tester button:hover {
                    background: #555;
                }
                .responsive-tester button:active {
                    background: #333;
                }
                .responsive-tester .toggle-btn {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 20px;
                    height: 20px;
                    background: #666;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    line-height: 1;
                }
                .responsive-tester label {
                    display: block;
                    margin-bottom: 2px;
                }
                .responsive-test-active {
                    outline: 5px solid rgba(255, 0, 0, 0.5) !important;
                }
                .responsive-tester .status {
                    font-size: 10px;
                    color: #aaa;
                    margin-top: 5px;
                    text-align: center;
                }
                .button-mac-active {
                    background: #5bac38 !important; /* Green to show it's active */
                }
                .button-responsive-active {
                    background: #3498db !important; /* Blue to show it's active */
                }
                @media (max-width: 768px) {
                    .responsive-tester {
                        bottom: 50px;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Create toggle button
            const toggleBtn = document.createElement('div');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.innerHTML = '-';
            toggleBtn.title = 'Minimize/Maximize';
            toggleBtn.addEventListener('click', () => {
                tester.classList.toggle('minimized');
                toggleBtn.innerHTML = tester.classList.contains('minimized') ? '+' : '-';
            });
            
            // Create device selector
            const deviceSelector = document.createElement('div');
            deviceSelector.innerHTML = `
                <label>Test Device View:</label>
                <select id="responsive-device-select">
                    <option value="none">Current</option>
                    <option value="iphone">iPhone</option>
                    <option value="ipad">iPad</option>
                    <option value="macbook">MacBook</option>
                    <option value="desktop">Desktop</option>
                </select>
            `;
            
            // Create action buttons
            const actionButtons = document.createElement('div');
            actionButtons.innerHTML = `
                <button id="toggle-responsive-mode">Toggle Mobile View</button>
                <button id="toggle-mac-mode">Toggle Mac Mode (LARGE)</button>
                <button id="reset-view">Reset View</button>
            `;
            
            // Create status display
            const statusElement = document.createElement('div');
            statusElement.className = 'status';
            statusElement.id = 'tester-status';
            statusElement.textContent = 'Ready';
            
            // Assemble the UI
            tester.appendChild(toggleBtn);
            tester.appendChild(deviceSelector);
            tester.appendChild(actionButtons);
            tester.appendChild(statusElement);
            document.body.appendChild(tester);
            
            // Add event listeners
            this.bindEvents();
        }
        
        /**
         * Sets status message
         */
        setStatus(message) {
            const statusElement = document.getElementById('tester-status');
            if (statusElement) {
                statusElement.textContent = message;
            }
        }
        
        /**
         * Binds event listeners to the tester UI elements
         */
        bindEvents() {
            const that = this; // Store reference to this for event handlers
            
            const deviceSelect = document.getElementById('responsive-device-select');
            const toggleResponsiveBtn = document.getElementById('toggle-responsive-mode');
            const toggleMacBtn = document.getElementById('toggle-mac-mode');
            const resetBtn = document.getElementById('reset-view');
            
            if (deviceSelect) {
                deviceSelect.onchange = function() {
                    that.applyDeviceView(this.value);
                };
            }
            
            if (toggleResponsiveBtn) {
                toggleResponsiveBtn.onclick = function() {
                    that.toggleResponsiveMode();
                    // Toggle active state visual indication
                    this.classList.toggle('button-responsive-active');
                };
            }
            
            if (toggleMacBtn) {
                toggleMacBtn.onclick = function() {
                    that.toggleMacMode();
                    // Toggle active state visual indication
                    this.classList.toggle('button-mac-active');
                };
            }
            
            if (resetBtn) {
                resetBtn.onclick = function() {
                    that.resetView();
                    // Reset button states
                    if (toggleResponsiveBtn) toggleResponsiveBtn.classList.remove('button-responsive-active');
                    if (toggleMacBtn) toggleMacBtn.classList.remove('button-mac-active');
                };
            }
        }
        
        /**
         * Applies a simulated device view
         * @param {string} device - The device to simulate
         */
        applyDeviceView(device) {
            // Reset any previous simulations
            this.resetView();
            
            // Add class to show we're in test mode
            document.documentElement.classList.add('responsive-test-active');
            
            // Get button references
            const toggleResponsiveBtn = document.getElementById('toggle-responsive-mode');
            const toggleMacBtn = document.getElementById('toggle-mac-mode');
            
            // Apply the requested device simulation
            switch(device) {
                case 'iphone':
                    document.documentElement.classList.add('responsive-mode');
                    this.setStatus('iPhone view applied (mobile layout)');
                    if (toggleResponsiveBtn) toggleResponsiveBtn.classList.add('button-responsive-active');
                    break;
                case 'ipad':
                    document.documentElement.classList.add('responsive-mode');
                    this.setStatus('iPad view applied (mobile layout)');
                    if (toggleResponsiveBtn) toggleResponsiveBtn.classList.add('button-responsive-active');
                    break;
                case 'macbook':
                    document.documentElement.classList.add('mac-device');
                    this.setStatus('MacBook view applied (LARGE grids)');
                    if (toggleMacBtn) toggleMacBtn.classList.add('button-mac-active');
                    break;
                case 'desktop':
                    // Just use desktop view
                    this.setStatus('Desktop view applied');
                    break;
                default:
                    // Do nothing for 'none'
                    document.documentElement.classList.remove('responsive-test-active');
                    this.setStatus('Default view applied');
                    break;
            }
        }
        
        /**
         * Toggles responsive (mobile) mode
         */
        toggleResponsiveMode() {
            document.documentElement.classList.toggle('responsive-mode');
            document.documentElement.classList.add('responsive-test-active');
            
            const isResponsive = document.documentElement.classList.contains('responsive-mode');
            this.setStatus(isResponsive ? 'Mobile view enabled' : 'Mobile view disabled');
            
            // If we're in responsive mode, force a layout recalculation
            if (isResponsive) {
                this.triggerReflow();
            }
        }
        
        /**
         * Toggles Mac device mode
         */
        toggleMacMode() {
            document.documentElement.classList.toggle('mac-device');
            document.documentElement.classList.add('responsive-test-active');
            
            const isMac = document.documentElement.classList.contains('mac-device');
            this.setStatus(isMac ? 'Mac mode enabled (LARGE grids)' : 'Mac mode disabled');
            
            // Also load the Mac CSS file if not already loaded
            if (isMac && !document.getElementById('mac-compatibility-styles')) {
                const link = document.createElement('link');
                link.id = 'mac-compatibility-styles';
                link.rel = 'stylesheet';
                link.href = 'src/assets/styles/mac-compatibility.css';
                document.head.appendChild(link);
                this.setStatus('Mac mode enabled with LARGE grid sizing');
            }
            
            // Force a layout recalculation
            this.triggerReflow();
        }
        
        /**
         * Forces a reflow/repaint to ensure styles are applied
         */
        triggerReflow() {
            // Force a reflow by accessing an element's computed style
            window.getComputedStyle(document.documentElement).getPropertyValue('display');
            
            // Adjust grid sizes if PlatformDetector is available
            if (window.platformDetector && typeof window.platformDetector.adjustGridSizes === 'function') {
                setTimeout(() => {
                    window.platformDetector.adjustGridSizes();
                    this.setStatus('Grid sizes adjusted');
                }, 50);
            }
        }
        
        /**
         * Resets to the original view
         */
        resetView() {
            document.documentElement.classList.remove('responsive-mode', 'mac-device', 'responsive-test-active');
            this.setStatus('View reset to original');
            
            // Reset any device select dropdown
            const deviceSelect = document.getElementById('responsive-device-select');
            if (deviceSelect) {
                deviceSelect.value = 'none';
            }
            
            // Force a layout recalculation
            this.triggerReflow();
        }
    }
    
    // Initialize when document is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Create a key command to toggle the tester (Ctrl+Shift+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
                e.preventDefault();
                if (!window.responsiveTester) {
                    window.responsiveTester = new ResponsiveTester();
                }
                
                if (!document.getElementById('responsive-tester')) {
                    window.responsiveTester.init();
                    console.log('Initialized responsive tester');
                } else {
                    // Toggle visibility
                    const tester = document.getElementById('responsive-tester');
                    tester.style.display = tester.style.display === 'none' ? 'flex' : 'none';
                    console.log('Toggled responsive tester visibility');
                }
            }
        });
        
        // Add a small indicator that the tester is available
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            bottom: 5px;
            right: 5px;
            width: 10px;
            height: 10px;
            background-color: #3498db;
            border-radius: 50%;
            z-index: 9999;
            cursor: pointer;
            opacity: 0.5;
        `;
        indicator.title = 'Press Ctrl+Shift+R to open responsive tester';
        indicator.onclick = () => {
            if (!window.responsiveTester) {
                window.responsiveTester = new ResponsiveTester();
            }
            
            if (!document.getElementById('responsive-tester')) {
                window.responsiveTester.init();
            } else {
                const tester = document.getElementById('responsive-tester');
                tester.style.display = tester.style.display === 'none' ? 'flex' : 'none';
            }
        };
        document.body.appendChild(indicator);
    });
})(); 