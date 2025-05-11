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
        this.gridContainerId = gridContainerId;
        this.gridContainer = document.getElementById(gridContainerId);
        console.log(`GridView: Grid container '${gridContainerId}' found:`, !!this.gridContainer);
        
        if (!this.gridContainer) {
            console.error(`Grid container with ID "${gridContainerId}" not found!`);
            return;
        }
        
        this.isMouseDown = false;
        this.isMovingStart = false;
        this.isMovingEnd = false;
        this.currentTool = 'wall'; // Default tool: wall, start, end, erase
        this.gridIndex = gridContainerId.includes('dijkstra') ? 0 : 1; // Get grid index based on ID
        this.animationTimeouts = []; // Store animation timeouts for cancellation
        this.initialize();
    }

    /**
     * Initialize the grid view
     */
    initialize() {
        console.log(`GridView (${this.gridContainerId}): Initializing`);
        this.render();
        this.setupEventListeners();
    }

    /**
     * Re-render the grid
     */
    render() {
        console.log(`GridView (${this.gridContainerId}): Rendering grid`, this.grid.rows, "x", this.grid.cols);
        
        // Clear the grid container
        if (!this.gridContainer) {
            console.error(`Grid container '${this.gridContainerId}' is null, cannot render grid`);
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
        
        console.log(`GridView (${this.gridContainerId}): Grid rendered with`, this.grid.rows * this.grid.cols, "nodes");
    }

    /**
     * Create a DOM element for a node
     * @param {Node} node - The node model
     * @returns {HTMLElement} The node DOM element
     */
    createNodeElement(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.id = `${this.gridContainerId}-node-${node.row}-${node.col}`;
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
        
        // Touch events for mobile
        this.gridContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.gridContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.gridContainer.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
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
     * Handle touch start event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchStart(event) {
        // Prevent scrolling when interacting with the grid
        event.preventDefault();
        
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.classList.contains('node')) {
            this.isMouseDown = true;
            
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            const node = this.grid.getNode(row, col);
            
            if (node.isStart) {
                this.isMovingStart = true;
            } else if (node.isEnd) {
                this.isMovingEnd = true;
            } else {
                this.handleNodeClick(row, col);
            }
            
            // Add visual feedback
            target.classList.add('touch-active');
        }
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchMove(event) {
        // Only prevent default if we're interacting with the grid
        if (this.isMouseDown) {
            event.preventDefault();
        }
        
        if (!this.isMouseDown) return;
        
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.classList.contains('node')) {
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            
            // Remove touch-active class from all nodes
            const activeNodes = this.gridContainer.querySelectorAll('.touch-active');
            activeNodes.forEach(node => node.classList.remove('touch-active'));
            
            // Add touch-active class to current node
            target.classList.add('touch-active');
            
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
     * Handle touch end event
     */
    handleTouchEnd() {
        this.isMouseDown = false;
        this.isMovingStart = false;
        this.isMovingEnd = false;
        
        // Remove touch-active class from all nodes
        const activeNodes = this.gridContainer.querySelectorAll('.touch-active');
        activeNodes.forEach(node => node.classList.remove('touch-active'));
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
        
        // Always use global gameController if available to sync grids
        const gameController = window.gameController;
        
        if (gameController) {
            console.log(`GridView (${this.gridContainerId}): Calling gameController with action ${this.currentTool}`);
            
            // Map the current tool to the right action
            let action = this.currentTool;
            
            // Special case for wall tool - use toggleWall
            if (action === 'wall') {
                gameController.handleNodeAction(this.gridIndex, row, col, 'toggleWall');
            } else {
                gameController.handleNodeAction(this.gridIndex, row, col, action);
            }
            return;
        }
        
        // Fallback to direct modification if game controller not available
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
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
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
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
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
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
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
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
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
        
        // Update all grids via the game controller if it exists
        const gameController = window.gameController;
        if (gameController) {
            console.log(`GridView (${this.gridContainerId}): Moving start node to (${row}, ${col})`);
            gameController.handleNodeAction(this.gridIndex, row, col, 'start');
            return;
        }
        
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
        
        // Update all grids via the game controller if it exists
        const gameController = window.gameController;
        if (gameController) {
            console.log(`GridView (${this.gridContainerId}): Moving end node to (${row}, ${col})`);
            gameController.handleNodeAction(this.gridIndex, row, col, 'end');
            return;
        }
        
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
                const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
                
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
     * Stop any ongoing animations
     */
    stopAnimation() {
        // Clear all animation timeouts
        if (this.animationTimeouts && this.animationTimeouts.length > 0) {
            this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
            this.animationTimeouts = [];
        }
    }

    /**
     * Visualize the algorithm execution
     * @param {Array} visitedNodesInOrder - Array of nodes visited in order
     * @param {Array} pathNodesInOrder - Array of nodes in the final path
     * @param {number} speed - Delay between animations in ms
     * @returns {Promise} - Resolves when animation is complete
     */
    visualize(visitedNodesInOrder, pathNodesInOrder, speed = 20) {
        // Clear any previous animations
        this.stopAnimation();
        
        return new Promise((resolve) => {
            // First animate visited nodes
            for (let i = 0; i <= visitedNodesInOrder.length; i++) {
                if (i === visitedNodesInOrder.length) {
                    // When visited nodes animation is done, animate the path
                    const timeout = setTimeout(() => {
                        this.animatePath(pathNodesInOrder, speed, resolve);
                    }, speed * i);
                    this.animationTimeouts.push(timeout);
                    return;
                }
                
                const node = visitedNodesInOrder[i];
                const timeout = setTimeout(() => {
                    if (!node.isStart && !node.isEnd) {
                        node.isVisited = true;
                        node.isPath = false;
                        this.update();
                    }
                }, speed * i);
                this.animationTimeouts.push(timeout);
            }
            
            // If no nodes to visit, resolve immediately
            resolve();
        });
    }
    
    /**
     * Animate the path part of the visualization
     * @param {Array} pathNodesInOrder - Array of nodes in the final path
     * @param {number} speed - Delay between animations in ms
     * @param {Function} resolve - Promise resolve function
     */
    animatePath(pathNodesInOrder, speed, resolve) {
        for (let i = 0; i < pathNodesInOrder.length; i++) {
            const node = pathNodesInOrder[i];
            const timeout = setTimeout(() => {
                if (!node.isStart && !node.isEnd) {
                    node.isPath = true;
                    this.update();
                }
                
                // Resolve the promise when the animation is complete
                if (i === pathNodesInOrder.length - 1) {
                    resolve();
                }
            }, speed * i);
            this.animationTimeouts.push(timeout);
        }
        
        // If no path nodes, resolve immediately
        if (pathNodesInOrder.length === 0) {
            resolve();
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