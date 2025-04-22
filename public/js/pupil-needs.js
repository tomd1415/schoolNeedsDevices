document.addEventListener('DOMContentLoaded', () => {
  const pupilSelect = document.getElementById('pupil_id');
  const pupilInfoSection = document.getElementById('pupil-info');
  const assignCategorySection = document.getElementById('assign-category-section');
  const needsOverviewSection = document.getElementById('needs-overview-section');
  
  const pupilNameSpan = document.getElementById('pupil-name');
  const pupilFormSpan = document.getElementById('pupil-form');
  const pupilNotesSpan = document.getElementById('pupil-notes');
  
  const assignCategoryForm = document.getElementById('assignCategoryForm');
  const categorySelect = document.getElementById('category_id');
  const categoriesList = document.getElementById('categories-list');
  
  const effectiveNeedsTable = document.getElementById('effectiveNeedsTable').querySelector('tbody');
  const overridesTable = document.getElementById('overridesTable').querySelector('tbody');
  
  const addNeedForm = document.getElementById('addNeedForm');
  const removeNeedForm = document.getElementById('removeNeedForm');
  const addNeedSelect = document.getElementById('add_need_id');
  const removeNeedSelect = document.getElementById('remove_need_id');
  
  // Tab switching functionality
  document.querySelectorAll('.tabs .tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and hide all content
      const tabsContainer = button.closest('.tabs');
      tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      
      // Find the parent section
      const sectionContainer = tabsContainer.closest('section');
      sectionContainer.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
      
      // Add active class to clicked button and show related content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).style.display = 'block';
    });
  });
  
  let selectedPupil = null;
  let allCategories = [];
  let allNeeds = [];
  let effectiveNeeds = [];
  
  // ======= Data Loading Functions =======
  
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
  
  // Load all categories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      allCategories = await response.json();
      
      // Populate category dropdown
      categorySelect.innerHTML = '<option value="">Select a category</option>';
      allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  
  // Load all needs
  const loadNeeds = async () => {
    try {
      const response = await fetch('/api/needs');
      allNeeds = await response.json();
    } catch (error) {
      console.error('Error loading needs:', error);
    }
  };
  
  // Get categories assigned to a pupil
  const loadPupilCategories = async (pupilId) => {
    try {
      const response = await fetch(`/api/pupil-categories/${pupilId}/categories`);
      const categories = await response.json();
      
      // Display assigned categories
      if (categories.length === 0) {
        categoriesList.innerHTML = '<p>No categories assigned yet.</p>';
      } else {
        let html = '<ul class="categories">';
        categories.forEach(category => {
          html += `
            <li>
              <span>${category.category_name}</span>
              <button class="btn-danger remove-cat-btn" data-id="${category.category_id}">
                <i class="fas fa-times"></i> Remove
              </button>
            </li>
          `;
        });
        html += '</ul>';
        categoriesList.innerHTML = html;
        
        // Add event listeners to remove buttons
        categoriesList.querySelectorAll('.remove-cat-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const categoryId = btn.getAttribute('data-id');
            await removeCategoryFromPupil(pupilId, categoryId);
            await loadPupilCategories(pupilId);
            await loadEffectiveNeeds(pupilId);
            await loadNeedOverrides(pupilId);
            updateNeedDropdowns();
          });
        });
      }
      
      // Update category dropdown to exclude already assigned categories
      updateCategoryDropdown(categories);
      
    } catch (error) {
      console.error('Error loading pupil categories:', error);
    }
  };
  
  // Get effective needs for a pupil (from categories + overrides)
  const loadEffectiveNeeds = async (pupilId) => {
    try {
      console.log(`Loading effective needs for pupil ${pupilId}`);
      const response = await fetch(`/api/pupil-categories/${pupilId}/effective-needs`);
      effectiveNeeds = await response.json();
      console.log('Received effective needs:', effectiveNeeds);
      
      // Display effective needs
      effectiveNeedsTable.innerHTML = '';
      
      if (!effectiveNeeds || effectiveNeeds.length === 0) {
        console.log('No effective needs found');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4">No needs assigned yet. Assign a category first or add an individual need.</td>';
        effectiveNeedsTable.appendChild(tr);
      } else {
        effectiveNeeds.forEach(need => {
          console.log('Processing need:', need);
          // Determine source (category or override)
          let source = 'Individual assignment';
          
          // If the need has a categories field (from a category)
          if (need.categories) {
            source = `From category: ${need.categories}`;
          }
          
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${need.name || 'Unknown'}</td>
            <td>${need.category_name || 'N/A'}</td>
            <td>${source}</td>
            <td>${need.description || need.short_description || ''}</td>
          `;
          effectiveNeedsTable.appendChild(tr);
        });
      }
    } catch (error) {
      console.error('Error loading effective needs:', error);
      effectiveNeedsTable.innerHTML = '<tr><td colspan="4">Error loading needs. Check console for details.</td></tr>';
    }
  };
  
  // Get need overrides for a pupil
  const loadNeedOverrides = async (pupilId) => {
    try {
      const response = await fetch(`/api/pupil-categories/${pupilId}/need-overrides`);
      const overrides = await response.json();
      
      // Display overrides
      overridesTable.innerHTML = '';
      
      if (overrides.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4">No overrides set</td>';
        overridesTable.appendChild(tr);
      } else {
        overrides.forEach(override => {
          // Find the need name
          const need = allNeeds.find(n => n.need_id === override.need_id);
          const needName = need ? need.name : `Need #${override.need_id}`;
          
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${needName}</td>
            <td>${override.is_added ? 'Added' : 'Removed'}</td>
            <td>${override.notes || ''}</td>
            <td>
              <button class="btn-danger deleteBtn" data-id="${override.override_id}">
                <i class="fas fa-times"></i> Remove Override
              </button>
            </td>
          `;
          overridesTable.appendChild(tr);
        });
        
        // Add event listeners to delete buttons
        overridesTable.querySelectorAll('.deleteBtn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const overrideId = btn.getAttribute('data-id');
            await removeNeedOverride(overrideId);
            await loadNeedOverrides(pupilId);
            await loadEffectiveNeeds(pupilId);
            updateNeedDropdowns();
          });
        });
      }
    } catch (error) {
      console.error('Error loading need overrides:', error);
    }
  };
  
  // Load pupil details
  const loadPupilDetails = async (pupilId) => {
    try {
      const response = await fetch(`/api/pupils`);
      const pupils = await response.json();
      selectedPupil = pupils.find(p => p.pupil_id == pupilId);
      
      if (selectedPupil) {
        pupilNameSpan.textContent = `${selectedPupil.first_name} ${selectedPupil.last_name}`;
        pupilFormSpan.textContent = selectedPupil.form_id || 'Not assigned';
        pupilNotesSpan.textContent = selectedPupil.notes || 'None';
        
        // Show the pupil info and other sections
        pupilInfoSection.style.display = 'block';
        assignCategorySection.style.display = 'block';
        needsOverviewSection.style.display = 'block';
        
        // Load pupil-specific data
        await loadPupilCategories(pupilId);
        await loadEffectiveNeeds(pupilId);
        await loadNeedOverrides(pupilId);
        
        // Update the need dropdowns
        updateNeedDropdowns();
      }
    } catch (error) {
      console.error('Error loading pupil details:', error);
    }
  };
  
  // ======= Helper Functions =======
  
  // Update category dropdown to exclude already assigned categories
  const updateCategoryDropdown = (assignedCategories) => {
    const assignedCategoryIds = assignedCategories.map(c => c.category_id);
    
    // Reset dropdown
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    
    // Add only unassigned categories
    allCategories
      .filter(category => !assignedCategoryIds.includes(category.category_id))
      .forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });
  };
  
  // Update need dropdowns for adding/removing needs
  const updateNeedDropdowns = () => {
    // Reset dropdowns
    addNeedSelect.innerHTML = '<option value="">Select a need</option>';
    removeNeedSelect.innerHTML = '<option value="">Select a need</option>';
    
    console.log('Updating need dropdowns');
    console.log('All needs:', allNeeds);
    console.log('Effective needs:', effectiveNeeds);
    
    // If we have no effective needs yet, we should still populate the add dropdown with all needs
    // but we can't populate the remove dropdown (since there's nothing to remove)
    if (!effectiveNeeds.length) {
      console.log('No effective needs, populating add dropdown with all needs');
      // For add dropdown, show all available needs
      allNeeds.forEach(need => {
        const option = document.createElement('option');
        option.value = need.need_id;
        option.textContent = need.name;
        addNeedSelect.appendChild(option);
      });
      return;
    }
    
    // Get IDs of needs already assigned through any means
    const effectiveNeedIds = effectiveNeeds.map(n => n.need_id);
    console.log('Effective need IDs:', effectiveNeedIds);
    
    // For add dropdown, show needs not already assigned
    allNeeds
      .filter(need => !effectiveNeedIds.includes(need.need_id))
      .forEach(need => {
        const option = document.createElement('option');
        option.value = need.need_id;
        option.textContent = need.name;
        addNeedSelect.appendChild(option);
      });
    
    // For remove dropdown, show only needs that came from categories
    // (these are the only ones that can be removed via overrides)
    effectiveNeeds
      .filter(need => need.categories && need.categories.length > 0)
      .forEach(need => {
        const option = document.createElement('option');
        option.value = need.need_id;
        option.textContent = need.name;
        removeNeedSelect.appendChild(option);
      });
  };
  
  // ======= API Functions =======
  
  // Assign category to pupil
  const assignCategoryToPupil = async (pupilId, categoryId) => {
    try {
      const response = await fetch('/api/pupil-categories/assign-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupil_id: pupilId, category_id: categoryId })
      });
      
      if (!response.ok) throw new Error('Failed to assign category');
      
      return true;
    } catch (error) {
      console.error('Error assigning category:', error);
      return false;
    }
  };
  
  // Remove category from pupil
  const removeCategoryFromPupil = async (pupilId, categoryId) => {
    try {
      const response = await fetch(`/api/pupil-categories/${pupilId}/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove category');
      
      return true;
    } catch (error) {
      console.error('Error removing category:', error);
      return false;
    }
  };
  
  // Add need override
  const addNeedOverride = async (pupilId, needId, isAdded, notes) => {
    try {
      const response = await fetch('/api/pupil-categories/need-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupil_id: pupilId, need_id: needId, is_added: isAdded, notes })
      });
      
      if (!response.ok) throw new Error('Failed to add need override');
      
      return true;
    } catch (error) {
      console.error('Error adding need override:', error);
      return false;
    }
  };
  
  // Remove need override
  const removeNeedOverride = async (overrideId) => {
    try {
      const response = await fetch(`/api/pupil-categories/need-override/${overrideId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove need override');
      
      return true;
    } catch (error) {
      console.error('Error removing need override:', error);
      return false;
    }
  };
  
  // ======= Event Listeners =======
  
  // Pupil selection change
  pupilSelect.addEventListener('change', () => {
    const pupilId = pupilSelect.value;
    if (pupilId) {
      loadPupilDetails(pupilId);
    } else {
      // Hide sections if no pupil is selected
      pupilInfoSection.style.display = 'none';
      assignCategorySection.style.display = 'none';
      needsOverviewSection.style.display = 'none';
    }
  });
  
  // Assign category form submission
  assignCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedPupil) {
      alert('Please select a pupil first');
      return;
    }
    
    const categoryId = categorySelect.value;
    
    if (!categoryId) {
      alert('Please select a category');
      return;
    }
    
    const success = await assignCategoryToPupil(selectedPupil.pupil_id, categoryId);
    
    if (success) {
      await loadPupilCategories(selectedPupil.pupil_id);
      await loadEffectiveNeeds(selectedPupil.pupil_id);
      updateNeedDropdowns();
      assignCategoryForm.reset();
    }
  });
  
  // Add need form submission
  addNeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedPupil) {
      alert('Please select a pupil first');
      return;
    }
    
    const needId = addNeedSelect.value;
    const notes = document.getElementById('add_notes').value;
    
    if (!needId) {
      alert('Please select a need');
      return;
    }
    
    const success = await addNeedOverride(selectedPupil.pupil_id, needId, true, notes);
    
    if (success) {
      await loadNeedOverrides(selectedPupil.pupil_id);
      await loadEffectiveNeeds(selectedPupil.pupil_id);
      updateNeedDropdowns();
      addNeedForm.reset();
    }
  });
  
  // Remove need form submission
  removeNeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedPupil) {
      alert('Please select a pupil first');
      return;
    }
    
    const needId = removeNeedSelect.value;
    const notes = document.getElementById('remove_notes').value;
    
    if (!needId) {
      alert('Please select a need');
      return;
    }
    
    const success = await addNeedOverride(selectedPupil.pupil_id, needId, false, notes);
    
    if (success) {
      await loadNeedOverrides(selectedPupil.pupil_id);
      await loadEffectiveNeeds(selectedPupil.pupil_id);
      updateNeedDropdowns();
      removeNeedForm.reset();
    }
  });
  
  // Initialize page
  loadPupils();
  loadCategories();
  loadNeeds();
}); 