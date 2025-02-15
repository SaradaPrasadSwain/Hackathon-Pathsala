const submitButton = document.getElementById('submitButton');

submitButton.addEventListener('onclick', function(event){
    event.preventDefault();

    window.location.href = '/index.html'
})