/**
 * GridView class for rendering and interacting with the grid
 */
class GridView {
    // Static property to share across all GridView instances
    static sharedTilesetMap = new Map();
    static sharedObstacleMap = new Map();
    
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
        
        // Store a reference to the global gameController
        this.gameController = window.gameController;
        
        // Tileset configuration
        this.tileVariations = 4; // Number of different tile variations (can adjust based on your tileset)
        this.tilesetWidth = 32; // Width of a single tile in the tileset (adjust to match)
        this.tilesetHeight = 32; // Height of a single tile in the tileset (adjust to match)
        
        // Available tilesets
        this.tilesets = [
            'src/assets/images/tileset.png',
            'src/assets/images/tileset2.png',
            'src/assets/images/tileset3.png',
            'src/assets/images/tileset4.png'
        ];
        
        // Available obstacles
        this.obstacles = [
            'src/assets/images/obstacle1.png'
        ];
        
        // Use the shared tileset map instead of a local one
        // This ensures both grids have the same tile randomization pattern
        
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
        
        // Initialize the nodeElements 2D array
        this.nodeElements = [];
        for (let row = 0; row < this.grid.rows; row++) {
            this.nodeElements[row] = [];
        }
        
        // Create nodes
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                const nodeElement = this.createNodeElement(node, row, col);
                
                // Store reference to DOM element in node
                node.element = nodeElement;
                
                // Store reference to DOM element in our 2D array
                this.nodeElements[row][col] = nodeElement;
                
                this.gridContainer.appendChild(nodeElement);
            }
        }
        
        console.log(`GridView (${this.gridContainerId}): Grid rendered with`, this.grid.rows * this.grid.cols, "nodes");
    }

    /**
     * Create a DOM element for a node
     * @param {Node} node - The node model
     * @param {number} row - The row position
     * @param {number} col - The column position
     * @returns {HTMLElement} The node DOM element
     */
    createNodeElement(node, row, col) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.id = `${this.gridContainerId}-node-${node.row}-${node.col}`;
        nodeElement.dataset.row = node.row;
        nodeElement.dataset.col = node.col;
        
        // Add tileset variation for visual diversity
        nodeElement.style.backgroundSize = '100% 100%';
        nodeElement.style.backgroundRepeat = 'no-repeat';
        
        // Get random tileset for this node position
        const tilesetIndex = this.getTilesetIndex(row, col);
        
        // For variation, we can still use position-based pseudorandom to prevent
        // variations from changing when node states change
        const tileVariation = this.getTileVariation(row, col);
        
        // Apply both the tileset and variation
        this.applyTileVariation(nodeElement, tileVariation, tilesetIndex);
        
        // Store variation and tileset index for later reference
        nodeElement.dataset.tileVariation = tileVariation;
        nodeElement.dataset.tilesetIndex = tilesetIndex;
        
        // If this is a wall, get obstacle type
        if (node.isWall) {
            const obstacleIndex = this.getObstacleIndex(row, col);
            nodeElement.dataset.obstacleIndex = obstacleIndex;
        }
        
        // Add status class if any
        const status = node.getStatus();
        if (status) {
            nodeElement.classList.add(status);
        }
        
        return nodeElement;
    }
    
    /**
     * Generate a deterministic but visually random tile variation based on position
     * @param {number} row - The row of the node
     * @param {number} col - The column of the node
     * @returns {number} A value between 0 and tileVariations-1
     */
    getTileVariation(row, col) {
        // Use a simple hash function of the coordinates
        // This ensures the same position gets the same variation
        // but adjacent tiles tend to get different variations
        const hash = (row * 31 + col * 17) % this.tileVariations;
        return hash;
    }
    
    /**
     * Get tileset index for a node based on position
     * @param {number} row - The row of the node
     * @param {number} col - The column of the node
     * @returns {number} The index of the tileset to use
     */
    getTilesetIndex(row, col) {
        const nodeKey = `${row}-${col}`;
        
        // If this node already has an assigned tileset in the shared map, use it
        if (GridView.sharedTilesetMap.has(nodeKey)) {
            return GridView.sharedTilesetMap.get(nodeKey);
        }
        
        // Assign a completely random tileset for this position
        const randomIndex = Math.floor(Math.random() * this.tilesets.length);
        GridView.sharedTilesetMap.set(nodeKey, randomIndex);
        return randomIndex;
    }
    
    /**
     * Get obstacle index for a node based on position
     * @param {number} row - The row of the node
     * @param {number} col - The column of the node
     * @returns {number} The index of the obstacle to use
     */
    getObstacleIndex(row, col) {
        const nodeKey = `${row}-${col}`;
        
        // If this node already has an assigned obstacle in the shared map, use it
        if (GridView.sharedObstacleMap.has(nodeKey)) {
            return GridView.sharedObstacleMap.get(nodeKey);
        }
        
        // Assign a completely random obstacle for this position
        const randomIndex = Math.floor(Math.random() * this.obstacles.length);
        GridView.sharedObstacleMap.set(nodeKey, randomIndex);
        return randomIndex;
    }
    
    /**
     * Apply a specific tile variation to a node element
     * @param {HTMLElement} nodeElement - The DOM element of the node
     * @param {number} variation - The variation index to apply
     * @param {number} tilesetIndex - The index of the tileset to use
     */
    applyTileVariation(nodeElement, variation, tilesetIndex = 0) {
        // Set background image to the selected tileset
        nodeElement.style.backgroundImage = `url('${this.tilesets[tilesetIndex]}')`;
        nodeElement.style.backgroundPosition = `0% 0%`;
        
        // Store the variation and tileset for later reference
        nodeElement.dataset.tileVariation = variation;
        nodeElement.dataset.tilesetIndex = tilesetIndex;
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
     * Handle node click
     * @param {number} row - Row of the clicked node
     * @param {number} col - Column of the clicked node
     */
    handleNodeClick(row, col) {
        const node = this.grid.getNode(row, col);
        
        if (!node || node.isStart || node.isEnd) {
            return;
        }
        
        // Get the gameController from either instance property or global reference
        const gameController = this.gameController || window.gameController;
        
        if (!gameController) {
            console.error("GridView: No gameController found, cannot handle node action");
            return;
        }
        
        if (this.currentTool === 'weighted') {
            // Show the weight selection modal
            const weightModal = document.getElementById('weight-modal');
            const weightInput = document.getElementById('weight-input');
            const confirmBtn = document.getElementById('confirm-weight-btn');
            const cancelBtn = document.getElementById('cancel-weight-btn');
            const closeBtn = weightModal.querySelector('.close-btn');
            
            // Default to current value if node is already weighted
            weightInput.value = node.isWeighted ? node.weight : 2;
            
            // Show modal
            weightModal.style.display = 'block';
            weightInput.focus();
            
            // Function to confirm weight
            const confirmWeight = () => {
                const weight = parseInt(weightInput.value);
                if (weight >= 2 && weight <= 10) {
                    gameController.handleNodeAction(this.gridIndex, row, col, 'weighted', weight);
                }
                weightModal.style.display = 'none';
                
                // Clean up event listeners
                confirmBtn.removeEventListener('click', confirmWeight);
                cancelBtn.removeEventListener('click', cancelAction);
                closeBtn.removeEventListener('click', cancelAction);
                document.removeEventListener('keydown', handleKeydown);
            };
            
            // Function to cancel
            const cancelAction = () => {
                weightModal.style.display = 'none';
                
                // Clean up event listeners
                confirmBtn.removeEventListener('click', confirmWeight);
                cancelBtn.removeEventListener('click', cancelAction);
                closeBtn.removeEventListener('click', cancelAction);
                document.removeEventListener('keydown', handleKeydown);
            };
            
            // Function to handle keyboard events
            const handleKeydown = (e) => {
                if (e.key === 'Enter') {
                    confirmWeight();
                } else if (e.key === 'Escape') {
                    cancelAction();
                }
            };
            
            // Add event listeners
            confirmBtn.addEventListener('click', confirmWeight);
            cancelBtn.addEventListener('click', cancelAction);
            closeBtn.addEventListener('click', cancelAction);
            document.addEventListener('keydown', handleKeydown);
        } else {
            // Handle other tools
            const action = this.currentTool === 'wall' ? 'toggleWall' : this.currentTool;
            gameController.handleNodeAction(this.gridIndex, row, col, action);
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
            
            // Remove any existing start image overlay
            const existingStartImg = this.grid.startNode.element.querySelector('.start-overlay');
            if (existingStartImg) {
                this.grid.startNode.element.removeChild(existingStartImg);
            }
        }
        
        // Set new start node
        this.grid.setStartNode(row, col);
        
        // Add start class to new start node
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
        if (nodeElement) {
            // Preserve the tileset and variation when changing node state
            const variation = nodeElement.dataset.tileVariation || 0;
            const tilesetIndex = nodeElement.dataset.tilesetIndex || 0;
            
            nodeElement.className = 'node start';
            this.applyTileVariation(nodeElement, variation, tilesetIndex);
            
            // Add start.png overlay
            // Get absolute URL for the start image
            const startUrl = 'src/assets/images/start.png';
            
            try {
                // Create a new img element for the start icon
                const startImg = document.createElement('img');
                startImg.src = startUrl;
                startImg.alt = 'Start Node';
                startImg.className = 'start-overlay';
                
                // Set inline styles for the start image overlay
                startImg.style.cssText = `
                    position: absolute;
                    top: 15%;
                    left: 15%;
                    width: 70%;
                    height: 70%;
                    z-index: 10;
                    pointer-events: none;
                    object-fit: contain;
                `;
                
                // Add error handling
                startImg.onerror = function() {
                    console.error(`ERROR: Failed to load start image at (${row}, ${col})`);
                };
                
                // Add the start image on top of the node
                nodeElement.style.position = 'relative'; // Ensure the absolute positioning works
                nodeElement.appendChild(startImg);
                
                console.log(`Added start image to node at (${row}, ${col})`);
            } catch (error) {
                console.error('Error adding start image:', error);
            }
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
            
            // Remove any existing end image overlay
            const existingEndImg = this.grid.endNode.element.querySelector('.end-overlay');
            if (existingEndImg) {
                this.grid.endNode.element.removeChild(existingEndImg);
            }
        }
        
        // Set new end node
        this.grid.setEndNode(row, col);
        
        // Add end class to new end node
        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
        if (nodeElement) {
            // Preserve the tileset and variation when changing node state
            const variation = nodeElement.dataset.tileVariation || 0;
            const tilesetIndex = nodeElement.dataset.tilesetIndex || 0;
            
            nodeElement.className = 'node end';
            this.applyTileVariation(nodeElement, variation, tilesetIndex);
            
            // Add end.png overlay
            // Get URL for the end image
            const endUrl = 'src/assets/images/end.png';
            
            try {
                // Create a new img element for the end icon
                const endImg = document.createElement('img');
                endImg.src = endUrl;
                endImg.alt = 'End Node';
                endImg.className = 'end-overlay';
                
                // Set inline styles for the end image overlay
                endImg.style.cssText = `
                    position: absolute;
                    top: 15%;
                    left: 15%;
                    width: 70%;
                    height: 70%;
                    z-index: 10;
                    pointer-events: none;
                    object-fit: contain;
                `;
                
                // Add error handling
                endImg.onerror = function() {
                    console.error(`ERROR: Failed to load end image at (${row}, ${col})`);
                };
                
                // Add the end image on top of the node
                nodeElement.style.position = 'relative'; // Ensure the absolute positioning works
                nodeElement.appendChild(endImg);
                
                console.log(`Added end image to node at (${row}, ${col})`);
            } catch (error) {
                console.error('Error adding end image:', error);
            }
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
                // Add wall class for tracking
                nodeElement.classList.add('wall');
                
                // Clear out any existing obstacle overlay
                const existingObstacle = nodeElement.querySelector('.obstacle-overlay');
                if (existingObstacle) {
                    nodeElement.removeChild(existingObstacle);
                }
                
                // Get absolute URL for the obstacle image
                const obstacleUrl = window.location.origin + '/src/assets/images/obstacle1.png';
                console.log(`Using absolute URL for obstacle: ${obstacleUrl}`);
                
                try {
                    // Create a new img element for the obstacle
                    const obstacleImg = document.createElement('img');
                    obstacleImg.src = obstacleUrl;
                    obstacleImg.alt = 'Wall Obstacle';
                    obstacleImg.className = 'obstacle-overlay';
                    
                    // Set inline styles for the obstacle
                    obstacleImg.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 10;
                        pointer-events: none;
                        object-fit: cover;
                    `;
                    
                    // Add load and error event handlers
                    obstacleImg.onload = function() {
                        console.log(`SUCCESS: Obstacle image loaded at (${row}, ${col})`, obstacleImg);
                    };
                    
                    obstacleImg.onerror = function(e) {
                        console.error(`ERROR: Failed to load obstacle image at (${row}, ${col})`, e);
                        // Try with relative URL as fallback
                        obstacleImg.src = 'src/assets/images/obstacle1.png';
                    };
                    
                    // Add the obstacle image on top of the node
                    nodeElement.style.position = 'relative'; // Ensure the absolute positioning works
                    nodeElement.appendChild(obstacleImg);
                    
                    console.log(`Added obstacle image to node at (${row}, ${col})`, obstacleImg);
                } catch (error) {
                    console.error('Error adding obstacle image:', error);
                }
            } else {
                // Remove wall class
                nodeElement.classList.remove('wall');
                
                // Remove any obstacle overlay
                const obstacleImg = nodeElement.querySelector('.obstacle-overlay');
                if (obstacleImg) {
                    nodeElement.removeChild(obstacleImg);
                }
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
            // Remove wall class
            nodeElement.classList.remove('wall');
            
            // Remove any obstacle overlay
            const obstacleImg = nodeElement.querySelector('.obstacle-overlay');
            if (obstacleImg) {
                nodeElement.removeChild(obstacleImg);
            }
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
        const gameController = this.gameController || window.gameController;
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
        const gameController = this.gameController || window.gameController;
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
     * Update the grid view based on the model
     */
    update() {
        console.log(`GridView (${this.gridContainerId}): Updating view`);
        
        // Use direct DOM access instead of nodeElements array that might not be initialized
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.nodes[row][col];
                
                // Get the node element directly from the DOM using its ID
                const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
                
                // Skip if nodeElement doesn't exist
                if (!nodeElement) {
                    console.warn(`GridView (${this.gridContainerId}): NodeElement at [${row}][${col}] not found, skipping`);
                    continue;
                }
                
                // Clear existing classes and overlays
                nodeElement.className = 'node';
                nodeElement.innerHTML = '';
                
                // Handle path
                if (node.isPath) {
                    nodeElement.classList.add('path');
                }
                
                // Handle visited status
                if (node.isVisited && !node.isPath) {
                    nodeElement.classList.add('visited');
                }
                
                // Handle current node in visualization
                if (node.isCurrent) {
                    nodeElement.classList.add('current');
                }
                
                // Handle wall
                if (node.isWall) {
                    nodeElement.classList.add('wall');
                    
                    // Add obstacle image overlay (50% chance of obstacle1 or obstacle2)
                    const obstacleNum = Math.random() < 0.5 ? 1 : 2;
                    const obstacleUrl = `src/assets/images/obstacle${obstacleNum}.png`;
                    const obstacleImg = document.createElement('img');
                    obstacleImg.src = obstacleUrl;
                    obstacleImg.alt = 'Obstacle';
                    obstacleImg.className = 'obstacle-overlay';
                    // Add error handler
                    obstacleImg.onerror = function() {
                        console.error(`Failed to load obstacle${obstacleNum}.png, trying alternate path`);
                        obstacleImg.src = `./src/assets/images/obstacle${obstacleNum}.png`;
                    };
                    nodeElement.appendChild(obstacleImg);
                }
                
                // Add appropriate classes based on node state
                if (node.isStart) {
                    nodeElement.classList.add('start');
                    
                    // Add start image overlay
                    const startUrl = 'src/assets/images/start.png';
                    const startImg = document.createElement('img');
                    startImg.src = startUrl;
                    startImg.alt = 'Start Node';
                    startImg.className = 'start-overlay';
                    startImg.style.cssText = `
                        position: absolute;
                        top: 15%;
                        left: 15%;
                        width: 70%;
                        height: 70%;
                        z-index: 10;
                        pointer-events: none;
                        object-fit: contain;
                    `;
                    // Add error handler
                    startImg.onerror = function() {
                        console.error('Failed to load start.png, trying alternate path');
                        startImg.src = './src/assets/images/start.png';
                    };
                    nodeElement.style.position = 'relative';
                    nodeElement.appendChild(startImg);
                } else if (node.isEnd) {
                    nodeElement.classList.add('end');
                    
                    // Add end image overlay
                    const endUrl = 'src/assets/images/end.png';
                    const endImg = document.createElement('img');
                    endImg.src = endUrl;
                    endImg.alt = 'End Node';
                    endImg.className = 'end-overlay';
                    endImg.style.cssText = `
                        position: absolute;
                        top: 15%;
                        left: 15%;
                        width: 70%;
                        height: 70%;
                        z-index: 10;
                        pointer-events: none;
                        object-fit: contain;
                    `;
                    // Add error handler
                    endImg.onerror = function() {
                        console.error('Failed to load end.png, trying alternate path');
                        endImg.src = './src/assets/images/end.png';
                    };
                    nodeElement.style.position = 'relative';
                    nodeElement.appendChild(endImg);
                } else if (node.isWeighted) {
                    nodeElement.classList.add('weighted');
                    
                    // Add weighted image overlay (monster.gif)
                    const weightedUrl = 'src/assets/gifs/monster.gif';
                    const weightedImg = document.createElement('img');
                    weightedImg.src = weightedUrl;
                    weightedImg.alt = 'Weighted Node';
                    weightedImg.className = 'weighted-overlay';
                    weightedImg.style.cssText = `
                        position: absolute;
                        top: 15%;
                        left: 15%;
                        width: 70%;
                        height: 70%;
                        z-index: 10;
                        pointer-events: none;
                        object-fit: contain;
                    `;
                    // Handle error case
                    weightedImg.onerror = function() {
                        console.error('Failed to load monster.gif, trying absolute path');
                        weightedImg.src = 'C:/Users/kenzj/Desktop/cmsc126le3/src/assets/gifs/monster.gif';
                    };
                    nodeElement.style.position = 'relative';
                    nodeElement.appendChild(weightedImg);
                    
                    // Add weight value display
                    const weightValue = document.createElement('div');
                    weightValue.className = 'weight-value';
                    weightValue.textContent = node.weight;
                    weightValue.style.cssText = `
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        background-color: rgba(0, 0, 0, 0.7);
                        color: white;
                        border-radius: 50%;
                        width: 16px;
                        height: 16px;
                        font-size: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 11;
                    `;
                    nodeElement.appendChild(weightValue);
                }
            }
        }
        
        // If updateNodeCounts function exists, call it
        if (typeof this.updateNodeCounts === 'function') {
            this.updateNodeCounts();
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
        
        // Reset animation state on all nodes in the grid
        // This ensures no leftover animation classes or states
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const nodeElement = document.getElementById(`${this.gridContainerId}-node-${row}-${col}`);
                if (nodeElement) {
                    // Remove animation classes that might be active
                    nodeElement.classList.remove('animate');
                    
                    // Only reset visited/path nodes that haven't completed animation yet
                    // This prevents flickering when resetting during visualization
                    if (nodeElement.classList.contains('visited') || nodeElement.classList.contains('path')) {
                        const node = this.grid.getNode(row, col);
                        const currentVariation = nodeElement.dataset.tileVariation || 0;
                        const currentTileset = nodeElement.dataset.tilesetIndex || 0;
                        
                        // Reset to base state if it's not a special node
                        if (!node.isStart && !node.isEnd && !node.isWall) {
                            nodeElement.className = 'node';
                            this.applyTileVariation(nodeElement, currentVariation, currentTileset);
                        }
                    }
                }
            }
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
                        // Only mark as visited at the time this node is being processed in the animation
                        node.isVisited = true;
                        node.isPath = false;
                        
                        // Get the node element
                        const nodeElement = document.getElementById(`${this.gridContainerId}-node-${node.row}-${node.col}`);
                        if (nodeElement) {
                            // Clear previous classes but keep tile variation
                            const currentVariation = nodeElement.dataset.tileVariation || 0;
                            nodeElement.className = 'node';
                            this.applyTileVariation(nodeElement, currentVariation);
                            
                            // Add visited class and animation
                            nodeElement.classList.add('visited');
                            nodeElement.classList.add('animate');
                            
                            // Remove animation class after it completes
                            setTimeout(() => {
                                nodeElement.classList.remove('animate');
                            }, 500); // Match the animation duration in CSS
                        }
                    }
                }, speed * i);
                this.animationTimeouts.push(timeout);
            }
            
            // If no nodes to visit, resolve immediately
            if (visitedNodesInOrder.length === 0) {
                resolve();
            }
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
                    // Mark as path at the time this node is being processed
                    node.isPath = true;
                    
                    // Get the node element
                    const nodeElement = document.getElementById(`${this.gridContainerId}-node-${node.row}-${node.col}`);
                    if (nodeElement) {
                        // Remove visited class and add path class with animation
                        nodeElement.classList.remove('visited');
                        nodeElement.classList.add('path');
                        nodeElement.classList.add('animate');
                        
                        // Remove animation class after it completes
                        setTimeout(() => {
                            nodeElement.classList.remove('animate');
                        }, 500); // Match the animation duration in CSS
                    }
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

    /**
     * Update node counts in the UI
     */
    updateNodeCounts() {
        // Define this function if it doesn't exist to prevent errors
        // Find the visited count and path length elements
        const visitedCountElement = document.getElementById(`${this.gridContainerId.replace('-grid', '')}-visited-count`);
        const pathLengthElement = document.getElementById(`${this.gridContainerId.replace('-grid', '')}-path-length`);
        
        if (visitedCountElement) {
            // Count visited nodes
            let visitedCount = 0;
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    if (this.grid.nodes[row][col].isVisited) {
                        visitedCount++;
                    }
                }
            }
            visitedCountElement.textContent = visitedCount;
        }
        
        if (pathLengthElement) {
            // Count path nodes
            let pathLength = 0;
            for (let row = 0; row < this.grid.rows; row++) {
                for (let col = 0; col < this.grid.cols; col++) {
                    if (this.grid.nodes[row][col].isPath) {
                        pathLength++;
                    }
                }
            }
            pathLengthElement.textContent = pathLength;
        }
    }
} 