// js/food-database.js

document.addEventListener('DOMContentLoaded', async () => {
    // Render foods immediately
    renderFoods(foodDatabase);

    // Then update user info if logged in
    try {
        const user = await api.getCurrentUser();
        if(user && document.getElementById('userAvatar')) {
            document.getElementById('userAvatar').innerText = user.fullName.charAt(0).toUpperCase();
        }
    } catch (e) {
        console.error('User fetch failed:', e);
    }

    const foodDatabase = [
        // PROTEINS
        { 
            name: "Chicken", category: "protein", base_calories: 165, goal: "loss", 
            benefit: "High lean protein, promotes muscle retention while losing fat.", 
            smart_tags: ["High Protein", "Low Fat"],
            best_time: "Post-workout or Dinner",
            details: "A staple in fitness diets. Extremely low fat and high protein content makes it perfect for cutting phases.", 
            unit: "per 100g",
            variations: [
                { type: "Boiled / Grilled Breast", cal: 165 },
                { type: "Fried", cal: 290 },
                { type: "Chicken Biryani", cal: 350 },
                { type: "Thigh (Roasted)", cal: 209 }
            ]
        },
        { 
            name: "Eggs", category: "protein", base_calories: 155, goal: "gain", 
            benefit: "Complete amino acid profile with healthy fats.", 
            smart_tags: ["Muscle Gain", "Healthy Fats", "Vitamins"],
            best_time: "Breakfast or Pre-workout",
            details: "Nature's multivitamin. The yolk contains essential nutrients and healthy cholesterol vital for muscle building.", 
            unit: "per 100g",
            variations: [
                { type: "Whole Egg (Boiled)", cal: 155 },
                { type: "Scrambled", cal: 199 },
                { type: "Egg Whites Only", cal: 52 }
            ]
        },
        { 
            name: "Salmon", category: "protein", base_calories: 206, goal: "both", 
            benefit: "Rich in Omega-3 fatty acids, excellent for muscle recovery.", 
            smart_tags: ["Omega-3", "Recovery", "High Protein"],
            best_time: "Dinner",
            details: "A dense source of protein and healthy fats. Promotes cardiovascular health and reduces inflammation post-workout.", 
            unit: "per 100g" 
        },
        { 
            name: "Greek Yogurt", category: "protein", base_calories: 100, goal: "loss", 
            benefit: "High in casein protein, perfect for slow digestion.", 
            smart_tags: ["Gut Health", "Casein", "Low Calorie"],
            best_time: "Breakfast or Before Bed",
            details: "Contains probiotics for gut health and double the protein of regular yogurt.", 
            unit: "per 100g", 
            variations: [{ type: "Plain Non-fat", cal: 59 }, { type: "Full Fat", cal: 100 }, { type: "Flavored", cal: 120 }] 
        },
        { 
            name: "Lean Beef", category: "protein", base_calories: 250, goal: "gain", 
            benefit: "Rich in iron, zinc, and B vitamins for muscle growth.", 
            smart_tags: ["Iron Rich", "Creatine", "Mass Builder"],
            best_time: "Lunch or Dinner",
            details: "Provides naturally occurring creatine and high-quality protein for mass building.", 
            unit: "per 100g", 
            variations: [{type: "95% Lean Ground", cal: 137}, {type: "Steak / Steak Roast", cal: 271}, {type: "Burger Patty", cal: 300}] 
        },
        { 
            name: "Tofu", category: "protein", base_calories: 76, goal: "both", 
            benefit: "Excellent plant-based complete protein.", 
            smart_tags: ["Vegan", "Complete Protein", "Calcium"],
            best_time: "Anytime",
            details: "Low in calories but high in protein and calcium. Great for vegan fitness enthusiasts.", 
            unit: "per 100g" 
        },
        { 
            name: "Cottage Cheese", category: "protein", base_calories: 98, goal: "both", 
            benefit: "Slow-digesting casein protein, ideal before bed.", 
            smart_tags: ["Casein Protein", "Satiety"],
            best_time: "Before Bed",
            details: "Feeds muscles continuously over several hours during sleep, preventing muscle breakdown.", 
            unit: "per 100g", 
            variations: [{type: "Non-fat", cal: 72}, {type: "Low-fat (1-2%)", cal: 84}, {type: "Full Fat (4%)", cal: 98}] 
        },
        { 
            name: "Tuna", category: "protein", base_calories: 132, goal: "loss", 
            benefit: "Extremely lean protein source, highly convenient.", 
            smart_tags: ["High Protein", "Low Fat", "Quick Meal"],
            best_time: "Lunch / Post-workout",
            warning: "Limit to 2-3 times a week due to mercury levels.",
            details: "A quick, cheap way to hit daily protein macros on a cut.", 
            unit: "per 100g", 
            variations: [{type: "Canned in Water", cal: 86}, {type: "Canned in Oil", cal: 198}, {type: "Fresh Steak", cal: 132}] 
        },
        { 
            name: "Whey Protein", category: "protein", base_calories: 110, goal: "both", 
            benefit: "Fastest absorbing protein post-workout.", 
            smart_tags: ["Rapid Absorption", "Supplement"],
            best_time: "Immediately Post-workout",
            details: "Spikes blood amino acid levels quickly to jumpstart muscle protein synthesis.", 
            unit: "per scoop (30g)", 
            variations: [{type: "Isolate (Lean)", cal: 110}, {type: "Concentrate", cal: 130}, {type: "Mass Gainer", cal: 350}] 
        },
        { 
            name: "Turkey", category: "protein", base_calories: 114, goal: "loss", 
            benefit: "Lean alternative to chicken with a rich nutrient profile.", 
            smart_tags: ["Lean Protein", "Vitamins"],
            best_time: "Lunch or Dinner",
            details: "High in tryptophan and B vitamins. Excellent for clean bulking or cutting.", 
            unit: "per 100g", 
            variations: [{type: "Breast (Roasted)", cal: 114}, {type: "Ground (93% lean)", cal: 150}] 
        },
        
        // CARBOHYDRATES
        { 
            name: "Rice", category: "carbs", base_calories: 130, goal: "gain", 
            benefit: "Fast-digesting or sustained carbs depending on the grain.", 
            smart_tags: ["Carb Loading", "Energy"],
            best_time: "Pre or Post-workout",
            details: "A classic bodybuilder staple. Easy to eat in large quantities for caloric surpluses.", 
            unit: "per 100g cooked", 
            variations: [{type: "White Rice", cal: 130}, {type: "Brown Rice", cal: 112}, {type: "Fried Rice", cal: 163}, {type: "Rice Pilaf", cal: 150}] 
        },
        { 
            name: "Potatoes", category: "carbs", base_calories: 86, goal: "both", 
            benefit: "Highly satiating, rich in complex carbs.", 
            smart_tags: ["Satiety", "Potassium", "Energy"],
            best_time: "Pre-workout",
            details: "Can be used for fat loss (boiled/baked) or mass building (mashed/fried).", 
            unit: "per 100g", 
            variations: [{type: "Sweet Potato (Baked)", cal: 90}, {type: "White Potato (Boiled)", cal: 86}, {type: "Mashed (with butter)", cal: 113}, {type: "French Fries", cal: 312}] 
        },
        { 
            name: "Oatmeal", category: "carbs", base_calories: 389, goal: "both", 
            benefit: "Complex carbs providing sustained energy for workouts.", 
            smart_tags: ["Slow Release Energy", "Fiber", "Satiety"],
            best_time: "Breakfast",
            details: "High in beta-glucan soluble fiber. Keeps you full and provides long-lasting stamina.", 
            unit: "per 100g dry" 
        },
        { 
            name: "Quinoa", category: "carbs", base_calories: 120, goal: "both", 
            benefit: "A complete protein grain rich in magnesium and fiber.", 
            smart_tags: ["Complete Protein", "Complex Carb"],
            best_time: "Lunch or Dinner",
            details: "Perfect for vegetarians. Contains all 9 essential amino acids alongside complex carbs.", 
            unit: "per 100g cooked" 
        },
        { 
            name: "Rice Cakes", category: "carbs", base_calories: 35, goal: "loss", 
            benefit: "Low-calorie, fast-absorbing pre-workout carb.", 
            smart_tags: ["Low Calorie", "Quick Energy"],
            best_time: "30 mins Pre-workout",
            details: "Extremely low calorie. Great for satisfying crunch cravings during extreme diets.", 
            unit: "per cake (9g)" 
        },
        { 
            name: "Pasta", category: "carbs", base_calories: 158, goal: "gain", 
            benefit: "Calorie-dense carb ideal for bulking phases.", 
            smart_tags: ["Energy Dense", "Bulking"],
            best_time: "Lunch or Pre-workout (2hrs prior)",
            warning: "Can cause grogginess due to large insulin spikes if eaten in massive quantities.",
            details: "High energy, easy to eat in bulk for carb-loading.", 
            unit: "per 100g cooked", 
            variations: [{type: "Whole Wheat", cal: 124}, {type: "White Pasta", cal: 158}, {type: "Pasta with Meat Sauce", cal: 180}] 
        },
        { 
            name: "Bread", category: "carbs", base_calories: 265, goal: "both", 
            benefit: "Convenient carbs. Whole grain variants provide fiber.", 
            smart_tags: ["Quick Energy", "Convenient"],
            best_time: "Breakfast or Pre-workout",
            details: "Can range from empty calories to highly nutritious depending on preparation.", 
            unit: "per 100g or 2 slices", 
            variations: [{type: "Whole Wheat", cal: 247}, {type: "White Bread", cal: 265}, {type: "Ezekiel Sprouted", cal: 240}] 
        },

        // FRUITS & VEG
        { 
            name: "Banana", category: "fruits", base_calories: 89, goal: "gain", 
            benefit: "Fast digesting carbs and potassium to prevent cramping.", 
            smart_tags: ["Fast Digesting", "Potassium", "Energy"],
            best_time: "Pre or Intra-workout",
            details: "The ultimate pre-workout snack. Provides immediate energy and easy to digest.", 
            unit: "per 100g" 
        },
        { 
            name: "Blueberries", category: "fruits", base_calories: 57, goal: "loss", 
            benefit: "Packed with antioxidants to fight workout oxidative stress.", 
            smart_tags: ["Antioxidants", "Vitamins", "Low Sugar"],
            best_time: "Breakfast or Post-workout",
            details: "Low in sugar, high in fiber and vitamin C. Excellent for smoothies.", 
            unit: "per 100g" 
        },
        { 
            name: "Avocado", category: "healthy", base_calories: 160, goal: "gain", 
            benefit: "Calorie-dense healthy fats for hormone optimization.", 
            smart_tags: ["Healthy Fats", "Hormone Health"],
            best_time: "Lunch or Dinner",
            details: "Loaded with monounsaturated fats and potassium. Perfect for adding clean calories.", 
            unit: "per 100g" 
        },
        { 
            name: "Broccoli", category: "fruits", base_calories: 34, goal: "loss", 
            benefit: "High volume, low calorie naturally occurring DIM.", 
            smart_tags: ["High Volume", "Micronutrients"],
            best_time: "Dinner",
            details: "Extremely filling. Contains compounds that may help balance estrogen metabolism.", 
            unit: "per 100g" 
        },
        { 
            name: "Spinach", category: "fruits", base_calories: 23, goal: "loss", 
            benefit: "Rich in nitrates which can improve muscle efficiency.", 
            smart_tags: ["Iron", "Nitrates", "Low Calorie"],
            best_time: "Anytime",
            details: "Incredibly nutrient dense. Iron, magnesium, and vitamins with almost zero calories.", 
            unit: "per 100g" 
        },
        { 
            name: "Apple", category: "fruits", base_calories: 52, goal: "loss", 
            benefit: "High in pectin fiber, keeping you full for hours.", 
            smart_tags: ["Satiety", "Fiber"],
            best_time: "Snack / Pre-workout",
            details: "Great pre-workout energy. The skin contains crucial antioxidants.", 
            unit: "per 100g" 
        },
        { 
            name: "Salad Greens", category: "fruits", base_calories: 15, goal: "loss", 
            benefit: "Maximum volume for minimal calories to stay full.", 
            smart_tags: ["High Volume", "Weight Loss"],
            best_time: "Lunch or Dinner",
            details: "Highly versatile. Watch out for dressing calories!", 
            unit: "per cup", 
            variations: [{type: "Plain Greens", cal: 15}, {type: "With Vinaigrette", cal: 80}, {type: "Caesar Salad", cal: 220}] 
        },

        // HEALTHY FATS / MISC
        { 
            name: "Milk", category: "protein", base_calories: 60, goal: "both", 
            benefit: "Great hydration and combination of fast and slow proteins.", 
            smart_tags: ["Hydration", "Calcium", "Protein"],
            best_time: "Breakfast or Post-workout",
            details: "Contains whey and casein protein. Whole milk is great for mass building.", 
            unit: "per 100ml", 
            variations: [{type: "Skim / Non-fat", cal: 35}, {type: "Whole (3.25%)", cal: 61}, {type: "Almond Milk (Unsweetened)", cal: 15}] 
        },
        { 
            name: "Almonds", category: "healthy", base_calories: 579, goal: "gain", 
            benefit: "Calorie dense, packed with Vitamin E and healthy fats.", 
            smart_tags: ["Calorie Dense", "Vitamin E"],
            best_time: "Snack",
            warning: "High calorie density - portion control is key if you are not bulking.",
            details: "A handful provides significant clean calories. Excellent snack for hard gainers.", 
            unit: "per 100g" 
        },
        { 
            name: "Peanut Butter", category: "healthy", base_calories: 588, goal: "gain", 
            benefit: "Delicious, dense calories for easy mass gain.", 
            smart_tags: ["Mass Builder", "Satiety"],
            best_time: "Breakfast or Snack",
            warning: "Extremely calorie dense; stick to 1-2 tablespoons per serving.",
            details: "Stick to natural varieties. Mixes well into oats and protein shakes for bulking.", 
            unit: "per 100g" 
        },
        { 
            name: "Olive Oil", category: "healthy", base_calories: 884, goal: "gain", 
            benefit: "Heart-healthy monounsaturated fats.", 
            smart_tags: ["Liquid Calories", "Heart Health"],
            best_time: "With Meals",
            warning: "Most calorie dense food item. Measure accurately.",
            details: "Easy way to add clean calories to salads or cooked veggies when bulking.", 
            unit: "per 100ml" 
        },
        { 
            name: "Chia Seeds", category: "healthy", base_calories: 486, goal: "both", 
            benefit: "High in Omega-3s and expands for lasting fullness.", 
            smart_tags: ["Omega-3", "Fiber", "Hydration"],
            best_time: "Morning",
            details: "Great for hydration and sustained energy. Mix into yogurt or make chia pudding.", 
            unit: "per 100g" 
        },
        { 
            name: "Dark Chocolate", category: "healthy", base_calories: 598, goal: "gain", 
            benefit: "Rich in antioxidants and improves blood flow.", 
            smart_tags: ["Antioxidants", "Energy", "Mood"],
            best_time: "Pre-workout (Small amount)",
            warning: "High in fat and calories. Stick to 1-2 small squares.",
            details: "A healthy way to fulfill craving and add dense calories with magnesium.", 
            unit: "per 100g" 
        }
    ].map(f => ({ ...f, image: `https://images.unsplash.com/photo-${getFoodImgId(f.name.toLowerCase())}?auto=format&fit=crop&w=400&q=80` }));

    // Helper to get consistent but relevant images from unsplash based on common food names
    function getFoodImgId(name) {
        if(name.includes('chicken')) return '1632778144458-bf88d19808d7';
        if(name.includes('egg')) return '1518492104633-c3ed9e75466a';
        if(name.includes('salmon')) return '1499125562588-29fb8a56b5d5';
        if(name.includes('yogurt')) return '1488477026958-9853962b9319';
        if(name.includes('beef')) return '1551028150-64b9f398f678';
        if(name.includes('tofu')) return '1546069901-ba9599a7e63c';
        if(name.includes('cheese')) return '1486297678162-ad2b19b664de';
        if(name.includes('tuna')) return '1504674900247-0877df9cc836';
        if(name.includes('protein')) return '1593095948071-474c5cc2989d';
        if(name.includes('turkey')) return '1511261314352-0941544a86b1';
        if(name.includes('rice')) return '1512058560366-cd2429598aee';
        if(name.includes('potato')) return '1518977676601-b53f82aba655';
        if(name.includes('oatmeal') || name.includes('oat')) return '1501707315855-3837889e4745';
        if(name.includes('quinoa')) return '1515942400420-2b9c3e59f29f';
        if(name.includes('pasta')) return '1473093226795-af9932fe5856';
        if(name.includes('bread')) return '1509440159596-0249088772ff';
        if(name.includes('banana')) return '1571771894821-ad9b588646b7';
        if(name.includes('blueberry')) return '1497534446932-c94c44f66a33';
        if(name.includes('avocado')) return '1523049197027-0477020bc33d';
        if(name.includes('broccoli')) return '1452948491414-729864273df3';
        if(name.includes('spinach')) return '1540420773420-3366772fec0a';
        if(name.includes('apple')) return '1560806887-1e4cd316bd6b';
        if(name.includes('salad')) return '1512621776951-a57141f2eefd';
        if(name.includes('milk')) return '1517315003714-a10c7104b901';
        if(name.includes('almond')) return '1511221370220-4107147cfd72';
        if(name.includes('peanut')) return '1590429780004-9eb431d102e3';
        if(name.includes('oil')) return '1475332432029-ea3265b4c1aa';
        if(name.includes('seed')) return '1523315844889-13e0051187d9';
        return '1546069901-e6d1949195b2';
    }

    const grid = document.getElementById('foodGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let currentCategory = 'all';
    let currentGoal = null;

    function renderFoods(foods) {
        grid.innerHTML = '';
        if (foods.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-light);">No foods match your specific filters.</div>';
            return;
        }

        foods.forEach((food, index) => {
            const card = document.createElement('div');
            card.className = 'food-card animate-fade-in-up';
            card.style.animationDelay = `${(index % 10) * 0.05}s`;

            let catTag = '', catClass = '';
            if(food.category === 'protein') { catTag = 'Protein'; catClass = 'tag-protein'; }
            if(food.category === 'carbs') { catTag = 'Carbs'; catClass = 'tag-carbs'; }
            if(food.category === 'fruits') { catTag = 'Fruits/Veg'; catClass = 'tag-fruits'; }
            if(food.category === 'healthy') { catTag = 'Healthy Fat'; catClass = 'tag-healthy'; }

            let goalHtml = '';
            if (food.goal === 'loss') goalHtml = `<span class="goal-tag" style="color:var(--success); border-color:var(--success)"><i class="fa-solid fa-arrow-trend-down"></i> Wt. Loss</span>`;
            else if (food.goal === 'gain') goalHtml = `<span class="goal-tag" style="color:var(--danger); border-color:var(--danger)"><i class="fa-solid fa-arrow-trend-up"></i> Mass Gain</span>`;
            else goalHtml = `<span class="goal-tag" style="color:var(--primary); border-color:var(--primary)"><i class="fa-solid fa-scale-balanced"></i> Versatile</span>`;

            // Smart Tags
            let smartTagsHtml = '';
            if(food.smart_tags) {
                smartTagsHtml = `<div style="margin-bottom: 8px;">` + 
                    food.smart_tags.map(t => `<span style="font-size:0.7rem; padding: 3px 8px; border-radius: 4px; background: rgba(150,150,150,0.1); color: var(--text-light); border: 1px solid rgba(150,150,150,0.2); margin-right: 4px; display: inline-block; margin-bottom: 4px; font-weight: 500;">${t}</span>`).join('') 
                + `</div>`;
            }

            // Extras
            let eatTimeHtml = food.best_time ? `<div style="font-size:0.85rem; color:var(--text-light); margin-top: 8px;"><i class="fa-regular fa-clock" style="margin-right:4px;"></i> <strong>Best time:</strong> ${food.best_time}</div>` : '';
            let warningHtml = food.warning ? `<div style="font-size:0.85rem; color:var(--warning); margin-top: 4px; font-weight: 500;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i> ${food.warning}</div>` : '';

            // Calories rendering
            let caloriesHtml = `<div class="food-calories">${food.base_calories} kcal <span style="font-size:0.8rem; font-weight:normal; color:var(--text-light);">${food.unit}</span></div>`;
            
            if (food.variations && food.variations.length > 0) {
                let varsHtml = food.variations.slice(0, 3).map(v => 
                    `<div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-light); padding: 4px 0; border-bottom: 1px dotted rgba(150,150,150,0.2);">
                        <span>${v.type}</span>
                        <strong style="color:var(--text-dark);">${v.cal} kcal</strong>
                    </div>`
                ).join('');
                if(food.variations.length > 3) varsHtml += `<div style="font-size:0.8rem; color:var(--primary); text-align:right; margin-top:4px;">+ ${food.variations.length - 3} more...</div>`;
                
                caloriesHtml = `
                    <div style="margin-bottom: 12px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px; border: 1px solid rgba(150,150,150,0.1);">
                        <strong style="font-size: 0.85rem; color: var(--text-dark); display:block; margin-bottom: 4px;">Variations (${food.unit}):</strong>
                        ${varsHtml}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="food-img-container">
                    <img src="${food.image}" loading="lazy" alt="${food.name}">
                    <div class="food-category-tag ${catClass}">${catTag}</div>
                </div>
                <div class="food-card-body">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <h3 class="food-name">${food.name}</h3>
                        <div class="food-calories">${food.base_calories} <span style="font-size:0.8rem; font-weight:normal;">kcal</span></div>
                    </div>
                    ${smartTagsHtml}
                    <p class="food-benefit">${food.benefit.substring(0, 60)}...</p>
                    <div class="food-footer">
                        <span class="food-unit">${food.unit}</span>
                        ${goalHtml}
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openModal(food, catTag, catClass, goalHtml, smartTagsHtml, eatTimeHtml, warningHtml));

            grid.appendChild(card);
        });
    }

    function applyFilters() {
        const term = searchInput.value.toLowerCase();
        
        const filtered = foodDatabase.filter(food => {
            const matchSearch = food.name.toLowerCase().includes(term) || food.benefit.toLowerCase().includes(term);
            const matchCategory = currentCategory === 'all' || food.category === currentCategory;
            let matchGoal = true;
            if (currentGoal) {
                if (currentGoal === 'loss' && (food.goal === 'gain')) matchGoal = false;
                if (currentGoal === 'gain' && (food.goal === 'loss')) matchGoal = false;
            }
            return matchSearch && matchCategory && matchGoal;
        });

        renderFoods(filtered);
    }

    searchInput.addEventListener('input', applyFilters);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-category')) {
                document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.getAttribute('data-category');
            } else if (e.target.hasAttribute('data-goal')) {
                const goal = e.target.getAttribute('data-goal');
                if (currentGoal === goal) {
                    currentGoal = null;
                    e.target.classList.remove('active');
                } else {
                    document.querySelectorAll('[data-goal]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    currentGoal = goal;
                }
            }
            applyFilters();
        });
    });

    const modal = document.getElementById('foodModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalBody = document.getElementById('modalBody');

    function openModal(food, catTag, catClass, goalHtml, smartTagsHtml, eatTimeHtml, warningHtml) {
        let calInfo = `<div style="font-size:1.8rem; font-weight:700; color:var(--primary);">${food.base_calories} <span style="font-size:1rem; color:var(--text-light); font-weight:400;">kcal ${food.unit}</span></div>`;
        
        if (food.variations && food.variations.length > 0) {
            let varsList = food.variations.map(v => `
                <div style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom: 1px solid rgba(150,150,150,0.1);">
                    <span style="color:var(--text-dark); font-weight: 500;">${v.type}</span>
                    <strong style="color:var(--primary); font-family: var(--font-heading);">${v.cal} kcal</strong>
                </div>
            `).join('');

            calInfo = `
                <div style="margin-bottom: 15px;">
                    <span style="font-size:0.9rem; color:var(--text-light); text-transform:uppercase; font-weight:600;">Calorie Variations (${food.unit})</span>
                </div>
                <div style="background: rgba(0,0,0,0.02); padding: 5px 15px; border-radius: 8px;">
                    ${varsList}
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div style="display:inline-block; margin-bottom: 20px;" class="food-category-tag ${catClass} position-relative right-0 top-0">${catTag}</div>
            <h2 style="font-size:2rem; font-family:var(--font-heading); margin-bottom:5px;">${food.name}</h2>
            ${smartTagsHtml}
            <div style="display:flex; gap:10px; margin-bottom: 20px;">
                ${goalHtml}
            </div>
            
            <div style="background:var(--bg-color); padding: 20px; border-radius:var(--radius-sm); margin-bottom:20px;">
                ${calInfo}
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom:8px; color:var(--text-dark);">Why it's great:</h4>
                <p style="color:var(--text-light); line-height:1.6;">${food.benefit}</p>
                <div style="margin-top:10px; background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px;">
                    ${eatTimeHtml}
                    ${warningHtml}
                </div>
            </div>

            <div>
                <h4 style="margin-bottom:8px; color:var(--text-dark);">Detailed Insights:</h4>
                <p style="color:var(--text-light); line-height:1.6;">${food.details}</p>
            </div>
            
            <button class="btn btn-outline" style="width:100%; margin-top:30px;" onclick="document.getElementById('foodModal').classList.remove('active')">Close Detail</button>
        `;
        modal.classList.add('active');
    }

    closeModalBtn.addEventListener('click', () => { modal.classList.remove('active'); });
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });

});

