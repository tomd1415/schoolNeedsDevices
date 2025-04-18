/**
 * Validation module for need-device assignment forms
 */
const NeedDeviceValidation = (function() {
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
   * Validate need selection
   * @param {string} value - The selected need ID
   * @returns {boolean} - True if valid
   */
  function validateNeedSelection(value) {
    // Need should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Validate device selection
   * @param {string} value - The selected device ID
   * @returns {boolean} - True if valid
   */
  function validateDeviceSelection(value) {
    // Device should be selected
    return utils.isNotEmpty(value);
  }

  /**
   * Validate assignment date
   * @param {string} value - The assignment date value
   * @returns {boolean} - True if valid
   */
  function validateAssignmentDate(value) {
    // Assignment date is required and should be a valid date
    return utils.isNotEmpty(value) && utils.isValidDate(value);
  }

  /**
   * Set up validation for the need-device assignment form
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
    const pupilSelect = form.querySelector('[name="pupil_id"]');
    const needSelect = form.querySelector('[name="need_id"]');
    const deviceSelect = form.querySelector('[name="device_id"]');
    const assignmentDateInput = form.querySelector('[name="assignment_date"]');
    
    // Add event listeners for real-time validation
    if (pupilSelect) {
      pupilSelect.addEventListener('change', function() {
        utils.validateField(
          this,
          validatePupilSelection,
          'Please select a pupil'
        );
      });
    }
    
    if (needSelect) {
      needSelect.addEventListener('change', function() {
        utils.validateField(
          this, 
          validateNeedSelection,
          'Please select a need'
        );
      });
    }

    if (deviceSelect) {
      deviceSelect.addEventListener('change', function() {
        utils.validateField(
          this, 
          validateDeviceSelection,
          'Please select a device'
        );
      });
    }

    if (assignmentDateInput) {
      assignmentDateInput.addEventListener('change', function() {
        utils.validateField(
          this, 
          validateAssignmentDate,
          'Please enter a valid assignment date'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (deviceSelect) {
        validations.push({
          field: deviceSelect,
          validationFn: validateDeviceSelection,
          errorMessage: 'Please select a device'
        });
      }
      
      if (assignmentDateInput) {
        validations.push({
          field: assignmentDateInput,
          validationFn: validateAssignmentDate,
          errorMessage: 'Please enter a valid assignment date'
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
      const form = document.getElementById('assignDeviceForm');
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
    validatePupilSelection: validatePupilSelection,
    validateNeedSelection: validateNeedSelection,
    validateDeviceSelection: validateDeviceSelection,
    validateAssignmentDate: validateAssignmentDate
  };
})(); 