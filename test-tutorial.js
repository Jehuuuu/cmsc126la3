// Simple script to test the tutorial functionality

// Reset tutorial completed flag in localStorage
localStorage.removeItem('tutorialCompleted');

// Add debugging controls to quickly test specific tutorial steps
function addDebugControls() {
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
      <option value="0">0: Welcome</option>
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
  document.getElementById('debug-start-tutorial').addEventListener('click', function() {
    if (window.tutorialGuide) {
      window.tutorialGuide.tutorialCompleted = false;
      window.tutorialGuide.startTutorial();
    }
  });
  
  document.getElementById('debug-next-step').addEventListener('click', function() {
    if (window.tutorialGuide && window.tutorialGuide.isActive) {
      window.tutorialGuide.nextStep();
    }
  });
  
  document.getElementById('debug-jump-step').addEventListener('change', function() {
    const stepIndex = parseInt(this.value);
    if (stepIndex >= 0 && window.tutorialGuide) {
      window.tutorialGuide.tutorialCompleted = false;
      window.tutorialGuide.isActive = true;
      window.tutorialGuide.currentStep = stepIndex;
      window.tutorialGuide.renderStep();
    }
    // Reset dropdown
    this.value = "-1";
  });
}

// Wait for the page to fully load
window.addEventListener('load', function() {
  console.log('Page loaded, checking for tutorial guide...');
  
  // Give a little time for everything to initialize
  setTimeout(function() {
    if (window.tutorialGuide) {
      console.log('Tutorial guide found, trying to initialize...');
      
      // Force tutorial to start
      window.tutorialGuide.tutorialCompleted = false;
      window.tutorialGuide.showTutorialPrompt();
      
      console.log('Tutorial prompt should be showing now');
      
      // Add debug controls
      addDebugControls();
    } else {
      console.error('Tutorial guide not found on window object!');
    }
  }, 2000);
});

// Log when tutorial is completed
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'tutorialCompleted') {
    console.log('Tutorial was marked as completed with value:', value);
  }
  originalSetItem.apply(this, arguments);
};

console.log('Tutorial test script loaded'); 