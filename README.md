# Skull Cavern Pathing

A web-based interactive visualization tool that demonstrates how pathfinding algorithms work in real-time. Watch Dijkstra's algorithm find the shortest path between two points while learning about graph traversal in a fun, visual way!

## What It Does

This application lets you:
- Create custom maps with walls and obstacles
- Place start and end points
- Watch the algorithm search for the best path in real-time
- View alternative paths and compare their lengths
- Generate random mazes to test the algorithm

## How to Use

### Getting Started
1. **Open the application**: Simply open `index.html` in any web browser - no installation required!

### Basic Controls
1. **Set up your grid**:
   - Use "Set Start" to place your starting point (green)
   - Use "Set End" to place your destination point (red)
   - Draw walls with "Add Walls" to create obstacles
   - Use "Erase" to remove anything you've placed

2. **Start the visualization**:
   - Click "Find Path" to watch the algorithm work
   - Watch as the algorithm explores (purple cells) and finds the optimal path (yellow)

3. **Adjust settings**:
   - Change grid size (10x10, 15x15, 20x20, or 25x25)
   - Control speed (Slow, Medium, Fast)
   - Choose between Auto mode or Step-by-Step mode

### Advanced Features
- **Generate random mazes** with one click
- **Place random start/end points** to quickly test new scenarios
- View **alternative paths** in the sidebar
- Use **keyboard shortcuts** for faster interaction:
  - `S`: Set Start tool
  - `E`: Set End tool
  - `W`: Add Walls tool
  - `D`: Erase tool
  - `C`: Clear grid
  - `R`: Generate random maze
  - `Space`: Start visualization
  - Arrow keys: Navigate steps (in Step-by-Step mode)

## How It Works

The application uses Dijkstra's algorithm, which finds the shortest path between two points by:
1. Exploring cells outward from the start point
2. Tracking the total distance to each visited cell
3. Identifying the shortest possible path to the destination

## Requirements

No special requirements or installation needed! This application runs in any modern web browser using standard:
- HTML5
- CSS3
- JavaScript (no frameworks)

## Development

This project is structured using the Model-View-Controller (MVC) pattern:
- **Models**: Define the data structures (grid, nodes)
- **Views**: Handle the visual presentation
- **Controllers**: Manage user interactions and algorithm execution

## Deployment

To deploy and share this application:

1. Clone this repository
2. Run locally: Open `index.html` in a browser
3. Deploy online: Use the included configuration for Vercel with `npm run deploy`

## Testing Locally

Use the command `npm run test` to start a local server and test the application.

## Technical Implementation

This project is implemented using a modular, object-oriented approach with:

- HTML5, CSS3, and vanilla JavaScript
- Model-View-Controller (MVC) architecture
- Efficient implementation of Dijkstra's algorithm using a binary heap priority queue
- Optimized path searching with early termination
- Responsive UI design

## Project Structure

```
/cmsc126la3/
  /src/
    /models/         # Data models (Grid, Node)
    /algorithms/     # Pathfinding algorithms
    /controllers/    # Game and visualization controllers
    /views/          # UI and grid views
    /utils/          # Utility classes
    /assets/         # Styles and images
  index.html         # Main HTML file
  README.md          # Documentation
```

## Future Enhancements

- Add more pathfinding algorithms (A*, BFS, DFS)
- Implement weighted nodes for terrain effects
- Add animation and visual enhancements
- Include additional game elements and challenges
- Implement touch support for mobile devices

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Start exploring pathfinding algorithms!

No build process or dependencies required - just plain HTML, CSS, and JavaScript.

## License

This project is created for educational purposes. 