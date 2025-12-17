/**
 * NotificationSystem class - Manages game event notifications
 * Handles notification display, stacking, auto-dismiss, and visual feedback
 */
class NotificationSystem {
    /**
     * Create a new NotificationSystem instance
     * @param {string} containerId - ID of the notification container element
     */
    constructor(containerId = 'notifications') {
        this.containerId = containerId;
        this.notifications = new Map(); // Track active notifications by ID
        this.notificationCounter = 0;
        this.maxNotifications = 5; // Maximum number of notifications to show at once
        this.defaultDuration = 3000; // Default auto-dismiss time in milliseconds
        
        this.initializeContainer();
    }
    
    /**
     * Initialize the notification container
     */
    initializeContainer() {
        let container = document.getElementById(this.containerId);
        
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Ensure container has proper styling
        if (!container.classList.contains('notification-container')) {
            container.classList.add('notification-container');
        }
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info, income, warning)
     * @param {number} duration - Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
     * @returns {string} Notification ID for manual dismissal
     */
    showNotification(message, type = 'info', duration = null) {
        const notificationId = `notification-${++this.notificationCounter}`;
        const actualDuration = duration !== null ? duration : this.defaultDuration;
        
        // Create notification element
        const notification = this.createNotificationElement(notificationId, message, type);
        
        // Add to container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Notification container not found');
            return notificationId;
        }
        
        // Remove oldest notification if we're at the limit
        if (this.notifications.size >= this.maxNotifications) {
            this.removeOldestNotification();
        }
        
        // Add notification to container
        container.appendChild(notification);
        
        // Store notification reference
        this.notifications.set(notificationId, {
            element: notification,
            type: type,
            message: message,
            timestamp: Date.now(),
            duration: actualDuration
        });
        
        // Trigger entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Set up auto-dismiss if duration is specified
        if (actualDuration > 0) {
            setTimeout(() => {
                this.dismissNotification(notificationId);
            }, actualDuration);
        }
        
        // Set up manual dismiss on click
        notification.addEventListener('click', () => {
            this.dismissNotification(notificationId);
        });
        
        return notificationId;
    }
    
    /**
     * Create a notification element
     * @param {string} id - Notification ID
     * @param {string} message - Message to display
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    createNotificationElement(id, message, type) {
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification notification-${type}`;
        
        // Create notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        // Add icon based on type
        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        icon.textContent = this.getNotificationIcon(type);
        
        // Add message
        const messageElement = document.createElement('span');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        // Assemble notification
        content.appendChild(icon);
        content.appendChild(messageElement);
        content.appendChild(closeButton);
        notification.appendChild(content);
        
        // Add progress bar for timed notifications
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';
        notification.appendChild(progressBar);
        
        return notification;
    }
    
    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon character
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            income: '🪙'
        };
        
        return icons[type] || icons.info;
    }
    
    /**
     * Dismiss a specific notification
     * @param {string} notificationId - ID of notification to dismiss
     */
    dismissNotification(notificationId) {
        const notificationData = this.notifications.get(notificationId);
        if (!notificationData) {
            return; // Notification already dismissed
        }
        
        const notification = notificationData.element;
        
        // Trigger exit animation
        notification.classList.add('dismissing');
        
        // Remove after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(notificationId);
        }, 300); // Match CSS animation duration
    }
    
    /**
     * Remove the oldest notification to make room for new ones
     */
    removeOldestNotification() {
        let oldestId = null;
        let oldestTimestamp = Date.now();
        
        for (const [id, data] of this.notifications.entries()) {
            if (data.timestamp < oldestTimestamp) {
                oldestTimestamp = data.timestamp;
                oldestId = id;
            }
        }
        
        if (oldestId) {
            this.dismissNotification(oldestId);
        }
    }
    
    /**
     * Dismiss all notifications
     */
    dismissAll() {
        const notificationIds = Array.from(this.notifications.keys());
        notificationIds.forEach(id => this.dismissNotification(id));
    }
    
    /**
     * Show a success notification
     * @param {string} message - Success message
     * @param {number} duration - Auto-dismiss duration
     * @returns {string} Notification ID
     */
    showSuccess(message, duration = null) {
        return this.showNotification(message, 'success', duration);
    }
    
    /**
     * Show an error notification
     * @param {string} message - Error message
     * @param {number} duration - Auto-dismiss duration (default: longer for errors)
     * @returns {string} Notification ID
     */
    showError(message, duration = null) {
        const errorDuration = duration !== null ? duration : 5000; // Errors stay longer
        return this.showNotification(message, 'error', errorDuration);
    }
    
    /**
     * Show a warning notification
     * @param {string} message - Warning message
     * @param {number} duration - Auto-dismiss duration
     * @returns {string} Notification ID
     */
    showWarning(message, duration = null) {
        return this.showNotification(message, 'warning', duration);
    }
    
    /**
     * Show an info notification
     * @param {string} message - Info message
     * @param {number} duration - Auto-dismiss duration
     * @returns {string} Notification ID
     */
    showInfo(message, duration = null) {
        return this.showNotification(message, 'info', duration);
    }
    
    /**
     * Show an income notification with special formatting
     * @param {number} amount - Amount of coins earned
     * @param {string} source - Source of income (optional)
     * @param {number} duration - Auto-dismiss duration
     * @returns {string} Notification ID
     */
    showIncomeNotification(amount, source = '', duration = null) {
        const message = source ? 
            `+${amount.toFixed(1)} монет от ${source}!` : 
            `+${amount.toFixed(1)} монет заработано!`;
        
        return this.showNotification(message, 'income', duration);
    }
    
    /**
     * Show a purchase confirmation notification
     * @param {string} itemName - Name of purchased item
     * @param {Object} cost - Cost breakdown
     * @returns {string} Notification ID
     */
    showPurchaseNotification(itemName, cost) {
        const costParts = [];
        if (cost.coins > 0) costParts.push(`${cost.coins} монет`);
        if (cost.seeds > 0) costParts.push(`${cost.seeds} семян`);
        if (cost.water > 0) costParts.push(`${cost.water} воды`);
        
        const costText = costParts.length > 0 ? ` (${costParts.join(', ')})` : '';
        const message = `Куплено ${itemName}${costText}!`;
        
        return this.showSuccess(message);
    }
    
    /**
     * Show a plant growth completion notification
     * @param {string} plantName - Name of the plant
     * @param {number} income - Income earned
     * @returns {string} Notification ID
     */
    showPlantGrowthNotification(plantName, income) {
        const message = `${plantName} выросло! +${income} монет 🌱`;
        return this.showNotification(message, 'income', 2000); // Shorter duration for frequent events
    }
    
    /**
     * Show an upgrade purchase notification
     * @param {string} upgradeName - Name of the upgrade
     * @param {number} level - New level
     * @returns {string} Notification ID
     */
    showUpgradeNotification(upgradeName, level) {
        const message = `${upgradeName} улучшено до уровня ${level}! ⚡`;
        return this.showSuccess(message);
    }
    
    /**
     * Show a save/load notification
     * @param {string} action - 'saved' or 'loaded'
     * @param {boolean} success - Whether the action was successful
     * @returns {string} Notification ID
     */
    showSaveLoadNotification(action, success) {
        if (success) {
            const message = action === 'saved' ? 'Игра успешно сохранена!' : 'Игра успешно загружена!';
            return this.showSuccess(message, 2000);
        } else {
            const message = action === 'saved' ? 'Не удалось сохранить игру!' : 'Не удалось загрузить игру!';
            return this.showError(message);
        }
    }
    
    /**
     * Show an offline progress notification
     * @param {number} offlineTime - Time offline in milliseconds
     * @param {number} coinsEarned - Coins earned while offline
     * @returns {string} Notification ID
     */
    showOfflineProgressNotification(offlineTime, coinsEarned) {
        const hours = Math.floor(offlineTime / (1000 * 60 * 60));
        const minutes = Math.floor((offlineTime % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeText;
        if (hours > 0) {
            timeText = `${hours}ч ${minutes}м`;
        } else if (minutes > 0) {
            timeText = `${minutes}м`;
        } else {
            timeText = 'короткое время';
        }
        
        const message = `С возвращением! Вы отсутствовали ${timeText} и заработали ${coinsEarned.toFixed(1)} монет! 🪙`;
        return this.showNotification(message, 'success', 6000); // Longer duration for important info
    }
    
    /**
     * Get current notification count
     * @returns {number} Number of active notifications
     */
    getNotificationCount() {
        return this.notifications.size;
    }
    
    /**
     * Check if a specific notification is active
     * @param {string} notificationId - ID to check
     * @returns {boolean} True if notification is active
     */
    isNotificationActive(notificationId) {
        return this.notifications.has(notificationId);
    }
    
    /**
     * Get all active notifications
     * @returns {Array} Array of notification data objects
     */
    getActiveNotifications() {
        return Array.from(this.notifications.entries()).map(([id, data]) => ({
            id,
            type: data.type,
            message: data.message,
            timestamp: data.timestamp,
            duration: data.duration
        }));
    }
    
    /**
     * Set maximum number of notifications to display
     * @param {number} max - Maximum number of notifications
     */
    setMaxNotifications(max) {
        this.maxNotifications = Math.max(1, max);
        
        // Remove excess notifications if needed
        while (this.notifications.size > this.maxNotifications) {
            this.removeOldestNotification();
        }
    }
    
    /**
     * Set default auto-dismiss duration
     * @param {number} duration - Duration in milliseconds
     */
    setDefaultDuration(duration) {
        this.defaultDuration = Math.max(0, duration);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
} else if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
}