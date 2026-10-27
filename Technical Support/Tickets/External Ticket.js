/**
 * Toggles the visibility of the "Other Department" input field.
 * Shows the input only when the user selects "Other" from the department dropdown.
 */
function toggleOtherDepartment() {
  // Get references to the department dropdown and the custom input field
  var departmentSelect = document.getElementById("departmentSelect");
  var otherDepartment = document.getElementById("otherDepartment");
// 🔙 Back button - navigates to the previous page in history
document.querySelector(".back-button").addEventListener("click", () => window.history.back()); 
  // Check if the selected value is "Other"
  if (departmentSelect.value === "Other") {
      otherDepartment.style.display = "block";          // Show the input field
      otherDepartment.setAttribute("required", "true"); // Make it a required field
  } else {
      otherDepartment.style.display = "none";           // Hide the input field
      otherDepartment.removeAttribute("required");      // Remove required attribute
  }
}



fetch("http://10.99.28.16:5050/Departments")
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


// التعامل مع منطقة رفع الملفات باستخدام Drag & Drop والنقر

// الحصول على عناصر السحب والإفلات وعناصر الـ input المخفي
const dropArea = document.getElementById("drop-area");
const uploadFileInput = document.getElementById("upload-file");

// عند النقر على منطقة الرفع، يتم تفعيل اختيار الملفات
dropArea.addEventListener("click", () => {
uploadFileInput.click();
});

// التعامل مع سحب الملفات فوق منطقة الرفع
dropArea.addEventListener("dragover", (e) => {
e.preventDefault(); // منع السلوك الافتراضي (مثلاً فتح الملف في المتصفح)
dropArea.classList.add("drag-over"); // تفعيل تأثير بصري عند السحب
});

// عند مغادرة الملفات للمنطقة (دون إفلاتها)
dropArea.addEventListener("dragleave", (e) => {
e.preventDefault();
dropArea.classList.remove("drag-over"); // إزالة التأثير البصري
});

// عند إفلات الملفات داخل منطقة الرفع
dropArea.addEventListener("drop", (e) => {
e.preventDefault();
dropArea.classList.remove("drag-over"); // إزالة التأثير البصري
const files = e.dataTransfer.files;
handleFiles(files);
});

// عند اختيار الملفات باستخدام متصفح الملفات (عن طريق الـ input المخفي)
uploadFileInput.addEventListener("change", (e) => {
const files = e.target.files;
handleFiles(files);
});

/**
* دالة للتعامل مع الملفات المختارة وإرسالها للسيرفر
* @param {FileList} files - قائمة الملفات المختارة
*/
function handleFiles(files) {
// إنشاء كائن FormData لتجميع الملفات
const formData = new FormData();

// إضافة كل ملف إلى formData
for (let i = 0; i < files.length; i++) {
  formData.append("files", files[i]);
}

// إرسال الملفات للسيرفر عبر طلب POST باستخدام fetch
// تأكد من تعديل الرابط التالي (URL) ليناسب إعدادات السيرفر لديك
fetch("http://10.99.28.16:5050/upload", {
  method: "POST",
  body: formData
})
  .then(response => response.json())
  .then(result => {
    console.log("Upload successful!", result);
    // يمكنك هنا عرض رسالة نجاح أو تحديث الواجهة بحسب النتيجة
  })
  .catch(error => {
    console.error("Upload error:", error);
    // يمكنك هنا تقديم رسالة للمستخدم عند حدوث خطأ ما
  });
}

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

