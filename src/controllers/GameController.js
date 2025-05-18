/**
 * Controller for managing the game state across multiple grids
 */
class GameController {
    /**
     * Create a new GameController
     * @param {Grid[]} grids - Array of grid models
     * @param {GridView[]} gridViews - Array of grid views
     * @param {VisualizationController[]} visualizationControllers - Array of visualization controllers
     */
    constructor(grids, gridViews, visualizationControllers) {
        // Handle both single grid and multiple grid scenarios
        this.grids = Array.isArray(grids) ? grids : [grids];
        this.gridViews = Array.isArray(gridViews) ? gridViews : [gridViews];
        this.visualizationControllers = Array.isArray(visualizationControllers) 
            ? visualizationControllers 
            : [visualizationControllers];
    }

    //=============================================================================
    // GRID STATE MANAGEMENT
    //=============================================================================

    /**
     * Set default start and end nodes
     */
    setDefaultStartEnd() {
        // Safety check - make sure grids exist
        if (!this.grids || this.grids.length === 0) {
            console.error("GameController: No grids available to set start/end nodes");
            return;
        }
        
        // Default start node at top-left quarter
        const startRow = Math.floor(this.grids[0].rows / 4);
        const startCol = Math.floor(this.grids[0].cols / 4);
        
        // Default end node at bottom-right quarter
        const endRow = Math.floor(this.grids[0].rows * 3 / 4);
        const endCol = Math.floor(this.grids[0].cols * 3 / 4);
        
        // Apply to all grids
        this.grids.forEach((grid, index) => {
            // Skip if grid is not properly initialized
            if (!grid || !grid.setStartNode || !grid.setEndNode) {
                console.error(`Grid ${index} is not properly initialized`);
                return;
            }
            
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            // Update grid view if available
            if (this.gridViews && this.gridViews[index]) {
                try {
                    this.gridViews[index].render(); // Render first to ensure nodes exist
                    this.gridViews[index].update();
                } catch (error) {
                    console.error(`Error updating grid view ${index}:`, error);
                }
            }
        });
    }

    /**
     * Set random start and end nodes
     */
    setRandomStartEnd() {
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Generate random positions ensuring they are different
        const rows = this.grids[0].rows;
        const cols = this.grids[0].cols;
        
        // Find positions that work for all grids (no walls in any grid)
        let startRow, startCol, endRow, endCol;
        let validPositions = false;
        
        // Try to find valid positions (maximum 10 attempts)
        for (let attempt = 0; attempt < 10 && !validPositions; attempt++) {
            startRow = Math.floor(Math.random() * rows);
            startCol = Math.floor(Math.random() * cols);
            endRow = Math.floor(Math.random() * rows);
            endCol = Math.floor(Math.random() * cols);
            
            // Check if valid in all grids
            validPositions = true;
            
            // Check if start and end are different
            if (startRow === endRow && startCol === endCol) {
                validPositions = false;
                continue;
            }
            
            // Check for walls or weighted nodes in any grid
            for (const grid of this.grids) {
                const startNode = grid.getNode(startRow, startCol);
                const endNode = grid.getNode(endRow, endCol);
                
                if (startNode.isWall || endNode.isWall || startNode.isWeighted || endNode.isWeighted) {
                    validPositions = false;
                    break;
                }
            }
        }
        
        // First, clear all existing start and end nodes from the DOM
        this.grids.forEach((grid, index) => {
            // Clear previous end node
            if (grid.endNode) {
                const oldEndElement = document.getElementById(`${this.gridViews[index].gridContainerId}-node-${grid.endNode.row}-${grid.endNode.col}`);
                if (oldEndElement) {
                    oldEndElement.classList.remove('end');
                    // Remove any end image overlays
                    const endOverlays = oldEndElement.querySelectorAll('.end-overlay');
                    endOverlays.forEach(overlay => overlay.remove());
                }
                grid.endNode.isEnd = false;
            }
            
            // Clear previous start node
            if (grid.startNode) {
                const oldStartElement = document.getElementById(`${this.gridViews[index].gridContainerId}-node-${grid.startNode.row}-${grid.startNode.col}`);
                if (oldStartElement) {
                    oldStartElement.classList.remove('start');
                    // Remove any start image overlays
                    const startOverlays = oldStartElement.querySelectorAll('.start-overlay');
                    startOverlays.forEach(overlay => overlay.remove());
                }
                grid.startNode.isStart = false;
            }
        });
        
        // Now set the new start and end nodes
        this.grids.forEach((grid, index) => {
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            // Update grid view completely
            if (this.gridViews[index]) {
                this.gridViews[index].update();
            }
        });
    }

    /**
     * Resize all grids
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     */
    resizeGrid(rows, cols) {
        // Stop any running visualizations
        this.visualizationControllers.forEach(controller => {
            if (controller) controller.stopVisualization();
        });
        
        // Resize all grids
        this.grids.forEach((grid, index) => {
            grid.resize(rows, cols);
            
            // Re-render the grid view
            if (this.gridViews[index]) {
                this.gridViews[index].render();
            }
        });
        
        // Set random start and end nodes instead of default positions
        this.setRandomStartEnd();
    }

    /**
     * Clear all grids (walls and path)
     */
    clearGrid() {
        // Stop any running visualizations with stronger reset
        this.visualizationControllers.forEach(controller => {
            if (controller) {
                // Use forceReset which handles animations and running algorithms more completely
                if (typeof controller.forceReset === 'function') {
                    controller.forceReset();
                } else {
                    // Fallback to original methods if forceReset isn't available
                    controller.stopVisualization();
                    
                    if (typeof controller.reset === 'function') {
                        controller.reset();
                    }
                    
                    if (typeof controller.resetUI === 'function') {
                        controller.resetUI();
                    }
                }
            }
        });
        
        // Clear walls, weighted nodes, and reset path for all grids
        this.grids.forEach((grid, index) => {
            // Clear walls
            grid.clearWalls();
            
            // Clear weighted nodes separately
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const node = grid.nodes[row][col];
                    if (node) {
                        node.isWeighted = false;
                        node.weight = 1;
                    }
                }
            }
            
            // Reset path
            grid.resetPath();
            
            // Update grid view
            if (this.gridViews[index]) {
                this.gridViews[index].update();
            }
        });
        
        // Ensure step controls are disabled
        const nextStepBtn = document.getElementById('next-step-btn');
        const prevStepBtn = document.getElementById('prev-step-btn');
        if (nextStepBtn) nextStepBtn.disabled = true;
        if (prevStepBtn) prevStepBtn.disabled = true;
    }

    //=============================================================================
    // VISUALIZATION CONTROL
    //=============================================================================

    /**
     * Reset visualization state across all visualization controllers
     * Used before making grid changes to ensure clean slate
     */
    resetVisualizationState() {
        // Reset visualization controllers more thoroughly
        this.visualizationControllers.forEach(controller => {
            if (controller) {
                // Force a complete visualization reset
                if (typeof controller.forceReset === 'function') {
                    controller.forceReset();
                } else {
                    // Fallback to basic reset if forceReset isn't available
                    if (typeof controller.reset === 'function') {
                        controller.reset();
                    }
                    if (typeof controller.stopVisualization === 'function') {
                        controller.stopVisualization();
                    }
                }
                
                // Reset UI stats to zero
                if (controller.elementIds) {
                    const visitedCountElement = document.getElementById(controller.elementIds.visitedCountId);
                    const pathLengthElement = document.getElementById(controller.elementIds.pathLengthId);
                    
                    if (visitedCountElement) visitedCountElement.textContent = '0';
                    if (pathLengthElement) pathLengthElement.textContent = '0';
                }
            }
        });
        
        // Reset path visualization in all grids
        this.grids.forEach(grid => {
            if (grid) {
                grid.resetPath();
            }
        });
        
        // Ensure grid views are updated to reflect the reset
        this.gridViews.forEach(gridView => {
            if (gridView && typeof gridView.update === 'function') {
                gridView.update();
            }
        });
    }

    //=============================================================================
    // MAZE GENERATION
    //=============================================================================

    /**
     * Generate a maze based on the selected algorithm
     * @param {string} mazeType - The type of maze to generate ('random', 'recursive-division', etc.)
     * @param {boolean} preserveWeights - Whether to preserve existing weighted nodes
     */
    generateMaze(mazeType, preserveWeights = true) {
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Store weighted nodes if preserving them
        const weightedNodes = preserveWeights ? this._saveWeightedNodes() : [];
        
        // Clear all walls and weighted nodes from all grids
        this.grids.forEach(grid => {
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const node = grid.getNode(row, col);
                    if (node) {
                        node.isWall = false;
                        node.obstacleType = null;
                        node.isWeighted = false;
                        node.weight = 1;
                    }
                }
            }
            grid.resetPath();
        });
        
        // Generate the maze pattern on the first grid
        let wallDensity;
        switch (mazeType) {
            case 'random':
                wallDensity = 0.35; // Increased density for more challenging random mazes
                this.grids[0].generateRandomMaze(wallDensity);
                break;
            case 'recursive-division':
                this.grids[0].generateRecursiveDivisionMaze();
                break;
            case 'recursive-division-vertical':
                this.grids[0].generateRecursiveDivisionMaze('vertical');
                break;
            case 'recursive-division-horizontal':
                this.grids[0].generateRecursiveDivisionMaze('horizontal');
                break;
            default:
                console.warn('Unknown maze type:', mazeType);
                return;
        }
        
        // Synchronize all grids with the first grid's pattern
        this._synchronizeGrids();
        
        // Restore weighted nodes if needed
        if (preserveWeights && weightedNodes.length > 0) {
            this._restoreWeightedNodes(weightedNodes);
        }
    }

    /**
     * Generate a random maze
     * @param {number} density - Wall density between 0-1
     * @param {boolean} preserveWeights - Whether to preserve existing weighted nodes
     */
    generateRandomMaze(density = 0.3, preserveWeights = true) {
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Store weighted nodes if preserving them
        const weightedNodes = preserveWeights ? this._saveWeightedNodes() : [];
        
        // Clear all walls from all grids
        this._clearAllWalls();
        
        // Generate maze on the first grid
        this.grids[0].generateRandomMaze(density);
        
        // Synchronize all grids with the first grid's pattern
        this._synchronizeGrids();
        
        // Restore weighted nodes if needed
        if (preserveWeights && weightedNodes.length > 0) {
            this._restoreWeightedNodes(weightedNodes);
        }
    }

    /**
     * Generate a maze using recursive division algorithm
     * @param {string} skew - Optional skew direction ('vertical', 'horizontal')
     * @param {boolean} preserveWeights - Whether to preserve existing weighted nodes
     */
    generateRecursiveDivisionMaze(skew, preserveWeights = true) {
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Store weighted nodes if preserving them
        const weightedNodes = preserveWeights ? this._saveWeightedNodes() : [];
        
        // Clear all walls from all grids
        this._clearAllWalls();
        
        // Generate the maze pattern on the first grid
        this.grids[0].generateRecursiveDivisionMaze(skew);
        
        // Synchronize all grids with the first grid's pattern
        this._synchronizeGrids();
        
        // Restore weighted nodes if needed
        if (preserveWeights && weightedNodes.length > 0) {
            this._restoreWeightedNodes(weightedNodes);
        }
    }

    /**
     * Generate random weighted nodes
     * @param {number} density - Weighted node density (0-1)
     */
    generateRandomWeights(density = 0.15) {
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // First clear all existing weights from all grids
        this.grids.forEach(grid => {
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const node = grid.nodes[row][col];
                    if (node && !node.isWall && !node.isStart && !node.isEnd) {
                        node.isWeighted = false;
                        node.weight = 1;
                    }
                }
            }
        });
        
        // Generate the weight pattern on the first grid
        const rows = this.grids[0].rows;
        const cols = this.grids[0].cols;
        
        // Generate the weight pattern
        const weightPattern = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip walls, start and end nodes
                if (this.grids[0].nodes[row][col].isWall || 
                    this.grids[0].nodes[row][col].isStart || 
                    this.grids[0].nodes[row][col].isEnd) {
                    continue;
                }
                
                // Random weight generation based on density
                if (Math.random() < density) {
                    // Generate random weight between 2-10
                    const weight = Math.floor(Math.random() * 9) + 2; // 2 to 10
                    weightPattern.push({ row, col, weight });
                    
                    // Apply weight to the first grid
                    const node = this.grids[0].getNode(row, col);
                    if (node) {
                        node.isWeighted = true;
                        node.weight = weight;
                    }
                }
            }
        }
        
        // Apply identical weights to all other grids
        for (let i = 1; i < this.grids.length; i++) {
            const grid = this.grids[i];
            
            // Apply weights
            weightPattern.forEach(item => {
                const node = grid.getNode(item.row, item.col);
                if (node && !node.isWall && !node.isStart && !node.isEnd) {
                    node.isWeighted = true;
                    node.weight = item.weight;
                }
            });
        }
        
        // Update all grid views
        this._updateAllGridViews();
    }

    //=============================================================================
    // NODE MANIPULATION
    //=============================================================================

    /**
     * Set current tool for all grid views
     * @param {string} tool - The tool to set
     */
    setCurrentTool(tool) {
        this.gridViews.forEach(gridView => {
            if (gridView) gridView.setCurrentTool(tool);
        });
    }

    /**
     * Handle a node action (wall, start, end)
     * @param {number} gridIndex - Index of the grid being modified
     * @param {number} row - The row of the node
     * @param {number} col - The column of the node
     * @param {string} action - The action to perform ('wall', 'start', 'end', 'erase')
     * @param {number} customValue - Optional custom value for weighted nodes
     */
    handleNodeAction(gridIndex, row, col, action, customValue = null) {
        // Safety check - validate grids array
        if (!this.grids || this.grids.length === 0) {
            console.error("GameController: No grids available for node action");
            return;
        }
        
        // Reset any existing visualization to ensure we start with a clean slate
        this.resetVisualizationState();
        
        // Determine obstacle type only once for consistent wall appearance across grids
        let sharedObstacleType = null;
        if (action === 'wall' || action === 'toggleWall') {
            // Generate random obstacle type (1 or 2) to be consistent across grids
            sharedObstacleType = Math.random() < 0.5 ? 1 : 2;
        }
        
        // Perform the action on all grids
        this.grids.forEach((grid, index) => {
            // Skip if grid is not properly initialized
            if (!grid) {
                console.error(`Grid ${index} is not properly initialized`);
                return;
            }
            
            try {
                switch(action) {
                    case 'wall':
                        if (typeof grid.setWall === 'function') {
                            const node = grid.getNode(row, col);
                            if (node && !node.isWall) {
                                // Assign obstacle type when wall is first created
                                node.obstacleType = sharedObstacleType;
                            }
                            grid.setWall(row, col, true);
                        }
                        break;
                    case 'start':
                        if (typeof grid.setStartNode === 'function') {
                            grid.setStartNode(row, col);
                        }
                        break;
                    case 'end':
                        if (typeof grid.setEndNode === 'function') {
                            grid.setEndNode(row, col);
                        }
                        break;
                    case 'weighted':
                        const weightedNode = grid.getNode(row, col);
                        if (weightedNode && !weightedNode.isStart && !weightedNode.isEnd) {
                            weightedNode.isWall = false; // Ensure it's not a wall
                            weightedNode.obstacleType = null; // Clear obstacle type
                            weightedNode.isWeighted = true; // Mark as weighted
                            weightedNode.weight = customValue || 2; // Set weight value
                        }
                        break;
                    case 'erase':
                        const node = grid.getNode(row, col);
                        if (node) {
                            node.isWall = false;
                            node.obstacleType = null; // Clear obstacle type
                            node.isWeighted = false;
                            node.weight = 1;
                        }
                        break;
                    // Add a special case for toggling walls
                    case 'toggleWall':
                        const toggleNode = grid.getNode(row, col);
                        if (toggleNode && !toggleNode.isStart && !toggleNode.isEnd) {
                            // If turning wall on, set type; if turning off, clear type
                            if (!toggleNode.isWall) {
                                toggleNode.obstacleType = sharedObstacleType;
                            } else {
                                toggleNode.obstacleType = null;
                            }
                            
                            toggleNode.isWall = !toggleNode.isWall;
                            
                            // If turning into a wall, remove weighted status
                            if (toggleNode.isWall) {
                                toggleNode.isWeighted = false;
                                toggleNode.weight = 1;
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error performing ${action} action on grid ${index}:`, error);
            }
        });
        
        // Make sure both grid views are updated
        this._updateAllGridViews();
    }

    //=============================================================================
    // SAVE/LOAD FUNCTIONALITY
    //=============================================================================

    /**
     * Save the current grid state to local storage
     * @param {string} name - Name for the saved grid
     * @returns {boolean} Success status
     */
    saveGrid(name) {
        if (!name) {
            name = `Grid-${Date.now()}`;
        }
        
        // Create a serializable version of the grid
        const gridData = {
            rows: this.grids[0].rows,
            cols: this.grids[0].cols,
            start: this.grids[0].startNode ? { row: this.grids[0].startNode.row, col: this.grids[0].startNode.col } : null,
            end: this.grids[0].endNode ? { row: this.grids[0].endNode.row, col: this.grids[0].endNode.col } : null,
            walls: [],
            weights: [] // Add array to store weighted nodes
        };
        
        // Save wall positions and weighted nodes
        for (let row = 0; row < this.grids[0].rows; row++) {
            for (let col = 0; col < this.grids[0].cols; col++) {
                const node = this.grids[0].nodes[row][col];
                if (node.isWall) {
                    gridData.walls.push({ 
                        row, 
                        col, 
                        obstacleType: node.obstacleType || 1 // Save obstacle type
                    });
                }
                if (node.isWeighted) {
                    gridData.weights.push({
                        row,
                        col,
                        weight: node.weight
                    });
                }
            }
        }
        
        // Save to local storage
        try {
            // Get existing saved grids
            const savedGrids = JSON.parse(localStorage.getItem('savedGrids') || '{}');
            
            // Add new grid
            savedGrids[name] = gridData;
            
            // Save back to local storage
            localStorage.setItem('savedGrids', JSON.stringify(savedGrids));
            
            return true;
        } catch (error) {
            console.error('Error saving grid:', error);
            return false;
        }
    }

    /**
     * Load a grid from local storage
     * @param {string} name - Name of the saved grid
     * @returns {boolean} Success status
     */
    loadGrid(name) {
        try {
            // Get saved grids
            const savedGrids = JSON.parse(localStorage.getItem('savedGrids') || '{}');
            
            // Check if grid exists
            if (!savedGrids[name]) {
                return false;
            }
            
            const gridData = savedGrids[name];
            
            // Reset visualization state
            this.resetVisualizationState();
            
            // Resize grid if needed
            if (gridData.rows !== this.grids[0].rows || gridData.cols !== this.grids[0].cols) {
                this.grids.forEach((grid, index) => {
                    grid.resize(gridData.rows, gridData.cols);
                    if (this.gridViews[index]) {
                        this.gridViews[index].render();
                    }
                });
            } else {
                // Reset current grids
                this.grids.forEach((grid, index) => {
                    grid.resetGrid();
                });
            }
            
            // Set start and end nodes
            if (gridData.start) {
                this.grids.forEach((grid, index) => {
                    grid.setStartNode(gridData.start.row, gridData.start.col);
                });
            }
            
            if (gridData.end) {
                this.grids.forEach((grid, index) => {
                    grid.setEndNode(gridData.end.row, gridData.end.col);
                });
            }
            
            // Set walls with obstacle types
            for (const wall of gridData.walls) {
                this.grids.forEach((grid, index) => {
                    grid.setWall(wall.row, wall.col, true);
                    
                    // Set obstacle type if available
                    if (wall.obstacleType) {
                        const node = grid.getNode(wall.row, wall.col);
                        if (node) {
                            node.obstacleType = wall.obstacleType;
                        }
                    }
                });
            }
            
            // Set weighted nodes if available
            if (gridData.weights && Array.isArray(gridData.weights)) {
                for (const weightedNode of gridData.weights) {
                    this.grids.forEach((grid, index) => {
                        const node = grid.getNode(weightedNode.row, weightedNode.col);
                        if (node) {
                            node.isWall = false; // Ensure it's not a wall
                            node.obstacleType = null;
                            node.isWeighted = true;
                            node.weight = weightedNode.weight || 2; // Default to 2 if weight not specified
                        }
                    });
                }
            }
            
            // Update all grid views
            this._updateAllGridViews();
            
            return true;
        } catch (error) {
            console.error('Error loading grid:', error);
            return false;
        }
    }

    /**
     * Get a list of saved grid names
     * @returns {string[]} Array of saved grid names
     */
    getSavedGrids() {
        try {
            const savedGrids = JSON.parse(localStorage.getItem('savedGrids') || '{}');
            return Object.keys(savedGrids);
        } catch (error) {
            console.error('Error getting saved grids:', error);
            return [];
        }
    }

    //=============================================================================
    // HELPER METHODS
    //=============================================================================

    /**
     * Clear all walls from all grids but preserve other node properties
     * @private
     */
    _clearAllWalls() {
        this.grids.forEach(grid => {
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const node = grid.getNode(row, col);
                    if (node && node.isWall) {
                        node.isWall = false;
                        node.obstacleType = null;
                    }
                }
            }
            // Reset path visualization
            grid.resetPath();
        });
    }

    /**
     * Update all grid views to reflect the latest grid state
     * @private
     */
    _updateAllGridViews() {
        this.gridViews.forEach(gridView => {
            if (gridView && typeof gridView.update === 'function') {
                gridView.update();
            }
        });
    }

    /**
     * Synchronize all grids with the first grid's pattern
     * @private
     */
    _synchronizeGrids() {
        // Get the updated start, end, and wall positions from the first grid
        const startRow = this.grids[0].startNode.row;
        const startCol = this.grids[0].startNode.col;
        const endRow = this.grids[0].endNode.row;
        const endCol = this.grids[0].endNode.col;
        
        // Collect wall positions from the first grid
        const wallPattern = [];
        for (let row = 0; row < this.grids[0].rows; row++) {
            for (let col = 0; col < this.grids[0].cols; col++) {
                const node = this.grids[0].getNode(row, col);
                if (node.isWall) {
                    // Save wall position and assign a random obstacle type
                    wallPattern.push({ 
                        row, 
                        col, 
                        obstacleType: Math.random() < 0.5 ? 1 : 2 
                    });
                }
            }
        }
        
        // Apply the same pattern to all other grids
        for (let i = 1; i < this.grids.length; i++) {
            const grid = this.grids[i];
            
            // Set the same start and end positions
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            // Apply walls with the same pattern
            wallPattern.forEach(wall => {
                const node = grid.getNode(wall.row, wall.col);
                if (node && !node.isStart && !node.isEnd) {
                    node.isWall = true;
                    node.obstacleType = wall.obstacleType;
                }
            });
        }
        
        // Update all grid views
        this._updateAllGridViews();
    }
    
    /**
     * Save all weighted nodes from the first grid
     * @returns {Array} Array of saved weighted node information
     * @private
     */
    _saveWeightedNodes() {
        const weightedNodes = [];
        
        for (let row = 0; row < this.grids[0].rows; row++) {
            for (let col = 0; col < this.grids[0].cols; col++) {
                const node = this.grids[0].getNode(row, col);
                if (node && node.isWeighted) {
                    weightedNodes.push({
                        row, col, weight: node.weight
                    });
                }
            }
        }
        
        return weightedNodes;
    }
    
    /**
     * Restore weighted nodes after maze generation
     * @param {Array} weightedNodes - Array of saved weighted node information
     * @private
     */
    _restoreWeightedNodes(weightedNodes) {
        if (!weightedNodes || weightedNodes.length === 0) return;
        
        // Apply weights to all grids
        this.grids.forEach(grid => {
            weightedNodes.forEach(item => {
                const node = grid.getNode(item.row, item.col);
                // Only apply weight if node exists and isn't a wall, start, or end node
                if (node && !node.isWall && !node.isStart && !node.isEnd) {
                    node.isWeighted = true;
                    node.weight = item.weight;
                }
            });
        });
        
        // Update all grid views
        this._updateAllGridViews();
    }
} 