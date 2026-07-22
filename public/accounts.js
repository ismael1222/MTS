function save(saveButton, booruName) {
    if (!saveButton) {
        return;
    }
    const wasClicked = saveButton.getAttribute('clicked') === 'true';
    saveButton.setAttribute('clicked', !wasClicked);
    if (!wasClicked) return; //1nd click for confirmation

    const parentElement = saveButton.parentElement;
    const inputs = parentElement.querySelectorAll("input");
    const username = inputs[0].value;
    const key = inputs[1].value;

    if (!key || !username) {
        return alert("Cannot delete credentials. To do so, delete the entry on data/accounts.json");
    }

    const confirmation = confirm("Save credentials?");
    if (!confirmation) return;

    fetch('/api/saveCredentials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            key: key,
            booru: booruName
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response
        })
        .then(data => {
            alert('Credentials saved successfully!');
            window.location.href = window.location.href
        })
        .catch(error => {
            console.error('Error saving credentials:', error);
            alert('Failed to save credentials. See console for details.');
        });
}