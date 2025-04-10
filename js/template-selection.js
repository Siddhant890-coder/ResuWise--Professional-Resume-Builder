function initTemplateSelection() {
    const templateOptions = document.querySelectorAll('.template-option');
    const resumeData = getResumeData();
    
    // Clear all selections first
    templateOptions.forEach(opt => {
        opt.classList.remove('selected-template');
    });

    // Set up click handlers
    templateOptions.forEach(option => {
        option.style.cursor = 'pointer';
        
        option.addEventListener('click', function() {
            // Remove selection from all options
            templateOptions.forEach(opt => {
                opt.classList.remove('selected-template');
            });
            
            // Add selection to clicked option
            this.classList.add('selected-template');
            
            // Update and save resume data
            const updatedData = getResumeData();
            updatedData.template = this.getAttribute('data-template');
            saveResumeData(updatedData);
            
            updatePreview();
        });
    });

    // Select current or default template
    const selectedTemplate = resumeData.template || 'modern';
    const templateToSelect = document.querySelector(`.template-option[data-template="${selectedTemplate}"]`) || 
                           templateOptions[0];
    
    if (templateToSelect) {
        templateToSelect.classList.add('selected-template');
        
        // Ensure template is saved in resume data
        if (!resumeData.template) {
            const updatedData = getResumeData();
            updatedData.template = templateToSelect.getAttribute('data-template');
            saveResumeData(updatedData);
        }
    }
}