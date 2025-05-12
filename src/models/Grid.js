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
        // console.log("Grid: Creating grid with dimensions", rows, "x", cols);
        
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        
        // Initialize the grid with nodes
        this.initGrid();
    }

    /**
     * Initialize the grid with nodes
     */
    initGrid() {
        // console.log("Grid: Initializing nodes");
        
        this.nodes = [];
        
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Node(row, col));
            }
            this.nodes.push(currentRow);
        }
        
        // console.log("Grid: Created", this.rows * this.cols, "nodes");
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
            if (node === this.startNode) {
                this.startNode = null; // Clear start node if it's the same as end
            }
            this.endNode = node;
        }
    }

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

    /**
     * Create a random maze on the grid
     * @param {number} density - Wall density (0-1)
     */
    generateRandomMaze(density = 0.3) {
        this.resetGrid();
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Random wall generation based on density
                if (Math.random() < density) {
                    this.nodes[row][col].isWall = true;
                }
            }
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
} 