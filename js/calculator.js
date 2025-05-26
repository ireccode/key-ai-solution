// Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Default values for each automation
    const defaultValues = {
        'inbox-classification': 5,
        'email-followups': 5,
        'lead-qualification': 5,
        'invoice-processing': 5,
        'document-onboarding': 5,
        'document-management': 5,
        'knowledge-base': 5,
        'lead-generation': 5,
        'content-generation': 5,
        'ultimate-assistant': 5,
        'hourly-value': 50
    };

    // Maximum values for each automation (hours)
    const maxValues = {
        'inbox-classification': 40,
        'email-followups': 40,
        'lead-qualification': 40,
        'invoice-processing': 40,
        'document-onboarding': 40,
        'document-management': 40,
        'knowledge-base': 40,
        'lead-generation': 40,
        'content-generation': 40,
        'ultimate-assistant': 40,
        'hourly-value': 500
    };

    // Efficiency factors (percentage of time saved)
    const efficiencyFactors = {
        'inbox-classification': 0.8,
        'email-followups': 0.85,
        'lead-qualification': 0.75,
        'invoice-processing': 0.9,
        'document-onboarding': 0.7,
        'document-management': 0.8,
        'knowledge-base': 0.85,
        'lead-generation': 0.7,
        'content-generation': 0.75,
        'ultimate-assistant': 0.9
    };

    // Annual plan cost (for ROI calculation)
    const annualPlanCost = 10000;

    // Initialize sliders
    const sliders = document.querySelectorAll('.calculator-slider');
    sliders.forEach(slider => {
        const id = slider.id;
        const thumbElement = slider.querySelector('.slider-thumb');
        const trackElement = slider.querySelector('.slider-track');
        const valueElement = slider.parentElement.querySelector('.calculator-item-value');
        
        // Set initial position
        const initialValue = defaultValues[id];
        const maxValue = maxValues[id];
        const initialPosition = (initialValue / maxValue) * 100;
        
        thumbElement.style.left = `${initialPosition}%`;
        trackElement.style.width = `${initialPosition}%`;
        
        if (id === 'hourly-value') {
            valueElement.textContent = `$${initialValue}`;
        } else {
            valueElement.textContent = `${initialValue} hours`;
        }
        
        // Make slider interactive
        let isDragging = false;
        
        thumbElement.addEventListener('mousedown', startDrag);
        thumbElement.addEventListener('touchstart', startDrag);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        slider.addEventListener('click', clickTrack);
        
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            let clientX;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
            } else {
                clientX = e.clientX;
            }
            
            const rect = slider.getBoundingClientRect();
            let position = (clientX - rect.left) / rect.width;
            
            // Constrain position between 0 and 1
            position = Math.max(0, Math.min(1, position));
            
            updateSlider(position);
        }
        
        function endDrag() {
            isDragging = false;
        }
        
        function clickTrack(e) {
            const rect = slider.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            updateSlider(position);
        }
        
        function updateSlider(position) {
            // Update visual elements
            thumbElement.style.left = `${position * 100}%`;
            trackElement.style.width = `${position * 100}%`;
            
            // Calculate and update value
            const value = Math.round(position * maxValue);
            
            if (id === 'hourly-value') {
                valueElement.textContent = `$${value}`;
            } else {
                valueElement.textContent = `${value} hours`;
            }
            
            // Update results
            updateResults();
        }
    });
    
    // Function to update results based on slider values
    function updateResults() {
        // Get current values from all sliders
        const values = {};
        sliders.forEach(slider => {
            const id = slider.id;
            const valueElement = slider.parentElement.querySelector('.calculator-item-value');
            let value;
            
            if (id === 'hourly-value') {
                value = parseInt(valueElement.textContent.replace('$', ''));
            } else {
                value = parseInt(valueElement.textContent.replace(' hours', ''));
            }
            
            values[id] = value;
        });
        
        // Calculate total hours saved
        let totalHoursSaved = 0;
        for (const [key, value] of Object.entries(values)) {
            if (key !== 'hourly-value') {
                totalHoursSaved += value * efficiencyFactors[key];
            }
        }
        totalHoursSaved = Math.round(totalHoursSaved);
        
        // Calculate monthly value
        const monthlyValue = totalHoursSaved * values['hourly-value'];
        
        // Calculate yearly value
        const yearlyValue = monthlyValue * 12;
        
        // Calculate ROI
        const roi = Math.round((yearlyValue / annualPlanCost) * 100);
        
        // Update result elements
        document.getElementById('total-hours-saved').textContent = `${totalHoursSaved} hours`;
        document.getElementById('monthly-value').textContent = `$${monthlyValue.toLocaleString()}`;
        document.getElementById('yearly-value').textContent = `$${yearlyValue.toLocaleString()}`;
        document.getElementById('roi-value').textContent = `${roi}%`;
    }
    
    // Initialize results
    updateResults();
});
