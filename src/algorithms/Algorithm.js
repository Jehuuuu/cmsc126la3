/**
 * Base Algorithm class for pathfinding algorithms
 * Provides common functionality and interface for all pathfinding implementations
 */
class Algorithm {
    /**
     * Create a new algorithm instance
     * @param {Grid} grid - The grid to run the algorithm on
     */
    constructor(grid) {
        this.grid = grid;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.isRunning = false;
        this.shouldStop = false;
        this.visitedNodes = new Set(); // For efficiently checking if a node has been visited
    }

    /**
     * Initialize the algorithm before running
     * Resets all nodes and algorithm state
     * @returns {boolean} True if initialization was successful
     */
    initialize() {
        if (!this.grid || !this.grid.startNode || !this.grid.endNode) {
            return false;
        }
        
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.visitedNodes.clear();
        this.isRunning = false;
        this.shouldStop = false;
        
        // Reset all nodes in the grid
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.grid.nodes[row][col].reset();
            }
        }
        
        // Set distance of start node to 0
        this.grid.startNode.distance = 0;
        
        return true;
    }

    /**
     * Run the algorithm - must be implemented by subclasses
     * @param {boolean} visualize - Whether to return visited nodes for visualization
     * @returns {Object} Object containing visited nodes, path nodes and whether path was found
     */
    run(visualize = true) {
        throw new Error('Method run() must be implemented by subclasses');
    }

    /**
     * Stop the algorithm if it's running
     */
    stop() {
        this.shouldStop = true;
    }

    /**
     * Check if the algorithm is currently running
     * @returns {boolean} True if the algorithm is running
     */
    isAlgorithmRunning() {
        return this.isRunning;
    }

    // Node visiting and tracking methods

    /**
     * Check if a node has been visited
     * @param {Node} node - The node to check
     * @returns {boolean} True if the node has been visited
     */
    hasNodeBeenVisited(node) {
        return this.visitedNodes.has(node.getPositionString());
    }

    /**
     * Mark a node as visited and add it to the visited list
     * @param {Node} node - The node to mark as visited
     */
    markNodeAsVisited(node) {
        node.isVisited = true;
        this.visitedNodesInOrder.push(node);
        this.visitedNodes.add(node.getPositionString());
    }

    // Path and results methods

    /**
     * Get the path from start to end
     * @returns {Node[]} Array of nodes in the path
     */
    getPath() {
        return PathUtils.getShortestPath(this.grid.endNode);
    }

    /**
     * Get all visited nodes in the order they were visited
     * @returns {Node[]} Array of visited nodes
     */
    getVisitedNodesInOrder() {
        return this.visitedNodesInOrder;
    }

    // Visualization methods

    /**
     * Update visualization for step-by-step mode
     * Shows visited nodes up to the current step
     * @param {number} currentStep - Current step index
     */
    updateProgress(currentStep) {
        // Clear previous visualization
        if (this.grid) {
            this.grid.resetPath();
        }
        
        // Visualize all nodes visited up to current step
        for (let i = 0; i <= currentStep && i < this.visitedNodesInOrder.length; i++) {
            this.visitedNodesInOrder[i].isVisited = true;
        }
        
        // Mark current node
        if (currentStep < this.visitedNodesInOrder.length) {
            const currentNode = this.visitedNodesInOrder[currentStep];
            currentNode.isCurrent = true;
        }
    }

    // Alias for backward compatibility with older code
    updateStep(currentStep) {
        this.updateProgress(currentStep);
    }
} 