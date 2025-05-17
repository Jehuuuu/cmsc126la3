/**
 * Implementation of Dijkstra's Algorithm for pathfinding
 * 
 * Dijkstra's algorithm systematically explores a graph by always visiting
 * the unvisited node with the smallest known distance from the start node.
 * It guarantees the shortest path in weighted graphs where all weights are non-negative.
 */
class DijkstraAlgorithm extends Algorithm {
    /**
     * Create a new Dijkstra algorithm instance
     * @param {Grid} grid - The grid to run the algorithm on
     */
    constructor(grid) {
        super(grid);
    }

    // Core algorithm methods

    /**
     * Run Dijkstra's algorithm to find the shortest path
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
        
        // Create priority queue for unvisited nodes (sorted by distance)
        const unvisitedNodes = this.createPriorityQueue();
        
        // Add start node to queue
        this.grid.startNode.inOpenSet = true;
        unvisitedNodes.enqueue(this.grid.startNode);
        
        let pathFound = false;
        
        // Continue until queue is empty, end node is found, or algorithm is stopped
        while (!unvisitedNodes.isEmpty() && !this.shouldStop) {
            // Get node with smallest distance
            const currentNode = unvisitedNodes.dequeue();
            
            // Mark as no longer in queue
            currentNode.inOpenSet = false;
            
            // Skip if already visited or if node is a wall
            if (this.hasNodeBeenVisited(currentNode) || currentNode.isWall) {
                continue;
            }
            
            // If current distance is infinity, no more reachable nodes exist
            if (currentNode.distance === Infinity) {
                break; // No path exists to the target
            }
            
            // Mark as visited
            this.markNodeAsVisited(currentNode);
            
            // Check if we've reached the end
            if (currentNode === this.grid.endNode) {
                pathFound = true;
                break; // Early termination - we found the shortest path
            }
            
            // Update distances to neighbors
            this.updateNeighbors(currentNode, unvisitedNodes);
        }
        
        // Reconstruct the path if found
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
     * Update distances to neighbors of a node
     * @param {Node} node - The current node
     * @param {PriorityQueue} unvisitedNodes - Priority queue of unvisited nodes
     */
    updateNeighbors(node, unvisitedNodes) {
        const neighbors = this.grid.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            // Skip if already visited
            if (this.hasNodeBeenVisited(neighbor)) {
                continue;
            }
            
            // Calculate the new potential distance through current node
            const newDistance = node.distance + neighbor.weight;
            
            // Update if new distance is shorter
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.previousNode = node;
                
                // Add or update in priority queue
                if (!neighbor.inOpenSet) {
                    neighbor.inOpenSet = true;
                    unvisitedNodes.enqueue(neighbor);
                } else {
                    // Update the existing node's priority in the queue
                    unvisitedNodes.update(neighbor);
                }
            }
        }
    }
    
    // Helper methods
    
    /**
     * Creates a priority queue for Dijkstra's algorithm
     * Nodes are sorted by their distance from the start node
     * @returns {PriorityQueue} Priority queue configured for Dijkstra's algorithm
     */
    createPriorityQueue() {
        // In Dijkstra's algorithm, we simply sort by distance
        // The PriorityQueue defaults to sort by 'distance' if no comparator is provided
        return new PriorityQueue((a, b) => a.distance - b.distance);
    }

    // Static information methods
    
    /**
     * Get the algorithm name
     * @returns {string} The name of the algorithm
     */
    static getName() {
        return "Dijkstra's Algorithm";
    }

    /**
     * Get a description of the algorithm
     * @returns {string} Description of the algorithm
     */
    static getDescription() {
        return "Dijkstra's algorithm is a weighted graph algorithm that guarantees the shortest path. It works by visiting the node with the smallest known distance first, then updating distances to its neighbors.";
    }
} 