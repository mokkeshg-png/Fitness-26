// js/charts.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await api.getCurrentUser();
    if (!user) return; // Auth logic handled in api.js

    const avatar = document.getElementById('userAvatar');
    if(avatar) avatar.innerText = user.fullName.charAt(0).toUpperCase();

    // Chart common config based on theme
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() || '#888';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Fetch Real History Data
    const days = 30;
    const history = await api.getAnalyticsHistory(days);
    const dates = generateDates(days);
    
    // Process Data
    const calorieData = processHistoricalCalories(history.food_logs, dates, days);
    const workoutData = processHistoricalWorkouts(history.workouts, dates, days);
    const weightTrend = processHistoricalWeights(history.weight_logs, dates, days, user.weight);

    // Initialize Charts
    initWeightChart(dates, weightTrend);
    initCalorieChart(dates, calorieData, user.daily_cal_goal);
    initMacroChart();
    initWorkoutChart(dates, workoutData);
});

function processHistoricalCalories(logs, labels, days) {
    const data = new Array(days).fill(0);
    const today = new Date();
    
    logs.forEach(log => {
        const logDate = new Date(log.consumed_at);
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < days) {
            data[days - 1 - diffDays] += parseInt(log.calories);
        }
    });
    return data;
}

function processHistoricalWorkouts(logs, labels, days) {
    const data = new Array(days).fill(0);
    const today = new Date();
    
    logs.forEach(log => {
        const logDate = new Date(log.completed_at);
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < days) {
            data[days - 1 - diffDays] += parseInt(log.calories_burned);
        }
    });
    return data;
}

function processHistoricalWeights(logs, labels, days, currentWeight) {
    const data = new Array(days).fill(null);
    const today = new Date();
    
    logs.forEach(log => {
        const logDate = new Date(log.logged_at);
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < days) {
            data[days - 1 - diffDays] = parseFloat(log.weight_kg);
        }
    });

    // Fill gaps for a prettier line
    let lastWeight = currentWeight;
    for(let i = days - 1; i >= 0; i--) {
        if (data[i] === null) data[i] = lastWeight;
        else lastWeight = data[i];
    }
    return data;
}

// Helper: Generate array of last N days formatted as "MMM DD"
function generateDates(n) {
    const dates = [];
    const today = new Date();
    for(let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
}

// Mock Data Generators for a realistic "working" prototype
function generateWeightData(currentWeight, days, goal) {
    let weight = currentWeight;
    const data = [];
    // Work backwards conceptually from current weight to a history
    // We will make an array and reverse it
    let factor = goal === 'weight_loss' ? 0.05 : (goal === 'weight_gain' ? -0.05 : 0);
    for(let i=0; i<days; i++) {
        data.unshift(parseFloat(weight.toFixed(1)));
        weight += (factor + (Math.random() * 0.2 - 0.1)); // some noise
    }
    return data;
}

function generateCalorieData(goal, days) {
    return Array.from({length: days}, () => {
        return Math.floor(goal + (Math.random() * 600 - 300));
    });
}

function generateWorkoutData(days) {
    let workouts = [];
    for(let i=0; i<days; i++) {
        // User works out ~4 times a week -> ~60% chance
        const workedOut = Math.random() > 0.4;
        workouts.push(workedOut ? Math.floor(Math.random() * 300 + 150) : 0);
    }
    return workouts;
}

// Init Charts
function initWeightChart(labels, data) {
    const ctx = document.getElementById('weightChart');
    if(!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: data,
                borderColor: '#6e56cf',
                backgroundColor: 'rgba(110, 86, 207, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: Math.floor(Math.min(...data) - 2),
                    max: Math.ceil(Math.max(...data) + 2),
                    grid: { color: 'rgba(150, 150, 150, 0.1)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 7 }
                }
            }
        }
    });
}

function initCalorieChart(labels, data, goal) {
    const ctx = document.getElementById('calorieChart');
    if(!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Daily Calories',
                    data: data,
                    backgroundColor: data.map(d => d > goal + 200 ? 'rgba(233, 30, 99, 0.7)' : 'rgba(29, 185, 84, 0.7)'),
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                annotation: { // Mocking annotation with standard gridline
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: goal,
                            yMax: goal,
                            borderColor: 'red',
                            borderWidth: 2,
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(150, 150, 150, 0.1)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 7 }
                }
            }
        }
    });
}

function initMacroChart() {
    const ctx = document.getElementById('macroChart');
    if(!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fats'],
            datasets: [{
                data: [30, 45, 25],
                backgroundColor: [
                    '#6e56cf', // primary
                    '#e91e63', // secondary
                    '#1db954'  // success
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function initWorkoutChart(labels, data) {
    const ctx = document.getElementById('workoutChart');
    if(!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: data,
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
                stepped: false,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(150, 150, 150, 0.1)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 7 }
                }
            }
        }
    });
}

