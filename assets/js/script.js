'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.dataset.filterValue;
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const placeholderProjectLinks = document.querySelectorAll('.project-link[href="#"]');

placeholderProjectLinks.forEach(function (link) {
  link.addEventListener("click", function (event) { event.preventDefault(); });
});

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (filterItems[i].dataset.category.split(" ").includes(selectedValue)) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.dataset.filterValue;
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}




// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const toast = document.querySelector("[data-toast]");

// toast message
let toastTimer;

const showToast = function (message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3500);
}

// a field is invalid when it fails validation or only contains spaces
// stricter than the browser's own email check, which accepts "name@host"
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// a field is invalid when it is empty (or only spaces), or when an email is malformed
const isFieldInvalid = function (input) {
  const value = input.value.trim();

  if (!value) { return true; }
  if (input.type === "email") { return !emailPattern.test(value); }

  return !input.checkValidity();
}

// inline warning under the email field, only for a non-empty, malformed address
const emailInput = form.querySelector("[type='email']");
const emailError = document.querySelector("[data-email-error]");

const validateEmail = function () {
  // an empty email is flagged by the send attempt (red border), not by this message
  if (emailInput.value.trim() === "") {
    emailError.hidden = true;
    return;
  }

  const isBad = isFieldInvalid(emailInput);

  emailError.hidden = !isBad;
  emailInput.classList.toggle("is-invalid", isBad);
  emailInput.setAttribute("aria-invalid", String(isBad));
}

// check when the user leaves the field, then keep it in sync while they correct it
emailInput.addEventListener("blur", validateEmail);

emailInput.addEventListener("input", function () {
  if (!emailError.hidden || !isFieldInvalid(this)) { validateEmail(); }
});

// the button stays clickable, it only looks inactive until the form is complete
const updateFormState = function () {
  const isComplete = ![...formInputs].some(isFieldInvalid);

  formBtn.classList.toggle("is-incomplete", !isComplete);
  formBtn.setAttribute("aria-disabled", String(!isComplete));
}

// update the button and clear the warning on a field as the user fixes it
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    if (!isFieldInvalid(this)) { this.classList.remove("is-invalid"); }

    updateFormState();

  });
}

// stop the send and explain what is missing
form.addEventListener("submit", function (event) {

  const invalidInputs = [...formInputs].filter(isFieldInvalid);

  if (invalidInputs.length === 0) { return; }

  event.preventDefault();

  formInputs.forEach(function (input) { input.classList.remove("is-invalid"); });

  invalidInputs.forEach(function (input) {
    // restart the shake animation on repeated attempts
    void input.offsetWidth;
    input.classList.add("is-invalid");
  });

  invalidInputs[0].focus();

  validateEmail();

  const hasEmptyField = invalidInputs.some(function (input) { return !input.value.trim(); });

  showToast(
    hasEmptyField
      ? "Please fill in all the fields before sending."
      : "Please enter a valid email address."
  );

});

window.addEventListener("pageshow", function (event) {
  const navigation = performance.getEntriesByType("navigation")[0];

  if (event.persisted || (navigation && navigation.type === "back_forward")) {
    form.reset();
    formInputs.forEach(function (input) { input.classList.remove("is-invalid"); });
    formInputs.forEach(function (input) { input.classList.remove("is-invalid"); });
    validateEmail();
    updateFormState();
  }
});

const imagePreviewDialog = document.querySelector("[data-image-preview-dialog]");
const imagePreviewTarget = document.querySelector("[data-image-preview-target]");
const imagePreviewClose = document.querySelector("[data-image-preview-close]");
const imagePreviewStage = document.querySelector("[data-image-preview-stage]");
const imagePreviewCanvas = document.querySelector("[data-image-preview-canvas]");
const imageZoomLevel = document.querySelector("[data-image-zoom-level]");
const imageZoomIn = document.querySelector("[data-image-zoom-in]");
const imageZoomOut = document.querySelector("[data-image-zoom-out]");
const imageZoomFit = document.querySelector("[data-image-zoom-fit]");
const imagePreviewButtons = document.querySelectorAll("[data-image-preview]");
let imageZoom = 1;
let imageFitSize = { width: 0, height: 0 };

const updateImagePreviewSize = function () {
  if (!imagePreviewTarget.naturalWidth || !imagePreviewTarget.naturalHeight) { return; }

  const availableWidth = imagePreviewStage.clientWidth;
  const availableHeight = imagePreviewStage.clientHeight;
  const fitScale = Math.min(
    availableWidth / imagePreviewTarget.naturalWidth,
    availableHeight / imagePreviewTarget.naturalHeight
  );

  imageFitSize = {
    width: imagePreviewTarget.naturalWidth * fitScale,
    height: imagePreviewTarget.naturalHeight * fitScale
  };

  const imageWidth = imageFitSize.width * imageZoom;
  const imageHeight = imageFitSize.height * imageZoom;

  imagePreviewCanvas.style.width = `${Math.max(availableWidth, imageWidth)}px`;
  imagePreviewCanvas.style.height = `${Math.max(availableHeight, imageHeight)}px`;
  imagePreviewTarget.style.width = `${imageWidth}px`;
  imagePreviewTarget.style.height = `${imageHeight}px`;
  imageZoomLevel.textContent = imageZoom === 1 ? "Fit" : `${Math.round(imageZoom * 100)}%`;

  imagePreviewStage.scrollLeft = Math.max(0, (imagePreviewCanvas.offsetWidth - availableWidth) / 2);
  imagePreviewStage.scrollTop = Math.max(0, (imagePreviewCanvas.offsetHeight - availableHeight) / 2);
}

const setImageZoom = function (zoom) {
  imageZoom = Math.min(4, Math.max(0.25, zoom));
  updateImagePreviewSize();
}

imagePreviewButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const sourceImage = button.closest(".achievement-card").querySelector(".project-image");

    imageZoom = 1;
    imagePreviewTarget.src = sourceImage.src;
    imagePreviewTarget.alt = sourceImage.alt;
    imagePreviewDialog.showModal();
    requestAnimationFrame(updateImagePreviewSize);
    imagePreviewClose.focus();
  });
});

imagePreviewTarget.addEventListener("load", updateImagePreviewSize);

imagePreviewClose.addEventListener("click", function () {
  imagePreviewDialog.close();
});

imageZoomIn.addEventListener("click", function () {
  setImageZoom(imageZoom + 0.25);
});

imageZoomOut.addEventListener("click", function () {
  setImageZoom(imageZoom - 0.25);
});

imageZoomFit.addEventListener("click", function () {
  setImageZoom(1);
});

imagePreviewDialog.addEventListener("click", function (event) {
  if (event.target === imagePreviewDialog) {
    imagePreviewDialog.close();
  }
});

imagePreviewDialog.addEventListener("keydown", function (event) {
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    setImageZoom(imageZoom + 0.25);
  } else if (event.key === "-") {
    event.preventDefault();
    setImageZoom(imageZoom - 0.25);
  } else if (event.key === "0") {
    event.preventDefault();
    setImageZoom(1);
  }
});

window.addEventListener("resize", function () {
  if (imagePreviewDialog.open) {
    updateImagePreviewSize();
  }
});




// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}