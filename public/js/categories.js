document.addEventListener('DOMContentLoaded', () => {
  const categoryForm = document.getElementById('categoryForm');
  const categoryTableBody = document.querySelector('#categoryTable tbody');

  // Load categories from the server
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      categoryTableBody.innerHTML = '';
      categories.forEach(category => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${category.category_id}</td>
          <td>${category.category_name}</td>
          <td>${category.description || ''}</td>
          <td>
            <button class="editBtn" data-id="${category.category_id}">Edit</button>
            <button class="deleteBtn" data-id="${category.category_id}">Delete</button>
          </td>
        `;
        categoryTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  loadCategories();

  // Handle add/edit category form submission
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryId = document.getElementById('category_id').value;
    const category_name = document.getElementById('category_name').value;
    const description = document.getElementById('description').value;

    const categoryData = { category_name, description };

    try {
      if (categoryId) {
        // Update existing category
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Failed to update category');
      } else {
        // Add new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Failed to add category');
      }
      categoryForm.reset();
      document.getElementById('category_id').value = '';
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  });

  // Delegate events for edit and delete buttons in the category table
  categoryTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('editBtn')) {
      const id = e.target.getAttribute('data-id');
      try {
        const response = await fetch(`/api/categories/${id}`);
        const category = await response.json();
        if (category) {
          document.getElementById('category_id').value = category.category_id;
          document.getElementById('category_name').value = category.category_name;
          document.getElementById('description').value = category.description || '';
        }
      } catch (error) {
        console.error('Error fetching category for editing:', error);
      }
    }

    if (e.target.classList.contains('deleteBtn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadCategories();
          } else {
            console.error('Error deleting category');
          }
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      }
    }
  });
}); 
