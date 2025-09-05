/**
 * BURGERCRAFT - ENHANCED FOOD ORDERING APPLICATION
 * 
 * Key Features Implemented:
 * 1. Hamburger Type column display
 * 2. User confirmation system with order details
 * 3. Phone number display in order summary
 * 4. Organized table/list format for all data
 * 5. Modern responsive design with smooth animations
 * 
 * Technical Improvements:
 * - Clean, modular JavaScript code
 * - Proper error handling and validation
 * - Accessibility features
 * - Mobile-responsive interactions
 * - Local storage for order persistence
 */

class BurgerCraftApp {
    constructor() {
        this.orders = this.loadOrdersFromStorage();
        this.orderCounter = this.loadOrderCounterFromStorage();
        this.currentOrder = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderOrders();
        this.updateEmptyState();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Form elements
        this.orderForm = document.getElementById('orderForm');
        this.customerNameInput = document.getElementById('customerName');
        this.phoneNumberInput = document.getElementById('phoneNumber');
        this.hamburgerTypeInputs = document.querySelectorAll('input[name="hamburgerType"]');
        this.quantitySelect = document.getElementById('quantity');
        this.specialInstructionsTextarea = document.getElementById('specialInstructions');

        // Modal elements
        this.confirmationModal = document.getElementById('confirmationModal');
        this.successModal = document.getElementById('successModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.editOrderBtn = document.getElementById('editOrder');
        this.confirmOrderBtn = document.getElementById('confirmOrder');
        this.closeSuccessModalBtn = document.getElementById('closeSuccessModal');

        // Confirmation modal content elements
        this.confirmNameSpan = document.getElementById('confirmName');
        this.confirmPhoneSpan = document.getElementById('confirmPhone');
        this.confirmBurgerSpan = document.getElementById('confirmBurger');
        this.confirmQuantitySpan = document.getElementById('confirmQuantity');
        this.confirmInstructionsSpan = document.getElementById('confirmInstructions');
        this.confirmTotalSpan = document.getElementById('confirmTotal');
        this.orderNumberSpan = document.getElementById('orderNumber');

        // Table elements
        this.ordersTableBody = document.getElementById('ordersTableBody');
        this.emptyState = document.getElementById('emptyState');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        this.orderForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Modal controls
        this.closeModalBtn.addEventListener('click', () => this.closeConfirmationModal());
        this.editOrderBtn.addEventListener('click', () => this.closeConfirmationModal());
        this.confirmOrderBtn.addEventListener('click', () => this.confirmOrder());
        this.closeSuccessModalBtn.addEventListener('click', () => this.closeSuccessModal());

        // Close modals when clicking outside
        this.confirmationModal.addEventListener('click', (e) => {
            if (e.target === this.confirmationModal) {
                this.closeConfirmationModal();
            }
        });

        this.successModal.addEventListener('click', (e) => {
            if (e.target === this.successModal) {
                this.closeSuccessModal();
            }
        });

        // Keyboard navigation for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.confirmationModal.classList.contains('active')) {
                    this.closeConfirmationModal();
                }
                if (this.successModal.classList.contains('active')) {
                    this.closeSuccessModal();
                }
            }
        });

        // Real-time form validation
        this.customerNameInput.addEventListener('input', () => this.validateField(this.customerNameInput));
        this.phoneNumberInput.addEventListener('input', () => this.validatePhoneNumber());
    }

    /**
     * Handle form submission and show confirmation modal
     */
    handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showFormErrors();
            return;
        }

        // Collect form data
        const formData = this.collectFormData();
        this.currentOrder = formData;

        // Populate confirmation modal
        this.populateConfirmationModal(formData);

        // Show confirmation modal
        this.showConfirmationModal();
    }

    /**
     * Collect and structure form data
     */
    collectFormData() {
        const selectedBurger = document.querySelector('input[name="hamburgerType"]:checked');
        const quantity = parseInt(this.quantitySelect.value);
        const burgerPrice = this.getBurgerPrice(selectedBurger.value);
        const totalPrice = burgerPrice * quantity;

        return {
            customerName: this.customerNameInput.value.trim(),
            phoneNumber: this.phoneNumberInput.value.trim(),
            hamburgerType: selectedBurger.value,
            quantity: quantity,
            specialInstructions: this.specialInstructionsTextarea.value.trim() || 'None',
            unitPrice: burgerPrice,
            totalPrice: totalPrice,
            status: 'Pending',
            orderDate: new Date().toISOString(),
            orderId: this.generateOrderId()
        };
    }

    /**
     * Get burger price based on type
     */
    getBurgerPrice(burgerType) {
        const prices = {
            'Classic Beef Burger': 12.99,
            'Grilled Chicken Burger': 11.99,
            'Plant-Based Veggie Burger': 10.99,
            'Deluxe BBQ Burger': 15.99
        };
        return prices[burgerType] || 12.99;
    }

    /**
     * Generate unique order ID
     */
    generateOrderId() {
        this.orderCounter++;
        this.saveOrderCounterToStorage();
        return `BC${String(this.orderCounter).padStart(4, '0')}`;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;

        // Validate customer name
        if (!this.customerNameInput.value.trim()) {
            this.showFieldError(this.customerNameInput, 'Customer name is required');
            isValid = false;
        }

        // Validate phone number
        if (!this.phoneNumberInput.value.trim()) {
            this.showFieldError(this.phoneNumberInput, 'Phone number is required');
            isValid = false;
        } else if (!this.isValidPhoneNumber(this.phoneNumberInput.value)) {
            this.showFieldError(this.phoneNumberInput, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate burger selection
        const selectedBurger = document.querySelector('input[name="hamburgerType"]:checked');
        if (!selectedBurger) {
            this.showError('Please select a burger type');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        if (field.value.trim()) {
            this.clearFieldError(field);
            return true;
        }
        return false;
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber() {
        const phoneValue = this.phoneNumberInput.value.trim();
        if (phoneValue && this.isValidPhoneNumber(phoneValue)) {
            this.clearFieldError(this.phoneNumberInput);
            return true;
        } else if (phoneValue) {
            this.showFieldError(this.phoneNumberInput, 'Please enter a valid phone number');
        }
        return false;
    }

    /**
     * Check if phone number is valid
     */
    isValidPhoneNumber(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\(]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Show field-specific error
     */
    showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        field.style.backgroundColor = '#fdf2f2';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error styling
     */
    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Show general error message
     */
    showError(message) {
        // Create or update error notification
        let errorNotification = document.querySelector('.error-notification');
        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.className = 'error-notification';
            errorNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
                z-index: 1001;
                font-weight: 500;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(errorNotification);
        }

        errorNotification.textContent = message;
        
        // Animate in
        setTimeout(() => {
            errorNotification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            errorNotification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (errorNotification.parentNode) {
                    errorNotification.parentNode.removeChild(errorNotification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Show form validation errors
     */
    showFormErrors() {
        this.showError('Please fill in all required fields correctly');
        
        // Scroll to first error field
        const firstErrorField = document.querySelector('.error-message');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Populate confirmation modal with order details
     */
    populateConfirmationModal(orderData) {
        this.confirmNameSpan.textContent = orderData.customerName;
        this.confirmPhoneSpan.textContent = orderData.phoneNumber;
        this.confirmBurgerSpan.textContent = orderData.hamburgerType;
        this.confirmQuantitySpan.textContent = orderData.quantity;
        this.confirmInstructionsSpan.textContent = orderData.specialInstructions;
        this.confirmTotalSpan.textContent = `$${orderData.totalPrice.toFixed(2)}`;
    }

    /**
     * Show confirmation modal
     */
    showConfirmationModal() {
        this.confirmationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on confirm button for accessibility
        setTimeout(() => {
            this.confirmOrderBtn.focus();
        }, 300);
    }

    /**
     * Close confirmation modal
     */
    closeConfirmationModal() {
        this.confirmationModal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentOrder = null;
    }

    /**
     * Confirm and process the order
     */
    confirmOrder() {
        if (!this.currentOrder) return;

        // Add order to the list
        this.orders.unshift(this.currentOrder);
        this.saveOrdersToStorage();

        // Update order number in success modal
        this.orderNumberSpan.textContent = this.currentOrder.orderId;

        // Close confirmation modal and show success modal
        this.closeConfirmationModal();
        this.showSuccessModal();

        // Re-render orders table
        this.renderOrders();
        this.updateEmptyState();

        // Reset form
        this.resetForm();

        // Show success notification
        this.showSuccessNotification();
    }

    /**
     * Show success modal
     */
    showSuccessModal() {
        this.successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on close button for accessibility
        setTimeout(() => {
            this.closeSuccessModalBtn.focus();
        }, 300);
    }

    /**
     * Close success modal
     */
    closeSuccessModal() {
        this.successModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Show success notification
     */
    showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
            z-index: 1001;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            Order placed successfully!
        `;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Reset the order form
     */
    resetForm() {
        this.orderForm.reset();
        
        // Clear any error styling
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const inputs = document.querySelectorAll('.input, .select, .textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });

        // Scroll to top of form
        this.orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Render orders in the table
     */
    renderOrders() {
        this.ordersTableBody.innerHTML = '';

        if (this.orders.length === 0) {
            return;
        }

        this.orders.forEach((order, index) => {
            const row = this.createOrderRow(order, index);
            this.ordersTableBody.appendChild(row);
        });

        // Add fade-in animation to new rows
        const rows = this.ordersTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Create a table row for an order
     */
    createOrderRow(order, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight: 600; color: #2C3E50;">${order.customerName}</div>
                <div style="font-size: 0.85rem; color: #7F8C8D;">Order #${order.orderId}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${order.phoneNumber}</div>
            </td>
            <td>
                <div style="font-weight: 600; color: #FF6B35;">${order.hamburgerType}</div>
                <div style="font-size: 0.85rem; color: #7F8C8D;">$${order.unitPrice.toFixed(2)} each</div>
            </td>
            <td>
                <span style="
                    background: linear-gradient(135deg, #FF6B35, #F39C12);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 15px;
                    font-weight: 600;
                    font-size: 0.9rem;
                ">${order.quantity}</span>
            </td>
            <td>
                <div style="max-width: 200px; word-wrap: break-word;">
                    ${order.specialInstructions}
                </div>
            </td>
            <td>
                <span class="status-badge ${order.status.toLowerCase() === 'pending' ? 'status-pending' : 'status-confirmed'}">
                    ${order.status}
                </span>
            </td>
            <td>
                <div style="font-weight: 700; font-size: 1.1rem; color: #27AE60;">
                    $${order.totalPrice.toFixed(2)}
                </div>
            </td>
        `;

        // Add click handler for row interaction
        row.addEventListener('click', () => {
            this.highlightRow(row);
        });

        return row;
    }

    /**
     * Highlight selected row
     */
    highlightRow(row) {
        // Remove previous highlights
        const previousHighlight = document.querySelector('.row-highlighted');
        if (previousHighlight) {
            previousHighlight.classList.remove('row-highlighted');
        }

        // Add highlight to clicked row
        row.classList.add('row-highlighted');
        
        // Add CSS for highlight if not exists
        if (!document.querySelector('#highlight-style')) {
            const style = document.createElement('style');
            style.id = 'highlight-style';
            style.textContent = `
                .row-highlighted {
                    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(243, 156, 18, 0.1)) !important;
                    transform: scale(1.02) !important;
                    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2) !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Remove highlight after 2 seconds
        setTimeout(() => {
            row.classList.remove('row-highlighted');
        }, 2000);
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState() {
        if (this.orders.length === 0) {
            this.emptyState.style.display = 'block';
            this.ordersTableBody.parentElement.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.ordersTableBody.parentElement.style.display = 'table';
        }
    }

    /**
     * Save orders to localStorage
     */
    saveOrdersToStorage() {
        try {
            localStorage.setItem('burgercraft_orders', JSON.stringify(this.orders));
        } catch (error) {
            console.warn('Could not save orders to localStorage:', error);
        }
    }

    /**
     * Load orders from localStorage
     */
    loadOrdersFromStorage() {
        try {
            const stored = localStorage.getItem('burgercraft_orders');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Could not load orders from localStorage:', error);
            return [];
        }
    }

    /**
     * Save order counter to localStorage
     */
    saveOrderCounterToStorage() {
        try {
            localStorage.setItem('burgercraft_order_counter', this.orderCounter.toString());
        } catch (error) {
            console.warn('Could not save order counter to localStorage:', error);
        }
    }

    /**
     * Load order counter from localStorage
     */
    loadOrderCounterFromStorage() {
        try {
            const stored = localStorage.getItem('burgercraft_order_counter');
            return stored ? parseInt(stored) : 1000;
        } catch (error) {
            console.warn('Could not load order counter from localStorage:', error);
            return 1000;
        }
    }
}

/**
 * Utility Functions
 */

// Format phone number for display
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main application
    const app = new BurgerCraftApp();
    
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToElement(targetId);
        });
    });

    // Add loading animation to page
    document.body.classList.add('fade-in-up');

    // Performance optimization: Lazy load images if any
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Alt + M to focus on menu
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            scrollToElement('menu');
        }
        
        // Alt + O to focus on orders
        if (e.altKey && e.key === 'o') {
            e.preventDefault();
            scrollToElement('orders');
        }
    });

    console.log('🍔 BurgerCraft Application Initialized Successfully!');
    console.log('📱 Responsive design active');
    console.log('♿ Accessibility features enabled');
    console.log('💾 Local storage persistence active');
});