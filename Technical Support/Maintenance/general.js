// ================== تعبئة القوائم =====================
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:5050/TypeProplem")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("problem-type");
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.DeviceType;
        option.textContent = item.DeviceType;
        dropdown.appendChild(option);
      });
    });



  fetch("http://localhost:5050/floors")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("floor");
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.FloorNum;
        option.textContent = item.FloorNum;
        dropdown.appendChild(option);
      });
    });

  fetch("http://localhost:5050/Technical")
    .then(res => res.json())
    .then(data => {
      const dropdown = document.getElementById("technical");
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
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
        requestAnimationFrame(() => {
          activateGeneralDropdownTools(selectId, "Model");
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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools(selectId, "Model");
      });
      
    })
    .catch(err => {
      console.error("❌ Error fetching models:", err);
    });
}









// ================== تعبئة حالات الأعطال =====================
document.addEventListener("DOMContentLoaded", () => {
  const deviceType = document.getElementById("problem-type");
  const problemStatus = document.getElementById("problem-status");

  if (deviceType && problemStatus) {
    deviceType.addEventListener("change", () => {
      const selected = deviceType.value.toLowerCase();
      let endpoint = "";

      if (selected === "pc") endpoint = "/problem-states/pc";
      else if (selected === "printer") endpoint = "/problem-states/printer";
      else if (selected === "scanner") endpoint = "/problem-states/scanner";
      else endpoint = `/problem-states/maintenance/${selected}`; // ✅ جلب حالات جهاز جديد

      // إعادة تعيين القائمة
      problemStatus.innerHTML = `
        <option value="" disabled selected>Select status</option>
        <option value="add-custom">+ Add New Status</option>
      `;

      fetch(`http://localhost:5050${endpoint}`)
        .then(res => res.json())
        .then(data => {
          data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.problem_text || item.problemStates_Maintance_device_name;
            option.textContent = item.problem_text || item.problemStates_Maintance_device_name;
            problemStatus.appendChild(option);
          });
        })
        .catch(err => {
          console.error("❌ Error loading problem states:", err);
        });
    });

    problemStatus.addEventListener("change", () => {
      if (problemStatus.value === "add-custom") {
        openGenericPopup("Problem Status", "problem-status");
      }
    });
  }
});


// ================== تعبئة المواصفات حسب النوع والقسم =====================
function fetchGeneralDeviceSpecs() {
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
  const typeDropdown = document.getElementById("problem-type");
  const sectionDropdown = document.getElementById("section");

  if (typeDropdown && sectionDropdown) {
    typeDropdown.addEventListener("change", fetchGeneralDeviceSpecs);
    sectionDropdown.addEventListener("change", fetchGeneralDeviceSpecs);
  }
});

// ================== النافذة المنبثقة =====================
const popup = document.getElementById("popup-modal");
const popupFields = document.getElementById("popup-fields");
const popupTitle = document.getElementById("popup-title");
const deviceSpecDropdown = document.getElementById("device-spec");
const problemTypeDropdown = document.getElementById("problem-type");

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
  const popup = document.getElementById("popup-modal");
  if (popup) popup.style.display = "none";

  const targetElement = document.getElementById("popup-target-id");
  const targetId = targetElement ? targetElement.value : null;
  const dropdown = targetId ? document.getElementById(targetId) : null;
  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();

  if (targetId === "device-spec" && dropdown) {
    dropdown.innerHTML = '<option value="" disabled selected>Select Specification</option>';
    dropdown.value = "";

    if (["pc", "printer", "scanner"].includes(deviceType)) {
      const addNewOption = document.createElement("option");
      addNewOption.value = "add-custom";
      addNewOption.textContent = "+ Add New Specification";
      dropdown.appendChild(addNewOption);
    }
  }

  if (dropdown && ["add-custom", "add-new", "add-new-department"].includes(dropdown.value)) {
    dropdown.selectedIndex = 0;
    dropdown.value = "";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
  }

  if (document.getElementById("popup-input")) {
    document.getElementById("popup-input").value = "";
  }
  if (targetElement) targetElement.value = "";
}
// 🔔 Show notification message below the dropdown
function showNotification(message, selectId) {
  const selectElement = document.getElementById(selectId);
  let container = selectElement.closest('.dropdown-container') || selectElement.parentNode;

  const notification = document.createElement('div');
  notification.className = "notification";
  notification.textContent = message;
  notification.style.color = "#d9534f";
  notification.style.fontSize = "14px";
  notification.style.marginTop = "4px";

  container.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}


// إغلاق البوب أب
function closePopup() {
  document.getElementById("popup-modal").style.display = "none";
}

// 🔎 Toggle search field in dropdown
window.toggleSearch = function(selectId) {
  const container = document.getElementById(`search-container-${selectId}`);
  container.style.display = container.style.display === "none" ? "block" : "none";

  const input = container.querySelector("input");
  input.value = "";
  input.focus();

  // Filter dropdown options live
  input.oninput = () => {
    const filter = input.value.toLowerCase();
    const select = document.getElementById(selectId);

    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      const shouldShow = option.text.toLowerCase().includes(filter) || option.value === "add-custom";
      option.style.display = shouldShow ? "block" : "none";
    }
  };
};

// 🗑️ Delete selected option from dropdown and send DELETE to database
// 🗑️ Delete selected option from dropdown and remember using localStorage + DB
window.deleteOption = function(selectId) {
  const select = document.getElementById(selectId);
  const selectedIndex = select.selectedIndex;
  const selectedOption = select.options[selectedIndex];

  if (!selectedOption || selectedOption.disabled || selectedOption.value === "add-custom") {
    showNotification("Please select a valid option to delete.", selectId);
    return;
  }

  const deletedText = selectedOption.text;
  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase() || "";

  select.removeChild(selectedOption);

  // 🧠 حفظ الحذف محليًا (localStorage)
  const persistentKey = `deletedOptions_${selectId}`;
  let deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];

  if (!deletedOptions.includes(deletedText)) {
    deletedOptions.push(deletedText);
    localStorage.setItem(persistentKey, JSON.stringify(deletedOptions));
  }

  // 🔄 أعد تعيين السلكت لأول خيار صالح
  // 🔄 أعد تعيين السلكت لأول خيار "صالح" بعد الحذف
for (let i = 0; i < select.options.length; i++) {
  const opt = select.options[i];
  if (!opt.disabled && !opt.value.includes("add-")) {
    select.selectedIndex = i;
    select.value = opt.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    break;
  }
}


  // 🌐 حذف من الداتا بيس (API)
  fetch("http://localhost:5050/delete-option-general", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target: selectId,
      value: deletedText,
      type: deviceType // فقط لحالة problem-status
    })
  })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        console.error("❌ Error:", result.error);
        showNotification("❌ Failed to delete from DB", selectId);
        return;
      }
      showNotification("✅ Deleted: " + deletedText, selectId);
    })
    .catch(err => {
      console.error("❌ Network error:", err);
      showNotification("❌ Failed to connect", selectId);
    });
};

// 🧽 Apply deletions from localStorage on load
function applyDeletions(selectId) {
  const persistentKey = `deletedOptions_${selectId}`;
  const deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];
  const select = document.getElementById(selectId);

  for (let i = select.options.length - 1; i >= 0; i--) {
    if (deletedOptions.includes(select.options[i].text)) {
      select.remove(i);
    }
  }
}

// 🪄 On DOM ready, apply deletions to all relevant dropdowns
document.addEventListener("DOMContentLoaded", function () {
  const selectIds = ["problem-type", "section", "device-spec", "floor", "technical", "problem-status"];
  selectIds.forEach(id => {
    if (document.getElementById(id)) {
      applyDeletions(id);
    }
  });
});



function closeGenericPopup() {
  const popup = document.getElementById("generic-popup");
  popup.style.display = "none";

  const lastSelectId = sessionStorage.getItem("lastDropdownOpened");
  if (lastSelectId) {
    const dropdown = document.getElementById(lastSelectId);
    if (dropdown) {
      const addNewValues = ["add-new", "add-new-model", "add-new-department", "add-custom"];
      if (addNewValues.includes(dropdown.value)) {
        dropdown.selectedIndex = 0;
        dropdown.value = "";
        dropdown.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    sessionStorage.removeItem("lastDropdownOpened");
  }

  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();
  if (["pc", "printer", "scanner"].includes(deviceType)) {
    fetchDeviceSpecsByTypeAndDepartment();
  }
}



const generalDropdowns = [
  { id: "problem-type", label: "Problem Type" },
  { id: "section", label: "Section" },
  { id: "floor", label: "Floor" },
  { id: "technical", label: "Technical" },
  { id: "problem-status", label: "Problem Status" },
  { id: "device-spec", label: "Device Specification" }

];

generalDropdowns.forEach(({ id, label }) => {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;

  dropdown.addEventListener("change", () => {
    const selected = dropdown.value;
    const type = document.getElementById("problem-type")?.value?.trim().toLowerCase();

    if (selected !== "add-custom") return;

    if (label === "Device Specification") {
      if (["pc", "printer", "scanner"].includes(type)) {
        // ✅ الأجهزة المعروفة → افتح popup-modal
        popup.style.display = "flex";
        generateFieldsForDeviceType(type);
      } else {
        // ✅ أي نوع جديد (غير معروف) → افتح generic-popup
        openGenericPopup(label, id);
      }
    } else {
      // ✅ بقية الحقول مثل القسم، الفني، الطابق...
      openGenericPopup(label, id);
    }
  });
});


function openGenericPopup(label, targetId) {
  sessionStorage.setItem("lastDropdownOpened", targetId);

  const saveBtn = document.getElementById("popup-save-btn");

  if (label === "Device Specification") {
    const deviceType = document.getElementById("problem-type")?.value?.toLowerCase();

    popupTitle.textContent = "Add Device Specification";
    popupFields.innerHTML = `
    <label>Device Name:</label><input type="text" id="spec-name" />
    <label>Serial Number:</label><input type="text" id="spec-serial" />
    <label>Ministry Number:</label><input type="text" id="spec-ministry" />
  
    <label>Model:</label>
    <div class="dropdown-container">
      <div class="dropdown-wrapper">
        <select id="spec-model"></select>
      </div>
    </div>
  
    <label>Department:</label>
    <div class="dropdown-container">
      <div class="dropdown-wrapper">
        <select id="spec-department">
          <option value="" disabled selected>Loading departments...</option>
        </select>
      </div>
    </div>
  
    <input type="hidden" id="popup-target-id" value="${targetId}" />
  `;
  setTimeout(() => {
    activateGeneralDropdownTools("spec-model", "Model");
    activateGeneralDropdownTools("spec-department", "Department");
  }, 100);
  


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

// ✅ دالة لحفظ الحقول المؤقتة
function saveTemporaryFields() {
  const ids = ["spec-name", "spec-serial", "spec-ministry", "spec-department"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      sessionStorage.setItem(id, el.value);
    }
  });
}




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
  const deviceType = document.getElementById("problem-type").value.toLowerCase();
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

        // ✅ إضافة مباشرة إلى القائمة بدون انتظار fetch
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




// ✅ تعديل شامل لواجهة البوب أب - منع التكرار قبل الإضافة

function saveGenericOption() {
  const value = document.getElementById("popup-input").value.trim(); // 🟢 قيمة المدخلة من المستخدم
  const targetId = document.getElementById("popup-target-id").value; // 🟢 اسم العنصر الهدف (dropdown id)
  const dropdown = document.getElementById(targetId); // 🟢 الدروب داون اللي بنضيف فيه
  const type = document.getElementById("problem-type")?.value?.toLowerCase(); // 🟢 نوع الجهاز (لو مرتبط)

  if (!value || !dropdown) return; // 🔴 خروج لو ما في قيمة أو دروب داون غير معرف

  // 🔄 تحقق أولاً من وجود الخيار قبل الإضافة
  fetch("http://localhost:5050/add-option-general", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: targetId, value, type })
  })
    .then(async res => {
      const payload = await res.json();
      if (!res.ok) {
        // ❌ إذا الرد مو OK، نعرض رسالة الخطأ الجاية من السيرفر
        alert(payload.error || "❌ Failed to save new option");
        throw new Error(payload.error);
      }
      return payload;
    })
    .then(result => {
      // ✅ إذا تمت الإضافة بنجاح نحدث القائمة ونعرض تنبيه
      alert(result.message);

      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      dropdown.appendChild(option); // ✅ إضافة للخيار
      dropdown.value = value; // ✅ تحديده تلقائيًا
      closePopup();
    })
    .catch(err => {
      console.error("❌ Error saving option:", err);
    });
}





// ================== الحقول حسب النوع =====================
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

  fetch("http://localhost:5050/add-option-general", {
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




// ================== حفظ الجهاز =====================
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


// ================== إرسال النموذج =====================
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    DeviceType: document.getElementById("problem-type").value,
    DeviceID: document.getElementById("device-spec").value,
    Section: document.getElementById("section").value,
    Floor: document.getElementById("floor").value,
    ProblemType: document.getElementById("problem-type").value,
    ProblemStatus: document.getElementById("problem-status").value,
    InitialDiagnosis: document.querySelector('input[placeholder="Enter initial diagnosis"]').value,
    FinalDiagnosis: document.querySelector('input[placeholder="Enter final diagnosis"]').value,
    CustomerName: document.querySelector('input[placeholder="Enter customer name"]').value,
    IDNumber: document.querySelector('input[placeholder="Enter ID number"]').value,
    ExtNumber: document.querySelector('input[placeholder="Enter extension number"]').value,
    Technical: document.getElementById("technical").value
  };

  fetch("http://localhost:5050/submit-general-maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      location.reload();  // إعادة تحميل الصفحة بعد الإرسال الناجح

    })
    .catch(err => {
      console.error("❌ Failed to submit form:", err);
      alert("❌ Submission failed");
    });
});

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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools("cpu-select", "CPU");
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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools("ram-select", "RAM");
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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools("os-select", "Operating System");
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

  let endpoint = "http://localhost:5050/add-option-general";
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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools("generation-select", "Processor Generation");
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
      requestAnimationFrame(() => {
        activateGeneralDropdownTools(selectId, "Department");
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
  let container = selectElement.closest('.dropdown-container') || selectElement.parentNode;

  const notification = document.createElement('div');
  notification.className = "notification";
  notification.textContent = message;
  notification.style.color = "#d9534f";
  notification.style.fontSize = "14px";
  notification.style.marginTop = "4px";

  container.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// فتح البوب أب وتعبئة العنوان والنص الحالي
function openPopup(selectId, label) {
  const select = document.getElementById(selectId);
  const selectedOption = select.options[select.selectedIndex];

  if (!selectedOption || selectedOption.disabled || selectedOption.value === "add-custom") {
    showNotification("Please select a valid option to edit.", selectId);
    return;
  }

  sessionStorage.setItem("lastDropdownOpened", selectId); // نستخدمه بعد الإغلاق

  const genericPopup = document.getElementById("generic-popup");
  genericPopup.innerHTML = `
    <div class="popup-content">
      <h3>Edit ${label}</h3>
      <label for="edit-option-input">New ${label}:</label>
      <input type="text" id="edit-option-input" value="${selectedOption.text}" />
      <div class="popup-buttons">
        <button onclick="saveEditedOption('${selectId}', '${selectedOption.text}', '${label}')">Save</button>
        <button onclick="closeGenericPopup()">Cancel</button>
      </div>
    </div>
  `;

  genericPopup.style.display = "flex"; // ✅ تأكد انه العنصر الصحيح
}


// إغلاق البوب أب
// function closePopup() {
//   document.getElementById("popup-modal").style.display = "none";
// }

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
function deleteOption(selectId) {
  const select = document.getElementById(selectId);
  const selectedIndex = select.selectedIndex;
  const selectedOption = select.options[selectedIndex];

  if (!selectedOption || selectedOption.disabled || selectedOption.value === "add-custom") {
    showNotification("Please select a valid option to delete.", selectId);
    return;
  }

  const deletedText = selectedOption.text;
  const deviceType = document.getElementById("problem-type")?.value?.toLowerCase() || "";

  fetch("http://localhost:5050/delete-option-general", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target: selectId,
      value: deletedText,
      type: deviceType
    })
  })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        // If the value is linked to other records, suggest editing
        if (result.error.includes("linked")) {
          if (confirm(`⚠️ ${result.error}\n\nWould you like to edit the value instead?`)) {
            openPopup(selectId, "Value");
          }
        } else {
          showNotification(result.error, selectId);
        }
        return;
      }

      // Remove from DOM
      select.removeChild(selectedOption);

      // Save deleted value to localStorage
      const persistentKey = `deletedOptions_${selectId}`;
      let deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];

      if (!deletedOptions.includes(deletedText)) {
        deletedOptions.push(deletedText);
        localStorage.setItem(persistentKey, JSON.stringify(deletedOptions));
      }

      // Reset the select box to a valid option
      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (!opt.disabled && !opt.value.includes("add-")) {
          select.selectedIndex = i;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }

      showNotification("✅ Deleted: " + deletedText, selectId);
    })
    .catch(err => {
      console.error("❌ Network error:", err);
      showNotification("❌ Failed to connect to the server.", selectId);
    });
}

// دالة تطبق الحذف الدائم عند تحميل الصفحة
function applyDeletions(selectId) {
  const persistentKey = `deletedOptions_${selectId}`;
  const deletedOptions = JSON.parse(localStorage.getItem(persistentKey)) || [];
  const select = document.getElementById(selectId);

  for (let i = select.options.length - 1; i >= 0; i--) {
    if (deletedOptions.includes(select.options[i].text)) {
      select.remove(i);
    }
  }
}

// عند تحميل الصفحة، نطبق الحذف الدائم على القوائم المطلوبة
document.addEventListener("DOMContentLoaded", function() {
  const selectIds = ["problem-type", "section", "device-spec", "floor", "technical", "problem-status"];
  selectIds.forEach(id => {
    if (document.getElementById(id)) {
      applyDeletions(id);
    }
  });
});

function saveEditedOption(selectId, oldValue, label) {
  const newValue = document.getElementById("edit-option-input").value.trim();
  if (!newValue || newValue === oldValue) {
    closeGenericPopup();
    return;
  }

  fetch("http://localhost:5050/update-option-general", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target: selectId,
      oldValue,
      newValue,
      type: document.getElementById("problem-type")?.value?.toLowerCase() || ""
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        const select = document.getElementById(selectId);
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
          selectedOption.text = newValue;
          selectedOption.value = newValue;
        }
        showNotification("✅ Option updated successfully", selectId);
        closeGenericPopup();
      }
       else {
        showNotification(data.error || "❌ Update failed", selectId);
      }
    })
    .catch(err => {
      console.error("❌ Update error:", err);
      showNotification("❌ Failed to update option", selectId);
    });
}



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

  if (wrapper.querySelector(".icon-container")) {
    console.warn(`⚠️ Icons already exist for ${selectId}`);
    return;
  }

  const iconBox = document.createElement("div");
  iconBox.className = "icon-container";

  iconBox.innerHTML = `
    <img src="/icon/search.png" alt="Search" class="search-icon" onclick="toggleSearch('${selectId}')">
    <img src="/icon/edit.png" alt="Edit" class="edit-icon" onclick="event.stopPropagation(); openPopup('${selectId}', '${label}')">
    <img src="/icon/trash.png" alt="Delete" class="trash-icon" onclick="event.stopPropagation(); deleteOption('${selectId}')">
  `;

  wrapper.appendChild(iconBox);
}
