document.addEventListener('DOMContentLoaded', () => {
  const pupilForm = document.getElementById('pupilForm');
  const csvUploadForm = document.getElementById('csvUploadForm');
  const pupilTableBody = document.querySelector('#pupilTable tbody');
  const uploadMessageDiv = document.getElementById('uploadMessage');
  const formSelect = document.getElementById('form_id');
  
  // Store forms data to use for display
  let formsData = [];

  // Load forms from the server
  const loadForms = async () => {
    try {
      const response = await fetch('/api/forms');
      formsData = await response.json();
      formSelect.innerHTML = '<option value="">Select a form</option>';
      formsData.forEach(form => {
        const option = document.createElement('option');
        option.value = form.form_id;
        option.textContent = form.form_name;
        formSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  // Get form name by id
  const getFormNameById = (formId) => {
    const form = formsData.find(f => f.form_id == formId);
    return form ? form.form_name : formId;
  };

  // Load pupils from the server
  const loadPupils = async () => {
    try {
      const response = await fetch('/api/pupils');
      const pupils = await response.json();
      pupilTableBody.innerHTML = '';
      pupils.forEach(pupil => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${pupil.pupil_id}</td>
          <td>${pupil.first_name}</td>
          <td>${pupil.last_name}</td>
          <td>${getFormNameById(pupil.form_id)}</td>
          <td>${pupil.notes || ''}</td>
          <td>
            <button class="action-button edit-btn" data-id="${pupil.pupil_id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-button delete-btn" data-id="${pupil.pupil_id}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        `;
        pupilTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading pupils:', error);
    }
  };

  // Initialize by loading forms and pupils
  loadForms();
  loadPupils();

  // Handle add/edit pupil form submission
  pupilForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pupilId = document.getElementById('pupil_id').value;
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const form_id = document.getElementById('form_id').value;
    const notes = document.getElementById('notes').value;

    const pupilData = { first_name, last_name, form_id, notes };

    try {
      if (pupilId) {
        // Update existing pupil
        const response = await fetch(`/api/pupils/${pupilId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pupilData)
        });
        if (!response.ok) throw new Error('Failed to update pupil');
      } else {
        // Add new pupil
        const response = await fetch('/api/pupils', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pupilData)
        });
        if (!response.ok) throw new Error('Failed to add pupil');
      }
      pupilForm.reset();
      document.getElementById('pupil_id').value = '';
      loadPupils();
    } catch (error) {
      console.error('Error saving pupil:', error);
    }
  });

  // Handle CSV upload form
  csvUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvfile');
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a CSV file');
      return;
    }
    const formData = new FormData();
    formData.append('csvfile', file);
    try {
      uploadMessageDiv.textContent = "Uploading...";
      uploadMessageDiv.className = "";
      
      const response = await fetch('/api/pupils/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      
      uploadMessageDiv.textContent = result.message || 'CSV upload successful';
      uploadMessageDiv.className = 'success';
      loadPupils();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      uploadMessageDiv.textContent = 'Error uploading CSV: ' + error.message;
      uploadMessageDiv.className = 'error';
    }
  });

  // Delegate events for edit and delete buttons in the pupil table
  pupilTableBody.addEventListener('click', async (e) => {
    // Use closest to handle clicks on the icon or the button
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      try {
        const response = await fetch('/api/pupils');
        const pupils = await response.json();
        const pupil = pupils.find(p => p.pupil_id == id);
        if (pupil) {
          document.getElementById('pupil_id').value = pupil.pupil_id;
          document.getElementById('first_name').value = pupil.first_name;
          document.getElementById('last_name').value = pupil.last_name;
          document.getElementById('form_id').value = pupil.form_id;
          document.getElementById('notes').value = pupil.notes || '';
          
          // Scroll to the form section
          document.getElementById('pupil-form-section').scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error fetching pupil for editing:', error);
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this pupil?')) {
        try {
          const response = await fetch(`/api/pupils/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadPupils();
          } else {
            console.error('Error deleting pupil');
          }
        } catch (error) {
          console.error('Error deleting pupil:', error);
        }
      }
    }
  });
});
