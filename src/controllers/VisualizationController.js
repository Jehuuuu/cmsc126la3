/**
 * Controller for visualization of pathfinding algorithms
 */
class VisualizationController {
    /**
     * Create a new VisualizationController
     * @param {Grid} grid - The grid model
     * @param {GridView} gridView - The grid view
     * @param {UIView} uiView - The UI view
     */
    constructor(grid, gridView, uiView) {
        this.grid = grid;
        this.gridView = gridView;
        this.uiView = uiView;
        this.algorithm = new DijkstraAlgorithm(grid);
        this.isVisualizing = false;
        this.mode = 'auto'; // 'auto' or 'step'
        this.currentStep = -1;
        this.maxStep = -1;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.alternativePaths = [];
        this.selectedPathIndex = 0;
        this.speed = {
            slow: 50,
            medium: 20,
            fast: 5
        };
        this.currentSpeed = 'medium';
        
        // Initialize UI for current mode - but don't call if uiView is not set yet
        // We'll call this method after setting up all references
    }

    /**
     * Initialize UI with current mode
     * Called after all controller references are set up
     */
    initUI() {
        if (this.uiView) {
            this.uiView.updateModeUI(this.mode);
        }
    }

    /**
     * Start the pathfinding visualization
     */
    async startVisualization() {
        if (this.isVisualizing) return;
        
        // Check if start and end nodes are set
        if (!this.grid.startNode || !this.grid.endNode) {
            alert('Please set both start and end nodes before visualizing.');
            return;
        }
        
        // Reset previous visualization
        this.grid.resetPath();
        this.gridView.update();
        
        // Set visualizing state
        this.isVisualizing = true;
        this.uiView.setGridInteractionsDisabled(true);
        
        // Run algorithm to find path
        const result = this.algorithm.run(true);
        this.visitedNodesInOrder = result.visited;
        this.pathNodesInOrder = result.path;
        
        // Generate alternative paths
        this.alternativePaths = PathUtils.generateAlternativePaths(
            this.grid, 
            (grid, visualize) => new DijkstraAlgorithm(grid).run(visualize)
        );
        
        // Update path previews
        this.gridView.createPathPreviews(this.alternativePaths);
        
        if (this.mode === 'auto') {
            // Auto mode: animate the visualization
            await this.gridView.visualize(
                this.visitedNodesInOrder, 
                this.pathNodesInOrder, 
                this.speed[this.currentSpeed]
            );
            
            this.isVisualizing = false;
            this.uiView.setGridInteractionsDisabled(false);
        } else {
            // Step mode: prepare for stepping
            this.currentStep = -1;
            this.maxStep = this.visitedNodesInOrder.length - 1;
            this.uiView.setStepControlsEnabled(true);
            
            // Show first step
            this.nextStep();
        }
    }

    /**
     * Move to the next step in step-by-step mode
     */
    nextStep() {
        if (this.mode !== 'step' || this.currentStep >= this.maxStep) return;
        
        this.currentStep++;
        this.algorithm.updateProgress(this.currentStep);
        
        // If we've reached the end node, show the path
        if (this.currentStep === this.maxStep) {
            this.showPath();
        }
        
        this.gridView.update();
    }

    /**
     * Move to the previous step in step-by-step mode
     */
    prevStep() {
        if (this.mode !== 'step' || this.currentStep <= 0) return;
        
        this.currentStep--;
        this.algorithm.updateProgress(this.currentStep);
        
        // If we had the path shown, hide it now
        for (const node of this.pathNodesInOrder) {
            node.isPath = false;
        }
        
        this.gridView.update();
    }

    /**
     * Show the final path in step-by-step mode
     */
    showPath() {
        // Mark path nodes
        for (const node of this.pathNodesInOrder) {
            if (!node.isStart && !node.isEnd) {
                node.isPath = true;
            }
        }
    }

    /**
     * Set the visualization mode
     * @param {string} mode - The mode to set ('auto' or 'step')
     */
    setMode(mode) {
        if (this.isVisualizing) return;
        
        this.mode = mode;
        this.uiView.updateModeUI(mode);
        
        // Reset step controls
        if (mode === 'step') {
            this.uiView.setStepControlsEnabled(false);
        }
    }

    /**
     * Set the visualization speed
     * @param {string} speed - The speed to set ('slow', 'medium', or 'fast')
     */
    setSpeed(speed) {
        if (this.speed[speed] !== undefined) {
            this.currentSpeed = speed;
        }
    }

    /**
     * Select an alternative path to display
     * @param {number} index - The index of the path to select
     */
    selectAlternativePath(index) {
        if (index < 0 || index >= this.alternativePaths.length || this.isVisualizing) {
            return;
        }
        
        this.selectedPathIndex = index;
        
        // Reset path visualization
        this.grid.resetPath();
        
        // Set the selected path
        const selectedPath = this.alternativePaths[index].path;
        if (selectedPath && selectedPath.length > 0) {
            for (const node of selectedPath) {
                const gridNode = this.grid.getNode(node.row, node.col);
                if (gridNode && !gridNode.isStart && !gridNode.isEnd) {
                    gridNode.isPath = true;
                }
            }
        }
        
        this.gridView.update();
    }

    /**
     * Stop the current visualization
     */
    stopVisualization() {
        if (!this.isVisualizing) return;
        
        this.algorithm.stop();
        this.isVisualizing = false;
        this.uiView.setGridInteractionsDisabled(false);
    }
} 