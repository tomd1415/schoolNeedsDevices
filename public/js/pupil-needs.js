document.addEventListener('DOMContentLoaded', () => {
  const pupilSelect = document.getElementById('pupil_id');
  const needSelect = document.getElementById('need_id');
  const assignNeedForm = document.getElementById('assignNeedForm');
  const assignedNeedsTableBody = document.querySelector('#assignedNeedsTable tbody');
  
  const pupilInfoSection = document.getElementById('pupil-info');
  const assignNeedSection = document.getElementById('assign-need-section');
  const assignedNeedsSection = document.getElementById('assigned-needs-section');
  
  const pupilNameSpan = document.getElementById('pupil-name');
  const pupilFormSpan = document.getElementById('pupil-form');
  const pupilNotesSpan = document.getElementById('pupil-notes');
  
  let selectedPupil = null;
  let availableNeeds = [];
  let assignedNeeds = [];

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

  // Load needs for the dropdown
  const loadNeeds = async () => {
    try {
      const response = await fetch('/api/needs');
      availableNeeds = await response.json();
      updateNeedDropdown();
    } catch (error) {
      console.error('Error loading needs:', error);
    }
  };

  // Update the need dropdown to only show unassigned needs
  const updateNeedDropdown = () => {
    const assignedNeedIds = assignedNeeds.map(an => an.need_id);
    const unassignedNeeds = availableNeeds.filter(need => !assignedNeedIds.includes(need.need_id));
    
    needSelect.innerHTML = '<option value="">Select a need</option>';
    unassignedNeeds.forEach(need => {
      const option = document.createElement('option');
      option.value = need.need_id;
      option.textContent = need.name;
      needSelect.appendChild(option);
    });
  };

  // Load assigned needs for a pupil
  const loadAssignedNeeds = async (pupilId) => {
    try {
      const response = await fetch(`/api/needs/pupil/${pupilId}`);
      assignedNeeds = await response.json();
      
      assignedNeedsTableBody.innerHTML = '';
      if (assignedNeeds.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4">No needs assigned yet</td>';
        assignedNeedsTableBody.appendChild(tr);
      } else {
        assignedNeeds.forEach(need => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${need.name}</td>
            <td>${need.category_name || 'Uncategorized'}</td>
            <td>${need.notes || ''}</td>
            <td>
              <button class="deleteBtn" data-needid="${need.need_id}">Remove</button>
            </td>
          `;
          assignedNeedsTableBody.appendChild(tr);
        });
      }
      
      updateNeedDropdown();
    } catch (error) {
      console.error('Error loading assigned needs:', error);
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
        pupilFormSpan.textContent = selectedPupil.form_id; // This should ideally be form name
        pupilNotesSpan.textContent = selectedPupil.notes || 'None';
        
        // Show the pupil info, assign, and assigned needs sections
        pupilInfoSection.style.display = 'block';
        assignNeedSection.style.display = 'block';
        assignedNeedsSection.style.display = 'block';
        
        // Load the assigned needs for this pupil
        loadAssignedNeeds(pupilId);
      }
    } catch (error) {
      console.error('Error loading pupil details:', error);
    }
  };

  // Pupil selection change event
  pupilSelect.addEventListener('change', () => {
    const pupilId = pupilSelect.value;
    if (pupilId) {
      loadPupilDetails(pupilId);
    } else {
      // Hide sections if no pupil is selected
      pupilInfoSection.style.display = 'none';
      assignNeedSection.style.display = 'none';
      assignedNeedsSection.style.display = 'none';
    }
  });

  // Handle assign need form submission
  assignNeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedPupil) {
      alert('Please select a pupil first');
      return;
    }
    
    const needId = needSelect.value;
    const notes = document.getElementById('notes').value;
    
    if (!needId) {
      alert('Please select a need to assign');
      return;
    }
    
    const assignData = {
      pupil_id: selectedPupil.pupil_id,
      need_id: needId,
      notes
    };
    
    try {
      const response = await fetch('/api/needs/pupil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData)
      });
      
      if (!response.ok) throw new Error('Failed to assign need');
      
      // Reload the assigned needs
      loadAssignedNeeds(selectedPupil.pupil_id);
      
      // Reset the form
      assignNeedForm.reset();
    } catch (error) {
      console.error('Error assigning need:', error);
    }
  });

  // Handle removing assigned needs
  assignedNeedsTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('deleteBtn')) {
      const needId = e.target.getAttribute('data-needid');
      if (confirm('Are you sure you want to remove this need assignment?')) {
        try {
          const response = await fetch(`/api/needs/pupil/${selectedPupil.pupil_id}/need/${needId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to remove need assignment');
          
          // Reload the assigned needs
          loadAssignedNeeds(selectedPupil.pupil_id);
        } catch (error) {
          console.error('Error removing need assignment:', error);
        }
      }
    }
  });

  // Initialize the page
  loadPupils();
  loadNeeds();
}); 