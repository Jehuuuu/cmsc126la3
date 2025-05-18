/**
 * UIView class for handling UI controls and interactions
 */

//=============================================================================
// UI VIEW
//=============================================================================

class UIView {
    //=============================================================================
    // INITIALIZATION
    //=============================================================================
    
    /**
     * Create a new UIView
     * @param {Object} controllers - The controller objects
     */
    constructor(controllers) {
        this.controllers = controllers;
        this.setupEventListeners();
        this.activeToolButton = null;
    }

    //=============================================================================
    // EVENT LISTENERS
    //=============================================================================
    
    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Grid size control - pair desktop and mobile
        this.setupPairedControls('grid-size', 'grid-size-mobile', (value) => {
            if (value === 'custom') {
                // Show custom grid size modal
                this.showCustomGridSizeModal();
                return;
            }
            
            const size = parseInt(value);
            this.controllers.game.resizeGrid(size, size);
            
            // Show toast notification for grid resize
            this.showToast(`Grid size changed to ${size}x${size}`, 'info');
        });
        
        // Visualization speed control - pair desktop and mobile
        this.setupPairedControls('visualization-speed', 'visualization-speed-mobile', (speed) => {
            this.controllers.dijkstra.setSpeed(speed);
            this.controllers.astar.setSpeed(speed);
        });
        
        // Visualization mode control - pair desktop and mobile
        this.setupPairedControls('visualization-mode', 'visualization-mode-mobile', (selectedMode) => {
            const previousMode = this.controllers.dijkstra.mode;
            
            // First, check if both algorithms have completed visualizations
            const bothAlgorithmsCompleted = this.checkIfBothAlgorithmsCompleted();
            
            // Apply mode changes to both controllers
            this.controllers.dijkstra.setMode(selectedMode);
            this.controllers.astar.setMode(selectedMode);
            
            // Ensure visualizations are properly reset for both algorithms regardless
            // of which mode we're switching to
            if (previousMode !== selectedMode) {
                // Reset visualizations in both controllers
                this.controllers.dijkstra.resetPathVisualization();
                this.controllers.astar.resetPathVisualization();

                // Enable all controls
                this.setGridInteractionsDisabled(false);
                
                // Explicitly ensure mode selectors are enabled
                this.controllers.dijkstra.enableModeSelectors();
            }
            
            // Show toast notification for mode change
            if (selectedMode === 'step') {
                this.showToast('Step-by-step mode activated', 'info');
            }
            
            // Update the step-by-step button visibility
            if (typeof toggleStepByStepButton === 'function') {
                toggleStepByStepButton(selectedMode === 'step');
            }
        });
        
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
        if (randomMazeButton) {
            randomMazeButton.addEventListener('click', () => {
                const mazeTypeSelect = document.getElementById('maze-type-select');
                if (mazeTypeSelect && mazeTypeSelect.value) {
                    // Generate maze of the selected type
                    this.controllers.game.generateMaze(mazeTypeSelect.value);
                    
                    // Show toast notification
                    if (window.Toast) {
                        let mazeType = "maze";
                        switch (mazeTypeSelect.value) {
                            case 'recursive-division':
                                mazeType = "recursive division maze";
                                break;
                            case 'recursive-division-vertical':
                                mazeType = "vertical recursive division maze";
                                break;
                            case 'recursive-division-horizontal':
                                mazeType = "horizontal recursive division maze";
                                break;
                            case 'random':
                                mazeType = "random maze";
                                break;
                        }
                        window.Toast.show(`Generated ${mazeType}!`, 'success');
                    }
                } else {
                    if (window.Toast) {
                        window.Toast.show("Please select a maze type first!", 'warning');
                    }
                }
            });
        }
        
        // Random maze button - mobile
        const randomMazeMobileButton = document.querySelector('.random-menu-item.maze');
        if (randomMazeMobileButton) {
            randomMazeMobileButton.addEventListener('click', () => {
                const mazeTypeSelect = document.getElementById('maze-type-select-mobile');
                if (mazeTypeSelect && mazeTypeSelect.value) {
                    // Generate maze of the selected type
                    this.controllers.game.generateMaze(mazeTypeSelect.value);
                    
                    // Show toast notification
                    if (window.Toast) {
                        let mazeType = "maze";
                        switch (mazeTypeSelect.value) {
                            case 'recursive-division':
                                mazeType = "recursive division maze";
                                break;
                            case 'recursive-division-vertical':
                                mazeType = "vertical recursive division maze";
                                break;
                            case 'recursive-division-horizontal':
                                mazeType = "horizontal recursive division maze";
                                break;
                            case 'random':
                                mazeType = "random maze";
                                break;
                        }
                        window.Toast.show(`Generated ${mazeType}!`, 'success');
                    }
                    
                    // Close the menu
                    const randomMenu = document.getElementById('random-menu');
                    if (randomMenu) {
                        randomMenu.classList.remove('open');
                    }
                } else {
                    if (window.Toast) {
                        window.Toast.show("Please select a maze type first!", 'warning');
                    }
                }
            });
        }
        
        // Sync maze type selection between desktop and mobile
        const mazeTypeSelect = document.getElementById('maze-type-select');
        const mazeTypeSelectMobile = document.getElementById('maze-type-select-mobile');
        
        if (mazeTypeSelect && mazeTypeSelectMobile) {
            mazeTypeSelect.addEventListener('change', () => {
                mazeTypeSelectMobile.value = mazeTypeSelect.value;
            });
            
            mazeTypeSelectMobile.addEventListener('change', () => {
                mazeTypeSelect.value = mazeTypeSelectMobile.value;
            });
        }
        
        // Random weights button - desktop
        const randomWeightsButton = document.getElementById('random-weights-btn');
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
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => {
                this.controllers.dijkstra.nextStep();
                this.controllers.astar.nextStep();
            });
        }
        
        const prevStepButton = document.getElementById('prev-step-btn');
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
    }

    /**
     * Set up a tool button
     * @param {string} buttonId - The ID of the button
     * @param {string} tool - The tool name
     */
    setupToolButton(buttonId, tool) {
        const button = document.getElementById(buttonId);
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

    //=============================================================================
    // TOOL MANAGEMENT
    //=============================================================================

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

    //=============================================================================
    // STEP CONTROLS
    //=============================================================================

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
    
    //=============================================================================
    // GRID INTERACTION CONTROLS
    //=============================================================================
    
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
        const modeSelect = document.getElementById('visualization-mode');
        const modeMobileSelect = document.getElementById('visualization-mode-mobile');
        
        // Randomizer buttons - desktop
        const randomMazeBtn = document.getElementById('random-maze-btn');
        const randomWeightsBtn = document.getElementById('random-weights-btn');
        const randomStartEndBtn = document.getElementById('random-start-end-btn');
        
        // Randomizer buttons - mobile
        const randomMazeBtnMobile = document.querySelector('.random-menu-item.maze');
        const randomWeightsBtnMobile = document.querySelector('.random-menu-item.weights');
        const randomStartEndBtnMobile = document.querySelector('.random-menu-item.positions');
        
        // Maze type selectors
        const mazeTypeSelect = document.getElementById('maze-type-select');
        const mazeTypeSelectMobile = document.getElementById('maze-type-select-mobile');
        
        // Disable all tool buttons
        toolButtons.forEach(button => {
            button.disabled = disabled;
        });
        
        // Disable grid size controls
        if (gridSizeSelect) gridSizeSelect.disabled = disabled;
        if (gridSizeMobileSelect) gridSizeMobileSelect.disabled = disabled;
        
        // Disable mode selectors during algorithm execution
        if (modeSelect) modeSelect.disabled = disabled;
        if (modeMobileSelect) modeMobileSelect.disabled = disabled;
        
        // Disable randomizer buttons
        if (randomMazeBtn) randomMazeBtn.disabled = disabled;
        if (randomWeightsBtn) randomWeightsBtn.disabled = disabled;
        if (randomStartEndBtn) randomStartEndBtn.disabled = disabled;
        
        // Disable mobile randomizer buttons
        if (randomMazeBtnMobile) randomMazeBtnMobile.disabled = disabled;
        if (randomWeightsBtnMobile) randomWeightsBtnMobile.disabled = disabled;
        if (randomStartEndBtnMobile) randomStartEndBtnMobile.disabled = disabled;
        
        // Disable maze type selectors
        if (mazeTypeSelect) mazeTypeSelect.disabled = disabled;
        if (mazeTypeSelectMobile) mazeTypeSelectMobile.disabled = disabled;
        
        // Make sure Clear Grid button remains enabled at all times
        const clearGridBtn = document.getElementById('clear-grid-btn');
        const clearGridMobileBtn = document.getElementById('clear-grid-btn-mobile');
        
        if (clearGridBtn) clearGridBtn.disabled = false;
        if (clearGridMobileBtn) clearGridMobileBtn.disabled = false;
    }

    //=============================================================================
    // MODAL MANAGEMENT
    //=============================================================================
    
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
                
                // Add click handler to the grid name element only
                gridName.addEventListener('click', () => {
                    this.loadGrid(name);
                });
                
                const gridActions = document.createElement('div');
                gridActions.className = 'grid-actions';
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-grid';
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering the parent's click (not needed anymore but keeping for safety)
                    this.showDeleteConfirmModal(name);
                });
                
                gridActions.appendChild(deleteButton);
                gridItem.appendChild(gridName);
                gridItem.appendChild(gridActions);
                
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
    
    //=============================================================================
    // GRID MANAGEMENT
    //=============================================================================
    
    /**
     * Load a grid by name
     * @param {string} name - The name of the grid to load
     */
    loadGrid(name) {
        if (this.controllers.game.loadGrid(name)) {
            this.showToast(`Grid "${name}" loaded successfully`, 'success');
            this.hideLoadGridModal();
        } else {
            this.showToast(`Failed to load grid "${name}"`, 'error');
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
                
                this.showToast(`Grid "${name}" deleted successfully`, 'info');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting grid:', error);
            this.showToast('Error deleting grid', 'error');
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
        
        this.showToast('Grid cleared', 'info');
        
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

    //=============================================================================
    // HELPER METHODS
    //=============================================================================
    
    /**
     * Show a toast notification or fallback to alert
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (info, success, error, warning)
     */
    showToast(message, type = 'info') {
        if (window.Toast) {
            switch (type) {
                case 'success':
                    window.Toast.success(message);
                    break;
                case 'error':
                    window.Toast.error(message);
                    break;
                case 'warning':
                    window.Toast.warning(message);
                    break;
                case 'info':
                default:
                    window.Toast.info(message);
                    break;
            }
        } else {
            alert(message);
        }
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
     * Show the custom grid size modal
     */
    showCustomGridSizeModal() {
        const modal = document.getElementById('custom-grid-modal');
        const input = document.getElementById('custom-grid-size');
        const inputCopy = document.getElementById('custom-grid-size-copy');
        const warning = document.getElementById('grid-size-warning');
        const confirmBtn = document.getElementById('confirm-grid-size-btn');
        const cancelBtn = document.getElementById('cancel-grid-size-btn');
        const closeBtn = modal.querySelector('.close-btn');
        
        if (!modal || !input || !confirmBtn || !cancelBtn) {
            console.error('Custom grid modal elements not found');
            return;
        }
        
        // Reset the input to default value
        input.value = "30";
        if (inputCopy) inputCopy.value = "30";
        
        // Show the modal
        modal.style.display = 'block';
        input.focus();
        
        // Sync the second input field with the first one
        const syncInputs = () => {
            const size = parseInt(input.value);
            if (inputCopy) inputCopy.value = size;
            
            // Show warning for large sizes
            if (size > 30) {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        };
        
        // Add input event listener
        input.addEventListener('input', syncInputs);
        
        // Function to confirm size
        const confirmSize = () => {
            const size = parseInt(input.value);
            
            // Validate size
            if (isNaN(size) || size < 5 || size > 50) {
                this.showToast('Please enter a valid grid size between 5 and 50', 'error');
                return;
            }
            
            // Close modal
            modal.style.display = 'none';
            
            // Apply the new grid size
            this.controllers.game.resizeGrid(size, size);
            
            // Update both dropdowns to show the custom size
            const gridSizeSelect = document.getElementById('grid-size');
            const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
            
            // Create a new option for the current custom size if it doesn't exist
            const addCustomOption = (select) => {
                if (select) {
                    // First check if there's a custom-size option already
                    let customSizeOption = Array.from(select.options).find(opt => opt.value === 'custom-size');
                    
                    if (!customSizeOption) {
                        // Create a new option for this specific size
                        customSizeOption = document.createElement('option');
                        customSizeOption.value = 'custom-size';
                        select.add(customSizeOption);
                    }
                    
                    // Update the option text
                    customSizeOption.textContent = `${size}x${size}`;
                    
                    // Select this option
                    select.value = 'custom-size';
                }
            };
            
            // Add or update custom size option in both dropdowns
            addCustomOption(gridSizeSelect);
            addCustomOption(gridSizeMobileSelect);
            
            this.showToast(`Grid size changed to ${size}x${size}`, 'info');
            
            // Clean up event listeners
            cleanupListeners();
        };
        
        // Function to cancel
        const cancelAction = () => {
            modal.style.display = 'none';
            
            // Reset dropdown selections to previous value
            const gridSizeSelect = document.getElementById('grid-size');
            const gridSizeMobileSelect = document.getElementById('grid-size-mobile');
            
            // Find the first non-custom option and select it
            if (gridSizeSelect) {
                const defaultOption = Array.from(gridSizeSelect.options).find(opt => opt.value !== 'custom');
                if (defaultOption) {
                    gridSizeSelect.value = defaultOption.value;
                }
            }
            
            if (gridSizeMobileSelect) {
                const defaultOption = Array.from(gridSizeMobileSelect.options).find(opt => opt.value !== 'custom');
                if (defaultOption) {
                    gridSizeMobileSelect.value = defaultOption.value;
                }
            }
            
            // Clean up event listeners
            cleanupListeners();
        };
        
        // Function to handle keyboard events
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                confirmSize();
            } else if (e.key === 'Escape') {
                cancelAction();
            }
        };
        
        // Function to clean up event listeners
        const cleanupListeners = () => {
            confirmBtn.removeEventListener('click', confirmSize);
            cancelBtn.removeEventListener('click', cancelAction);
            closeBtn.removeEventListener('click', cancelAction);
            document.removeEventListener('keydown', handleKeydown);
            input.removeEventListener('input', syncInputs);
        };
        
        // Add event listeners
        confirmBtn.addEventListener('click', confirmSize);
        cancelBtn.addEventListener('click', cancelAction);
        closeBtn.addEventListener('click', cancelAction);
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Show the delete confirmation modal
     * @param {string} name - The name of the grid to delete
     */
    showDeleteConfirmModal(name) {
        const modal = document.getElementById('delete-confirm-modal');
        const messageElement = document.getElementById('delete-confirm-message');
        const confirmBtn = document.getElementById('confirm-delete-btn');
        const cancelBtn = document.getElementById('cancel-delete-btn');
        const closeBtn = modal.querySelector('.close-btn');
        
        if (!modal || !confirmBtn || !cancelBtn || !messageElement) {
            console.error('Delete confirmation modal elements not found');
            return;
        }
        
        // Update the message with the grid name
        messageElement.textContent = `Are you sure you want to delete "${name}"?`;
        
        // Show the modal
        modal.style.display = 'block';
        
        // Function to confirm deletion
        const confirmDelete = () => {
            if (this.deleteGrid(name)) {
                // Hide the modal
                modal.style.display = 'none';
            }
            // Clean up event listeners
            cleanupListeners();
        };
        
        // Function to cancel
        const cancelDelete = () => {
            modal.style.display = 'none';
            // Clean up event listeners
            cleanupListeners();
        };
        
        // Function to handle keyboard events
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                confirmDelete();
            } else if (e.key === 'Escape') {
                cancelDelete();
            }
        };
        
        // Function to clean up event listeners
        const cleanupListeners = () => {
            confirmBtn.removeEventListener('click', confirmDelete);
            cancelBtn.removeEventListener('click', cancelDelete);
            closeBtn.removeEventListener('click', cancelDelete);
            document.removeEventListener('keydown', handleKeydown);
        };
        
        // Add event listeners
        confirmBtn.addEventListener('click', confirmDelete);
        cancelBtn.addEventListener('click', cancelDelete);
        closeBtn.addEventListener('click', cancelDelete);
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Helper method to set up paired desktop and mobile controls
     * @param {string} desktopId - ID of the desktop control element
     * @param {string} mobileId - ID of the mobile control element 
     * @param {Function} changeHandler - Function to execute when control value changes
     */
    setupPairedControls(desktopId, mobileId, changeHandler) {
        const desktopControl = document.getElementById(desktopId);
        const mobileControl = document.getElementById(mobileId);
        
        if (desktopControl) {
            desktopControl.addEventListener('change', (e) => {
                const value = e.target.value;
                changeHandler(value, desktopControl);
                
                // Sync to mobile control
                if (mobileControl) {
                    mobileControl.value = value;
                }
            });
        }
        
        if (mobileControl) {
            mobileControl.addEventListener('change', (e) => {
                const value = e.target.value;
                changeHandler(value, mobileControl);
                
                // Sync to desktop control
                if (desktopControl) {
                    desktopControl.value = value;
                }
            });
        }
    }
} 