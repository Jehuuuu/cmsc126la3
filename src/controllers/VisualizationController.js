/**
 * Controller for visualization of pathfinding algorithms
 */
class VisualizationController {
    /**
     * Create a new VisualizationController
     * @param {Grid} grid - The grid model
     * @param {GridView} gridView - The grid view
     * @param {UIView} uiView - The UI view
     * @param {Algorithm} algorithm - The pathfinding algorithm
     * @param {Object} elementIds - IDs of UI elements specific to this algorithm
     */
    constructor(grid, gridView, uiView, algorithm, elementIds = {}) {
        this.grid = grid;
        this.gridView = gridView;
        this.uiView = uiView;
        this.algorithm = algorithm || new DijkstraAlgorithm(grid);
        this.elementIds = {
            visitedCountId: elementIds.visitedCountId || 'visited-count',
            pathLengthId: elementIds.pathLengthId || 'path-length'
        };
        
        // Visualization state
        this.isVisualizing = false;
        this.mode = 'auto'; // 'auto' or 'step'
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.pathFound = false;
        
        // Speed configuration
        this.speed = {
            slow: 50,
            medium: 20,
            fast: 5
        };
        this.currentSpeed = 'medium';
    }

    //=============================================================================
    // INITIALIZATION
    //=============================================================================

    /**
     * Initialize UI with current mode
     * Called after all controller references are set up
     */
    initUI() {
        if (this.uiView) {
            this.uiView.updateModeUI(this.mode);
        }
    }

    //=============================================================================
    // VISUALIZATION CONTROL
    //=============================================================================

    /**
     * Start the pathfinding visualization
     */
    async startVisualization() {
        if (this.isVisualizing) return;
        
        // Check if start and end nodes are set
        if (!this.grid.startNode || !this.grid.endNode) {
            alert('Please set both start and end nodes before visualizing.');
            return;
        }
        
        // Reset previous visualization
        this.grid.resetPath();
        this.gridView.update();
        
        // Set visualizing state
        this.isVisualizing = true;
        this.uiView.setGridInteractionsDisabled(true);
        
        // Run algorithm to find path
        const result = this.algorithm.run(true);
        this.visitedNodesInOrder = result.visited;
        this.pathNodesInOrder = result.path;
        this.pathFound = result.pathFound;
        
        // Update stats
        this.updateStats(this.visitedNodesInOrder.length, this.pathNodesInOrder.length);
        
        if (this.mode === 'auto') {
            await this._handleAutoVisualization();
        } else {
            this._handleStepVisualization();
        }
    }

    /**
     * Handle auto-mode visualization
     * @private
     */
    async _handleAutoVisualization() {
        // Auto mode: animate the visualization
        await this.gridView.visualize(
            this.visitedNodesInOrder, 
            this.pathNodesInOrder, 
            this.speed[this.currentSpeed]
        );
        
        // After animation is complete, show the "no path found" toast if needed
        // and if this is the Dijkstra algorithm (to avoid duplicate toasts)
        if (!this.pathFound && window.Toast && this.algorithm instanceof DijkstraAlgorithm) {
            window.Toast.error('No possible path found to destination');
        }
        
        // Mark this algorithm as done, but don't re-enable UI yet
        this.isVisualizing = false;
        
        // Check if both algorithms have finished
        if (window.dijkstraController && window.astarController) {
            const bothFinished = this.checkIfBothAlgorithmsFinished();
            
            // If both algorithms haven't finished, check if we need to re-enable UI
            if (!bothFinished) {
                const otherController = this === window.dijkstraController 
                    ? window.astarController 
                    : window.dijkstraController;
                
                if (!otherController.isVisualizing) {
                    // Both are not visualizing, so re-enable UI
                    this.enableAllUIElements();
                }
            }
        }
    }

    /**
     * Handle step-mode visualization
     * @private
     */
    _handleStepVisualization() {
        // Step mode: prepare for stepping
        this.currentStep = -1;
        this.maxStep = this.visitedNodesInOrder.length - 1;
        
        // Enable step controls but disable the Previous Step button initially
        this.uiView.setStepControlsEnabled(true);
        this.disablePrevStepButton(true);
        
        // Handle special case where there's only one step (end is immediately found)
        if (this.maxStep <= 0) {
            // Take the single step
            this.nextStep();
            
            // Check if both algorithms have completed
            if (window.dijkstraController && window.astarController) {
                const dijkstraFinished = window.dijkstraController.currentStep >= window.dijkstraController.maxStep;
                const astarFinished = window.astarController.currentStep >= window.astarController.maxStep;
                
                if (dijkstraFinished && astarFinished) {
                    this.disableNextStepButton();
                }
            }
            
            // If there are no steps to take, set isVisualizing to false
            if (this.visitedNodesInOrder.length <= 1) {
                this.isVisualizing = false;
            }
        } else {
            // Show first step for normal cases
            this.nextStep();
            
            // Keep drawing tools and randomizers disabled but allow step navigation
            this.uiView.setGridInteractionsDisabled(true);
        }
    }

    /**
     * Set the visualization mode
     * @param {string} mode - The mode to set ('auto' or 'step')
     */
    setMode(mode) {
        if (this.isVisualizing) return;
        
        const previousMode = this.mode;
        this.mode = mode;
        
        // Reset visualizations and ensure clean state
        this.resetPathVisualization();
        
        // Reset both controllers for consistency
        if (window.dijkstraController && window.astarController) {
            if (this !== window.dijkstraController) {
                window.dijkstraController.resetPathVisualization();
            }
            if (this !== window.astarController) {
                window.astarController.resetPathVisualization();
            }
            
            this.enableNextStepButton();
        }
        
        // Show toast notification when switching to auto mode from step mode
        if (previousMode === 'step' && mode === 'auto' && window.Toast) {
            window.Toast.info('Switched to auto mode');
        }
        
        this.uiView.updateModeUI(mode);
        
        // Reset step controls if entering step mode
        if (mode === 'step') {
            this.uiView.setStepControlsEnabled(false);
        }
        
        // Ensure mode selectors are enabled
        this.enableModeSelectors();
    }

    /**
     * Set the visualization speed
     * @param {string} speed - The speed to set ('slow', 'medium', or 'fast')
     */
    setSpeed(speed) {
        if (this.speed[speed] !== undefined) {
            this.currentSpeed = speed;
        }
    }

    /**
     * Stop the current visualization
     */
    stopVisualization() {
        if (!this.isVisualizing) return;
        
        this.algorithm.stop();
        this.isVisualizing = false;
        
        // Check if both algorithms have finished before re-enabling UI
        if (window.dijkstraController && window.astarController) {
            // If the other algorithm is still visualizing, don't re-enable all UI elements yet
            const otherController = this === window.dijkstraController 
                ? window.astarController 
                : window.dijkstraController;
                
            if (!otherController.isVisualizing) {
                this.enableAllUIElements();
            }
            
            this.checkIfBothAlgorithmsFinished();
        } else {
            this.enableAllUIElements();
        }
    }

    //=============================================================================
    // STEP-BY-STEP NAVIGATION
    //=============================================================================

    /**
     * Move to the next step in step-by-step mode
     */
    nextStep() {
        // Early exit if not in step mode
        if (this.mode !== 'step') return;
        
        // If already at max step, don't continue
        if (this.currentStep >= this.maxStep) {
            // Check if both algorithms are at their end
            if (window.dijkstraController && window.astarController) {
                const dijkstraFinished = window.dijkstraController.currentStep >= window.dijkstraController.maxStep;
                const astarFinished = window.astarController.currentStep >= window.astarController.maxStep;
                
                if (dijkstraFinished && astarFinished) {
                    this.disableNextStepButton();
                }
            }
            return;
        }
        
        this.currentStep++;
        this.algorithm.updateProgress(this.currentStep);
        
        // Update visited nodes count in real-time
        const visitedCountElement = document.getElementById(this.elementIds.visitedCountId);
        if (visitedCountElement) {
            const visitedCount = Math.min(this.currentStep + 1, this.visitedNodesInOrder.length);
            visitedCountElement.textContent = visitedCount;
        }
        
        // If we've reached the end node, show the path
        if (this.currentStep === this.maxStep) {
            this.showPath();
            this.checkIfBothAlgorithmsFinished();
        }
        
        // After the first step, enable the Previous Step button
        if (this.currentStep > 0) {
            this.disablePrevStepButton(false);
        }
        
        this.gridView.update();
    }

    /**
     * Move to the previous step in step-by-step mode
     */
    prevStep() {
        if (this.mode !== 'step' || this.currentStep <= 0) return;
        
        // Update the path length to 0 when stepping back
        const pathLengthElement = document.getElementById(this.elementIds.pathLengthId);
        if (pathLengthElement) {
            pathLengthElement.textContent = '0';
        }
        
        this.currentStep--;
        this.algorithm.updateProgress(this.currentStep);
        
        // Update visited nodes count in real-time
        const visitedCountElement = document.getElementById(this.elementIds.visitedCountId);
        if (visitedCountElement) {
            const visitedCount = Math.min(this.currentStep + 1, this.visitedNodesInOrder.length);
            visitedCountElement.textContent = visitedCount;
        }
        
        // If we had the path shown, hide it now
        for (const node of this.pathNodesInOrder) {
            node.isPath = false;
        }
        
        // If we're back at the first step, disable the Previous Step button
        if (this.currentStep === 0) {
            this.disablePrevStepButton(true);
        }
        
        // Re-enable Next Step button if we're stepping back
        if (window.dijkstraController && window.astarController) {
            this.enableNextStepButton();
        }
        
        this.gridView.update();
    }

    /**
     * Show the final path in step-by-step mode
     */
    showPath() {
        // Mark path nodes
        for (const node of this.pathNodesInOrder) {
            if (!node.isStart && !node.isEnd) {
                node.isPath = true;
            }
        }
        
        // Update path length
        const pathLengthElement = document.getElementById(this.elementIds.pathLengthId);
        if (pathLengthElement) {
            // Count non-start, non-end nodes in the path
            const pathLength = this.pathNodesInOrder.filter(node => !node.isStart && !node.isEnd).length;
            pathLengthElement.textContent = pathLength;
        }
        
        // Check if both algorithms have completed their paths and re-enable UI if needed
        if (window.dijkstraController && window.astarController) {
            const dijkstraFinished = window.dijkstraController.currentStep >= window.dijkstraController.maxStep;
            const astarFinished = window.astarController.currentStep >= window.astarController.maxStep;
            
            if (dijkstraFinished && astarFinished) {
                this.enableAllUIElements();
            }
        }
    }

    //=============================================================================
    // RESET AND STATE MANAGEMENT
    //=============================================================================

    /**
     * Reset only the path visualization, preserving walls and weights
     */
    resetPathVisualization() {
        // Stop any ongoing animations
        if (this.gridView) {
            this.gridView.stopAnimation();
        }
        
        // Reset visualization state flag
        this.isVisualizing = false;
        
        // Check if both algorithms have finished before re-enabling UI
        if (window.dijkstraController && window.astarController) {
            // Only re-enable UI if both algorithms are done or being reset
            if (!window.dijkstraController.isVisualizing && !window.astarController.isVisualizing) {
                this.uiView.setGridInteractionsDisabled(false);
            }
        } else {
            this.uiView.setGridInteractionsDisabled(false);
        }
        
        // Reset path in grid (but not walls or weights)
        if (this.grid) {
            this.grid.resetPath();
            
            // Clear only visited, path, and current flags
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    const node = this.grid.getNode(row, col);
                    if (node) {
                        node.isVisited = false;
                        node.isPath = false;
                        node.isCurrent = false;
                        
                        // Clear DOM element classes for both algorithm grids
                        this._clearNodeVisualClasses(row, col);
                    }
                }
            }
        }
        
        // Reset algorithm tracking
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        
        // Reset stats display
        this.updateStats(0, 0);
        
        // Update the grid view
        if (this.gridView) {
            this.gridView.update();
        }
    }
    
    /**
     * Reset the controller state and grid
     */
    reset() {
        // Stop any ongoing visualization
        this.isVisualizing = false;
        
        // Reset algorithm state if needed
        if (this.algorithm && typeof this.algorithm.reset === 'function') {
            this.algorithm.reset();
        }
        
        // Stop any ongoing animations first
        if (this.gridView) {
            this.gridView.stopAnimation();
        }
        
        // Reset grid
        if (this.grid) {
            this.grid.resetPath();
            
            // Ensure all visited/path flags are cleared
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    const node = this.grid.getNode(row, col);
                    if (node) {
                        node.isVisited = false;
                        node.isPath = false;
                        node.isCurrent = false;
                    }
                }
            }
        }
        
        // Reset internal state
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        
        // Update the grid view
        if (this.gridView) {
            this.gridView.update();
        }
    }
    
    /**
     * Reset the UI elements
     */
    resetUI() {
        if (!this.uiView) return;
        
        // Enable all UI elements including drawing tools and randomizers
        this.enableAllUIElements();
        
        // Reset step controls if in step mode
        if (this.mode === 'step') {
            this.uiView.setStepControlsEnabled(false);
        }
        
        // Reset statistics
        this.updateStats(0, 0);
    }
    
    /**
     * Force a complete reset of the algorithm, visualization state, and UI
     * Used for Clear Grid to ensure everything is properly reset even during running algorithms
     */
    forceReset() {
        // First stop any ongoing visualization
        if (this.algorithm) {
            this.algorithm.stop();
        }
        
        // Reset the controller
        this.reset();
        
        // Clear visual classes from DOM
        if (this.grid) {
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    this._clearNodeVisualClasses(row, col);
                }
            }
        }
        
        // Reset the UI
        this.resetUI();
    }

    //=============================================================================
    // UI MANAGEMENT
    //=============================================================================

    /**
     * Update statistics display
     * @param {number} visitedCount - Number of nodes visited
     * @param {number} pathLength - Length of the found path
     */
    updateStats(visitedCount, pathLength) {
        const visitedCountElement = document.getElementById(this.elementIds.visitedCountId);
        const pathLengthElement = document.getElementById(this.elementIds.pathLengthId);
        
        if (visitedCountElement) {
            visitedCountElement.textContent = visitedCount;
        }
        
        if (pathLengthElement) {
            pathLengthElement.textContent = pathLength;
        }
    }

    /**
     * Check if both algorithms have finished and disable Next Step button if so
     * @returns {boolean} Whether both algorithms have finished
     */
    checkIfBothAlgorithmsFinished() {
        // Get references to both algorithm controllers
        const dijkstraController = window.dijkstraController;
        const astarController = window.astarController;
        
        // If we have both controllers and both have reached their maximum step
        if (dijkstraController && astarController) {
            const dijkstraFinished = dijkstraController.currentStep >= dijkstraController.maxStep && 
                                     dijkstraController.maxStep >= 0;
            const astarFinished = astarController.currentStep >= astarController.maxStep && 
                                  astarController.maxStep >= 0;
            
            // If both algorithms have finished, update UI state
            if (dijkstraFinished && astarFinished) {
                // Disable the Next Step button
                this.disableNextStepButton();
                
                // Show success toast
                if (window.Toast && dijkstraController.algorithm instanceof DijkstraAlgorithm) {
                    if (dijkstraController.pathFound && astarController.pathFound) {
                        window.Toast.success('Both algorithms have found their paths!');
                    }
                }
                
                // Mark both algorithms as not visualizing
                dijkstraController.isVisualizing = false;
                astarController.isVisualizing = false;
                
                // Re-enable all UI elements
                if (this.uiView) {
                    this.enableAllUIElements();
                }
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Disable the previous step button
     * @param {boolean} disable - Whether to disable the button
     */
    disablePrevStepButton(disable) {
        const buttons = [
            document.getElementById('prev-step-btn'),               // Desktop controls
            document.getElementById('prev-step-btn-mobile'),        // Mobile controls
            document.getElementById('mobile-prev-step')             // Mobile menu controls
        ];
        
        buttons.forEach(button => {
            if (button) button.disabled = disable;
        });
    }

    /**
     * Disable the next step button
     */
    disableNextStepButton() {
        const buttons = [
            document.getElementById('next-step-btn'),               // Desktop controls
            document.getElementById('next-step-btn-mobile'),        // Mobile controls
            document.getElementById('mobile-next-step')             // Mobile menu controls
        ];
        
        buttons.forEach(button => {
            if (button) button.disabled = true;
        });
    }

    /**
     * Enable the next step button
     */
    enableNextStepButton() {
        const buttons = [
            document.getElementById('next-step-btn'),               // Desktop controls
            document.getElementById('next-step-btn-mobile'),        // Mobile controls
            document.getElementById('mobile-next-step')             // Mobile menu controls
        ];
        
        buttons.forEach(button => {
            if (button) button.disabled = false;
        });
    }

    /**
     * Helper method to explicitly re-enable mode selectors
     * This is needed because some browsers may not properly re-enable elements
     * when just using setGridInteractionsDisabled(false)
     */
    enableModeSelectors() {
        const modeSelect = document.getElementById('visualization-mode');
        const modeMobileSelect = document.getElementById('visualization-mode-mobile');
        if (modeSelect) modeSelect.disabled = false;
        if (modeMobileSelect) modeMobileSelect.disabled = false;
    }

    /**
     * Helper method to explicitly re-enable all UI elements
     * This includes mode selectors, drawing tools, and randomizer buttons
     */
    enableAllUIElements() {
        if (!this.uiView) return;
        
        // Re-enable general UI interactions
        this.uiView.setGridInteractionsDisabled(false);
        
        // Explicitly re-enable the mode dropdowns
        this.enableModeSelectors();
        
        // Explicitly re-enable tool buttons (drawing tools)
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            button.disabled = false;
        });
        
        // Re-enable randomizer buttons (both desktop and mobile)
        const randomizers = [
            // Desktop randomizers
            document.getElementById('random-maze-btn'),
            document.getElementById('random-weights-btn'),
            document.getElementById('random-start-end-btn'),
            // Mobile randomizers
            document.getElementById('random-maze-btn-mobile'),
            document.getElementById('random-weights-btn-mobile'),
            document.getElementById('random-start-end-btn-mobile')
        ];
        
        randomizers.forEach(button => {
            if (button) button.disabled = false;
        });
    }
    
    //=============================================================================
    // HELPER METHODS
    //=============================================================================
    
    /**
     * Clear visualization classes from node DOM elements
     * @param {number} row - Row of the node
     * @param {number} col - Column of the node
     * @private
     */
    _clearNodeVisualClasses(row, col) {
        const dijkstraNodeElement = document.getElementById(`dijkstra-grid-node-${row}-${col}`);
        const astarNodeElement = document.getElementById(`astar-grid-node-${row}-${col}`);
        
        [dijkstraNodeElement, astarNodeElement].forEach(element => {
            if (element) {
                // Remove visualization classes but keep structural classes
                element.classList.remove('visited', 'path', 'current', 'animate');
                // Remove any transition delay that might be set
                element.style.transitionDelay = '0ms';
                element.style.animationDelay = '0ms';
            }
        });
    }
} 