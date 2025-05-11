/**
 * Main entry point for the pathfinding visualizer and algorithm comparison
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing app");
    
    // Check if using mobile device and apply optimizations
    checkAndApplyMobileOptimizations();
    
    // Set up the mobile controls toggle
    setupMobileControlsToggle();
    
    // Create the grid models
    const defaultSize = 10;
    const dijkstraGrid = new Grid(defaultSize, defaultSize);
    const astarGrid = new Grid(defaultSize, defaultSize);
    
    // Create the grid views
    const dijkstraGridView = new GridView(dijkstraGrid, 'dijkstra-grid');
    const astarGridView = new GridView(astarGrid, 'astar-grid');
    
    // Create algorithms
    const dijkstraAlgorithm = new DijkstraAlgorithm(dijkstraGrid);
    const astarAlgorithm = new AStarAlgorithm(astarGrid);
    
    // Create controllers and make gameController available globally first
    const gameController = new GameController(
        [dijkstraGrid, astarGrid], 
        [dijkstraGridView, astarGridView],
        [null, null] // Will be populated later
    );
    
    // Set global reference to game controller first, so grid views can access it
    window.gameController = gameController;
    
    // Create visualization controllers
    const dijkstraController = new VisualizationController(dijkstraGrid, dijkstraGridView, null, dijkstraAlgorithm, {
        visitedCountId: 'dijkstra-visited-count',
        pathLengthId: 'dijkstra-path-length',
        altPathId: 'dijkstra-alt-path'
    });
    
    const astarController = new VisualizationController(astarGrid, astarGridView, null, astarAlgorithm, {
        visitedCountId: 'astar-visited-count',
        pathLengthId: 'astar-path-length',
        altPathId: 'astar-alt-path'
    });
    
    // Update visualization controllers in GameController
    gameController.visualizationControllers = [dijkstraController, astarController];
    
    // Create UI view
    const uiView = new UIView({
        game: gameController,
        dijkstra: dijkstraController,
        astar: astarController
    });
    
    // Set controller references
    dijkstraController.uiView = uiView;
    astarController.uiView = uiView;
    
    // Initialize UI after all references are set
    dijkstraController.initUI();
    astarController.initUI();
    
    // Initialize with default values
    const gridSizeSelect = document.getElementById('grid-size');
    if (gridSizeSelect) {
        gridSizeSelect.value = defaultSize.toString();
    }
    
    // Set up help modal functionality
    setupHelpModal();
    
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
                dijkstraController.nextStep();
                astarController.nextStep();
                event.preventDefault();
                break;
            case 'arrowleft': // Previous step
                dijkstraController.prevStep();
                astarController.prevStep();
                event.preventDefault();
                break;
            case 'h': // Show help
                toggleHelpModal(true);
                event.preventDefault();
                break;
            case 'escape': // Close help
                toggleHelpModal(false);
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
        window.dijkstraController = dijkstraController;
        window.astarController = astarController;
        window.dijkstraGrid = dijkstraGrid;
        window.astarGrid = astarGrid;
    }
    
    // Log that everything is set up
    console.log("Pathfinding visualizer initialized successfully");
});

/**
 * Set up the toggle button for mobile controls
 */
function setupMobileControlsToggle() {
    const toggleBtn = document.getElementById('toggle-controls-btn');
    const header = document.getElementById('main-header');
    
    if (toggleBtn && header) {
        // Initially collapse header on mobile
        if (window.matchMedia("(max-width: 768px)").matches) {
            header.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            // On desktop, always show header content
            header.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
        
        // Toggle header when button is clicked
        toggleBtn.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            toggleBtn.classList.toggle('active');
            
            // Announce state change for accessibility
            const isExpanded = !header.classList.contains('collapsed');
            toggleBtn.setAttribute('aria-expanded', isExpanded.toString());
            
            // If collapsed, scroll to ensure grid is visible
            if (!isExpanded && window.matchMedia("(max-width: 768px)").matches) {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    setTimeout(() => {
                        mainContent.scrollIntoView({ behavior: 'smooth' });
                    }, 300); // Wait for collapse animation
                }
            }
        });
    }
}

/**
 * Check if the device is mobile and apply appropriate optimizations
 */
function checkAndApplyMobileOptimizations() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    if (isMobile) {
        console.log("Mobile device detected, applying optimizations");
        
        // Improve touch target sizes
        document.querySelectorAll('button, select').forEach(el => {
            el.style.minHeight = '38px';
        });
        
        // Add touch feedback
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('node')) {
                e.target.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            document.querySelectorAll('.touch-active').forEach(el => {
                el.classList.remove('touch-active');
            });
        }, { passive: true });
        
        // Improve grid interaction on touch devices
        const grids = document.querySelectorAll('.grid');
        grids.forEach(grid => {
            // Prevent zoom gestures on grid
            grid.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        });
        
        // Add quick-access buttons for mobile view
        setupMobileAccessButtons();
    } else {
        // We're on desktop - make sure mobile elements are hidden
        const assistiveMenu = document.getElementById('assistive-menu');
        const randomMenu = document.getElementById('random-menu');
        
        // Hide mobile menus
        if (assistiveMenu) assistiveMenu.classList.remove('visible');
        if (randomMenu) randomMenu.classList.remove('visible');
        
        // Remove any added mobile buttons
        document.querySelectorAll('.mini-action-btn, .assistive-touch-btn, .random-features-btn').forEach(btn => {
            if (btn) btn.remove();
        });
        
        // Make sure mobile-hidden elements are visible on desktop
        document.querySelectorAll('.mobile-hidden-tools, .mobile-hidden-action').forEach(el => {
            el.style.display = '';
        });
    }
    
    // Add a resize listener to handle switching between mobile and desktop
    window.addEventListener('resize', debounce(() => {
        checkAndApplyMobileOptimizations();
    }, 250));
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Set up mobile access buttons (Find Path and AssistiveTouch)
 */
function setupMobileAccessButtons() {
    const startBtn = document.getElementById('start-btn');
    const gameController = window.gameController;
    
    if (startBtn) {
        // Create a mini floating action button for quick access to "Find Path"
        const miniActionBtn = document.createElement('button');
        miniActionBtn.className = 'mini-action-btn';
        miniActionBtn.innerHTML = '<span style="font-size: 28px;">▶</span>';
        miniActionBtn.setAttribute('aria-label', 'Find Path');
        document.body.appendChild(miniActionBtn);
        
        miniActionBtn.addEventListener('click', () => {
            startBtn.click();
        });
        
        // Set up the assistive touch button and menu for drawing tools
        setupAssistiveTouch(gameController);
        
        // Set up the random features button and menu
        setupRandomFeaturesMenu(gameController);
    }
}

/**
 * Set up the assistive touch button and menu
 * @param {Object} gameController - The game controller to interact with
 */
function setupAssistiveTouch(gameController) {
    // Get references to existing DOM elements
    const assistiveMenu = document.getElementById('assistive-menu');
    const toolMenuItems = document.querySelectorAll('.tool-menu-item');
    
    if (!assistiveMenu) {
        console.error("Assistive menu element not found");
        return;
    }
    
    // Create the main assistive touch button
    const assistiveTouchBtn = document.createElement('button');
    assistiveTouchBtn.className = 'assistive-touch-btn';
    assistiveTouchBtn.innerHTML = '<span style="font-size: 28px;">🖌️</span>'; // Paintbrush icon instead of gear
    assistiveTouchBtn.setAttribute('aria-label', 'Drawing Tools');
    assistiveTouchBtn.setAttribute('aria-expanded', 'false');
    document.body.appendChild(assistiveTouchBtn);
    
    // Toggle the assistive menu when the button is clicked
    assistiveTouchBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing it
        
        // Close random menu if open
        const randomMenu = document.getElementById('random-menu');
        const randomBtn = document.querySelector('.random-features-btn');
        if (randomMenu && randomMenu.classList.contains('visible')) {
            randomMenu.classList.remove('visible');
            if (randomBtn) randomBtn.classList.remove('active');
        }
        
        // Toggle assistive menu
        const isVisible = assistiveMenu.classList.toggle('visible');
        assistiveTouchBtn.setAttribute('aria-expanded', isVisible.toString());
        assistiveTouchBtn.classList.toggle('active');
    });
    
    // Close the menu when clicking anywhere else on the document
    document.addEventListener('click', (event) => {
        if (!assistiveMenu.contains(event.target) && 
            event.target !== assistiveTouchBtn && 
            assistiveMenu.classList.contains('visible')) {
            assistiveMenu.classList.remove('visible');
            assistiveTouchBtn.classList.remove('active');
            assistiveTouchBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Set up handlers for each menu item
    toolMenuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent it from triggering document click
            const tool = item.getAttribute('data-tool');
            handleAssistiveMenuAction(tool, gameController);
            
            // Close the menu after selecting a tool
            setTimeout(() => {
                assistiveMenu.classList.remove('visible');
                assistiveTouchBtn.classList.remove('active');
                assistiveTouchBtn.setAttribute('aria-expanded', 'false');
            }, 200);
            
            // Show visual feedback when pressing a button
            item.classList.add('touch-active');
            setTimeout(() => {
                item.classList.remove('touch-active');
            }, 200);
        });
    });
}

/**
 * Set up the random features button and menu
 * @param {Object} gameController - The game controller to interact with
 */
function setupRandomFeaturesMenu(gameController) {
    // Get references to existing DOM elements
    const randomMenu = document.getElementById('random-menu');
    const randomMenuItems = document.querySelectorAll('.random-menu-item');
    
    if (!randomMenu) {
        console.error("Random menu element not found");
        return;
    }
    
    // Create the random features button
    const randomFeaturesBtn = document.createElement('button');
    randomFeaturesBtn.className = 'random-features-btn';
    randomFeaturesBtn.innerHTML = '<span style="font-size: 28px;">🎲</span>'; // Dice icon
    randomFeaturesBtn.setAttribute('aria-label', 'Random Features');
    randomFeaturesBtn.setAttribute('aria-expanded', 'false');
    document.body.appendChild(randomFeaturesBtn);
    
    // Toggle the random menu when the button is clicked
    randomFeaturesBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing it
        
        // Close assistive menu if open
        const assistiveMenu = document.getElementById('assistive-menu');
        const assistiveBtn = document.querySelector('.assistive-touch-btn');
        if (assistiveMenu && assistiveMenu.classList.contains('visible')) {
            assistiveMenu.classList.remove('visible');
            if (assistiveBtn) assistiveBtn.classList.remove('active');
        }
        
        // Toggle random menu
        const isVisible = randomMenu.classList.toggle('visible');
        randomFeaturesBtn.setAttribute('aria-expanded', isVisible.toString());
        randomFeaturesBtn.classList.toggle('active');
    });
    
    // Close the menu when clicking anywhere else on the document
    document.addEventListener('click', (event) => {
        if (!randomMenu.contains(event.target) && 
            event.target !== randomFeaturesBtn && 
            randomMenu.classList.contains('visible')) {
            randomMenu.classList.remove('visible');
            randomFeaturesBtn.classList.remove('active');
            randomFeaturesBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Set up handlers for each menu item
    randomMenuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent it from triggering document click
            const action = item.getAttribute('data-action');
            handleRandomMenuAction(action, gameController);
            
            // Close the menu after selecting an action
            setTimeout(() => {
                randomMenu.classList.remove('visible');
                randomFeaturesBtn.classList.remove('active');
                randomFeaturesBtn.setAttribute('aria-expanded', 'false');
            }, 200);
            
            // Show visual feedback when pressing a button
            item.classList.add('touch-active');
            setTimeout(() => {
                item.classList.remove('touch-active');
            }, 200);
        });
    });
}

/**
 * Handle actions from the assistive touch menu
 * @param {string} tool - The tool type selected
 * @param {Object} gameController - The game controller
 */
function handleAssistiveMenuAction(tool, gameController) {
    // Special handling for clear grid to make it work anytime
    if (tool === 'clear') {
        console.log('Assistive touch: forcing grid clear');
        
        // Force stop any ongoing visualizations
        if (window.dijkstraController) {
            window.dijkstraController.reset();
            window.dijkstraController.resetUI();
            
            // Reset step controls if in step-by-step mode
            const nextStepBtn = document.getElementById('next-step-btn');
            const prevStepBtn = document.getElementById('prev-step-btn');
            if (nextStepBtn) nextStepBtn.disabled = true;
            if (prevStepBtn) prevStepBtn.disabled = true;
        }
        
        if (window.astarController) {
            window.astarController.reset();
            window.astarController.resetUI();
        }
        
        // Clear the grid using the game controller directly
        if (gameController) {
            gameController.clearGrid();
            
            // Enable user interactions after clearing
            const toolButtons = document.querySelectorAll('.tool-btn');
            const gridSizeSelect = document.getElementById('grid-size');
            
            toolButtons.forEach(button => {
                button.disabled = false;
            });
            
            if (gridSizeSelect) {
                gridSizeSelect.disabled = false;
            }
            
            return;
        }
    } else {
        // Map the tool to the corresponding button ID
        const buttonMap = {
            'start': 'start-node-btn',
            'end': 'end-node-btn',
            'wall': 'wall-btn',
            'erase': 'erase-btn'
        };
        
        // Click the corresponding tool button if it exists
        if (buttonMap[tool]) {
            const button = document.getElementById(buttonMap[tool]);
            if (button) {
                console.log(`Assistive touch: activating ${tool} tool`);
                button.click();
            }
        }
    }
}

/**
 * Handle actions from the random features menu
 * @param {string} action - The action to perform
 * @param {Object} gameController - The game controller
 */
function handleRandomMenuAction(action, gameController) {
    // Special handling for clear grid to make it work anytime
    if (action === 'clear-grid') {
        console.log('Random menu: forcing grid clear');
        
        // Force stop any ongoing visualizations
        if (window.dijkstraController) {
            window.dijkstraController.reset();
            window.dijkstraController.resetUI();
            
            // Reset step controls if in step-by-step mode
            const nextStepBtn = document.getElementById('next-step-btn');
            const prevStepBtn = document.getElementById('prev-step-btn');
            if (nextStepBtn) nextStepBtn.disabled = true;
            if (prevStepBtn) prevStepBtn.disabled = true;
        }
        
        if (window.astarController) {
            window.astarController.reset();
            window.astarController.resetUI();
        }
        
        // Clear the grid using the game controller directly
        if (gameController) {
            gameController.clearGrid();
            
            // Enable user interactions after clearing
            const toolButtons = document.querySelectorAll('.tool-btn');
            const gridSizeSelect = document.getElementById('grid-size');
            
            toolButtons.forEach(button => {
                button.disabled = false;
            });
            
            if (gridSizeSelect) {
                gridSizeSelect.disabled = false;
            }
            
            return;
        }
    } else {
        // Map the action to the corresponding button ID
        const buttonMap = {
            'random-maze': 'random-maze-btn',
            'random-start-end': 'random-start-end-btn'
        };
        
        // Click the corresponding button if it exists
        if (buttonMap[action]) {
            const button = document.getElementById(buttonMap[action]);
            if (button) {
                console.log(`Random menu: activating ${action}`);
                button.click();
            }
        }
    }
}

/**
 * Set up help modal functionality
 */
function setupHelpModal() {
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    if (helpBtn && helpModal) {
        // Open modal when help button is clicked
        helpBtn.addEventListener('click', () => {
            toggleHelpModal(true);
        });
        
        // Close modal when close button is clicked
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toggleHelpModal(false);
            });
        }
        
        // Close modal when clicking outside of the modal content
        window.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                toggleHelpModal(false);
            }
        });
    } else {
        console.error('Help modal elements not found');
    }
}

/**
 * Toggle the help modal visibility
 * @param {boolean} show - Whether to show or hide the modal
 */
function toggleHelpModal(show) {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.style.display = show ? 'block' : 'none';
    }
} 