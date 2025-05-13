# Responsive Features Documentation

This document provides information about the responsive design features implemented in this application.

## Overview

The application has been designed to support three main viewing modes:

1. **Desktop view** - For standard desktop screens
2. **Mobile view** - For smaller screens and mobile devices
3. **Mac-specific optimizations** - Special adjustments for Mac devices

## Responsive Breakpoints

- **Mobile/Responsive layout**: Window width ≤ 768px
- **Desktop layout**: Window width > 768px

## Platform Detection

The PlatformDetector utility automatically detects Mac devices and applies appropriate styles:

- It uses `navigator.platform` and `navigator.userAgent` to identify Mac devices
- It loads the Mac-specific CSS file for Mac users
- It applies additional adjustments for MacBook Air devices (screen height ≤ 900px and width ≤ 1440px)

## Responsive Features

### Desktop View Features

- Split-screen view with algorithms side by side
- Sidebar navigation with full controls
- Grid sizing that adapts to available screen space

### Mobile View Features

- Stacked algorithm view with grids one above the other
- Collapsible header with controls
- Touch-friendly interface with larger buttons
- Bottom navigation tools

### Mac-specific Optimizations

- Larger grid sizes to prevent display issues
- Improved aspect ratio management
- Fixed footer styling with proper text and icon rendering
- Improved container behavior
- GPU acceleration for smoother performance

## Implementation Details

- Window resizing is detected and handled automatically
- CSS media queries control most responsive behaviors
- JavaScript dynamically adjusts grid sizes for different devices
- CSS classes toggle between different display modes:
  - `.responsive-mode` - Mobile layout
  - `.mac-device` - Mac optimizations
  - `.macbook-air` - MacBook Air specific adjustments

## Maintenance Notes

If you need to modify the responsive behavior:

1. Desktop & general styles are in `main.css`
2. Mac-specific styles are in `mac-compatibility.css`
3. Platform detection logic is in `PlatformDetector.js`

When making changes, test across multiple device sizes and platforms to ensure consistent behavior. 