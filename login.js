// login.js
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = event.target.username.value;
    const password = event.target.password.value;
  
    try {
      const res = await fetch('https://init-db-082r.onrender.com/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (res.ok && data.id) {
        // Save user info for use in logged_in_session.html
        localStorage.setItem('user_id', data.id);
        localStorage.setItem('email', data.email);
  
        // Redirect to logged in session
        window.location.href = 'logged_in_session.html';
      } else {
        alert('❌ Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('⚠️ Unable to connect to the server.');
    }
  });
  