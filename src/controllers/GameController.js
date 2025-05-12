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
        // console.log("GameController: Initializing with", grids.length, "grids");
        
        // Handle both single grid and multiple grid scenarios
        this.grids = Array.isArray(grids) ? grids : [grids];
        this.gridViews = Array.isArray(gridViews) ? gridViews : [gridViews];
        this.visualizationControllers = Array.isArray(visualizationControllers) 
            ? visualizationControllers 
            : [visualizationControllers];
        
        // Set default start and end nodes for all grids
        this.setDefaultStartEnd();
    }

    /**
     * Set default start and end nodes
     */
    setDefaultStartEnd() {
        // console.log("GameController: Setting default start/end nodes for all grids");
        
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
        
        // console.log(`Setting start node at (${startRow}, ${startCol}) and end node at (${endRow}, ${endCol})`);
        
        // Apply to all grids
        this.grids.forEach((grid, index) => {
            // Skip if grid is not properly initialized
            if (!grid || !grid.setStartNode || !grid.setEndNode) {
                console.error(`Grid ${index} is not properly initialized`);
                return;
            }
            
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            // console.log(`Grid ${index}: Start node set:`, !!grid.startNode);
            // console.log(`Grid ${index}: End node set:`, !!grid.endNode);
            
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

    /**
     * Set random start and end nodes
     */
    setRandomStartEnd() {
        // console.log("GameController: Setting random start/end for all grids");
        
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
        
        // Apply to all grids
        this.grids.forEach((grid, index) => {
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            // Update grid view
            if (this.gridViews[index]) {
                this.gridViews[index].update();
            }
        });
    }

    /**
     * Generate a random maze
     * @param {number} density - Wall density (0-1)
     */
    generateRandomMaze(density = 0.3) {
        // console.log("GameController: Generating random maze for all grids");
        
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Generate the same random maze for all grids
        const rows = this.grids[0].rows;
        const cols = this.grids[0].cols;
        
        // Clear only the path visualization, keeping weights
        this.grids.forEach(grid => {
            // First clear all walls but preserve everything else
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
        
        // Generate the same wall pattern for all grids
        const wallPattern = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const node = this.grids[0].getNode(row, col);
                
                // Skip if the node is start, end, or weighted
                if (node.isStart || node.isEnd || node.isWeighted) {
                    continue;
                }
                
                // Random wall generation based on density
                if (Math.random() < density) {
                    wallPattern.push({ row, col });
                }
            }
        }
        
        // Apply walls to all grids
        this.grids.forEach(grid => {
            wallPattern.forEach(wall => {
                const node = grid.getNode(wall.row, wall.col);
                // Double check the node is not special before setting as wall
                if (!node.isStart && !node.isEnd && !node.isWeighted) {
                    grid.setWall(wall.row, wall.col, true);
                }
            });
        });
        
        // Update all grid views
        this.gridViews.forEach(gridView => {
            if (gridView) gridView.update();
        });
    }

    /**
     * Resize all grids
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     */
    resizeGrid(rows, cols) {
        // console.log(`GameController: Resizing all grids to ${rows}x${cols}`);
        
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
        
        // Set default start and end nodes
        this.setDefaultStartEnd();
    }

    /**
     * Clear all grids (walls and path)
     */
    clearGrid() {
        // console.log("GameController: Clearing all grids");
        
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

    /**
     * Set current tool for all grid views
     * @param {string} tool - The tool to set
     */
    setCurrentTool(tool) {
        // console.log("GameController: Setting tool to", tool);
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
        // console.log(`GameController: Grid ${gridIndex} - ${action} at (${row}, ${col})`);
        
        // Safety check - validate grids array
        if (!this.grids || this.grids.length === 0) {
            console.error("GameController: No grids available for node action");
            return;
        }
        
        // Reset any existing visualization to ensure we start with a clean slate
        // This is especially important after a "no path found" scenario
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
        if (this.gridViews) {
            this.gridViews.forEach((gridView, index) => {
                if (gridView && typeof gridView.update === 'function') {
                    try {
                        gridView.update();
                    } catch (error) {
                        console.error(`Error updating grid view ${index}:`, error);
                    }
                }
            });
        }
    }

    /**
     * Save the current grid state to local storage
     * @param {string} name - Name for the saved grid
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
            this.gridViews.forEach((gridView, index) => {
                if (gridView) gridView.update();
            });
            
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

    /**
     * Generate random weighted nodes
     * @param {number} density - Weighted node density (0-1)
     */
    generateRandomWeights(density = 0.15) {
        // console.log("GameController: Generating random weighted nodes");
        
        // Reset any existing visualization
        this.resetVisualizationState();
        
        // Generate the same weights pattern for all grids
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
                }
            }
        }
        
        // Apply weights to all grids
        this.grids.forEach(grid => {
            // First, clear existing weights
            for (let row = 0; row < grid.rows; row++) {
                for (let col = 0; col < grid.cols; col++) {
                    const node = grid.nodes[row][col];
                    if (node && !node.isWall && !node.isStart && !node.isEnd) {
                        node.isWeighted = false;
                        node.weight = 1;
                    }
                }
            }
            
            // Then apply new weights
            weightPattern.forEach(item => {
                const node = grid.getNode(item.row, item.col);
                if (node && !node.isWall && !node.isStart && !node.isEnd) {
                    node.isWeighted = true;
                    node.weight = item.weight;
                }
            });
        });
        
        // Update all grid views
        this.gridViews.forEach(gridView => {
            if (gridView) gridView.update();
        });
    }
} 