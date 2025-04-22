document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = event.target.username.value;
    const password = event.target.password.value;
  
    try {
      const res = await fetch('https://ai-recipe-backend-15no.onrender.com/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const contentType = res.headers.get("content-type");
  
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON, got:", text);
        alert("❌ Unexpected response from server.");
        return;
      }
  
      const data = await res.json();
  
      if (res.ok && data.id) {
        localStorage.setItem('user_id', data.id);
        localStorage.setItem('email', data.email);
        window.location.href = 'logged_in_session.html';
      } else {
        alert('❌ Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('⚠️ Unable to connect to the server.');
    }
  });
  