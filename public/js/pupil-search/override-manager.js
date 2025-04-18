/**
 * Override Manager for handling pupil need overrides
 */
const OverrideManager = (function() {
  
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
      
      // Hide/show edit buttons based on edit mode
      const editButtons = overridesContainer.querySelectorAll('.edit-override-btn, .remove-override-btn');
      editButtons.forEach(button => {
        button.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
      });
    }
    
    /**
     * Edit a need override
     * @param {Object} override - The override to edit
     */
    function editOverride(override) {
      // Create container for form elements
      const formContainer = document.createElement('div');
      formContainer.className = 'modal-form-container';
      
      // Create form sections
      const typeSelectSection = document.createElement('div');
      typeSelectSection.className = 'form-group';
      typeSelectSection.innerHTML = `
        <label for="override-type">Type:</label>
        <div id="type-select-container"></div>
      `;
      
      const notesSection = document.createElement('div');
      notesSection.className = 'form-group';
      notesSection.innerHTML = `
        <label for="override-notes">Notes:</label>
        <div id="notes-container"></div>
      `;
      
      // Add form sections to container
      formContainer.appendChild(document.createElement('p')).textContent = 
        `Edit override for ${override.need_name}:`;
      formContainer.appendChild(typeSelectSection);
      formContainer.appendChild(notesSection);
      
      // Create modal dialog
      const dialog = ModalUtils.createModal('edit-override-dialog', 'Edit Override', formContainer, {
        width: 500,
        buttons: {
          "Save Changes": function() {
            const isAdded = typeSelect.value === '1';
            const notes = notesTextarea.value.trim();
            
            if (!notes) {
              alert('Please provide notes for this override');
              return;
            }
            
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
                // Close dialog and reload pupil profile
                $(dialog).dialog('close');
                PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
              })
              .catch(error => {
                console.error('Error updating override:', error);
                alert('Error updating override: ' + error.message);
              });
          },
          "Cancel": function() {
            $(dialog).dialog('close');
          }
        }
      });
      
      // Create form elements
      const typeSelect = document.createElement('select');
      typeSelect.id = 'override-type';
      typeSelect.style.width = '100%';
      
      // Add options
      const addOption = document.createElement('option');
      addOption.value = '1';
      addOption.text = 'Added';
      addOption.selected = override.is_added;
      typeSelect.appendChild(addOption);
      
      const removeOption = document.createElement('option');
      removeOption.value = '0';
      removeOption.text = 'Removed';
      removeOption.selected = !override.is_added;
      typeSelect.appendChild(removeOption);
      
      // Create textarea for notes
      const notesTextarea = document.createElement('textarea');
      notesTextarea.id = 'override-notes';
      notesTextarea.value = override.notes || '';
      notesTextarea.rows = 4;
      notesTextarea.style.width = '100%';
      
      // Add elements to their containers
      dialog.querySelector('#type-select-container').appendChild(typeSelect);
      dialog.querySelector('#notes-container').appendChild(notesTextarea);
    }
    
    /**
     * Remove a need override
     * @param {number} overrideId - The ID of the override to remove
     */
    function removeOverride(overrideId) {
      if (!PupilSearchCore.currentPupilData) return;
      
      if (confirm('Are you sure you want to remove this override?')) {
        fetch(`/api/pupil-categories/need-override/${overrideId}`, {
          method: 'DELETE'
        })
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to remove override');
            }
            
            // If status is 204 No Content or response has no body, don't try to parse JSON
            if (res.status === 204 || res.headers.get('content-length') === '0') {
              return null;
            }
            
            return res.json();
          })
          .then(() => {
            // Reload the pupil profile to get updated data
            PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
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
      if (!PupilSearchCore.currentPupilData) return;
      
      // Create container for form elements
      const formContainer = document.createElement('div');
      formContainer.className = 'modal-form-container';
      
      // Create form sections
      const needSelectSection = document.createElement('div');
      needSelectSection.className = 'form-group';
      needSelectSection.innerHTML = `
        <label for="need-select">Need:</label>
        <div id="need-select-container"></div>
      `;
      
      const radioSection = document.createElement('div');
      radioSection.className = 'form-group';
      radioSection.innerHTML = `
        <label>Override Type:</label>
        <div id="radio-container"></div>
      `;
      
      const notesSection = document.createElement('div');
      notesSection.className = 'form-group';
      notesSection.innerHTML = `
        <label for="override-notes">Notes:</label>
        <div id="notes-container"></div>
      `;
      
      // Add form sections to container
      formContainer.appendChild(document.createElement('p')).textContent = 
        `Add a need override for ${PupilSearchCore.currentPupilData.first_name} ${PupilSearchCore.currentPupilData.last_name}:`;
      formContainer.appendChild(needSelectSection);
      formContainer.appendChild(radioSection);
      formContainer.appendChild(notesSection);
      
      // Create modal dialog
      const dialog = ModalUtils.createModal('override-dialog', 'Add Need Override', formContainer, {
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
                pupil_id: PupilSearchCore.currentPupilData.pupil_id,
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
                // Close dialog and reload pupil profile
                $(dialog).dialog('close');
                PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
              })
              .catch(error => {
                console.error('Error adding override:', error);
                alert('Error adding override: ' + error.message);
              });
          },
          "Cancel": function() {
            $(dialog).dialog('close');
          }
        }
      });
      
      // Create form elements
      const needSelect = document.createElement('select');
      needSelect.id = 'need-select';
      needSelect.style.width = '100%';
      
      // Add placeholder option for needs
      const placeholderOption = document.createElement('option');
      placeholderOption.text = 'Select a need';
      placeholderOption.value = '';
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      needSelect.appendChild(placeholderOption);
      
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
      notesTextarea.style.width = '100%';
      
      // Add elements to their containers
      dialog.querySelector('#need-select-container').appendChild(needSelect);
      dialog.querySelector('#radio-container').appendChild(radioContainer);
      dialog.querySelector('#notes-container').appendChild(notesTextarea);
      
      // Fetch needs
      fetch('/api/needs')
        .then(res => res.json())
        .then(needs => {
          if (needs.length === 0) {
            needSelect.innerHTML = '<option value="">No needs available</option>';
            needSelect.disabled = true;
          } else {
            // Add need options
            needs.forEach(need => {
              const option = document.createElement('option');
              option.text = need.name;
              option.value = need.need_id;
              needSelect.appendChild(option);
            });
          }
        })
        .catch(error => {
          console.error('Error fetching needs:', error);
          needSelect.innerHTML = '<option value="">Error loading needs</option>';
          needSelect.disabled = true;
        });
    }
    
    // Public API
    return {
      displayOverrides,
      editOverride,
      removeOverride,
      addOverride
    };
  })(); 