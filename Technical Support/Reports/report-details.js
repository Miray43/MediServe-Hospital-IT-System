// 🔙 زر الرجوع
function goBack() {
  window.history.back();
}

let reportData = null;


document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".save-btn");
  const editBtn = document.querySelector(".edit-btn"); // ✅ حل المشكلة

  const reportId = new URLSearchParams(window.location.search).get("id");
  const reportType = new URLSearchParams(window.location.search).get("type");

  if (!reportId) return alert("No report ID provided");

  fetch(`http://localhost:5050/report/${reportId}?type=${reportType}`)
    .then(res => res.json())
    .then(report => {
      reportData = report;
      const isExternal = report.source === "external";

      if (reportType === "new") {
        document.getElementById("report-title").textContent = `New Maintenance Report #${report.id}`;
        document.getElementById("report-id").textContent = `NMR-${report.id}`;
        document.getElementById("priority").textContent = report.priority || "Medium";
        document.getElementById("device-type").textContent = report.device_type || "";
        document.getElementById("assigned-to").textContent = "";
        document.getElementById("department").textContent = "";
        document.getElementById("category").textContent = "New";
        document.getElementById("report-status").textContent = report.status || "Open";
        document.getElementById("submitted-date").textContent = `Submitted on ${new Date(report.created_at).toLocaleString()}`;
        document.getElementById("description").textContent = report.description || "No description.";
        document.getElementById("note").innerHTML = `<strong>Note:</strong><br>${report.details || "No notes."}`;

        const specsContainer = document.getElementById("device-specs");
        specsContainer.innerHTML = "";
        if (report.device_type) {
          const specsContainer = document.getElementById("device-specs");
          specsContainer.innerHTML = "";
          
          const deviceType = report.device_type?.trim()?.toLowerCase() || "";
          
          const fields = [
            { label: "🔘 Device Name:", value: report.device_name, alwaysShow: true },
            { label: "🔑 Serial Number:", value: report.serial_number, alwaysShow: true },
            { label: "🏛️ Ministry Number:", value: report.governmental_number, alwaysShow: true },
            { label: "🧠 CPU:", value: report.cpu_name, showForPC: true },
            { label: "💾 RAM:", value: report.ram_type, showForPC: true },
            { label: "🖥️ OS:", value: report.os_name, showForPC: true },
            { label: "📶 Generation:", value: report.generation_number, showForPC: true },
            { label: "🔧 Model:", value: report.model_name, alwaysShow: true },
            { label: "📟 Device Type:", value: report.device_type }
          ];
          
          fields.forEach(({ label, value, showForPC, alwaysShow }) => {
            const shouldShow =
              alwaysShow || (showForPC && deviceType === "pc") || !!value;
          
            if (shouldShow) {
              const div = document.createElement("div");
              div.className = "spec-box";
              div.textContent = `${label} ${value || ""}`;
              specsContainer.appendChild(div);
            }
          });
          
          
          
        }

        if (report.signature_path) {
          const sigImg = document.createElement("img");
          sigImg.src = `http://localhost:5050/${report.signature_path}`;
          sigImg.alt = "Signature";
          sigImg.style = "margin-top: 10px; max-width: 200px; border: 1px solid #ccc";
          specsContainer.appendChild(sigImg);
        }
        if (report.attachment_name && report.attachment_path) {
          const attachmentSection = document.getElementById("attachment-section");
          const attachmentLink = document.createElement("a");
          attachmentLink.href = `http://localhost:5050/uploads/${report.attachment_path}`; // ✅ التصحيح هنا
          attachmentLink.textContent = `📎 ${report.attachment_name}`;
          attachmentLink.download = report.attachment_name;
          attachmentLink.style = "display: inline-block; margin-top: 10px; color: #007bff; text-decoration: underline;";
          attachmentSection.appendChild(attachmentLink); // ✅ يوديه لمكانه الصحيح
        }
        
        
        
        return;
      }

      // داخلية أو خارجية
      const isInternalTicket = report.maintenance_type === "Internal";
      let ticketNumber = report.ticket_number?.trim();

// محاولة استخراج رقم التذكرة من الوصف أو الملخص حتى لو بصيغة مختلفة
if (!ticketNumber) {
  const fullText = `${report.full_description || ""} ${report.issue_summary || ""}`;
  const match = fullText.match(/(?:Ticket Number:|Ticket\s+\()? *(TIC-\d+|INT-\d{8}-\d{3})/i);
  if (match) {
    ticketNumber = match[1].trim();
    console.log("📌 Extracted ticket number:", ticketNumber);
  } else {
    console.warn("⚠️ No ticket number found in report");
  }
}

      
      
      let titlePrefix = "Maintenance";
      if (report.maintenance_type === "Regular") titlePrefix = "Regular Maintenance";
      else if (report.maintenance_type === "General") titlePrefix = "General Maintenance";
      else if (report.maintenance_type === "Internal") titlePrefix = "Internal Ticket";
      else if (report.maintenance_type === "External") titlePrefix = "External Maintenance";
      
      const reportTitle = ticketNumber
        ? `${titlePrefix} #${ticketNumber}`
        : `${titlePrefix} #${report.report_number || report.id}`;
      
      document.getElementById("report-title").textContent = reportTitle;
      
      
      document.getElementById("report-id").textContent =
        report.report_number || report.request_number || `MR-${report.id}`;
      document.getElementById("priority").textContent = isExternal ? "" : (report.priority || "");
      document.getElementById("device-type").textContent = report.device_type || "";
      document.getElementById("assigned-to").textContent = isExternal
        ? (report.reporter_name || "")
        : (report.technical || "");
      document.getElementById("department").textContent = report.department_name || "";
      document.getElementById("category").textContent = isExternal ? "External" : (report.report_type || "");
      document.getElementById("report-status").textContent = report.status || "Pending";
      document.getElementById("submitted-date").textContent = `Submitted on ${new Date(report.created_at).toLocaleString()}`;
      document.getElementById("description").textContent =
        report.issue_summary || report.initial_diagnosis || "No description.";
      document.getElementById("note").innerHTML = `
        <strong>${isExternal ? "Final Diagnosis" : "Technical Team Note"}:</strong><br>
        ${report.full_description || report.final_diagnosis || "No notes."}
      `;

      const specs = [];
      if (report.device_name) specs.push(`🔘 Device Name: ${report.device_name}`);
      if (report.serial_number) specs.push(`🔑 Serial Number: ${report.serial_number}`);
      if (report.governmental_number) specs.push(`🏛️ Ministry Number: ${report.governmental_number}`);
      if (report.cpu_name) specs.push(`🧠 CPU: ${report.cpu_name}`);
      if (report.ram_type) specs.push(`💾 RAM: ${report.ram_type}`);
      if (report.os_name) specs.push(`🖥️ OS: ${report.os_name}`);
      if (report.generation_number) specs.push(`📶 Generation: ${report.generation_number}`);
      if (report.model_name) specs.push(`🔧 Model: ${report.model_name}`);

      

      const specsContainer = document.getElementById("device-specs");
      specsContainer.innerHTML = "";
      if (report.device_type) {
        const specsContainer = document.getElementById("device-specs");
        specsContainer.innerHTML = "";
        
        const deviceType = report.device_type?.trim()?.toLowerCase() || "";
        
        const fields = [
          { label: "🔘 Device Name:", value: report.device_name, alwaysShow: true },
          { label: "🔑 Serial Number:", value: report.serial_number, alwaysShow: true },
          { label: "🏛️ Ministry Number:", value: report.governmental_number, alwaysShow: true },
          { label: "🧠 CPU:", value: report.cpu_name, showForPC: true },
          { label: "💾 RAM:", value: report.ram_type, showForPC: true },
          { label: "🖥️ OS:", value: report.os_name, showForPC: true },
          { label: "📶 Generation:", value: report.generation_number, showForPC: true },
          { label: "🔧 Model:", value: report.model_name, alwaysShow: true },
          { label: "📟 Device Type:", value: report.device_type }
        ];
        
        fields.forEach(({ label, value, showForPC, alwaysShow }) => {
          const shouldShow =
            alwaysShow || (showForPC && deviceType === "pc") || !!value;
        
          if (shouldShow) {
            const div = document.createElement("div");
            div.className = "spec-box";
            div.textContent = `${label} ${value || ""}`;
            specsContainer.appendChild(div);
          }
        });
      }
      

 
    })
    .catch(err => {
      console.error("❌ Error fetching report:", err);
      alert("Failed to load report data.");
    });

  // ⬇️ تحميل PDF
  document.querySelector(".download-btn")?.addEventListener("click", () => {
    document.getElementById("pdf-options-modal").style.display = "block";
  });

  document.getElementById("generate-pdf-btn")?.addEventListener("click", async () => {
  document.getElementById("pdf-options-modal").style.display = "none";

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4", true);
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;

  // التحقق من التحديد
  const showPriority = document.getElementById("opt-priority").checked;
  const showDeviceType = document.getElementById("opt-device-type").checked;
  const showDescription = document.getElementById("opt-description").checked;
  const showNote = document.getElementById("opt-note").checked;
  const showSignature = document.getElementById("opt-signature").checked;
  const showAttachment = document.getElementById("opt-attachment").checked;
  const showSpecs = document.getElementById("opt-specs").checked;

  // رأس التقرير
  doc.setFillColor(0, 90, 156);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.addImage("/icon/MS Logo.png", "PNG", 3, 8, 25, 12);
  doc.addImage("/icon/hospital-logo.png", "PNG", pageWidth - 35, 8, 25, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(16);
  let reportTitle = document.getElementById("report-title")?.textContent || "Maintenance Report";
  reportTitle = reportTitle.split("#")[0].trim();
  doc.text(`Report: ${reportTitle}`, pageWidth / 2, 20, { align: "center" });

  // محتوى التقرير
  doc.setTextColor(0, 0, 0).setFontSize(12);
  const attachmentName = reportData?.attachment_name || null;
  const attachmentUrl = reportData?.attachment_path ? `http://localhost:5050/uploads/${reportData.attachment_path}` : null;

  [
    ["Report ID", document.getElementById("report-id")?.textContent],
    showPriority && ["Priority", document.getElementById("priority")?.textContent],
    showDeviceType && ["Device Type", document.getElementById("device-type")?.textContent],
    ["Assigned To", document.getElementById("assigned-to")?.textContent],
    ["Department", document.getElementById("department")?.textContent],
    ["Category", document.getElementById("category")?.textContent]
  ].filter(Boolean).forEach(([label, value]) => {
    doc.text(`${label}:`, 15, y);
    doc.text(value || "", 60, y);
    y += 8;
  });

  if (showAttachment && attachmentName && attachmentUrl) {
    doc.text("Attachment:", 15, y);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(attachmentName, 60, y, { url: attachmentUrl });
    doc.setTextColor(0, 0, 0);
    y += 8;
  }

  if (showDescription) {
    y += 5;
    doc.setFont("helvetica", "bold").text("Description:", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(document.getElementById("description")?.innerText || "", pageWidth - 30);
    doc.text(lines, 15, y);
    y += lines.length * 6 + 5;
  }

  if (showNote) {
    doc.setFont("helvetica", "bold").text("Technical Notes:", 15, y);
    y += 6;
    const lines = doc.splitTextToSize(document.getElementById("note")?.textContent?.replace(/^.*?:\s*/, "") || "", pageWidth - 30);
    doc.setFont("helvetica", "normal").text(lines, 15, y);
    y += lines.length * 6 + 5;
  }

  if (showSpecs) {
    doc.setFont("helvetica", "bold").text("Device Specifications:", 15, y);
    y += 6;
    const specs = Array.from(document.querySelectorAll("#device-specs .spec-box"))
      .map(el => el.innerText.replace(/[^\w\s:.-]/g, "").trim());
    specs.forEach(spec => {
      const lines = doc.splitTextToSize(spec, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * 6 + 2;
    });
  }

  y = Math.max(y + 20, 240);
  doc.setFont("helvetica", "bold").text("Signature:", 20, y);
  if (showSignature && reportData?.signature_path) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `http://localhost:5050/${reportData.signature_path}`;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const url = canvas.toDataURL("image/png");
      doc.addImage(url, "PNG", 15, y + 5, 50, 25);
    } catch (e) {
      console.warn("⚠️ Signature not loaded", e);
    }
  }

  const [typeOnly, ticketPart] = reportTitle.split("#").map(p => p.trim());
  const fileName = ticketPart ? `${typeOnly} - ${ticketPart}` : typeOnly;
  doc.save(`${fileName}.pdf`);
});

  // تفعيل التعديل
  document.querySelector(".edit-btn")?.addEventListener("click", () => {
    const editableEls = document.querySelectorAll("#report-id, #priority, #device-type, #assigned-to, #department, #category, .description, .note, .spec-box");
    
    editableEls.forEach(el => {
      el.setAttribute("contenteditable", "true");
      el.style.border = "1px dashed #aaa";
      el.style.backgroundColor = "#fdfdfd";
      el.style.padding = "4px";
      el.style.display = "inline-block";
      el.style.minHeight = "20px";
    });
  
    // 👇 عرض مدخل رفع المرفق
    document.getElementById("attachment-input").style.display = "block";
  
    saveBtn.style.display = "inline-block";
    document.querySelector(".edit-btn").style.display = "none";
    alert("📝 Edit mode is ON");
  });
  
  
  

  // حفظ التعديلات
  saveBtn?.addEventListener("click", async () => {
    const updatedData = {
      id: reportData.id,
      issue_summary: document.getElementById("description")?.innerText.trim() || "",
      full_description: document.getElementById("note")?.innerText.replace(/^(.*?:)?\s*/, "").trim() || "",
      priority: document.getElementById("priority")?.innerText.trim(),
      status: document.getElementById("report-status")?.innerText.trim(),
      device_type: document.getElementById("device-type")?.innerText.trim(),
      technical: document.getElementById("assigned-to")?.innerText.trim(),
      department_name: document.getElementById("department")?.innerText.trim(),
      category: document.getElementById("category")?.innerText.trim() === "" ? null : document.getElementById("category")?.innerText.trim(),
      source: reportData.source || reportType, // ✅ أضف هذا السطر

      device_name: null,
      serial_number: null,
      governmental_number: null,
      cpu_name: null,
      ram_type: null,
      os_name: null,
      generation_number: null,
      model_name: null
    };
  
    // مواصفات الجهاز
    document.querySelectorAll("#device-specs .spec-box").forEach(box => {
      const [rawLabel, value] = box.textContent.split(":").map(str => str.trim());
      const label = rawLabel.replace(/[^\w\s]/gi, "").trim(); // 🔥 يشيل الإيموجي والرموز
            switch (label) {
        case " Device Name": updatedData.device_name = value; break;
        case " Serial Number": updatedData.serial_number = value; break;
        case " Ministry Number": updatedData.governmental_number = value; break;
        case " CPU": updatedData.cpu_name = value; break;
        case " RAM": updatedData.ram_type = value; break;
        case " OS": updatedData.os_name = value; break;
        case " Generation": updatedData.generation_number = value; break;
        case " Model": updatedData.model_name = value; break;
      }
    });
    const fileInput = document.getElementById("attachment-input");
    const file = fileInput.files[0];
    
    const formData = new FormData();
    formData.append("data", JSON.stringify(updatedData));
    
    if (file) {
      formData.append("attachment", file);
    }
    
    try {
      const res = await fetch("http://localhost:5050/update-report-full", {
        method: "POST",
        body: formData
      });
    
      const result = await res.json();
      if (result.message) {
        alert("✅ All changes saved successfully.");
      } else {
        throw new Error("❌ Update failed on server.");
      }
    } catch (err) {
      console.error("❌ Error during update:", err);
      alert("❌ Failed to save changes.");
    }
    
    // تعطيل التحرير
    const editableElements = document.querySelectorAll(".grid div, .description, .note, h2");
    editableElements.forEach(el => {
      el.removeAttribute("contenteditable");
      el.style.border = "none";
      el.style.backgroundColor = "transparent";
      el.style.padding = "0";
    });
  
    saveBtn.style.display = "none";
    editBtn.style.display = "inline-block";
  });
  

  // إغلاق
  document.querySelector(".close-btn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to close this report?")) {
      window.location.href = "Search Reports.html";
    }
  });
});
