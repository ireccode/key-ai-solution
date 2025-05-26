// Contact Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const formSteps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const nextButtons = document.querySelectorAll('.btn-next');
    const backButtons = document.querySelectorAll('.btn-back');
    const submitButton = document.querySelector('.btn-submit');
    const progressText = document.querySelector('.progress-text');
    
    let currentStep = 0;
    
    // Initialize form
    function initForm() {
        showStep(currentStep);
        updateProgress();
        
        // Add event listeners to next buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (validateStep(currentStep)) {
                    currentStep++;
                    showStep(currentStep);
                    updateProgress();
                }
            });
        });
        
        // Add event listeners to back buttons
        backButtons.forEach(button => {
            button.addEventListener('click', function() {
                currentStep--;
                showStep(currentStep);
                updateProgress();
            });
        });
        
        // Add event listener to submit button
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                e.preventDefault();
                if (validateStep(currentStep)) {
                    submitForm();
                }
            });
        }
    }
    
    // Show the specified step
    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        
        stepDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === stepIndex);
        });
        
        // Hide/show back button on first step
        if (stepIndex === 0) {
            document.querySelector('.form-step.active .btn-back').style.visibility = 'hidden';
        } else {
            document.querySelector('.form-step.active .btn-back').style.visibility = 'visible';
        }
    }
    
    // Update progress indicator
    function updateProgress() {
        if (progressText) {
            progressText.textContent = `Step ${currentStep + 1} of ${formSteps.length}`;
        }
    }
    
    // Validate current step
    function validateStep(stepIndex) {
        const currentStepElement = formSteps[stepIndex];
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        // Special validation for step 1 (AI goals)
        if (stepIndex === 0) {
            // Check if at least one AI goal is selected or ai_goal_other is filled
            const aiGoalCheckboxes = currentStepElement.querySelectorAll('input[type="checkbox"][name^="ai_goal"]');
            const aiGoalOther = currentStepElement.querySelector('input[name="ai_goal_other"]');
            
            let hasSelectedGoal = false;
            
            // Check if any checkbox is checked
            aiGoalCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    hasSelectedGoal = true;
                }
            });
            
            // Check if "Other" field is filled
            if (aiGoalOther && aiGoalOther.value.trim() !== '') {
                hasSelectedGoal = true;
            }
            
            // If no goal is selected, show error
            if (!hasSelectedGoal) {
                isValid = false;
                
                // Add error message if it doesn't exist
                let errorContainer = currentStepElement.querySelector('.goals-error-message');
                if (!errorContainer) {
                    errorContainer = document.createElement('div');
                    errorContainer.classList.add('goals-error-message');
                    errorContainer.style.color = '#ff6b6b';
                    errorContainer.style.fontSize = '0.85rem';
                    errorContainer.style.marginTop = '10px';
                    errorContainer.style.marginBottom = '10px';
                    errorContainer.textContent = 'Please select at least one AI goal or specify your own';
                    
                    // Insert after the checkbox group
                    const checkboxGroup = currentStepElement.querySelector('.checkbox-group');
                    checkboxGroup.parentNode.insertBefore(errorContainer, checkboxGroup.nextSibling);
                }
            } else {
                // Remove error message if it exists
                const errorContainer = currentStepElement.querySelector('.goals-error-message');
                if (errorContainer) {
                    errorContainer.remove();
                }
            }
        }
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                
                // Add error message if it doesn't exist
                let errorMessage = field.nextElementSibling;
                if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                    errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.style.color = '#ff6b6b';
                    errorMessage.style.fontSize = '0.85rem';
                    errorMessage.style.marginTop = '5px';
                    errorMessage.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMessage, field.nextSibling);
                }
            } else {
                field.classList.remove('is-invalid');
                
                // Remove error message if it exists
                const errorMessage = field.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.remove();
                }
            }
        });
        
        return isValid;
    }
    
    // Submit the form
    async function submitForm() {
        const form = document.getElementById('multi-step-form');
        const formData = new FormData(form);
        
        // Check for required fields
        const requiredFields = [
            { field: 'name', label: 'Full Name' },
            { field: 'email', label: 'Email' },
            { field: 'business_area', label: 'Business Area' },
            { field: 'pain_points', label: 'Pain Points' },
            { field: 'timeline', label: 'Timeline' },
            { field: 'budget', label: 'Budget' },
            { field: 'annual_revenue', label: 'Annual Revenue' }
        ];
        
        let missingFields = [];
        for (const { field, label } of requiredFields) {
            if (!formData.get(field)) {
                missingFields.push(label);
            }
        }
        
        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit';
            return;
        }
        
        // Display loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            // Convert FormData to JSON
            const formJson = {};
            
            // Handle checkboxes (ai_goal1 through ai_goal10)
            const aiGoals = [];
            let aiGoalOther = '';
            
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('ai_goal') && key !== 'ai_goal_other') {
                    // This captures ai_goal1 through ai_goal10
                    aiGoals.push(value);
                } else if (key === 'ai_goal_other') {
                    aiGoalOther = value;
                } else {
                    formJson[key] = value;
                }
            }
            
            // Add the "Other" goal if specified
            if (aiGoalOther && aiGoalOther.trim() !== '') {
                aiGoals.push(`Other: ${aiGoalOther}`);
            }
            
            // Add goals array to formJson
            formJson.goals = aiGoals;
            
            // Also add individual ai_goal fields for backward compatibility
            for (let i = 0; i < aiGoals.length; i++) {
                formJson[`ai_goal${i+1}`] = aiGoals[i];
            }
            
            // Add ai_goal_other if it exists
            if (aiGoalOther && aiGoalOther.trim() !== '') {
                formJson.ai_goal_other = aiGoalOther;
            }
            
            // Set default contact method if not provided
            if (!formJson.contact_method) {
                formJson.contact_method = 'Email';
            }

            // Send to Cloudflare Worker
            const response = await fetch('https://keyaisolution-email-worker.keyaisolution.com/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formJson)
            });

            const result = await response.json();

            if (result.success) {
                // Reset form and show success message
                form.reset();
                currentStep = 0;
                showStep(currentStep);
                
                const formContainer = document.querySelector('.form-container');
                formContainer.innerHTML = `
                    <div class="success-message" style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-gold); margin-bottom: 20px;"></i>
                        <h3 style="margin-bottom: 15px; color: var(--primary-gold);">Thank You!</h3>
                        <p>Your form has been submitted successfully. We'll get back to you shortly.</p>
                        <button class="primary-button" style="margin-top: 30px;" onclick="window.location.reload()">Submit Another Response</button>
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Sorry, there was an error submitting your form. Please try again later.');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit';
        }
    }
    
    // Initialize the form when DOM is loaded
    initForm();
});
