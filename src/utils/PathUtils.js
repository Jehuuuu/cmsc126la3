/**
 * PathUtils.js
 * Utility class for path-related operations in pathfinding algorithms
 */

//=============================================================================
// PATH UTILITIES
//=============================================================================

class PathUtils {
    //=============================================================================
    // PATH CALCULATION
    //=============================================================================
    
    /**
     * Get the shortest path from the end node to the start node by backtracking
     * @param {Node} endNode - The destination node
     * @returns {Node[]} Array of nodes representing the path from start to end
     */
    static getShortestPath(endNode) {
        if (!endNode || !endNode.previousNode) {
            return [];
        }
        
        const path = [];
        let currentNode = endNode;
        
        // Start from the end and follow previousNode links
        while (currentNode) {
            path.unshift(currentNode); // Add to front of array
            
            // Stop if we reach the start node (which doesn't have a previousNode)
            if (!currentNode.previousNode) {
                break;
            }
            currentNode = currentNode.previousNode;
        }
        
        return path;
    }

    /**
     * Calculate path distance by summing the weights of all nodes in the path
     * @param {Node[]} path - Array of nodes in the path
     * @returns {number} Total path distance
     */
    static calculatePathDistance(path) {
        if (!path || path.length < 2) return 0;
        
        let distance = 0;
        for (let i = 1; i < path.length; i++) {
            distance += path[i].weight;
        }
        
        return distance;
    }

    //=============================================================================
    // VISUALIZATION UTILITIES
    //=============================================================================

    /**
     * Create a simple arrow path visualization for mini-grids
     * Scales the main grid path to fit in a smaller preview grid
     * 
     * @param {Node[]} path - The path to visualize
     * @param {number} gridSize - Size of the mini-grid (e.g., 10 for a 10x10 grid)
     * @returns {Object} Object containing start, end, and arrow points for the mini-grid
     */
    static createArrowPath(path, gridSize) {
        if (!path || path.length < 2) {
            return { start: null, end: null, arrows: [] };
        }
        
        // Calculate the ratio to scale from main grid to mini grid
        const rowScale = gridSize / Math.max(path[0].row, path[path.length - 1].row + 1, 10);
        const colScale = gridSize / Math.max(path[0].col, path[path.length - 1].col + 1, 10);
        
        // Get start and end positions
        const start = {
            row: Math.floor(path[0].row * rowScale),
            col: Math.floor(path[0].col * colScale)
        };
        
        const end = {
            row: Math.floor(path[path.length - 1].row * rowScale),
            col: Math.floor(path[path.length - 1].col * colScale)
        };
        
        // Generate arrow points for the path
        const arrows = [];
        for (let i = 1; i < path.length; i++) {
            const from = path[i - 1];
            const to = path[i];
            
            arrows.push({
                from: {
                    row: Math.floor(from.row * rowScale),
                    col: Math.floor(from.col * colScale)
                },
                to: {
                    row: Math.floor(to.row * rowScale),
                    col: Math.floor(to.col * colScale)
                }
            });
        }
        
        return { start, end, arrows };
    }
} 