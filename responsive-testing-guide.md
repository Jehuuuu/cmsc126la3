# Quick Guide: Testing Mac Compatibility & Responsive Features on Windows

## How to Access the Testing Tool

There are two ways to access the responsive testing tool:

1. **Using the keyboard shortcut:** Press `Ctrl+Shift+R` to open the responsive tester panel
2. **Using the indicator dot:** Click the small blue dot in the bottom-right corner of the screen

## Testing Features

### 1. Device Simulation

Use the dropdown menu to select different device simulations:
- **iPhone/iPad:** Shows mobile layout
- **MacBook:** Applies Mac-specific styles
- **Desktop:** Shows regular desktop view

### 2. Toggle Buttons

- **Toggle Mobile View:** Switches between desktop and mobile layouts
- **Toggle Mac Mode:** Enables/disables Mac-specific styles
- **Reset View:** Returns to original view

### 3. Browser Resizing

You can also manually resize your browser window:
- Width below 768px: Automatically switches to mobile layout
- Width above 768px: Uses desktop layout with proper responsive sizing

## Troubleshooting

If the responsive tester doesn't appear:
1. Refresh the page and try again
2. Check the browser console for any errors (F12 > Console tab)
3. Make sure all script files are properly loaded

## Testing Specific Issues

### Testing Mac Grid Layout Issues

1. Press `Ctrl+Shift+R` to open the tester
2. Click "Toggle Mac Mode" or select "macbook" from the dropdown
3. Verify that the grids maintain proper aspect ratio and alignment

### Testing Mobile Responsiveness

1. Press `Ctrl+Shift+R` to open the tester
2. Click "Toggle Mobile View" or select "iphone" from the dropdown
3. Verify that the mobile layout appears correctly with stacked grids

### Testing Window Resizing

1. Open the tester (`Ctrl+Shift+R`)
2. Manually resize your browser window
3. Verify that the layout adapts correctly at different window sizes

## Notes

- The red outline indicates you're in testing mode
- Changes are temporary and reset when you refresh the page
- The toolbar can be minimized by clicking the "-" button in the top-right corner 