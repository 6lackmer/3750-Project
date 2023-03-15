var dropdownOpen = false;

const dropdownButton = document.getElementById("nav-dropdown-button");
const dropdown = document.getElementById("nav-dropdown");

dropdownButton.addEventListener('click', (event) => {
    dropdown.classList.toggle('hidden');
    dropdownOpen = !dropdownOpen;
});

document.body.addEventListener('click', (event) => {
    if (dropdownOpen && event.target !== dropdownButton) {
        dropdown.classList.toggle('hidden');
        dropdownOpen = !dropdownOpen;
    }
});