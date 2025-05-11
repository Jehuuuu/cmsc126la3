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
        console.log("GameController: Initializing with", grids.length, "grids");
        
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
        console.log("GameController: Setting default start/end nodes for all grids");
        
        // Default start node at top-left quarter
        const startRow = Math.floor(this.grids[0].rows / 4);
        const startCol = Math.floor(this.grids[0].cols / 4);
        
        // Default end node at bottom-right quarter
        const endRow = Math.floor(this.grids[0].rows * 3 / 4);
        const endCol = Math.floor(this.grids[0].cols * 3 / 4);
        
        console.log(`Setting start node at (${startRow}, ${startCol}) and end node at (${endRow}, ${endCol})`);
        
        // Apply to all grids
        this.grids.forEach((grid, index) => {
            grid.setStartNode(startRow, startCol);
            grid.setEndNode(endRow, endCol);
            
            console.log(`Grid ${index}: Start node set:`, !!grid.startNode);
            console.log(`Grid ${index}: End node set:`, !!grid.endNode);
            
            // Update grid view
            if (this.gridViews[index]) {
                this.gridViews[index].update();
            }
        });
    }

    /**
     * Set random start and end nodes
     */
    setRandomStartEnd() {
        console.log("GameController: Setting random start/end for all grids");
        
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
            
            // Check for walls in any grid
            for (const grid of this.grids) {
                const startNode = grid.getNode(startRow, startCol);
                const endNode = grid.getNode(endRow, endCol);
                
                if (startNode.isWall || endNode.isWall) {
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
        console.log("GameController: Generating random maze for all grids");
        
        // Stop any running visualizations
        this.visualizationControllers.forEach(controller => {
            if (controller) controller.stopVisualization();
        });
        
        // Generate the same random maze for all grids
        const rows = this.grids[0].rows;
        const cols = this.grids[0].cols;
        
        // Reset all grids
        this.grids.forEach(grid => grid.resetGrid());
        
        // Generate the same wall pattern for all grids
        const wallPattern = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Random wall generation based on density
                if (Math.random() < density) {
                    wallPattern.push({ row, col });
                }
            }
        }
        
        // Apply walls to all grids
        this.grids.forEach(grid => {
            wallPattern.forEach(wall => {
                grid.setWall(wall.row, wall.col, true);
            });
        });
        
        // Set random start and end positions
        this.setRandomStartEnd();
        
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
        console.log(`GameController: Resizing all grids to ${rows}x${cols}`);
        
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
        console.log("GameController: Clearing all grids");
        
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
        
        // Clear walls and reset path for all grids
        this.grids.forEach((grid, index) => {
            grid.clearWalls();
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
        console.log("GameController: Setting tool to", tool);
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
     */
    handleNodeAction(gridIndex, row, col, action) {
        console.log(`GameController: Grid ${gridIndex} - ${action} at (${row}, ${col})`);
        
        // Perform the action on all grids
        this.grids.forEach((grid, index) => {
            switch(action) {
                case 'wall':
                    grid.setWall(row, col, true);
                    break;
                case 'start':
                    grid.setStartNode(row, col);
                    break;
                case 'end':
                    grid.setEndNode(row, col);
                    break;
                case 'erase':
                    grid.setWall(row, col, false);
                    break;
                // Add a special case for toggling walls
                case 'toggleWall':
                    const node = grid.getNode(row, col);
                    if (node && !node.isStart && !node.isEnd) {
                        node.isWall = !node.isWall;
                    }
                    break;
            }
        });
        
        // Make sure both grid views are updated
        this.gridViews.forEach(gridView => {
            if (gridView) {
                gridView.update();
            }
        });
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
            walls: []
        };
        
        // Save wall positions
        for (let row = 0; row < this.grids[0].rows; row++) {
            for (let col = 0; col < this.grids[0].cols; col++) {
                if (this.grids[0].nodes[row][col].isWall) {
                    gridData.walls.push({ row, col });
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
            
            // Set walls
            for (const wall of gridData.walls) {
                this.grids.forEach((grid, index) => {
                    grid.setWall(wall.row, wall.col, true);
                });
            }
            
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
} 