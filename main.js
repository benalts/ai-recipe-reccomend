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
  responseContainer.innerHTML += `<p><em>Loading recipe...</em></p>`;

  let finalIngredients = userInput;
  if (selectedMealType) {
    finalIngredients += `. The user is looking for a recipe for ${selectedMealType}.`;
  }

  try {
    const res = await fetch('https://ai-recipe-backend-15no.onrender.com/api/recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredients: finalIngredients })
    });

    const data = await res.json();

    if (data.recipe) {
      responseContainer.innerHTML += `<p><strong>AI Recommender:</strong><br>${data.recipe.replace(/\n/g, '<br>')}</p>`;
    } else {
      responseContainer.innerHTML += `<p><strong>Error:</strong> ${data.error || 'Unknown error.'}</p>`;
    }
  } catch (err) {
    console.error('Request failed:', err);
    responseContainer.innerHTML += `<p><strong>Error:</strong> Failed to connect to the recipe server.</p>`;
  }

  event.target.reset();
});
