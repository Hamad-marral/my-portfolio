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

// "Let's Talk" message popup (sent via FormSubmit)
const talkModal = document.createElement("div");
talkModal.className = "talk-modal";
talkModal.hidden = true;
talkModal.innerHTML = `
  <div class="talk-backdrop" data-close></div>
  <div class="talk-dialog" role="dialog" aria-modal="true" aria-labelledby="talk-title">
    <button type="button" class="talk-close" aria-label="Close" data-close>&times;</button>
    <form class="contact-form" id="contact-form" action="https://formsubmit.co/ajax/hammadkhanmarral@gmail.com" method="POST">
      <h3 id="talk-title">Let's Talk</h3>
      <p class="talk-sub">Drop a message and I'll get back to you by email.</p>
      <input type="hidden" name="_subject" value="New message from portfolio" />
      <input type="hidden" name="_template" value="table" />
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" />
      <div class="form-row">
        <label>Name<input type="text" name="name" required placeholder="Your name" /></label>
        <label>Email<input type="email" name="email" required placeholder="you@example.com" /></label>
      </div>
      <label>Message<textarea name="message" rows="5" required placeholder="Tell me about your project..."></textarea></label>
      <button type="submit" class="btn btn-primary btn-sm">Send Message &rarr;</button>
      <p class="form-status" role="status"></p>
      <div class="form-fallback" hidden>
        <a href="#" class="btn btn-sm" data-fallback="gmail" target="_blank" rel="noopener">Send via Gmail &rarr;</a>
        <a href="#" class="btn btn-sm" data-fallback="wa" target="_blank" rel="noopener">Send on WhatsApp &rarr;</a>
      </div>
    </form>
  </div>`;
document.body.appendChild(talkModal);

const contactForm = talkModal.querySelector("form");
const formStatus = contactForm.querySelector(".form-status");
const formFallback = contactForm.querySelector(".form-fallback");
const submitBtn = contactForm.querySelector("button[type=submit]");
let lastTrigger = null;

const openTalk = (prefill) => {
  const msg = contactForm.elements.message;
  if (prefill && !msg.value.trim()) msg.value = prefill;
  talkModal.hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => (prefill ? msg : contactForm.elements.name).focus(), 50);
};
const closeTalk = () => {
  talkModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (location.hash === "#message") history.replaceState(null, "", location.pathname + location.search);
  if (lastTrigger) lastTrigger.focus();
};

talkModal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeTalk(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !talkModal.hidden) closeTalk(); });

// Any link ending in #message opens the popup (Let's Talk, Contact Me, Start a Project, Get This Service)
document.addEventListener("click", e => {
  const link = e.target.closest('a[href$="#message"]');
  if (!link) return;
  e.preventDefault();
  lastTrigger = link;
  const service = new URL(link.href).searchParams.get("service");
  openTalk(service ? `Hi Hamad, I'm interested in your "${service}" service. ` : link.dataset.prefill);
});
if (location.hash === "#message") openTalk();

// Gmail / WhatsApp links carrying the typed message, offered if sending fails
const showFallback = () => {
  const { name, email, message } = contactForm.elements;
  const text = `${message.value}\n\n— ${name.value} (${email.value})`;
  formFallback.querySelector('[data-fallback="gmail"]').href =
    "https://mail.google.com/mail/?view=cm&fs=1&to=hammadkhanmarral@gmail.com" +
    "&su=" + encodeURIComponent("Portfolio message from " + name.value) +
    "&body=" + encodeURIComponent(text);
  formFallback.querySelector('[data-fallback="wa"]').href =
    "https://wa.me/923048876526?text=" + encodeURIComponent(text);
  formFallback.hidden = false;
};

contactForm.addEventListener("submit", async e => {
  e.preventDefault();
  formFallback.hidden = true;
  formStatus.className = "form-status";

  if (location.protocol === "file:") {
    formStatus.classList.add("err");
    formStatus.textContent = "The form only works on the live website, not when the file is opened directly. You can send it below instead:";
    showFallback();
    return;
  }

  submitBtn.disabled = true;
  formStatus.textContent = "Sending...";
  try {
    const res = await fetch(contactForm.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);
    contactForm.reset();
    formStatus.classList.add("ok");
    formStatus.textContent = "Thanks! Your message has been sent. I'll get back to you soon.";
  } catch (err) {
    formStatus.classList.add("err");
    formStatus.textContent = /activat/i.test(err.message)
      ? "This form is waiting for activation. Meanwhile, you can send your message below:"
      : "Couldn't send right now. You can send your message below instead:";
    showFallback();
  } finally {
    submitBtn.disabled = false;
  }
});

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
