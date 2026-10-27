document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page") || 1;

  // ✅ تحميل نوع الجهاز
  const deviceTypeSelect = document.getElementById("filter-device-type");
  if (deviceTypeSelect) {
    fetch("http://localhost:5050/device-types")
      .then(res => res.json())
      .then(deviceTypes => {
        const existing = new Set(["pc", "printer", "scanner"]);
        deviceTypes.forEach(type => {
          type = type.trim();
          if (!existing.has(type.toLowerCase())) {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            deviceTypeSelect.appendChild(opt);
          }
        });
      })
      .catch(err => console.error("❌ Failed to load device types:", err));
  }

  // ✅ تحميل الفلتر من localStorage إذا موجود
  const savedStatus = localStorage.getItem("reportStatusFilter");
  if (savedStatus && document.getElementById("filter-status")) {
    document.getElementById("filter-status").value = savedStatus;
    localStorage.removeItem("reportStatusFilter");
  }

  // ✅ تحميل التقارير
  loadExternalReports(page);

  // أزرار التنقل
  document.querySelector(".new-report-btn")?.addEventListener("click", () => {
    window.location.href = "Newreport.html";
  });

  document.querySelectorAll(".pagination .page-btn[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      if (page) loadExternalReports(page);
    });
  });

  document.getElementById("prev-btn")?.addEventListener("click", () => {
    const currentPage = parseInt(urlParams.get("page") || "1");
    if (currentPage > 1) loadExternalReports(currentPage - 1);
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    const currentPage = parseInt(urlParams.get("page") || "1");
    loadExternalReports(currentPage + 1);
  });

  // ✅ فلترة
  ["filter-type", "filter-status", "search-input", "filter-date-from", "filter-date-to", "filter-device-type"]
    .forEach(id => {
      document.getElementById(id)?.addEventListener("change", () => loadExternalReports(1));
      document.getElementById(id)?.addEventListener("input", () => loadExternalReports(1));
    });
});


function loadExternalReports(page) { 
  const savedStatus = localStorage.getItem("reportStatusFilter");
  const statusSelect = document.getElementById("filter-status");

  if (savedStatus && statusSelect) {
    statusSelect.value = savedStatus;
    localStorage.removeItem("reportStatusFilter");
  }
  fetch(`http://localhost:5050/get-external-reports?page=${page}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("report-list");
      container.innerHTML = "";
      const type = document.getElementById("filter-type")?.value;
      const status = document.getElementById("filter-status")?.value;
      const search = document.getElementById("search-input")?.value.toLowerCase();
      const dateFrom = document.getElementById("filter-date-from")?.value;
      const dateTo = document.getElementById("filter-date-to")?.value;
      const deviceType = document.getElementById("filter-device-type")?.value;

      const filtered = data.filter(report => {
        const createdAt = new Date(report.created_at);
        const isTicket = report.issue_summary?.toLowerCase().includes("ticket created");

        let typeMatch = true;
        if (type === "Ticket") typeMatch = isTicket;
        if (type === "Maintenance") typeMatch = !isTicket && report.source !== "new";
        else if (type === "New") typeMatch = report.source === "new";

        const statusMatch = !status || report.status === status;
        const searchMatch =
          !search ||
          report.device_name?.toLowerCase().includes(search) ||
          report.department_name?.toLowerCase().includes(search) ||
          report.ticket_number?.toLowerCase().includes(search);

        let dateMatch = true;
        if (dateFrom) dateMatch = createdAt >= new Date(dateFrom);
        if (dateTo) dateMatch = dateMatch && createdAt <= new Date(dateTo);

        const deviceMatch = !deviceType || report.device_type?.toLowerCase() === deviceType.toLowerCase();

        return typeMatch && statusMatch && searchMatch && dateMatch && deviceMatch;
      });

      if (!filtered.length) {
        container.innerHTML = "<p>No matching reports found.</p>";
        return;
      }

      filtered.forEach(report => {
        const isNewSimple = report.source === "new"; // ✅ أفضل تحقق لأنه يجي من السيرفر

        const card = document.createElement("div");
        card.className = "report-card";

        const statusClass = getStatusClass(report.status);
        const isTicket = report.issue_summary?.toLowerCase().includes("ticket created");
        if (isNewSimple) {
          card.innerHTML = `
            <div class="report-card-header">
              <span>New Maintenance Report</span>
              <span class="status-label ${getStatusClass(report.status)}">${report.status}</span>
            </div>
            <div class="report-details">
              <span>${formatDateTime(report.created_at)}</span>
            </div>
            <p><strong>Device Type:</strong> ${report.device_type || "N/A"}</p>
            <p><strong>Priority:</strong> ${report.priority || "N/A"}</p>
            <p><strong>Status:</strong> ${report.status}</p>
          `;
      
          container.appendChild(card);
      
          card.addEventListener("click", () => {
            window.location.href = `report-details.html?id=${report.id}&type=new`;
          });
      
          return; // ⛔ لا تكمل
        }
        let issueHtml = "";
        if (!isTicket) {
          let initial = report.issue_summary?.trim();
          let final = report.full_description?.trim();

          issueHtml = `
            <div class="report-issue-line">
              ${initial ? `<span><strong>Initial Diagnosis:</strong> ${initial}</span>` : ""}
              ${final ? `<span><strong>Final Diagnosis:</strong> ${final}</span>` : ""}
            </div>
          `;
        }

        card.innerHTML = `
          <div class="report-card-header">
            <img src="/icon/${isTicket ? "ticket" : "Maintenance"}.png" alt="icon" />
            ${isTicket ? "Ticket - External Maintenance" : "External Maintenance"}
            <select class="status-select ${statusClass}">
              <option value="Open" ${report.status === "Open" ? "selected" : ""}>Open</option>
              <option value="In Progress" ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option value="Closed" ${report.status === "Closed" ? "selected" : ""}>Closed</option>
            </select>
          </div>

          <div class="report-details">
            <img src="/icon/desktop.png" alt="Device Icon" />
            <span>${formatDateTime(report.created_at)}</span>
          </div>

          <p><strong>Ticket Number:</strong> ${report.ticket_number || "N/A"}</p>
          <p><strong>Device:</strong> ${report.device_name || "N/A"}</p>
          <p><strong>Department:</strong> ${report.department_name || "N/A"}</p>
          ${issueHtml}
        `;

        // ✅ منع التنقل للكرت إذا ضغطنا على select أو عناصر مشابهة
        card.addEventListener("click", (e) => {
          if (e.target.closest("select, option")) return;
          window.location.href = `report-details.html?id=${report.id}&type=external`;
        });

        // ✅ تحديث الحالة عند التغيير
        const statusSelect = card.querySelector("select.status-select");
        statusSelect.addEventListener("click", e => e.stopPropagation());
        statusSelect.addEventListener("change", e => {
          e.stopPropagation();
          updateReportStatus(report.id, e.target);
        });

        container.appendChild(card);
      });

      updatePagination(page);
    })
    .catch(err => {
      console.error("❌ Error loading external reports:", err);
      document.getElementById("report-list").innerHTML = "<p>Error loading reports.</p>";
    });
}

function updatePagination(currentPage) {
  const paginationButtons = document.querySelectorAll(".pagination .page-btn");
  paginationButtons.forEach(button => {
    button.classList.remove("active");
    if (button.dataset.page == currentPage) {
      button.classList.add("active");
    }
  });
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusClass(status) {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "closed" || s === "completed") return "completed";
  if (s === "in progress") return "in-progress";
  return "pending";
}

function updateReportStatus(id, selectElement) {
  const newStatus = selectElement.value;
  fetch(`http://localhost:5050/update-external-report-status/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "✅ Status updated successfully");
      selectElement.className = `status-select ${getStatusClass(newStatus)}`;
    })
    .catch(err => {
      console.error("❌ Failed to update external report status:", err);
      alert("❌ Failed to update status");
    });
}
