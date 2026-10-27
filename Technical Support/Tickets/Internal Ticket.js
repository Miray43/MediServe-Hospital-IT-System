document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("upload-file");
  const fileLabel = document.querySelector(".upload-box");
  const saveButton = document.querySelector(".submit-btn");
  const ticketTypeSelect = document.getElementById("ticket-type");
  const customTypeContainer = document.getElementById("custom-type-container");
  const customTypeInput = document.getElementById("custom-ticket-type");
  const ticketNumberInput = document.getElementById("ticket-number");

  ticketNumberInput.readOnly = true;
  ticketNumberInput.value = "";

  fetch("http://10.99.28.16:5050/ticket-types")
    .then(res => res.json())
    .then(types => {
      ticketTypeSelect.innerHTML = '<option value="" disabled selected>Select ticket type</option>';
      types.forEach(type => {
        const option = document.createElement("option");
        option.value = type.type_name;
        option.textContent = type.type_name;
        ticketTypeSelect.appendChild(option);
      });
      const otherOption = document.createElement("option");
      otherOption.value = "Other";
      otherOption.textContent = "Other";
      ticketTypeSelect.appendChild(otherOption);
    })
    .catch(err => console.error("❌ Error loading ticket types:", err));

  fetch("http://10.99.28.16:5050/report-statuses")
    .then(res => res.json())
    .then(statuses => {
      const statusSelect = document.getElementById("report-status");
      statusSelect.innerHTML = '<option value="" disabled selected>Select report status</option>';
      statuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status.status_name;
        option.textContent = status.status_name;
        statusSelect.appendChild(option);
      });
    })
    .catch(err => console.error("❌ Error loading report statuses:", err));

  ticketTypeSelect.addEventListener("change", () => {
    if (ticketTypeSelect.value === "Other") {
      customTypeContainer.style.display = "block";
    } else {
      customTypeContainer.style.display = "none";
      customTypeInput.value = "";
    }

    fetch("http://10.99.28.16:5050/generate-internal-ticket-number")
      .then(res => res.json())
      .then(data => {
        ticketNumberInput.value = data.ticket_number;
      })
      .catch(err => {
        console.error("❌ Failed to generate ticket number:", err);
        ticketNumberInput.value = "ERROR";
      });
  });

  fileLabel.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    const allowedExtensions = ["pdf", "doc", "docx", "eml"];
    const ext = file?.name?.split(".").pop().toLowerCase();

    if (file && !allowedExtensions.includes(ext)) {
      alert("Invalid file type. Only PDF, DOC, DOCX, and EML are allowed.");
      fileInput.value = "";
      fileLabel.querySelector("p").textContent = "Drop files here or click to upload";
    } else if (file) {
      fileLabel.querySelector("p").textContent = "Selected File: " + file.name;
    }
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach(evt =>
    fileLabel.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
    })
  );

  fileLabel.addEventListener("dragover", () => fileLabel.classList.add("drag-over"));
  ["dragleave", "drop"].forEach(evt =>
    fileLabel.addEventListener(evt, () => fileLabel.classList.remove("drag-over"))
  );

  fileLabel.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event("change"));
  });

  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", e => {
      e.preventDefault();
      window.history.back();
    });
  }

  fetch("http://10.99.28.16:5050/get-all-problems")
    .then(res => res.json())
    .then(data => {
      const diagnosisSelect = document.getElementById("initial-diagnosis");
      diagnosisSelect.innerHTML = '<option disabled selected>Select diagnosis</option>';
      data.forEach(problem => {
        const option = document.createElement("option");
        option.textContent = problem.problem_text;
        diagnosisSelect.appendChild(option);
      });
    })
    .catch(err => console.error("❌ Fetch error:", err));

  saveButton.addEventListener("click", function (event) {
    event.preventDefault();

    const reportNumber = document.querySelector('input[placeholder="Enter report name"]').value.trim();
    const reporterName = document.getElementById("reporter-name")?.value.trim(); // ✅ New
    const initialDiagnosis = document.getElementById("initial-diagnosis").value;
    const reportDetails = document.querySelector('textarea[placeholder="Enter detailed description of the issue"]').value.trim();
    const finalDiagnosis = document.querySelector('textarea[placeholder="Enter final diagnosis after investigation"]').value.trim();
    const otherDescription = document.querySelector('textarea[placeholder="Please provide additional details if \'Other\' is selected"]').value.trim();
    const status = document.getElementById("report-status").value;
    const file = fileInput.files[0];
    const selectedType = ticketTypeSelect.value;
    const ticketType = selectedType === "Other" ? customTypeInput.value.trim() : selectedType;

    if (!ticketType || !initialDiagnosis) {
      alert("Please select ticket type and initial diagnosis.");
      return;
    }

    const formData = new FormData();
    formData.append("report_number", reportNumber);
    formData.append("reporter_name", reporterName || ""); // ✅ New
    formData.append("ticket_type", ticketType);
    formData.append("initial_diagnosis", initialDiagnosis);
    formData.append("report_details", reportDetails);
    formData.append("final_diagnosis", finalDiagnosis);
    formData.append("other_description", otherDescription);
    formData.append("status", status);
    if (file) formData.append("attachment", file);

    fetch("http://10.99.28.16:5050/internal-ticket-with-file", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "✅ Ticket submitted successfully!");
      })
      .catch(err => {
        console.error("❌ Error:", err);
        alert("❌ Failed to submit ticket.");
      });
  });
});

  // Function to open the popup modal with validation and prefill the data from the dropdown
function openPopup(dropdownId, popupTitle) {
  // Get the dropdown (select element) using the provided id
  var selectElement = document.getElementById(dropdownId);
  if (!selectElement) {
      console.error("Dropdown element not found: " + dropdownId);
      return;
  }
  
  // Retrieve the selected value. If the user has not selected any option,
  // the value will be an empty string (because the first option is both disabled and has an empty value)
  var selectedValue = selectElement.value;

  // If no valid option is selected, display an inline error message below the dropdown
  if (!selectedValue) {
      // Check if an error message is already displayed
      var errorMsg = selectElement.parentElement.querySelector('.inline-error');
      if (!errorMsg) {
          errorMsg = document.createElement('span');
          errorMsg.className = 'inline-error';
          errorMsg.innerText = 'You must select from the dropdown.';
          // Append the error message to the dropdown container
          var container = selectElement.closest('.dropdown-container');
          container.appendChild(errorMsg);
          // Remove the error message after 1.5 seconds
          setTimeout(function() {
              errorMsg.remove();
          }, 1500);
      }
      return;
  } else {
      // Remove any inline error message if it exists
      var existingError = selectElement.parentElement.querySelector('.inline-error');
      if (existingError) {
          existingError.remove();
      }

      // Prefill the popup modal with the selected information
      document.getElementById('popup-title').innerText = 'Edit ' + popupTitle;
      var popupFields = document.getElementById('popup-fields');
      // Clear any previous content in the popup form fields section
      popupFields.innerHTML = '';

      // Create a label for the popup input field
      var fieldLabel = document.createElement('label');
      fieldLabel.innerText = popupTitle + ':';

      // Create an input element and prefill it with the selected value
      var fieldInput = document.createElement('input');
      fieldInput.type = 'text';
      fieldInput.value = selectedValue;
      fieldInput.id = dropdownId + '-input';

      // Append the label and input into the popup content area
      popupFields.appendChild(fieldLabel);
      popupFields.appendChild(fieldInput);

      // Display the popup modal with Flex to correctly center the content
      document.getElementById('popup-modal').style.display = 'flex';
  }
}

// Function to close the popup modal
function closePopup() {
  document.getElementById('popup-modal').style.display = 'none';
}

// Function to toggle the display of the search container for the dropdown
function toggleSearch(dropdownId) {
  var searchContainer = document.getElementById('search-container-' + dropdownId);
  if (!searchContainer) return;

  if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
      searchContainer.style.display = 'block';
      var searchInput = document.getElementById('search-' + dropdownId);
      if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
      }
      // Reset dropdown options when search is toggled on
      resetDropdownOptions(dropdownId);
  } else {
      searchContainer.style.display = 'none';
      resetDropdownOptions(dropdownId);
  }
}

// Function to filter the dropdown options based on the input value
function filterDropdown(dropdownId) {
  var searchInput = document.getElementById('search-' + dropdownId);
  var filterValue = searchInput.value.toLowerCase();
  var selectElement = document.getElementById(dropdownId);

  // Execute filtering for each option in the select element
  for (var i = 0; i < selectElement.options.length; i++) {
      var option = selectElement.options[i];
      if (option.text.toLowerCase().indexOf(filterValue) > -1) {
          option.style.display = '';
      } else {
          option.style.display = 'none';
      }
  }
}

// Function to reset the dropdown options to display all options
function resetDropdownOptions(dropdownId) {
  var selectElement = document.getElementById(dropdownId);
  for (var i = 0; i < selectElement.options.length; i++) {
      selectElement.options[i].style.display = '';
  }
}

// Function to delete the selected option from the dropdown
function deleteOption(dropdownId) {
  var selectElement = document.getElementById(dropdownId);
  if (!selectElement) return;

  var selectedValue = selectElement.value;

  if (!selectedValue) {
      var container = selectElement.closest('.dropdown-container');
      if (!container.querySelector('.inline-error')) {
          var errorMsg = document.createElement('span');
          errorMsg.className = 'inline-error';
          errorMsg.innerText = 'You must select from the dropdown.';
          container.appendChild(errorMsg);
          setTimeout(function() {
              errorMsg.remove();
          }, 1500);
      }
      return;
  }

  for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === selectedValue) {
          selectElement.remove(i);
          break;
      }
  }

  // Reset the dropdown's value to default (usually the first disabled placeholder)
  selectElement.selectedIndex = 0;
}

// يقوم بتبديل ظهور الحاوية التي تحتوي على حقل البحث للقائمة المحددة
function toggleSearch(dropdownId) {
  // تكون معرف الحاوية لحقل البحث بتنسيق: "search-container-" + dropdownId
  var searchContainer = document.getElementById('search-container-' + dropdownId);
  if (!searchContainer) return;
  
  // إذا كانت الحاوية مخفية، نقوم بإظهارها وإفراغ الحقل ثم تركيز المؤشر عليها
  if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
    searchContainer.style.display = 'block';
    var searchInput = document.getElementById('search-' + dropdownId);
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    // عند إظهار البحث نعيد كل الخيارات إلى وضعها الطبيعي
    resetDropdownOptions(dropdownId);
  } else {
    // إذا كانت مرئية بالفعل، نقوم بإخفائها وإعادة القائمة الأصلية
    searchContainer.style.display = 'none';
    resetDropdownOptions(dropdownId);
  }
}

// يقوم بتصفية الخيارات في القائمة بناءً على قيمة حقل البحث
function filterDropdown(dropdownId) {
  var searchInput = document.getElementById('search-' + dropdownId);
  var filterValue = searchInput.value.toLowerCase();
  var selectElement = document.getElementById(dropdownId);
  
  // نفّذ التصفية لكل خيار في القائمة
  for (var i = 0; i < selectElement.options.length; i++) {
    var option = selectElement.options[i];
    // إذا احتوى النص على قيمة البحث، يظهر الخيار؛ وإلا يخفيه
    if (option.text.toLowerCase().indexOf(filterValue) > -1) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  }
}

// تساعد هذه الدالة على إعادة جميع الخيارات للظهور بشكل افتراضي
function resetDropdownOptions(dropdownId) {
  var selectElement = document.getElementById(dropdownId);
  for (var i = 0; i < selectElement.options.length; i++) {
    selectElement.options[i].style.display = '';
  }
}
function deleteOption(dropdownId) {
  // استرجاع عنصر الـ select باستخدام المعرف الممرر
  var selectElement = document.getElementById(dropdownId);
  if (!selectElement) return;

  // الحصول على القيمة المختارة في القائمة
  var selectedValue = selectElement.value;
  
  if (!selectedValue) {
    // إذا لم يكن هناك قيمة صالحة، نبحث عن الحاوية التي تحتوي على الدروب داون
    var container = selectElement.closest('.dropdown-container');
    // التأكد من عدم وجود رسالة خطأ موجودة بالفعل
    if (!container.querySelector('.inline-error')) {
      var errorMsg = document.createElement('span');
      errorMsg.className = 'inline-error';
      errorMsg.innerText = 'You must select from the dropdown.';
      // Append the error message after the dropdown element
      var container = selectElement.closest('.dropdown-container');
      container.appendChild(errorMsg);
      
      // إزالة رسالة الخطأ بعد 3 ثواني
      setTimeout(function() {
        errorMsg.remove();
      }, 1500);
    }
    return;
  }

  // إذا كان هناك قيمة مختارة، نقوم بحذف العنصر المطابق من القائمة
  for (var i = 0; i < selectElement.options.length; i++) {
    if (selectElement.options[i].value === selectedValue) {
      selectElement.remove(i);
      break;
    }
  }
  
  // إعادة تعيين القيمة الافتراضية للقائمة (عادة يكون الخيار الأول المُعطل)
  selectElement.selectedIndex = 0;
}


  // تخزين اسم الدروب داون المفتوح حاليا
  let currentDropdownId = "";

  // ربط اختيار "+ Add New ..." بكل الدروب داون
  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", function () {
      if (this.value === "add-custom") {
        currentDropdownId = this.id;
        document.getElementById("popup-title").textContent = `Add New ${formatLabel(currentDropdownId)}`;
        document.getElementById("popup-fields").innerHTML = `
          <input type="text" id="popup-input" placeholder="Enter new ${formatLabel(currentDropdownId)}" />
        `;
        document.getElementById("popup-modal").style.display = "flex";
      }
    });
  });

  // تحويل id الى عنوان مناسب (اختياري - فقط لتحسين عنوان البوب أب)
  function formatLabel(id) {
    return id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }

  // زر الحفظ في البوب أب
  document.getElementById("popup-save-btn").addEventListener("click", function () {
    const input = document.getElementById("popup-input");
    const value = input.value.trim();
    if (value) {
      const select = document.getElementById(currentDropdownId);
      const newOption = document.createElement("option");
      newOption.value = value;
      newOption.textContent = value;
      select.appendChild(newOption);
      select.value = value; // تحديد الخيار الجديد مباشرة
    }
    closePopup();
  });

  // إغلاق البوب أب
  function closePopup() {
    document.getElementById("popup-modal").style.display = "none";
    document.getElementById("popup-fields").innerHTML = "";
    currentDropdownId = "";
  }
