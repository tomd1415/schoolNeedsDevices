/**
 * Device Manager Module
 * Handles displaying and managing pupil devices
 */
const DeviceManager = (function() {
  
  /**
   * Displays the devices assigned to a pupil
   * 
   * @param {Array} devices - Array of device objects
   */
  function displayDevices(devices) {
    const devicesContainer = document.getElementById('devices-container');
    devicesContainer.innerHTML = '';
    
    if (!devices || devices.length === 0) {
      const noDevices = document.createElement('p');
      noDevices.className = 'no-data';
      noDevices.textContent = 'No devices assigned';
      devicesContainer.appendChild(noDevices);
      return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'data-table devices-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const deviceHeader = document.createElement('th');
    deviceHeader.textContent = 'Device';
    
    const typeHeader = document.createElement('th');
    typeHeader.textContent = 'Type';
    
    const serialHeader = document.createElement('th');
    serialHeader.textContent = 'Serial Number';
    
    const notesHeader = document.createElement('th');
    notesHeader.textContent = 'Notes';
    
    const actionHeader = document.createElement('th');
    actionHeader.className = 'action-column';
    actionHeader.textContent = 'Action';
    
    headerRow.appendChild(deviceHeader);
    headerRow.appendChild(typeHeader);
    headerRow.appendChild(serialHeader);
    headerRow.appendChild(notesHeader);
    headerRow.appendChild(actionHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    devices.forEach(device => {
      const row = document.createElement('tr');
      row.dataset.deviceId = device.device_id;
      
      const nameCell = document.createElement('td');
      nameCell.textContent = device.device_name;
      row.appendChild(nameCell);
      
      const typeCell = document.createElement('td');
      typeCell.textContent = device.device_type;
      row.appendChild(typeCell);
      
      const serialCell = document.createElement('td');
      serialCell.textContent = device.serial_number || 'N/A';
      row.appendChild(serialCell);
      
      const notesCell = document.createElement('td');
      notesCell.textContent = device.notes || '';
      row.appendChild(notesCell);
      
      const actionCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.innerHTML = '<i class="fas fa-unlink"></i>';
      removeButton.title = 'Unassign device';
      removeButton.addEventListener('click', () => removeDeviceFromPupil(device));
      
      actionCell.appendChild(removeButton);
      row.appendChild(actionCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    devicesContainer.appendChild(table);
    
    // Show add device button in edit mode
    const addDeviceBtn = document.getElementById('add-device-btn');
    if (addDeviceBtn) {
      addDeviceBtn.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
    }
    
    // Update edit mode buttons visibility
    const editModeButtons = devicesContainer.querySelectorAll('.remove-button');
    editModeButtons.forEach(button => {
      button.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
    });
  }
  
  /**
   * Adds a device to the current pupil
   */
  function addDevice() {
    if (!PupilSearchCore.currentPupilData) {
      ModalUtils.createAlertDialog('No pupil selected', 'Error');
      return;
    }
    
    const pupilId = PupilSearchCore.currentPupilData.pupil_id;
    
    // Fetch unassigned devices
    fetch('/api/devices/unassigned')
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Raw error response:', text);
            try {
              const jsonError = JSON.parse(text);
              throw new Error(jsonError.message || 'Failed to fetch unassigned devices');
            } catch (e) {
              throw new Error('Failed to fetch unassigned devices: ' + text);
            }
          });
        }
        return response.json();
      })
      .then(devices => {
        if (devices.length === 0) {
          ModalUtils.createAlertDialog('No unassigned devices available', 'Error');
          return;
        }
        
        // Create modal dialog for device selection
        const fields = [
          {
            type: 'select',
            id: 'device-select',
            label: 'Select Device',
            options: [
              { value: '', text: '-- Select a device --', disabled: true, selected: true },
              ...devices.map(device => ({
                value: device.device_id,
                text: `${device.device_name} (${device.device_type}) - ${device.serial_number || 'No S/N'}`
              }))
            ]
          },
          {
            type: 'textarea',
            id: 'assignment-notes',
            label: 'Assignment Notes',
            attributes: { placeholder: 'Enter any notes about this device assignment...' }
          }
        ];
        
        const buttons = {
          "Assign Device": function() {
            const form = this.form;
            const deviceId = form.querySelector('#device-select').value;
            const notes = form.querySelector('#assignment-notes').value;
            
            if (!deviceId) {
              ModalUtils.createAlertDialog('Please select a device', 'Error');
              return;
            }
            
            // Make API request to assign the device
            fetch('/api/devices/need', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                need_id: pupilId, // Using need_id for the pupil for now
                device_id: deviceId,
                notes: notes
              })
            })
            .then(response => {
              if (!response.ok) {
                return response.text().then(text => {
                  console.error('Raw error response:', text);
                  try {
                    const jsonError = JSON.parse(text);
                    throw new Error(jsonError.message || 'Failed to assign device');
                  } catch (e) {
                    throw new Error('Failed to assign device: ' + text);
                  }
                });
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
              console.error('Error assigning device:', error);
              ModalUtils.createAlertDialog('Failed to assign device: ' + error.message, 'Error');
            });
          },
          "Cancel": function() {
            $(this).dialog('close');
          }
        };
        
        ModalUtils.createFormDialog('Assign Device', fields, buttons, { width: 500 });
      })
      .catch(error => {
        console.error('Error fetching unassigned devices:', error);
        ModalUtils.createAlertDialog('Failed to fetch unassigned devices: ' + error.message, 'Error');
      });
  }
  
  /**
   * Removes a device from the current pupil
   * 
   * @param {Object} device - The device to remove
   */
  function removeDeviceFromPupil(device) {
    if (!PupilSearchCore.currentPupilData) {
      ModalUtils.createAlertDialog('No pupil selected', 'Error');
      return;
    }
    
    const pupilId = PupilSearchCore.currentPupilData.pupil_id;
    
    ModalUtils.createConfirmDialog(
      `Are you sure you want to unassign "${device.device_name}" from this pupil?`,
      () => {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing device...';
        document.getElementById('devices-container').prepend(loadingIndicator);
        
        // Make API request to unassign the device - FIXED ENDPOINT
        fetch(`/api/devices/need/${device.need_id}/device/${device.device_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to unassign device');
          }
          
          // If status is 204 No Content or response has no body, don't try to parse JSON
          if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
          }
          
          return response.json();
        })
        .then(() => {
          // Refresh pupil data
          PupilProfile.loadPupilProfile(PupilSearchCore.currentPupilData.pupil_id);
        })
        .catch(error => {
          console.error('Error unassigning device:', error);
          ModalUtils.createAlertDialog('Failed to unassign device: ' + error.message, 'Error');
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
    displayDevices,
    addDevice,
    removeDeviceFromPupil
  };
})(); 