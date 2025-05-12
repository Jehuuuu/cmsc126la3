/**
 * Toast Notification System
 * Displays stylish toast messages for various app events
 */
class ToastNotification {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
        this.toastTimeout = 3000; // Duration in ms that toasts remain visible
        this.activeToast = null; // Track the currently active toast
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', or 'info'
     * @param {object} options - Additional options like duration
     */
    show(message, type = 'info', options = {}) {
        // Clear existing toasts before showing a new one
        this.clear();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Set icon based on type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle toast-icon"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
                break;
            case 'info':
            default:
                icon = '<i class="fas fa-info-circle toast-icon"></i>';
                break;
        }
        
        toast.innerHTML = `
            ${icon}
            <div class="toast-content">${message}</div>
        `;
        
        this.container.appendChild(toast);
        
        // Show the toast (small delay for animation to work properly)
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Set timeout to remove toast
        const duration = options.duration || this.toastTimeout;
        const timeout = setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        // Store toast and its timeout
        this.activeToast = { element: toast, timeout };
        this.toasts = [this.activeToast];
        
        // Return the toast element in case we need to reference it later
        return toast;
    }
    
    /**
     * Success toast - green border
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    /**
     * Error toast - red border
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }
    
    /**
     * Info toast - blue border
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
    
    /**
     * Remove a specific toast
     */
    removeToast(toast) {
        // Find the index of the toast
        const index = this.toasts.findIndex(t => t.element === toast);
        if (index !== -1) {
            // Clear its timeout
            clearTimeout(this.toasts[index].timeout);
            // Remove from array
            this.toasts.splice(index, 1);
        }
        
        // If this was the active toast, clear it
        if (this.activeToast && this.activeToast.element === toast) {
            this.activeToast = null;
        }
        
        // Remove the 'show' class to trigger the hiding animation
        toast.classList.remove('show');
        
        // Remove the element after animation completes
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 400); // Match the CSS transition time
    }
    
    /**
     * Clear all toasts
     */
    clear() {
        // Clear all timeouts
        this.toasts.forEach(toast => {
            clearTimeout(toast.timeout);
            this.removeToast(toast.element);
        });
        this.toasts = [];
        this.activeToast = null;
    }
}

// Create a global instance
window.Toast = new ToastNotification(); 