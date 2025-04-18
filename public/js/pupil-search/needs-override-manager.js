/**
 * Needs Override Manager Module
 * Handles displaying and managing pupil need overrides
 */
const NeedsOverrideManager = (function() {
  
    /**
     * Displays the need overrides for a pupil
     * 
     * @param {Array} overrides - Array of need override objects
     */
    function displayNeedOverrides(overrides) {
      const overridesContainer = document.getElementById('overrides-container');
      overridesContainer.innerHTML = '';
      
      if (!overrides || overrides.length === 0) {
        const noOverrides = document.createElement('p');
        noOverrides.className = 'no-data';
        noOverrides.textContent = 'No need overrides';
        overridesContainer.appendChild(noOverrides);
        return;
      }
      
      // Create table
      const table = document.createElement('table');
      table.className = 'data-table overrides-table';
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const needHeader = document.createElement('th');
      needHeader.textContent = 'Need';
      
      const typeHeader = document.createElement('th');
      typeHeader.textContent = 'Type';
      
      const notesHeader = document.createElement('th');
      notesHeader.textContent = 'Notes';
      
      const dateHeader = document.createElement('th');
      dateHeader.textContent = 'Date';
      
      const actionHeader = document.createElement('th');
      actionHeader.className = 'action-column';
      actionHeader.textContent = 'Action';
      
      headerRow.appendChild(needHeader);
      headerRow.appendChild(typeHeader);
      headerRow.appendChild(notesHeader);
      headerRow.appendChild(dateHeader);
      headerRow.appendChild(actionHeader);
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      overrides.forEach(override => {
        const row = document.createElement('tr');
        row.dataset.overrideId = override.override_id;
        
        const needCell = document.createElement('td');
        needCell.textContent = override.need_name;
        row.appendChild(needCell);
        
        const typeCell = document.createElement('td');
        typeCell.textContent = override.override_type === 'add' ? 'Add Need' : 'Remove Need';
        typeCell.className = override.override_type === 'add' ? 'add-override' : 'remove-override';
        row.appendChild(typeCell);
        
        const notesCell = document.createElement('td');
        notesCell.textContent = override.notes;
        row.appendChild(notesCell);
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(override.created_at).toLocaleDateString();
        row.appendChild(dateCell);
        
        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = 'Edit override';
        editButton.addEventListener('click', () => editOverride(override));
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-button';
        removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeButton.title = 'Remove override';
        removeButton.addEventListener('click', () => removeOverride(override));
        
        actionCell.appendChild(editButton);
        actionCell.appendChild(removeButton);
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      overridesContainer.appendChild(table);
      
      // Update edit mode buttons visibility
      const editModeButtons = overridesContainer.querySelectorAll('.edit-button, .remove-button');
      editModeButtons.forEach(button => {
        button.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
      });
    }
    
    /**
     * Adds a new need override for the current pupil
     */
    function addOverride() {
      if (!PupilSearchCore.currentPupilData) {
        ModalUtils.createAlertDialog('No pupil selected', 'Error');
        return;
      }
      
      const pupilId = PupilSearchCore.currentPupilData.pupil_id;
      
      // Fetch needs for the dropdown
      fetch('/api/needs')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch needs');
          }
          return response.json();
        })
        .then(needs => {
          if (needs.length === 0) {
            ModalUtils.createAlertDialog('No needs found in the system', 'Error');
            return;
          }
          
          // Create and show dialog
          const fields = [
            {
              type: 'select',
              id: 'need-select',
              label: 'Select Need',
              options: [
                { value: '', text: '-- Select a need --', disabled: true, selected: true },
                ...needs.map(need => ({
                  value: need.need_id,
                  text: need.need_name
                }))
              ]
            },
            {
              type: 'radio',
              id: 'override-type',
              label: 'Override Type',
              options: [
                { value: 'add', text: 'Add need', checked: true },
                { value: 'remove', text: 'Remove need' }
              ]
            },
            {
              type: 'textarea',
              id: 'override-notes',
              label: 'Notes (required)',
              attributes: { required: true, placeholder: 'Enter notes explaining this override...' }
            }
          ];
          
          const buttons = {
            "Add Override": function() {
              const form = this.form;
              const needId = form.querySelector('#need-select').value;
              const overrideType = form.querySelector('input[name="override-type"]:checked').value;
              const notes = form.querySelector('#override-notes').value;
              
              if (!needId) {
                ModalUtils.createAlertDialog('Please select a need', 'Error');
                return;
              }
              
              if (!notes.trim()) {
                ModalUtils.createAlertDialog('Please enter notes for this override', 'Error');
                return;
              }
              
              // Make API request to add the override
              fetch('/api/pupils/overrides', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  pupil_id: pupilId,
                  need_id: needId,
                  override_type: overrideType,
                  notes: notes
                })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to add need override');
                }
                return response.json();
              })
              .then(() => {
                // Close dialog
                $(this).dialog('close');
                
                // Refresh pupil data
                PupilProfile.loadPupilProfile(pupilId);
              })
              .catch(error => {
                console.error('Error adding need override:', error);
                ModalUtils.createAlertDialog('Failed to add need override: ' + error.message, 'Error');
              });
            },
            "Cancel": function() {
              $(this).dialog('close');
            }
          };
          
          ModalUtils.createFormDialog('Add Need Override', fields, buttons, { width: 500 });
        })
        .catch(error => {
          console.error('Error fetching needs:', error);
          ModalUtils.createAlertDialog('Failed to fetch needs: ' + error.message, 'Error');
        });
    }
    
    /**
     * Edits an existing need override
     * 
     * @param {Object} override - The override to edit
     */
    function editOverride(override) {
      if (!PupilSearchCore.currentPupilData) {
        ModalUtils.createAlertDialog('No pupil selected', 'Error');
        return;
      }
      
      const pupilId = PupilSearchCore.currentPupilData.pupil_id;
      
      // Create and show dialog
      const fields = [
        {
          type: 'text',
          id: 'need-name',
          label: 'Need',
          attributes: { value: override.need_name, disabled: true }
        },
        {
          type: 'radio',
          id: 'override-type',
          label: 'Override Type',
          options: [
            { value: 'add', text: 'Add need', checked: override.override_type === 'add' },
            { value: 'remove', text: 'Remove need', checked: override.override_type === 'remove' }
          ]
        },
        {
          type: 'textarea',
          id: 'override-notes',
          label: 'Notes (required)',
          attributes: { required: true, value: override.notes }
        }
      ];
      
      const buttons = {
        "Update Override": function() {
          const form = this.form;
          const overrideType = form.querySelector('input[name="override-type"]:checked').value;
          const notes = form.querySelector('#override-notes').value;
          
          if (!notes.trim()) {
            ModalUtils.createAlertDialog('Please enter notes for this override', 'Error');
            return;
          }
          
          // Make API request to update the override
          fetch(`/api/pupils/overrides/${override.override_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              override_type: overrideType,
              notes: notes
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to update need override');
            }
            return response.json();
          })
          .then(() => {
            // Close dialog
            $(this).dialog('close');
            
            // Refresh pupil data
            PupilProfile.loadPupilProfile(pupilId);
          })
          .catch(error => {
            console.error('Error updating need override:', error);
            ModalUtils.createAlertDialog('Failed to update need override: ' + error.message, 'Error');
          });
        },
        "Cancel": function() {
          $(this).dialog('close');
        }
      };
      
      ModalUtils.createFormDialog('Edit Need Override', fields, buttons, { width: 500 });
    }
    
    /**
     * Removes a need override
     * 
     * @param {Object} override - The override to remove
     */
    function removeOverride(override) {
      if (!PupilSearchCore.currentPupilData) {
        ModalUtils.createAlertDialog('No pupil selected', 'Error');
        return;
      }
      
      const pupilId = PupilSearchCore.currentPupilData.pupil_id;
      
      ModalUtils.createConfirmDialog(
        `Are you sure you want to remove this override for "${override.need_name}"?`,
        () => {
          // Show loading indicator
          const loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'loading-indicator';
          loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing override...';
          document.getElementById('overrides-container').prepend(loadingIndicator);
          
          // Make API request to remove the override
          fetch(`/api/pupils/overrides/${override.override_id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to remove need override');
            }
            
            // If status is 204 No Content or response has no body, don't try to parse JSON
            if (response.status === 204 || response.headers.get('content-length') === '0') {
              return null;
            }
            
            return response.json();
          })
          .then(() => {
            // Refresh pupil data
            PupilProfile.loadPupilProfile(pupilId);
          })
          .catch(error => {
            console.error('Error removing need override:', error);
            ModalUtils.createAlertDialog('Failed to remove need override: ' + error.message, 'Error');
          })
          .finally(() => {
            // Remove loading indicator
            loadingIndicator.remove();
          });
        }
      );
    }
    
    // Public API
    return {
      displayNeedOverrides,
      addOverride,
      editOverride,
      removeOverride
    };
  })(); 