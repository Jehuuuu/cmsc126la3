/**
 * ToastNotification.js
 * Lightweight toast notification system for displaying temporary feedback messages
 */

//=============================================================================
// TOAST NOTIFICATION SYSTEM
//=============================================================================

class ToastNotification {
    //=============================================================================
    // INITIALIZATION
    //=============================================================================
    
    /**
     * Create a new ToastNotification system
     */
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toastTimeout = 3000; // Default duration (ms) that toasts remain visible
        this.activeToast = null;  // Track the currently active toast
        
        // Icons for different toast types
        this.icons = {
            success: '<i class="fas fa-check-circle toast-icon"></i>',
            error: '<i class="fas fa-exclamation-circle toast-icon"></i>',
            warning: '<i class="fas fa-exclamation-triangle toast-icon"></i>',
            info: '<i class="fas fa-info-circle toast-icon"></i>'
        };
    }

    //=============================================================================
    // TOAST CREATION
    //=============================================================================
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'warning', or 'info'
     * @param {object} options - Additional options
     * @param {number} [options.duration] - Time in ms to display the toast
     * @returns {HTMLElement} The toast element
     */
    show(message, type = 'info', options = {}) {
        // Clear any existing toast
        if (this.activeToast) {
            this.removeToast(this.activeToast.element);
        }
        
        // Create new toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Get icon based on type
        const icon = this.icons[type] || this.icons.info;
        
        // Set toast content
        toast.innerHTML = `
            ${icon}
            <div class="toast-content">${message}</div>
        `;
        
        // Add to container
        this.container.appendChild(toast);
        
        // Show with slight delay for animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });
        
        // Set timeout to auto-remove toast
        const duration = options.duration || this.toastTimeout;
        const timeout = setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        // Store toast reference
        this.activeToast = { element: toast, timeout };
        
        return toast;
    }
    
    /**
     * Show a success toast notification (green)
     * @param {string} message - The message to display
     * @param {object} options - Additional options
     * @returns {HTMLElement} The toast element
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    /**
     * Show an error toast notification (red)
     * @param {string} message - The message to display
     * @param {object} options - Additional options
     * @returns {HTMLElement} The toast element
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }
    
    /**
     * Show a warning toast notification (orange/yellow)
     * @param {string} message - The message to display
     * @param {object} options - Additional options
     * @returns {HTMLElement} The toast element
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }
    
    /**
     * Show an info toast notification (blue)
     * @param {string} message - The message to display
     * @param {object} options - Additional options
     * @returns {HTMLElement} The toast element
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
    
    //=============================================================================
    // TOAST MANAGEMENT
    //=============================================================================
    
    /**
     * Remove a specific toast
     * @param {HTMLElement} toast - The toast element to remove
     */
    removeToast(toast) {
        // Clear timeout if associated with active toast
        if (this.activeToast && this.activeToast.element === toast) {
            clearTimeout(this.activeToast.timeout);
            this.activeToast = null;
        }
        
        // Start hiding animation
        toast.classList.remove('show');
        
        // Remove after animation completes
        const ANIMATION_DURATION = 400; // Match CSS transition time
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, ANIMATION_DURATION);
    }
    
    /**
     * Clear any active toast notification
     */
    clear() {
        if (this.activeToast) {
            clearTimeout(this.activeToast.timeout);
            this.removeToast(this.activeToast.element);
            this.activeToast = null;
        }
    }
}

// Create a global instance
window.Toast = new ToastNotification(); 