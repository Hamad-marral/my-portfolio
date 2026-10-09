// Mobile menu
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
}

// Reveal on scroll
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

// Count-up animation for stat numbers (e.g. "10+")
const countObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const match = el.textContent.trim().match(/^(\d+)(.*)$/);
    obs.unobserve(el);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1200;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll(".stat strong, .about-stats strong").forEach(el => countObs.observe(el));

// Staggered reveal for grouped cards
document.querySelectorAll(".grid-3, .grid-6, .projects, .process").forEach(group => {
  [...group.children].forEach((child, i) => {
    child.style.transitionDelay = (i * 0.08) + "s";
  });
});

// Contact form (sent via FormSubmit)
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const status = document.getElementById("form-status");
  const submitBtn = contactForm.querySelector("button[type=submit]");
  const fallback = document.getElementById("form-fallback");
  const nameInput = contactForm.elements.name;
  const messageInput = contactForm.elements.message;

  const focusForm = (prefill) => {
    if (prefill && !messageInput.value.trim()) messageInput.value = prefill;
    contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (prefill ? messageInput : nameInput).focus({ preventScroll: true }), 400);
  };

  // Prefill from services page links, e.g. contact.html?service=AI%20Agents#message
  const service = new URLSearchParams(location.search).get("service");
  if (service) messageInput.value = `Hi Hamad, I'm interested in your "${service}" service. `;
  if (location.hash === "#message") focusForm();

  // Same-page links (Contact Me, Start a Project, Let's Talk) jump to the form
  document.querySelectorAll('a[href="#message"], a[href="contact.html#message"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      history.replaceState(null, "", "#message");
      focusForm(link.dataset.prefill);
    });
  });

  // Gmail / WhatsApp links carrying the typed message, offered if sending fails
  const showFallback = () => {
    const { name, email, message } = contactForm.elements;
    const text = `${message.value}\n\n— ${name.value} (${email.value})`;
    document.getElementById("fallback-gmail").href =
      "https://mail.google.com/mail/?view=cm&fs=1&to=hammadkhanmarral@gmail.com" +
      "&su=" + encodeURIComponent("Portfolio message from " + name.value) +
      "&body=" + encodeURIComponent(text);
    document.getElementById("fallback-wa").href =
      "https://wa.me/923048876526?text=" + encodeURIComponent(text);
    fallback.hidden = false;
  };

  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    fallback.hidden = true;
    status.className = "form-status";

    if (location.protocol === "file:") {
      status.classList.add("err");
      status.textContent = "The form only works on the live website, not when the file is opened directly. You can send it below instead:";
      showFallback();
      return;
    }

    submitBtn.disabled = true;
    status.textContent = "Sending...";
    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);
      contactForm.reset();
      status.classList.add("ok");
      status.textContent = "Thanks! Your message has been sent. I'll get back to you soon.";
    } catch (err) {
      status.classList.add("err");
      status.textContent = /activat/i.test(err.message)
        ? "This form is waiting for activation. Meanwhile, you can send your message below:"
        : "Couldn't send right now. You can send your message below instead:";
      showFallback();
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
