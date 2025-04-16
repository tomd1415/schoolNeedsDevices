document.addEventListener('DOMContentLoaded', () => {
  const deviceForm = document.getElementById('deviceForm');
  const deviceTableBody = document.querySelector('#deviceTable tbody');
  const categorySelect = document.getElementById('category_id');

  // Load categories for the dropdown
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      categorySelect.innerHTML = '<option value="">Select a category</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Load devices from the server
  const loadDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const devices = await response.json();
      deviceTableBody.innerHTML = '';
      devices.forEach(device => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${device.device_id}</td>
          <td>${device.name}</td>
          <td>${device.model || ''}</td>
          <td>${device.serial_number || ''}</td>
          <td>${device.category_name || 'Uncategorised'}</td>
          <td>${device.status || 'Unknown'}</td>
          <td>
            <button class="editBtn" data-id="${device.device_id}">Edit</button>
            <button class="deleteBtn" data-id="${device.device_id}">Delete</button>
          </td>
        `;
        deviceTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  // Initialize the page
  loadCategories();
  loadDevices();

  // Handle add/edit device form submission
  deviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const deviceId = document.getElementById('device_id').value;
    const device_name = document.getElementById('device_name').value;
    const model = document.getElementById('model').value;
    const serial_number = document.getElementById('serial_number').value;
    const purchase_date = document.getElementById('purchase_date').value;
    const warranty_info = document.getElementById('warranty_info').value;
    const status = document.getElementById('status').value;
    const category_id = document.getElementById('category_id').value;
    const notes = document.getElementById('notes').value;

    const deviceData = { 
      device_name, model, serial_number, purchase_date, 
      warranty_info, status, notes, category_id 
    };

    try {
      if (deviceId) {
        // Update existing device
        const response = await fetch(`/api/devices/${deviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceData)
        });
        if (!response.ok) throw new Error('Failed to update device');
      } else {
        // Add new device
        const response = await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceData)
        });
        if (!response.ok) throw new Error('Failed to add device');
      }
      deviceForm.reset();
      document.getElementById('device_id').value = '';
      loadDevices();
    } catch (error) {
      console.error('Error saving device:', error);
    }
  });

  // Delegate events for edit and delete buttons in the device table
  deviceTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('editBtn')) {
      const id = e.target.getAttribute('data-id');
      try {
        const response = await fetch(`/api/devices/${id}`);
        const device = await response.json();
        if (device) {
          document.getElementById('device_id').value = device.device_id;
          document.getElementById('device_name').value = device.device_name;
          document.getElementById('model').value = device.model || '';
          document.getElementById('serial_number').value = device.serial_number || '';
          document.getElementById('purchase_date').value = formatDateForInput(device.purchase_date);
          document.getElementById('warranty_info').value = device.warranty_info || '';
          document.getElementById('status').value = device.status || 'available';
          document.getElementById('category_id').value = device.category_id || '';
          document.getElementById('notes').value = device.notes || '';
        }
      } catch (error) {
        console.error('Error fetching device for editing:', error);
      }
    }

    if (e.target.classList.contains('deleteBtn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this device?')) {
        try {
          const response = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadDevices();
          } else {
            console.error('Error deleting device');
          }
        } catch (error) {
          console.error('Error deleting device:', error);
        }
      }
    }
  });
});
