/**
 * ModularTutorial.js
 * A modular tutorial system with separate components for each step
 */

//=============================================================================
// TUTORIAL SYSTEM
//=============================================================================

/**
 * Main tutorial class that manages the step-by-step tutorial experience
 */
class ModularTutorial {
    //=============================================================================
    // INITIALIZATION
    //=============================================================================
    
    /**
     * Create a new ModularTutorial instance
     */
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        this.modalStack = [];
        
        // Initialize modal components
        this.modals = {
            intro: new IntroModal(this),
            algorithmComparison: new AlgorithmComparisonModal(this),
            generateMaze: new GenerateMazeModal(this),
            wallsTool: new WallsToolModal(this),
            weightsTool: new WeightsToolModal(this),
            findPath: new FindPathModal(this),
            resultsComparison: new ResultsComparisonModal(this),
            completion: new CompletionModal(this),
            // Feature tour modals
            mazeTypes: new MazeTypesFeatureModal(this),
            randomWeights: new RandomWeightsFeatureModal(this),
            randomStartEnd: new RandomStartEndFeatureModal(this),
            stepByStep: new StepByStepFeatureModal(this),
            speedControls: new SpeedControlsFeatureModal(this),
            gridSize: new GridSizeFeatureModal(this),
            saveLoad: new SaveLoadFeatureModal(this),
            featureCompletion: new FeatureCompletionModal(this)
        };
        
        // Tutorial steps sequence
        this.steps = [
            { type: 'intro' },
            { type: 'algorithmComparison' },
            { type: 'generateMaze' },
            { type: 'wallsTool' },
            { type: 'weightsTool' },
            { type: 'findPath' },
            { type: 'resultsComparison' },
            { type: 'completion' }
        ];
        
        // Feature tour sequence
        this.featureTourSteps = [
            { type: 'mazeTypes' },
            { type: 'randomWeights' },
            { type: 'randomStartEnd' },
            { type: 'stepByStep' },
            { type: 'speedControls' },
            { type: 'gridSize' },
            { type: 'saveLoad' },
            { type: 'featureCompletion' }
        ];
    }
    
    /**
     * Initialize the tutorial system
     */
    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('tutorial-container')) {
            const container = document.createElement('div');
            container.id = 'tutorial-container';
            document.body.appendChild(container);
        }
        
        // Add styling
        this.addStyling();
        
        // Check if tutorial was completed before
        this.tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC key to exit tutorial
            if (e.key === 'Escape' && this.isActive) {
                this.closeTutorial();
            }
        });
        
        // Show tutorial prompt after a short delay if not completed
        if (document.readyState === 'complete') {
            this.onDocumentReady();
        } else {
            window.addEventListener('load', () => this.onDocumentReady());
        }
    }
    
    //=============================================================================
    // TUTORIAL STATE MANAGEMENT
    //=============================================================================
    
    /**
     * Reset tutorial state (can be called from console)
     */
    resetTutorialState() {
        // Clear localStorage flag
        localStorage.removeItem('tutorialCompleted');
        // Reset state
        this.tutorialCompleted = false;
        this.currentStep = 0;
        this.isActive = false;
        return 'Tutorial state reset. Refresh the page to see the tutorial.';
    }
    
    /**
     * Add necessary styling
     */
    addStyling() {
        // Check if styles already exist
        if (!document.getElementById('modular-tutorial-styles')) {
            // Create link to external stylesheet
            const styleLink = document.createElement('link');
            styleLink.id = 'modular-tutorial-styles';
            styleLink.rel = 'stylesheet';
            styleLink.href = 'src/assets/styles/modular-tutorial.css';
            document.head.appendChild(styleLink);
        }
    }
    
    /**
     * Handle actions once document is ready
     */
    onDocumentReady() {
        // Always re-check the flag from localStorage
        this.tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        
        // Show tutorial prompt if not completed
        setTimeout(() => {
            if (!this.tutorialCompleted) {
                this.startTutorial();
            }
        }, 1500);
    }
    
    //=============================================================================
    // TUTORIAL FLOW CONTROL
    //=============================================================================
    
    /**
     * Start the tutorial
     */
    startTutorial() {
        this.currentStep = 0;
        this.isActive = true;
        
        // Clear any existing modals
        this.clearAllModals();
        
        // Show first step
        this.showCurrentStep();
    }
    
    /**
     * Clear all modals
     */
    clearAllModals() {
        const container = document.getElementById('tutorial-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Remove any highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
            el.classList.remove('flash-animation');
        });
    }
    
    /**
     * Show current tutorial step
     */
    showCurrentStep() {
        if (!this.isActive) return;
        
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        // Show the appropriate modal
        const modal = this.modals[step.type];
        if (modal) {
            modal.show();
        }
    }
    
    /**
     * Move to next step
     */
    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.steps.length) {
            // End of tutorial
            this.closeTutorial();
            return;
        }
        
        // Clear previous modals
        this.clearAllModals();
        
        // Show next step
        this.showCurrentStep();
    }
    
    /**
     * Close the tutorial
     */
    closeTutorial() {
        this.isActive = false;
        
        // Clear all modals
        this.clearAllModals();
        
        // Clean up all modals
        Object.values(this.modals).forEach(modal => {
            if (modal && typeof modal.cleanup === 'function') {
                modal.cleanup();
            }
        });
        
        // Mark tutorial as completed
        localStorage.setItem('tutorialCompleted', 'true');
        this.tutorialCompleted = true;
    }
    
    /**
     * Start feature tour
     */
    startFeatureTour() {
        // Reset to the first step
        this.currentStep = 0;
        this.isActive = true;
        
        // Clean up any existing modals or highlights
        this.clearAllModals();
        
        // Cleanup all modals 
        Object.values(this.modals).forEach(modal => {
            if (modal && typeof modal.cleanup === 'function') {
                modal.cleanup();
            }
        });
        
        // Small delay to ensure UI is ready
        setTimeout(() => {
            // Show first feature
            this.showCurrentFeature();
        }, 100);
    }
    
    /**
     * Show current feature
     */
    showCurrentFeature() {
        if (!this.isActive) return;
        
        const step = this.featureTourSteps[this.currentStep];
        if (!step) return;
        
        // Show the appropriate modal
        const modal = this.modals[step.type];
        if (modal) {
            modal.show();
        }
    }
    
    /**
     * Move to next feature
     */
    nextFeature() {
        this.currentStep++;
        
        if (this.currentStep >= this.featureTourSteps.length) {
            // End of feature tour
            this.closeTutorial();
            return;
        }
        
        // Clear previous modals
        this.clearAllModals();
        
        // Show next feature
        this.showCurrentFeature();
    }
    
    //=============================================================================
    // COMPLETION HANDLING
    //=============================================================================
    
    /**
     * Reset grid and finish tutorial
     */
    resetAndFinish() {
        // Clear grid
        const clearButton = document.getElementById('clear-grid-btn') || 
                          document.getElementById('clear-grid-btn-header');
        
        if (clearButton) {
            clearButton.click();
        }
        
        // Set random start/end points
        const randomStartEndButton = document.getElementById('random-start-end-btn') || 
                                  document.getElementById('random-start-end-btn-mobile');
        
        if (randomStartEndButton) {
            randomStartEndButton.click();
        }
        
        // Close tutorial
        this.closeTutorial();
        
        // Show completion message
        this.showCompletionMessage();
    }
    
    /**
     * Show completion message
     */
    showCompletionMessage() {
        const container = document.getElementById('tutorial-container');
        if (!container) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        modal.innerHTML = `
            <div class="tutorial-header">
                <h2>You're All Set!</h2>
            </div>
            <div class="tutorial-content">
                <p>You're now ready to explore pathfinding algorithms on your own.</p>
                <p>Remember, you can always access the tutorial again from the Help menu if needed.</p>
            </div>
            <div class="tutorial-buttons">
                <button class="tutorial-btn primary" id="final-close">Start Exploring</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        container.appendChild(overlay);
        
        const closeBtn = modal.querySelector('#final-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                container.removeChild(overlay);
            });
        }
    }
    
    /**
     * Show success animation
     */
    showSuccess() {
        const success = document.createElement('div');
        success.className = 'tutorial-success';
        success.textContent = '✓';
        document.body.appendChild(success);
        
        // Show animation
        setTimeout(() => {
            success.classList.add('show');
            
            // Remove after animation completes
            setTimeout(() => {
                if (success.parentNode) {
                    document.body.removeChild(success);
                }
            }, 1500);
        }, 100);
    }
}

//=============================================================================
// MODAL BASE CLASS
//=============================================================================

/**
 * Base modal class for tutorial steps
 * Provides common functionality for all tutorial modals
 */
class TutorialModal {
    /**
     * Create a new tutorial modal
     * @param {ModularTutorial} tutorial - The parent tutorial instance
     */
    constructor(tutorial) {
        this.tutorial = tutorial;
        this.activeTimers = []; // Track active timers for cleanup
        this.eventListeners = []; // Track added event listeners for cleanup
    }
    
    //=============================================================================
    // MODAL DISPLAY
    //=============================================================================
    
    /**
     * Show the modal
     * Abstract method to be implemented by subclasses
     */
    show() {
        // To be implemented by subclasses
    }
    
    /**
     * Create base modal structure
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @param {Array} buttons - Array of button configuration objects
     * @returns {Object} References to created overlay and modal elements
     */
    createModal(title, content, buttons = []) {
        const container = document.getElementById('tutorial-container');
        if (!container) return null;
        
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        
        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = `
                <div class="tutorial-buttons">
                    ${buttons.map(btn => 
                        `<button class="tutorial-btn ${btn.primary ? 'primary' : btn.danger ? 'danger' : ''}" 
                                id="${btn.id}">
                                ${btn.icon ? `<i class="fas fa-${btn.icon}"></i> ` : ''}
                                ${btn.text}
                        </button>`
                    ).join('')}
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="tutorial-header">
                <h2>${title}</h2>
                <div class="tutorial-close" id="tutorial-close">&times;</div>
            </div>
            <div class="tutorial-content">
                <p>${content}</p>
            </div>
            ${buttonsHtml}
        `;
        
        overlay.appendChild(modal);
        container.appendChild(overlay);
        
        // Add close button handler
        const closeBtn = modal.querySelector('#tutorial-close');
        if (closeBtn) {
            this.addEventListenerWithCleanup(closeBtn, 'click', () => {
                this.cleanup();
                this.tutorial.closeTutorial();
            });
        }
        
        return { overlay, modal };
    }
    
    /**
     * Add a button click handler with automatic setup
     * @param {Element} parent - Parent element containing the button
     * @param {string} buttonId - ID of the button to attach handler to
     * @param {Function} handler - Click handler function
     */
    addButtonHandler(parent, buttonId, handler) {
        const button = parent.querySelector(`#${buttonId}`);
        if (button) {
            this.addEventListenerWithCleanup(button, 'click', handler);
        }
        return button;
    }
    
    /**
     * Add a skip button handler
     * @param {Element} parent - Parent element containing the button
     * @param {string} buttonId - ID of the skip button
     */
    addSkipHandler(parent, buttonId = 'skip') {
        return this.addButtonHandler(parent, buttonId, () => {
            this.cleanup();
            this.tutorial.closeTutorial();
        });
    }
    
    /**
     * Add a next button handler
     * @param {Element} parent - Parent element containing the button
     * @param {string} buttonId - ID of the next button
     * @param {boolean} isFeature - Whether this is a feature tour step
     */
    addNextHandler(parent, buttonId = 'next', isFeature = false) {
        return this.addButtonHandler(parent, buttonId, () => {
            this.cleanup();
            if (isFeature) {
                this.tutorial.nextFeature();
            } else {
                this.tutorial.nextStep();
            }
        });
    }
    
    /**
     * Add event listener with automatic cleanup registration
     * @param {Element} element - Element to attach listener to
     * @param {string} eventType - Type of event to listen for
     * @param {Function} handler - Event handler function
     */
    addEventListenerWithCleanup(element, eventType, handler) {
        if (!element) return;
        
        element.addEventListener(eventType, handler);
        this.eventListeners.push({ element, eventType, handler });
    }
    
    /**
     * Setup a timer with automatic cleanup registration
     * @param {Function} callback - Function to call when timer expires
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timer ID
     */
    setTimerWithCleanup(callback, delay) {
        const timerId = setTimeout(() => {
            // Remove from active timers list when it completes
            this.activeTimers = this.activeTimers.filter(id => id !== timerId);
            callback();
        }, delay);
        
        this.activeTimers.push(timerId);
        return timerId;
    }
    
    /**
     * Setup an interval with automatic cleanup registration
     * @param {Function} callback - Function to call on each interval
     * @param {number} delay - Interval delay in milliseconds
     * @returns {number} Interval ID
     */
    setIntervalWithCleanup(callback, delay) {
        const intervalId = setInterval(callback, delay);
        this.activeTimers.push(intervalId);
        return intervalId;
    }
    
    /**
     * Clean up all timers and event listeners
     */
    cleanup() {
        // Clear all active timers
        this.activeTimers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        this.activeTimers = [];
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, eventType, handler }) => {
            if (element) {
                element.removeEventListener(eventType, handler);
            }
        });
        this.eventListeners = [];
    }
    
    //=============================================================================
    // ELEMENT HIGHLIGHTING
    //=============================================================================
    
    /**
     * Highlight an element
     * @param {string} selector - CSS selector for the element to highlight
     * @param {boolean} flashAnimation - Whether to add flashing animation
     * @returns {Element} The highlighted element
     */
    highlightElement(selector, flashAnimation = false) {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        element.classList.add('tutorial-highlight');
        if (flashAnimation) {
            element.classList.add('flash-animation');
        }
        
        return element;
    }
    
    /**
     * Remove highlight from an element
     * @param {Element} element - Element to remove highlight from
     */
    removeHighlight(element) {
        if (!element) return;
        
        element.classList.remove('tutorial-highlight');
        element.classList.remove('flash-animation');
    }
    
    //=============================================================================
    // TOOLTIP MANAGEMENT
    //=============================================================================
    
    /**
     * Create a tooltip near an element
     * @param {Element} element - Element to attach tooltip to
     * @param {string} title - Tooltip title
     * @param {string} content - Tooltip content HTML
     * @param {string} position - Position relative to element ('top', 'bottom', 'left', 'right', 'center')
     * @param {Array} buttons - Array of button configuration objects
     * @returns {Element} The created tooltip element
     */
    createTooltip(element, title, content, position = 'right', buttons = []) {
        if (!element) return null;
        
        const container = document.getElementById('tutorial-container');
        if (!container) return null;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        
        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = `
                <div class="tutorial-buttons">
                    ${buttons.map(btn => 
                        `<button class="tutorial-btn ${btn.primary ? 'primary' : btn.danger ? 'danger' : ''}" 
                                id="${btn.id}">
                                ${btn.icon ? `<i class="fas fa-${btn.icon}"></i> ` : ''}
                                ${btn.text}
                        </button>`
                    ).join('')}
                </div>
            `;
        }
        
        tooltip.innerHTML = `
            <div class="tutorial-header">
                <h2>${title}</h2>
                <div class="tutorial-close" id="tooltip-close">&times;</div>
            </div>
            <div class="tutorial-content">
                <p>${content}</p>
            </div>
            ${buttonsHtml}
        `;
        
        container.appendChild(tooltip);
        
        // Position tooltip relative to element
        this.positionTooltip(tooltip, element, position);
        
        // Add close button handler
        const closeBtn = tooltip.querySelector('#tooltip-close');
        if (closeBtn) {
            this.addEventListenerWithCleanup(closeBtn, 'click', () => {
                this.cleanup();
                this.tutorial.closeTutorial();
            });
        }
        
        return tooltip;
    }
    
    /**
     * Position a tooltip relative to an element
     * @param {Element} tooltip - Tooltip element
     * @param {Element} element - Target element
     * @param {string} position - Position ('top', 'bottom', 'left', 'right', 'center')
     */
    positionTooltip(tooltip, element, position) {
        if (!tooltip || !element) return;
        
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Default margin
        const margin = 20;
        
        // Calculate position
        switch (position) {
            case 'top':
                tooltip.style.top = `${elementRect.top - tooltipRect.height - margin}px`;
                tooltip.style.left = `${elementRect.left + elementRect.width / 2 - tooltipRect.width / 2}px`;
                break;
            case 'bottom':
                tooltip.style.top = `${elementRect.bottom + margin}px`;
                tooltip.style.left = `${elementRect.left + elementRect.width / 2 - tooltipRect.width / 2}px`;
                break;
            case 'left':
                tooltip.style.top = `${elementRect.top + elementRect.height / 2 - tooltipRect.height / 2}px`;
                tooltip.style.left = `${elementRect.left - tooltipRect.width - margin}px`;
                break;
            case 'right':
                tooltip.style.top = `${elementRect.top + elementRect.height / 2 - tooltipRect.height / 2}px`;
                tooltip.style.left = `${elementRect.right + margin}px`;
                break;
            case 'center':
                tooltip.style.top = `${window.innerHeight / 2 - tooltipRect.height / 2}px`;
                tooltip.style.left = `${window.innerWidth / 2 - tooltipRect.width / 2}px`;
                break;
        }
        
        // Adjust if tooltip goes outside viewport
        const newTooltipRect = tooltip.getBoundingClientRect();
        
        if (newTooltipRect.top < 10) {
            tooltip.style.top = '10px';
        }
        
        if (newTooltipRect.bottom > window.innerHeight - 10) {
            tooltip.style.top = `${window.innerHeight - newTooltipRect.height - 10}px`;
        }
        
        if (newTooltipRect.left < 10) {
            tooltip.style.left = '10px';
        }
        
        if (newTooltipRect.right > window.innerWidth - 10) {
            tooltip.style.left = `${window.innerWidth - newTooltipRect.width - 10}px`;
        }
    }
    
    //=============================================================================
    // FEATURE TOUR HELPERS
    //=============================================================================
    
    /**
     * Create a feature tour step with standard structure
     * @param {string} selector - CSS selector for element to highlight
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @param {string} position - Position for tooltip ('top', 'bottom', 'left', 'right')
     * @returns {Element} The created tooltip element
     */
    createFeatureTourStep(selector, title, content, position = 'right') {
        // Highlight target element
        const element = this.highlightElement(selector, true);
        
        if (!element) return null;
        
        // Create tooltip with standard buttons
        const tooltip = this.createTooltip(
            element,
            title,
            content,
            position,
            [
                { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
            ]
        );
        
        // Add standard event listeners using tracked event handlers
        if (tooltip) {
            const skipBtn = tooltip.querySelector('#feature-skip');
            if (skipBtn) {
                this.addEventListenerWithCleanup(skipBtn, 'click', () => {
                    this.cleanup();
                    this.tutorial.closeTutorial();
                });
            }
            
            const nextBtn = tooltip.querySelector('#feature-next');
            if (nextBtn) {
                this.addEventListenerWithCleanup(nextBtn, 'click', () => {
                    this.cleanup();
                    this.tutorial.nextFeature();
                });
            }
        }
        
        return tooltip;
    }
}

//=============================================================================
// TUTORIAL STEP MODALS
//=============================================================================

/**
 * Introduction Modal - First step of the tutorial
 */
class IntroModal extends TutorialModal {
    /**
     * Show the intro modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const { modal } = this.createModal(
            'Welcome to Skull Cavern Path!',
            'This tutorial will guide you through comparing pathfinding algorithms to find the most efficient route through the Skull Cavern.',
            [
                { id: 'intro-skip', text: 'Skip Tutorial', danger: true, icon: 'times' },
                { id: 'intro-next', text: 'Start Tutorial', primary: true, icon: 'play' }
            ]
        );
        
        // Add button event listeners with cleanup
        this.addButtonHandler(modal, 'intro-skip', () => {
            this.cleanup();
            this.tutorial.closeTutorial();
        });
        
        this.addButtonHandler(modal, 'intro-next', () => {
            this.cleanup();
            this.tutorial.nextStep();
        });
    }
}

/**
 * Algorithm Comparison Modal - Shows the algorithm panels side by side
 */
class AlgorithmComparisonModal extends TutorialModal {
    /**
     * Show algorithm comparison modal and highlight relevant elements
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // First show the modal with explanation and 'Show Me' button
        const { overlay, modal } = this.createModal(
            'Algorithm Comparison',
            'These two panels show Dijkstra\'s Algorithm and A* Algorithm side by side so you can compare their efficiency in finding the shortest path.',
            [
                { id: 'algo-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'algo-show', text: 'Show Me', primary: true, icon: 'eye' }
            ]
        );
        
        // Add button event listeners with cleanup
        this.addButtonHandler(modal, 'algo-skip', () => {
            this.cleanup();
            this.tutorial.closeTutorial();
        });
        
        this.addButtonHandler(modal, 'algo-show', () => {
            // Remove the modal
            const container = document.getElementById('tutorial-container');
            if (container && overlay) {
                container.removeChild(overlay);
            }
            
            // Highlight the algorithm container
            const algorithmContainer = this.highlightElement('.algorithm-comparison', true);
            
            // Wait a few seconds to let the user see the highlighted container
            this.setTimerWithCleanup(() => {
                // Remove highlights via cleanup
                this.cleanup();
                
                // Move to next step
                this.tutorial.nextStep();
            }, 3000); // Show for 3 seconds
        });
    }
}

/**
 * Generate Maze Modal - Shows how to generate a maze
 */
class GenerateMazeModal extends TutorialModal {
    /**
     * Show maze generation step
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Highlight the generate maze button
        const mazeButton = this.highlightElement('#random-maze-btn', true);
        
        // Create a tooltip near the button
        if (mazeButton) {
            const tooltip = this.createTooltip(
                mazeButton,
                'Generate a Maze',
                'Let\'s generate a maze for our algorithms to solve. Click the "Generate Maze" button.',
                'right',
                [
                    { id: 'maze-skip', text: 'Skip', danger: true, icon: 'times' },
                    { id: 'maze-help', text: 'Show Me', primary: true, icon: 'lightbulb' }
                ]
            );
            
            // Add event listeners with cleanup
            this.addButtonHandler(tooltip, 'maze-skip', () => {
                this.cleanup();
                this.tutorial.closeTutorial();
            });
            
            this.addButtonHandler(tooltip, 'maze-help', () => {
                // Simulate clicking the maze button
                if (mazeButton) {
                    mazeButton.click();
                }
                
                // Show success animation
                this.tutorial.showSuccess();
                
                // Wait a bit and move to next step
                this.setTimerWithCleanup(() => {
                    this.tutorial.nextStep();
                }, 1500);
            });
            
            // Add click listener to the actual button with cleanup
            this.addEventListenerWithCleanup(mazeButton, 'click', (e) => {
                // Only react to actual user clicks
                if (!e.isTrusted) return;
                
                // Show success
                this.tutorial.showSuccess();
                
                // Replace help button with next button
                if (tooltip) {
                    const helpBtn = tooltip.querySelector('#maze-help');
                    if (helpBtn) {
                        const nextBtn = document.createElement('button');
                        nextBtn.id = 'maze-next';
                        nextBtn.className = 'tutorial-btn primary';
                        nextBtn.textContent = 'Next';
                        
                        const parentElement = helpBtn.parentElement;
                        if (parentElement) {
                            parentElement.replaceChild(nextBtn, helpBtn);
                            
                            // Add event listener to next button with cleanup
                            this.addEventListenerWithCleanup(nextBtn, 'click', () => {
                                this.tutorial.nextStep();
                            });
                        }
                    }
                }
            });
        }
    }
}

/**
 * Walls Tool Modal - Demonstrates how to add walls
 */
class WallsToolModal extends TutorialModal {
    /**
     * Show walls tool tutorial step
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Highlight the wall tool button
        const wallButton = this.highlightElement('#wall-btn', true);
        
        // Create a tooltip near the button
        if (wallButton) {
            const tooltip = this.createTooltip(
                wallButton,
                'Add Walls',
                'Try adding some custom walls. Select the "Add Walls" tool, then click and drag on the grid to add walls.',
                'right',
                [
                    { id: 'wall-skip', text: 'Skip', danger: true, icon: 'times' },
                    { id: 'wall-help', text: 'Show Me', primary: true, icon: 'lightbulb' }
                ]
            );
            
            // Add event listeners with cleanup
            this.addButtonHandler(tooltip, 'wall-skip', () => {
                this.cleanup();
                this.tutorial.closeTutorial();
            });
            
            this.addButtonHandler(tooltip, 'wall-help', () => {
                // Simulate clicking the wall button
                if (wallButton) {
                    wallButton.click();
                    
                    // Show prompt to draw on grid
                    this.setTimerWithCleanup(() => {
                        const gridNode = document.querySelector('.node:not(.start-node):not(.end-node)');
                        if (gridNode) {
                            // Use CSS selector instead of passing the element
                            const selector = `.node[data-row="${gridNode.dataset.row}"][data-col="${gridNode.dataset.col}"]`;
                            this.highlightElement(selector, true);
                        }
                    }, 500);
                }
            });
            
            // Add click listener to the wall button with cleanup
            this.addEventListenerWithCleanup(wallButton, 'click', (e) => {
                // Only react to actual user clicks
                if (!e.isTrusted) return;
                
                // Check for wall nodes after a delay
                this.setTimerWithCleanup(() => {
                    // Check if walls have been added
                    const wallsAdded = document.querySelector('.node.wall');
                    if (wallsAdded) {
                        // Show success
                        this.tutorial.showSuccess();
                        
                        // Replace help button with next button
                        if (tooltip) {
                            const helpBtn = tooltip.querySelector('#wall-help');
                            if (helpBtn) {
                                const nextBtn = document.createElement('button');
                                nextBtn.id = 'wall-next';
                                nextBtn.className = 'tutorial-btn primary';
                                nextBtn.textContent = 'Next';
                                
                                const parentElement = helpBtn.parentElement;
                                if (parentElement) {
                                    parentElement.replaceChild(nextBtn, helpBtn);
                                    
                                    // Add event listener to next button with cleanup
                                    this.addEventListenerWithCleanup(nextBtn, 'click', () => {
                                        this.tutorial.nextStep();
                                    });
                                }
                            }
                        }
                    }
                }, 1000);
            });
            
            // Check for wall nodes periodically using setIntervalWithCleanup
            this.setIntervalWithCleanup(() => {
                const wallsAdded = document.querySelector('.node.wall');
                if (wallsAdded) {
                    // Clean up all timers
                    this.cleanup();
                    
                    // Show success
                    this.tutorial.showSuccess();
                    
                    // Replace help button with next button
                    if (tooltip) {
                        const helpBtn = tooltip.querySelector('#wall-help');
                        if (helpBtn) {
                            const nextBtn = document.createElement('button');
                            nextBtn.id = 'wall-next';
                            nextBtn.className = 'tutorial-btn primary';
                            nextBtn.textContent = 'Next';
                            
                            const parentElement = helpBtn.parentElement;
                            if (parentElement) {
                                parentElement.replaceChild(nextBtn, helpBtn);
                                
                                // Add event listener with cleanup
                                this.addEventListenerWithCleanup(nextBtn, 'click', () => {
                                    this.tutorial.nextStep();
                                });
                            }
                        }
                    }
                }
            }, 1000);
        }
    }
}

/**
 * Weights Tool Modal - Demonstrates how to add weighted areas
 */
class WeightsToolModal extends TutorialModal {
    /**
     * Show weighted nodes tutorial step
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Highlight the weights tool button
        const weightButton = this.highlightElement('#weighted-node-btn', true);
        
        // Create a tooltip near the button
        if (weightButton) {
            const tooltip = this.createTooltip(
                weightButton,
                'Add Weighted Areas',
                'Now let\'s add some weighted areas. Select the "Add Weights" tool, then click on the grid to add nodes that cost more to travel through.',
                'right',
                [
                    { id: 'weight-skip', text: 'Skip', danger: true, icon: 'times' },
                    { id: 'weight-help', text: 'Show Me', primary: true, icon: 'lightbulb' }
                ]
            );
            
            // Add event listeners with cleanup
            if (tooltip) {
                this.addButtonHandler(tooltip, 'weight-skip', () => {
                    this.cleanup();
                    this.tutorial.closeTutorial();
                });
                
                this.addButtonHandler(tooltip, 'weight-help', () => {
                    // Simulate clicking the weight button
                    if (weightButton) {
                        weightButton.click();
                        
                        // Show prompt to draw on grid
                        this.setTimerWithCleanup(() => {
                            const gridNode = document.querySelector('.node:not(.start-node):not(.end-node):not(.wall)');
                            if (gridNode) {
                                // Use CSS selector instead of passing the element
                                const selector = `.node[data-row="${gridNode.dataset.row}"][data-col="${gridNode.dataset.col}"]`;
                                this.highlightElement(selector, true);
                            }
                        }, 500);
                    }
                });
            }
            
            // Check for weighted nodes periodically using setIntervalWithCleanup
            const checkInterval = this.setIntervalWithCleanup(() => {
                const weightsAdded = document.querySelector('.node.weighted');
                if (weightsAdded) {
                    // Clear the interval via cleanup since we're using tracked timers
                    this.cleanup();
                    
                    // Show success
                    this.tutorial.showSuccess();
                    
                    // Replace help button with next button
                    if (tooltip) {
                        const helpBtn = tooltip.querySelector('#weight-help');
                        if (helpBtn) {
                            const nextBtn = document.createElement('button');
                            nextBtn.id = 'weight-next';
                            nextBtn.className = 'tutorial-btn primary';
                            nextBtn.textContent = 'Next';
                            
                            const parentElement = helpBtn.parentElement;
                            if (parentElement) {
                                parentElement.replaceChild(nextBtn, helpBtn);
                                
                                // Add event listener with cleanup
                                this.addEventListenerWithCleanup(nextBtn, 'click', () => {
                                    this.tutorial.nextStep();
                                });
                            }
                        }
                    }
                }
            }, 1000);
        }
    }
}

/**
 * Find Path Modal - Shows how to start the algorithm visualization
 */
class FindPathModal extends TutorialModal {
    /**
     * Show the find path tutorial step
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Show a centered modal (not a tooltip)
        const { modal, overlay } = this.createModal(
            'Find Paths',
            'Now let\'s run the algorithms! Click the "Find Path" button to see which algorithm is more efficient.',
            [
                { id: 'path-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'path-help', text: 'Show Me', primary: true, icon: 'lightbulb' }
            ]
        );
        
        // Add event listeners with cleanup
        this.addButtonHandler(modal, 'path-skip', () => {
            this.cleanup();
            this.tutorial.closeTutorial();
        });
        
        this.addButtonHandler(modal, 'path-help', () => {
            // Close the modal
            const container = document.getElementById('tutorial-container');
            if (container && overlay) {
                container.removeChild(overlay);
            }
            
            // Always highlight the header Find Path button
            const startButton = document.getElementById('start-btn-header');
            if (startButton) {
                startButton.classList.add('tutorial-highlight', 'flash-animation');
                
                // Remove highlight and proceed to next step only when both algorithms are done
                const onFindPathClick = () => {
                    startButton.classList.remove('tutorial-highlight', 'flash-animation');
                    // Explicitly remove the click listener
                    startButton.removeEventListener('click', onFindPathClick);
                    
                    // Wait for both algorithms to finish using global completion flags
                    const pollForCompletion = this.setIntervalWithCleanup(() => {
                        if (window.dijkstraController?.isFinished && window.astarController?.isFinished) {
                            this.cleanup(); // Will clear the interval
                            this.tutorial.nextStep();
                        }
                    }, 500);
                    
                    // Fallback timeout to ensure the modal shows even if flags aren't set
                    this.setTimerWithCleanup(() => {
                        this.cleanup(); // Will clear all timers including the poll interval
                        this.tutorial.nextStep();
                    }, 2000);
                };
                
                this.addEventListenerWithCleanup(startButton, 'click', onFindPathClick);
            }
        });
    }
}

/**
 * Results Comparison Modal - Highlights the algorithm results
 */
class ResultsComparisonModal extends TutorialModal {
    /**
     * Show the results comparison tutorial step
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Show a centered modal (not a tooltip)
        const { modal, overlay } = this.createModal(
            'Compare Results',
            'Great job! Notice the difference between the algorithms. Compare the number of nodes visited and path length between Dijkstra\'s and A*.',
            [
                { id: 'results-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'results-show', text: 'Show Me', primary: true, icon: 'lightbulb' }
            ]
        );
        
        // Add event listeners
        this.addButtonHandler(modal, 'results-skip', () => {
            this.cleanup();
            this.tutorial.closeTutorial();
        });
        
        this.addButtonHandler(modal, 'results-show', () => {
            // Close the modal
            const container = document.getElementById('tutorial-container');
            if (container && overlay) {
                container.removeChild(overlay);
            }
            
            // Highlight the path footer info
            const pathFooters = document.querySelectorAll('.algorithm-footer');
            pathFooters.forEach(footer => {
                // Create a unique selector for each footer
                const algorithmType = footer.closest('.algorithm-container')?.dataset.algorithm || '';
                const selector = `.algorithm-container[data-algorithm="${algorithmType}"] .algorithm-footer`;
                this.highlightElement(selector, true);
            });
            
            // Wait 2 seconds then proceed to the completion step
            this.setTimerWithCleanup(() => {
                // Remove highlights using clearAllModals
                this.tutorial.clearAllModals();
                
                // Show the completion step
                this.tutorial.nextStep();
            }, 2000);
        });
    }
}

/**
 * Completion Modal - Final step of the basic tutorial
 */
class CompletionModal extends TutorialModal {
    /**
     * Show the completion modal
     */
    show() {
        const { modal } = this.createModal(
            'Basic Tutorial Complete!',
            'You\'ve completed the basic tutorial! Would you like to learn about the other features or reset the grid and start exploring on your own?',
            [
                { id: 'completion-reset', text: 'Reset and Explore', danger: false, icon: 'sync' },
                { id: 'completion-features', text: 'Learn More Features', primary: true, icon: 'book' }
            ]
        );
        
        // Add button event listeners
        const resetBtn = modal.querySelector('#completion-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.tutorial.resetAndFinish();
            });
        }
        
        const featuresBtn = modal.querySelector('#completion-features');
        if (featuresBtn) {
            featuresBtn.addEventListener('click', () => {
                this.tutorial.startFeatureTour();
            });
        }
    }
}

//=============================================================================
// FEATURE TOUR MODALS
//=============================================================================

/**
 * Maze Types Feature Modal - Explains different maze generation algorithms
 */
class MazeTypesFeatureModal extends TutorialModal {
    /**
     * Show the maze types feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        // Highlight the maze type select
        const mazeTypeSelect = this.highlightElement('#maze-type-select', true);
        
        // Create tooltip
        if (mazeTypeSelect) {
            this.createFeatureTourStep(
                '#maze-type-select',
                'Maze Types',
                'The dropdown menu offers different maze generation algorithms:<br>• Basic Random Maze: Randomly placed walls<br>• Recursive Division: Creates a structured maze with corridors<br>• Vertical/Horizontal Skew: Controls the orientation of passages',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Maze Types',
                'The maze type dropdown offers different maze generation algorithms like Basic Random, Recursive Division, and directional skew options.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Random Weights Feature Modal - Explains the random weights feature
 */
class RandomWeightsFeatureModal extends TutorialModal {
    /**
     * Show the random weights feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const weightsBtn = this.highlightElement('#random-weights-btn', true);
        
        if (weightsBtn) {
            this.createFeatureTourStep(
                '#random-weights-btn',
                'Random Weights',
                'This button adds random weighted nodes to the grid. Weighted nodes cost more for algorithms to travel through, which can affect path selection.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Random Weights',
                'The Random Weights button adds randomly distributed weighted nodes to the grid. Weighted nodes cost more for algorithms to travel through, affecting path selection.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Random Start/End Feature Modal - Explains the random start/end point feature
 */
class RandomStartEndFeatureModal extends TutorialModal {
    /**
     * Show the random start/end feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const startEndBtn = this.highlightElement('#random-start-end-btn', true);
        
        if (startEndBtn) {
            this.createFeatureTourStep(
                '#random-start-end-btn',
                'Random Start/End',
                'Quickly randomize the start and end points to test algorithms on different scenarios.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Random Start/End',
                'The Random Start/End button allows you to quickly randomize the start and end points to test algorithms on different scenarios.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Step By Step Feature Modal - Explains the step-by-step visualization mode
 */
class StepByStepFeatureModal extends TutorialModal {
    /**
     * Show the step-by-step feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const visualizationMode = this.highlightElement('#visualization-mode', true);
        
        if (visualizationMode) {
            this.createFeatureTourStep(
                '#visualization-mode',
                'Step-by-Step Mode',
                'Using this mode, you can see exactly how each algorithm works by stepping forward and backward through the pathfinding process.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Step-by-Step Mode',
                'The Step-by-Step visualization mode allows you to see exactly how each algorithm works by stepping forward and backward through the pathfinding process.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Speed Controls Feature Modal - Explains the visualization speed controls
 */
class SpeedControlsFeatureModal extends TutorialModal {
    /**
     * Show the speed controls feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const speedControl = this.highlightElement('#visualization-speed', true);
        
        if (speedControl) {
            this.createFeatureTourStep(
                '#visualization-speed',
                'Speed Controls',
                'Adjust how quickly the algorithms run during visualization. Slower speeds help you see what\'s happening in detail.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Speed Controls',
                'Speed controls allow you to adjust how quickly the algorithms run during visualization. Slower speeds help you see what\'s happening in detail.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Grid Size Feature Modal - Explains the grid size adjustment feature
 */
class GridSizeFeatureModal extends TutorialModal {
    /**
     * Show the grid size feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const gridSize = this.highlightElement('#grid-size', true);
        
        if (gridSize) {
            this.createFeatureTourStep(
                '#grid-size',
                'Grid Size',
                'Change the size of the grid to create more complex mazes or simpler test cases.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Grid Size',
                'The Grid Size control allows you to change the size of the grid to create more complex mazes or simpler test cases.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Save/Load Feature Modal - Explains the grid saving and loading features
 */
class SaveLoadFeatureModal extends TutorialModal {
    /**
     * Show the save/load feature modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const saveBtn = this.highlightElement('#save-grid-btn-header', true);
        
        if (saveBtn) {
            this.createFeatureTourStep(
                '#save-grid-btn-header',
                'Save/Load Grid',
                'Save your custom grids and load them later to compare algorithm performance on the same layout.',
                'right'
            );
        } else {
            // Fallback if element not found
            const { modal } = this.createModal(
                'Save/Load Grid',
                'The Save and Load features allow you to save your custom grids and load them later to compare algorithm performance on the same layout.',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            this.addSkipHandler(modal, 'feature-skip');
            this.addNextHandler(modal, 'feature-next', true);
        }
    }
}

/**
 * Feature Completion Modal - Final step of the feature tour
 */
class FeatureCompletionModal extends TutorialModal {
    /**
     * Show the feature completion modal
     */
    show() {
        // Cleanup any previous tooltips/highlights
        this.cleanup();
        
        const { modal } = this.createModal(
            'Feature Overview Complete',
            'You\'ve learned all the main features! Ready to start exploring on your own?',
            [
                { id: 'feature-finish', text: 'Reset and Start Exploring', primary: true, icon: 'sync' }
            ]
        );
        
        // Add button event listener
        this.addButtonHandler(modal, 'feature-finish', () => {
            this.cleanup();
            this.tutorial.resetAndFinish();
        });
    }
}

// Create tutorial instance and make it globally available
const modularTutorial = new ModularTutorial();
window.modularTutorial = modularTutorial;

// Initialize tutorial on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a short delay to ensure all elements are loaded
    setTimeout(() => {
        window.modularTutorial.init();
    }, 500);
}); 