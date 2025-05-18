/**
 * Implementation of A* Algorithm for pathfinding
 * 
 * A* combines Dijkstra's algorithm with a heuristic to guide its search.
 * It prioritizes nodes that appear to be closer to the goal based on a heuristic estimate.
 */
class AStarAlgorithm extends Algorithm {
    //=============================================================================
    // INITIALIZATION
    //=============================================================================
    
    /**
     * Create a new A* algorithm instance
     * @param {Grid} grid - The grid to run the algorithm on
     */
    constructor(grid) {
        super(grid);
    }
    
    /**
     * Initialize the algorithm before running
     * Extends the base initialization with A*-specific properties (gScore and fScore)
     * @returns {boolean} True if initialization was successful
     */
    initialize() {
        if (!super.initialize()) {
            return false;
        }

        // Set start node properties
        this.grid.startNode.gScore = 0;
        this.grid.startNode.fScore = this.calculateHeuristic(this.grid.startNode, this.grid.endNode);
        
        return true;
    }
    
    //=============================================================================
    // ALGORITHM EXECUTION
    //=============================================================================

    /**
     * Run A* algorithm to find the shortest path
     * @param {boolean} visualize - Whether to return visited nodes for visualization
     * @returns {Object} Object containing visited nodes, path nodes and whether path was found
     */
    run(visualize = true) {
        // Initialize algorithm
        if (!this.initialize()) {
            return { 
                visited: [], 
                path: [], 
                pathFound: false 
            };
        }

        this.isRunning = true;
        
        // Create priority queue with custom comparison for A*
        const openSet = this.createPriorityQueue();
        
        // Add start node to open set
        this.grid.startNode.inOpenSet = true;
        openSet.enqueue(this.grid.startNode);
        
        let pathFound = false;
        
        // Continue until queue is empty or algorithm is stopped
        while (!openSet.isEmpty() && !this.shouldStop) {
            // Get node with lowest fScore
            const currentNode = openSet.dequeue();
            
            // Mark as no longer in open set
            currentNode.inOpenSet = false;
            
            // Skip if already visited or if node is a wall
            if (this.hasNodeBeenVisited(currentNode) || currentNode.isWall) {
                continue;
            }
            
            // Mark as visited
            this.markNodeAsVisited(currentNode);
            
            // If we've reached the end node
            if (currentNode === this.grid.endNode) {
                pathFound = true;
                break; // Early termination - we found the shortest path
            }
            
            // Update neighbors
            this.updateNeighbors(currentNode, openSet);
        }
        
        // Get the final path if a path was found
        if (pathFound) {
            this.pathNodesInOrder = PathUtils.getShortestPath(this.grid.endNode);
        }
        
        this.isRunning = false;
        
        return {
            visited: visualize ? this.visitedNodesInOrder : [],
            path: this.pathNodesInOrder,
            pathFound
        };
    }

    /**
     * Update neighbors of a node
     * @param {Node} node - The current node
     * @param {PriorityQueue} openSet - Priority queue of nodes to visit
     */
    updateNeighbors(node, openSet) {
        const neighbors = this.grid.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            // Skip if already visited
            if (this.hasNodeBeenVisited(neighbor)) {
                continue;
            }
            
            // Calculate tentative gScore (distance from start through current node)
            const tentativeGScore = node.gScore + neighbor.weight;
            
            // If we found a better path to this neighbor
            if (tentativeGScore < neighbor.gScore) {
                // Update neighbor with new best path
                neighbor.previousNode = node;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = tentativeGScore + this.calculateHeuristic(neighbor, this.grid.endNode);
                
                // Add to open set if not already there
                if (!neighbor.inOpenSet) {
                    neighbor.inOpenSet = true;
                    openSet.enqueue(neighbor);
                } else {
                    // Update the existing node in the queue with new priority
                    openSet.update(neighbor);
                }
            }
        }
    }
    
    //=============================================================================
    // HELPER METHODS
    //=============================================================================
    
    /**
     * Creates a priority queue for the A* algorithm
     * Uses fScore as primary sorting key with a tie-breaking mechanism
     * @returns {PriorityQueue} Configured priority queue
     */
    createPriorityQueue() {
        return new PriorityQueue((a, b) => {
            // First compare by fScore
            const fScoreDiff = a.fScore - b.fScore;
            if (fScoreDiff !== 0) return fScoreDiff;
            
            // If fScores are equal, break tie by preferring lower hScore
            // This helps create straighter paths and avoids the "diagonal shimmy" effect
            return this.calculateHeuristic(a, this.grid.endNode) - 
                  this.calculateHeuristic(b, this.grid.endNode);
        });
    }

    /**
     * Calculate the heuristic distance from a node to the end node
     * 
     * Uses Manhattan distance (sum of horizontal and vertical distances)
     * which is admissible (never overestimates) for grid movement where
     * diagonal movement is not allowed or costs more than cardinal movement.
     * 
     * @param {Node} node - Current node
     * @param {Node} endNode - Target node
     * @returns {number} Heuristic value
     */
    calculateHeuristic(node, endNode) {
        // Manhattan distance: optimal for 4-directional grids
        return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
    }

    //=============================================================================
    // STATIC INFORMATION
    //=============================================================================
    
    /**
     * Get the algorithm name
     * @returns {string} The name of the algorithm
     */
    static getName() {
        return "A* Algorithm";
    }

    /**
     * Get a description of the algorithm
     * @returns {string} Description of the algorithm
     */
    static getDescription() {
        return "A* is an informed search algorithm that uses a heuristic to guide its search. It finds the shortest path while typically exploring fewer nodes than Dijkstra's algorithm.";
    }
} 