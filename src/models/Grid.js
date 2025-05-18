/**
 * Grid class to manage the collection of nodes
 */
class Grid {
    /**
     * Create a new grid
     * @param {number} rows - Number of rows in the grid
     * @param {number} cols - Number of columns in the grid
     */
    constructor(rows = 10, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        
        // Initialize the grid with nodes
        this.initGrid();
    }

    //=============================================================================
    // GRID INITIALIZATION AND RESET
    //=============================================================================

    /**
     * Initialize the grid with nodes
     */
    initGrid() {
        this.nodes = [];
        
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Node(row, col));
            }
            this.nodes.push(currentRow);
        }
    }

    /**
     * Resize the grid
     * @param {number} newRows - New number of rows
     * @param {number} newCols - New number of columns
     */
    resize(newRows, newCols) {
        this.rows = newRows;
        this.cols = newCols;
        this.initGrid();
        this.startNode = null;
        this.endNode = null;
    }

    /**
     * Reset all path-related node properties
     */
    resetPath() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].reset();
            }
        }
    }

    /**
     * Reset the entire grid
     */
    resetGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].resetAll();
            }
        }
        this.startNode = null;
        this.endNode = null;
    }

    //=============================================================================
    // NODE ACCESS AND MANIPULATION
    //=============================================================================

    /**
     * Get a node at the specified position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Node|null} The node at the position or null if out of bounds
     */
    getNode(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.nodes[row][col];
    }

    /**
     * Get all neighbors of a node
     * @param {Node} node - The node to get neighbors for
     * @returns {Node[]} Array of neighboring nodes
     */
    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        
        // Up, Right, Down, Left directions
        const directions = [
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 0, col: -1 }
        ];
        
        for (const dir of directions) {
            const neighborRow = row + dir.row;
            const neighborCol = col + dir.col;
            const neighbor = this.getNode(neighborRow, neighborCol);
            
            if (neighbor && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }

    /**
     * Create a deep clone of this grid
     * @returns {Grid} A new Grid instance with the same properties
     */
    clone() {
        const clonedGrid = new Grid(this.rows, this.cols);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const originalNode = this.nodes[row][col];
                const clonedNode = clonedGrid.nodes[row][col];
                
                clonedNode.isStart = originalNode.isStart;
                clonedNode.isEnd = originalNode.isEnd;
                clonedNode.isWall = originalNode.isWall;
                clonedNode.isVisited = originalNode.isVisited;
                clonedNode.isPath = originalNode.isPath;
                clonedNode.isCurrent = originalNode.isCurrent;
                clonedNode.distance = originalNode.distance;
                clonedNode.weight = originalNode.weight;
                
                if (originalNode.isStart) clonedGrid.startNode = clonedNode;
                if (originalNode.isEnd) clonedGrid.endNode = clonedNode;
            }
        }
        
        return clonedGrid;
    }

    //=============================================================================
    // START/END NODE MANAGEMENT
    //=============================================================================

    /**
     * Set a node as the start node
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    setStartNode(row, col) {
        if (this.startNode) {
            this.startNode.isStart = false;
        }
        const node = this.getNode(row, col);
        if (node) {
            node.isStart = true;
            node.isWall = false; // Ensure start node is not a wall
            node.isWeighted = false; // Ensure start node is not weighted
            node.weight = 1; // Reset weight to default
            if (node === this.endNode) {
                this.endNode = null; // Clear end node if it's the same as start
            }
            this.startNode = node;
        }
    }

    /**
     * Set a node as the end node
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    setEndNode(row, col) {
        if (this.endNode) {
            this.endNode.isEnd = false;
        }
        const node = this.getNode(row, col);
        if (node) {
            node.isEnd = true;
            node.isWall = false; // Ensure end node is not a wall
            node.isWeighted = false; // Ensure end node is not weighted
            node.weight = 1; // Reset weight to default
            if (node === this.startNode) {
                this.startNode = null; // Clear start node if it's the same as end
            }
            this.endNode = node;
        }
    }

    /**
     * Set random start and end points
     */
    setRandomStartEnd() {
        // Reset existing start/end
        if (this.startNode) this.startNode.isStart = false;
        if (this.endNode) this.endNode.isEnd = false;
        
        // Generate random positions ensuring they are different
        let startRow, startCol, endRow, endCol;
        do {
            startRow = Math.floor(Math.random() * this.rows);
            startCol = Math.floor(Math.random() * this.cols);
            endRow = Math.floor(Math.random() * this.rows);
            endCol = Math.floor(Math.random() * this.cols);
        } while ((startRow === endRow && startCol === endCol) || 
                this.getNode(startRow, startCol).isWall || 
                this.getNode(endRow, endCol).isWall);
        
        // Set new start/end
        this.setStartNode(startRow, startCol);
        this.setEndNode(endRow, endCol);
    }

    //=============================================================================
    // WALL MANAGEMENT
    //=============================================================================

    /**
     * Toggle a node's wall state
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    toggleWall(row, col) {
        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isEnd) {
            node.isWall = !node.isWall;
        }
    }

    /**
     * Set a node's wall state
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {boolean} isWall - Wall state to set
     */
    setWall(row, col, isWall) {
        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isEnd) {
            node.isWall = isWall;
        }
    }

    /**
     * Clear all walls in the grid
     */
    clearWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].isWall = false;
            }
        }
    }

    //=============================================================================
    // MAZE GENERATION
    //=============================================================================

    /**
     * Create a random maze on the grid
     * @param {number} density - Wall density (0-1)
     */
    generateRandomMaze(density = 0.35) {
        this.resetGrid();
        
        // First set random start and end points
        this.setRandomStartEnd();
        
        // Keep track of start and end positions
        const startRow = this.startNode.row;
        const startCol = this.startNode.col;
        const endRow = this.endNode.row;
        const endCol = this.endNode.col;
        
        // Create walls with the given density
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Skip start and end positions
                if ((row === startRow && col === startCol) || 
                    (row === endRow && col === endCol)) {
                    continue;
                }
                
                // Random wall generation based on density
                if (Math.random() < density) {
                    this.nodes[row][col].isWall = true;
                }
            }
        }
    }

    /**
     * Generate a maze using recursive division algorithm
     * @param {string} skew - Optional skew direction ('vertical', 'horizontal', or undefined for balanced)
     */
    generateRecursiveDivisionMaze(skew) {
        this.resetGrid();
        
        // First set random start and end points
        this.setRandomStartEnd();
        
        // Keep track of start and end positions
        const startRow = this.startNode.row;
        const startCol = this.startNode.col;
        const endRow = this.endNode.row;
        const endCol = this.endNode.col;
        
        // Add walls around the perimeter
        this.addOuterWalls();
        
        // Ensure start and end nodes are not walls (in case they were on the perimeter)
        if (this.startNode) this.startNode.isWall = false;
        if (this.endNode) this.endNode.isWall = false;
        
        // Start the recursive division
        this.recursiveDivision(1, 1, this.rows - 2, this.cols - 2, skew, startRow, startCol, endRow, endCol);
    }
    
    /**
     * Add outer walls around the perimeter of the grid
     */
    addOuterWalls() {
        // Top and bottom walls
        for (let col = 0; col < this.cols; col++) {
            this.nodes[0][col].isWall = true;
            this.nodes[this.rows - 1][col].isWall = true;
        }
        
        // Left and right walls
        for (let row = 0; row < this.rows; row++) {
            this.nodes[row][0].isWall = true;
            this.nodes[row][this.cols - 1].isWall = true;
        }
    }
    
    /**
     * Recursive division algorithm for maze generation
     * @param {number} startRow - Start row for division
     * @param {number} startCol - Start column for division
     * @param {number} endRow - End row for division
     * @param {number} endCol - End column for division
     * @param {string} skew - Optional skew direction ('vertical', 'horizontal')
     * @param {number} keepStartRow - Row of start node to keep clear
     * @param {number} keepStartCol - Column of start node to keep clear
     * @param {number} keepEndRow - Row of end node to keep clear
     * @param {number} keepEndCol - Column of end node to keep clear
     */
    recursiveDivision(startRow, startCol, endRow, endCol, skew, keepStartRow, keepStartCol, keepEndRow, keepEndCol) {
        // Calculate width and height of the current chamber
        const width = endCol - startCol + 1;
        const height = endRow - startRow + 1;
        
        // Base case: If the chamber is too small, stop recursion
        if (width < 3 || height < 3) return;
        
        // Choose orientation: vertical or horizontal wall
        let isVertical;
        
        if (skew === 'vertical') {
            // Bias towards vertical walls
            isVertical = width > height ? true : (width < height ? false : Math.random() < 0.7);
        } else if (skew === 'horizontal') {
            // Bias towards horizontal walls
            isVertical = width > height ? true : (width < height ? false : Math.random() < 0.3);
        } else {
            // Balanced: Choose based on chamber dimensions
            isVertical = width > height ? true : (width < height ? false : Math.random() < 0.5);
        }
        
        if (isVertical) {
            // Choose a column where the vertical wall will be placed
            const col = startCol + Math.floor(Math.random() * (width - 2)) + 1;
            
            // Choose a row where the passage will be created
            const passageRow = startRow + Math.floor(Math.random() * height);
            
            // Build the vertical wall with a passage
            for (let row = startRow; row <= endRow; row++) {
                // Skip the passage row and the start/end positions
                if (row === passageRow || 
                    (row === keepStartRow && col === keepStartCol) || 
                    (row === keepEndRow && col === keepEndCol)) {
                    continue;
                }
                this.nodes[row][col].isWall = true;
            }
            
            // Recursively divide the left and right chambers
            this.recursiveDivision(startRow, startCol, endRow, col - 1, skew, keepStartRow, keepStartCol, keepEndRow, keepEndCol);
            this.recursiveDivision(startRow, col + 1, endRow, endCol, skew, keepStartRow, keepStartCol, keepEndRow, keepEndCol);
        } else {
            // Choose a row where the horizontal wall will be placed
            const row = startRow + Math.floor(Math.random() * (height - 2)) + 1;
            
            // Choose a column where the passage will be created
            const passageCol = startCol + Math.floor(Math.random() * width);
            
            // Build the horizontal wall with a passage
            for (let col = startCol; col <= endCol; col++) {
                // Skip the passage column and the start/end positions
                if (col === passageCol || 
                    (row === keepStartRow && col === keepStartCol) || 
                    (row === keepEndRow && col === keepEndCol)) {
                    continue;
                }
                this.nodes[row][col].isWall = true;
            }
            
            // Recursively divide the top and bottom chambers
            this.recursiveDivision(startRow, startCol, row - 1, endCol, skew, keepStartRow, keepStartCol, keepEndRow, keepEndCol);
            this.recursiveDivision(row + 1, startCol, endRow, endCol, skew, keepStartRow, keepStartCol, keepEndRow, keepEndCol);
        }
    }
} 