// Simple Customer Form Management
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addCustomerForm")
  const preview = document.getElementById("customerPreview")
  const successModal = document.getElementById("successModal")

  // Form validation rules
  const validationRules = {
    customerName: {
      required: true,
      minLength: 2,
      message: "الاسم يجب أن يكون حرفين على الأقل",
    },
    customerPhone: {
      required: true,
      pattern: /^[0-9]{8}$/,
      message: "رقم الهاتف يجب أن يكون 8 أرقام",
    },
    customerEmail: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "البريد الإلكتروني غير صحيح",
    },
  }

  // Real-time validation and preview
  const formInputs = form.querySelectorAll("input, select, textarea")
  formInputs.forEach((input) => {
    input.addEventListener("input", () => {
      validateField(input)
      updatePreview()
    })
    input.addEventListener("change", () => {
      validateField(input)
      updatePreview()
    })
  })

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    if (validateForm()) {
      saveCustomer()
    }
  })

  // Field validation
  function validateField(field) {
    const fieldName = field.name
    const value = field.value.trim()
    const rules = validationRules[fieldName]

    if (!rules) return true

    let isValid = true
    let errorMessage = ""

    if (rules.required && !value) {
      isValid = false
      errorMessage = "هذا الحقل مطلوب"
    } else if (value && rules.pattern && !rules.pattern.test(value)) {
      isValid = false
      errorMessage = rules.message
    } else if (value && rules.minLength && value.length < rules.minLength) {
      isValid = false
      errorMessage = rules.message
    }

    // Update error display
    const errorElement = document.getElementById(fieldName.replace("customer", "").toLowerCase() + "Error")
    if (errorElement) {
      errorElement.textContent = errorMessage
    }

    field.style.borderColor = isValid ? "#d1d5db" : "#ef4444"
    return isValid
  }

  // Form validation
  function validateForm() {
    let isValid = true
    formInputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false
      }
    })

    const agreeTerms = document.getElementById("agreeTerms")
    if (!agreeTerms.checked) {
      alert("يجب الموافقة على شروط وأحكام الخدمة")
      isValid = false
    }

    return isValid
  }

  // Update preview
  function updatePreview() {
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    if (data.customerName || data.customerPhone) {
      preview.innerHTML = createPreviewHTML(data)
    } else {
      preview.innerHTML = '<p class="preview-placeholder">سيتم عرض معاينة البيانات هنا أثناء الكتابة...</p>'
    }
  }

  // Create preview HTML
  function createPreviewHTML(data) {
    return `
            <div class="preview-info">
                <h4>معاينة بيانات العميل</h4>
                ${data.customerName ? `<div class="info-row"><span class="info-label">الاسم:</span><span class="info-value">${data.customerName}</span></div>` : ""}
                ${data.customerPhone ? `<div class="info-row"><span class="info-label">الهاتف:</span><span class="info-value">${data.customerPhone}</span></div>` : ""}
                ${data.customerEmail ? `<div class="info-row"><span class="info-label">البريد الإلكتروني:</span><span class="info-value">${data.customerEmail}</span></div>` : ""}
                ${data.customerGender ? `<div class="info-row"><span class="info-label">الجنس:</span><span class="info-value">${data.customerGender === "male" ? "ذكر" : "أنثى"}</span></div>` : ""}
                ${data.customerAddress ? `<div class="info-row"><span class="info-label">العنوان:</span><span class="info-value">${data.customerAddress}</span></div>` : ""}
                ${data.emergencyContact ? `<div class="info-row"><span class="info-label">جهة الاتصال للطوارئ:</span><span class="info-value">${data.emergencyContact}</span></div>` : ""}
            </div>
        `
  }

  // Save customer
  async function saveCustomer() {
    const formData = new FormData(form)
    const customerData = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("customers.php?action=add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      if (result.success) {
        successModal.classList.add("show")
        form.reset()
        updatePreview()
      } else {
        alert("Error: " + (result.error || "Failed to save customer"))
      }
    } catch (error) {
      alert("Error: " + error.message)
    }
  }

  // Initialize
  updatePreview()
})

// Reset form function
function resetForm() {
  const form = document.getElementById("addCustomerForm")
  const preview = document.getElementById("customerPreview")

  form.reset()
  preview.innerHTML = '<p class="preview-placeholder">سيتم عرض معاينة البيانات هنا أثناء الكتابة...</p>'

  const errorElements = form.querySelectorAll(".error-message")
  errorElements.forEach((element) => {
    element.textContent = ""
  })

  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.style.borderColor = "#d1d5db"
  })
}

// Add another customer
function addAnotherCustomer() {
  const successModal = document.getElementById("successModal")
  successModal.classList.remove("show")
  resetForm()
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const successModal = document.getElementById("successModal")
  if (e.target === successModal) {
    successModal.classList.remove("show")
  }
})
