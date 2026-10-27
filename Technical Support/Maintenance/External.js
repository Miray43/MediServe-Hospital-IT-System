

// ================== تعبئة القوائم =====================
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:5050/TypeProplem")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("device-type");
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.DeviceType;
        option.textContent = item.DeviceType;
        dropdown.appendChild(option);
      });
    });

  fetch("http://localhost:5050/Departments")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("section");
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        dropdown.appendChild(option);
      });
    });

    fetch("http://localhost:5050/Technical")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("reporter-name");
  
      // أولاً نحط + Add New كأول عنصر
      const addNew = document.createElement("option");
      addNew.value = "add-custom";
      addNew.textContent = "+ Add New Reporter";
      dropdown.appendChild(addNew); // نحطّه أول
  
      // بعدين نضيف العناصر الباقية
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        dropdown.appendChild(option);
      });
    });
  
});

function insertAddNewOptionAtTop(selectId, value, labelText) {
  const dropdown = document.getElementById(selectId);
  if (!dropdown) return;

  // أولاً، تأكد أن فيه عنصر placeholder أول
  const placeholderExists = dropdown.options.length > 0 && dropdown.options[0].disabled;

  const newOption = document.createElement("option");
  newOption.value = value;
  newOption.textContent = labelText;

  // أدخل الخيار بعد placeholder مباشرة أو كأول عنصر
  const insertPosition = placeholderExists ? 1 : 0;
  dropdown.insertBefore(newOption, dropdown.options[insertPosition]);
}

function fetchModelsByType(type, selectId) {
  const cleanedType = type.trim().toLowerCase();
  let endpoint = "";

  if (cleanedType === "pc") endpoint = "/PC_Model";
  else if (cleanedType === "printer") endpoint = "/Printer_Model";
  else if (cleanedType === "scanner") endpoint = "/Scanner_Model";

  if (endpoint) {
    fetch(`http://localhost:5050${endpoint}`)
      .then(res => res.json())
      .then(data => {
        const dropdown = document.getElementById(selectId);
        if (!dropdown) return;

        // تهيئة القائمة
        dropdown.innerHTML = '<option value="" disabled>Select Model</option>';
        dropdown.value = "";  
        dropdown.selectedIndex = 0;

        // + Add New Model
        const addOption = document.createElement("option");
        addOption.value = "add-new";
        addOption.textContent = "+ Add New Model";
        dropdown.appendChild(addOption);

        // باقي الموديلات
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.model_name;
          option.textContent = item.model_name;
          dropdown.appendChild(option);
        });

        // شيل أي مستمع قديم
        const newDropdown = dropdown.cloneNode(true);
        dropdown.parentNode.replaceChild(newDropdown, dropdown);

        // تأكد الخيار الأول محدد
        newDropdown.value = "";
        newDropdown.selectedIndex = 0;

        // ربط الحدث
        newDropdown.addEventListener("change", e => {
          if (e.target.value === "add-new") {
            sessionStorage.setItem("lastDropdownOpened", selectId);
            saveTemporaryFields();
            openAddModelPopup(type, selectId);
          }
        });
      })
      .catch(err => console.error("❌ Error fetching models:", err));
  } else {
    // أجهزة جديدة
    fetchModelsForNewDevices(type, selectId);
  }
}
function fetchModelsForNewDevices(type, selectId) {
  console.log("🟡 Fetching models for custom device:", type, selectId);

  fetch(`http://localhost:5050/models-by-type/${type}`)
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById(selectId);
      if (!dropdown) return;

      // 🟢 تنظيف القائمة
      dropdown.innerHTML = "";

      // ✅ خيار Select Model
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select Model";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      dropdown.appendChild(defaultOption);

      // ✅ خيار + Add New Model ثاني خيار دائمًا
      const addNewOption = document.createElement("option");
      addNewOption.value = "add-new-model";
      addNewOption.textContent = "+ Add New Model";
      dropdown.appendChild(addNewOption);

      // ✅ إضافة الموديلات (إذا موجودة)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.model_name;
          option.textContent = item.model_name;
          dropdown.appendChild(option);
        });
      }

      // 🧹 شيل أي مستمع قديم بإعادة إنشاء العنصر
      dropdown.replaceWith(dropdown.cloneNode(true));
      const newDropdown = document.getElementById(selectId);

      // **تأكد من اختيار أول عنصر دائماً**
      newDropdown.selectedIndex = 0;
      newDropdown.value = "";

      // ✅ اضبط الحدث مباشرة
      newDropdown.addEventListener("change", e => {
        if (e.target.value === "add-new-model") {
          sessionStorage.setItem("lastDropdownOpened", selectId);
          saveTemporaryFields();
          openAddModelPopup(type, selectId);
        }
      });
    })
    .catch(err => {
      console.error("❌ Error fetching models:", err);
    });
}


  // Function to fetch devices for selected type and department
  function fetchDeviceSpecsByTypeAndDepartment() {
    const type = document.getElementById("device-type").value.toLowerCase(); // Get selected type
    const dept = document.getElementById("section").value; // Get selected department
    const dropdown = document.getElementById("device-spec"); // Get the specifications dropdown
  
    if (!type || !dept) return; // Exit if either is not selected
  
    // Fetch matching devices from the server
    fetch(`http://localhost:5050/devices/${type}/${encodeURIComponent(dept)}`)
      .then(res => res.json()) // Parse response
      .then(data => {
        // Clear current options and set default ones
        dropdown.innerHTML = `
          <option value="" disabled selected>Select specification</option>
          <option value="add-custom">+ Add New Specification</option>
        `;
  
        // If no data found, show message
        if (!Array.isArray(data) || data.length === 0) {
          const noDataOption = document.createElement("option");
          noDataOption.textContent = "No devices found in this department";
          noDataOption.disabled = true;
          dropdown.appendChild(noDataOption);
          return;
        }
  
        // Add each device as an option in the dropdown
        data.forEach(device => {
          const name = device.name || "Unnamed";
          const option = document.createElement("option");
          option.value = device.id;
          option.textContent = `${device.name} | ${device.Serial_Number} | ${device.Governmental_Number}`;
          dropdown.appendChild(option);
        });
      })
      .catch(err => {
        console.error("❌ Error fetching specs:", err); // Log error if request fails
      });
  }
  

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("external-maintenance-form");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        ticket_number: document.querySelector('input[placeholder="Enter ticket number"]').value,
        device_type: document.getElementById("device-type").value,
        device_specifications: document.getElementById("device-spec").value,
        section: document.getElementById("section").value,
        maintenance_manager: document.querySelector('input[placeholder="Enter manager name"]').value,
        reporter_name: document.getElementById("reporter-name").value,
        initial_diagnosis: document.querySelector('textarea[placeholder="Enter initial diagnosis"]').value,
        final_diagnosis: document.querySelector('textarea[placeholder="Enter final diagnosis"]').value
      };

      console.log("📤 Sending data to server:", data); // للتأكد من البيانات

      fetch("http://localhost:5050/submit-external-maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then((res) => res.json())
        .then((result) => {
          console.log("✅ Server response:", result);
          alert(result.message || "تم الإرسال بنجاح");
          location.reload();
        })
        .catch((err) => {
          console.error("❌ Error sending data:", err);
          alert("فشل في الإرسال");
        });
    });
    
  });




// ================== تعبئة المواصفات حسب النوع والقسم =====================
function fetchExternalDeviceSpecs() {
  const type = document.getElementById("device-type").value.toLowerCase();
  const dept = document.getElementById("section").value;
  const dropdown = document.getElementById("device-spec");

  if (!type || !dept) return;

  fetch(`http://localhost:5050/devices/${type}/${encodeURIComponent(dept)}`)
    .then(res => res.json())
    .then(data => {
      dropdown.innerHTML = `
        <option value="" disabled selected>Select Specification</option>
        <option value="add-custom">+ Add New Specification</option>
      `;

      if (!data.length) {
        const opt = document.createElement("option");
        opt.textContent = "No devices found in this department";
        opt.disabled = true;
        dropdown.appendChild(opt);
        return;
      }

      data.forEach(device => {
        const option = document.createElement("option");
        option.value = device.id;
        option.textContent = `${device.name} | ${device.Serial_Number} | ${device.Governmental_Number}`;
        dropdown.appendChild(option);
      });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const typeDropdown = document.getElementById("device-type");
  const sectionDropdown = document.getElementById("section");

  if (typeDropdown && sectionDropdown) {
    typeDropdown.addEventListener("change", fetchExternalDeviceSpecs);
    sectionDropdown.addEventListener("change", fetchExternalDeviceSpecs);
  }
});


// ================== النافذة المنبثقة العامة =====================
const popup = document.getElementById("popup-modal");
const popupFields = document.getElementById("popup-fields");
const popupTitle = document.getElementById("popup-title");
const deviceSpecDropdown = document.getElementById("device-spec");
const problemTypeDropdown = document.getElementById("device-type");

if (deviceSpecDropdown) {
  deviceSpecDropdown.addEventListener("change", () => {
    if (deviceSpecDropdown.value === "add-custom") {
      const type = problemTypeDropdown.value.toLowerCase();
      popup.style.display = "flex";
      generateFieldsForDeviceType(type);
    }
  });
}
function closePopup() {
  popup.style.display = "none";

  const targetElement = document.getElementById("popup-target-id"); // ✅ تحقق من وجود العنصر
  const targetId = targetElement ? targetElement.value : null;

  const dropdown = targetId ? document.getElementById(targetId) : null;
  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();

  if (targetId === "device-spec" && dropdown) {
    // إعادة تعيين القائمة حسب نوع الجهاز
    dropdown.innerHTML = '<option value="" disabled selected>Select Specification</option>';
    dropdown.value = "";

    if (["pc", "printer", "scanner"].includes(deviceType)) {
      // إضافة خيار "Add New" فقط إذا كان الجهاز معروفًا
      const addNewOption = document.createElement("option");
      addNewOption.value = "add-custom";
      addNewOption.textContent = "+ Add New Specification";
      dropdown.appendChild(addNewOption);
    }
  }

  // ✅ إعادة السلكت للوضع الطبيعي إذا كان على "add-custom" أو "add-new"
  if (dropdown && ["add-custom", "add-new", "add-new-department"].includes(dropdown.value)) {
    dropdown.selectedIndex = 0;
    dropdown.value = "";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // تنظيف الحقول المؤقتة
  const input = document.getElementById("popup-input");
  if (input) input.value = "";
  if (targetElement) targetElement.value = "";
}

function closeGenericPopup() {
  const popup = document.getElementById("generic-popup");
  popup.style.display = "none";

  const lastSelectId = sessionStorage.getItem("lastDropdownOpened");
  if (lastSelectId) {
    const dropdown = document.getElementById(lastSelectId);
    if (dropdown) {
      // لو المستخدم كان على خيار إضافة (model او غيره)
      const addValues = ["add-new-model", "add-new", "add-new-department", "add-custom"];
      if (addValues.includes(dropdown.value)) {
        // رجع للسطر الأول
        dropdown.selectedIndex = 0;
        // تأكد إن القيمة فعلاً خالية
        dropdown.value = "";
        // لو محتاج تشغل onchange
        dropdown.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    sessionStorage.removeItem("lastDropdownOpened");
  }

  // لو تبغى تحدث موديل الأجهزة المعروفة بعد الإلغاء
  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();
  if (["pc", "printer", "scanner"].includes(deviceType)) {
    fetchDeviceSpecsByTypeAndDepartment();
  }
}
const dropdownsWithPopup = [
  { id: "device-type", label: "Device Type" },
  { id: "section", label: "Section" },
  { id: "device-spec", label: "Device Specification" }, // ✅ أضف هذا
  { id: "reporter-name", label: "Reporter Name" } // ✅ أضف هذا
];


dropdownsWithPopup.forEach(({ id, label }) => {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;

  dropdown.addEventListener("change", () => {
    const selected = dropdown.value;
    const type = document.getElementById("device-type")?.value?.trim().toLowerCase(); // ✅ الصحيح هنا

    if (selected !== "add-custom") return;

    if (label === "Device Specification") {
      if (["pc", "printer", "scanner"].includes(type)) {
        popup.style.display = "flex";
        generateFieldsForDeviceType(type);
      } else {
        openGenericPopup(label, id);
      }
    } else {
      openGenericPopup(label, id);
    }
  });
});


function openGenericPopup(label, targetId) {
  const saveBtn = document.getElementById("popup-save-btn");

  if (label === "Device Specification") {
    const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();

    popupTitle.textContent = "Add Device Specification";
    popupFields.innerHTML = `
      <label>Device Name:</label><input type="text" id="spec-name" />
      <label>Serial Number:</label><input type="text" id="spec-serial" />
      <label>Ministry Number:</label><input type="text" id="spec-ministry" />

      <label>Model:</label>
      <label>Model:</label>
<select id="spec-model"></select>



      <label>Department:</label>
      <select id="spec-department">
        <option value="" disabled selected>Loading departments...</option>
      </select>

      <input type="hidden" id="popup-target-id" value="${targetId}" />
    `;

    saveBtn.onclick = saveDeviceSpecification;
    popup.style.display = "flex";

    // ✅ جلب الأقسام أولاً
    fetch("http://localhost:5050/Departments?" + Date.now())
      .then(res => res.json())
      .then(departments => {

        const departmentSelect = document.getElementById("spec-department");
        departmentSelect.innerHTML = `
          <option value="" disabled selected>Select department</option>
          ${departments.map(dep => `<option value="${dep.name}">${dep.name}</option>`).join("")}
          <option value="add-new-department">+ Add New Section</option>
        `;
        console.log("🧪 الأقسام المحمّلة:", departments.map(d => d.name));
        console.log("🧪 القيمة المحفوظة:", sessionStorage.getItem("spec-department"));

        // ✅ تحديد القسم المحفوظ
        const savedDept = sessionStorage.getItem("spec-department");
        if (savedDept) {
          const options = Array.from(departmentSelect.options);
          const match = options.find(opt => opt.value.trim().toLowerCase() === savedDept.trim().toLowerCase());

          // ✅ إذا ما لقيه، نضيفه يدويًا
          if (!match) {
            const newOption = document.createElement("option");
            newOption.value = savedDept;
            newOption.textContent = savedDept;
            departmentSelect.insertBefore(newOption, departmentSelect.lastElementChild); // قبل + Add New Section
            console.log("🆕 القسم مضاف يدويًا:", savedDept);
          }

          // ✅ تحديده بعد التأكد من وجوده
          departmentSelect.value = savedDept;
          console.log("✅ تم تحديد القسم:", savedDept);

          sessionStorage.removeItem("spec-department");
        }


        // ✅ مراقبة خيار إضافة قسم جديد
        departmentSelect.addEventListener("change", function (e) {
          if (e.target.value === "add-new-department") {
            sessionStorage.setItem("lastDepartmentSelectId", "spec-department");
            saveTemporaryFields(); // نحفظ القيم قبل فتح popup القسم
            openAddSectionPopup();
          }
        });
      });

    // ✅ جلب الموديلات
    // ✅ جلب الموديلات وضمان تفعيل الحدث بعد تأكد وجود العنصر
    setTimeout(() => {
      if (["pc", "printer", "scanner"].includes(deviceType)) {
        fetchModelsByType(deviceType, "spec-model");
      } else {
        fetchModelsForNewDevices(deviceType, "spec-model");
      }

      // ✅ تفعيل الحدث وإعادة آخر موديل مضاف بعد تأكد وجود القائمة
      setTimeout(() => {
        const modelDropdown = document.getElementById("spec-model");

        if (modelDropdown) {
          const last = sessionStorage.getItem("lastAddedModel");
          if (last) {
            modelDropdown.value = last;
            modelDropdown.dispatchEvent(new Event("change", { bubbles: true }));
            sessionStorage.removeItem("lastAddedModel");
          }

          modelDropdown.addEventListener("change", (e) => {
            if (e.target.value === "add-new-model") {
              saveTemporaryFields();
              openAddModelPopup(deviceType, 'generic');
            }
          });
        } else {
          console.warn("❌ ما لقى spec-model داخل popup!");
        }
      }, 300);
    }, 150);


  } else {
    // ✅ الحقول العادية
    popupTitle.textContent = `Add New ${label}`;
    popupFields.innerHTML = `
      <label for="popup-input">${label}:</label>
      <input type="text" id="popup-input" placeholder="Enter ${label}" required>
      <input type="hidden" id="popup-target-id" value="${targetId}">
    `;
    saveBtn.onclick = saveGenericOption;
    popup.style.display = "flex";
  }
}

function saveTemporaryFields() {
  const ids = ["spec-name", "spec-serial", "spec-ministry", "spec-department"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      sessionStorage.setItem(id, el.value);
    }
  });
}

// ✅ Popup جديد لإضافة موديل
function openAddModelPopup(type, selectId) {
  const popup = document.getElementById("generic-popup");
  // سجل أي سلكت نرجعه لو Cancel
  sessionStorage.setItem("lastDropdownOpened", selectId);

  popup.innerHTML = `
    <div class="popup-content">
      <h3>Add New Model for ${type}</h3>
      <label for="new-model-name">Model Name:</label>
      <input type="text" id="new-model-name" placeholder="Enter model name" />
      <div class="popup-buttons">
        <button onclick="saveNewModel('${type}', '${selectId}')">Save</button>
        <button onclick="closeGenericPopup()">Cancel</button>
      </div>
    </div>
  `;
  popup.style.display = "flex";

  // حفظ القيم المؤقتة (لو مستخدم في فرم specifications)
  const fieldsToSave = ["spec-ministry", "spec-name", "spec-serial", "spec-department"];
  fieldsToSave.forEach(id => {
    const el = document.getElementById(id);
    if (el) sessionStorage.setItem(id, el.value);
  });
}

// ✅ حفظ موديل جديد وإعادة فتح نافذة Device Specification
function saveNewModel(type, selectId) {
  const modelName = document.getElementById("new-model-name").value.trim();
  if (!modelName) {
    alert("❌ Please enter a model name");
    return;
  }

  fetch("http://localhost:5050/add-device-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_name: modelName, device_type_name: type })
  })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        alert(result.error);
        return;
      }

      // ✅ خزّن اسم الموديل في sessionStorage لاستخدامه بعد إغلاق البوب أب
      sessionStorage.setItem("lastAddedModel", modelName);

      closeGenericPopup(); // يقفل البوب أب

      // ✅ أعد تحميل قائمة الموديلات
      if (["pc", "printer", "scanner"].includes(type)) {
        fetchModelsByType(type, selectId);
      } else {
        fetchModelsForNewDevices(type, selectId);
      }

      // ✅ عوضًا عن setTimeout ثابت، ننتظر عنصر القائمة يظهر فعلاً
      const interval = setInterval(() => {
        const dropdown = document.getElementById(selectId);
        if (dropdown) {
          clearInterval(interval);
          dropdown.value = modelName;
          dropdown.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, 100);
    })
    .catch(err => {
      console.error("❌ Error saving model:", err);
      alert("❌ Error saving new model");
    });
}





function saveDeviceSpecification() {
  const ministry = document.getElementById("spec-ministry").value.trim();
  const name = document.getElementById("spec-name").value.trim();
  const model = document.getElementById("spec-model").value.trim();
  const serial = document.getElementById("spec-serial").value.trim();
  const department = document.getElementById("spec-department").value.trim();
  const deviceType = document.getElementById("device-type").value.toLowerCase(); // external
  const dropdown = document.getElementById("device-spec");

  if (!ministry || !name || !model || !serial || !department || !deviceType) {
    alert("❌ Please fill all fields.");
    return;
  }

  const specData = {
    ministry,
    name,
    model,
    serial,
    department,
    type: deviceType
  };

  fetch("http://localhost:5050/add-device-specification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(specData)
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then(result => {
      if (result.message) {
        alert(result.message);

        const option = document.createElement("option");
        option.value = result.insertedId || specData.serial;
        option.textContent = `${specData.name} | ${specData.serial} | ${specData.ministry}`;
        dropdown.appendChild(option);
        dropdown.value = option.value;

        popup.style.display = "none";

      } else {
        alert("❌ فشل في الحفظ: " + result.error);
      }
    })
    .catch(err => {
      console.error("❌ Error saving specification:", err);
      alert("❌ Failed to save specification");
    });
}


function saveGenericOption() {
  const value = document.getElementById("popup-input").value.trim();
  const targetId = document.getElementById("popup-target-id").value;
  const dropdown = document.getElementById(targetId);

  if (!value || !dropdown) return;

  fetch("http://localhost:5050/add-options-external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: targetId, value })
  })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        alert(result.error);
        return;
      }

      // ✅ تأكد إذا الخيار موجود، لا تكرره
      let exists = Array.from(dropdown.options).some(opt => opt.value === value);
      if (!exists) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
      }

      dropdown.value = value;
      closePopup();
    })
    .catch(err => {
      console.error("❌ Error saving option:", err);
      alert("❌ Failed to save new option");
    });
}



// ================== النافذة المنبثقة للمواصفات =====================

function generateFieldsForDeviceType(type) {
  const saveBtn = document.getElementById("popup-save-btn");
  popupFields.innerHTML = "";

   // Common fields for all device types
   const commonFields = `
   <label>Device Name:</label><input type="text" name="device-name" required>
   <label>Serial Number:</label><input type="text" name="serial" required>
   <label>Ministry Number:</label><input type="text" name="ministry-id" required>
 
   <label>Department:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="department" id="department-${type}"></select>
     </div>
   </div>
 
   <label>Model:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="model" id="model-${type}"></select>
     </div>
   </div>
 `;
 
 
   // Device-specific fields
   let deviceSpecificFields = '';
   if (type === "pc") {
     deviceSpecificFields = `
   <label>Processor Generation:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="generation" id="generation-select"></select>
     </div>
   </div>
 
   <label>CPU:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="processor" id="cpu-select"></select>
     </div>
   </div>
 
   <label>RAM:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="ram" id="ram-select"></select>
     </div>
   </div>
 
   <label>OS:</label>
   <div class="dropdown-container">
     <div class="dropdown-wrapper">
       <select name="os" id="os-select"></select>
     </div>
   </div>
 `;


  }

 // Set the popup content
 popupTitle.textContent = `Enter ${type.charAt(0).toUpperCase() + type.slice(1)} Specifications`;
 popupFields.innerHTML = commonFields + deviceSpecificFields;
 setTimeout(() => {
   activateGeneralDropdownTools(`department-${type}`, "Department");
   activateGeneralDropdownTools(`model-${type}`, "Model");
 
   if (type === "pc") {
     activateGeneralDropdownTools("generation-select", "Processor Generation");
     activateGeneralDropdownTools("cpu-select", "CPU");
     activateGeneralDropdownTools("ram-select", "RAM");
     activateGeneralDropdownTools("os-select", "OS");
   }
 }, 150);
 
 saveBtn.onclick = savePCSpec;

  // Initialize common components
  fetchModelsByType(type, `model-${type}`);
  fetchDepartments(`department-${type}`);

  // Initialize PC-specific components
  if (type === "pc") {
    fetchCPU();
    fetchRAM();
    fetchOS();
    fetchProcessorGen();
  }

  // Handle department change for all device types
  document.getElementById(`department-${type}`).addEventListener("change", function (e) {
    if (e.target.value === "add-new-department") {
      // Save current field values
      ["ministry-id", "device-name", "serial"].forEach(id => {
        const el = document.querySelector(`[name="${id}"]`);
        if (el) sessionStorage.setItem(id, el.value);
      });

      // Mark which department select triggered this
      sessionStorage.setItem("lastDepartmentSelectId", `department-${type}`);
      openAddSectionPopup();
    }
  });

  // Handle model change for all device types
  document.getElementById(`model-${type}`).addEventListener("change", function (e) {
    if (e.target.value === "add-new") {
      // Save current field values
      ["ministry-id", "device-name", "serial"].forEach(id => {
        const el = document.querySelector(`[name="${id}"]`);
        if (el) sessionStorage.setItem(id, el.value);
      });

      openAddModelPopup(type, 'fields');
    }
  });

  // Reset the device-spec dropdown to default state
  const deviceSpecDropdown = document.getElementById("device-spec");
  if (deviceSpecDropdown) {
    deviceSpecDropdown.innerHTML = `
      <option value="" disabled selected>Select Specification</option>
      <option value="add-custom">+ Add New Specification</option>
    `;
    deviceSpecDropdown.value = "";
  }

  popup.style.display = "flex";
}

function savePCSpec() {
  const formElements = popupFields.querySelectorAll("input, select");
  const data = {};
  formElements.forEach(input => {
    data[input.name] = input.value;
  });

  const type = problemTypeDropdown.value.toLowerCase(); // أو استخدم: document.getElementById("problem-type")

  fetch(`http://localhost:5050/AddDevice/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if (result.message) {
        alert(result.message);

        // ✅ إضافة الخيار الجديد مباشرة في dropdown
        const specDropdown = document.getElementById("device-spec");
        const newOption = document.createElement("option");
        newOption.value = result.insertedId || data.serial || data["device-name"]; // fallback
        newOption.textContent = `${data["device-name"]} | ${data.serial} | ${data["ministry-id"]}`;
        specDropdown.appendChild(newOption);
        specDropdown.value = newOption.value;

        // ✅ إغلاق البوب أب بدون لمس عناصر غير موجودة
        popup.style.display = "none";
      } else {
        alert("❌ Failed to save: " + result.error);
      }
    })
    .catch(err => {
      console.error("❌ Error saving device:", err);
      alert("❌ Server connection failed");
    });
}


function openAddSectionPopup() {
  const popup = document.getElementById("generic-popup");

  // 🟢 نحفظ اسم السلكت اللي المستخدم كان فيه قبل ما يضغط Add New Section
  const selectId = sessionStorage.getItem("lastDepartmentSelectId") || "spec-department";
  sessionStorage.setItem("lastDropdownOpened", selectId); // ✅ ضروري عشان يرجع السلكت للوضع الطبيعي

  popup.innerHTML = `
    <div class="popup-content">
      <h3>Add New Section</h3>
      <label>Section Name:</label>
      <input type="text" id="new-section-name" placeholder="Enter section name" />
      <div class="popup-buttons">
        <button onclick="saveNewSection()">Save</button>
        <button onclick="closeGenericPopup()">Cancel</button>
      </div>
    </div>
  `;
  popup.style.display = "flex";
}



function saveNewSection() {
  const sectionName = document.getElementById("new-section-name").value.trim();
  if (!sectionName) {
    alert("❌ Please enter a section name");
    return;
  }

  fetch("http://localhost:5050/add-options-external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: "section", value: sectionName })
  })
    .then(res => res.json())
    .then(result => {
      // ✅ تحقق إذا القسم موجود مسبقًا
      if (result.error) {
        alert(result.error); // ⛔ "هذا القسم موجود مسبقًا"
        return; // 🛑 لا تكمل باقي الكود
      }

      alert(result.message);
      const selectId = sessionStorage.getItem("lastDepartmentSelectId") || "spec-department";
      const isKnownDevice = ["pc", "printer", "scanner"].includes(document.getElementById("problem-type")?.value?.toLowerCase());

      sessionStorage.setItem(selectId, sectionName);

      const restoreFields = isKnownDevice
        ? ["ministry-id", "device-name", "serial", ...(document.getElementById("problem-type").value.toLowerCase() === "pc"
            ? ["cpu-select", "ram-select", "os-select", "generation-select"]
            : [])]
        : ["spec-name", "spec-serial", "spec-ministry"];

      restoreFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) sessionStorage.setItem(id, el.value);
      });

      fetchDepartments(selectId);

      setTimeout(() => {
        closeGenericPopup();

        if (!isKnownDevice) {
          setTimeout(() => {
            const popupVisible = document.getElementById("popup-modal")?.style.display === "flex";
            if (!popupVisible) {
              openGenericPopup("Device Specification", "device-spec");
            }
          }, 300);
        }
      }, 300);
    })
    .catch(err => {
      console.error("❌ Failed to save section:", err);
      alert("❌ Error saving section");
    });
}



// ================== دوال الموديلات والخصائص =====================
function fetchCPU() {
  fetch("http://localhost:5050/CPU_Types")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("cpu-select");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Select CPU</option>';
      select.value = ""; // ✅ يرجع للسطر الأول تلقائيًا

      const addOption = document.createElement("option");
      addOption.value = "add-new";
      addOption.textContent = "+ Add New CPU";
      select.appendChild(addOption);

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.cpu_name;
        option.textContent = item.cpu_name;
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        if (e.target.value === "add-new") {
          openAddOptionPopup("cpu-select");
        }
      });
    });
}

function fetchRAM() {
  fetch("http://localhost:5050/RAM_Types")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("ram-select");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Select RAM</option>';
      select.value = ""; // ✅ يرجع للسطر الأول تلقائيًا

      const addOption = document.createElement("option");
      addOption.value = "add-new";
      addOption.textContent = "+ Add New RAM";
      select.appendChild(addOption);

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ram_type;
        option.textContent = item.ram_type;
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        if (e.target.value === "add-new") {
          openAddOptionPopup("ram-select");
        }
      });
    });
}

function fetchOS() {
  fetch("http://localhost:5050/OS_Types")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("os-select");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Select OS</option>';
      select.value = ""; // ✅ يرجع للسطر الأول تلقائيًا

      const addOption = document.createElement("option");
      addOption.value = "add-new";
      addOption.textContent = "+ Add New OS";
      select.appendChild(addOption);

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.os_name;
        option.textContent = item.os_name;
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        if (e.target.value === "add-new") {
          openAddOptionPopup("os-select");
        }
      });
    });
}

function openAddOptionPopup(targetId) {
  // 🟡 نحفظ اسم السلكت المفتوح حاليًا عشان نرجعه إذا ضغط Cancel
  sessionStorage.setItem("lastDropdownOpened", targetId);

  let label = "New Option";
  if (targetId === "ram-select") label = "RAM";
  else if (targetId === "cpu-select") label = "CPU";
  else if (targetId === "os-select") label = "Operating System";
  else if (targetId === "generation-select") label = "Processor Generation";

  const popup = document.getElementById("generic-popup");
  popup.innerHTML = `
    <div class="popup-content">
      <h3>Add New ${label}</h3>
      <label for="generic-popup-input">${label} Name:</label>
      <input type="text" id="generic-popup-input" placeholder="Enter ${label}" />
      <input type="hidden" id="generic-popup-target-id" value="${targetId}" />
      <div class="popup-buttons">
        <button onclick="saveOptionForSelect()">Save</button>
        <button onclick="closeGenericPopup()">Cancel</button>
      </div>
    </div>
  `;
  popup.style.display = "flex";
}

function saveOptionForSelect() {
  const value = document.getElementById("generic-popup-input").value.trim();
  const targetId = document.getElementById("generic-popup-target-id").value;
  const dropdown = document.getElementById(targetId);
  if (!value || !dropdown) return;

  let endpoint = "http://localhost:5050/add-options-external";
  if (targetId === "os-select") endpoint = "http://localhost:5050/add-os";
  else if (targetId === "ram-select") endpoint = "http://localhost:5050/add-ram";
  else if (targetId === "cpu-select") endpoint = "http://localhost:5050/add-cpu";
  else if (targetId === "generation-select") endpoint = "http://localhost:5050/add-generation";
  else if (targetId === "section") endpoint = "http://localhost:5050/add-department";

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: targetId, value })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "❌ This option already exists");
        return;
      }

      alert(data.message || "✅ Added successfully");

      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      dropdown.appendChild(option);
      dropdown.value = value;

      closeGenericPopup();
    })
    .catch(err => {
      console.error("❌ Error:", err);
      alert("❌ Failed to save option");
    });
}



function fetchProcessorGen() {
  fetch("http://localhost:5050/Processor_Generations")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("generation-select");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Select Generation</option>';
      select.value = ""; // ✅ يرجع للسطر الأول تلقائيًا

      const addOption = document.createElement("option");
      addOption.value = "add-new";
      addOption.textContent = "+ Add New Generation";
      select.appendChild(addOption);

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.generation_number;
        option.textContent = item.generation_number;
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        if (e.target.value === "add-new") {
          openAddOptionPopup("generation-select");
        }
      });
    });
}


function fetchDepartments(selectId = "department") {
  fetch("http://localhost:5050/Departments")
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById(selectId);
      if (!select) return;

      select.innerHTML = `<option value="" disabled selected>${selectId === "section" ? "Select section" : "Select Department"}</option>`;

      const addOption = document.createElement("option");
      addOption.value = "add-new-department";
      addOption.textContent = "+ Add New Section";
      select.appendChild(addOption);

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        select.appendChild(option);
      });

      // ✅ هنا نرجع القيمة المختارة إذا كانت محفوظة
      const savedDept = sessionStorage.getItem(selectId);
      if (savedDept) {
        select.value = savedDept;
        sessionStorage.removeItem(selectId);
      }

      select.addEventListener("change", function (e) {
        if (e.target.value === "add-new-department") {
          const popupVisible = document.getElementById("generic-popup")?.style.display === "flex";
          if (!popupVisible) {
            openAddSectionPopup();
            sessionStorage.setItem("lastDepartmentSelectId", selectId);
          }
        }
      });
    });
}



function fetchDeviceSpecsByTypeAndDepartment() {
  const type = document.getElementById("problem-type").value.toLowerCase();
  const dept = document.getElementById("section").value;
  const dropdown = document.getElementById("device-spec");

  if (!type || !dept) return;

  fetch(`http://localhost:5050/devices/${type}/${encodeURIComponent(dept)}`)
    .then(res => res.json())
    .then(data => {
      dropdown.innerHTML = `
        <option value="" disabled selected>Select Specifications</option>
        <option value="add-custom">+ Add New Specification</option>
      `;

      if (!Array.isArray(data) || data.length === 0) {
        const noDataOption = document.createElement("option");
        noDataOption.textContent = "No devices found in this department";
        noDataOption.disabled = true;
        dropdown.appendChild(noDataOption);
        return;
      }

      data.forEach(device => {
        const name = device.name || "Unnamed";
        const option = document.createElement("option");
        option.value = device.id;
        option.textContent = `${name} | ${device.Serial_Number} | ${device.Governmental_Number}`;
        dropdown.appendChild(option);
      });
    })
    .catch(err => {
      console.error("❌ Error fetching specs:", err);
    });
}

function fetchDevicesBySection() {
  const type = document.getElementById("problem-type").value.toLowerCase();
  const department = document.getElementById("section").value;

  if (!type || !department) {
    alert("❌ تأكد من اختيار نوع الجهاز والقسم");
    return;
  }

  fetch(`http://localhost:5050/devices/${type}/${encodeURIComponent(department)}`)
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("device-spec");
      dropdown.innerHTML = '<option disabled selected>Select specification</option>';
      data.forEach(device => {
        const option = document.createElement("option");
        const label = type === 'pc' ? device.Computer_Name : type === 'printer' ? device.Printer_Name : device.Scanner_Name;
        option.value = device.Serial_Number;
        option.textContent = `${device.Serial_Number} | ${label}`;
        dropdown.appendChild(option);
      });
    })
    .catch(err => console.error("❌ Error fetching device specs:", err));
}
// إظهار إشعار أسفل الدروب ليست
function showNotification(message, selectId) {
  const selectElement = document.getElementById(selectId);
  // إيجاد الحاوية الأقرب التي تحتوي على الـ dropdown، مع استخدام .closest
  let container = selectElement.closest('.dropdown-container');
  if (!container) {
    container = selectElement.parentNode; // في حال عدم دعم .closest
  }

  // إنشاء عنصر الإشعار
  const notification = document.createElement('div');
  notification.className = "notification";
  notification.textContent = message;

  // تعديل الأنماط؛ يمكنك نقل هذه الأنماط إلى ملف CSS
  notification.style.color = "#d9534f";      // لون أحمر للإشعار
  notification.style.fontSize = "14px";
  notification.style.marginTop = "4px";

  // إضافة الإشعار إلى الحاوية
  container.appendChild(notification);

  // إزالة الإشعار بعد 3 ثوانٍ
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// فتح البوب أب وتعبئة العنوان والنص الحالي
function openPopup(selectId, title) {
  const select = document.getElementById(selectId);
  const selectedOption = select.options[select.selectedIndex];

  // استبدال تنبيه الـ alert بإشعار يظهر أسفل الدروب ليست
  if (!selectedOption || selectedOption.disabled || selectedOption.value === "add-custom") {
    showNotification("Please select a valid option to edit.", selectId);
    return;
  }

  document.getElementById("popup-title").textContent = `Edit ${title}`;
  const popupFields = document.getElementById("popup-fields");
  popupFields.innerHTML = `
    <label>Update ${title}:</label>
    <input type="text" id="popup-input" value="${selectedOption.text}">
  `;

  // حفظ التعديل عند الضغط على زر الحفظ داخل البوب أب
  const saveBtn = document.getElementById("popup-save-btn");
  saveBtn.onclick = () => {
    const newValue = document.getElementById("popup-input").value.trim();
    if (newValue) {
      selectedOption.text = newValue;
    }
    closePopup();
  };

  // عرض البوب أب الموجود مسبقاً
  document.getElementById("popup-modal").style.display = "flex";
}

// إغلاق البوب أب
function closePopup() {
  document.getElementById("popup-modal").style.display = "none";
}

// فتح/إغلاق حقل البحث
function toggleSearch(selectId) {
  const container = document.getElementById(`search-container-${selectId}`);
  container.style.display = container.style.display === "none" ? "block" : "none";

  const input = container.querySelector("input");
  input.value = "";
  input.focus();

  input.oninput = () => {
    const filter = input.value.toLowerCase();
    const select = document.getElementById(selectId);

    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      const shouldShow = option.text.toLowerCase().includes(filter) || option.value === "add-custom";
      option.style.display = shouldShow ? "block" : "none";
    }
  };
}

// حذف الخيار المحدد مع حفظ الحذف بشكل دائم باستخدام localStorage
function deleteOption(selectId) {
  const select = document.getElementById(selectId);
  const selectedIndex = select.selectedIndex;
  const selectedOption = select.options[selectedIndex];

  if (!selectedOption || selectedOption.disabled || selectedOption.value === "add-custom") {
    showNotification("Please select a valid option to delete.", selectId);
    return;
  }

  const deletedOptionText = selectedOption.text;
  // إزالة الخيار من القائمة الحالية
  select.removeChild(selectedOption);

  // حفظ الحذف بشكل دائم؛ نستخدم مفتاح "deletedOptions_<selectId>" لتخزين النصوص المحذوفة
  const persistentKey = "deletedOptions_" + selectId;
  let deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];
  if (!deletedOptions.includes(deletedOptionText)) {
    deletedOptions.push(deletedOptionText);
    localStorage.setItem(persistentKey, JSON.stringify(deletedOptions));
  }

  showNotification("Deleted option: " + deletedOptionText, selectId);
}

// دالة تطبق الحذف الدائم عند تحميل الصفحة (تحذف الخيارات التي سبق وأن حُذفت)
function applyDeletions(selectId) {
  const persistentKey = "deletedOptions_" + selectId;
  let deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];
  const select = document.getElementById(selectId);
  // استخدام حلقة عكسية لتجنب التأثير على الترتيب عند الحذف
  for (let i = select.options.length - 1; i >= 0; i--) {
    const option = select.options[i];
    if (deletedOptions.includes(option.text)) {
      select.remove(i);
    }
  }
}

// عند تحميل الصفحة، نطبق الحذف الدائم على القوائم المطلوبة
document.addEventListener("DOMContentLoaded", function() {
  // قائمة بمعرّفات الـ select التي تريد تطبيق الحذف الدائم عليها
  const selectIds = ["problem-type", "section", "device-spec", "floor", "technical", "problem-status"];
  selectIds.forEach(id => {
    if (document.getElementById(id)) {
      applyDeletions(id);
    }
  });
});

function activateGeneralDropdownTools(selectId, label) {
  console.log(`🔧 Trying to activate icons for: ${selectId}`); // ✅ للتأكد من التنفيذ

  const container = document.getElementById(selectId)?.closest(".dropdown-container");
  if (!container) {
    console.warn(`❌ container not found for ${selectId}`);
    return;
  }

  const wrapper = container.querySelector(".dropdown-wrapper");
  if (!wrapper) {
    console.warn(`❌ wrapper not found for ${selectId}`);
    return;
  }

  if (wrapper.querySelector(".icon-container ")) {
    console.warn(`⚠️ Icons already exist for ${selectId}`);
    return;
  }

  const iconBox = document.createElement("div");
  iconBox.className = "icon-container";

  iconBox.innerHTML = `
  <img src="/Mediserve-main/icon/search.png" alt="Search" class="search-icon" onclick="toggleSearch('${selectId}')" style="margin-top: 10px;">
  <img src="/Mediserve-main/icon/edit.png" alt="Edit" class="edit-icon" onclick="event.stopPropagation(); openPopup('${selectId}', '${label}')" style="margin-top: 10px;">
  <img src="/Mediserve-main/icon/trash.png" alt="Delete" class="trash-icon" onclick="event.stopPropagation(); deleteOption('${selectId}')" style="margin-top: 10px;">
`;


  wrapper.appendChild(iconBox);
}
