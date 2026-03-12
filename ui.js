const body = document.body;
const header = document.getElementById("siteHeader");
const preloader = document.getElementById("preloader");
const revealItems = document.querySelectorAll("[data-reveal]");
const tiltCards = document.querySelectorAll(".tilt-card:not(#toolSection)");
const scrollPathGlow = document.getElementById("scrollPathGlow");

window.addEventListener("load", () => {
  setTimeout(() => {
    body.classList.add("ui-loaded");
  }, 350);

  revealInitial();
  updateScrollPath();
  updateHeader();
});

function revealInitial() {
  revealItems.forEach((item, index) => {
    const delay = item.dataset.delay ? parseInt(item.dataset.delay, 10) : index * 45;
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

function updateHeader() {
  if (!header) return;
  if (window.scrollY > 16) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

function updateScrollPath() {
  if (!scrollPathGlow) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  const pathLength = 1000;
  const offset = pathLength - progress * pathLength;
  scrollPathGlow.style.strokeDashoffset = offset;
}

window.addEventListener("scroll", () => {
  updateHeader();
  updateScrollPath();
});

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 900) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 4;
    const rotateX = ((centerY - y) / centerY) * 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
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

if (preloader) {
  setTimeout(() => {
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
  }, 1200);
}