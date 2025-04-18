/**
 * Validation utility functions for the School Needs Devices application
 */

const ValidationUtils = {
  /**
   * Validates that a field has a value
   * @param {string} value - The value to check
   * @returns {boolean} - True if valid
   */
  isNotEmpty: function(value) {
    return value !== null && value !== undefined && value.trim() !== '';
  },

  /**
   * Validates that a value is numeric
   * @param {string} value - The value to check
   * @returns {boolean} - True if valid
   */
  isNumeric: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  /**
   * Validates that a value is an integer
   * @param {string} value - The value to check
   * @returns {boolean} - True if valid
   */
  isInteger: function(value) {
    return Number.isInteger(Number(value));
  },

  /**
   * Validates that a value is within a specified range
   * @param {number} value - The value to check
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {boolean} - True if valid
   */
  isInRange: function(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  /**
   * Validates that a value is a valid date string
   * @param {string} value - The date string to check
   * @returns {boolean} - True if valid
   */
  isValidDate: function(value) {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  /**
   * Validates that a value matches a regex pattern
   * @param {string} value - The value to check
   * @param {RegExp} pattern - The regex pattern
   * @returns {boolean} - True if valid
   */
  matchesPattern: function(value, pattern) {
    return pattern.test(value);
  },

  /**
   * Validates that a value is a valid name (letters, spaces, hyphens, apostrophes)
   * @param {string} value - The name to check
   * @returns {boolean} - True if valid
   */
  isValidName: function(value) {
    return /^[A-Za-z\s\-']+$/.test(value);
  },

  /**
   * Updates the submit button state based on form validation
   * @param {HTMLFormElement} form - The form to check
   */
  updateSubmitButtonState: function(form) {
    if (!form) return;
    
    // Find all submit buttons in the form
    const submitButtons = form.querySelectorAll('button[type="submit"]');
    
    // Check if any required fields are empty or have error messages
    const hasEmptyRequiredFields = Array.from(form.querySelectorAll('[required]')).some(
      field => !field.value.trim()
    );
    
    const hasErrors = form.querySelectorAll('.validation-error, .invalid').length > 0;
    
    // Update button disabled state
    submitButtons.forEach(button => {
      button.disabled = hasEmptyRequiredFields || hasErrors;
    });
  },

  /**
   * Validates a form field and displays an error message if invalid
   * @param {HTMLElement} field - The form field to validate
   * @param {function} validationFn - The validation function to use
   * @param {string} errorMessage - The error message to display if validation fails
   * @returns {boolean} - True if valid
   */
  validateField: function(field, validationFn, errorMessage) {
    const isValid = validationFn(field.value);
    
    // Remove any existing error message
    this.clearFieldError(field);
    
    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }
    
    // Update the form's submit button state
    this.updateSubmitButtonState(field.form);
    
    return isValid;
  },

  /**
   * Shows an error message for a field
   * @param {HTMLElement} field - The field with the error
   * @param {string} message - The error message
   */
  showFieldError: function(field, message) {
    // First clear any existing error
    this.clearFieldError(field);
    
    // Add error class to the field
    field.classList.add('invalid');
    
    // Create and append error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    
    // Insert after the field
    if (field.nextSibling) {
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    } else {
      field.parentNode.appendChild(errorElement);
    }
    
    // Update submit button state
    this.updateSubmitButtonState(field.form);
  },

  /**
   * Clears any error message for a field
   * @param {HTMLElement} field - The field to clear errors for
   */
  clearFieldError: function(field) {
    // Remove error class
    field.classList.remove('invalid');
    
    // Remove any error message elements
    const nextElement = field.nextElementSibling;
    if (nextElement && nextElement.className === 'validation-error') {
      nextElement.parentNode.removeChild(nextElement);
    }
    
    // Update submit button state
    this.updateSubmitButtonState(field.form);
  },

  /**
   * Validates an entire form
   * @param {array} validations - Array of validation objects with field, validationFn, and errorMessage
   * @returns {boolean} - True if all validations pass
   */
  validateForm: function(validations) {
    let isValid = true;
    
    validations.forEach(v => {
      if (!this.validateField(v.field, v.validationFn, v.errorMessage)) {
        isValid = false;
      }
    });
    
    // Update submit button state based on form validation
    if (validations.length > 0) {
      this.updateSubmitButtonState(validations[0].field.form);
    }
    
    return isValid;
  },

  /**
   * Initialize a form to validate required fields and update submit button state on load
   * @param {string} formId - ID of the form element
   */
  initializeForm: function(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Initial validation of required fields
    const requiredFields = form.querySelectorAll('[required]');
    let hasEmptyRequired = false;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        hasEmptyRequired = true;
      }
    });
    
    // Initial button state
    const submitButtons = form.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
      button.disabled = hasEmptyRequired;
    });
    
    // Set up input event listeners for required fields to continuously validate
    requiredFields.forEach(field => {
      field.addEventListener('input', () => {
        this.updateSubmitButtonState(form);
      });
    });
  }
};

// Export the ValidationUtils object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationUtils;
} 