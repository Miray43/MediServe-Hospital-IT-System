document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 الصفحة تم تحميلها بنجاح!");

    // تأثير تحديد البطاقات عند الضغط
    document.querySelectorAll(".service-box").forEach(service => {
        service.addEventListener("click", function() {
            document.querySelectorAll(".service-box").forEach(s => s.classList.remove("selected"));
            this.classList.add("selected");

            // التنقل إلى الصفحة المحددة في data-url
            const url = this.getAttribute("data-url"); // ✅ تصحيح الخطأ هنا
            if (url) {
                window.location.href = url;
            }
        });
    });

    // تقليل عدد الإشعارات عند الضغط
    let notifBtn = document.getElementById("notif-btn");
    let notifCount = document.getElementById("notif-count");

    if (notifBtn && notifCount) {
        notifBtn.addEventListener("click", function() {
            let count = parseInt(notifCount.textContent) || 0;

            if (count > 0) {
                count--;
                notifCount.textContent = count;

                if (count === 0) {
                    notifCount.style.display = "none";
                }
            }
        });
    }
});
