/**
 * Validation module for need forms
 */
const NeedValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate need name field
   * @param {string} value - The need name value
   * @returns {boolean} - True if valid
   */
  function validateNeedName(value) {
    // Need name should not be empty and should be at least 2 characters
    return utils.isNotEmpty(value) && value.trim().length >= 2;
  }

  /**
   * Validate short description field
   * @param {string} value - The short description value
   * @returns {boolean} - True if valid
   */
  function validateShortDescription(value) {
    // Short description is optional, but if provided should be at least 5 characters
    return value === '' || value.trim().length >= 5;
  }

  /**
   * Validate long description field
   * @param {string} value - The long description value
   * @returns {boolean} - True if valid
   */
  function validateLongDescription(value) {
    // Long description is optional, but if provided should be at least 10 characters
    return value === '' || value.trim().length >= 10;
  }

  /**
   * Set up validation for need form
   * @param {string} formId - ID of the form element
   */
  function setupFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Get form elements
    const needNameInput = form.querySelector('[name="need_name"]');
    const shortDescInput = form.querySelector('[name="need_short_desc"]');
    const longDescInput = form.querySelector('[name="need_long_desc"]');
    
    // Add input event listeners for real-time validation
    if (needNameInput) {
      needNameInput.addEventListener('input', function() {
        utils.validateField(
          this,
          validateNeedName,
          'Need name is required and must be at least 2 characters'
        );
      });
    }
    
    if (shortDescInput) {
      shortDescInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateShortDescription,
          'Short description, if provided, should be at least 5 characters'
        );
      });
    }

    if (longDescInput) {
      longDescInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateLongDescription,
          'Long description, if provided, should be at least 10 characters'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (needNameInput) {
        validations.push({
          field: needNameInput,
          validationFn: validateNeedName,
          errorMessage: 'Need name is required and must be at least 2 characters'
        });
      }
      
      if (shortDescInput) {
        validations.push({
          field: shortDescInput,
          validationFn: validateShortDescription,
          errorMessage: 'Short description, if provided, should be at least 5 characters'
        });
      }

      if (longDescInput) {
        validations.push({
          field: longDescInput,
          validationFn: validateLongDescription,
          errorMessage: 'Long description, if provided, should be at least 10 characters'
        });
      }
      
      // Validate all fields
      const isValid = utils.validateForm(validations);
      
      // If not valid, prevent form submission
      if (!isValid) {
        e.preventDefault();
      }
      // If valid, let the original handler process the form
    });
  }
  
  /**
   * Show feedback message to the user
   * @param {string} message - Message to display
   * @param {string} type - Type of message ('success' or 'error')
   */
  function showFeedback(message, type) {
    // Check if feedback element exists, create if not
    let feedbackEl = document.querySelector('.form-feedback');
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.className = 'form-feedback';
      
      // Insert at the top of the form
      const form = document.getElementById('needForm');
      form.insertBefore(feedbackEl, form.firstChild);
    }
    
    // Update class and message
    feedbackEl.className = `form-feedback ${type}`;
    feedbackEl.textContent = message;
    
    // Automatically clear after 5 seconds
    setTimeout(() => {
      feedbackEl.remove();
    }, 5000);
  }
  
  // Public API
  return {
    setupFormValidation: setupFormValidation,
    validateNeedName: validateNeedName,
    validateShortDescription: validateShortDescription,
    validateLongDescription: validateLongDescription
  };
})(); 