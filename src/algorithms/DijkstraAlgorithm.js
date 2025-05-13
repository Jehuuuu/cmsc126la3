/**
 * Implementation of Dijkstra's Algorithm for pathfinding
 */
class DijkstraAlgorithm extends Algorithm {
    /**
     * Create a new Dijkstra algorithm instance
     * @param {Grid} grid - The grid to run the algorithm on
     */
    constructor(grid) {
        super(grid);
    }

    /**
     * Run Dijkstra's algorithm
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
        
        // Initialize priority queue with start node
        const unvisitedNodes = new PriorityQueue();
        
        // Add start node to open set
        this.grid.startNode.inOpenSet = true;
        unvisitedNodes.enqueue(this.grid.startNode);
        
        let pathFound = false;
        
        // Continue until queue is empty or end node is found
        while (!unvisitedNodes.isEmpty() && !this.shouldStop) {
            // Get node with smallest distance
            const currentNode = unvisitedNodes.dequeue();
            
            // Mark as no longer in open set
            currentNode.inOpenSet = false;
            
            // Skip if already visited (should not happen with proper queue updates)
            if (this.hasNodeBeenVisited(currentNode)) {
                continue;
            }
            
            // Check if node is a wall
            if (currentNode.isWall) {
                continue;
            }
            
            // Check if we can't reach any more nodes
            if (currentNode.distance === Infinity) {
                break;
            }
            
            // Mark as visited
            this.markNodeAsVisited(currentNode);
            
            // Check if we've reached the end
            if (currentNode === this.grid.endNode) {
                pathFound = true;
                
                // Early termination - we found the shortest path
                break;
            }
            
            // Update distances to neighbors
            this.updateNeighbors(currentNode, unvisitedNodes);
        }
        
        // Get the final path
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
            
            // Calculate the new potential distance
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
                    // Just update the existing node in the queue
                    unvisitedNodes.update(neighbor);
                }
            }
        }
    }

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