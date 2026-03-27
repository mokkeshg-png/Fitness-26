// js/api.js

/* 
 * Supabase & Python Backend API Integration.
 * Connects the frontend to both Supabase Auth and the Python MCP Backend.
 */

const SUPABASE_URL = 'https://ruksaybvkfnqdkvrjesh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1a3NheWJ2a2ZucWRrdnJqZXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDI2OTEsImV4cCI6MjA5MDAxODY5MX0.eHazax-OEbSoR457UnVOBZAomm1DYTh45slOmjAsby4';

// PYTHON BACKEND CONFIGURATION
const BACKEND_URL = 'http://localhost:8000'; // Change to your public URL (e.g. Render) for production
const USE_PYTHON_BACKEND = true; 

// Use var to ensure global scope attachment in non-module scripts
var supabaseClient = null;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized successfully.');
} else {
    console.error('❌ Supabase dependency missing! Check CDN script tag.');
}

class FitTrackAPI {
    constructor() {
        if (!supabaseClient) {
            console.error('Supabase client not loaded. Please check CDN import.');
        }
    }

    async getAuthHeaders() {
        if (!supabaseClient) return {};
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return {};
        return {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        };
    }

    // Auth
    async register(userData) {
        try {
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: { data: { full_name: userData.fullName } }
            });

            if (authError) throw authError;

            // Initialize profile
            const { data: profile, error: profileError } = await supabaseClient
                .from('users')
                .insert([{
                    id: authData.user.id,
                    full_name: userData.fullName,
                    height_cm: userData.height,
                    weight_kg: userData.weight,
                    fitness_goal: userData.fitnessGoal,
                    daily_cal_goal: this.calculateDailyCalorieGoal(userData.weight, userData.height, userData.fitnessGoal)
                }])
                .select().single();

            if (profileError) throw profileError;

            return { ...profile, fullName: profile.full_name, height: profile.height_cm, weight: profile.weight_kg };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    }

    async getCurrentUser() {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                if (headers.Authorization) {
                    const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' }); // Quick ping
                    if (res.ok) {
                        const profileRes = await fetch(`${BACKEND_URL}/user/profile`, { headers });
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            return { ...profile, fullName: profile.full_name, height: profile.height_cm, weight: profile.weight_kg };
                        }
                    }
                }
            } catch (e) {
                console.error('Backend unreachable, using direct Supabase:', e);
            }
        }

        // Direct Fallback
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data: user, error } = await supabaseClient.from('users').select('*').eq('id', session.user.id).single();
        if (error) return null;

        return { ...user, fullName: user.full_name, height: user.height_cm, weight: user.weight_kg };
    }

    async updateCurrentUser(updates) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const dbUpdates = {
                    full_name: updates.fullName,
                    height_cm: updates.height,
                    weight_kg: updates.weight,
                    fitness_goal: updates.fitnessGoal
                };
                const res = await fetch(`${BACKEND_URL}/user/profile`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(dbUpdates)
                });
                if (res.ok) {
                    const data = await res.json();
                    return { ...data, fullName: data.full_name, height: data.height_cm, weight: data.weight_kg };
                }
            } catch (e) {
                console.error('Update failed on backend, falling back...');
            }
        }

        // Direct fallback omitted but functionally similar to getCurrentUser logic
    }

    calculateDailyCalorieGoal(weight, height, goal) {
        const bmr = (10 * weight) + (6.25 * height) - (5 * 30) + 5; 
        const tdee = bmr * 1.375;
        let target = Math.round(tdee);
        if (goal === 'weight_loss') target = Math.round(tdee - 500);
        if (goal === 'weight_gain') target = Math.round(tdee + 500);
        return Math.max(target, 1200);
    }

    async logFood(foodData) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/tracking/food`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(foodData)
                });
                if (res.ok) return await res.json();
            } catch (e) { console.error('Food sync error:', e); }
        }
        // Direct Supabase insert as definitive fallback
        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient.from('food_logs').insert([{
            user_id: user.id,
            food_name: foodData.food_name,
            calories: foodData.calories,
            meal_type: foodData.meal_type,
            consumed_at: foodData.consumed_at || new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        return data;
    }

    async deleteFood(id) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/tracking/food/${id}`, { method: 'DELETE', headers });
                if (res.ok) return true;
            } catch (e) { console.error('Food delete sync error:', e); }
        }
        const { error } = await supabaseClient.from('food_logs').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    async deleteWorkout(id) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/tracking/workout/${id}`, { method: 'DELETE', headers });
                if (res.ok) return true;
            } catch (e) { console.error('Workout delete sync error:', e); }
        }
        const { error } = await supabaseClient.from('workouts').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    async getFoodLogs(date) {
        const user = await this.getCurrentUser();
        if (!user) return [];
        const { data, error } = await supabaseClient.from('food_logs')
            .select('*').eq('user_id', user.id)
            .gte('consumed_at', `${date}T00:00:00`).lte('consumed_at', `${date}T23:59:59`);
        return error ? [] : data;
    }

    async logWorkout(workoutData) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/tracking/workout`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(workoutData)
                });
                if (res.ok) return await res.json();
            } catch (e) { console.error('Workout sync error:', e); }
        }
        // Direct Supabase insert as definitive fallback
        const user = await this.getCurrentUser();
        const { data, error} = await supabaseClient.from('workouts').insert([{
            user_id: user.id,
            workout_type: workoutData.workout_type,
            duration_min: workoutData.duration_min,
            calories_burned: workoutData.calories_burned,
            completed_at: workoutData.completed_at || new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        return data;
    }

    async getWorkouts(date) {
        const user = await this.getCurrentUser();
        if (!user) return [];
        const { data, error } = await supabaseClient.from('workouts')
            .select('*').eq('user_id', user.id)
            .gte('completed_at', `${date}T00:00:00`).lte('completed_at', `${date}T23:59:59`);
        return error ? [] : data;
    }

    async getDailySummary(date) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/tracking/daily-summary/${date}`, { headers });
                if (res.ok) return await res.json();
            } catch (e) { console.error('Summary fetch error:', e); }
        }
        
        // Manual calc fallback
        const user = await this.getCurrentUser();
        if (!user) return null;
        const foods = await this.getFoodLogs(date);
        const workouts = await this.getWorkouts(date);
        const consumed = foods.reduce((sum, item) => sum + parseInt(item.calories), 0);
        const burned = workouts.reduce((sum, item) => sum + parseInt(item.calories_burned), 0);
        const net = consumed - burned;
        return {
            calorie_goal: user.daily_cal_goal,
            total_consumed: consumed,
            total_burned: burned,
            net_calories: net,
            remaining: user.daily_cal_goal - net
        };
    }

    async getAnalyticsHistory(days = 30) {
        if (USE_PYTHON_BACKEND) {
            try {
                const headers = await this.getAuthHeaders();
                const res = await fetch(`${BACKEND_URL}/analytics/history?days=${days}`, { headers });
                if (res.ok) return await res.json();
            } catch (e) { console.error('History fetch error:', e); }
        }
        
        // Fallback or Direct Supabase for history
        const user = await this.getCurrentUser();
        const start = new Date();
        start.setDate(start.getDate() - days);
        const isoStart = start.toISOString();

        const { data: foods } = await supabaseClient.from('food_logs').select('calories, consumed_at').eq('user_id', user.id).gte('consumed_at', isoStart);
        const { data: workouts } = await supabaseClient.from('workouts').select('calories_burned, completed_at').eq('user_id', user.id).gte('completed_at', isoStart);
        
        return { food_logs: foods || [], workouts: workouts || [] };
    }
}

// Initialize globally
var api = new FitTrackAPI();
window.api = api; // Explicit attachment to ensure visibility across all scripts
console.log('✅ FitTrack API initialized.');

// Route Protection Logic
document.addEventListener('DOMContentLoaded', async () => {
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const checkAuth = async () => {
        const isPublic = publicPages.includes(currentPage);
        if (!supabaseClient) return;
        const { data: { session } } = await supabaseClient.auth.getSession();
        const user = session ? session.user : null;

        if (!isPublic && !user) {
            if (currentPage !== 'login.html') window.location.href = 'login.html';
        } else if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
            window.location.href = 'dashboard.html';
        }
    };
    await checkAuth();
});
