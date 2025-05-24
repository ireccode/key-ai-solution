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
    function submitForm() {
        const form = document.getElementById('multi-step-form');
        const formData = new FormData(form);
        
        // Display loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Simulate form submission (in a real implementation, this would be an AJAX call)
        setTimeout(() => {
            // Reset form and show success message
            form.reset();
            currentStep = 0;
            showStep(currentStep);
            
            // Show success message
            const formContainer = document.querySelector('.form-container');
            formContainer.innerHTML = `
                <div class="success-message" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-gold); margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 15px; color: var(--primary-gold);">Thank You!</h3>
                    <p>Your form has been submitted successfully. We'll get back to you shortly.</p>
                    <button class="primary-button" style="margin-top: 30px;" onclick="window.location.reload()">Submit Another Response</button>
                </div>
            `;
        }, 2000);
    }
    
    // Initialize the form when DOM is loaded
    initForm();
});
