/**
 * Category Manager Module
 * Handles displaying and managing pupil categories
 */
const CategoryManager = (function() {
  
  /**
   * Displays categories assigned to a pupil
   * 
   * @param {Array} categories - Array of category objects
   */
  function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    categoriesContainer.innerHTML = '';
    
    if (!categories || categories.length === 0) {
      const noCategories = document.createElement('p');
      noCategories.className = 'no-data';
      noCategories.textContent = 'No categories assigned';
      categoriesContainer.appendChild(noCategories);
      return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'data-table categories-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const categoryHeader = document.createElement('th');
    categoryHeader.textContent = 'Category';
    
    const actionHeader = document.createElement('th');
    actionHeader.className = 'action-column';
    actionHeader.textContent = 'Action';
    
    headerRow.appendChild(categoryHeader);
    headerRow.appendChild(actionHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    categories.forEach(category => {
      const row = document.createElement('tr');
      
      const categoryCell = document.createElement('td');
      categoryCell.textContent = category.category_name;
      row.appendChild(categoryCell);
      
      const actionCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      removeButton.title = 'Remove category';
      removeButton.addEventListener('click', () => removeCategoryFromPupil(category));
      actionCell.appendChild(removeButton);
      row.appendChild(actionCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    categoriesContainer.appendChild(table);
    
    // Update edit mode buttons visibility
    const editModeButtons = categoriesContainer.querySelectorAll('.remove-button');
    editModeButtons.forEach(button => {
      button.style.display = PupilSearchCore.isEditMode ? 'inline-block' : 'none';
    });
  }
  
  /**
   * Removes a category from a pupil
   * 
   * @param {Object} category - The category to remove
   */
  function removeCategoryFromPupil(category) {
    if (!PupilSearchCore.currentPupilData) {
      ModalUtils.createAlertDialog('No pupil selected', 'Error');
      return;
    }
    
    const pupilId = PupilSearchCore.currentPupilData.pupil_id;
    
    ModalUtils.createConfirmDialog(
      `Are you sure you want to remove the category "${category.category_name}" from this pupil?`,
      () => {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing category...';
        document.getElementById('categories-container').prepend(loadingIndicator);
        
        // Make API request to remove the category
        fetch(`/api/pupil-categories/${pupilId}/categories/${category.category_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to remove category');
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
          console.error('Error removing category:', error);
          ModalUtils.createAlertDialog('Failed to remove category: ' + error.message, 'Error');
        })
        .finally(() => {
          // Remove loading indicator
          loadingIndicator.remove();
        });
      }
    );
  }
  
  /**
   * Adds a category to a pupil
   */
  function addCategory() {
    if (!PupilSearchCore.currentPupilData) {
      ModalUtils.createAlertDialog('No pupil selected', 'Error');
      return;
    }
    
    const pupilId = PupilSearchCore.currentPupilData.pupil_id;
    
    // Fetch available categories
    fetch('/api/categories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      })
      .then(categories => {
        // Get current pupil's assigned categories
        const currentCategories = PupilSearchCore.currentPupilData.categories || [];
        const currentCategoryIds = currentCategories.map(cat => cat.category_id);
        
        // Filter out already assigned categories
        const availableCategories = categories.filter(category => 
          !currentCategoryIds.includes(category.category_id)
        );
        
        if (availableCategories.length === 0) {
          ModalUtils.createAlertDialog('No more categories available to assign', 'Information');
          return;
        }
        
        // Create and show dialog
        const fields = [
          {
            type: 'select',
            id: 'category-select',
            label: 'Select Category',
            options: [
              { value: '', text: '-- Select a category --', disabled: true, selected: true },
              ...availableCategories.map(category => ({
                value: category.category_id,
                text: category.category_name
              }))
            ]
          }
        ];
        
        const buttons = {
          "Add Category": function() {
            const form = this.form;
            const categoryId = form.querySelector('#category-select').value;
            
            if (!categoryId) {
              ModalUtils.createAlertDialog('Please select a category', 'Error');
              return;
            }
            
            // Double-check category isn't already assigned (defensive validation)
            if (currentCategoryIds.includes(Number(categoryId))) {
              ModalUtils.createAlertDialog('This category is already assigned to the pupil', 'Error');
              $(this).dialog('close');
              return;
            }
            
            // Make API request to add the category
            fetch(`/api/pupil-categories/assign-category`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                pupil_id: pupilId,
                category_id: categoryId 
              })
            })
            .then(response => {
              if (!response.ok) {
                return response.text().then(text => {
                  console.error('Raw error response:', text);
                  try {
                    const jsonError = JSON.parse(text);
                    throw new Error(jsonError.message || 'Failed to add category');
                  } catch (e) {
                    throw new Error('Failed to add category: ' + text);
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
              console.error('Error adding category:', error);
              ModalUtils.createAlertDialog('Failed to add category: ' + error.message, 'Error');
            });
          },
          "Cancel": function() {
            $(this).dialog('close');
          }
        };
        
        ModalUtils.createFormDialog('Add Category', fields, buttons);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        ModalUtils.createAlertDialog('Failed to fetch categories: ' + error.message, 'Error');
      });
  }
  
  // Public API
  return {
    displayCategories,
    removeCategoryFromPupil,
    addCategory
  };
})(); 