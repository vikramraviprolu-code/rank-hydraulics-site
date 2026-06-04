const body = document.body;
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll("[data-reveal]");
const mailtoForms = document.querySelectorAll("[data-mail-form]");
const submitForms = document.querySelectorAll("form[action^='https://formsubmit.co/']");
const whatsappLinks = document.querySelectorAll("a[href^='https://wa.me/']");

const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    transport_type: "beacon",
    page_path: window.location.pathname,
    ...params
  });
};

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

    trackEvent("generate_lead", {
      form_id: form.id || "formsubmit_enquiry",
      form_location: form.querySelector("input[name='source_page']")?.value || document.title
    });
  });
});

const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let whatsappFallbackTimer;

document.addEventListener("visibilitychange", () => {
  if (document.hidden && whatsappFallbackTimer) {
    window.clearTimeout(whatsappFallbackTimer);
  }
});

whatsappLinks.forEach((link) => {
  if (!isMobileDevice) return;

  link.addEventListener("click", (event) => {
    const webUrl = new URL(link.href);
    const phone = webUrl.pathname.replace(/\D/g, "");
    const message = webUrl.searchParams.get("text") || "";

    if (!phone) return;

    event.preventDefault();

    const appUrl = new URL("whatsapp://send");
    appUrl.searchParams.set("phone", phone);
    if (message) appUrl.searchParams.set("text", message);

    whatsappFallbackTimer = window.setTimeout(() => {
      if (!document.hidden) window.location.href = webUrl.href;
    }, 900);

    window.location.href = appUrl.href;
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
    trackEvent("contact_click", {
      contact_method: "email_form",
      link_url: `mailto:${target}`
    });
    window.location.href = `mailto:${target}?subject=${subject}&body=${bodyText}`;
  });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href") || "";
  const linkText = link.textContent.trim().replace(/\s+/g, " ").slice(0, 80);

  if (href.startsWith("https://wa.me/")) {
    trackEvent("contact_click", {
      contact_method: "whatsapp",
      link_text: linkText,
      link_url: link.href
    });
    return;
  }

  if (href.startsWith("tel:")) {
    trackEvent("contact_click", {
      contact_method: "phone",
      link_text: linkText,
      link_url: href
    });
    return;
  }

  if (href.startsWith("mailto:")) {
    trackEvent("contact_click", {
      contact_method: "email",
      link_text: linkText,
      link_url: href
    });
    return;
  }

  if (href.endsWith(".html") || href.includes(".html#")) {
    trackEvent("site_navigation_click", {
      link_text: linkText,
      link_url: link.href
    });
  }
});
