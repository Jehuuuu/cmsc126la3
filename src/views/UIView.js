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
                this.controllers.dijkstra.setSpeed(speedSelect.value);
                this.controllers.astar.setSpeed(speedSelect.value);
            });
        }
        
        // Visualization mode control
        const modeSelect = document.getElementById('visualization-mode');
        console.log("Mode select found:", !!modeSelect);
        if (modeSelect) {
            modeSelect.addEventListener('change', () => {
                this.controllers.dijkstra.setMode(modeSelect.value);
                this.controllers.astar.setMode(modeSelect.value);
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
                // Force stop any ongoing visualizations using window global references
                if (window.dijkstraController) {
                    window.dijkstraController.reset();
                    window.dijkstraController.resetUI();
                    
                    // Reset step controls if in step-by-step mode
                    const nextStepBtn = document.getElementById('next-step-btn');
                    const prevStepBtn = document.getElementById('prev-step-btn');
                    if (nextStepBtn) nextStepBtn.disabled = true;
                    if (prevStepBtn) prevStepBtn.disabled = true;
                }
                
                if (window.astarController) {
                    window.astarController.reset();
                    window.astarController.resetUI();
                }
                
                // Then clear the grid using the game controller
                this.controllers.game.clearGrid();
                
                // Enable user interactions after clearing
                const toolButtons = document.querySelectorAll('.tool-btn');
                const gridSizeSelect = document.getElementById('grid-size');
                
                toolButtons.forEach(button => {
                    button.disabled = false;
                });
                
                if (gridSizeSelect) {
                    gridSizeSelect.disabled = false;
                }
            });
        }
        
        // Start button (find path)
        const startButton = document.getElementById('start-btn');
        console.log("Start button found:", !!startButton);
        if (startButton) {
            startButton.addEventListener('click', () => {
                // Run both algorithms simultaneously
                this.controllers.dijkstra.startVisualization();
                this.controllers.astar.startVisualization();
            });
        }
        
        // Step controls
        const nextStepButton = document.getElementById('next-step-btn');
        console.log("Next step button found:", !!nextStepButton);
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => {
                this.controllers.dijkstra.nextStep();
                this.controllers.astar.nextStep();
            });
        }
        
        const prevStepButton = document.getElementById('prev-step-btn');
        console.log("Previous step button found:", !!prevStepButton);
        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => {
                this.controllers.dijkstra.prevStep();
                this.controllers.astar.prevStep();
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
        // Disable only tool buttons inside the .tools div
        const toolButtons = document.querySelectorAll('.tools .tool-btn');
        const gridSizeSelect = document.getElementById('grid-size');
        
        toolButtons.forEach(button => {
            button.disabled = disabled;
        });
        
        if (gridSizeSelect) {
            gridSizeSelect.disabled = disabled;
        }
        
        // Make sure Clear Grid button remains enabled at all times
        const clearGridBtn = document.getElementById('clear-grid-btn');
        if (clearGridBtn) {
            clearGridBtn.disabled = false;
        }
    }
} 