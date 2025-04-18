/**
 * Pupil Search & Profile functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const pupilSearchInput = document.getElementById('pupil-search');
  const searchBtn = document.getElementById('search-btn');
  const printBtn = document.getElementById('print-btn');
  const profileContent = document.getElementById('profile-content');
  
  // Initialize search autocomplete
  initializeAutocomplete();
  
  // Set up event listeners
  searchBtn.addEventListener('click', function() {
    const searchValue = pupilSearchInput.value.trim();
    if (searchValue) {
      loadPupilProfile(searchValue);
    }
  });
  
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }
  
  /**
   * Initialize the autocomplete search functionality
   */
  function initializeAutocomplete() {
    $(pupilSearchInput).autocomplete({
      source: function(request, response) {
        // Make API call to get pupil suggestions
        fetch(`/api/pupils/search?term=${encodeURIComponent(request.term)}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data)) {
              // Format data for autocomplete
              const suggestions = data.map(pupil => ({
                label: `${pupil.first_name} ${pupil.last_name}`,
                value: pupil.first_name + ' ' + pupil.last_name,
                id: pupil.pupil_id
              }));
              response(suggestions);
            } else {
              response([]);
            }
          })
          .catch(error => {
            console.error('Error fetching pupil suggestions:', error);
            response([]);
          });
      },
      minLength: 2,
      select: function(event, ui) {
        // When a pupil is selected, load their profile
        if (ui.item) {
          loadPupilProfile(ui.item.id);
        }
        return true;
      }
    });
  }
  
  /**
   * Load the pupil profile data and display it
   * @param {string|number} pupilIdentifier - Pupil ID or name to search for
   */
  function loadPupilProfile(pupilIdentifier) {
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-spinner';
    loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading profile...';
    
    // Clear previous content from tables but don't destroy the structure
    resetDisplayContainers();
    
    // Show the profile container with loading indicator
    profileContent.style.display = 'block';
    
    // Find a good place to show the loading indicator
    const header = document.getElementById('pupil-header');
    if (header) {
      header.innerHTML = '';
      header.appendChild(loadingEl);
    }
    
    // Determine if we're searching by ID or name
    const searchParam = !isNaN(pupilIdentifier) ? 
      `pupil_id=${pupilIdentifier}` : 
      `name=${encodeURIComponent(pupilIdentifier)}`;
    
    // Fetch comprehensive pupil data
    fetch(`/api/pupils/profile?${searchParam}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch pupil profile');
        }
        return res.json();
      })
      .then(data => {
        displayPupilProfile(data);
      })
      .catch(error => {
        console.error('Error loading pupil profile:', error);
        // Show error in header rather than replacing entire content
        if (header) {
          header.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Error loading pupil profile. Please try again.</p>
              <p class="error-details">${error.message}</p>
            </div>
          `;
        }
      });
  }
  
  /**
   * Display the pupil profile data in the UI
   * @param {Object} pupilData - The pupil data to display
   */
  function displayPupilProfile(pupilData) {
    if (!pupilData) {
      const header = document.getElementById('pupil-header');
      if (header) {
        header.innerHTML = `
          <div class="error-message">
            <i class="fas fa-user-slash"></i>
            <p>No pupil found with that name or ID.</p>
          </div>
        `;
      }
      return;
    }
    
    // Show profile content
    profileContent.style.display = 'block';
    
    // Restore header structure
    document.getElementById('pupil-header').innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="profile-basic-info">
          <h2 id="pupil-full-name"></h2>
          <div class="profile-meta">
            <span id="pupil-form-badge" class="badge"></span>
            <span id="pupil-id-badge" class="badge subtle"></span>
          </div>
        </div>
      </div>
    `;
    
    // Update timestamp
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
      const now = new Date();
      timestampEl.textContent = now.toLocaleString();
    }
    
    // Populate basic pupil information
    document.getElementById('pupil-full-name').textContent = `${pupilData.first_name} ${pupilData.last_name}`;
    document.getElementById('pupil-first-name').textContent = pupilData.first_name;
    document.getElementById('pupil-last-name').textContent = pupilData.last_name;
    document.getElementById('pupil-id-badge').textContent = `ID: ${pupilData.pupil_id}`;
    
    // Form information
    if (pupilData.form) {
      document.getElementById('pupil-form-badge').textContent = `Form ${pupilData.form.form_name}`;
      document.getElementById('pupil-form-name').textContent = pupilData.form.form_name;
      document.getElementById('pupil-year').textContent = pupilData.form.form_year;
    } else {
      document.getElementById('pupil-form-badge').textContent = 'No Form';
      document.getElementById('pupil-form-name').textContent = 'Not assigned';
      document.getElementById('pupil-year').textContent = 'N/A';
    }
    
    // Notes
    document.getElementById('pupil-notes').textContent = pupilData.notes || 'No notes available';
    
    // Display categories, needs, overrides, and devices
    displayCategories(pupilData.categories || []);
    displayNeeds(pupilData.effective_needs || []);
    displayOverrides(pupilData.need_overrides || []);
    displayDevices(pupilData.devices || []);
  }
  
  /**
   * Reset all display containers to prepare for new data
   */
  function resetDisplayContainers() {
    // Reset categories container
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
      const categoryTags = categoriesContainer.querySelectorAll('.category-tag');
      categoryTags.forEach(tag => tag.remove());
      const noCategories = document.getElementById('no-categories-message');
      if (noCategories) noCategories.style.display = 'none';
    }
    
    // Reset needs table
    const needsTable = document.getElementById('needs-table');
    if (needsTable) {
      const tbody = needsTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noNeeds = document.getElementById('no-needs-message');
      if (noNeeds) noNeeds.style.display = 'none';
      const needsContainer = document.querySelector('#needs-container .table-container');
      if (needsContainer) needsContainer.style.display = 'block';
    }
    
    // Reset overrides table
    const overridesTable = document.getElementById('overrides-table');
    if (overridesTable) {
      const tbody = overridesTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noOverrides = document.getElementById('no-overrides-message');
      if (noOverrides) noOverrides.style.display = 'none';
      const overridesContainer = document.querySelector('#overrides-container .table-container');
      if (overridesContainer) overridesContainer.style.display = 'block';
    }
    
    // Reset devices table
    const devicesTable = document.getElementById('devices-table');
    if (devicesTable) {
      const tbody = devicesTable.querySelector('tbody');
      if (tbody) tbody.innerHTML = '';
      const noDevices = document.getElementById('no-devices-message');
      if (noDevices) noDevices.style.display = 'none';
      const devicesContainer = document.querySelector('#devices-container .table-container');
      if (devicesContainer) devicesContainer.style.display = 'block';
    }
  }
  
  /**
   * Display the pupil's assigned categories
   * @param {Array} categories - The categories to display
   */
  function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    const noDataMessage = document.getElementById('no-categories-message');
    
    if (!categoriesContainer || !noDataMessage) return;
    
    if (!categories.length) {
      noDataMessage.style.display = 'block';
      return;
    }
    
    noDataMessage.style.display = 'none';
    
    // Create category tags
    categories.forEach(category => {
      const categoryTag = document.createElement('div');
      categoryTag.className = 'category-tag';
      categoryTag.innerHTML = `<i class="fas fa-tag"></i> ${category.category_name}`;
      categoriesContainer.appendChild(categoryTag);
    });
  }
  
  /**
   * Display the pupil's effective needs
   * @param {Array} needs - The needs to display
   */
  function displayNeeds(needs) {
    const needsTable = document.getElementById('needs-table');
    if (!needsTable) return;
    
    const needsTableBody = needsTable.querySelector('tbody');
    const noDataMessage = document.getElementById('no-needs-message');
    const tableContainer = document.querySelector('#needs-container .table-container');
    
    if (!needsTableBody || !noDataMessage || !tableContainer) return;
    
    if (!needs.length) {
      noDataMessage.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }
    
    noDataMessage.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Create need rows
    needs.forEach(need => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.textContent = need.name;
      
      const sourceCell = document.createElement('td');
      sourceCell.textContent = need.sources || 'Unknown';
      
      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = need.short_description || need.description || 'No description';
      
      row.appendChild(nameCell);
      row.appendChild(sourceCell);
      row.appendChild(descriptionCell);
      
      needsTableBody.appendChild(row);
    });
  }
  
  /**
   * Display the pupil's need overrides
   * @param {Array} overrides - The overrides to display
   */
  function displayOverrides(overrides) {
    const overridesTable = document.getElementById('overrides-table');
    if (!overridesTable) return;
    
    const overridesTableBody = overridesTable.querySelector('tbody');
    const noDataMessage = document.getElementById('no-overrides-message');
    const tableContainer = document.querySelector('#overrides-container .table-container');
    
    if (!overridesTableBody || !noDataMessage || !tableContainer) return;
    
    if (!overrides.length) {
      noDataMessage.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }
    
    noDataMessage.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Create override rows
    overrides.forEach(override => {
      const row = document.createElement('tr');
      
      const needCell = document.createElement('td');
      needCell.textContent = override.need_name;
      
      const typeCell = document.createElement('td');
      typeCell.textContent = override.is_added ? 'Added' : 'Removed';
      typeCell.className = override.is_added ? 'override-added' : 'override-removed';
      
      const notesCell = document.createElement('td');
      notesCell.textContent = override.notes || 'No notes';
      
      row.appendChild(needCell);
      row.appendChild(typeCell);
      row.appendChild(notesCell);
      
      overridesTableBody.appendChild(row);
    });
  }
  
  /**
   * Display the pupil's assigned devices
   * @param {Array} devices - The devices to display
   */
  function displayDevices(devices) {
    const devicesTable = document.getElementById('devices-table');
    if (!devicesTable) return;
    
    const devicesTableBody = devicesTable.querySelector('tbody');
    const noDataMessage = document.getElementById('no-devices-message');
    const tableContainer = document.querySelector('#devices-container .table-container');
    
    if (!devicesTableBody || !noDataMessage || !tableContainer) return;
    
    if (!devices.length) {
      noDataMessage.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }
    
    noDataMessage.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Create device rows
    devices.forEach(device => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.textContent = device.device_name;
      
      const needCell = document.createElement('td');
      needCell.textContent = device.need_name || 'N/A';
      
      const modelCell = document.createElement('td');
      modelCell.textContent = device.model || 'N/A';
      
      const serialCell = document.createElement('td');
      serialCell.textContent = device.serial_number || 'N/A';
      
      const dateCell = document.createElement('td');
      dateCell.textContent = device.assignment_date ? 
        new Date(device.assignment_date).toLocaleDateString() : 'N/A';
      
      const notesCell = document.createElement('td');
      notesCell.textContent = device.notes || 'No notes';
      
      row.appendChild(nameCell);
      row.appendChild(needCell);
      row.appendChild(modelCell);
      row.appendChild(serialCell);
      row.appendChild(dateCell);
      row.appendChild(notesCell);
      
      devicesTableBody.appendChild(row);
    });
  }
}); 