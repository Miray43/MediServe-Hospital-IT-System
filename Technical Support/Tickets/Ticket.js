document.addEventListener("DOMContentLoaded", () => {
    // زر الرجوع
    document.querySelector(".back-button").addEventListener("click", () => window.history.back());

    // زر الصفحة الرئيسية
    document.querySelector(".home-button").addEventListener("click", () => window.location.href = "ticket1.html");

    // عند الضغط على Internal Ticket
    document.querySelector(".container1").addEventListener("click", function () {
        alert("Internal Ticket selected");
        this.classList.add("clicked"); // إضافة التأثير
        setTimeout(() => {
            this.classList.remove("clicked");
        }, 300);
 // إزالة التأثير بعد 0.3 ثانية

        // يمكنك إضافة توجيه إلى صفحة أخرى مثل:
         window.location.href = "ticket2.html";
    });

    // عند الضغط على External Ticket
    document.querySelector(".container2").addEventListener("click", function () {
        alert("External Ticket selected");
        this.classList.add("clicked"); // إضافة التأثير
        setTimeout(() => {
            this.classList.remove("clicked");
        }, 300); // إزالة التأثير بعد 0.3 ثانية

        // يمكنك إضافة توجيه إلى صفحة أخرى مثل:
     window.location.href = "ticket3.html";
    });
});