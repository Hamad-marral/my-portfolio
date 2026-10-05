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

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
