/**
 * Modal Utilities Module
 * Provides helper functions for creating and managing dialogs and modals
 */
const ModalUtils = (function() {
  
  /**
   * Creates a form dialog with specified fields
   * 
   * @param {string} title - Dialog title
   * @param {Array} fields - Array of field objects defining the form
   * @param {Object} buttons - Button definitions for the dialog
   * @param {Object} options - Additional dialog options
   * @returns {HTMLElement} - The created dialog element
   */
  function createFormDialog(title, fields, buttons, options = {}) {
    // Create dialog container
    const dialogId = 'modal-form-' + Math.random().toString(36).substring(2, 11);
    const dialog = document.createElement('div');
    dialog.id = dialogId;
    dialog.className = 'modal-dialog';
    dialog.title = title;
    
    // Create form element
    const form = document.createElement('form');
    form.className = 'modal-form';
    dialog.form = form;
    dialog.appendChild(form);
    
    // Create fields
    fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'form-group';
      
      // Create label if specified
      if (field.label) {
        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;
        fieldContainer.appendChild(label);
      }
      
      let inputElement;
      
      // Create input based on type
      switch (field.type) {
        case 'select':
          inputElement = document.createElement('select');
          inputElement.id = field.id;
          inputElement.name = field.id;
          
          // Add options
          if (field.options && Array.isArray(field.options)) {
            field.options.forEach(option => {
              const optionEl = document.createElement('option');
              optionEl.value = option.value;
              optionEl.textContent = option.text;
              
              if (option.disabled) {
                optionEl.disabled = true;
              }
              
              if (option.selected) {
                optionEl.selected = true;
              }
              
              inputElement.appendChild(optionEl);
            });
          }
          break;
          
        case 'textarea':
          inputElement = document.createElement('textarea');
          inputElement.id = field.id;
          inputElement.name = field.id;
          inputElement.rows = field.rows || 4;
          break;
          
        case 'radio-group':
          inputElement = document.createElement('div');
          inputElement.className = 'radio-group';
          
          if (field.options && Array.isArray(field.options)) {
            field.options.forEach(option => {
              const radioContainer = document.createElement('div');
              radioContainer.className = 'radio-option';
              
              const radio = document.createElement('input');
              radio.type = 'radio';
              radio.id = `${field.id}-${option.value}`;
              radio.name = field.id;
              radio.value = option.value;
              
              if (option.checked) {
                radio.checked = true;
              }
              
              const radioLabel = document.createElement('label');
              radioLabel.htmlFor = `${field.id}-${option.value}`;
              radioLabel.textContent = option.text;
              
              radioContainer.appendChild(radio);
              radioContainer.appendChild(radioLabel);
              inputElement.appendChild(radioContainer);
            });
          }
          break;
          
        default: // Default to text input
          inputElement = document.createElement('input');
          inputElement.type = field.type || 'text';
          inputElement.id = field.id;
          inputElement.name = field.id;
      }
      
      // Add attributes if specified
      if (field.attributes && typeof field.attributes === 'object') {
        Object.entries(field.attributes).forEach(([key, value]) => {
          inputElement.setAttribute(key, value);
        });
      }
      
      // Add the input to the field container
      fieldContainer.appendChild(inputElement);
      
      // Add the field container to the form
      form.appendChild(fieldContainer);
    });
    
    // Add dialog to document body
    document.body.appendChild(dialog);
    
    // Initialize jQuery UI dialog
    $(dialog).dialog({
      autoOpen: true,
      modal: true,
      width: options.width || 400,
      minHeight: options.minHeight || 200,
      buttons: buttons,
      close: function() {
        setTimeout(() => {
          if (document.body.contains(dialog)) {
            dialog.remove();
          }
        }, 100);
      }
    });
    
    return dialog;
  }
  
  /**
   * Creates a confirmation dialog
   * 
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Function to call when confirmed
   * @param {Function} onCancel - Function to call when canceled
   * @param {Object} options - Additional dialog options
   * @returns {HTMLElement} - The created dialog element
   */
  function createConfirmDialog(message, onConfirm, onCancel, options = {}) {
    const dialogId = 'confirm-dialog-' + Math.random().toString(36).substring(2, 11);
    const dialog = document.createElement('div');
    dialog.id = dialogId;
    dialog.className = 'confirm-dialog';
    dialog.title = options.title || 'Confirm';
    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    dialog.appendChild(messageElement);
    
    document.body.appendChild(dialog);
    
    $(dialog).dialog({
      autoOpen: true,
      modal: true,
      width: options.width || 400,
      buttons: {
        "Confirm": function() {
          $(this).dialog('close');
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        },
        "Cancel": function() {
          $(this).dialog('close');
          if (typeof onCancel === 'function') {
            onCancel();
          }
        }
      },
      close: function() {
        setTimeout(() => {
          if (document.body.contains(dialog)) {
            dialog.remove();
          }
        }, 100);
      }
    });
    
    return dialog;
  }
  
  /**
   * Creates an alert dialog
   * 
   * @param {string} message - Alert message
   * @param {string} title - Dialog title
   * @param {Object} options - Additional dialog options
   * @returns {HTMLElement} - The created dialog element
   */
  function createAlertDialog(message, title = 'Alert', options = {}) {
    const dialogId = 'alert-dialog-' + Math.random().toString(36).substring(2, 11);
    const dialog = document.createElement('div');
    dialog.id = dialogId;
    dialog.className = 'alert-dialog';
    dialog.title = title;
    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    dialog.appendChild(messageElement);
    
    document.body.appendChild(dialog);
    
    $(dialog).dialog({
      autoOpen: true,
      modal: true,
      width: options.width || 400,
      buttons: {
        "OK": function() {
          $(this).dialog('close');
          if (typeof options.onClose === 'function') {
            options.onClose();
          }
        }
      },
      close: function() {
        setTimeout(() => {
          if (document.body.contains(dialog)) {
            dialog.remove();
          }
        }, 100);
      }
    });
    
    return dialog;
  }
  
  /**
   * Safely removes a dialog element from the DOM
   * 
   * @param {HTMLElement} dialog - The dialog element to remove
   */
  function safeRemoveDialog(dialog) {
    if (dialog && document.body.contains(dialog)) {
      try {
        // Try to close the dialog first if it's a jQuery UI dialog
        $(dialog).dialog('close');
      } catch (e) {
        console.warn('Error closing dialog:', e);
      }
      
      // Use setTimeout to allow jQuery UI to complete its operations
      setTimeout(() => {
        if (document.body.contains(dialog)) {
          dialog.remove();
        }
      }, 100);
    }
  }
  
  /**
   * Creates a simple modal container for custom content
   * 
   * @param {string} id - Modal ID
   * @param {string} title - Modal title
   * @param {HTMLElement|string} content - Modal content
   * @param {Object} options - Additional modal options
   * @returns {HTMLElement} - The created modal element
   */
  function createModal(id, title, content, options = {}) {
    const dialog = document.createElement('div');
    dialog.id = id;
    dialog.className = 'custom-modal';
    dialog.title = title;
    
    // Add content to dialog
    if (typeof content === 'string') {
      dialog.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      dialog.appendChild(content);
    }
    
    document.body.appendChild(dialog);
    
    // Initialize jQuery UI dialog
    $(dialog).dialog({
      autoOpen: true,
      modal: true,
      width: options.width || 500,
      minHeight: options.minHeight || 200,
      buttons: options.buttons || {
        "Close": function() {
          $(this).dialog('close');
        }
      },
      close: function() {
        setTimeout(() => {
          if (document.body.contains(dialog)) {
            dialog.remove();
          }
        }, 100);
      }
    });
    
    return dialog;
  }
  
  // Public API
  return {
    createFormDialog,
    createConfirmDialog,
    createAlertDialog,
    safeRemoveDialog,
    createModal
  };
})(); 