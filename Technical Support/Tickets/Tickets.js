document.addEventListener("DOMContentLoaded", () => {
    // 🔙 Back button - navigates to the previous page in history
    document.querySelector(".back-button").addEventListener("click", () => window.history.back());

    // 🏠 Home button - redirects to the homepage
    document.querySelector(".home-button").addEventListener("click", () => window.location.href = "index.html");

    // 🧾 When clicking on the Internal Ticket option
    document.querySelector(".container1").addEventListener("click", function () {
        this.classList.add("clicked"); // Add click effect (e.g., animation)

        setTimeout(() => {
            this.classList.remove("clicked"); // Remove effect after 0.3 seconds
        }, 300);

        // Redirect to the internal ticket page
        window.location.href = "Internal ticket.html";
    });

    // 📤 When clicking on the External Ticket option
    document.querySelector(".container2").addEventListener("click", function () {
        this.classList.add("clicked"); // Add click effect (e.g., animation)

        setTimeout(() => {
            this.classList.remove("clicked"); // Remove effect after 0.3 seconds
        }, 300);

        // Redirect to the external ticket page
        window.location.href = "External ticket.html";
    });
});
