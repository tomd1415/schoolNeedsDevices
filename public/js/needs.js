document.addEventListener('DOMContentLoaded', () => {
  const needForm = document.getElementById('needForm');
  const needTableBody = document.querySelector('#needTable tbody');
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

  // Load needs from the server
  const loadNeeds = async () => {
    try {
      const response = await fetch('/api/needs');
      const needs = await response.json();
      needTableBody.innerHTML = '';
      needs.forEach(need => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${need.need_id}</td>
          <td>${need.need_name}</td>
          <td>${need.category_name || 'Uncategorized'}</td>
          <td>${need.description || ''}</td>
          <td>
            <button class="editBtn" data-id="${need.need_id}">Edit</button>
            <button class="deleteBtn" data-id="${need.need_id}">Delete</button>
          </td>
        `;
        needTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading needs:', error);
    }
  };

  // Initialize the page
  loadCategories();
  loadNeeds();

  // Handle add/edit need form submission
  needForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const needId = document.getElementById('need_id').value;
    const need_name = document.getElementById('need_name').value;
    const category_id = document.getElementById('category_id').value;
    const description = document.getElementById('description').value;

    const needData = { need_name, category_id, description };

    try {
      if (needId) {
        // Update existing need
        const response = await fetch(`/api/needs/${needId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(needData)
        });
        if (!response.ok) throw new Error('Failed to update need');
      } else {
        // Add new need
        const response = await fetch('/api/needs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(needData)
        });
        if (!response.ok) throw new Error('Failed to add need');
      }
      needForm.reset();
      document.getElementById('need_id').value = '';
      loadNeeds();
    } catch (error) {
      console.error('Error saving need:', error);
    }
  });

  // Delegate events for edit and delete buttons in the need table
  needTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('editBtn')) {
      const id = e.target.getAttribute('data-id');
      try {
        const response = await fetch(`/api/needs/${id}`);
        const need = await response.json();
        if (need) {
          document.getElementById('need_id').value = need.need_id;
          document.getElementById('need_name').value = need.need_name;
          document.getElementById('category_id').value = need.category_id || '';
          document.getElementById('description').value = need.description || '';
        }
      } catch (error) {
        console.error('Error fetching need for editing:', error);
      }
    }

    if (e.target.classList.contains('deleteBtn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this need?')) {
        try {
          const response = await fetch(`/api/needs/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadNeeds();
          } else {
            console.error('Error deleting need');
          }
        } catch (error) {
          console.error('Error deleting need:', error);
        }
      }
    }
  });
}); 