// Add to your JS file (after existing scroll listeners)
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    // Simple client-side validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }

    // Replace with your backend endpoint or service
    fetch('https://api.example.com/contact-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            message,
            timestamp: new Date().toISOString()
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            document.getElementById('status-message').textContent = 'Message sent successfully!';
            this.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('status-message').textContent =
                'There was an issue sending your message. Please try again later.';
        });
});
