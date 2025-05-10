/**
 * Utility class for path-related operations
 */
class PathUtils {
    /**
     * Get the shortest path from the end node to the start node
     * @param {Node} endNode - The destination node
     * @returns {Node[]} Array of nodes representing the path
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
     * Calculate path distance
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

    /**
     * Generate alternative paths by temporarily removing segments of the optimal path
     * @param {Grid} grid - The grid to find paths in
     * @param {Function} runAlgorithm - The pathfinding algorithm function
     * @returns {Object[]} Array of alternative paths with their information
     */
    static generateAlternativePaths(grid, runAlgorithm) {
        // First, find the optimal path
        const gridClone = grid.clone();
        const result = runAlgorithm(gridClone, false); // Run without visualization
        
        if (!result.path || result.path.length < 3) {
            // No path or path too short for alternatives
            return [{
                path: result.path,
                distance: this.calculatePathDistance(result.path),
                name: 'Optimal'
            }];
        }
        
        // The optimal path
        const optimalPath = result.path;
        const paths = [{
            path: optimalPath,
            distance: this.calculatePathDistance(optimalPath),
            name: 'Optimal'
        }];
        
        // Generate alternatives by temporarily blocking parts of the optimal path
        // We'll skip the start and end nodes
        for (let i = 1; i < optimalPath.length - 1; i++) {
            const pathNode = optimalPath[i];
            const alternateGridClone = grid.clone();
            
            // Block this node to force an alternative path
            const blockNode = alternateGridClone.getNode(pathNode.row, pathNode.col);
            blockNode.isWall = true;
            
            // Run algorithm to find alternative
            const alternateResult = runAlgorithm(alternateGridClone, false);
            
            if (alternateResult.path && alternateResult.path.length > 0) {
                // Check if this path is significantly different from ones we've found
                const altDistance = this.calculatePathDistance(alternateResult.path);
                const altPath = alternateResult.path;
                
                // Check if this path is unique compared to existing ones
                if (this.isPathUnique(altPath, paths.map(p => p.path))) {
                    paths.push({
                        path: altPath,
                        distance: altDistance,
                        name: `Alternative ${paths.length}`
                    });
                }
                
                // Stop if we have enough alternatives
                if (paths.length >= 3) {
                    break;
                }
            }
        }
        
        // If we don't have enough alternatives yet, try blocking multiple nodes
        if (paths.length < 3 && optimalPath.length >= 5) {
            for (let i = 1; i < optimalPath.length - 2; i++) {
                const node1 = optimalPath[i];
                const node2 = optimalPath[i + 1];
                
                const alternateGridClone = grid.clone();
                
                // Block two consecutive nodes
                alternateGridClone.getNode(node1.row, node1.col).isWall = true;
                alternateGridClone.getNode(node2.row, node2.col).isWall = true;
                
                // Run algorithm to find alternative
                const alternateResult = runAlgorithm(alternateGridClone, false);
                
                if (alternateResult.path && alternateResult.path.length > 0) {
                    const altDistance = this.calculatePathDistance(alternateResult.path);
                    const altPath = alternateResult.path;
                    
                    // Check if this path is unique compared to existing ones
                    if (this.isPathUnique(altPath, paths.map(p => p.path))) {
                        paths.push({
                            path: altPath,
                            distance: altDistance,
                            name: `Alternative ${paths.length}`
                        });
                    }
                    
                    // Stop if we have enough alternatives
                    if (paths.length >= 3) {
                        break;
                    }
                }
            }
        }
        
        // Fill with duplicates if we still don't have 3 paths
        while (paths.length < 3) {
            const lastPath = {...paths[paths.length - 1]};
            lastPath.name = `Alternative ${paths.length} (Not found)`;
            paths.push(lastPath);
        }
        
        return paths;
    }

    /**
     * Check if a path is significantly different from other paths
     * @param {Node[]} path - The path to check
     * @param {Node[][]} existingPaths - Array of existing paths to compare against
     * @returns {boolean} True if the path is unique
     */
    static isPathUnique(path, existingPaths) {
        // If path is empty or very short, it's not unique
        if (!path || path.length < 2) return false;
        
        for (const existingPath of existingPaths) {
            // Skip comparison with empty paths
            if (!existingPath || existingPath.length < 2) continue;
            
            // Calculate how many nodes are different
            let differentNodes = 0;
            const minLength = Math.min(path.length, existingPath.length);
            const maxLength = Math.max(path.length, existingPath.length);
            
            // Count differing nodes in the overlapping part
            for (let i = 1; i < minLength - 1; i++) { // Skip start and end
                if (!path[i].equals(existingPath[i])) {
                    differentNodes++;
                }
            }
            
            // Count extra nodes in the longer path
            differentNodes += (maxLength - minLength);
            
            // If less than 20% different or fewer than 2 nodes different, consider not unique
            const uniqueThreshold = Math.max(2, Math.floor(maxLength * 0.2));
            if (differentNodes < uniqueThreshold) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Create a simple arrow path visualization for mini-grids
     * @param {Node[]} path - The path to visualize
     * @param {number} gridSize - Size of the mini-grid
     * @returns {Object} Arrow path information for the mini-grid
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