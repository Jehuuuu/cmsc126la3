/**
 * Base Algorithm class for pathfinding algorithms
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
     * Initialize the algorithm
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
        
        // Reset all nodes
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
     * Run the algorithm
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
     * Check if the algorithm is running
     * @returns {boolean} True if the algorithm is running
     */
    isAlgorithmRunning() {
        return this.isRunning;
    }

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

    /**
     * Update progress for step-by-step visualization
     * @param {number} currentStep - Current step index
     */
    updateStep(currentStep) {
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
} 