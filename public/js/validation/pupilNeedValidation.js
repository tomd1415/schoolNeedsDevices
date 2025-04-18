/**
 * Validation module for pupil-need assignment forms
 */
const PupilNeedValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate pupil selection
   * @param {string} value - The selected pupil ID
   * @returns {boolean} - True if valid
   */
  function validatePupilSelection(value) {
    // Pupil should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Validate category selection
   * @param {string} value - The selected category ID
   * @returns {boolean} - True if valid
   */
  function validateCategorySelection(value) {
    // Category should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Validate need selection
   * @param {string} value - The selected need ID
   * @returns {boolean} - True if valid
   */
  function validateNeedSelection(value) {
    // Need should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Set up validation for the assign category form
   * @param {string} formId - ID of the form element
   */
  function setupCategoryFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Get form elements
    const categorySelect = form.querySelector('[name="category_id"]');
    
    // Add event listeners for real-time validation
    if (categorySelect) {
      categorySelect.addEventListener('change', function() {
        utils.validateField(
          this,
          validateCategorySelection,
          'Please select a category'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (categorySelect) {
        validations.push({
          field: categorySelect,
          validationFn: validateCategorySelection,
          errorMessage: 'Please select a category'
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
   * Set up validation for the add need form
   * @param {string} formId - ID of the form element
   */
  function setupAddNeedFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Get form elements
    const needSelect = form.querySelector('[name="need_id"]');
    
    // Add event listeners for real-time validation
    if (needSelect) {
      needSelect.addEventListener('change', function() {
        utils.validateField(
          this,
          validateNeedSelection,
          'Please select a need to add'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (needSelect) {
        validations.push({
          field: needSelect,
          validationFn: validateNeedSelection,
          errorMessage: 'Please select a need to add'
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
   * Set up validation for the remove need form
   * @param {string} formId - ID of the form element
   */
  function setupRemoveNeedFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Get form elements
    const needSelect = form.querySelector('[name="need_id"]');
    
    // Add event listeners for real-time validation
    if (needSelect) {
      needSelect.addEventListener('change', function() {
        utils.validateField(
          this,
          validateNeedSelection,
          'Please select a need to remove'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (needSelect) {
        validations.push({
          field: needSelect,
          validationFn: validateNeedSelection,
          errorMessage: 'Please select a need to remove'
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
   * Set up validation for pupil selection
   * @param {string} selectId - ID of the select element
   */
  function setupPupilSelectValidation(selectId) {
    const select = document.getElementById(selectId);
    
    if (!select) {
      console.error(`Select with ID ${selectId} not found`);
      return;
    }
    
    // Add event listener for real-time validation
    select.addEventListener('change', function() {
      utils.validateField(
        this,
        validatePupilSelection,
        'Please select a pupil'
      );
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
      
      // Insert at the top of the main element
      const main = document.querySelector('main');
      main.insertBefore(feedbackEl, main.firstChild);
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
    setupCategoryFormValidation: setupCategoryFormValidation,
    setupAddNeedFormValidation: setupAddNeedFormValidation,
    setupRemoveNeedFormValidation: setupRemoveNeedFormValidation,
    setupPupilSelectValidation: setupPupilSelectValidation,
    validatePupilSelection: validatePupilSelection,
    validateCategorySelection: validateCategorySelection,
    validateNeedSelection: validateNeedSelection
  };
})(); 