const body = document.body;
const header = document.getElementById("siteHeader");
const preloader = document.getElementById("preloader");
const revealItems = document.querySelectorAll("[data-reveal]");
const tiltCards = document.querySelectorAll(".tilt-card");

window.addEventListener("load", () => {
  setTimeout(() => {
    body.classList.add("ui-loaded");
  }, 450);

  revealInitial();
});

function revealInitial() {
  revealItems.forEach((item, index) => {
    const delay = item.dataset.delay ? parseInt(item.dataset.delay, 10) : index * 50;
    item.style.setProperty("--reveal-delay", `${delay}ms`);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item) => observer.observe(item));

window.addEventListener("scroll", () => {
  if (!header) return;

  if (window.scrollY > 18) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 900) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = ((centerY - y) / centerY) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

/* subtle parallax for background orbs */
const orbs = document.querySelectorAll(".bg-orb");

window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 16;

  orbs.forEach((orb, index) => {
    const factor = (index + 1) * 0.6;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

/* small polish for nav active based on scroll sections is not required now,
   but this keeps interaction smooth and premium-feeling. */

if (preloader) {
  setTimeout(() => {
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
  }, 1500);
}