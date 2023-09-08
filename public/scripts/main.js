const form = document.getElementById('upload-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // prevent default form submission behavior

    const formData = new FormData(form);
    const response = await fetch('/', {
        method: 'POST',
        body: formData
    });

    const json = await response.json();
    console.log(JSON.stringify(json));
});