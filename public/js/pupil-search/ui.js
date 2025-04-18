/**
 * UI functionality for the Pupil Search & Profile
 */
const PupilSearchUI = (function() {
  
  /**
   * Initialize the UI module
   */
  function initialize() {
    // Initialize autocomplete
    initializeAutocomplete();
    
    // Ensure edit mode is off initially
    const editToggleBtn = document.getElementById('edit-toggle');
    if (editToggleBtn) {
      editToggleBtn.checked = false;
    }
    PupilSearchCore.isEditMode = false;
  }
  
  /**
   * Initialize the autocomplete search functionality
   */
  function initializeAutocomplete() {
    $(PupilSearchCore.pupilSearchInput).autocomplete({
      source: function(request, response) {
        // Make API call to get pupil suggestions
        fetch(`/api/pupils/search?term=${encodeURIComponent(request.term)}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data)) {
              // Format data for autocomplete
              const suggestions = data.map(pupil => ({
                label: `${pupil.first_name} ${pupil.last_name}`,
                value: pupil.first_name + ' ' + pupil.last_name,
                id: pupil.pupil_id
              }));
              response(suggestions);
            } else {
              response([]);
            }
          })
          .catch(error => {
            console.error('Error fetching pupil suggestions:', error);
            response([]);
          });
      },
      minLength: 2,
      select: function(event, ui) {
        // When a pupil is selected, load their profile
        if (ui.item) {
          PupilProfile.loadPupilProfile(ui.item.id);
        }
        return true;
      }
    });
  }
  
  /**
   * Toggle between view and edit modes
   * @param {boolean} forceState - Optional boolean to force a specific state
   */
  function toggleEditMode(forceState) {
    // If forceState is provided, use it, otherwise toggle the current state
    PupilSearchCore.isEditMode = forceState !== undefined ? forceState : !PupilSearchCore.isEditMode;
    
    // Update toggle switch if state was toggled programmatically
    const editToggleBtn = document.getElementById('edit-toggle');
    if (editToggleBtn && editToggleBtn.checked !== PupilSearchCore.isEditMode) {
      editToggleBtn.checked = PupilSearchCore.isEditMode;
    }
    
    // Toggle edit mode class on profile content
    if (PupilSearchCore.isEditMode) {
      PupilSearchCore.profileContent.classList.add('edit-mode');
      
      // Show edit controls
      const editControls = document.querySelector('.edit-controls');
      if (editControls) {
        editControls.style.display = 'flex';
      }
    } else {
      PupilSearchCore.profileContent.classList.remove('edit-mode');
      
      // Hide edit controls
      const editControls = document.querySelector('.edit-controls');
      if (editControls) {
        editControls.style.display = 'none';
      }
    }
    
    // Setup editable fields
    setupEditableFields();
  }
  
  /**
   * Setup all editable fields in the UI
   */
  function setupEditableFields() {
    if (!PupilSearchCore.currentPupilData) return;
    
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
      if (PupilSearchCore.isEditMode) {
        // Make the element editable
        element.addEventListener('click', makeEditable);
      } else {
        // Remove editable functionality
        element.removeEventListener('click', makeEditable);
        
        // Restore to original display if no changes made
        const fieldName = element.dataset.field;
        if (!PupilSearchCore.changedFields[fieldName]) {
          // Reset to original value
          if (fieldName === 'form_id') {
            element.textContent = PupilSearchCore.currentPupilData.form ? PupilSearchCore.currentPupilData.form.form_name : 'Not assigned';
          } else {
            element.textContent = PupilSearchCore.currentPupilData[fieldName] || '';
          }
        }
      }
    });
    
    // Handle Add buttons
    const addButtons = document.querySelectorAll('.add-item-btn');
    addButtons.forEach(button => {
      button.style.display = PupilSearchCore.isEditMode ? 'flex' : 'none';
    });
    
    // Handle all removal buttons in the interface
    const allRemoveButtons = document.querySelectorAll('.remove-button, .remove-category-btn, .remove-device-btn, .remove-override-btn, .edit-override-btn');
    allRemoveButtons.forEach(button => {
      button.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
    });
    
    // Handle action columns in tables
    const actionColumns = document.querySelectorAll('.action-col');
    actionColumns.forEach(col => {
      col.style.display = PupilSearchCore.isEditMode ? 'table-cell' : 'none';
    });
  }
  
  /**
   * Make a field editable when clicked in edit mode
   * @param {Event} event - The click event
   */
  function makeEditable(event) {
    if (!PupilSearchCore.isEditMode) return;
    
    const element = event.currentTarget;
    const fieldName = element.dataset.field;
    const currentValue = element.textContent;
    
    // Store the original text to allow cancellation
    element.dataset.originalText = currentValue;
    
    // Create the appropriate input based on field type
    if (fieldName === 'notes') {
      // Create textarea for notes
      const textarea = document.createElement('textarea');
      textarea.className = 'editable-field editable-textarea';
      textarea.value = currentValue;
      
      // Replace the text with the textarea
      element.textContent = '';
      element.appendChild(textarea);
      textarea.focus();
      
      // Handle blur event to save the changes
      textarea.addEventListener('blur', function() {
        finishEditing(element, fieldName, textarea.value);
      });
      
      // Handle Enter key to save changes
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          finishEditing(element, fieldName, element.dataset.originalText);
        }
      });
    } else if (fieldName === 'form_id') {
      // Create a select element for form selection
      const select = document.createElement('select');
      select.className = 'editable-field editable-select';
      
      // Add a blank option for "No form"
      const blankOption = document.createElement('option');
      blankOption.value = '';
      blankOption.textContent = 'No Form';
      select.appendChild(blankOption);
      
      // Fetch all forms and add them as options
      fetch('/api/forms')
        .then(res => res.json())
        .then(forms => {
          forms.forEach(form => {
            const option = document.createElement('option');
            option.value = form.form_id;
            option.textContent = `${form.form_name} (Year ${form.form_year})`;
            
            // Select the current form
            if (PupilSearchCore.currentPupilData.form && form.form_id === PupilSearchCore.currentPupilData.form.form_id) {
              option.selected = true;
            }
            
            select.appendChild(option);
          });
          
          // Replace the text with the select
          element.textContent = '';
          element.appendChild(select);
          select.focus();
        })
        .catch(error => {
          console.error('Error fetching forms:', error);
        });
      
      // Handle change event to save the changes
      select.addEventListener('change', function() {
        const selectedFormId = select.value;
        const selectedFormText = selectedFormId ? 
          select.options[select.selectedIndex].textContent.split(' ')[0] : 
          'Not assigned';
        
        finishEditing(element, fieldName, selectedFormId, selectedFormText);
      });
    } else {
      // Create text input for other fields
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'editable-field';
      input.value = currentValue;
      
      // Replace the text with the input
      element.textContent = '';
      element.appendChild(input);
      input.focus();
      
      // Handle blur event to save the changes
      input.addEventListener('blur', function() {
        finishEditing(element, fieldName, input.value);
      });
      
      // Handle Enter key to save changes, Escape to cancel
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          finishEditing(element, fieldName, input.value);
        } else if (e.key === 'Escape') {
          finishEditing(element, fieldName, element.dataset.originalText);
        }
      });
    }
  }
  
  /**
   * Finish editing a field and update the UI
   * @param {HTMLElement} element - The element being edited
   * @param {string} fieldName - The name of the field
   * @param {string} newValue - The new value
   * @param {string} displayValue - Optional display value for select fields
   */
  function finishEditing(element, fieldName, newValue, displayValue) {
    // Remove any input elements
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    // Update the element text
    element.textContent = displayValue || newValue;
    
    // Track changed fields
    if (element.dataset.originalText !== newValue) {
      if (fieldName === 'form_id' && newValue === '') {
        // Handle empty form ID as null
        PupilSearchCore.changedFields[fieldName] = null;
        console.log(`Field ${fieldName} changed to null (empty form)`);
      } else {
        PupilSearchCore.changedFields[fieldName] = newValue;
        console.log(`Field ${fieldName} changed to "${newValue}"`);
      }
    }
    
    // Update form badge if the form has been changed
    if (fieldName === 'form_id') {
      const formBadge = document.getElementById('pupil-form-badge');
      if (formBadge) {
        formBadge.textContent = newValue ? `Form ${displayValue}` : 'No Form';
      }
    }
    
    // Remove event listeners by cloning and replacing the element
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    // Re-add the click event listener
    if (PupilSearchCore.isEditMode) {
      newElement.addEventListener('click', makeEditable);
    }
  }
  
  /**
   * Save all changes to the server
   */
  function saveChanges() {
    if (!PupilSearchCore.currentPupilData || Object.keys(PupilSearchCore.changedFields).length === 0) {
      // No changes to save
      toggleEditMode(false);
      return;
    }
    
    // Show loading state
    const saveBtn = document.getElementById('save-changes');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    // Create the update data with required fields even if they weren't changed
    const updateData = {
      first_name: PupilSearchCore.changedFields.first_name || PupilSearchCore.currentPupilData.first_name,
      last_name: PupilSearchCore.changedFields.last_name || PupilSearchCore.currentPupilData.last_name,
      notes: PupilSearchCore.changedFields.hasOwnProperty('notes') ? PupilSearchCore.changedFields.notes : PupilSearchCore.currentPupilData.notes
    };
    
    // Handle form_id specially - it could be null/empty
    if (PupilSearchCore.changedFields.hasOwnProperty('form_id')) {
      updateData.form_id = PupilSearchCore.changedFields.form_id || null;
    } else if (PupilSearchCore.currentPupilData.hasOwnProperty('form_id')) {
      updateData.form_id = PupilSearchCore.currentPupilData.form_id;
    } else {
      updateData.form_id = null;
    }
    
    console.log('Saving changes:', updateData);
    
    // Send the update request
    fetch(`/api/pupils/${PupilSearchCore.currentPupilData.pupil_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'Failed to update pupil');
          });
        }
        return res.json();
      })
      .then(data => {
        // Update current pupil data with the new values
        Object.assign(PupilSearchCore.currentPupilData, data);
        
        // Reset changed fields
        PupilSearchCore.changedFields = {};
        
        // Exit edit mode
        toggleEditMode(false);
        
        // Show success message
        alert('Changes saved successfully');
        
        // Reload the profile to get fresh data
        PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        alert('Error saving changes: ' + error.message);
      })
      .finally(() => {
        // Restore button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
      });
  }
  
  /**
   * Cancel edit mode and revert changes
   */
  function cancelEdit() {
    // Clear changed fields
    PupilSearchCore.changedFields = {};
    
    // Reload the current pupil profile to reset all fields
    if (PupilSearchCore.currentPupilData) {
      PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
    }
    
    // Exit edit mode
    toggleEditMode(false);
  }
  
  // Public API
  return {
    initialize,
    toggleEditMode,
    setupEditableFields,
    saveChanges,
    cancelEdit,
    makeEditable,
    finishEditing
  };
})(); 