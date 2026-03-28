// js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await api.getCurrentUser();
    if (!user) return; // handled by api.js route protection

    // Set Greeting
    document.getElementById('greeting').innerText = `Hello, ${user.fullName.split(' ')[0]}! 👋`;
    
    // Set Current Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', options);

    // Set Avatar Initials
    document.getElementById('userAvatar').innerText = user.fullName.charAt(0).toUpperCase();

    const todayStr = new Date().toISOString().split('T')[0];

    // load Dashboard Data
    await loadDashboardData(todayStr, user);
});

async function loadDashboardData(date, user) {
    // Parallelize API calls for better performance
    const [summary, foods, workouts] = await Promise.all([
        api.getDailySummary(date),
        api.getFoodLogs(date),
        api.getWorkouts(date)
    ]);

    // Update Calorie Card
    document.getElementById('netCalories').innerText = summary.net_calories;
    document.getElementById('goalCalories').innerText = summary.calorie_goal;

    const progressPercentage = Math.min((summary.net_calories / summary.calorie_goal) * 100, 100);
    document.getElementById('calorieProgress').style.width = Math.max(progressPercentage, 0) + '%';
    
    let statusMsg = '';
    const remaining = summary.remaining;
    if (remaining < -500) statusMsg = 'Significantly over target.';
    else if (remaining < 0) statusMsg = 'Slightly over target.';
    else if (remaining > 500) statusMsg = 'Below target today.';
    else statusMsg = 'Right on track! Perfect.';
    
    document.getElementById('calorieStatus').innerText = statusMsg;

    // Update Workout Card
    document.getElementById('workoutCount').innerText = workouts.length;
    document.getElementById('totalBurned').innerText = summary.total_burned;

    // Load Recent Activity
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';

    // Merge and sort foods + workouts by time (mocking time closely by created_at)
    let activities = [];
    foods.forEach(f => {
        activities.push({
            type: 'food',
            title: `${f.food_name} (${f.meal_type})`,
            value: `+${f.calories} kcal`,
            time: new Date(f.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            timestamp: new Date(f.created_at).getTime()
        });
    });

    workouts.forEach(w => {
        activities.push({
            type: 'workout',
            title: w.workout_type,
            value: `-${w.calories_burned} kcal`,
            time: new Date(w.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            timestamp: new Date(w.created_at).getTime()
        });
    });

    activities.sort((a, b) => b.timestamp - a.timestamp); // latest first

    if (activities.length === 0) {
        activityList.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 40px;">No activity logged today.</div>';
    } else {
        activities.slice(0, 5).forEach(act => {
            const isFood = act.type === 'food';
            activityList.innerHTML += `
                <div class="activity-item">
                    <div class="activity-icon ${act.type}">
                        <i class="fa-solid fa-${isFood ? 'utensils' : 'dumbbell'}"></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">${act.title}</div>
                        <div class="activity-time">${act.time}</div>
                    </div>
                    <div class="activity-value ${isFood ? 'negative' : 'positive'}">${act.value}</div>
                </div>
            `;
        });
    }

    // Load Recommendations
    const recList = document.getElementById('recommendationsList');
    let recs = [];

    if (remaining > 500) {
        recs.push({
            type: 'warning',
            text: `You have ${remaining} calories remaining. Consider a healthy, nutrient-rich meal.`
        });
    } else if (remaining < 0) {
        recs.push({
            type: 'warning',
            text: 'You are over your calorie goal for today. Try to balance it out tomorrow or add a light workout.'
        });
    }

    if (workouts.length === 0) {
        recs.push({
            type: 'info',
            text: 'You haven\'t logged any workouts today. Even a 15-minute walk can make a difference!'
        });
    } else {
        recs.push({
            type: 'info',
            text: 'Great job staying active today! Don\'t forget to stay hydrated.'
        });
    }

    recList.innerHTML = recs.map(rec => `
        <div class="rec-item ${rec.type}">
            <p>${rec.text}</p>
        </div>
    `).join('');
}

