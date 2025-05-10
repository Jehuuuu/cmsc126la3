/**
 * UIView class for handling UI controls and interactions
 */
class UIView {
    /**
     * Create a new UIView
     * @param {Object} controllers - The controller objects
     */
    constructor(controllers) {
        this.controllers = controllers;
        console.log("UIView: Setting up event listeners");
        this.setupEventListeners();
        this.activeToolButton = null;
    }

    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Grid size control
        const gridSizeSelect = document.getElementById('grid-size');
        console.log("Grid size select found:", !!gridSizeSelect);
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', () => {
                const size = parseInt(gridSizeSelect.value);
                this.controllers.game.resizeGrid(size, size);
            });
        }
        
        // Visualization speed control
        const speedSelect = document.getElementById('visualization-speed');
        console.log("Speed select found:", !!speedSelect);
        if (speedSelect) {
            speedSelect.addEventListener('change', () => {
                this.controllers.visualization.setSpeed(speedSelect.value);
            });
        }
        
        // Visualization mode control
        const modeSelect = document.getElementById('visualization-mode');
        console.log("Mode select found:", !!modeSelect);
        if (modeSelect) {
            modeSelect.addEventListener('change', () => {
                this.controllers.visualization.setMode(modeSelect.value);
            });
        }
        
        // Tool buttons
        this.setupToolButton('start-node-btn', 'start');
        this.setupToolButton('end-node-btn', 'end');
        this.setupToolButton('wall-btn', 'wall');
        this.setupToolButton('erase-btn', 'erase');
        
        // Random maze button
        const randomMazeButton = document.getElementById('random-maze-btn');
        console.log("Random maze button found:", !!randomMazeButton);
        if (randomMazeButton) {
            randomMazeButton.addEventListener('click', () => {
                this.controllers.game.generateRandomMaze();
            });
        }
        
        // Random start/end button
        const randomStartEndButton = document.getElementById('random-start-end-btn');
        console.log("Random start/end button found:", !!randomStartEndButton);
        if (randomStartEndButton) {
            randomStartEndButton.addEventListener('click', () => {
                this.controllers.game.setRandomStartEnd();
            });
        }
        
        // Clear grid button
        const clearGridButton = document.getElementById('clear-grid-btn');
        console.log("Clear grid button found:", !!clearGridButton);
        if (clearGridButton) {
            clearGridButton.addEventListener('click', () => {
                this.controllers.game.clearGrid();
            });
        }
        
        // Start button (find path)
        const startButton = document.getElementById('start-btn');
        console.log("Start button found:", !!startButton);
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.controllers.visualization.startVisualization();
            });
        }
        
        // Step controls
        const nextStepButton = document.getElementById('next-step-btn');
        console.log("Next step button found:", !!nextStepButton);
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => {
                this.controllers.visualization.nextStep();
            });
        }
        
        const prevStepButton = document.getElementById('prev-step-btn');
        console.log("Previous step button found:", !!prevStepButton);
        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => {
                this.controllers.visualization.prevStep();
            });
        }
        
        // Alternative path selection
        for (let i = 1; i <= 3; i++) {
            const pathPreview = document.getElementById(`path-preview-${i}`);
            console.log(`Path preview ${i} found:`, !!pathPreview);
            if (pathPreview) {
                pathPreview.addEventListener('click', () => {
                    this.controllers.visualization.selectAlternativePath(i - 1);
                });
            }
        }
    }

    /**
     * Set up a tool button
     * @param {string} buttonId - The ID of the button
     * @param {string} tool - The tool name
     */
    setupToolButton(buttonId, tool) {
        const button = document.getElementById(buttonId);
        console.log(`Tool button '${buttonId}' found:`, !!button);
        if (button) {
            button.addEventListener('click', () => {
                this.setActiveTool(button, tool);
            });
            
            // Set wall as default active tool
            if (tool === 'wall') {
                this.setActiveTool(button, tool);
            }
        }
    }

    /**
     * Set the active tool
     * @param {HTMLElement} button - The tool button
     * @param {string} tool - The tool name
     */
    setActiveTool(button, tool) {
        // Remove active class from previous active button
        if (this.activeToolButton) {
            this.activeToolButton.classList.remove('active');
        }
        
        // Set new active button
        button.classList.add('active');
        this.activeToolButton = button;
        
        // Update current tool in controller
        this.controllers.game.setCurrentTool(tool);
    }

    /**
     * Enable/disable step controls
     * @param {boolean} enabled - Whether the controls should be enabled
     */
    setStepControlsEnabled(enabled) {
        const nextStepButton = document.getElementById('next-step-btn');
        const prevStepButton = document.getElementById('prev-step-btn');
        
        if (nextStepButton && prevStepButton) {
            nextStepButton.disabled = !enabled;
            prevStepButton.disabled = !enabled;
        }
    }

    /**
     * Update the UI based on the current mode
     * @param {string} mode - The current visualization mode
     */
    updateModeUI(mode) {
        const stepControls = document.querySelectorAll('.step-control');
        const startButton = document.getElementById('start-btn');
        
        if (mode === 'step') {
            // Show step controls
            stepControls.forEach(control => {
                control.style.display = 'inline-block';
            });
            
            // Update start button text
            if (startButton) {
                startButton.textContent = 'Prepare Path';
            }
        } else {
            // Hide step controls
            stepControls.forEach(control => {
                control.style.display = 'none';
            });
            
            // Update start button text
            if (startButton) {
                startButton.textContent = 'Find Path';
            }
        }
    }
    
    /**
     * Disable grid interactions during visualization
     * @param {boolean} disabled - Whether interactions should be disabled
     */
    setGridInteractionsDisabled(disabled) {
        const toolButtons = document.querySelectorAll('.tool-btn');
        const gridSizeSelect = document.getElementById('grid-size');
        
        toolButtons.forEach(button => {
            button.disabled = disabled;
        });
        
        if (gridSizeSelect) {
            gridSizeSelect.disabled = disabled;
        }
    }
} 