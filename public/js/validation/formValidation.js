/**
 * Validation module for school form forms
 */
const FormValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate form name field
   * @param {string} value - The form name value
   * @returns {boolean} - True if valid
   */
  function validateFormName(value) {
    // Form name should not be empty and should be at least 2 characters
    return utils.isNotEmpty(value) && value.trim().length >= 2;
  }

  /**
   * Validate form year field
   * @param {string} value - The form year value
   * @returns {boolean} - True if valid
   */
  function validateFormYear(value) {
    // Form year should be a valid integer and typically 7-13 for UK schools
    return utils.isInteger(value) && utils.isInRange(parseInt(value), 1, 13);
  }

  /**
   * Validate teacher name field (optional but if provided should be a valid name)
   * @param {string} value - The teacher name value
   * @returns {boolean} - True if valid
   */
  function validateTeacherName(value) {
    // Teacher name is optional, but if provided should be a valid name
    return value === '' || utils.isValidName(value);
  }

  /**
   * Set up validation for form form
   * @param {string} formId - ID of the form element
   */
  function setupFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Initialize form validation and submit button state
    utils.initializeForm(formId);

    // Get form elements
    const formNameInput = form.querySelector('[name="form_name"]');
    const formYearInput = form.querySelector('[name="form_year"]');
    const teacherNameInput = form.querySelector('[name="teacher_name"]');
    
    // Add input event listeners for real-time validation
    if (formNameInput) {
      formNameInput.addEventListener('input', function() {
        utils.validateField(
          this,
          validateFormName,
          'Form name is required and must be at least 2 characters'
        );
      });
    }
    
    if (formYearInput) {
      formYearInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateFormYear,
          'Form year must be a number between 1 and 13'
        );
      });
    }

    if (teacherNameInput) {
      teacherNameInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateTeacherName,
          'Teacher name, if provided, must contain only letters, spaces, hyphens or apostrophes'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (formNameInput) {
        validations.push({
          field: formNameInput,
          validationFn: validateFormName,
          errorMessage: 'Form name is required and must be at least 2 characters'
        });
      }
      
      if (formYearInput) {
        validations.push({
          field: formYearInput,
          validationFn: validateFormYear,
          errorMessage: 'Form year must be a number between 1 and 13'
        });
      }

      if (teacherNameInput) {
        validations.push({
          field: teacherNameInput,
          validationFn: validateTeacherName,
          errorMessage: 'Teacher name, if provided, must contain only letters, spaces, hyphens or apostrophes'
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
      const form = document.getElementById('formForm');
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
    validateFormName: validateFormName,
    validateFormYear: validateFormYear,
    validateTeacherName: validateTeacherName
  };
})(); 