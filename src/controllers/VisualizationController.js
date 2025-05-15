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
            pathLengthId: elementIds.pathLengthId || 'path-length',
            altPathId: elementIds.altPathId || 'alt-path'
        };
        this.isVisualizing = false;
        this.mode = 'auto'; // 'auto' or 'step'
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.alternativePaths = [];
        this.selectedPathIndex = 0;
        this.speed = {
            slow: 50,
            medium: 20,
            fast: 5
        };
        this.currentSpeed = 'medium';
        
        // Initialize UI for current mode - but don't call if uiView is not set yet
        // We'll call this method after setting up all references
    }

    /**
     * Initialize UI with current mode
     * Called after all controller references are set up
     */
    initUI() {
        if (this.uiView) {
            this.uiView.updateModeUI(this.mode);
        }
    }

    /**
     * Start the pathfinding visualization
     */
    async startVisualization() {
        // If already visualizing, reset everything first to ensure a clean start
        if (this.isVisualizing) {
            this.stopVisualization();
            this.resetPathVisualization();
            
            // Reset algorithm state
            if (this.algorithm && typeof this.algorithm.reset === 'function') {
                this.algorithm.reset();
            }
        }
        
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
        // console.log("Running algorithm:", this.algorithm.constructor.name);
        const result = this.algorithm.run(true);
        this.visitedNodesInOrder = result.visited;
        this.pathNodesInOrder = result.path;
        
        // Update stats
        this.updateStats(this.visitedNodesInOrder.length, this.pathNodesInOrder.length);
        
        // Store pathFound status for toast notification after animation
        this.pathFound = result.pathFound;
        
        if (this.mode === 'auto') {
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
            
            this.isVisualizing = false;
            this.uiView.setGridInteractionsDisabled(false);
        } else {
            // Step mode: prepare for stepping
            this.currentStep = -1;
            this.maxStep = this.visitedNodesInOrder.length - 1;
            
            // Enable step controls but disable the Previous Step button initially
            // since there's no previous step at the beginning
            this.uiView.setStepControlsEnabled(true);
            this.disablePrevStepButton(true);
            
            // Handle special case where there's only one step (end is immediately found)
            if (this.maxStep <= 0) {
                // If there are no steps to take or only one step, disable next button after taking it
                this.nextStep();
                // Directly check if both algorithms have completed
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
                
                // In step mode, we still want some interactions to be enabled even though 
                // the algorithm is "visualizing" - for example, the user should be able
                // to click "Next Step"
                this.uiView.setGridInteractionsDisabled(true);
            }
        }
    }

    /**
     * Generate alternative path - COMMENTED OUT
     */
    /*
    generateAlternativePath() {
        // Create a runAlgorithm function to pass to the PathUtils
        const runAlgorithm = (grid, visualize) => {
            const algorithmInstance = this.algorithm instanceof DijkstraAlgorithm 
                ? new DijkstraAlgorithm(grid) 
                : new AStarAlgorithm(grid);
            return algorithmInstance.run(visualize);
        };
        
        // Use PathUtils to generate multiple alternative paths
        const paths = PathUtils.generateAlternativePaths(this.grid, runAlgorithm);
        
        // Store the alternative paths
        this.alternativePaths = paths;
        
        // Create the mini-grid visualizations
        this.createAltPathPreview(paths);
        
        console.log(`Generated ${paths.length} alternative paths`);
    }
    */

    /**
     * Create the alternative path preview - COMMENTED OUT
     * @param {Array} paths - Array of path objects
     */
    /*
    createAltPathPreview(paths) {
        if (!paths || paths.length === 0) return;
        
        // Get the container element
        const miniGridContainer = document.getElementById(this.elementIds.altPathId);
        if (!miniGridContainer) {
            console.error(`Alt path container (${this.elementIds.altPathId}) not found`);
            return;
        }
        
        // Get the path preview container (parent of the mini-grid)
        const pathPreviewId = this.elementIds.altPathId.includes('dijkstra') ? 'path-preview-1' : 'path-preview-2';
        const pathPreviewContainer = document.getElementById(pathPreviewId);
        
        if (!pathPreviewContainer) {
            console.error(`Path preview container (${pathPreviewId}) not found`);
            return;
        }
        
        // Find the path-length element
        const pathLengthElement = pathPreviewContainer.querySelector('.path-length');
        
        // Clear the container
        miniGridContainer.innerHTML = '';
        
        // Set mini-grid columns
        const miniGridCols = 30;
        const miniGridRows = 10;
        miniGridContainer.style.gridTemplateColumns = `repeat(${miniGridCols}, 1fr)`;
        
        // Create mini-grid cells
        for (let row = 0; row < miniGridRows; row++) {
            for (let col = 0; col < miniGridCols; col++) {
                const cell = document.createElement('div');
                cell.className = 'preview-node';
                cell.id = `${this.elementIds.altPathId}-${row}-${col}`;
                miniGridContainer.appendChild(cell);
            }
        }
        
        // Get the primary alternative path (first one)
        const path = paths[0].path;
        const pathDistance = paths[0].distance || path.length;
        
        // Update path length display
        if (pathLengthElement) {
            pathLengthElement.textContent = pathDistance;
        }
        
        if (!path || path.length < 2) {
            console.warn("No valid path provided for preview");
            return;
        }
        
        // Scale the path to fit mini-grid
        const rowRatio = miniGridRows / this.grid.rows;
        const colRatio = miniGridCols / this.grid.cols;
        
        // Mark start and end nodes
        const startNode = path[0];
        const endNode = path[path.length - 1];
        
        const startMiniRow = Math.floor(startNode.row * rowRatio);
        const startMiniCol = Math.floor(startNode.col * colRatio);
        const endMiniRow = Math.floor(endNode.row * rowRatio);
        const endMiniCol = Math.floor(endNode.col * colRatio);
        
        const startCell = document.getElementById(`${this.elementIds.altPathId}-${startMiniRow}-${startMiniCol}`);
        const endCell = document.getElementById(`${this.elementIds.altPathId}-${endMiniRow}-${endMiniCol}`);
        
        if (startCell) startCell.classList.add('start');
        if (endCell) endCell.classList.add('end');
        
        // Mark path cells
        for (let i = 1; i < path.length - 1; i++) {
            const node = path[i];
            const miniRow = Math.floor(node.row * rowRatio);
            const miniCol = Math.floor(node.col * colRatio);
            
            const cell = document.getElementById(`${this.elementIds.altPathId}-${miniRow}-${miniCol}`);
            if (cell) cell.classList.add('path');
        }
        
        // Add click handler to path preview
        pathPreviewContainer.addEventListener('click', () => {
            this.selectAlternativePath(0);
            
            // Highlight as selected
            pathPreviewContainer.classList.add('selected');
            
            // After a delay, remove the selection
            setTimeout(() => {
                pathPreviewContainer.classList.remove('selected');
            }, 1000);
        });
        
        console.log(`Created alt path preview for ${this.elementIds.altPathId}`);
    }
    */
    
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
     * Move to the next step in step-by-step mode
     */
    nextStep() {
        // Early exit if not in step mode
        if (this.mode !== 'step') return;
        
        // If already at max step, don't continue
        if (this.currentStep >= this.maxStep) {
            // Make sure the Next Step button is disabled if both algorithms are at their end
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
            // Count the visited nodes up to the current step
            const visitedCount = Math.min(this.currentStep + 1, this.visitedNodesInOrder.length);
            visitedCountElement.textContent = visitedCount;
        }
        
        // If we've reached the end node, show the path
        if (this.currentStep === this.maxStep) {
            this.showPath();
            
            // Check if this is one of the algorithms that has reached its end
            // We'll use the global algorithm controllers to check if both have reached their end
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
            // Count the visited nodes up to the current step
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
        
        // If we're stepping back from end, make sure Next Step button is enabled
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
    }

    /**
     * Set the visualization mode
     * @param {string} mode - The mode to set ('auto' or 'step')
     */
    setMode(mode) {
        if (this.isVisualizing) return;
        
        const previousMode = this.mode;
        this.mode = mode;
        
        // If switching from step mode to auto mode, always reset visualizations
        if (previousMode === 'step' && mode === 'auto') {
            // Check if the algorithm has completed (current step is at max)
            const isAlgorithmCompleted = this.currentStep >= this.maxStep;
            
            // Reset visualization regardless of completion state
            this.resetPathVisualization();
            
            // Reset algorithm state to ensure it can be run again
            if (this.algorithm && typeof this.algorithm.reset === 'function') {
                this.algorithm.reset();
            }
            
            // For complete reset, ensure we force reset both controllers
            if (window.dijkstraController && window.astarController) {
                // Make sure we also reset the other controller that might not be 'this'
                if (this !== window.dijkstraController) {
                    window.dijkstraController.resetPathVisualization();
                    // Reset algorithm state for the other controller too
                    if (window.dijkstraController.algorithm && 
                        typeof window.dijkstraController.algorithm.reset === 'function') {
                        window.dijkstraController.algorithm.reset();
                    }
                }
                if (this !== window.astarController) {
                    window.astarController.resetPathVisualization();
                    // Reset algorithm state for the other controller too
                    if (window.astarController.algorithm && 
                        typeof window.astarController.algorithm.reset === 'function') {
                        window.astarController.algorithm.reset();
                    }
                }
                
                // Make sure Next Step button is re-enabled for future use
                this.enableNextStepButton();
                
                // Reset internal tracking variables for both controllers
                window.dijkstraController.currentStep = -1;
                window.dijkstraController.maxStep = -1;
                window.astarController.currentStep = -1;
                window.astarController.maxStep = -1;
            }
            
            // Show toast notification if it was completed
            if (isAlgorithmCompleted && window.Toast) {
                window.Toast.info('Visualization reset for auto mode');
            }
        }
        
        this.uiView.updateModeUI(mode);
        
        // Reset step controls if entering step mode
        if (mode === 'step') {
            this.uiView.setStepControlsEnabled(false);
        }
    }

    /**
     * Reset only the path visualization, preserving walls and weights
     */
    resetPathVisualization() {
        // Stop any ongoing animations first
        if (this.gridView) {
            this.gridView.stopAnimation();
        }
        
        // Reset visualization state flag
        this.isVisualizing = false;
        
        // Re-enable grid interactions
        if (this.uiView) {
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
                        node.distance = Infinity; // Reset node distance for algorithms
                        node.totalDistance = Infinity; // Reset total distance for A* algorithm
                        node.previousNode = null; // Clear previous node references
                        
                        // Clear DOM element classes for BOTH algorithm grids
                        // This ensures that visual elements are cleared for both algorithms
                        const dijkstraNodeElement = document.getElementById(`dijkstra-grid-node-${row}-${col}`);
                        if (dijkstraNodeElement && !node.isStart && !node.isEnd && !node.isWall) {
                            dijkstraNodeElement.classList.remove('visited', 'path', 'current', 'animate');
                        }
                        
                        const astarNodeElement = document.getElementById(`astar-grid-node-${row}-${col}`);
                        if (astarNodeElement && !node.isStart && !node.isEnd && !node.isWall) {
                            astarNodeElement.classList.remove('visited', 'path', 'current', 'animate');
                        }
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
     * Set the visualization speed
     * @param {string} speed - The speed to set ('slow', 'medium', or 'fast')
     */
    setSpeed(speed) {
        if (this.speed[speed] !== undefined) {
            this.currentSpeed = speed;
        }
    }

    /**
     * Select an alternative path to display - COMMENTED OUT
     * @param {number} index - The index of the path to select
     */
    /*
    selectAlternativePath(index) {
        if (!this.alternativePaths || 
            this.alternativePaths.length === 0 || 
            index < 0 || 
            index >= this.alternativePaths.length || 
            this.isVisualizing) {
            console.warn("Cannot select alternative path - invalid index or current state");
            return;
        }
        
        console.log(`Selecting alternative path ${index}`);
        this.selectedPathIndex = index;
        
        // Reset path visualization
        this.grid.resetPath();
        
        // Set the selected path
        const selectedPath = this.alternativePaths[index].path;
        if (selectedPath && selectedPath.length > 0) {
            for (const node of selectedPath) {
                const gridNode = this.grid.getNode(node.row, node.col);
                if (gridNode && !gridNode.isStart && !gridNode.isEnd) {
                    gridNode.isPath = true;
                }
            }
            
            // Update stats
            this.updateStats(this.visitedNodesInOrder.length, selectedPath.length);
            
            // Show alert to inform user
            const pathName = this.alternativePaths[index].name || `Alternative ${index + 1}`;
            const pathDistance = this.alternativePaths[index].distance || selectedPath.length;
            console.log(`Showing ${pathName} path with distance ${pathDistance}`);
        }
        
        // Update the grid view
        this.gridView.update();
    }
    */

    /**
     * Stop the current visualization
     */
    stopVisualization() {
        if (!this.isVisualizing) return;
        
        this.algorithm.stop();
        this.isVisualizing = false;
        this.uiView.setGridInteractionsDisabled(false);
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
        
        // Enable user interactions
        this.uiView.setGridInteractionsDisabled(false);
        
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
        // Force stop any animation
        if (this.gridView) {
            this.gridView.stopAnimation();
        }
        
        // Reset the algorithm state
        if (this.algorithm) {
            this.algorithm.stop();
            if (typeof this.algorithm.reset === 'function') {
                this.algorithm.reset();
            }
        }
        
        // Reset controller state
        this.isVisualizing = false;
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        
        // Reset UI and grid
        if (this.grid) {
            this.grid.resetPath();
            
            // More thorough reset - clear all animation and node states
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    const node = this.grid.getNode(row, col);
                    if (node) {
                        node.isVisited = false;
                        node.isPath = false;
                        node.isCurrent = false;
                        
                        // Also clear DOM element classes directly
                        const nodeElement = document.getElementById(`dijkstra-grid-node-${row}-${col}`);
                        if (nodeElement && !node.isStart && !node.isEnd && !node.isWall) {
                            nodeElement.classList.remove('visited', 'path', 'current', 'animate');
                        }
                        
                        const astarNodeElement = document.getElementById(`astar-grid-node-${row}-${col}`);
                        if (astarNodeElement && !node.isStart && !node.isEnd && !node.isWall) {
                            astarNodeElement.classList.remove('visited', 'path', 'current', 'animate');
                        }
                    }
                }
            }
        }
        
        if (this.gridView) {
            this.gridView.update();
        }
        
        if (this.uiView) {
            this.uiView.setGridInteractionsDisabled(false);
            this.uiView.setStepControlsEnabled(false);
        }
        
        // Reset stats display
        this.updateStats(0, 0);
    }

    /**
     * Disable the previous step button
     * @param {boolean} disable - Whether to disable the button
     */
    disablePrevStepButton(disable) {
        // Desktop controls
        const prevStepButton = document.getElementById('prev-step-btn');
        
        // Mobile controls
        const mobilePrevStepButton = document.getElementById('prev-step-btn-mobile');
        const mobileStepMenuPrevButton = document.getElementById('mobile-prev-step');
        
        // Set disabled state
        if (prevStepButton) prevStepButton.disabled = disable;
        if (mobilePrevStepButton) mobilePrevStepButton.disabled = disable;
        if (mobileStepMenuPrevButton) mobileStepMenuPrevButton.disabled = disable;
    }

    /**
     * Check if both algorithms have finished and disable Next Step button if so
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
            
            // If both algorithms have finished, disable the Next Step button
            if (dijkstraFinished && astarFinished) {
                // Immediately disable all Next Step buttons
                this.disableNextStepButton();
                
                // Also update the UI state to reflect that we've reached the end
                if (window.Toast) {
                    // Show a toast notification only once when both algorithms complete
                    if (dijkstraController.algorithm instanceof DijkstraAlgorithm) {
                        if (dijkstraController.pathFound && astarController.pathFound) {
                            window.Toast.success('Both algorithms have found their paths!');
                        }
                    }
                }
                
                // Since both algorithms are finished, we can set isVisualizing to false
                // to allow new visualizations to start
                dijkstraController.isVisualizing = false;
                astarController.isVisualizing = false;
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Disable the next step button
     */
    disableNextStepButton() {
        // Desktop controls
        const nextStepButton = document.getElementById('next-step-btn');
        
        // Mobile controls
        const mobileNextStepButton = document.getElementById('next-step-btn-mobile');
        const mobileStepMenuNextButton = document.getElementById('mobile-next-step');
        
        // Set disabled state
        if (nextStepButton) nextStepButton.disabled = true;
        if (mobileNextStepButton) mobileNextStepButton.disabled = true;
        if (mobileStepMenuNextButton) mobileStepMenuNextButton.disabled = true;
    }

    /**
     * Enable the next step button
     */
    enableNextStepButton() {
        // Desktop controls
        const nextStepButton = document.getElementById('next-step-btn');
        
        // Mobile controls
        const mobileNextStepButton = document.getElementById('next-step-btn-mobile');
        const mobileStepMenuNextButton = document.getElementById('mobile-next-step');
        
        // Set enabled state
        if (nextStepButton) nextStepButton.disabled = false;
        if (mobileNextStepButton) mobileNextStepButton.disabled = false;
        if (mobileStepMenuNextButton) mobileStepMenuNextButton.disabled = false;
    }
} 