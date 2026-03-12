const body = document.body;
const header = document.getElementById("siteHeader");
const preloader = document.getElementById("preloader");
const revealItems = document.querySelectorAll("[data-reveal]");
const tiltCards = document.querySelectorAll(".tilt-card:not(#toolSection)");

const pagePathSvg = document.getElementById("pagePathSvg");
const pagePathBase = document.getElementById("pagePathBase");
const pagePathGlow = document.getElementById("pagePathGlow");

window.addEventListener("load", () => {
  setTimeout(() => {
    body.classList.add("ui-loaded");
  }, 350);

  revealInitial();
  buildDynamicPath();
  updatePathProgress();
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

function buildDynamicPath() {
  if (!pagePathSvg || !pagePathBase || !pagePathGlow) return;

  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );

  const docWidth = Math.max(window.innerWidth, 1440);

  pagePathSvg.setAttribute("viewBox", `0 0 ${docWidth} ${docHeight}`);
  pagePathSvg.setAttribute("width", docWidth);
  pagePathSvg.setAttribute("height", docHeight);

  const sections = [
    ...document.querySelectorAll("main > section"),
    document.querySelector("footer")
  ].filter(Boolean);

  const xRight = Math.min(docWidth - 120, docWidth * 0.86);
  const xMid = Math.min(docWidth - 260, docWidth * 0.72);
  const xWide = Math.min(docWidth - 380, docWidth * 0.60);

  let d = `M ${xRight} 120`;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const midY = top + rect.height * 0.5;

    const bendX1 = index % 2 === 0 ? xMid : xWide;
    const bendX2 = index % 2 === 0 ? xWide : xMid;
    const endX = index % 2 === 0 ? xRight - 20 : xRight - 70;

    d += ` C ${xRight} ${top + 30}, ${bendX1} ${midY - 80}, ${bendX2} ${midY}`;
    d += ` S ${xRight} ${midY + 100}, ${endX} ${top + rect.height - 20}`;
  });

  d += ` C ${xRight - 40} ${docHeight - 220}, ${xRight - 20} ${docHeight - 120}, ${xRight - 80} ${docHeight - 40}`;

  pagePathBase.setAttribute("d", d);
  pagePathGlow.setAttribute("d", d);

  const totalLength = pagePathGlow.getTotalLength();
  pagePathGlow.style.strokeDasharray = totalLength;
  pagePathGlow.style.strokeDashoffset = totalLength;
}

function updatePathProgress() {
  if (!pagePathGlow) return;

  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const totalLength = pagePathGlow.getTotalLength();

  pagePathGlow.style.strokeDashoffset = totalLength * (1 - progress);
}

function debounce(fn, delay = 120) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

window.addEventListener("scroll", () => {
  updateHeader();
  updatePathProgress();
});

window.addEventListener(
  "resize",
  debounce(() => {
    buildDynamicPath();
    updatePathProgress();
  }, 140)
);

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 900) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 3.2;
    const rotateX = ((centerY - y) / centerY) * 3.2;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
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