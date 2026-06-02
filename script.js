const body = document.body;
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll("[data-reveal]");
const mailtoForms = document.querySelectorAll("[data-mail-form]");
const submitForms = document.querySelectorAll("form[action^='https://formsubmit.co/']");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

submitForms.forEach((form) => {
  form.addEventListener("submit", () => {
    const status = form.querySelector("[data-form-status]");
    if (status) status.textContent = "Sending your enquiry to Rank Hydraulics.";
  });
});

mailtoForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");

    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) status.textContent = "Please complete the required fields.";
      return;
    }

    const target = form.dataset.mailto || "sales@rankhydraulics.com";
    const data = new FormData(form);
    const lines = [];

    data.forEach((value, key) => {
      lines.push(`${key.replaceAll("_", " ")}: ${value}`);
    });

    const subject = encodeURIComponent("Rank Hydraulics enquiry");
    const bodyText = encodeURIComponent(lines.join("\n"));

    if (status) status.textContent = "Opening your email app with the enquiry details.";
    window.location.href = `mailto:${target}?subject=${subject}&body=${bodyText}`;
  });
});
