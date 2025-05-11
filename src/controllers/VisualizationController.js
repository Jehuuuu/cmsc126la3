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
        console.log("Running algorithm:", this.algorithm.constructor.name);
        const result = this.algorithm.run(true);
        this.visitedNodesInOrder = result.visited;
        this.pathNodesInOrder = result.path;
        
        // Update stats
        this.updateStats(this.visitedNodesInOrder.length, this.pathNodesInOrder.length);
        
        // Generate alternative path - COMMENTED OUT
        // this.generateAlternativePath();
        
        if (this.mode === 'auto') {
            // Auto mode: animate the visualization
            await this.gridView.visualize(
                this.visitedNodesInOrder, 
                this.pathNodesInOrder, 
                this.speed[this.currentSpeed]
            );
            
            this.isVisualizing = false;
            this.uiView.setGridInteractionsDisabled(false);
        } else {
            // Step mode: prepare for stepping
            this.currentStep = -1;
            this.maxStep = this.visitedNodesInOrder.length - 1;
            this.uiView.setStepControlsEnabled(true);
            
            // Show first step
            this.nextStep();
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
        if (this.mode !== 'step' || this.currentStep >= this.maxStep) return;
        
        this.currentStep++;
        this.algorithm.updateProgress(this.currentStep);
        
        // If we've reached the end node, show the path
        if (this.currentStep === this.maxStep) {
            this.showPath();
        }
        
        this.gridView.update();
    }

    /**
     * Move to the previous step in step-by-step mode
     */
    prevStep() {
        if (this.mode !== 'step' || this.currentStep <= 0) return;
        
        this.currentStep--;
        this.algorithm.updateProgress(this.currentStep);
        
        // If we had the path shown, hide it now
        for (const node of this.pathNodesInOrder) {
            node.isPath = false;
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
    }

    /**
     * Set the visualization mode
     * @param {string} mode - The mode to set ('auto' or 'step')
     */
    setMode(mode) {
        if (this.isVisualizing) return;
        
        this.mode = mode;
        this.uiView.updateModeUI(mode);
        
        // Reset step controls
        if (mode === 'step') {
            this.uiView.setStepControlsEnabled(false);
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
} 