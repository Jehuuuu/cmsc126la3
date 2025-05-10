/**
 * GridView class for rendering and interacting with the grid
 */
class GridView {
    /**
     * Create a new GridView
     * @param {Grid} grid - The grid model
     * @param {string} gridContainerId - The ID of the container element
     */
    constructor(grid, gridContainerId = 'grid') {
        this.grid = grid;
        this.gridContainer = document.getElementById(gridContainerId);
        console.log("GridView: Grid container found:", !!this.gridContainer);
        
        if (!this.gridContainer) {
            console.error(`Grid container with ID "${gridContainerId}" not found!`);
            return;
        }
        
        this.isMouseDown = false;
        this.isMovingStart = false;
        this.isMovingEnd = false;
        this.currentTool = 'wall'; // Default tool: wall, start, end, erase
        this.initialize();
    }

    /**
     * Initialize the grid view
     */
    initialize() {
        console.log("GridView: Initializing");
        this.render();
        this.setupEventListeners();
    }

    /**
     * Re-render the grid
     */
    render() {
        console.log("GridView: Rendering grid", this.grid.rows, "x", this.grid.cols);
        
        // Clear the grid container
        if (!this.gridContainer) {
            console.error("Grid container is null, cannot render grid");
            return;
        }
        
        this.gridContainer.innerHTML = '';
        
        // Set grid template based on size
        this.gridContainer.style.gridTemplateColumns = `repeat(${this.grid.cols}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${this.grid.rows}, 1fr)`;
        
        // Create nodes
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                const nodeElement = this.createNodeElement(node);
                
                // Store reference to DOM element in node
                node.element = nodeElement;
                
                this.gridContainer.appendChild(nodeElement);
            }
        }
        
        console.log("GridView: Grid rendered with", this.grid.rows * this.grid.cols, "nodes");
    }

    /**
     * Create a DOM element for a node
     * @param {Node} node - The node model
     * @returns {HTMLElement} The node DOM element
     */
    createNodeElement(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.id = `node-${node.row}-${node.col}`;
        nodeElement.dataset.row = node.row;
        nodeElement.dataset.col = node.col;
        
        // Add status class if any
        const status = node.getStatus();
        if (status) {
            nodeElement.classList.add(status);
        }
        
        return nodeElement;
    }

    /**
     * Set up event listeners for the grid
     */
    setupEventListeners() {
        // Mouse events for the grid
        this.gridContainer.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.gridContainer.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.gridContainer.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.gridContainer.addEventListener('mouseover', this.handleMouseOver.bind(this));
        
        // Prevent default drag behavior
        this.gridContainer.addEventListener('dragstart', (e) => e.preventDefault());
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseDown(event) {
        this.isMouseDown = true;
        
        if (event.target.classList.contains('node')) {
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            const node = this.grid.getNode(row, col);
            
            if (node.isStart) {
                this.isMovingStart = true;
            } else if (node.isEnd) {
                this.isMovingEnd = true;
            } else {
                this.handleNodeClick(row, col);
            }
        }
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp() {
        this.isMouseDown = false;
        this.isMovingStart = false;
        this.isMovingEnd = false;
    }

    /**
     * Handle mouse leave event
     */
    handleMouseLeave() {
        this.isMouseDown = false;
        this.isMovingStart = false;
        this.isMovingEnd = false;
    }

    /**
     * Handle mouse over event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseOver(event) {
        if (!this.isMouseDown) return;
        
        if (event.target.classList.contains('node')) {
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            
            if (this.isMovingStart) {
                this.moveStartNode(row, col);
            } else if (this.isMovingEnd) {
                this.moveEndNode(row, col);
            } else {
                this.handleNodeClick(row, col);
            }
        }
    }

    /**
     * Handle node click based on current tool
     * @param {number} row - Row of the clicked node
     * @param {number} col - Column of the clicked node
     */
    handleNodeClick(row, col) {
        const node = this.grid.getNode(row, col);
        
        // Don't do anything during visualization
        if (node.isVisited || node.isPath) return;
        
        switch (this.currentTool) {
            case 'start':
                this.setStartNode(row, col);
                break;
            case 'end':
                this.setEndNode(row, col);
                break;
            case 'wall':
                this.toggleWall(row, col);
                break;
            case 'erase':
                this.eraseNode(row, col);
                break;
        }
    }

    /**
     * Set a node as the start node
     * @param {number} row - Row of the node
     * @param {number} col - Column of the node
     */
    setStartNode(row, col) {
        // Remove start class from previous start node if it exists
        if (this.grid.startNode && this.grid.startNode.element) {
            this.grid.startNode.element.classList.remove('start');
        }
        
        // Set new start node
        this.grid.setStartNode(row, col);
        
        // Add start class to new start node
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
            nodeElement.className = 'node start';
        }
    }

    /**
     * Set a node as the end node
     * @param {number} row - Row of the node
     * @param {number} col - Column of the node
     */
    setEndNode(row, col) {
        // Remove end class from previous end node if it exists
        if (this.grid.endNode && this.grid.endNode.element) {
            this.grid.endNode.element.classList.remove('end');
        }
        
        // Set new end node
        this.grid.setEndNode(row, col);
        
        // Add end class to new end node
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
            nodeElement.className = 'node end';
        }
    }

    /**
     * Toggle a node's wall state
     * @param {number} row - Row of the node
     * @param {number} col - Column of the node
     */
    toggleWall(row, col) {
        const node = this.grid.getNode(row, col);
        
        // Don't toggle start or end nodes
        if (node.isStart || node.isEnd) return;
        
        // Toggle wall state
        this.grid.toggleWall(row, col);
        
        // Update class
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
            if (node.isWall) {
                nodeElement.classList.add('wall');
            } else {
                nodeElement.classList.remove('wall');
            }
        }
    }

    /**
     * Erase a node (remove wall state)
     * @param {number} row - Row of the node
     * @param {number} col - Column of the node
     */
    eraseNode(row, col) {
        const node = this.grid.getNode(row, col);
        
        // Don't erase start or end nodes
        if (node.isStart || node.isEnd) return;
        
        // Set wall to false
        this.grid.setWall(row, col, false);
        
        // Update class
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
            nodeElement.classList.remove('wall');
        }
    }

    /**
     * Move the start node to a new position
     * @param {number} row - New row
     * @param {number} col - New column
     */
    moveStartNode(row, col) {
        const node = this.grid.getNode(row, col);
        
        // Don't move to end node or wall
        if (node.isEnd || node.isWall) return;
        
        this.setStartNode(row, col);
    }

    /**
     * Move the end node to a new position
     * @param {number} row - New row
     * @param {number} col - New column
     */
    moveEndNode(row, col) {
        const node = this.grid.getNode(row, col);
        
        // Don't move to start node or wall
        if (node.isStart || node.isWall) return;
        
        this.setEndNode(row, col);
    }

    /**
     * Set the current tool
     * @param {string} tool - The tool to set (wall, start, end, erase)
     */
    setCurrentTool(tool) {
        this.currentTool = tool;
    }

    /**
     * Update the view to reflect the current state of the grid
     */
    update() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                const nodeElement = document.getElementById(`node-${row}-${col}`);
                
                if (nodeElement) {
                    // Clear all state classes
                    nodeElement.className = 'node';
                    
                    // Add appropriate classes based on node state
                    if (node.isStart) {
                        nodeElement.classList.add('start');
                    } else if (node.isEnd) {
                        nodeElement.classList.add('end');
                    } else if (node.isWall) {
                        nodeElement.classList.add('wall');
                    } else if (node.isCurrent) {
                        nodeElement.classList.add('current');
                    } else if (node.isPath) {
                        nodeElement.classList.add('path');
                    } else if (node.isVisited) {
                        nodeElement.classList.add('visited');
                    }
                }
            }
        }
    }

    /**
     * Visualize the visited nodes with animation
     * @param {Node[]} visitedNodesInOrder - Nodes in the order they were visited
     * @param {Node[]} path - The final path
     * @param {number} speed - Animation speed in milliseconds
     * @returns {Promise} Promise that resolves when animation is complete
     */
    async visualize(visitedNodesInOrder, path, speed = 10) {
        // Reset node classes except walls, start, and end
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                const nodeElement = document.getElementById(`node-${row}-${col}`);
                
                if (nodeElement && !node.isStart && !node.isEnd && !node.isWall) {
                    nodeElement.classList.remove('visited', 'path', 'current');
                }
            }
        }
        
        // Animate visited nodes
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            // Break animation if we're at the end
            if (i === visitedNodesInOrder.length - 1) break;
            
            const node = visitedNodesInOrder[i];
            const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
            
            if (nodeElement && !node.isStart && !node.isEnd) {
                // Create a small delay between nodes being visited
                await new Promise(resolve => setTimeout(resolve, speed));
                
                nodeElement.classList.add('visited');
            }
        }
        
        // Animate the path after the visited nodes
        await new Promise(resolve => setTimeout(resolve, speed * 2));
        
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
            
            if (nodeElement && !node.isStart && !node.isEnd) {
                await new Promise(resolve => setTimeout(resolve, speed * 3));
                
                nodeElement.classList.remove('visited');
                nodeElement.classList.add('path');
            }
        }
    }

    /**
     * Create mini grid previews for alternative paths
     * @param {Array} paths - Array of path objects
     */
    createPathPreviews(paths) {
        for (let i = 0; i < paths.length; i++) {
            const previewContainer = document.querySelector(`#path-preview-${i + 1} .preview-grid`);
            const pathLengthElement = document.querySelector(`#path-preview-${i + 1} .path-length`);
            
            if (previewContainer && pathLengthElement) {
                // Clear previous preview
                previewContainer.innerHTML = '';
                
                // Set preview grid size
                const previewSize = 10; // 10x10 mini grid
                previewContainer.style.gridTemplateColumns = `repeat(${previewSize}, 1fr)`;
                previewContainer.style.gridTemplateRows = `repeat(${previewSize}, 1fr)`;
                
                // Create mini grid cells
                for (let row = 0; row < previewSize; row++) {
                    for (let col = 0; col < previewSize; col++) {
                        const cell = document.createElement('div');
                        cell.className = 'preview-node';
                        cell.id = `preview-${i + 1}-${row}-${col}`;
                        previewContainer.appendChild(cell);
                    }
                }
                
                // Update path length
                pathLengthElement.textContent = paths[i].distance || 0;
                
                // Draw path if it exists
                if (paths[i].path && paths[i].path.length > 0) {
                    const arrowPath = PathUtils.createArrowPath(paths[i].path, previewSize);
                    
                    // Mark start and end points
                    if (arrowPath.start) {
                        const startCell = document.getElementById(`preview-${i + 1}-${arrowPath.start.row}-${arrowPath.start.col}`);
                        if (startCell) startCell.classList.add('start');
                    }
                    
                    if (arrowPath.end) {
                        const endCell = document.getElementById(`preview-${i + 1}-${arrowPath.end.row}-${arrowPath.end.col}`);
                        if (endCell) endCell.classList.add('end');
                    }
                    
                    // Mark path cells
                    for (const arrow of arrowPath.arrows) {
                        const cell = document.getElementById(`preview-${i + 1}-${arrow.to.row}-${arrow.to.col}`);
                        if (cell) cell.classList.add('path');
                    }
                }
            }
        }
    }
} 