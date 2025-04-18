/**
 * Validation module for device forms
 */
const DeviceValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate device name field
   * @param {string} value - The device name value
   * @returns {boolean} - True if valid
   */
  function validateDeviceName(value) {
    // Device name should not be empty and should be at least 2 characters
    return utils.isNotEmpty(value) && value.trim().length >= 2;
  }

  /**
   * Validate model field (optional but if provided should be meaningful)
   * @param {string} value - The model value
   * @returns {boolean} - True if valid
   */
  function validateModel(value) {
    // Model is optional
    return true;
  }

  /**
   * Validate serial number field (optional but if provided should follow a pattern)
   * @param {string} value - The serial number value
   * @returns {boolean} - True if valid
   */
  function validateSerialNumber(value) {
    // Serial number is optional, but if provided should have at least 3 characters
    return value === '' || value.trim().length >= 3;
  }

  /**
   * Validate date field
   * @param {string} value - The date value
   * @returns {boolean} - True if valid
   */
  function validateDate(value) {
    // Date is optional, but if provided should be a valid date
    return value === '' || utils.isValidDate(value);
  }

  /**
   * Set up validation for device form
   * @param {string} formId - ID of the form element
   */
  function setupFormValidation(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
      console.error(`Form with ID ${formId} not found`);
      return;
    }

    // Get form elements
    const deviceNameInput = form.querySelector('[name="device_name"]');
    const modelInput = form.querySelector('[name="model"]');
    const serialNumberInput = form.querySelector('[name="serial_number"]');
    const purchaseDateInput = form.querySelector('[name="purchase_date"]');
    
    // Add input event listeners for real-time validation
    if (deviceNameInput) {
      deviceNameInput.addEventListener('input', function() {
        utils.validateField(
          this,
          validateDeviceName,
          'Device name is required and must be at least 2 characters'
        );
      });
    }
    
    if (serialNumberInput) {
      serialNumberInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateSerialNumber,
          'Serial number, if provided, should be at least 3 characters'
        );
      });
    }

    if (purchaseDateInput) {
      purchaseDateInput.addEventListener('change', function() {
        utils.validateField(
          this, 
          validateDate,
          'Please enter a valid date'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (deviceNameInput) {
        validations.push({
          field: deviceNameInput,
          validationFn: validateDeviceName,
          errorMessage: 'Device name is required and must be at least 2 characters'
        });
      }
      
      if (serialNumberInput) {
        validations.push({
          field: serialNumberInput,
          validationFn: validateSerialNumber,
          errorMessage: 'Serial number, if provided, should be at least 3 characters'
        });
      }

      if (purchaseDateInput) {
        validations.push({
          field: purchaseDateInput,
          validationFn: validateDate,
          errorMessage: 'Please enter a valid date'
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
      const form = document.getElementById('deviceForm');
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
    validateDeviceName: validateDeviceName,
    validateModel: validateModel,
    validateSerialNumber: validateSerialNumber,
    validateDate: validateDate
  };
})(); 