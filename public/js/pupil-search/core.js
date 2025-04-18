/**
 * Core functionality for the Pupil Search & Profile
 */
const PupilSearchCore = (function() {
  // DOM Elements
  let pupilSearchInput;
  let searchBtn;
  let printBtn;
  let editToggleBtn;
  let saveChangesBtn;
  let cancelEditBtn;
  let profileContent;
  let addCategoryBtn;
  let addOverrideBtn;
  let addDeviceBtn;
  
  // State variables
  let currentPupilData = null;
  let isEditMode = false;
  let changedFields = {};
  
  /**
   * Initialize the module
   */
  function initialize() {
    // Cache DOM elements
    pupilSearchInput = document.getElementById('pupil-search');
    searchBtn = document.getElementById('search-btn');
    printBtn = document.getElementById('print-btn');
    editToggleBtn = document.getElementById('edit-toggle');
    saveChangesBtn = document.getElementById('save-changes');
    cancelEditBtn = document.getElementById('cancel-edit');
    profileContent = document.getElementById('profile-content');
    addCategoryBtn = document.getElementById('add-category-btn');
    addOverrideBtn = document.getElementById('add-override-btn');
    addDeviceBtn = document.getElementById('add-device-btn');
    
    // Ensure edit controls are hidden initially
    const editControls = document.querySelector('.edit-controls');
    if (editControls) {
      editControls.style.display = 'none';
    }
    
    // Hide add buttons initially
    if (addCategoryBtn) addCategoryBtn.style.display = 'none';
    if (addOverrideBtn) addOverrideBtn.style.display = 'none';
    if (addDeviceBtn) addDeviceBtn.style.display = 'none';
    
    // Initialize modules
    PupilSearchUI.initialize();
    
    // Set up event listeners
    setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    searchBtn.addEventListener('click', function() {
      const searchValue = pupilSearchInput.value.trim();
      if (searchValue) {
        PupilProfile.loadPupilProfile(searchValue);
      }
    });
    
    if (printBtn) {
      printBtn.addEventListener('click', handlePrint);
    }
    
    if (editToggleBtn) {
      editToggleBtn.addEventListener('change', function() {
        PupilSearchUI.toggleEditMode(this.checked);
      });
    }
    
    if (saveChangesBtn) {
      saveChangesBtn.addEventListener('click', function() {
        PupilSearchUI.saveChanges();
      });
    }
    
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', function() {
        PupilSearchUI.cancelEdit();
      });
    }
    
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', CategoryManager.addCategory);
    }
    
    if (addOverrideBtn) {
      addOverrideBtn.addEventListener('click', OverrideManager.addOverride);
    }
    
    if (addDeviceBtn) {
      addDeviceBtn.addEventListener('click', DeviceManager.addDevice);
    }
  }
  
  /**
   * Handle print button click
   */
  function handlePrint() {
    // Set print options to remove headers and footers
    const style = document.createElement('style');
    style.innerHTML = `
      @page {
        margin: 0.5cm;
        margin-top: 0;
        margin-bottom: 0;
        marks: none;
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Remove the style element after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  }
  
  // Public API
  return {
    initialize,
    get pupilSearchInput() { return pupilSearchInput; },
    get searchBtn() { return searchBtn; },
    get profileContent() { return profileContent; },
    get currentPupilData() { return currentPupilData; },
    set currentPupilData(data) { currentPupilData = data; },
    get isEditMode() { return isEditMode; },
    set isEditMode(mode) { isEditMode = mode; },
    get changedFields() { return changedFields; },
    set changedFields(fields) { changedFields = fields; }
  };
})(); 