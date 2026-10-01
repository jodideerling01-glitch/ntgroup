(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const dropdowns = [...document.querySelectorAll(".nav-dropdown")];
  const yearNode = document.querySelector("#current-year");
  const revealItems = document.querySelectorAll(".reveal");
  const form = document.querySelector("#enquiry-form");
  const formStatus = document.querySelector("#form-status");

  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const setMenu = (open) => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (!open) dropdowns.forEach(d => {
      d.classList.remove("is-open");
      d.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  };

  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(".dropdown-toggle");
    toggle?.addEventListener("click", event => {
      event.preventDefault();
      const open = !dropdown.classList.contains("is-open");
      dropdowns.forEach(d => {
        d.classList.remove("is-open");
        d.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
      dropdown.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".nav-dropdown")) dropdowns.forEach(d => d.classList.remove("is-open"));
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });

  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 16);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: "0px 0px -35px" });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add("is-visible"));

  const validateField = field => {
    const wrapper = field.closest(".field");
    let valid = true;
    if (field.required && !field.value.trim()) valid = false;
    if (field.type === "email" && field.value.trim()) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    wrapper?.classList.toggle("has-error", !valid);
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  };
  form?.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => validateField(field));
  });
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const required = [...form.querySelectorAll("[required]")];
    const valid = required.map(validateField).every(Boolean);
    if (!valid) { required.find(f => f.getAttribute("aria-invalid") === "true")?.focus(); return; }
    const data = new FormData(form);
    const subject = `NT Group website enquiry: ${data.get("interest")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Company / Mine: ${data.get("company") || "Not supplied"}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not supplied"}`,
      `Area of interest: ${data.get("interest")}`,
      "",
      "Project details:",
      data.get("message")
    ].join("\n");
    if (formStatus) {
      formStatus.className = "form-status is-visible is-success";
      formStatus.textContent = "Your email application is opening with the enquiry details prepared.";
    }
    window.location.href = `mailto:info@ntgroup.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
