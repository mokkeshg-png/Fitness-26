// js/calorie-tracker.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await api.getCurrentUser();
    if (!user) return;

    // Set Avatar Initials
    const avatar = document.getElementById('userAvatar');
    if(avatar) avatar.innerText = user.fullName.charAt(0).toUpperCase();

    // Setup Date Input
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.addEventListener('change', () => {
            loadData(dateInput.value);
        });
    }

    // Determine context (Food or Workout)
    const foodForm = document.getElementById('foodForm');
    const workoutForm = document.getElementById('workoutForm');

    if (foodForm) {
        setupFoodLogic(user);
        loadData(dateInput.value);
    }

    if (workoutForm) {
        setupWorkoutLogic(user);
        loadData(dateInput.value);
    }
});

function loadData(date) {
    const foodTableBody = document.getElementById('foodTableBody');
    const workoutTableBody = document.getElementById('workoutTableBody');

    if (foodTableBody) loadFoodLogs(date);
    if (workoutTableBody) loadWorkoutLogs(date);
}

// FOOD LOGIC
function setupFoodLogic(user) {
    const foodForm = document.getElementById('foodForm');
    
    foodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('logDate').value;
        const foodName = document.getElementById('foodName').value;
        const mealType = document.getElementById('mealType').value;
        const calories = document.getElementById('calories').value;

        const btn = document.getElementById('addFoodBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...';

        try {
            await api.logFood({
                food_name: foodName,
                meal_type: mealType,
                calories: parseInt(calories),
                consumed_at: date
            });
            showNotification('Food logged successfully!', 'success');
            foodForm.reset();
            loadFoodLogs(date);
        } catch (err) {
            showNotification('Error logging food', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Log';
        }
    });

    // Delegate delete logic
    document.getElementById('foodTableBody').addEventListener('click', async (e) => {
        if(e.target.closest('.delete-food-btn')) {
            const btn = e.target.closest('.delete-food-btn');
            const id = btn.getAttribute('data-id');
            const date = document.getElementById('logDate').value;
            
            if(confirm('Delete this entry?')) {
                await api.deleteFood(id);
                showNotification('Entry deleted', 'success');
                loadFoodLogs(date);
            }
        }
    });
}

async function loadFoodLogs(date) {
    const logs = await api.getFoodLogs(date);
    const tbody = document.getElementById('foodTableBody');
    const totalEl = document.getElementById('dailyTotalCalories');
    
    tbody.innerHTML = '';
    let total = 0;

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No items logged yet.</td></tr>';
    } else {
        logs.forEach(log => {
            total += parseInt(log.calories);
            const timeStr = new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            tbody.innerHTML += `
                <tr>
                    <td><strong>${log.food_name}</strong></td>
                    <td style="text-transform: capitalize;">${log.meal_type}</td>
                    <td>${log.calories} kcal</td>
                    <td>${timeStr}</td>
                    <td class="action-cell">
                        <button class="delete-food-btn" data-id="${log.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    
    if(totalEl) totalEl.innerText = `${total} kcal`;
}


// WORKOUT LOGIC
function setupWorkoutLogic(user) {
    const workoutForm = document.getElementById('workoutForm');
    const typeSelect = document.getElementById('workoutType');
    const durInput = document.getElementById('duration');
    const calcBtn = document.getElementById('autoCalcBtn');
    const burnedInput = document.getElementById('burnedCalories');

    const calculateBurn = () => {
        const duration = parseInt(durInput.value) || 0;
        const type = typeSelect.value;
        const weight = user.weight || 70;

        // MET values estimation
        const metMap = {
            running: 8.0,
            cycling: 6.0,
            swimming: 7.0,
            strength: 3.5,
            yoga: 2.5,
            hiit: 8.5,
            walking: 3.8
        };

        const met = metMap[type] || 5;
        // Formula: Calories = MET * Weight(kg) * Time(hrs)
        const burned = Math.round(met * weight * (duration / 60));
        burnedInput.value = burned;
    };

    calcBtn.addEventListener('click', calculateBurn);
    
    // Auto calculate if they change type/dur and burned object is empty
    const autoFillIfEmpty = () => {
        if(durInput.value) calculateBurn();
    }
    durInput.addEventListener('blur', autoFillIfEmpty);
    typeSelect.addEventListener('change', autoFillIfEmpty);

    workoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!burnedInput.value) calculateBurn(); // catch

        const date = document.getElementById('logDate').value;
        
        const btn = document.getElementById('addWorkoutBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...';

        try {
            await api.logWorkout({
                workout_type: typeSelect.options[typeSelect.selectedIndex].text,
                duration_min: parseInt(durInput.value),
                calories_burned: parseInt(burnedInput.value),
                completed_at: date
            });
            showNotification('Activity logged successfully!', 'success');
            workoutForm.reset();
            loadWorkoutLogs(date);
        } catch (err) {
            showNotification('Error logging workout', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Workout';
        }
    });
}

async function loadWorkoutLogs(date) {
    const logs = await api.getWorkouts(date);
    const tbody = document.getElementById('workoutTableBody');
    const totalEl = document.getElementById('dailyTotalBurned');
    
    if(!tbody) return;

    tbody.innerHTML = '';
    let total = 0;

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No activities logged yet.</td></tr>';
    } else {
        logs.forEach(log => {
            total += parseInt(log.calories_burned);
            const timeStr = new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            tbody.innerHTML += `
                <tr>
                    <td><strong>${log.workout_type}</strong></td>
                    <td>${log.duration_min} min</td>
                    <td>${log.calories_burned} kcal</td>
                    <td>${timeStr}</td>
                    <td class="action-cell">
                        <button class="delete-workout-btn" data-id="${log.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    
    if(totalEl) totalEl.innerText = `${total} kcal`;
}

// Global Event delegation for dynamic lists
document.addEventListener('click', async (e) => {
    if(e.target.closest('.delete-workout-btn')) {
        const btn = e.target.closest('.delete-workout-btn');
        const id = btn.getAttribute('data-id');
        const dateInput = document.getElementById('logDate');
        const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        
        if(confirm('Delete this workout entry?')) {
            try {
                await api.deleteWorkout(id);
                showNotification('Workout deleted', 'success');
                loadWorkoutLogs(date);
            } catch (err) {
                showNotification('Error deleting workout', 'error');
            }
        }
    }
});

