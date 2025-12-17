/**
 * UIFeedback class - Handles visual feedback and animations for UI interactions
 * Provides methods for button feedback, resource animations, and visual effects
 */
class UIFeedback {
    /**
     * Create a new UIFeedback instance
     */
    constructor() {
        this.activeAnimations = new Set();
        this.floatingNumbers = new Map();
    }
    
    /**
     * Add button press feedback to an element
     * @param {HTMLElement} element - Button element to animate
     * @param {string} type - Type of feedback ('success', 'error', 'info')
     */
    buttonFeedback(element, type = 'success') {
        if (!element) return;
        
        // Add ripple effect class
        element.classList.add('button-pressed');
        
        // Add type-specific flash
        const flashClass = `${type}-flash`;
        element.classList.add(flashClass);
        
        // Remove classes after animation
        setTimeout(() => {
            element.classList.remove('button-pressed', flashClass);
        }, 600);
    }
    
    /**
     * Animate resource counter changes
     * @param {HTMLElement} element - Resource display element
     * @param {number} oldValue - Previous value
     * @param {number} newValue - New value
     * @param {string} type - Resource type ('coins', 'seeds', 'water')
     */
    animateResourceChange(element, oldValue, newValue, type = 'coins') {
        if (!element) return;
        
        const change = newValue - oldValue;
        if (change === 0) return;
        
        // Update the display value with animation
        this.animateNumberChange(element, oldValue, newValue);
        
        // Add resource change class
        const changeClass = change > 0 ? 'resource-increase' : 'resource-decrease';
        element.classList.add(changeClass);
        
        // Create floating change indicator
        this.createFloatingNumber(element, change, type);
        
        // Remove animation class
        setTimeout(() => {
            element.classList.remove(changeClass);
        }, 600);
    }
    
    /**
     * Animate number changes with counting effect
     * @param {HTMLElement} element - Element containing the number
     * @param {number} startValue - Starting value
     * @param {number} endValue - Ending value
     * @param {number} duration - Animation duration in milliseconds
     */
    animateNumberChange(element, startValue, endValue, duration = 500) {
        if (!element) return;
        
        const startTime = Date.now();
        const difference = endValue - startValue;
        
        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = this.easeOutCubic(progress);
            const currentValue = startValue + (difference * easedProgress);
            
            // Format number based on type
            if (Number.isInteger(endValue)) {
                element.textContent = Math.round(currentValue).toLocaleString();
            } else {
                element.textContent = currentValue.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = endValue.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    /**
     * Create floating number indicator
     * @param {HTMLElement} parentElement - Element to attach floating number to
     * @param {number} change - Amount that changed
     * @param {string} type - Type of resource or change
     */
    createFloatingNumber(parentElement, change, type = 'coins') {
        if (!parentElement || change === 0) return;
        
        const rect = parentElement.getBoundingClientRect();
        const floatingNumber = document.createElement('div');
        
        // Set up floating number
        floatingNumber.className = 'floating-income';
        floatingNumber.textContent = this.formatFloatingNumber(change, type);
        
        // Position relative to parent
        floatingNumber.style.position = 'fixed';
        floatingNumber.style.left = (rect.right + 10) + 'px';
        floatingNumber.style.top = rect.top + 'px';
        floatingNumber.style.zIndex = '1000';
        floatingNumber.style.pointerEvents = 'none';
        
        // Style based on change type
        if (change > 0) {
            floatingNumber.style.color = '#4caf50';
        } else {
            floatingNumber.style.color = '#f44336';
        }
        
        document.body.appendChild(floatingNumber);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingNumber.parentNode) {
                floatingNumber.parentNode.removeChild(floatingNumber);
            }
        }, 1500);
    }
    
    /**
     * Format floating number display
     * @param {number} change - Amount that changed
     * @param {string} type - Type of resource
     * @returns {string} Formatted display string
     */
    formatFloatingNumber(change, type) {
        const prefix = change > 0 ? '+' : '';
        const icon = this.getResourceIcon(type);
        
        if (type === 'coins' && Math.abs(change) >= 1000) {
            return `${prefix}${(change / 1000).toFixed(1)}k ${icon}`;
        }
        
        return `${prefix}${change.toFixed(1)} ${icon}`;
    }
    
    /**
     * Get icon for resource type
     * @param {string} type - Resource type
     * @returns {string} Icon character
     */
    getResourceIcon(type) {
        const icons = {
            coins: '🪙',
            seeds: '🌰',
            water: '💧',
            income: '🪙'
        };
        
        return icons[type] || '';
    }
    
    /**
     * Animate plant placement in garden slot
     * @param {HTMLElement} slotElement - Garden slot element
     */
    animatePlantPlacement(slotElement) {
        if (!slotElement) return;
        
        const plantDisplay = slotElement.querySelector('.plant-display');
        if (plantDisplay) {
            plantDisplay.classList.add('plant-place');
            
            // Remove animation class after completion
            setTimeout(() => {
                plantDisplay.classList.remove('plant-place');
            }, 600);
        }
    }
    
    /**
     * Animate income generation with pulse effect
     * @param {HTMLElement} element - Income display element
     */
    animateIncomeGeneration(element) {
        if (!element) return;
        
        element.classList.add('income-animation');
        
        setTimeout(() => {
            element.classList.remove('income-animation');
        }, 600);
    }
    
    /**
     * Show loading state on element
     * @param {HTMLElement} element - Element to show loading on
     * @param {boolean} show - Whether to show or hide loading
     */
    setLoadingState(element, show = true) {
        if (!element) return;
        
        if (show) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }
    
    /**
     * Animate shop item selection
     * @param {HTMLElement} selectedItem - Newly selected item
     * @param {HTMLElement} previousItem - Previously selected item (optional)
     */
    animateShopSelection(selectedItem, previousItem = null) {
        if (previousItem) {
            previousItem.classList.remove('selected');
        }
        
        if (selectedItem) {
            selectedItem.classList.add('selected');
            
            // Add selection pulse
            selectedItem.style.animation = 'none';
            setTimeout(() => {
                selectedItem.style.animation = '';
            }, 10);
        }
    }
    
    /**
     * Animate upgrade purchase success
     * @param {HTMLElement} upgradeElement - Upgrade item element
     */
    animateUpgradePurchase(upgradeElement) {
        if (!upgradeElement) return;
        
        upgradeElement.classList.add('success-flash');
        
        setTimeout(() => {
            upgradeElement.classList.remove('success-flash');
        }, 600);
    }
    
    /**
     * Animate progress bar updates
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} newProgress - New progress percentage (0-100)
     */
    animateProgressUpdate(progressBar, newProgress) {
        if (!progressBar) return;
        
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const targetWidth = Math.min(Math.max(newProgress, 0), 100);
        
        // Animate width change
        progressBar.style.transition = 'width 0.3s ease-out';
        progressBar.style.width = targetWidth + '%';
        
        // Add shine effect for significant progress
        if (targetWidth - currentWidth > 10) {
            progressBar.classList.add('progress-shine');
            setTimeout(() => {
                progressBar.classList.remove('progress-shine');
            }, 2000);
        }
    }
    
    /**
     * Easing function for smooth animations
     * @param {number} t - Progress value (0-1)
     * @returns {number} Eased value
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Easing function for bounce effect
     * @param {number} t - Progress value (0-1)
     * @returns {number} Eased value
     */
    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
    
    /**
     * Clean up any active animations
     */
    cleanup() {
        this.activeAnimations.clear();
        this.floatingNumbers.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIFeedback;
} else if (typeof window !== 'undefined') {
    window.UIFeedback = UIFeedback;
}