let selectedMealType = '';
let selectedPreferences = new Set();
let currentUserId = localStorage.getItem('user_id') || null;
let recipeData = null; 

// === Meal Button Handling ===
document.querySelectorAll('#meal-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    selectedMealType = button.dataset.meal;
    document.querySelectorAll('#meal-buttons button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// === Preference Button Handling ===
if (document.querySelectorAll('#preference-buttons button').length) {
  document.querySelectorAll('#preference-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      const pref = button.dataset.pref;
      if (selectedPreferences.has(pref)) {
        selectedPreferences.delete(pref);
        button.classList.remove('active');
      } else {
        selectedPreferences.add(pref);
        button.classList.add('active');
      }
    });
  });
}

// === Handle Recipe Generation ===
if (document.getElementById('chatForm')) {
  document.getElementById('chatForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const userInput = event.target.userInput.value;
    const responseContainer = document.getElementById('response');

    let contextSummary = userInput;
    if (selectedMealType) contextSummary += `, ${selectedMealType}`;
    if (selectedPreferences.size > 0) {
      contextSummary += `, ${Array.from(selectedPreferences).join(', ')}`;
    }

    responseContainer.innerHTML = `<p><strong>You said:</strong> ${contextSummary}</p>`;
    responseContainer.innerHTML += `<p id="loading-msg"><em>Cooking up something tasty just for you...</em></p>`;

    let finalIngredients = userInput;
    if (selectedMealType) {
      finalIngredients += `. The user is looking for a recipe for ${selectedMealType}.`;
    }
    if (selectedPreferences.size > 0) {
      const prefs = Array.from(selectedPreferences).join(', ');
      finalIngredients += ` The user prefers a recipe that is: ${prefs}.`;
    }

    try {
      // --- Recipe Request ---
      const recipeRes = await fetch('https://ai-recipe-backend-15no.onrender.com/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: finalIngredients })
      });

      recipeData = await recipeRes.json(); // store globally to access later
      console.log('Recipe response:', recipeData);

      if (recipeData.recipe) {
        responseContainer.innerHTML += `
          <p><strong>AI Recommender (Recipe) 📝:</strong><br>${recipeData.recipe.replace(/\n/g, '<br>')}</p>
          <button id="saveRecipeBtn">💾 Save this Recipe</button>
        `;
      } else {
        responseContainer.innerHTML += `<p><strong>Recipe Error:</strong> ${recipeData.error || 'Unknown error.'}</p>`;
      }

      // --- Song Request ---
      const songRes = await fetch('https://ai-recipe-backend-15no.onrender.com/api/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: recipeData.recipe })  
      });
      

      const songData = await songRes.json();
      console.log('Song response:', songData);

      if (songData.song) {
        responseContainer.innerHTML += `<p><strong>AI Recommender (Song Pairing) 🎵:</strong><br>${songData.song}</p>`;
      } else {
        responseContainer.innerHTML += `<p><strong>Song Error:</strong> ${songData.error || 'Unknown error.'}</p>`;
      }

      const loadingMsg = document.getElementById('loading-msg');
      if (loadingMsg) loadingMsg.remove();

      const signupInvite = document.getElementById('signup-invite');
      if (signupInvite) signupInvite.style.display = 'block'; 

    } catch (err) {
      console.error('Request failed:', err);
      responseContainer.innerHTML += `<p><strong>Error:</strong> Failed to connect to the server.</p>`;
    }

    event.target.reset();
    selectedMealType = '';
    selectedPreferences.clear();
    document.querySelectorAll('button.active').forEach(btn => btn.classList.remove('active'));
  });
}

document.addEventListener('click', async function(event) {
  if (event.target && event.target.id === 'saveRecipeBtn') {
    if (!recipeData || !recipeData.recipe) return;

    
    if (!currentUserId) {
      alert('⚠️ You must be logged in to save recipes.');
      return;
    }

    const lines = recipeData.recipe.split('\n');
    const title = lines[0].slice(0, 50); 
    const steps = lines.slice(1);
    const ingredients = []; 

    const payload = {
      user_id: currentUserId,
      title,
      recipe_json: {
        ingredients,
        steps
      }
    };

    try {
      const res = await fetch('https://init-db-082r.onrender.com/favorite/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Save failed:', errorText);
        alert(`❌ Save failed: ${errorText}`);
        return;
      }

      const result = await res.json();
      console.log('Recipe saved:', result);
      alert('✅ Recipe saved to favorites!');
    } catch (err) {
      console.error('Failed to save recipe:', err);
      alert('❌ Failed to save recipe.');
    }
  }
});

// === Handle Logout ===
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html'; // redirect to login page
  });
}

// === Display Welcome Message ===
const welcomeMsg = document.getElementById('welcome-msg');
const email = localStorage.getItem('email');
if (welcomeMsg && email) {
  welcomeMsg.textContent = `Logged in as: ${email}`;
}


// === Create Account (Part 1) ===
const createAccountBtn = document.querySelectorAll('button.secondary')[0];
if (createAccountBtn) {
  createAccountBtn.addEventListener('click', async () => {
    const email = document.querySelector('[name="username"]').value;
    const password = document.querySelector('[name="password"]').value;

    try {
      const res = await fetch('https://init-db-082r.onrender.com/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('User created:', data);
      alert('🎉 Account created successfully!');
      // currentUserId = data.id
    } catch (err) {
      console.error('Account creation failed:', err);
      alert('⚠️ Failed to create account.');
    }
  });
}
