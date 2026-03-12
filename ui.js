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

  const rightEdge = docWidth * 0.86;
  const rightInner = docWidth * 0.78;
  const centerRight = docWidth * 0.67;
  const centerLeft = docWidth * 0.36;
  const leftInner = docWidth * 0.18;

  let d = `M ${rightInner} 120`;
  let currentX = rightInner;
  let currentY = 120;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const height = rect.height;
    const bottom = top + height;

    const entryY = top + Math.min(60, height * 0.12);
    const midY = top + height * 0.45;
    const exitY = bottom - Math.min(50, height * 0.12);

    const isWideSweep = index % 3 === 1;
    const goLeft = index % 2 === 0;

    const sweepX = isWideSweep
      ? (goLeft ? leftInner : rightEdge)
      : (goLeft ? centerLeft : centerRight);

    const returnX = goLeft ? centerRight : centerLeft;
    const endX = goLeft ? rightInner : rightEdge - 40;

    d += ` C ${currentX} ${currentY + 40}, ${currentX} ${entryY - 30}, ${currentX} ${entryY}`;

    d += ` C ${currentX} ${entryY + 20}, ${sweepX} ${entryY + 40}, ${sweepX} ${midY}`;

    d += ` S ${returnX} ${exitY - 40}, ${returnX} ${exitY}`;

    d += ` C ${returnX} ${exitY + 10}, ${endX} ${exitY + 10}, ${endX} ${exitY + 40}`;

    currentX = endX;
    currentY = exitY + 40;
  });

  const footer = document.querySelector("footer");
  if (footer) {
    const rect = footer.getBoundingClientRect();
    const footerTop = rect.top + window.scrollY;
    const footerMid = footerTop + rect.height * 0.45;

    d += ` C ${currentX} ${currentY + 40}, ${centerRight} ${footerTop - 30}, ${centerRight} ${footerMid}`;
    d += ` C ${centerRight} ${footerMid + 30}, ${rightInner} ${footerMid + 20}, ${rightInner} ${footerTop + rect.height - 24}`;
  } else {
    d += ` C ${currentX} ${currentY + 40}, ${rightInner} ${docHeight - 160}, ${rightInner} ${docHeight - 40}`;
  }

  pagePathBase.setAttribute("d", d);
  pagePathGlow.setAttribute("d", d);

  const totalLength = pagePathGlow.getTotalLength();
  pagePathGlow.style.strokeDasharray = totalLength;
  pagePathGlow.style.strokeDashoffset = totalLength;
}

function updatePathProgress() {
  if (!pagePathGlow) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
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