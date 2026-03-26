// js/bmi-calculator.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await api.getCurrentUser();
    if (!user) return;

    const avatar = document.getElementById('userAvatar');
    if(avatar) avatar.innerText = user.fullName.charAt(0).toUpperCase();

    const heightInput = document.getElementById('bmiHeight');
    const weightInput = document.getElementById('bmiWeight');
    const form = document.getElementById('bmiForm');
    
    // Pre-fill
    if(user.height) heightInput.value = user.height;
    if(user.weight) weightInput.value = user.weight;

    // Calculate directly on load if data exists
    if(user.height && user.weight) {
        calculateBMI(user.height, user.weight);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        calculateBMI(height, weight);
    });
});

function calculateBMI(heightCm, weightKg) {
    if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) {
        showNotification("Please enter valid positive numbers for height and weight.", "error");
        return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    // Formatting
    const bmiFixed = bmi.toFixed(1);
    document.getElementById('bmiValue').innerText = bmiFixed;

    // Determine category
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
        category = 'Underweight';
        color = 'var(--warning)';
    } else if (bmi < 25) {
        category = 'Normal';
        color = 'var(--success)';
    } else if (bmi < 30) {
        category = 'Overweight';
        color = 'var(--warning)';
    } else {
        category = 'Obese';
        color = 'var(--danger)';
    }

    document.getElementById('bmiCategory').innerText = category;
    document.getElementById('bmiCategory').style.color = color;
    document.getElementById('bmiValue').style.color = color;
    document.getElementById('bmiCircle').style.borderColor = color;

    // Trigger pulse animation
    const circle = document.getElementById('bmiCircle');
    circle.style.transform = 'scale(1.05)';
    setTimeout(() => circle.style.transform = 'scale(1)', 200);
}

