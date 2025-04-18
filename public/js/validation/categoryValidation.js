/**
 * Validation module for category forms
 */
const CategoryValidation = (function() {
  // Load common validation utilities
  const utils = ValidationUtils;

  /**
   * Validate category name field
   * @param {string} value - The category name value
   * @returns {boolean} - True if valid
   */
  function validateCategoryName(value) {
    // Category name should not be empty and should be at least 2 characters
    return utils.isNotEmpty(value) && value.trim().length >= 2;
  }

  /**
   * Validate description (optional but if provided should be meaningful)
   * @param {string} value - The description value
   * @returns {boolean} - True if valid
   */
  function validateDescription(value) {
    // Description is optional, but if provided should be at least 5 characters
    return value === '' || value.trim().length >= 5;
  }

  /**
   * Set up validation for category form
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
    const categoryNameInput = form.querySelector('[name="category_name"]');
    const descriptionInput = form.querySelector('[name="description"]');
    
    // Add input event listeners for real-time validation
    if (categoryNameInput) {
      categoryNameInput.addEventListener('input', function() {
        utils.validateField(
          this,
          validateCategoryName,
          'Category name is required and must be at least 2 characters'
        );
      });
    }
    
    if (descriptionInput) {
      descriptionInput.addEventListener('input', function() {
        utils.validateField(
          this, 
          validateDescription,
          'Description, if provided, should be at least 5 characters'
        );
      });
    }
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, as we want the original handler to work
      
      // Create validation array
      const validations = [];
      
      if (categoryNameInput) {
        validations.push({
          field: categoryNameInput,
          validationFn: validateCategoryName,
          errorMessage: 'Category name is required and must be at least 2 characters'
        });
      }
      
      if (descriptionInput) {
        validations.push({
          field: descriptionInput,
          validationFn: validateDescription,
          errorMessage: 'Description, if provided, should be at least 5 characters'
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
   * Create a new category
   * @param {object} categoryData - Category data to submit
   */
  async function createCategory(categoryData) {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      // Show success message and reset form
      showFeedback('Category created successfully', 'success');
      document.getElementById('categoryForm').reset();
      
      // Reload categories list if it exists
      if (typeof loadCategories === 'function') {
        loadCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showFeedback('Error creating category: ' + error.message, 'error');
    }
  }
  
  /**
   * Update an existing category
   * @param {string} categoryId - ID of the category to update
   * @param {object} categoryData - Updated category data
   */
  async function updateCategory(categoryId, categoryData) {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      // Show success message
      showFeedback('Category updated successfully', 'success');
      
      // Reload categories list if it exists
      if (typeof loadCategories === 'function') {
        loadCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showFeedback('Error updating category: ' + error.message, 'error');
    }
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
      const form = document.getElementById('categoryForm');
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
    validateCategoryName: validateCategoryName,
    validateDescription: validateDescription
  };
})(); 