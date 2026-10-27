/**
 * Function to change the image source when hovering over an option.
 * @param {HTMLElement} element - The parent div containing the image.
 * @param {string} newSrc - The new image source to apply.
 */
function changeImage(element, newSrc) {
  element.querySelector("img").src = newSrc; // Updates the src attribute of the image inside the hovered element
}


// Redirect to the correct maintenance page based on data-page attribute
document.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", function () {
    const page = this.getAttribute("data-page"); // Retrieves the page name from data-page
    if (page) {
      window.location.href = page; // Redirects the user to the selected maintenance page
    }
  });
});

/**
 * Function to navigate back to the previous page.
 * If no previous page is available in history, redirects to the main Maintenance page.
 */
function goBack() {
  if (window.history.length > 1) {
    window.history.back(); // Navigates to the previous page in browser history
  } else {
    window.location.href = "Maintenance.html"; // Redirects to Maintenance home if there's no previous page
  }
}


