/**
 * ModularTutorial.js
 * A modular tutorial system with separate components for each step
 */

class ModularTutorial {
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
        console.log('ModularTutorial: initializing...');
        
        // Create container if it doesn't exist
        if (!document.getElementById('tutorial-container')) {
            const container = document.createElement('div');
            container.id = 'tutorial-container';
            document.body.appendChild(container);
        }
        
        // Add styling
        this.addStyling();
        
        // Add tutorial button to help modal
        this.addTutorialButton();
        
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
        console.log('Tutorial state reset. Refresh the page to see the tutorial.');
        return 'Tutorial state reset. Refresh the page to see the tutorial.';
    }
    
    /**
     * Add necessary styling
     */
    addStyling() {
        // Check if styles already exist
        if (!document.getElementById('modular-tutorial-styles')) {
            const style = document.createElement('style');
            style.id = 'modular-tutorial-styles';
            style.textContent = `
                /* Base styles for all modals - matching app style */
                .tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(3px);
                    z-index: 9998;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .tutorial-modal {
                    background-color: #3c2a21; /* Dark brown background */
                    color: #fff;
                    width: 380px;
                    max-width: 90%;
                    border: 4px solid #986c44; /* Minecraft dirt border color */
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 0;
                    font-family: 'Pixelify Sans', sans-serif;
                    image-rendering: pixelated;
                    overflow: hidden;
                    border-radius: 0;
                    z-index: 10000;
                }
                
                .tutorial-tooltip {
                    position: absolute;
                    background-color: #3c2a21; /* Dark brown background */
                    color: #fff;
                    border: 4px solid #986c44; /* Minecraft dirt border color */
                    padding: 0;
                    z-index: 10001;
                    max-width: 300px;
                    font-family: 'Pixelify Sans', sans-serif;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    border-radius: 0;
                }
                
                .tutorial-header {
                    background-color: #986c44; /* Minecraft dirt color */
                    color: #fff;
                    margin: 0;
                    padding: 10px 15px;
                    text-shadow: 1px 1px 0 #000;
                    border-bottom: 4px solid #000;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .tutorial-header h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 1.2rem;
                    text-shadow: 1px 1px 0 #000;
                    flex: 1;
                    text-align: left;
                }
                
                .tutorial-content {
                    padding: 15px 15px 5px;
                    margin: 0;
                    text-shadow: 1px 1px 0 #000;
                    line-height: 1.4;
                    text-align: center;
                }
                .tutorial-content p {
                    text-align: center;
                }
                
                .tutorial-close {
                    color: #d9a334; /* Gold color */
                    font-size: 1.8rem;
                    font-weight: bold;
                    cursor: pointer;
                    text-shadow: 1px 1px 0 #000;
                    background: none;
                    border: none;
                    border-radius: 0;
                    transition: color 0.2s;
                    line-height: 1;
                    padding: 0 0 0 16px;
                    margin-left: 12px;
                    display: flex;
                    align-items: center;
                }
                
                .tutorial-close:hover {
                    color: #ffcc00;
                    background: none;
                }
                
                .tutorial-buttons {
                    display: flex;
                    padding: 0 15px 15px;
                    gap: 10px;
                }
                
                .tutorial-btn {
                    flex: 1;
                    padding: 8px 0;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 1rem;
                    background-color: #986c44; /* Minecraft dirt color */
                    color: white;
                    border: 3px solid #000; /* Thicker border */
                    cursor: pointer;
                    text-shadow: 1px 1px 0 #000;
                    transition: all 0.2s;
                    box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3); /* Minecraft-style button shadows */
                    letter-spacing: 0.5px; /* Slightly spaced out text */
                }
                
                .tutorial-btn:active {
                    transform: translateY(1px);
                    box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3);
                }
                
                .tutorial-btn.primary {
                    background-color: #5bac38; /* Green */
                    color: white;
                }
                
                .tutorial-btn.primary:hover {
                    background-color: #4a9c27;
                    transform: translateY(-2px);
                    box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .tutorial-btn.danger {
                    background-color: #e74c3c; /* Red */
                    color: white;
                }
                
                .tutorial-btn.danger:hover {
                    background-color: #c0392b;
                    transform: translateY(-2px);
                    box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .tutorial-btn:not(.primary):not(.danger) {
                    background-color: #986c44; /* Dirt brown */
                    color: white;
                }
                
                .tutorial-btn:not(.primary):not(.danger):hover {
                    background-color: #825432;
                    transform: translateY(-2px);
                    box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                /* Highlight effects */
                .tutorial-highlight {
                    position: relative;
                    z-index: 10001;
                    box-shadow: 0 0 0 4px #d9a334; /* Gold color */
                    border: 1px solid #000;
                }
                
                /* Flash animation for highlights */
                @keyframes flash-animation {
                    0% { box-shadow: 0 0 0 4px #d9a334; } /* Gold color */
                    50% { box-shadow: 0 0 0 8px rgba(217, 163, 52, 0.6); } /* Faded gold */
                    100% { box-shadow: 0 0 0 4px #d9a334; } /* Gold color */
                }
                
                .flash-animation {
                    animation: flash-animation 1.5s infinite;
                }
                
                /* Success animation */
                .tutorial-success {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.5);
                    background-color: #5bac38; /* Match the green button color */
                    color: white;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 50px;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 10002;
                    border: 4px solid #000;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    font-family: 'Pixelify Sans', sans-serif;
                    text-shadow: 1px 1px 0 #000;
                    image-rendering: pixelated;
                }
                
                .tutorial-success.show {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                
                @keyframes success-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(0, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                }
                
                .tutorial-success.show {
                    animation: success-pulse 1.5s infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Handle actions once document is ready
     */
    onDocumentReady() {
        console.log('ModularTutorial: document ready');
        // Always re-check the flag from localStorage
        this.tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        console.log('tutorialCompleted:', this.tutorialCompleted, 'localStorage:', localStorage.getItem('tutorialCompleted'));
        // Show tutorial prompt if not completed
        setTimeout(() => {
            if (!this.tutorialCompleted) {
                console.log('Tutorial not completed, starting tutorial...');
                this.startTutorial();
            } else {
                console.log('Tutorial already completed, not starting.');
            }
        }, 1500);
    }
    
    /**
     * Add a button to restart the tutorial
     */
    addTutorialButton() {
        // Check if help modal exists
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            const helpContent = helpModal.querySelector('.help-content');
            if (helpContent) {
                // Create a tutorial section
                const tutorialSection = document.createElement('div');
                tutorialSection.innerHTML = `
                    <h3>Tutorial</h3>
                    <p>Need help getting started? Run the interactive tutorial to learn how to use the app.</p>
                    <button id="restart-tutorial-btn" class="action-btn">Start Tutorial</button>
                `;
                
                // Insert at the beginning of help content
                helpContent.insertBefore(tutorialSection, helpContent.firstChild);
                
                // Add event listener
                document.getElementById('restart-tutorial-btn').addEventListener('click', () => {
                    // Close help modal first
                    helpModal.style.display = 'none';
                    
                    // Start tutorial
                    this.startTutorial();
                });
            }
        }
    }
    
    /**
     * Start the tutorial
     */
    startTutorial() {
        console.log('startTutorial() called');
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
        
        // Mark tutorial as completed
        localStorage.setItem('tutorialCompleted', 'true');
        this.tutorialCompleted = true;
    }
    
    /**
     * Start feature tour
     */
    startFeatureTour() {
        this.currentStep = 0;
        this.isActive = true;
        
        // Clear any existing modals
        this.clearAllModals();
        
        // Show first feature
        this.showCurrentFeature();
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

/**
 * Base modal class for tutorial steps
 */
class TutorialModal {
    constructor(tutorial) {
        this.tutorial = tutorial;
    }
    
    /**
     * Show the modal
     */
    show() {
        // To be implemented by subclasses
    }
    
    /**
     * Create base modal structure
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
            closeBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        
        return { overlay, modal };
    }
    
    /**
     * Highlight an element
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
     * Create a tooltip near an element
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
            closeBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        
        return tooltip;
    }
    
    /**
     * Position a tooltip relative to an element
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
}

/**
 * Introduction Modal
 */
class IntroModal extends TutorialModal {
    show() {
        const { modal } = this.createModal(
            'Welcome to Skull Cavern Path!',
            'This tutorial will guide you through comparing pathfinding algorithms to find the most efficient route through the Skull Cavern.',
            [
                { id: 'intro-skip', text: 'Skip Tutorial', danger: true, icon: 'times' },
                { id: 'intro-next', text: 'Start Tutorial', primary: true, icon: 'play' }
            ]
        );
        // Removed manual absolute centering. Flexbox will center the modal.
        // Add button event listeners
        const skipBtn = modal.querySelector('#intro-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        const nextBtn = modal.querySelector('#intro-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.tutorial.nextStep();
            });
        }
    }
}

/**
 * Algorithm Comparison Modal
 */
class AlgorithmComparisonModal extends TutorialModal {
    show() {
        // First show the modal with explanation and 'Show Me' button
        const { overlay, modal } = this.createModal(
            'Algorithm Comparison',
            'These two panels show Dijkstra\'s Algorithm and A* Algorithm side by side so you can compare their efficiency in finding the shortest path.',
            [
                { id: 'algo-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'algo-show', text: 'Show Me', primary: true, icon: 'eye' }
            ]
        );
        // Removed manual absolute centering. Flexbox will center the modal.
        // Add button event listeners
        const skipBtn = modal.querySelector('#algo-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        const showBtn = modal.querySelector('#algo-show');
        if (showBtn) {
            showBtn.addEventListener('click', () => {
                // Remove the modal
                const container = document.getElementById('tutorial-container');
                if (container && overlay) {
                    container.removeChild(overlay);
                }
                // Highlight the algorithm container
                const algorithmContainer = this.highlightElement('.algorithm-comparison', true);
                // Wait a few seconds to let the user see the highlighted container
                setTimeout(() => {
                    // Remove highlight
                    if (algorithmContainer) {
                        algorithmContainer.classList.remove('tutorial-highlight');
                        algorithmContainer.classList.remove('flash-animation');
                    }
                    // Move to next step
                    this.tutorial.nextStep();
                }, 3000); // Show for 3 seconds
            });
        }
    }
}

/**
 * Generate Maze Modal
 */
class GenerateMazeModal extends TutorialModal {
    show() {
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
            
            // Add event listeners
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#maze-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const helpBtn = tooltip.querySelector('#maze-help');
                if (helpBtn) {
                    helpBtn.addEventListener('click', () => {
                        // Simulate clicking the maze button
                        if (mazeButton) {
                            mazeButton.click();
                        }
                        
                        // Show success animation
                        this.tutorial.showSuccess();
                        
                        // Wait a bit and move to next step
                        setTimeout(() => {
                            this.tutorial.nextStep();
                        }, 1500);
                    });
                }
            }
            
            // Add click listener to the actual button
            mazeButton.addEventListener('click', (e) => {
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
                            
                            // Add event listener to next button
                            nextBtn.addEventListener('click', () => {
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
 * Walls Tool Modal
 */
class WallsToolModal extends TutorialModal {
    show() {
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
            
            // Add event listeners
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#wall-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const helpBtn = tooltip.querySelector('#wall-help');
                if (helpBtn) {
                    helpBtn.addEventListener('click', () => {
                        // Simulate clicking the wall button
                        if (wallButton) {
                            wallButton.click();
                            
                            // Show prompt to draw on grid
                            setTimeout(() => {
                                const gridNode = document.querySelector('.node:not(.start-node):not(.end-node)');
                                if (gridNode) {
                                    this.highlightElement(gridNode, true);
                                }
                            }, 500);
                        }
                    });
                }
            }
            
            // Add click listener to the wall button
            wallButton.addEventListener('click', (e) => {
                // Only react to actual user clicks
                if (!e.isTrusted) return;
                
                // Check for wall nodes after a delay
                setTimeout(() => {
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
                                    
                                    // Add event listener to next button
                                    nextBtn.addEventListener('click', () => {
                                        this.tutorial.nextStep();
                                    });
                                }
                            }
                        }
                    }
                }, 1000);
            });
            
            // Check for wall nodes periodically
            const checkInterval = setInterval(() => {
                const wallsAdded = document.querySelector('.node.wall');
                if (wallsAdded) {
                    clearInterval(checkInterval);
                    
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
                                
                                // Add event listener to next button
                                nextBtn.addEventListener('click', () => {
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
 * Weights Tool Modal
 */
class WeightsToolModal extends TutorialModal {
    show() {
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
            
            // Add event listeners
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#weight-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const helpBtn = tooltip.querySelector('#weight-help');
                if (helpBtn) {
                    helpBtn.addEventListener('click', () => {
                        // Simulate clicking the weight button
                        if (weightButton) {
                            weightButton.click();
                            
                            // Show prompt to draw on grid
                            setTimeout(() => {
                                const gridNode = document.querySelector('.node:not(.start-node):not(.end-node):not(.wall)');
                                if (gridNode) {
                                    this.highlightElement(gridNode, true);
                                }
                            }, 500);
                        }
                    });
                }
            }
            
            // Check for weighted nodes periodically
            const checkInterval = setInterval(() => {
                const weightsAdded = document.querySelector('.node.weighted');
                if (weightsAdded) {
                    clearInterval(checkInterval);
                    
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
                                
                                // Add event listener to next button
                                nextBtn.addEventListener('click', () => {
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
 * Find Path Modal
 */
class FindPathModal extends TutorialModal {
    show() {
        // Show a centered modal (not a tooltip)
        const { modal, overlay } = this.createModal(
            'Find Paths',
            'Now let\'s run the algorithms! Click the "Find Path" button to see which algorithm is more efficient.',
            [
                { id: 'path-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'path-help', text: 'Show Me', primary: true, icon: 'lightbulb' }
            ]
        );
        // Add event listeners
        const skipBtn = modal.querySelector('#path-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        const helpBtn = modal.querySelector('#path-help');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
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
                        startButton.removeEventListener('click', onFindPathClick);
                        // Wait for both algorithms to finish using global completion flags
                        const pollForCompletion = setInterval(() => {
                            if (window.dijkstraController.isFinished && window.astarController.isFinished) {
                                clearInterval(pollForCompletion);
                                this.tutorial.nextStep();
                            }
                        }, 500);
                        // Fallback timeout to ensure the modal shows even if flags aren't set
                        setTimeout(() => {
                            clearInterval(pollForCompletion);
                            this.tutorial.nextStep();
                        }, 5000); // 5 seconds fallback
                    };
                    startButton.addEventListener('click', onFindPathClick);
                }
            });
        }
    }
}

/**
 * Results Comparison Modal
 */
class ResultsComparisonModal extends TutorialModal {
    show() {
        // Show a centered modal (not a tooltip)
        const { modal, overlay } = this.createModal(
            'Compare Results',
            'Great job! Notice the difference between the algorithms. Compare the number of nodes visited and path length between Dijkstra\'s and A*.',
            [
                { id: 'results-skip', text: 'Skip', danger: true, icon: 'times' },
                { id: 'results-next', text: 'Next', primary: true, icon: 'arrow-right' }
            ]
        );
        // Add event listeners
        const skipBtn = modal.querySelector('#results-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.tutorial.closeTutorial();
            });
        }
        const nextBtn = modal.querySelector('#results-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.tutorial.nextStep();
            });
        }
    }
}

/**
 * Completion Modal
 */
class CompletionModal extends TutorialModal {
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

/**
 * Feature Tour Modals
 */
class MazeTypesFeatureModal extends TutorialModal {
    show() {
        // Highlight the maze type select
        const mazeTypeSelect = this.highlightElement('#maze-type-select', true);
        
        // Create tooltip
        if (mazeTypeSelect) {
            const tooltip = this.createTooltip(
                mazeTypeSelect,
                'Maze Types',
                'The dropdown menu offers different maze generation algorithms:<br>• Basic Random Maze: Randomly placed walls<br>• Recursive Division: Creates a structured maze with corridors<br>• Vertical/Horizontal Skew: Controls the orientation of passages',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            // Add event listeners
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class RandomWeightsFeatureModal extends TutorialModal {
    show() {
        const weightsBtn = this.highlightElement('#random-weights-btn', true);
        
        if (weightsBtn) {
            const tooltip = this.createTooltip(
                weightsBtn,
                'Random Weights',
                'This button adds random weighted nodes to the grid. Weighted nodes cost more for algorithms to travel through, which can affect path selection.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class RandomStartEndFeatureModal extends TutorialModal {
    show() {
        const startEndBtn = this.highlightElement('#random-start-end-btn', true);
        
        if (startEndBtn) {
            const tooltip = this.createTooltip(
                startEndBtn,
                'Random Start/End',
                'Quickly randomize the start and end points to test algorithms on different scenarios.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class StepByStepFeatureModal extends TutorialModal {
    show() {
        const visualizationMode = this.highlightElement('#visualization-mode', true);
        
        if (visualizationMode) {
            const tooltip = this.createTooltip(
                visualizationMode,
                'Step-by-Step Mode',
                'Using this mode, you can see exactly how each algorithm works by stepping forward and backward through the pathfinding process.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class SpeedControlsFeatureModal extends TutorialModal {
    show() {
        const speedControl = this.highlightElement('#visualization-speed', true);
        
        if (speedControl) {
            const tooltip = this.createTooltip(
                speedControl,
                'Speed Controls',
                'Adjust how quickly the algorithms run during visualization. Slower speeds help you see what\'s happening in detail.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class GridSizeFeatureModal extends TutorialModal {
    show() {
        const gridSize = this.highlightElement('#grid-size', true);
        
        if (gridSize) {
            const tooltip = this.createTooltip(
                gridSize,
                'Grid Size',
                'Change the size of the grid to create more complex mazes or simpler test cases.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class SaveLoadFeatureModal extends TutorialModal {
    show() {
        const saveBtn = this.highlightElement('#save-grid-btn-header', true);
        
        if (saveBtn) {
            const tooltip = this.createTooltip(
                saveBtn,
                'Save/Load Grid',
                'Save your custom grids and load them later to compare algorithm performance on the same layout.',
                'right',
                [
                    { id: 'feature-skip', text: 'Skip All', danger: true, icon: 'times' },
                    { id: 'feature-next', text: 'Next Feature', primary: true, icon: 'arrow-right' }
                ]
            );
            
            if (tooltip) {
                const skipBtn = tooltip.querySelector('#feature-skip');
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.tutorial.closeTutorial();
                    });
                }
                
                const nextBtn = tooltip.querySelector('#feature-next');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        this.tutorial.nextFeature();
                    });
                }
            }
        }
    }
}

class FeatureCompletionModal extends TutorialModal {
    show() {
        const { modal } = this.createModal(
            'Feature Overview Complete',
            'You\'ve learned all the main features! Ready to start exploring on your own?',
            [
                { id: 'feature-finish', text: 'Reset and Start Exploring', primary: true, icon: 'sync' }
            ]
        );
        
        // Add button event listener
        const finishBtn = modal.querySelector('#feature-finish');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.tutorial.resetAndFinish();
            });
        }
    }
}

// Export the tutorial instance
const modularTutorial = new ModularTutorial();
window.modularTutorial = modularTutorial; 