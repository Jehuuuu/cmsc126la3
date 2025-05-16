/**
 * initModularTutorial.js
 * Initialize the modular tutorial system
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tutorial after a short delay to ensure all elements are loaded
    setTimeout(() => {
        if (window.modularTutorial) {
            window.modularTutorial.init();
            console.log('Modular tutorial system initialized');
        } else {
            console.error('Modular tutorial system not found');
        }
    }, 500);
});

// Also add a debug panel for testing in development
function addDebugPanel() {
    // Only add in development
    if (process.env.NODE_ENV !== 'production') {
        const debugPanel = document.createElement('div');
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.zIndex = '10000';
        debugPanel.innerHTML = `
            <div style="margin-bottom:5px;font-weight:bold">Tutorial Debug</div>
            <button id="debug-start-tutorial">Start Tutorial</button>
            <button id="debug-next-step">Next Step</button>
            <select id="debug-jump-step">
                <option value="-1">Jump to step...</option>
                <option value="0">0: Intro</option>
                <option value="1">1: Algorithm Comparison</option>
                <option value="2">2: Generate Maze</option>
                <option value="3">3: Add Walls</option>
                <option value="4">4: Add Weights</option>
                <option value="5">5: Find Paths</option>
                <option value="6">6: Compare Results</option>
                <option value="7">7: Tutorial Complete</option>
            </select>
        `;
        document.body.appendChild(debugPanel);
        
        // Add event listeners
        document.getElementById('debug-start-tutorial').addEventListener('click', () => {
            if (window.modularTutorial) {
                window.modularTutorial.tutorialCompleted = false;
                window.modularTutorial.startTutorial();
            }
        });
        
        document.getElementById('debug-next-step').addEventListener('click', () => {
            if (window.modularTutorial && window.modularTutorial.isActive) {
                window.modularTutorial.nextStep();
            }
        });
        
        document.getElementById('debug-jump-step').addEventListener('change', (e) => {
            const step = parseInt(e.target.value);
            if (step >= 0 && window.modularTutorial) {
                window.modularTutorial.tutorialCompleted = false;
                window.modularTutorial.isActive = true;
                window.modularTutorial.currentStep = step;
                window.modularTutorial.clearAllModals();
                window.modularTutorial.showCurrentStep();
            }
        });
    }
}

// Add debug panel in development
addDebugPanel(); 