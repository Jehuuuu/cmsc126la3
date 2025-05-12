/**
 * Node class represents a single cell in the grid
 */
class Node {
    /**
     * Create a new Node
     * @param {number} row - The row index
     * @param {number} col - The column index
     */
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.isVisited = false;
        this.isPath = false;
        this.isCurrent = false;
        this.isWeighted = false; // Flag for weighted nodes
        this.obstacleType = null; // Track which obstacle image to use (1 or 2)
        this.distance = Infinity;
        this.previousNode = null;
        this.weight = 1; // Default weight for normal terrain
        this.fScore = Infinity; // For A* algorithm
        this.gScore = Infinity; // For A* algorithm
        this.hScore = 0; // For A* algorithm
        this.element = null; // DOM element reference
    }

    /**
     * Reset the pathfinding properties of the node
     */
    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.isCurrent = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.fScore = Infinity;
        this.gScore = Infinity;
        this.hScore = 0;
    }

    /**
     * Reset all properties of the node
     */
    resetAll() {
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.isWeighted = false;
        this.obstacleType = null;
        this.weight = 1;
        this.reset();
    }

    /**
     * Get the position as a string "row-col"
     * @returns {string} Position string
     */
    getPositionString() {
        return `${this.row}-${this.col}`;
    }

    /**
     * Create a deep clone of this node
     * @returns {Node} A new Node instance with the same properties
     */
    clone() {
        const clonedNode = new Node(this.row, this.col);
        clonedNode.isStart = this.isStart;
        clonedNode.isEnd = this.isEnd;
        clonedNode.isWall = this.isWall;
        clonedNode.isVisited = this.isVisited;
        clonedNode.isPath = this.isPath;
        clonedNode.isCurrent = this.isCurrent;
        clonedNode.distance = this.distance;
        clonedNode.weight = this.weight;
        clonedNode.obstacleType = this.obstacleType;
        return clonedNode;
    }

    /**
     * Get the node status as a string
     * @returns {string} Status string
     */
    getStatus() {
        if (this.isStart) return 'start';
        if (this.isEnd) return 'end';
        if (this.isWall) return 'wall';
        if (this.isPath) return 'path';
        if (this.isCurrent) return 'current';
        if (this.isVisited) return 'visited';
        return '';
    }

    /**
     * Compare this node with another node
     * @param {Node} otherNode - The node to compare with
     * @returns {boolean} True if positions match
     */
    equals(otherNode) {
        return this.row === otherNode.row && this.col === otherNode.col;
    }
} 