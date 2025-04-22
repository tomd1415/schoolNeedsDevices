document.addEventListener('DOMContentLoaded', () => {
  const needForm = document.getElementById('needForm');
  const needTableBody = document.querySelector('#needTable tbody');
  const categorySelect = document.getElementById('category_id');

  // Load categories for the dropdown
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      categorySelect.innerHTML = '<option value="">Select a primary category</option>';
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

  // Load need's categories
  const loadNeedCategories = async (needId) => {
    try {
      const response = await fetch(`/api/category-needs/${needId}/categories`);
      return await response.json();
    } catch (error) {
      console.error('Error loading need categories:', error);
      return [];
    }
  };

  // Load needs from the server
  const loadNeeds = async () => {
    try {
      const response = await fetch('/api/needs');
      const needs = await response.json();
      needTableBody.innerHTML = '';
      
      for (const need of needs) {
        // Get categories for this need
        const needCategories = await loadNeedCategories(need.need_id);
        const categoryNames = needCategories.map(cat => cat.name).join(', ');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${need.need_id}</td>
          <td>${need.name}</td>
          <td>${categoryNames || 'None'}</td>
          <td>${need.short_description || ''}</td>
          <td>${need.description || ''}</td>
          <td>
            <button class="action-button edit-btn" data-id="${need.need_id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-button delete-btn" data-id="${need.need_id}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
            <button class="action-button categoriesBtn" data-id="${need.need_id}">
              <i class="fas fa-tags"></i> Manage Categories
            </button>
          </td>
        `;
        needTableBody.appendChild(tr);
      }
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
    const category_id = document.getElementById('category_id').value; // Primary category
    const need_short_desc = document.getElementById('need_short_desc').value;
    const need_long_desc = document.getElementById('need_long_desc').value;

    const needData = { 
      need_name, 
      category_id, 
      need_short_desc, 
      need_long_desc 
    };

    try {
      let newNeedId = needId;
      
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
        const result = await response.json();
        newNeedId = result.need_id;
      }
      
      needForm.reset();
      document.getElementById('need_id').value = '';
      loadNeeds();
    } catch (error) {
      console.error('Error saving need:', error);
    }
  });

  // Create a modal for managing categories
  const createCategoryModal = () => {
    // Check if modal already exists
    if (document.getElementById('categoryModal')) {
      return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'categoryModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Manage Categories for Need</h2>
        <div id="categoriesList"></div>
        <div class="form-group">
          <select id="addCategorySelect" class="form-input"></select>
          <button id="addCategoryBtn" class="action-button">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.querySelector('#categoryModal .close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };

  // Show category management modal
  const showCategoryModal = async (needId) => {
    createCategoryModal();
    const modal = document.getElementById('categoryModal');
    const categoriesList = document.getElementById('categoriesList');
    const addCategorySelect = document.getElementById('addCategorySelect');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    // Load all categories
    const response = await fetch('/api/categories');
    const allCategories = await response.json();
    
    // Load need categories
    const needCategories = await loadNeedCategories(needId);
    const assignedCategoryIds = needCategories.map(c => c.category_id);
    
    // Display assigned categories
    categoriesList.innerHTML = '<h3>Assigned Categories</h3>';
    if (needCategories.length === 0) {
      categoriesList.innerHTML += '<p>No categories assigned yet</p>';
    } else {
      const ul = document.createElement('ul');
      ul.className = 'item-list';
      needCategories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.category_name;
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
        removeBtn.className = 'action-button delete-btn';
        removeBtn.dataset.categoryId = category.category_id;
        removeBtn.addEventListener('click', async () => {
          await fetch(`/api/category-needs/${needId}/categories/${category.category_id}`, {
            method: 'DELETE'
          });
          showCategoryModal(needId); // Refresh modal
        });
        li.appendChild(removeBtn);
        ul.appendChild(li);
      });
      categoriesList.appendChild(ul);
    }
    
    // Populate dropdown with unassigned categories
    addCategorySelect.innerHTML = '<option value="">Select a category</option>';
    allCategories
      .filter(category => !assignedCategoryIds.includes(category.category_id))
      .forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        addCategorySelect.appendChild(option);
      });
    
    // Handle add category button
    addCategoryBtn.onclick = async () => {
      const categoryId = addCategorySelect.value;
      if (!categoryId) return;
      
      await fetch('/api/category-needs/assign-need', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need_id: needId, category_id: categoryId })
      });
      
      showCategoryModal(needId); // Refresh modal
    };
    
    // Show modal
    modal.style.display = 'block';
  };

  // Delegate events for edit and delete buttons in the need table
  needTableBody.addEventListener('click', async (e) => {
    // Use closest to handle clicks on the icon or the button
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      try {
        const response = await fetch(`/api/needs/${id}`);
        const need = await response.json();
        if (need) {
          document.getElementById('need_id').value = need.need_id;
          document.getElementById('need_name').value = need.name;
          document.getElementById('category_id').value = need.category_id || '';
          document.getElementById('need_short_desc').value = need.short_description || '';
          document.getElementById('need_long_desc').value = need.description || '';
          
          // Scroll to the form section
          document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error fetching need for editing:', error);
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this need?')) {
        try {
          const response = await fetch(`/api/needs/${id}`, { method: 'DELETE' });
          if (response.ok) {
            loadNeeds();
          } else {
            alert('Error deleting need. It may be in use by categories or pupils.');
          }
        } catch (error) {
          console.error('Error deleting need:', error);
          alert('Error deleting need: ' + error.message);
        }
      }
    }
    
    if (e.target.classList.contains('categoriesBtn')) {
      const id = e.target.getAttribute('data-id');
      showCategoryModal(id);
    }
  });
}); 
