// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  
    // 🔁 Back button: navigates to the previous page
    const backButton = document.querySelector(".back-button");
    backButton?.addEventListener("click", () => window.history.back());
  
    // 🔁 Home buttons: redirect to the homepage (adjust link if needed)
    const homeSelectors = [".home-button", ".photo-label", ".home-section"];
    homeSelectors.forEach((selector) => {
      const el = document.querySelector(selector);
      el?.addEventListener("click", () => {
        window.location.href = "profile.html"; // 🔧 Update this to the correct homepage URL
      });
    });
  


    
    // 🔁 Elements with specific class names that redirect to corresponding pages
    const classBasedLinks = {
      container1: "/Technical Support/Reports/ReportsType2.html",
      container2: "", // 🔧 Placeholder (add link if needed)
      internal_report: "reports_dashboard.html",
      external_report: "reports_dashboard.html",
      new_report: "new_report.html",
      maintenance: "maintenance_dashboard.html",
      report_details: "maintenance_report.html",
    };
  
    // Loop through the class-link pairs and add click event
    Object.entries(classBasedLinks).forEach(([className, link]) => {
      if (!link) return; // Skip if no link provided
      const el = document.querySelector(`.${className}`);
      el?.addEventListener("click", () => {
        window.location.href = link;
      });
    });
  
    // 🔁 Redirect on dropdown selection change
    const selectRoutes = [
      { selector: "#reportType", link: "reports_dashboard.html" },
      { selector: "#deviceType", link: "maintenance_dashboard.html" },
      { selector: "#status", link: "maintenance_report.html" },
    ];
  
    // Loop through select elements and add change event
    selectRoutes.forEach(({ selector, link }) => {
      const selectEl = document.querySelector(selector);
      selectEl?.addEventListener("change", () => {
        window.location.href = link;
      });
    });
  
    // 🔁 Elements with data-href attribute act like clickable cards
    document.querySelectorAll("[data-href]").forEach((el) => {
      el.style.cursor = "pointer"; // Show pointer cursor to indicate clickability
      el.addEventListener("click", () => {
        const target = el.getAttribute("data-href");
        if (target) window.location.href = target;
      });
    });
  });
  
  // Optional: fallback function for goBack (used in inline onclick)
  function goBack() {
    window.history.back();
  }
  
