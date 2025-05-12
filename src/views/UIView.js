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
        this.setupEventListeners();
        this.activeToolButton = null;
    }

    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // console.log("UIView: Setting up event listeners");
        
        // Grid size control - desktop
        const gridSizeSelect = document.getElementById('grid-size');
        // console.log("Grid size select found:", !!gridSizeSelect);
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', () => {
                const size = parseInt(gridSizeSelect.value);
                this.controllers.game.resizeGrid(size, size);
                
                // Show toast notification for grid resize
                if (window.Toast) {
                    window.Toast.info(`Grid size changed to ${size}x${size}`);
                }
                
                // Sync mobile control
                const mobileSizeSelect = document.getElementById('grid-size-mobile');
                if (mobileSizeSelect) {
                    mobileSizeSelect.value = size;
                }
            });
        }
        
        // Grid size control - mobile
        const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
        if (gridSizeMobileSelect) {
            gridSizeMobileSelect.addEventListener('change', () => {
                const size = parseInt(gridSizeMobileSelect.value);
                this.controllers.game.resizeGrid(size, size);
                
                // Show toast notification for grid resize
                if (window.Toast) {
                    window.Toast.info(`Grid size changed to ${size}x${size}`);
                }
                
                // Sync desktop control
                if (gridSizeSelect) {
                    gridSizeSelect.value = size;
                }
            });
        }
        
        // Visualization speed control - desktop
        const speedSelect = document.getElementById('visualization-speed');
        // console.log("Speed select found:", !!speedSelect);
        if (speedSelect) {
            speedSelect.addEventListener('change', () => {
                const speed = speedSelect.value;
                this.controllers.dijkstra.setSpeed(speed);
                this.controllers.astar.setSpeed(speed);
                
                // Sync mobile control
                const mobileSpeedSelect = document.getElementById('visualization-speed-mobile');
                if (mobileSpeedSelect) {
                    mobileSpeedSelect.value = speed;
                }
            });
        }
        
        // Visualization speed control - mobile
        const speedMobileSelect = document.getElementById('visualization-speed-mobile');
        if (speedMobileSelect) {
            speedMobileSelect.addEventListener('change', () => {
                const speed = speedMobileSelect.value;
                this.controllers.dijkstra.setSpeed(speed);
                this.controllers.astar.setSpeed(speed);
                
                // Sync desktop control
                if (speedSelect) {
                    speedSelect.value = speed;
                }
            });
        }
        
        // Visualization mode control - desktop
        const modeSelect = document.getElementById('visualization-mode');
        // console.log("Mode select found:", !!modeSelect);
        if (modeSelect) {
            modeSelect.addEventListener('change', (event) => {
                const selectedMode = event.target.value;
                const previousMode = this.controllers.dijkstra.mode;
                
                // First, check if both algorithms have completed visualizations
                const bothAlgorithmsCompleted = this.checkIfBothAlgorithmsCompleted();
                
                // Apply mode changes to both controllers
                this.controllers.dijkstra.setMode(selectedMode);
                this.controllers.astar.setMode(selectedMode);
                
                // Special case: when switching from step to auto mode and both algorithms 
                // were active, ensure all visualization elements are cleared and controls re-enabled
                if (previousMode === 'step' && selectedMode === 'auto') {
                    // The resetPathVisualization calls in the setMode methods will handle
                    // clearing the visualization and setting isVisualizing to false
                    
                    // Force reset visualization state
                    this.controllers.dijkstra.isVisualizing = false;
                    this.controllers.astar.isVisualizing = false;
                    
                    // Make sure speed selector is re-enabled
                    const speedSelect = document.getElementById('visualization-speed');
                    const speedMobileSelect = document.getElementById('visualization-speed-mobile');
                    if (speedSelect) speedSelect.disabled = false;
                    if (speedMobileSelect) speedMobileSelect.disabled = false;
                    
                    // Make sure grid size selector is re-enabled
                    const gridSizeSelect = document.getElementById('grid-size');
                    const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
                    if (gridSizeSelect) gridSizeSelect.disabled = false;
                    if (gridSizeMobileSelect) gridSizeMobileSelect.disabled = false;
                    
                    // Re-enable all tool buttons
                    const toolButtons = document.querySelectorAll('.tool-btn');
                    toolButtons.forEach(button => {
                        button.disabled = false;
                    });
                } else if (previousMode === 'auto' && selectedMode === 'step') {
                    // When switching to step mode, make sure to disable speed controls
                    const speedSelect = document.getElementById('visualization-speed');
                    const speedMobileSelect = document.getElementById('visualization-speed-mobile');
                    if (speedSelect) speedSelect.disabled = true;
                    if (speedMobileSelect) speedMobileSelect.disabled = true;
                }
                
                // Show toast notification for mode change
                if (window.Toast) {
                    if (selectedMode === 'step') {
                        window.Toast.info('Step-by-step mode activated');
                    }
                }
                
                // Sync mobile control
                const mobileModeSelect = document.getElementById('visualization-mode-mobile');
                if (mobileModeSelect) {
                    mobileModeSelect.value = selectedMode;
                }
                
                // Update the step-by-step button visibility
                if (typeof toggleStepByStepButton === 'function') {
                    toggleStepByStepButton(selectedMode === 'step');
                }
            });
        }
        
        // Visualization mode control - mobile
        const modeMobileSelect = document.getElementById('visualization-mode-mobile');
        if (modeMobileSelect) {
            modeMobileSelect.addEventListener('change', (event) => {
                const selectedMode = event.target.value;
                const previousMode = this.controllers.dijkstra.mode;
                
                // First, check if both algorithms have completed visualizations
                const bothAlgorithmsCompleted = this.checkIfBothAlgorithmsCompleted();
                
                // Apply mode changes to both controllers
                this.controllers.dijkstra.setMode(selectedMode);
                this.controllers.astar.setMode(selectedMode);
                
                // Special case: when switching from step to auto mode and both algorithms 
                // were active, ensure all visualization elements are cleared and controls re-enabled
                if (previousMode === 'step' && selectedMode === 'auto') {
                    // The resetPathVisualization calls in the setMode methods will handle
                    // clearing the visualization and setting isVisualizing to false
                    
                    // Force reset visualization state
                    this.controllers.dijkstra.isVisualizing = false;
                    this.controllers.astar.isVisualizing = false;
                    
                    // Make sure speed selector is re-enabled
                    const speedSelect = document.getElementById('visualization-speed');
                    const speedMobileSelect = document.getElementById('visualization-speed-mobile');
                    if (speedSelect) speedSelect.disabled = false;
                    if (speedMobileSelect) speedMobileSelect.disabled = false;
                    
                    // Make sure grid size selector is re-enabled
                    const gridSizeSelect = document.getElementById('grid-size');
                    const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
                    if (gridSizeSelect) gridSizeSelect.disabled = false;
                    if (gridSizeMobileSelect) gridSizeMobileSelect.disabled = false;
                    
                    // Re-enable all tool buttons
                    const toolButtons = document.querySelectorAll('.tool-btn');
                    toolButtons.forEach(button => {
                        button.disabled = false;
                    });
                } else if (previousMode === 'auto' && selectedMode === 'step') {
                    // When switching to step mode, make sure to disable speed controls
                    const speedSelect = document.getElementById('visualization-speed');
                    const speedMobileSelect = document.getElementById('visualization-speed-mobile');
                    if (speedSelect) speedSelect.disabled = true;
                    if (speedMobileSelect) speedMobileSelect.disabled = true;
                }
                
                // Show toast notification for mode change
                if (window.Toast) {
                    if (selectedMode === 'step') {
                        window.Toast.info('Step-by-step mode activated');
                    }
                }
                
                // Sync desktop control
                if (modeSelect) {
                    modeSelect.value = selectedMode;
                }
                
                // Update the step-by-step button visibility
                if (typeof toggleStepByStepButton === 'function') {
                    toggleStepByStepButton(selectedMode === 'step');
                }
            });
        }
        
        // Tool buttons - desktop
        this.setupToolButton('start-node-btn', 'start');
        this.setupToolButton('end-node-btn', 'end');
        this.setupToolButton('wall-btn', 'wall');
        this.setupToolButton('weighted-node-btn', 'weighted');
        this.setupToolButton('erase-btn', 'erase');
        
        // Tool buttons - mobile
        this.setupToolButton('start-node-btn-mobile', 'start');
        this.setupToolButton('end-node-btn-mobile', 'end');
        this.setupToolButton('wall-btn-mobile', 'wall');
        this.setupToolButton('weighted-node-btn-mobile', 'weighted');
        this.setupToolButton('erase-btn-mobile', 'erase');
        
        // Random maze button - desktop
        const randomMazeButton = document.getElementById('random-maze-btn');
        // console.log("Random maze button found:", !!randomMazeButton);
        if (randomMazeButton) {
            randomMazeButton.addEventListener('click', () => {
                this.controllers.game.generateRandomMaze();
            });
        }
        
        // Random maze button - mobile
        const randomMazeMobileButton = document.getElementById('random-maze-btn-mobile');
        if (randomMazeMobileButton) {
            randomMazeMobileButton.addEventListener('click', () => {
                this.controllers.game.generateRandomMaze();
            });
        }
        
        // Random weights button - desktop
        const randomWeightsButton = document.getElementById('random-weights-btn');
        // console.log("Random weights button found:", !!randomWeightsButton);
        if (randomWeightsButton) {
            randomWeightsButton.addEventListener('click', () => {
                this.controllers.game.generateRandomWeights();
            });
        }
        
        // Random weights button - mobile
        const randomWeightsMobileButton = document.getElementById('random-weights-btn-mobile');
        if (randomWeightsMobileButton) {
            randomWeightsMobileButton.addEventListener('click', () => {
                this.controllers.game.generateRandomWeights();
            });
        }
        
        // Random start/end button - desktop
        const randomStartEndButton = document.getElementById('random-start-end-btn');
        // console.log("Random start/end button found:", !!randomStartEndButton);
        if (randomStartEndButton) {
            randomStartEndButton.addEventListener('click', () => {
                this.controllers.game.setRandomStartEnd();
            });
        }
        
        // Random start/end button - mobile
        const randomStartEndMobileButton = document.getElementById('random-start-end-btn-mobile');
        if (randomStartEndMobileButton) {
            randomStartEndMobileButton.addEventListener('click', () => {
                this.controllers.game.setRandomStartEnd();
            });
        }
        
        // Save grid button - desktop
        const saveGridButton = document.getElementById('save-grid-btn');
        // console.log("Save grid button found:", !!saveGridButton);
        if (saveGridButton) {
            saveGridButton.addEventListener('click', () => {
                this.showSaveGridModal();
            });
        }
        
        // Save grid button - mobile
        const saveGridMobileButton = document.getElementById('save-grid-btn-mobile');
        if (saveGridMobileButton) {
            saveGridMobileButton.addEventListener('click', () => {
                this.showSaveGridModal();
            });
        }
        
        // Load grid button - desktop
        const loadGridButton = document.getElementById('load-grid-btn');
        // console.log("Load grid button found:", !!loadGridButton);
        if (loadGridButton) {
            loadGridButton.addEventListener('click', () => {
                this.showLoadGridModal();
            });
        }
        
        // Load grid button - mobile
        const loadGridMobileButton = document.getElementById('load-grid-btn-mobile');
        if (loadGridMobileButton) {
            loadGridMobileButton.addEventListener('click', () => {
                this.showLoadGridModal();
            });
        }
        
        // Save confirmation
        const confirmSaveButton = document.getElementById('confirm-save-btn');
        if (confirmSaveButton) {
            confirmSaveButton.addEventListener('click', () => {
                const nameInput = document.getElementById('grid-name-input');
                const gridName = nameInput.value.trim() || `Grid-${Date.now()}`;
                
                if (this.controllers.game.saveGrid(gridName)) {
                    // Use toast notification instead of alert
                    if (window.Toast) {
                        window.Toast.success(`Grid saved as "${gridName}"`);
                    } else {
                        alert(`Grid saved as "${gridName}"`);
                    }
                    this.hideSaveGridModal();
                } else {
                    // Use toast notification for error
                    if (window.Toast) {
                        window.Toast.error('Failed to save grid. Please try again.');
                    } else {
                        alert('Failed to save grid. Please try again.');
                    }
                }
            });
        }
        
        // Cancel save
        const cancelSaveButton = document.getElementById('cancel-save-btn');
        if (cancelSaveButton) {
            cancelSaveButton.addEventListener('click', () => {
                this.hideSaveGridModal();
            });
        }
        
        // Cancel load
        const cancelLoadButton = document.getElementById('cancel-load-btn');
        if (cancelLoadButton) {
            cancelLoadButton.addEventListener('click', () => {
                this.hideLoadGridModal();
            });
        }
        
        // Help button - desktop
        const helpDesktopButton = document.getElementById('help-btn-desktop');
        if (helpDesktopButton) {
            helpDesktopButton.addEventListener('click', () => {
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    helpModal.style.display = 'block';
                }
            });
        }
        
        // Help button - mobile
        const helpMobileButton = document.getElementById('help-btn');
        if (helpMobileButton) {
            helpMobileButton.addEventListener('click', () => {
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    helpModal.style.display = 'block';
                }
            });
        }
        
        // Close buttons for modals
        document.querySelectorAll('.close-btn').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                // Find the parent modal of this close button
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Clear grid button - desktop
        const clearGridButton = document.getElementById('clear-grid-btn');
        // console.log("Clear grid button found:", !!clearGridButton);
        if (clearGridButton) {
            clearGridButton.addEventListener('click', () => {
                this.handleClearGrid();
            });
        }
        
        // Clear grid button - mobile
        const clearGridMobileButton = document.getElementById('clear-grid-btn-mobile');
        if (clearGridMobileButton) {
            clearGridMobileButton.addEventListener('click', () => {
                this.handleClearGrid();
            });
        }
        
        // Start button (find path) - desktop
        const startButton = document.getElementById('start-btn');
        // console.log("Start button found:", !!startButton);
        if (startButton) {
            startButton.addEventListener('click', () => {
                // Run both algorithms in parallel using Promise.all
                Promise.all([
                    this.controllers.dijkstra.startVisualization(),
                    this.controllers.astar.startVisualization()
                ]);
            });
        }
        
        // Start button (find path) - mobile
        const startMobileButton = document.getElementById('start-btn-mobile');
        if (startMobileButton) {
            startMobileButton.addEventListener('click', () => {
                // Run both algorithms in parallel using Promise.all
                Promise.all([
                    this.controllers.dijkstra.startVisualization(),
                    this.controllers.astar.startVisualization()
                ]);
            });
        }
        
        // Step controls - desktop
        const nextStepButton = document.getElementById('next-step-btn');
        // console.log("Next step button found:", !!nextStepButton);
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => {
                this.controllers.dijkstra.nextStep();
                this.controllers.astar.nextStep();
            });
        }
        
        const prevStepButton = document.getElementById('prev-step-btn');
        // console.log("Previous step button found:", !!prevStepButton);
        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => {
                this.controllers.dijkstra.prevStep();
                this.controllers.astar.prevStep();
            });
        }
        
        // Step controls - mobile
        const nextStepMobileButton = document.getElementById('next-step-btn-mobile');
        if (nextStepMobileButton) {
            nextStepMobileButton.addEventListener('click', () => {
                this.controllers.dijkstra.nextStep();
                this.controllers.astar.nextStep();
            });
        }
        
        const prevStepMobileButton = document.getElementById('prev-step-btn-mobile');
        if (prevStepMobileButton) {
            prevStepMobileButton.addEventListener('click', () => {
                this.controllers.dijkstra.prevStep();
                this.controllers.astar.prevStep();
            });
        }
        
        // Alternative path selection
        for (let i = 1; i <= 3; i++) {
            const pathPreview = document.getElementById(`path-preview-${i}`);
            // console.log(`Path preview ${i} found:`, !!pathPreview);
            if (pathPreview) {
                pathPreview.addEventListener('click', () => {
                    this.controllers.visualization.selectAlternativePath(i - 1);
                });
            }
        }

        // Mobile toggle controls button event handler
        const toggleControlsBtn = document.getElementById('toggle-controls-btn');
        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => {
                const collapsibleControls = document.getElementById('collapsible-controls');
                if (collapsibleControls) {
                    collapsibleControls.classList.toggle('collapsed');
                    
                    // Update button text
                    if (collapsibleControls.classList.contains('collapsed')) {
                        toggleControlsBtn.querySelector('.double-arrow').textContent = '⇡⇡';
                        toggleControlsBtn.setAttribute('aria-expanded', 'false');
                    } else {
                        toggleControlsBtn.querySelector('.double-arrow').textContent = '⇣⇣';
                        toggleControlsBtn.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        }

        // Delete confirmation modal initialization
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        const deleteModalCloseBtn = document.querySelector('#delete-confirmation-modal .close-btn');
        
        if (confirmDeleteBtn && cancelDeleteBtn && deleteModalCloseBtn) {
            // Initial setup of event listeners
            confirmDeleteBtn.addEventListener('click', () => {
                const gridNameElement = document.getElementById('grid-to-delete-name');
                if (gridNameElement) {
                    const name = gridNameElement.textContent.trim();
                    this.deleteGrid(name);
                    this.hideDeleteConfirmationModal();
                }
            });
            
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteConfirmationModal();
            });
            
            deleteModalCloseBtn.addEventListener('click', () => {
                this.hideDeleteConfirmationModal();
            });
        }
    }

    /**
     * Set up a tool button
     * @param {string} buttonId - The ID of the button
     * @param {string} tool - The tool name
     */
    setupToolButton(buttonId, tool) {
        const button = document.getElementById(buttonId);
        // console.log(`Tool button '${buttonId}' found:`, !!button);
        if (button) {
            button.addEventListener('click', () => {
                this.setActiveTool(button, tool);
            });
            
            // Set wall as default active tool
            if (tool === 'wall' && buttonId === 'wall-btn') {
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
        
        // Sync the active tool across desktop and mobile
        this.syncActiveTool(tool);
    }

    /**
     * Sync active tool selection between desktop and mobile interfaces
     * @param {string} tool - The tool name
     */
    syncActiveTool(tool) {
        const desktopIds = {
            'start': 'start-node-btn',
            'end': 'end-node-btn',
            'wall': 'wall-btn',
            'weighted': 'weighted-node-btn',
            'erase': 'erase-btn'
        };
        
        const mobileIds = {
            'start': 'start-node-btn-mobile',
            'end': 'end-node-btn-mobile',
            'wall': 'wall-btn-mobile',
            'weighted': 'weighted-node-btn-mobile',
            'erase': 'erase-btn-mobile'
        };
        
        // Get all relevant buttons
        const desktopButton = document.getElementById(desktopIds[tool]);
        const mobileButton = document.getElementById(mobileIds[tool]);
        
        // Remove active class from all tools except the active tool button
        Object.values(desktopIds).forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn !== this.activeToolButton) {
                btn.classList.remove('active');
            }
        });
        
        Object.values(mobileIds).forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn !== this.activeToolButton) {
                btn.classList.remove('active');
            }
        });
        
        // Add active class to corresponding buttons
        if (desktopButton && desktopButton !== this.activeToolButton) {
            desktopButton.classList.add('active');
        }
        
        if (mobileButton && mobileButton !== this.activeToolButton) {
            mobileButton.classList.add('active');
        }
    }

    /**
     * Enable/disable step controls
     * @param {boolean} enabled - Whether the controls should be enabled
     */
    setStepControlsEnabled(enabled) {
        // Desktop step controls
        const nextStepButton = document.getElementById('next-step-btn');
        const prevStepButton = document.getElementById('prev-step-btn');
        
        // Mobile step controls
        const mobileNextStepButton = document.getElementById('next-step-btn-mobile');
        const mobilePrevStepButton = document.getElementById('prev-step-btn-mobile');
        const mobileStepMenuNextButton = document.getElementById('mobile-next-step');
        const mobileStepMenuPrevButton = document.getElementById('mobile-prev-step');
        
        // Desktop controls
        if (nextStepButton) nextStepButton.disabled = !enabled;
        if (prevStepButton) prevStepButton.disabled = !enabled;
        
        // Mobile header controls
        if (mobileNextStepButton) mobileNextStepButton.disabled = !enabled;
        if (mobilePrevStepButton) mobilePrevStepButton.disabled = !enabled;
        
        // Mobile floating menu controls
        if (mobileStepMenuNextButton) mobileStepMenuNextButton.disabled = !enabled;
        if (mobileStepMenuPrevButton) mobileStepMenuPrevButton.disabled = !enabled;
    }

    /**
     * Update the UI based on the current mode
     * @param {string} mode - The current visualization mode
     */
    updateModeUI(mode) {
        const stepControls = document.querySelectorAll('.step-control');
        const startButton = document.getElementById('start-btn');
        const mobileStepRunButton = document.getElementById('mobile-step-run-btn');
        const speedSelect = document.getElementById('visualization-speed');
        const speedMobileSelect = document.getElementById('visualization-speed-mobile');
        
        // Call the global function to toggle step-by-step button visibility if it exists
        if (typeof toggleStepByStepButton === 'function') {
            toggleStepByStepButton(mode === 'step');
        }
        
        if (mode === 'step') {
            // Show step controls on desktop only - mobile uses floating button
            if (window.matchMedia("(min-width: 769px)").matches) {
                stepControls.forEach(control => {
                    control.style.display = 'inline-block';
                });
            }
            
            // Update start button text
            if (startButton) {
                startButton.textContent = 'Prepare Path';
            }
            
            // Update mobile step run button text
            if (mobileStepRunButton) {
                mobileStepRunButton.innerHTML = '<span class="icon"><i class="fas fa-play"></i></span> Prepare Path';
            }
            
            // Disable speed controls in step mode since they have no effect
            if (speedSelect) speedSelect.disabled = true;
            if (speedMobileSelect) speedMobileSelect.disabled = true;
        } else {
            // Hide step controls
            stepControls.forEach(control => {
                control.style.display = 'none';
            });
            
            // Update start button text
            if (startButton) {
                startButton.textContent = 'Find Path';
            }
            
            // Update mobile step run button text (even though it's hidden)
            if (mobileStepRunButton) {
                mobileStepRunButton.innerHTML = '<span class="icon"><i class="fas fa-play"></i></span> Find Path';
            }
            
            // Enable speed controls in auto mode - but only if not currently visualizing
            const isVisualizingActive = 
                (window.dijkstraController && window.dijkstraController.isVisualizing) || 
                (window.astarController && window.astarController.isVisualizing);
                
            if (!isVisualizingActive) {
                if (speedSelect) speedSelect.disabled = false;
                if (speedMobileSelect) speedMobileSelect.disabled = false;
            }
        }
    }
    
    /**
     * Disable grid interactions during visualization
     * @param {boolean} disabled - Whether interactions should be disabled
     */
    setGridInteractionsDisabled(disabled) {
        // Desktop tool buttons
        const toolButtons = document.querySelectorAll('.tool-btn');
        const gridSizeSelect = document.getElementById('grid-size');
        const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
        const speedSelect = document.getElementById('visualization-speed');
        const speedMobileSelect = document.getElementById('visualization-speed-mobile');
        
        // Disable all tool buttons
        toolButtons.forEach(button => {
            button.disabled = disabled;
        });
        
        // Disable grid size controls
        if (gridSizeSelect) gridSizeSelect.disabled = disabled;
        if (gridSizeMobileSelect) gridSizeMobileSelect.disabled = disabled;
        
        // Make sure Clear Grid button remains enabled at all times
        const clearGridBtn = document.getElementById('clear-grid-btn');
        const clearGridMobileBtn = document.getElementById('clear-grid-btn-mobile');
        
        if (clearGridBtn) clearGridBtn.disabled = false;
        if (clearGridMobileBtn) clearGridMobileBtn.disabled = false;
    }

    /**
     * Show the save grid modal
     */
    showSaveGridModal() {
        const modal = document.getElementById('save-grid-modal');
        const input = document.getElementById('grid-name-input');
        
        if (modal) {
            modal.style.display = 'flex';
            // Clear previous input and focus
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }
    
    /**
     * Hide the save grid modal
     */
    hideSaveGridModal() {
        const modal = document.getElementById('save-grid-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Show the load grid modal and populate with saved grids
     */
    showLoadGridModal() {
        const modal = document.getElementById('load-grid-modal');
        const savedGridsList = document.getElementById('saved-grids-list');
        const noSavedGrids = document.getElementById('no-saved-grids');
        
        if (modal && savedGridsList) {
            // Clear previous content except the "no saved grids" message
            const items = savedGridsList.querySelectorAll('.grid-item');
            items.forEach(item => item.remove());
            
            // Get saved grids
            const savedGridNames = this.controllers.game.getSavedGrids();
            
            // Show/hide the "no saved grids" message
            if (noSavedGrids) {
                noSavedGrids.style.display = savedGridNames.length > 0 ? 'none' : 'block';
            }
            
            // Create list items for each saved grid
            savedGridNames.forEach(name => {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                
                const gridName = document.createElement('div');
                gridName.className = 'grid-name';
                gridName.textContent = name;
                
                const gridActions = document.createElement('div');
                gridActions.className = 'grid-actions';
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-grid';
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering the parent's click
                    this.showDeleteConfirmationModal(name);
                });
                
                gridActions.appendChild(deleteButton);
                gridItem.appendChild(gridName);
                gridItem.appendChild(gridActions);
                
                // Add click handler to load the grid
                gridItem.addEventListener('click', () => {
                    this.loadGrid(name);
                });
                
                savedGridsList.appendChild(gridItem);
            });
            
            // Show the modal
            modal.style.display = 'flex';
        }
    }
    
    /**
     * Hide the load grid modal
     */
    hideLoadGridModal() {
        const modal = document.getElementById('load-grid-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Load a grid by name
     * @param {string} name - The name of the grid to load
     */
    loadGrid(name) {
        if (this.controllers.game.loadGrid(name)) {
            // Use toast notification instead of alert
            if (window.Toast) {
                window.Toast.success(`Grid "${name}" loaded successfully`);
            } else {
                alert(`Grid "${name}" loaded successfully`);
            }
            this.hideLoadGridModal();
        } else {
            // Use toast notification for error
            if (window.Toast) {
                window.Toast.error(`Failed to load grid "${name}"`);
            } else {
                alert(`Failed to load grid "${name}"`);
            }
        }
    }
    
    /**
     * Delete a saved grid
     * @param {string} name - The name of the grid to delete
     */
    deleteGrid(name) {
        try {
            // Get saved grids
            const savedGrids = JSON.parse(localStorage.getItem('savedGrids') || '{}');
            
            // Delete the specified grid
            if (savedGrids[name]) {
                delete savedGrids[name];
                
                // Save back to local storage
                localStorage.setItem('savedGrids', JSON.stringify(savedGrids));
                
                // Refresh the modal
                this.showLoadGridModal();
                
                // Use toast notification instead of alert
                if (window.Toast) {
                    window.Toast.info(`Grid "${name}" deleted successfully`);
                } else {
                    alert(`Grid "${name}" deleted successfully`);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting grid:', error);
            // Use toast notification for error
            if (window.Toast) {
                window.Toast.error('Error deleting grid');
            }
            return false;
        }
    }

    /**
     * Handle clear grid action
     */
    handleClearGrid() {
        // Force stop any ongoing visualizations using window global references
        if (window.dijkstraController) {
            window.dijkstraController.reset();
            window.dijkstraController.resetUI();
            
            // Reset step controls if in step-by-step mode
            const nextStepBtn = document.getElementById('next-step-btn');
            const prevStepBtn = document.getElementById('prev-step-btn');
            const nextStepMobileBtn = document.getElementById('next-step-btn-mobile');
            const prevStepMobileBtn = document.getElementById('prev-step-btn-mobile');
            
            if (nextStepBtn) nextStepBtn.disabled = true;
            if (prevStepBtn) prevStepBtn.disabled = true;
            if (nextStepMobileBtn) nextStepMobileBtn.disabled = true;
            if (prevStepMobileBtn) prevStepMobileBtn.disabled = true;
        }
        
        if (window.astarController) {
            window.astarController.reset();
            window.astarController.resetUI();
        }
        
        // Then clear the grid using the game controller
        this.controllers.game.clearGrid();
        
        // Show toast notification for grid clear
        if (window.Toast) {
            window.Toast.info('Grid cleared');
        }
        
        // Enable user interactions after clearing
        const toolButtons = document.querySelectorAll('.tool-btn');
        const gridSizeSelect = document.getElementById('grid-size');
        const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
        
        toolButtons.forEach(button => {
            button.disabled = false;
        });
        
        if (gridSizeSelect) gridSizeSelect.disabled = false;
        if (gridSizeMobileSelect) gridSizeMobileSelect.disabled = false;
    }

    /**
     * Check if both algorithms have completed visualizations
     * @returns {boolean} - True if both algorithms have completed, false otherwise
     */
    checkIfBothAlgorithmsCompleted() {
        // Check if the controllers exist
        if (!this.controllers.dijkstra || !this.controllers.astar) {
            return false;
        }
        
        // Check if both algorithms have reached their maximum step
        const dijkstraFinished = this.controllers.dijkstra.currentStep >= this.controllers.dijkstra.maxStep && 
                                 this.controllers.dijkstra.maxStep >= 0;
        const astarFinished = this.controllers.astar.currentStep >= this.controllers.astar.maxStep && 
                              this.controllers.astar.maxStep >= 0;
        
        // Return true only if both have finished
        return dijkstraFinished && astarFinished;
    }

    /**
     * Show the delete confirmation modal
     * @param {string} name - The name of the grid to delete
     */
    showDeleteConfirmationModal(name) {
        const modal = document.getElementById('delete-confirmation-modal');
        const gridNameElement = document.getElementById('grid-to-delete-name');
        
        if (modal && gridNameElement) {
            // Store the grid name to delete
            gridNameElement.textContent = name;
            modal.style.display = 'block';
            
            // Add event listeners for the confirm and cancel buttons
            const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
            const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
            const closeBtn = modal.querySelector('.close-btn');
            
            // Remove any existing event listeners to prevent duplicates
            if (confirmDeleteBtn._listener) {
                confirmDeleteBtn.removeEventListener('click', confirmDeleteBtn._listener);
            }
            if (cancelDeleteBtn._listener) {
                cancelDeleteBtn.removeEventListener('click', cancelDeleteBtn._listener);
            }
            if (closeBtn._listener) {
                closeBtn.removeEventListener('click', closeBtn._listener);
            }
            
            // Create listeners
            confirmDeleteBtn._listener = () => {
                this.deleteGrid(name);
                this.hideDeleteConfirmationModal();
            };
            
            cancelDeleteBtn._listener = closeBtn._listener = () => {
                this.hideDeleteConfirmationModal();
            };
            
            // Add the event listeners
            confirmDeleteBtn.addEventListener('click', confirmDeleteBtn._listener);
            cancelDeleteBtn.addEventListener('click', cancelDeleteBtn._listener);
            closeBtn.addEventListener('click', closeBtn._listener);
        }
    }

    /**
     * Hide the delete confirmation modal
     */
    hideDeleteConfirmationModal() {
        const modal = document.getElementById('delete-confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Handle the delete confirmation
     */
    handleDeleteConfirmation() {
        const modal = document.getElementById('delete-confirmation-modal');
        const gridName = document.getElementById('grid-name');
        
        if (modal && gridName) {
            const name = gridName.textContent.trim();
            
            if (this.deleteGrid(name)) {
                this.hideDeleteConfirmationModal();
            }
        }
    }
}

/**
 * Map the random feature actions to button IDs
 */
const randomButtonMap = {
    'random-maze': 'random-maze-btn',
    'random-weights': 'random-weights-btn', 
    'random-start-end': 'random-start-end-btn'
}; 