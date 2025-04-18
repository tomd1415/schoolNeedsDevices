/**
 * Validation module for pupil forms
 */
const PupilValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate first name field
   * @param {string} value - The first name value
   * @returns {boolean} - True if valid
   */
  function validateFirstName(value) {
    // First name should not be empty and should contain only letters, spaces, hyphens, apostrophes
    return utils.isNotEmpty(value) && utils.isValidName(value);
  }

  /**
   * Validate last name field
   * @param {string} value - The last name value
   * @returns {boolean} - True if valid
   */
  function validateLastName(value) {
    // Last name should not be empty and should contain only letters, spaces, hyphens, apostrophes
    return utils.isNotEmpty(value) && utils.isValidName(value);
  }

  /**
   * Validate form selection
   * @param {string} value - The selected form ID
   * @returns {boolean} - True if valid
   */
  function validateFormSelection(value) {
    // Form should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Set up validation for pupil form
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
    const firstNameInput = form.querySelector('[name="first_name"]');
    const lastNameInput = form.querySelector('[name="last_name"]');
    const formSelect = form.querySelector('[name="form_id"]');
    
    // Add input event listeners for real-time validation
    if (firstNameInput) {
      firstNameInput.addEventListener('input', function() {
        utils.validateField(
          this,
          validateFirstName,
          'First name is required and must contain only letters, spaces, hyphens or apostrophes'
        );
      });
    }
    
    if (lastNameInput) {
      lastNameInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateLastName,
          'Last name is required and must contain only letters, spaces, hyphens or apostrophes'
        );
      });
    }
    
    if (formSelect) {
      formSelect.addEventListener('change', function() {
        utils.validateField(
          this,
          validateFormSelection,
          'Please select a form'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (firstNameInput) {
        validations.push({
          field: firstNameInput,
          validationFn: validateFirstName,
          errorMessage: 'First name is required and must contain only letters, spaces, hyphens or apostrophes'
        });
      }
      
      if (lastNameInput) {
        validations.push({
          field: lastNameInput,
          validationFn: validateLastName,
          errorMessage: 'Last name is required and must contain only letters, spaces, hyphens or apostrophes'
        });
      }
      
      if (formSelect) {
        validations.push({
          field: formSelect,
          validationFn: validateFormSelection,
          errorMessage: 'Please select a form'
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
      const form = document.getElementById('pupilForm');
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
    validateFirstName: validateFirstName,
    validateLastName: validateLastName,
    validateFormSelection: validateFormSelection
  };
})(); 