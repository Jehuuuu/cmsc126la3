# 🧠 Pathfinding Algorithm Visualizer

<div align="center">
  <img src="src/assets/images/app_logo.png" alt="Pathfinding Visualizer Logo" width="180">
  
  ### Compare Dijkstra's Algorithm vs A* in real-time!
  
  [View Demo](https://jehuuuu.github.io/cmsc126le3/) | [GitHub Repository](https://github.com/Jehuuuu/cmsc126le3)
</div>

---

## ✨ Features

### Lab Requirements Checklist
- [x] 10x10 grid with resizable options
- [x] Click to place obstacles (walls)
- [x] Set start and end points
- [x] "Find Path" button to start visualization
- [x] Dynamic grid updates showing the algorithm's pathfinding process
- [x] Implementation of Dijkstra's Algorithm
- [x] Implementation of A* Search algorithm
- [x] Visual representation of:
  - [x] Exploration of nodes (blue cells)
  - [x] Final shortest path (yellow cells)
  - [x] Obstacles and weighted nodes
- [x] Object-Oriented Programming with proper classes
- [x] Asynchronous execution for animation
- [x] Performance optimization

### Additional Challenges Completed
- [x] Grid resizing (10x10, 15x15, 20x20, 25x25)
- [x] Speed control (slow, medium, fast)
- [x] Weighted nodes with custom weights (2-10)
- [x] Save/load grid configurations with local storage

### Extra Features Added
- [x] Side-by-side algorithm comparison
- [x] Step-by-step mode with forward/backward controls
- [x] Algorithm container swapping
- [x] Responsive design with sidebar navigation
- [x] Randomization tools:
  - [x] Generate random mazes
  - [x] Create random weighted patterns
  - [x] Place random start/end points
- [x] Keyboard shortcuts for faster interaction
- [x] Mobile support with touch controls
- [x] Interactive help modal

### Fixed Issues
- [x] Proper visualization reset when switching from step-by-step to auto mode
- [x] Consistent algorithm container border colors when swapping
- [x] Proper notification when step-by-step mode completes
- [x] Superior drag for start/end nodes (replacing walls AND weighted nodes)
- [x] Centered and properly sized help modal

---

## 🚀 Quick Start

1. **Open the application**:
   - Clone this repository
   - Open `index.html` in any modern browser

2. **Place start and end points**:
   - Use the "Set Start" tool (or press `S`) 
   - Use the "Set End" tool (or press `E`)

3. **Create your maze**:
   - Draw walls with the "Add Walls" tool (or press `W`)
   - Add weighted terrain with "Add Weights" tool
   - Or generate a random maze with one click!

4. **Watch the algorithms compete**:
   - Click "Find Path" (or press `Space`)
   - Compare which algorithm is more efficient!

---

## 🎮 How to Use

### Drawing Tools
| Tool | Description | Shortcut |
|------|-------------|----------|
| **Set Start** | Place your starting point | `S` |
| **Set End** | Place your destination | `E` |
| **Add Walls** | Create impenetrable obstacles | `W` |
| **Add Weights** | Create costly terrain (2-10) | - |
| **Erase** | Remove obstacles or weights | `D` |

### Visualization Controls
| Control | Description | Shortcut |
|---------|-------------|----------|
| **Find Path** | Begin algorithm visualization | `Space` |
| **Step-by-Step** | Navigate through algorithm execution | Arrow keys |
| **Clear Grid** | Reset the entire grid | `C` |
| **Help** | Show detailed instructions | `H` |

---

## 💡 Algorithm Comparison

### Dijkstra's Algorithm
- Guarantees the shortest path
- Explores in all directions equally
- Great for unweighted or weighted grids
- Generally visits more nodes than A*

### A* Algorithm
- Also finds the shortest path
- Uses heuristics to search more efficiently
- Prioritizes promising directions
- Usually faster than Dijkstra's for most scenarios

---

## 📂 Project Structure

```
/cmsc126le3/
│
├── src/                        # Source code
│   ├── algorithms/             # Pathfinding algorithms
│   │   ├── Algorithm.js        # Base algorithm class
│   │   ├── AStarAlgorithm.js   # A* implementation
│   │   └── DijkstraAlgorithm.js # Dijkstra's implementation
│   │
│   ├── assets/                 # Static assets
│   │   ├── images/             # Images and icons
│   │   └── styles/             # CSS files
│   │       ├── main.css        # Main styling
│   │       ├── sidebar.css     # Sidebar styling
│   │       ├── modals.css      # Modal windows styling
│   │       └── ...
│   │
│   ├── controllers/            # Control logic
│   │   ├── GameController.js   # Main game controller
│   │   └── VisualizationController.js # Visualization logic
│   │
│   ├── models/                 # Data models
│   │   ├── Grid.js             # Grid data structure
│   │   └── Node.js             # Node data structure
│   │
│   ├── utils/                  # Utility classes
│   │   ├── PathUtils.js        # Path calculation utilities
│   │   ├── PriorityQueue.js    # Priority queue implementation
│   │   └── ToastNotification.js # Toast notifications
│   │
│   ├── views/                  # UI components
│   │   ├── GridView.js         # Grid view/rendering
│   │   └── UIView.js           # User interface elements
│   │
│   └── index.js                # Main entry point
│
├── index.html                  # Main HTML file
├── README.md                   # Documentation
└── Lab Activity 3.md           # Assignment details
```

## 🛠️ Technical Implementation

- Pure HTML, CSS, and vanilla JavaScript
- Object-oriented design with Model-View-Controller architecture:
  - **Models**: Define data structures (Grid, Node)
  - **Views**: Handle the visual presentation and UI
  - **Controllers**: Manage application logic and algorithm execution
- Asynchronous visualization with customizable speeds
- Optimized algorithms using priority queues
- Local storage for saving grid configurations
- Responsive design for various screen sizes

---

## 🔮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | Select Start tool |
| `E` | Select End tool |
| `W` | Select Wall tool |
| `D` | Select Erase tool |
| `C` | Clear grid |
| `R` | Generate random maze |
| `Space` | Find path |
| `→` | Next step (in step mode) |
| `←` | Previous step (in step mode) |
| `H` | Show help |
| `Esc` | Close modal |

---

## 📱 Mobile Support

The visualizer is fully responsive and works on mobile devices with touch controls:
- Floating action buttons for easy access to tools
- Responsive grid that adapts to screen size
- Collapsible controls for maximum viewing area

---

<div align="center">
  <p>Created for CMSC 126 Web Engineering Lab Activity 3</p>
  <p>By: Jehu Garcia © 2023</p>
</div> 