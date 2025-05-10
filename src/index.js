/**
 * Main entry point for the pathfinding visualizer
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create the grid model
    const defaultSize = 10;
    const grid = new Grid(defaultSize, defaultSize);
    
    // Create the grid view
    const gridView = new GridView(grid);
    
    // Create controllers (with circular references resolved after creation)
    const gameController = new GameController(grid, gridView, null);
    const visualizationController = new VisualizationController(grid, gridView, null);
    
    // Create UI view
    const uiView = new UIView({
        game: gameController,
        visualization: visualizationController
    });
    
    // Set controller references
    visualizationController.uiView = uiView;
    gameController.visualizationController = visualizationController;
    
    // Initialize UI after all references are set
    visualizationController.initUI();
    
    // Initialize with default values
    const gridSizeSelect = document.getElementById('grid-size');
    if (gridSizeSelect) {
        gridSizeSelect.value = defaultSize.toString();
    }
    
    // Add keyboard shortcuts for common actions
    document.addEventListener('keydown', (event) => {
        // Prevent shortcuts when inputs are focused
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case 's': // Set Start
                document.getElementById('start-node-btn')?.click();
                break;
            case 'e': // Set End
                document.getElementById('end-node-btn')?.click();
                break;
            case 'w': // Add Walls
                document.getElementById('wall-btn')?.click();
                break;
            case 'd': // Erase (Delete)
                document.getElementById('erase-btn')?.click();
                break;
            case 'c': // Clear Grid
                document.getElementById('clear-grid-btn')?.click();
                break;
            case 'r': // Random Maze
                document.getElementById('random-maze-btn')?.click();
                break;
            case ' ': // Space to run visualization
                document.getElementById('start-btn')?.click();
                event.preventDefault(); // Prevent page scrolling with space
                break;
            case 'arrowright': // Next step
                visualizationController.nextStep();
                event.preventDefault();
                break;
            case 'arrowleft': // Previous step
                visualizationController.prevStep();
                event.preventDefault();
                break;
        }
    });
    
    // Support for saving and loading grids from local storage
    // Add buttons for these features if desired
    window.saveCurrentGrid = (name) => {
        const saveName = prompt('Enter a name for this grid:', name || 'My Grid');
        if (saveName) {
            const success = gameController.saveGrid(saveName);
            if (success) {
                alert(`Grid saved as "${saveName}"`);
            } else {
                alert('Failed to save grid');
            }
        }
    };
    
    window.loadSavedGrid = () => {
        const savedGrids = gameController.getSavedGrids();
        if (savedGrids.length === 0) {
            alert('No saved grids found');
            return;
        }
        
        const gridName = prompt(`Enter the name of the grid to load:\n\nAvailable grids: ${savedGrids.join(', ')}`);
        if (gridName) {
            const success = gameController.loadGrid(gridName);
            if (!success) {
                alert(`Grid "${gridName}" not found`);
            }
        }
    };
    
    // Expose controllers to window for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.gameController = gameController;
        window.visualizationController = visualizationController;
        window.grid = grid;
    }
}); 