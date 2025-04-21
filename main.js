let selectedMealType = '';
let selectedPreferences = new Set();

document.querySelectorAll('#meal-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    selectedMealType = button.dataset.meal;
    document.querySelectorAll('#meal-buttons button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

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

document.getElementById('chatForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const userInput = event.target.userInput.value;
  const responseContainer = document.getElementById('response');

  // add what the user said

  let contextSummary = userInput;

  if (selectedMealType) {
    contextSummary += `, ${selectedMealType}`;
  }

  if (selectedPreferences.size > 0) {
    contextSummary += `, ${Array.from(selectedPreferences).join(', ')}`;
  }

  responseContainer.innerHTML = `<p><strong>You said:</strong> ${contextSummary}</p>`;

  // end of add what the user said
  responseContainer.innerHTML += `<p id="loading-msg"><em>Loading recipe and song recommendation...</em></p>`;

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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredients: finalIngredients })
    });

    const recipeData = await recipeRes.json();
    console.log('Recipe response:', recipeData);

    if (recipeData.recipe) {
      responseContainer.innerHTML += `<p><strong>AI Recommender (Recipe):</strong><br>${recipeData.recipe.replace(/\n/g, '<br>')}</p>`;
    } else {
      responseContainer.innerHTML += `<p><strong>Recipe Error:</strong> ${recipeData.error || 'Unknown error.'}</p>`;
    }

    // --- Song Request ---
    const songRes = await fetch('https://ai-recipe-backend-15no.onrender.com/api/song', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredients: userInput })  // Only pass raw ingredients
    });

    const songData = await songRes.json();
    console.log('Song response:', songData);

    if (songData.song) {
      responseContainer.innerHTML += `<p><strong>AI Recommender (Song Pairing):</strong><br>${songData.song}</p>`;
    } else {
      responseContainer.innerHTML += `<p><strong>Song Error:</strong> ${songData.error || 'Unknown error.'}</p>`;
    }

    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.remove();

  } catch (err) {
    console.error('Request failed:', err);
    responseContainer.innerHTML += `<p><strong>Error:</strong> Failed to connect to the server.</p>`;
  }

  event.target.reset();
  selectedMealType = '';
  selectedPreferences.clear();

  //remove all selected bttons on submission
  document.querySelectorAll('button.active').forEach(btn => btn.classList.remove('active'));
});
