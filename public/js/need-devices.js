document.addEventListener('DOMContentLoaded', () => {
  const pupilSelect = document.getElementById('pupil_id');
  const needSelect = document.getElementById('need_id');
  const deviceSelect = document.getElementById('device_id');
  const assignDeviceForm = document.getElementById('assignDeviceForm');
  const assignedDevicesTableBody = document.querySelector('#assignedDevicesTable tbody');
  
  const selectNeedSection = document.getElementById('select-need-section');
  const needDetails = document.getElementById('need-details');
  const assignDeviceSection = document.getElementById('assign-device-section');
  const assignedDevicesSection = document.getElementById('assigned-devices-section');
  
  const needNameSpan = document.getElementById('need-name');
  const needCategorySpan = document.getElementById('need-category');
  const needDescriptionSpan = document.getElementById('need-description');
  
  let selectedPupil = null;
  let selectedNeed = null;
  let assignedDevices = [];

  // Set current date as default for assignment date
  document.getElementById('assignment_date').value = new Date().toISOString().split('T')[0];

  // Load pupils for the dropdown
  const loadPupils = async () => {
    try {
      const response = await fetch('/api/pupils');
      const pupils = await response.json();
      pupilSelect.innerHTML = '<option value="">Select a pupil</option>';
      pupils.forEach(pupil => {
        const option = document.createElement('option');
        option.value = pupil.pupil_id;
        option.textContent = `${pupil.first_name} ${pupil.last_name}`;
        pupilSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading pupils:', error);
    }
  };

  // Load needs for a specific pupil
  const loadPupilNeeds = async (pupilId) => {
    try {
      const response = await fetch(`/api/needs/pupil/${pupilId}`);
      const needs = await response.json();
      
      needSelect.innerHTML = '<option value="">Select a need</option>';
      if (needs.length === 0) {
        needSelect.innerHTML = '<option value="">No needs assigned to this pupil</option>';
      } else {
        needs.forEach(need => {
          const option = document.createElement('option');
          option.value = need.need_id;
          option.textContent = need.need_name;
          needSelect.appendChild(option);
        });
      }
      
      // Show the need selection section
      selectNeedSection.style.display = 'block';
      
      // Hide other sections until a need is selected
      needDetails.style.display = 'none';
      assignDeviceSection.style.display = 'none';
      assignedDevicesSection.style.display = 'none';
    } catch (error) {
      console.error('Error loading pupil needs:', error);
    }
  };

  // Load available devices for the dropdown
  const loadAvailableDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const devices = await response.json();
      
      // Filter to only show available devices
      const availableDevices = devices.filter(d => d.status === 'available');
      
      deviceSelect.innerHTML = '<option value="">Select a device</option>';
      if (availableDevices.length === 0) {
        deviceSelect.innerHTML = '<option value="">No available devices</option>';
      } else {
        availableDevices.forEach(device => {
          const option = document.createElement('option');
          option.value = device.device_id;
          option.textContent = `${device.device_name} - ${device.model || 'N/A'} (${device.serial_number || 'No S/N'})`;
          deviceSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading available devices:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Load devices assigned to a need
  const loadAssignedDevices = async (needId) => {
    try {
      const response = await fetch(`/api/devices/need/${needId}`);
      assignedDevices = await response.json();
      
      assignedDevicesTableBody.innerHTML = '';
      if (assignedDevices.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6">No devices assigned yet</td>';
        assignedDevicesTableBody.appendChild(tr);
      } else {
        assignedDevices.forEach(assignment => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${assignment.device_name}</td>
            <td>${assignment.model || ''}</td>
            <td>${assignment.serial_number || ''}</td>
            <td>${formatDate(assignment.assignment_date)}</td>
            <td>${assignment.notes || ''}</td>
            <td>
              <button class="deleteBtn" data-deviceid="${assignment.device_id}">Remove</button>
            </td>
          `;
          assignedDevicesTableBody.appendChild(tr);
        });
      }
    } catch (error) {
      console.error('Error loading assigned devices:', error);
    }
  };

  // Load need details
  const loadNeedDetails = async (needId) => {
    try {
      const response = await fetch(`/api/needs/${needId}`);
      selectedNeed = await response.json();
      
      if (selectedNeed) {
        needNameSpan.textContent = selectedNeed.need_name;
        needCategorySpan.textContent = selectedNeed.category_name || 'Uncategorized';
        needDescriptionSpan.textContent = selectedNeed.description || 'No description';
        
        // Show the need details and assign device sections
        needDetails.style.display = 'block';
        assignDeviceSection.style.display = 'block';
        assignedDevicesSection.style.display = 'block';
        
        // Load available devices and assigned devices
        loadAvailableDevices();
        loadAssignedDevices(needId);
      }
    } catch (error) {
      console.error('Error loading need details:', error);
    }
  };

  // Pupil selection change event
  pupilSelect.addEventListener('change', () => {
    const pupilId = pupilSelect.value;
    if (pupilId) {
      selectedPupil = { pupil_id: pupilId };
      loadPupilNeeds(pupilId);
    } else {
      // Hide sections if no pupil is selected
      selectNeedSection.style.display = 'none';
      needDetails.style.display = 'none';
      assignDeviceSection.style.display = 'none';
      assignedDevicesSection.style.display = 'none';
    }
  });

  // Need selection change event
  needSelect.addEventListener('change', () => {
    const needId = needSelect.value;
    if (needId) {
      loadNeedDetails(needId);
    } else {
      // Hide sections if no need is selected
      needDetails.style.display = 'none';
      assignDeviceSection.style.display = 'none';
      assignedDevicesSection.style.display = 'none';
    }
  });

  // Handle assign device form submission
  assignDeviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedNeed) {
      alert('Please select a need first');
      return;
    }
    
    const deviceId = deviceSelect.value;
    const assignmentDate = document.getElementById('assignment_date').value;
    const notes = document.getElementById('notes').value;
    
    if (!deviceId) {
      alert('Please select a device to assign');
      return;
    }
    
    const assignData = {
      need_id: selectedNeed.need_id,
      device_id: deviceId,
      assignment_date: assignmentDate,
      notes
    };
    
    try {
      const response = await fetch('/api/devices/need', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData)
      });
      
      if (!response.ok) throw new Error('Failed to assign device');
      
      // Reload the assigned devices
      loadAssignedDevices(selectedNeed.need_id);
      
      // Also reload available devices as one was just assigned
      loadAvailableDevices();
      
      // Reset the form
      document.getElementById('notes').value = '';
    } catch (error) {
      console.error('Error assigning device:', error);
    }
  });

  // Handle removing assigned devices
  assignedDevicesTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('deleteBtn')) {
      const deviceId = e.target.getAttribute('data-deviceid');
      if (confirm('Are you sure you want to remove this device assignment?')) {
        try {
          const response = await fetch(`/api/devices/need/${selectedNeed.need_id}/device/${deviceId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to remove device assignment');
          
          // Reload the assigned devices
          loadAssignedDevices(selectedNeed.need_id);
          
          // Also reload available devices as one was just unassigned
          loadAvailableDevices();
        } catch (error) {
          console.error('Error removing device assignment:', error);
        }
      }
    }
  });

  // Initialize the page
  loadPupils();
}); 