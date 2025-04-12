document.addEventListener('DOMContentLoaded', () => {
  const formForm = document.getElementById('formForm');
  const formTableBody = document.querySelector('#formTable tbody');

  // Load forms from the server
  const loadForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const forms = await response.json();
      formTableBody.innerHTML = '';
      forms.forEach(form => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${form.form_id}</td>
          <td>${form.form_year}</td>
          <td>${form.form_name}</td>
          <td>${form.teacher_name || ''}</td>
          <td>${form.form_description || ''}</td>
          <td>
            <button class="editBtn" data-id="${form.form_id}">Edit</button>
            <button class="deleteBtn" data-id="${form.form_id}">Delete</button>
          </td>
        `;
        formTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  loadForms();

  // Handle add/edit form form submission
  formForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formId = document.getElementById('form_id').value;
    const form_year = document.getElementById('form_year').value;
    const form_name = document.getElementById('form_name').value;
    const teacher_name = document.getElementById('teacher_name').value;
    const description = document.getElementById('description').value;

    const formData = { form_year, form_name, teacher_name, description };

    try {
      if (formId) {
        // Update existing form
        const response = await fetch(`/api/forms/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to update form');
      } else {
        // Add new form
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to add form');
      }
      formForm.reset();
      document.getElementById('form_id').value = '';
      loadForms();
    } catch (error) {
      console.error('Error saving form:', error);
    }
  });

  // Delegate events for edit and delete buttons in the form table
  formTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('editBtn')) {
      const id = e.target.getAttribute('data-id');
      try {
        const response = await fetch(`/api/forms/${id}`);
        const form = await response.json();
        if (form) {
          document.getElementById('form_id').value = form.form_id;
          document.getElementById('form_name').value = form.form_name;
          document.getElementById('teacher_name').value = form.teacher_name || '';
          document.getElementById('description').value = form.description || '';
        }
      } catch (error) {
        console.error('Error fetching form for editing:', error);
      }
    }

    if (e.target.classList.contains('deleteBtn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this form?')) {
        try {
          const response = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadForms();
          } else {
            console.error('Error deleting form');
          }
        } catch (error) {
          console.error('Error deleting form:', error);
        }
      }
    }
  });
}); 
