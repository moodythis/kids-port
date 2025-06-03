// Simple Package Form Management
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addPackageForm")
  const preview = document.getElementById("packagePreview")
  const successModal = document.getElementById("successModal")

  // Form validation rules
  const validationRules = {
    packageName: {
      required: true,
      minLength: 3,
      message: "اسم الباقة يجب أن يكون 3 أحرف على الأقل",
    },
    packagePrice: {
      required: true,
      min: 0.001,
      message: "السعر يجب أن يكون أكبر من 0",
    },
    packageDescription: {
      required: true,
      minLength: 10,
      message: "الوصف يجب أن يكون 10 أحرف على الأقل",
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

  // Color selection
  const colorInputs = form.querySelectorAll('input[name="packageColor"]')
  colorInputs.forEach((input) => {
    input.addEventListener("change", updatePreview)
  })

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    if (validateForm()) {
      savePackage()
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
    } else if (value && rules.minLength && value.length < rules.minLength) {
      isValid = false
      errorMessage = rules.message
    } else if (value && rules.min && Number.parseFloat(value) < rules.min) {
      isValid = false
      errorMessage = rules.message
    }

    // Update error display
    const errorElement = document.getElementById(fieldName.replace("package", "").toLowerCase() + "Error")
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
    return isValid
  }

  // Update preview
  function updatePreview() {
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    const selectedColor = form.querySelector('input[name="packageColor"]:checked')?.value || "bg-blue"
    const includes = Array.from(form.querySelectorAll('input[name="includes"]:checked')).map((cb) => cb.value)

    updatePreviewCard(data, selectedColor, includes)
  }

  // Update preview card
  function updatePreviewCard(data, color, includes) {
    const previewColor = document.getElementById("previewColor")
    const previewName = document.getElementById("previewName")
    const previewDescription = document.getElementById("previewDescription")
    const previewPrice = document.getElementById("previewPrice")
    const previewDuration = document.getElementById("previewDuration")
    const previewDurationText = document.getElementById("previewDurationText")
    const previewIncludes = document.getElementById("previewIncludes")

    // Update color
    previewColor.className = `product-color ${color}`

    // Update name
    previewName.textContent = data.packageName || "اسم الباقة"

    // Update description
    previewDescription.textContent = data.packageDescription || "وصف الباقة"

    // Update price
    const price = Number.parseFloat(data.packagePrice) || 0
    previewPrice.textContent = `${price.toFixed(3)} د.ب`

    // Update duration
    const duration = Number.parseInt(data.packageDuration) || 0
    if (duration > 0) {
      previewDuration.style.display = "inline-flex"
      previewDurationText.textContent = `${duration} دقيقة`
    } else {
      previewDuration.style.display = "none"
    }

    // Update includes
    if (includes.length > 0) {
      const includesText = {
        playground: "منطقة الألعاب",
        trampolines: "الترامبولين",
        slides: "الزحاليق",
        ballpit: "حوض الكرات",
        food: "وجبة طعام",
        drinks: "مشروبات",
      }

      previewIncludes.innerHTML = `
                <h5>ما تشمله الباقة:</h5>
                <div class="include-list">
                    ${includes.map((include) => `<span class="include-tag">${includesText[include] || include}</span>`).join("")}
                </div>
            `
    } else {
      previewIncludes.innerHTML = ""
    }
  }

  // Save package
  async function savePackage() {
    const formData = new FormData(form)
    const packageData = Object.fromEntries(formData.entries())

    // Process checkboxes and numeric values
    packageData.color = form.querySelector('input[name="packageColor"]:checked')?.value || "bg-blue"
    packageData.includes = Array.from(form.querySelectorAll('input[name="includes"]:checked')).map((cb) => cb.value)
    packageData.price = Number.parseFloat(packageData.packagePrice)
    packageData.duration = Number.parseInt(packageData.packageDuration) || 0
    packageData.active = packageData.packageActive === "on"
    packageData.featured = packageData.packageFeatured === "on"

    try {
      const response = await fetch("packages.php?action=add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      })

      const result = await response.json()

      if (result.success) {
        successModal.classList.add("show")
        form.reset()
        updatePreview()
      } else {
        alert("Error: " + (result.error || "Failed to save package"))
      }
    } catch (error) {
      alert("Error: " + error.message)
    }
  }

  // Initialize preview
  updatePreview()
})

// Reset form function
function resetForm() {
  const form = document.getElementById("addPackageForm")

  form.reset()

  const firstColorOption = form.querySelector('input[name="packageColor"]')
  if (firstColorOption) {
    firstColorOption.checked = true
  }

  const errorElements = form.querySelectorAll(".error-message")
  errorElements.forEach((element) => {
    element.textContent = ""
  })

  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.style.borderColor = "#d1d5db"
  })

  const event = new Event("input")
  form.querySelector("#packageName").dispatchEvent(event)
}

// Add another package
function addAnotherPackage() {
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
