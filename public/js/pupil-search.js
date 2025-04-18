/**
 * Pupil Search & Profile functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const pupilSearchInput = document.getElementById('pupil-search');
  const searchBtn = document.getElementById('search-btn');
  const printBtn = document.getElementById('print-btn');
  const editToggleBtn = document.getElementById('edit-toggle');
  const saveChangesBtn = document.getElementById('save-changes');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const profileContent = document.getElementById('profile-content');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const addOverrideBtn = document.getElementById('add-override-btn');
  const addDeviceBtn = document.getElementById('add-device-btn');
  
  // Ensure edit controls are hidden initially
  const editControls = document.querySelector('.edit-controls');
  if (editControls) {
    editControls.style.display = 'none';
  }
  
  // Hide add buttons initially
  if (addCategoryBtn) addCategoryBtn.style.display = 'none';
  if (addOverrideBtn) addOverrideBtn.style.display = 'none';
  if (addDeviceBtn) addDeviceBtn.style.display = 'none';
  
  // State variables
  let currentPupilData = null;
  let isEditMode = false;
  let changedFields = {};
  
  // Initialize search autocomplete
  initializeAutocomplete();
  
  // Set up event listeners
  searchBtn.addEventListener('click', function() {
    const searchValue = pupilSearchInput.value.trim();
    if (searchValue) {
      loadPupilProfile(searchValue);
    }
  });
  
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      // Set print options to remove headers and footers
      const style = document.createElement('style');
      style.innerHTML = `
        @page {
          margin: 0.5cm;
          margin-top: 0;
          margin-bottom: 0;
          marks: none;
        }
      `;
      document.head.appendChild(style);
      
      window.print();
      
      // Remove the style element after printing
      setTimeout(() => {
        document.head.removeChild(style);
      }, 1000);
    });
  }
  
  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', function() {
      toggleEditMode();
    });
  }
  
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', function() {
      saveChanges();
    });
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', function() {
      cancelEdit();
    });
  }
  
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', addCategory);
  }
  
  if (addOverrideBtn) {
    addOverrideBtn.addEventListener('click', addOverride);
  }
  
  if (addDeviceBtn) {
    addDeviceBtn.addEventListener('click', addDevice);
  }
  
  /**
   * Toggle between view and edit modes
   */
  function toggleEditMode() {
    isEditMode = !isEditMode;
    
    // Toggle edit mode class on profile content
    if (isEditMode) {
      profileContent.classList.add('edit-mode');
      editToggleBtn.classList.add('active');
      
      // Show edit controls
      const editControls = document.querySelector('.edit-controls');
      if (editControls) {
        editControls.style.display = 'flex';
      }
    } else {
      profileContent.classList.remove('edit-mode');
      editToggleBtn.classList.remove('active');
      
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
    if (!currentPupilData) return;
    
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
      if (isEditMode) {
        // Make the element editable
        element.addEventListener('click', makeEditable);
      } else {
        // Remove editable functionality
        element.removeEventListener('click', makeEditable);
        
        // Restore to original display if no changes made
        const fieldName = element.dataset.field;
        if (!changedFields[fieldName]) {
          // Reset to original value
          if (fieldName === 'form_id') {
            element.textContent = currentPupilData.form ? currentPupilData.form.form_name : 'Not assigned';
          } else {
            element.textContent = currentPupilData[fieldName] || '';
          }
        }
      }
    });
    
    // Handle Add buttons
    const addButtons = document.querySelectorAll('.add-item-btn');
    addButtons.forEach(button => {
      button.style.display = isEditMode ? 'flex' : 'none';
    });
    
    // Handle action columns in tables
    const actionColumns = document.querySelectorAll('.action-col');
    actionColumns.forEach(col => {
      col.style.display = isEditMode ? 'table-cell' : 'none';
    });
  }
  
  /**
   * Make a field editable when clicked in edit mode
   * @param {Event} event - The click event
   */
  function makeEditable(event) {
    if (!isEditMode) return;
    
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
            if (currentPupilData.form && form.form_id === currentPupilData.form.form_id) {
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
        changedFields[fieldName] = null;
        console.log(`Field ${fieldName} changed to null (empty form)`);
      } else {
        changedFields[fieldName] = newValue;
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
    if (isEditMode) {
      newElement.addEventListener('click', makeEditable);
    }
  }
  
  /**
   * Save all changes to the server
   */
  function saveChanges() {
    if (!currentPupilData || Object.keys(changedFields).length === 0) {
      // No changes to save
      toggleEditMode();
      return;
    }
    
    // Show loading state
    const saveBtn = document.getElementById('save-changes');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    // Create the update data with required fields even if they weren't changed
    const updateData = {
      first_name: changedFields.first_name || currentPupilData.first_name,
      last_name: changedFields.last_name || currentPupilData.last_name,
      notes: changedFields.hasOwnProperty('notes') ? changedFields.notes : currentPupilData.notes
    };
    
    // Handle form_id specially - it could be null/empty
    if (changedFields.hasOwnProperty('form_id')) {
      updateData.form_id = changedFields.form_id || null;
    } else if (currentPupilData.hasOwnProperty('form_id')) {
      updateData.form_id = currentPupilData.form_id;
    } else {
      updateData.form_id = null;
    }
    
    console.log('Saving changes:', updateData);
    
    // Send the update request
    fetch(`/api/pupils/${currentPupilData.pupil_id}`, {
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
        Object.assign(currentPupilData, data);
        
        // Reset changed fields
        changedFields = {};
        
        // Exit edit mode
        toggleEditMode();
        
        // Show success message
        alert('Changes saved successfully');
        
        // Reload the profile to get fresh data
        loadPupilProfile(currentPupilData.pupil_id);
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
    changedFields = {};
    
    // Reload the current pupil profile to reset all fields
    if (currentPupilData) {
      loadPupilProfile(currentPupilData.pupil_id);
    }
    
    // Exit edit mode
    toggleEditMode();
  }
  
  /**
   * Initialize the autocomplete search functionality
   */
  function initializeAutocomplete() {
    $(pupilSearchInput).autocomplete({
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
          loadPupilProfile(ui.item.id);
        }
        return true;
      }
    });
  }
  
  /**
   * Load the pupil profile data and display it
   * @param {string|number} pupilIdentifier - Pupil ID or name to search for
   */
  function loadPupilProfile(pupilIdentifier) {
    // Exit edit mode if active
    if (isEditMode) {
      toggleEditMode();
    }
    
    // Reset changed fields
    changedFields = {};
    
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-spinner';
    loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading profile...';
    
    // Clear previous content from tables but don't destroy the structure
    resetDisplayContainers();
    
    // Show the profile container with loading indicator
    profileContent.style.display = 'block';
    
    // Find a good place to show the loading indicator
    const header = document.getElementById('pupil-header');
    if (header) {
      header.innerHTML = '';
      header.appendChild(loadingEl);
    }
    
    // Determine if we're searching by ID or name
    const searchParam = !isNaN(pupilIdentifier) ? 
      `pupil_id=${pupilIdentifier}` : 
      `name=${encodeURIComponent(pupilIdentifier)}`;
    
    // Fetch comprehensive pupil data
    fetch(`/api/pupils/profile?${searchParam}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch pupil profile');
        }
        return res.json();
      })
      .then(data => {
        // Store current pupil data
        currentPupilData = data;
        
        // Display the profile
        displayPupilProfile(data);
      })
      .catch(error => {
        console.error('Error loading pupil profile:', error);
        // Show error in header rather than replacing entire content
        if (header) {
          header.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Error loading pupil profile. Please try again.</p>
              <p class="error-details">${error.message}</p>
            </div>
          `;
        }
      });
  }
  
  /**
   * Display the pupil profile data in the UI
   * @param {Object} pupilData - The pupil data to display
   */
  function displayPupilProfile(pupilData) {
    if (!pupilData) {
      const header = document.getElementById('pupil-header');
      if (header) {
        header.innerHTML = `
          <div class="error-message">
            <i class="fas fa-user-slash"></i>
            <p>No pupil found with that name or ID.</p>
          </div>
        `;
      }
      return;
    }
    
    // Show profile content
    profileContent.style.display = 'block';
    
    // Restore header structure
    document.getElementById('pupil-header').innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="profile-basic-info">
          <h2 id="pupil-full-name"></h2>
          <div class="profile-meta">
            <span id="pupil-form-badge" class="badge"></span>
            <span id="pupil-id-badge" class="badge subtle"></span>
          </div>
        </div>
      </div>
    `;
    
    // Update timestamp
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
      const now = new Date();
      timestampEl.textContent = now.toLocaleString();
    }
    
    // Populate basic pupil information
    document.getElementById('pupil-full-name').textContent = `${pupilData.first_name} ${pupilData.last_name}`;
    document.getElementById('pupil-first-name').textContent = pupilData.first_name;
    document.getElementById('pupil-last-name').textContent = pupilData.last_name;
    document.getElementById('pupil-id-badge').textContent = `ID: ${pupilData.pupil_id}`;
    
    // Form information
    if (pupilData.form) {
      document.getElementById('pupil-form-badge').textContent = `Form ${pupilData.form.form_name}`;
      document.getElementById('pupil-form-name').textContent = pupilData.form.form_name;
      document.getElementById('pupil-year').textContent = pupilData.form.form_year;
    } else {
      document.getElementById('pupil-form-badge').textContent = 'No Form';
      document.getElementById('pupil-form-name').textContent = 'Not assigned';
      document.getElementById('pupil-year').textContent = 'N/A';
    }
    
    // Notes
    document.getElementById('pupil-notes').textContent = pupilData.notes || 'No notes available';
    
    // Display categories, needs, overrides, and devices
    displayCategories(pupilData.categories || []);
    displayNeeds(pupilData.effective_needs || []);
    displayOverrides(pupilData.need_overrides || []);
    displayDevices(pupilData.devices || []);
    
    // If we were in edit mode, reinitialize editable fields
    if (isEditMode) {
      setupEditableFields();
    }
  }
  
  /**
   * Reset all display containers to prepare for new data
   */
  function resetDisplayContainers() {
    // Reset categories container
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
      const categoryTags = categoriesContainer.querySelectorAll('.category-tag');
      categoryTags.forEach(tag => tag.remove());
      const noCategories = document.getElementById('no-categories-message');
      if (noCategories) noCategories.style.display = 'none';
    }
    
    // Reset needs table
    const needsTable = document.getElementById('needs-table');
    if (needsTable) {
      const tbody = needsTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noNeeds = document.getElementById('no-needs-message');
      if (noNeeds) noNeeds.style.display = 'none';
      const needsContainer = document.querySelector('#needs-container .table-container');
      if (needsContainer) needsContainer.style.display = 'block';
    }
    
    // Reset overrides table
    const overridesTable = document.getElementById('overrides-table');
    if (overridesTable) {
      const tbody = overridesTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noOverrides = document.getElementById('no-overrides-message');
      if (noOverrides) noOverrides.style.display = 'none';
      const overridesContainer = document.querySelector('#overrides-container .table-container');
      if (overridesContainer) overridesContainer.style.display = 'block';
    }
    
    // Reset devices table
    const devicesTable = document.getElementById('devices-table');
    if (devicesTable) {
      const tbody = devicesTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noDevices = document.getElementById('no-devices-message');
      if (noDevices) noDevices.style.display = 'none';
      const devicesContainer = document.querySelector('#devices-container .table-container');
      if (devicesContainer) devicesContainer.style.display = 'block';
    }
  }
  
  /**
   * Display assigned categories
   * @param {Array} categories - List of assigned categories
   */
  function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    categoriesContainer.innerHTML = '';
    
    if (!categories || categories.length === 0) {
      categoriesContainer.innerHTML = '<p>No categories assigned</p>';
      return;
    }
    
    const categoriesList = document.createElement('ul');
    categoriesList.className = 'categories-list';
    
    categories.forEach(category => {
      const categoryItem = document.createElement('li');
      categoryItem.className = 'category-item';
      
      // Create category info
      const categoryInfo = document.createElement('div');
      categoryInfo.className = 'category-info';
      categoryInfo.innerHTML = `
        <strong>${category.category_name}</strong>
      `;
      
      // Create remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-category-btn';
      removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
      removeBtn.addEventListener('click', () => removeCategory(category.category_id));
      
      // Add elements to item
      categoryItem.appendChild(categoryInfo);
      categoryItem.appendChild(removeBtn);
      categoriesList.appendChild(categoryItem);
    });
    
    categoriesContainer.appendChild(categoriesList);
  }
  
  /**
   * Display the pupil's effective needs
   * @param {Array} needs - The needs to display
   */
  function displayNeeds(needs) {
    const needsTable = document.getElementById('needs-table');
    if (!needsTable) return;
    
    const needsTableBody = needsTable.querySelector('tbody');
    const noDataMessage = document.getElementById('no-needs-message');
    const tableContainer = document.querySelector('#needs-container .table-container');
    
    if (!needsTableBody || !noDataMessage || !tableContainer) return;
    
    if (!needs.length) {
      noDataMessage.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }
    
    noDataMessage.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Create need rows
    needs.forEach(need => {
      const row = document.createElement('tr');
      row.dataset.needId = need.need_id;
      
      const nameCell = document.createElement('td');
      nameCell.textContent = need.name;
      
      const sourceCell = document.createElement('td');
      sourceCell.textContent = need.sources || 'Unknown';
      
      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = need.short_description || need.description || 'No description';
      
      row.appendChild(nameCell);
      row.appendChild(sourceCell);
      row.appendChild(descriptionCell);
      
      needsTableBody.appendChild(row);
    });
  }
  
  /**
   * Display need overrides
   * @param {Array} overrides - List of need overrides
   */
  function displayOverrides(overrides) {
    const overridesContainer = document.getElementById('overrides-container');
    overridesContainer.innerHTML = '';
    
    if (!overrides || overrides.length === 0) {
      overridesContainer.innerHTML = '<p>No need overrides</p>';
      return;
    }
    
    const overridesList = document.createElement('ul');
    overridesList.className = 'overrides-list';
    
    overrides.forEach(override => {
      const overrideItem = document.createElement('li');
      overrideItem.className = 'override-item';
      
      // Create override info
      const overrideInfo = document.createElement('div');
      overrideInfo.className = 'override-info';
      
      const type = override.is_added ? 
        '<span class="badge add-badge">Added</span>' : 
        '<span class="badge remove-badge">Removed</span>';
      
      overrideInfo.innerHTML = `
        <div class="override-header">
          <strong>${override.need_name}</strong>
          ${type}
        </div>
        <div class="override-notes">${override.notes || 'No notes'}</div>
      `;
      
      // Create edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-override-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.title = 'Edit override';
      editBtn.addEventListener('click', () => editOverride(override));
      
      // Create remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-override-btn';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.title = 'Remove override';
      removeBtn.addEventListener('click', () => removeOverride(override.override_id));
      
      // Create actions container
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'override-actions';
      actionsContainer.appendChild(editBtn);
      actionsContainer.appendChild(removeBtn);
      
      // Add elements to item
      overrideItem.appendChild(overrideInfo);
      overrideItem.appendChild(actionsContainer);
      overridesList.appendChild(overrideItem);
    });
    
    overridesContainer.appendChild(overridesList);
  }
  
  /**
   * Display assigned devices
   * @param {Array} devices - List of assigned devices
   */
  function displayDevices(devices) {
    const devicesContainer = document.getElementById('devices-container');
    devicesContainer.innerHTML = '';
    
    if (!devices || devices.length === 0) {
      devicesContainer.innerHTML = '<p>No devices assigned</p>';
      return;
    }
    
    const devicesList = document.createElement('ul');
    devicesList.className = 'devices-list';
    
    devices.forEach(device => {
      const deviceItem = document.createElement('li');
      deviceItem.className = 'device-item';
      
      // Create device info
      const deviceInfo = document.createElement('div');
      deviceInfo.className = 'device-info';
      deviceInfo.innerHTML = `
        <strong>${device.device_name || 'Unknown device'} - ${device.model || 'No model'}</strong>
        <span>Serial: ${device.serial_number || 'No serial number'}</span>
        <span>For need: ${device.need_name || 'General use'}</span>
      `;
      
      // Create remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-device-btn';
      removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
      removeBtn.addEventListener('click', () => removeDeviceFromNeed(device.need_id, device.device_id));
      
      // Add elements to item
      deviceItem.appendChild(deviceInfo);
      deviceItem.appendChild(removeBtn);
      devicesList.appendChild(deviceItem);
    });
    
    devicesContainer.appendChild(devicesList);
  }
  
  /**
   * Remove a category from a pupil
   * @param {number} categoryId - The ID of the category to remove
   */
  function removeCategory(categoryId) {
    if (!currentPupilData) return;
    
    if (confirm('Are you sure you want to remove this category? This will also remove any needs associated with this category.')) {
      fetch(`/api/pupil-categories/${currentPupilData.pupil_id}/categories/${categoryId}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to remove category');
          }
          return res.json();
        })
        .then(() => {
          // Reload the pupil profile to get updated data
          loadPupilProfile(currentPupilData.pupil_id);
        })
        .catch(error => {
          console.error('Error removing category:', error);
          alert('Error removing category: ' + error.message);
        });
    }
  }
  
  /**
   * Add a category to the pupil
   */
  function addCategory() {
    // Check if a pupil is selected
    if (!currentPupilData) return;
    
    // Fetch all categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(categories => {
        // Create a select for categories
        const categorySelect = document.createElement('select');
        categorySelect.id = 'category-select';
        
        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.text = 'Select a category';
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        categorySelect.appendChild(placeholderOption);
        
        // Add category options
        categories.forEach(category => {
          const option = document.createElement('option');
          option.text = category.category_name;
          option.value = category.category_id;
          categorySelect.appendChild(option);
        });
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'category-dialog';
        dialog.title = 'Add Category';
        dialog.innerHTML = `
          <p>Add a category for ${currentPupilData.first_name} ${currentPupilData.last_name}:</p>
          <div>
            <label for="category-select">Category:</label>
            <div id="category-select-container"></div>
          </div>
        `;
        
        // Add dialog to body
        document.body.appendChild(dialog);
        document.getElementById('category-select-container').appendChild(categorySelect);
        
        // Initialize dialog
        $(dialog).dialog({
          modal: true,
          width: 400,
          buttons: {
            "Add Category": function() {
              const selectedCategoryId = categorySelect.value;
              
              if (!selectedCategoryId) {
                alert('Please select a category');
                return;
              }
              
              // Send API request to add category
              fetch('/api/pupil-categories/assign-category', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  pupil_id: currentPupilData.pupil_id,
                  category_id: selectedCategoryId
                })
              })
                .then(res => {
                  if (!res.ok) {
                    throw new Error('Failed to add category');
                  }
                  return res.json();
                })
                .then(() => {
                  // Close dialog - only remove the element after closing the dialog
                  $(dialog).dialog('close');
                  
                  // Reload the pupil profile to get updated data
                  loadPupilProfile(currentPupilData.pupil_id);
                  
                  // Remove the dialog from DOM after a short delay to ensure jQuery UI has finished with it
                  setTimeout(() => {
                    if (document.body.contains(dialog)) {
                      document.body.removeChild(dialog);
                    }
                  }, 100);
                })
                .catch(error => {
                  console.error('Error adding category:', error);
                  alert('Error adding category: ' + error.message);
                });
            },
            "Cancel": function() {
              $(dialog).dialog('close');
              // Remove the dialog from DOM after a short delay
              setTimeout(() => {
                if (document.body.contains(dialog)) {
                  document.body.removeChild(dialog);
                }
              }, 100);
            }
          },
          close: function() {
            // Ensure cleanup on any close action (including clicking the X)
            setTimeout(() => {
              if (document.body.contains(dialog)) {
                document.body.removeChild(dialog);
              }
            }, 100);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories: ' + error.message);
      });
  }
  
  /**
   * Edit a need override
   * @param {Object} override - The override to edit
   */
  function editOverride(override) {
    // Create a dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Override</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Edit override for ${override.need_name}:</p>
          <div class="form-group">
            <label for="override-type">Type:</label>
            <select id="override-type">
              <option value="1" ${override.is_added ? 'selected' : ''}>Added</option>
              <option value="0" ${!override.is_added ? 'selected' : ''}>Removed</option>
            </select>
          </div>
          <div class="form-group">
            <label for="override-notes">Notes:</label>
            <textarea id="override-notes">${override.notes || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn">Save Changes</button>
        </div>
      </div>
    `;
    
    // Add the dialog to the body
    document.body.appendChild(dialog);
    
    // Function to safely remove dialog
    const removeDialog = () => {
      // Check if dialog is still in the DOM
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    };
    
    // Set up event listeners
    const closeBtn = dialog.querySelector('.close-btn');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const confirmBtn = dialog.querySelector('.confirm-btn');
    const typeSelect = dialog.querySelector('#override-type');
    const notesTextarea = dialog.querySelector('#override-notes');
    
    closeBtn.addEventListener('click', removeDialog);
    
    cancelBtn.addEventListener('click', removeDialog);
    
    confirmBtn.addEventListener('click', () => {
      const isAdded = typeSelect.value === '1';
      const notes = notesTextarea.value.trim();
      
      // Update the override
      fetch(`/api/pupil-categories/need-override/${override.override_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_added: isAdded,
          notes: notes
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to update override');
          }
          return res.json();
        })
        .then(() => {
          // Remove the dialog
          removeDialog();
          
          // Reload the pupil profile to get updated data
          loadPupilProfile(currentPupilData.pupil_id);
        })
        .catch(error => {
          console.error('Error updating override:', error);
          alert('Error updating override: ' + error.message);
        });
    });
  }
  
  /**
   * Remove a need override
   * @param {number} overrideId - The ID of the override to remove
   */
  function removeOverride(overrideId) {
    if (!currentPupilData) return;
    
    if (confirm('Are you sure you want to remove this override?')) {
      fetch(`/api/pupil-categories/need-override/${overrideId}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to remove override');
          }
          return res.json();
        })
        .then(() => {
          // Reload the pupil profile to get updated data
          loadPupilProfile(currentPupilData.pupil_id);
        })
        .catch(error => {
          console.error('Error removing override:', error);
          alert('Error removing override: ' + error.message);
        });
    }
  }
  
  /**
   * Add need override for a pupil
   */
  function addOverride() {
    // Check if a pupil is selected
    if (!currentPupilData) return;
    
    // Fetch all needs
    fetch('/api/needs')
      .then(res => res.json())
      .then(needs => {
        // Create a select for needs
        const needSelect = document.createElement('select');
        needSelect.id = 'need-select';
        
        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.text = 'Select a need';
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        needSelect.appendChild(placeholderOption);
        
        // Add need options
        needs.forEach(need => {
          const option = document.createElement('option');
          option.text = need.name;
          option.value = need.need_id;
          needSelect.appendChild(option);
        });
        
        // Create radio buttons for add/remove
        const radioContainer = document.createElement('div');
        radioContainer.className = 'override-type-container';
        
        // Radio container div for add option
        const addRadioContainer = document.createElement('div');
        addRadioContainer.className = 'radio-option';
        
        const addRadio = document.createElement('input');
        addRadio.type = 'radio';
        addRadio.id = 'override-add';
        addRadio.name = 'override-type';
        addRadio.value = 'add';
        addRadio.checked = true;
        
        const addLabel = document.createElement('label');
        addLabel.htmlFor = 'override-add';
        addLabel.textContent = 'Add need';
        
        addRadioContainer.appendChild(addRadio);
        addRadioContainer.appendChild(addLabel);
        
        // Radio container div for remove option
        const removeRadioContainer = document.createElement('div');
        removeRadioContainer.className = 'radio-option';
        
        const removeRadio = document.createElement('input');
        removeRadio.type = 'radio';
        removeRadio.id = 'override-remove';
        removeRadio.name = 'override-type';
        removeRadio.value = 'remove';
        
        const removeLabel = document.createElement('label');
        removeLabel.htmlFor = 'override-remove';
        removeLabel.textContent = 'Remove need';
        
        removeRadioContainer.appendChild(removeRadio);
        removeRadioContainer.appendChild(removeLabel);
        
        // Add both options to the main container
        radioContainer.appendChild(addRadioContainer);
        radioContainer.appendChild(removeRadioContainer);
        
        // Create a textarea for notes
        const notesTextarea = document.createElement('textarea');
        notesTextarea.id = 'override-notes';
        notesTextarea.placeholder = 'Reason for this override (required)';
        notesTextarea.rows = 4;
        notesTextarea.required = true;
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'override-dialog';
        dialog.title = 'Add Need Override';
        dialog.innerHTML = `
          <p>Add a need override for ${currentPupilData.first_name} ${currentPupilData.last_name}:</p>
          <div>
            <label for="need-select">Need:</label>
            <div id="need-select-container"></div>
          </div>
          <div style="margin-top: 15px;">
            <label>Override Type:</label>
            <div id="radio-container"></div>
          </div>
          <div style="margin-top: 15px;">
            <label for="override-notes">Notes:</label>
            <div id="notes-container"></div>
          </div>
        `;
        
        // Add dialog to body
        document.body.appendChild(dialog);
        document.getElementById('need-select-container').appendChild(needSelect);
        document.getElementById('radio-container').appendChild(radioContainer);
        document.getElementById('notes-container').appendChild(notesTextarea);
        
        // Initialize dialog
        $(dialog).dialog({
          modal: true,
          width: 500,
          buttons: {
            "Add Override": function() {
              const selectedNeedId = needSelect.value;
              const isAdded = addRadio.checked;
              const notes = notesTextarea.value.trim();
              
              if (!selectedNeedId) {
                alert('Please select a need');
                return;
              }
              
              if (!notes) {
                alert('Please provide a reason for this override');
                return;
              }
              
              // Send API request to add override
              fetch('/api/pupil-categories/need-override', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  pupil_id: currentPupilData.pupil_id,
                  need_id: selectedNeedId,
                  is_added: isAdded,
                  notes: notes
                })
              })
                .then(res => {
                  if (!res.ok) {
                    throw new Error('Failed to add override');
                  }
                  return res.json();
                })
                .then(() => {
                  // Close dialog
                  $(dialog).dialog('close');
                  
                  // Reload the pupil profile to get updated data
                  loadPupilProfile(currentPupilData.pupil_id);
                  
                  // Remove the dialog from DOM after a short delay
                  setTimeout(() => {
                    if (document.body.contains(dialog)) {
                      document.body.removeChild(dialog);
                    }
                  }, 100);
                })
                .catch(error => {
                  console.error('Error adding override:', error);
                  alert('Error adding override: ' + error.message);
                });
            },
            "Cancel": function() {
              $(dialog).dialog('close');
              // Remove the dialog from DOM after a short delay
              setTimeout(() => {
                if (document.body.contains(dialog)) {
                  document.body.removeChild(dialog);
                }
              }, 100);
            }
          },
          close: function() {
            // Ensure cleanup on any close action (including clicking the X)
            setTimeout(() => {
              if (document.body.contains(dialog)) {
                document.body.removeChild(dialog);
              }
            }, 100);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching needs:', error);
        alert('Error fetching needs: ' + error.message);
      });
  }
  
  /**
   * Remove device from a need
   * @param {number} needId - The ID of the need
   * @param {number} deviceId - The ID of the device to remove
   */
  function removeDeviceFromNeed(needId, deviceId) {
    if (!currentPupilData) return;
    
    if (confirm('Are you sure you want to remove this device assignment?')) {
      fetch(`/api/devices/need/${needId}/device/${deviceId}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to remove device assignment');
          }
          return res.json();
        })
        .then(() => {
          // Reload the pupil profile to get updated data
          loadPupilProfile(currentPupilData.pupil_id);
        })
        .catch(error => {
          console.error('Error removing device assignment:', error);
          alert('Error removing device assignment: ' + error.message);
        });
    }
  }
  
  /**
   * Add a device to the pupil
   */
  function addDevice() {
    // Check if a pupil is selected
    if (!currentPupilData) return;
    
    // Fetch all devices that are not assigned to a pupil
    fetch('/api/devices')
      .then(res => res.json())
      .then(devices => {
        if (devices.length === 0) {
          alert('No available devices found. Please add more devices to the system.');
          return;
        }
        
        // Create a select for devices
        const deviceSelect = document.createElement('select');
        deviceSelect.id = 'device-select';
        deviceSelect.required = true;
        deviceSelect.style.width = '100%';
        
        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.text = 'Select a device';
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        deviceSelect.appendChild(placeholderOption);
        
        // Add device options
        devices.forEach(device => {
          const option = document.createElement('option');
          option.text = `${device.name || device.device_name} - ${device.model || 'No model'} (${device.serial_number || 'No S/N'})`;
          option.value = device.device_id;
          deviceSelect.appendChild(option);
        });
        
        // Create need selection
        const needSelect = document.createElement('select');
        needSelect.id = 'need-select';
        needSelect.required = true;
        needSelect.style.width = '100%';
        
        // Add placeholder option for needs
        const needPlaceholder = document.createElement('option');
        needPlaceholder.text = 'Select a need';
        needPlaceholder.value = '';
        needPlaceholder.disabled = true;
        needPlaceholder.selected = true;
        needSelect.appendChild(needPlaceholder);
        
        // Fetch pupil's effective needs
        fetch(`/api/pupil-categories/${currentPupilData.pupil_id}/effective-needs`)
          .then(res => res.json())
          .then(needs => {
            if (!needs || needs.length === 0) {
              // If no needs found, disable the need select
              needSelect.innerHTML = '<option value="">No needs available</option>';
              needSelect.disabled = true;
            } else {
              // Add needs to the dropdown
              needs.forEach(need => {
                const option = document.createElement('option');
                option.text = need.name;
                option.value = need.need_id;
                needSelect.appendChild(option);
              });
            }
          })
          .catch(error => {
            console.error('Error fetching pupil effective needs:', error);
            needSelect.innerHTML = '<option value="">Error loading needs</option>';
            needSelect.disabled = true;
          });
        
        // Create notes field
        const notesField = document.createElement('textarea');
        notesField.id = 'device-notes';
        notesField.placeholder = 'Enter notes about this assignment (optional)';
        notesField.rows = 3;
        notesField.style.width = '100%';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'device-dialog';
        dialog.title = 'Assign Device';
        dialog.innerHTML = `
          <p>Assign a device to ${currentPupilData.first_name} ${currentPupilData.last_name}:</p>
          <div class="form-group">
            <label for="need-select">For Need:</label>
            <div id="need-select-container" style="margin-bottom: 15px;"></div>
          </div>
          <div class="form-group">
            <label for="device-select">Device:</label>
            <div id="device-select-container" style="margin-bottom: 15px;"></div>
          </div>
          <div class="form-group">
            <label for="device-notes">Notes:</label>
            <div id="notes-container"></div>
          </div>
        `;
        
        // Add dialog to body
        document.body.appendChild(dialog);
        
        // Add elements to their containers after the dialog is added to the DOM
        document.getElementById('need-select-container').appendChild(needSelect);
        document.getElementById('device-select-container').appendChild(deviceSelect);
        document.getElementById('notes-container').appendChild(notesField);
        
        // Initialize dialog
        $(dialog).dialog({
          modal: true,
          width: 500,
          buttons: {
            "Assign Device": function() {
              const selectedDeviceId = deviceSelect.value;
              const selectedNeedId = needSelect.value;
              const notes = notesField.value;
              
              if (!selectedNeedId) {
                alert('Please select a need');
                return;
              }
              
              if (!selectedDeviceId) {
                alert('Please select a device');
                return;
              }
              
              // Send API request to assign device to need
              fetch('/api/devices/need/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  need_id: selectedNeedId,
                  device_id: selectedDeviceId,
                  notes: notes
                })
              })
                .then(res => {
                  if (!res.ok) {
                    throw new Error('Failed to assign device');
                  }
                  return res.json();
                })
                .then(() => {
                  // Close dialog
                  $(dialog).dialog('close');
                  
                  // Reload the pupil profile to get updated data
                  loadPupilProfile(currentPupilData.pupil_id);
                  
                  // Remove the dialog from DOM after a short delay
                  setTimeout(() => {
                    if (document.body.contains(dialog)) {
                      document.body.removeChild(dialog);
                    }
                  }, 100);
                })
                .catch(error => {
                  console.error('Error assigning device:', error);
                  alert('Error assigning device: ' + error.message);
                });
            },
            "Cancel": function() {
              $(dialog).dialog('close');
              // Remove the dialog from DOM after a short delay
              setTimeout(() => {
                if (document.body.contains(dialog)) {
                  document.body.removeChild(dialog);
                }
              }, 100);
            }
          },
          close: function() {
            // Ensure cleanup on any close action (including clicking the X)
            setTimeout(() => {
              if (document.body.contains(dialog)) {
                document.body.removeChild(dialog);
              }
            }, 100);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching available devices:', error);
        alert('Error fetching available devices: ' + error.message);
      });
  }
}); 

// End of DOMContentLoaded event listener

// Note: The API endpoints in this file have been updated to match the server's routing structure:
// - Categories: /api/pupil-categories/assign-category (POST), /api/pupil-categories/:pupilId/categories/:categoryId (DELETE)
// - Need Overrides: /api/pupil-categories/need-override (POST), /api/pupil-categories/need-override/:overrideId (DELETE)
// - Devices: /api/devices/need/ (POST), /api/devices/need/:needId/device/:deviceId (DELETE) 