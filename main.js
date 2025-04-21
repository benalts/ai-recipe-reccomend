let selectedMealType = '';

document.querySelectorAll('#meal-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    selectedMealType = button.dataset.meal;
    document.querySelectorAll('#meal-buttons button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

document.getElementById('chatForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const userInput = event.target.userInput.value;
  const responseContainer = document.getElementById('response');

  responseContainer.innerHTML = `<p><strong>You said:</strong> ${userInput}</p>`;
  responseContainer.innerHTML += `<p><em>Loading recipe and song recommendation...</em></p>`;

  let finalIngredients = userInput;
  if (selectedMealType) {
    finalIngredients += `. The user is looking for a recipe for ${selectedMealType}.`;
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

  } catch (err) {
    console.error('Request failed:', err);
    responseContainer.innerHTML += `<p><strong>Error:</strong> Failed to connect to the server.</p>`;
  }

  event.target.reset();
});
