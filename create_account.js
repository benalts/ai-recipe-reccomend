document.getElementById('createAccountForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = event.target.email.value;
    const password = event.target.password.value;
    const messageBox = document.getElementById('message');
  
    try {
      const res = await fetch('https://init-db-082r.onrender.com/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        messageBox.textContent = `❌ Failed: ${errorText}`;
        messageBox.style.color = 'red';
        return;
      }
  
      const result = await res.json();
      console.log('Account created:', result);
      messageBox.textContent = `✅ Account created successfully! You can now sign in.`;
      messageBox.style.color = 'green';
  
      // Optional: Redirect back to login after delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
  
    } catch (err) {
      console.error('Error creating account:', err);
      messageBox.textContent = `⚠️ Network error: unable to reach server.`;
      messageBox.style.color = 'red';
    }
  });
  