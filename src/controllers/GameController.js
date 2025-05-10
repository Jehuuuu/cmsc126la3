/**
 * Controller for managing the game state
 */
class GameController {
    /**
     * Create a new GameController
     * @param {Grid} grid - The grid model
     * @param {GridView} gridView - The grid view
     * @param {VisualizationController} visualizationController - The visualization controller
     */
    constructor(grid, gridView, visualizationController) {
        console.log("GameController: Initializing");
        this.grid = grid;
        this.gridView = gridView;
        this.visualizationController = visualizationController;
        
        // Set default start and end nodes
        this.setDefaultStartEnd();
    }

    /**
     * Set default start and end nodes
     */
    setDefaultStartEnd() {
        console.log("GameController: Setting default start/end nodes");
        
        // Default start node at top-left quarter
        const startRow = Math.floor(this.grid.rows / 4);
        const startCol = Math.floor(this.grid.cols / 4);
        
        // Default end node at bottom-right quarter
        const endRow = Math.floor(this.grid.rows * 3 / 4);
        const endCol = Math.floor(this.grid.cols * 3 / 4);
        
        console.log(`Setting start node at (${startRow}, ${startCol}) and end node at (${endRow}, ${endCol})`);
        
        this.grid.setStartNode(startRow, startCol);
        this.grid.setEndNode(endRow, endCol);
        
        console.log("Start node set:", !!this.grid.startNode);
        console.log("End node set:", !!this.grid.endNode);
        
        if (this.gridView) {
            this.gridView.update();
        } else {
            console.error("GridView is not initialized yet");
        }
    }

    /**
     * Set random start and end nodes
     */
    setRandomStartEnd() {
        this.grid.setRandomStartEnd();
        this.gridView.update();
    }

    /**
     * Generate a random maze
     * @param {number} density - Wall density (0-1)
     */
    generateRandomMaze(density = 0.3) {
        // Stop any running visualization
        this.visualizationController.stopVisualization();
        
        // Generate random maze
        this.grid.generateRandomMaze(density);
        
        // Set random start and end positions
        this.grid.setRandomStartEnd();
        
        this.gridView.update();
    }

    /**
     * Resize the grid
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     */
    resizeGrid(rows, cols) {
        // Stop any running visualization
        this.visualizationController.stopVisualization();
        
        // Resize the grid
        this.grid.resize(rows, cols);
        
        // Re-render the grid view
        this.gridView.render();
        
        // Set default start and end nodes
        this.setDefaultStartEnd();
    }

    /**
     * Clear the grid (walls and path)
     */
    clearGrid() {
        // Stop any running visualization
        this.visualizationController.stopVisualization();
        
        // Clear walls and reset path
        this.grid.clearWalls();
        this.grid.resetPath();
        
        this.gridView.update();
    }

    /**
     * Reset the entire grid
     */
    resetGrid() {
        // Stop any running visualization
        this.visualizationController.stopVisualization();
        
        // Reset the grid
        this.grid.resetGrid();
        
        // Set default start and end nodes
        this.setDefaultStartEnd();
        
        this.gridView.update();
    }

    /**
     * Set the current tool
     * @param {string} tool - The tool to set (wall, start, end, erase)
     */
    setCurrentTool(tool) {
        this.gridView.setCurrentTool(tool);
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
            rows: this.grid.rows,
            cols: this.grid.cols,
            start: this.grid.startNode ? { row: this.grid.startNode.row, col: this.grid.startNode.col } : null,
            end: this.grid.endNode ? { row: this.grid.endNode.row, col: this.grid.endNode.col } : null,
            walls: []
        };
        
        // Save wall positions
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                if (this.grid.nodes[row][col].isWall) {
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
            if (gridData.rows !== this.grid.rows || gridData.cols !== this.grid.cols) {
                this.grid.resize(gridData.rows, gridData.cols);
                this.gridView.render();
            } else {
                // Reset current grid
                this.grid.resetGrid();
            }
            
            // Set start and end nodes
            if (gridData.start) {
                this.grid.setStartNode(gridData.start.row, gridData.start.col);
            }
            
            if (gridData.end) {
                this.grid.setEndNode(gridData.end.row, gridData.end.col);
            }
            
            // Set walls
            for (const wall of gridData.walls) {
                this.grid.setWall(wall.row, wall.col, true);
            }
            
            this.gridView.update();
            
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