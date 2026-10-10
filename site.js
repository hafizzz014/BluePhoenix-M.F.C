const revealTargets = document.querySelectorAll("[data-reveal]");

if (
  revealTargets.length > 0 &&
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  document.documentElement.classList.add("has-scroll-reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const backToTopButton = document.querySelector(".back-to-top");

if (backToTopButton) {
  function updateBackToTopVisibility() {
    backToTopButton.hidden = window.scrollY <= 200;
  }

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  window.addEventListener("pageshow", updateBackToTopVisibility);

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateBackToTopVisibility();
}

const squadPlayerCount = document.querySelector("[data-squad-player-count]");

if (squadPlayerCount) {
  const playerCount = document.querySelectorAll(".position-player").length;
  squadPlayerCount.textContent = `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
}

const slideshow = document.querySelector("[data-slideshow]");

if (slideshow) {
  const slides = [
    {
      src: "IMG_9721-hero.jpg",
      alt: "Blue Phoenix players standing together in club kit",
    },
    {
      src: "IMG_0201-slideshow.jpg",
      alt: "Blue Phoenix player during a match",
    },
    {
      src: "IMG_2973-slideshow.jpg",
      alt: "Blue Phoenix players in action during a match",
    },
    {
      src: "IMG_2976-slideshow.jpg",
      alt: "Blue Phoenix player competing on the pitch",
    },
    {
      src: "IMG_9712-slideshow.jpg",
      alt: "Blue Phoenix players gathered at the court",
    },
  ];
  const images = slideshow.querySelectorAll(".hero-slide");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeImage = slideshow.querySelector(".hero-slide.is-active");
  let inactiveImage = [...images].find((image) => image !== activeImage);
  let currentIndex = slides.findIndex((slide) => slide.src === activeImage.getAttribute("src"));
  let rotationTimer;
  let nextSlidePromise;

  function preloadSlide(slide) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = slide.src;
    });
  }

  async function findNextLoadedSlide() {
    for (let offset = 1; offset < slides.length; offset += 1) {
      const index = (currentIndex + offset) % slides.length;
      if (await preloadSlide(slides[index])) {
        return { index, slide: slides[index] };
      }
    }

    return null;
  }

  async function showNextSlide() {
    const next = await nextSlidePromise;
    if (!next || document.hidden || reducedMotion.matches) {
      return;
    }

    inactiveImage.src = next.slide.src;
    inactiveImage.alt = next.slide.alt;
    inactiveImage.removeAttribute("aria-hidden");
    inactiveImage.classList.add("is-active");
    activeImage.classList.remove("is-active");
    activeImage.setAttribute("aria-hidden", "true");
    [activeImage, inactiveImage] = [inactiveImage, activeImage];
    currentIndex = next.index;
    nextSlidePromise = findNextLoadedSlide();
  }

  function startSlideshow() {
    if (rotationTimer || document.hidden || reducedMotion.matches) {
      return;
    }

    rotationTimer = window.setInterval(showNextSlide, 30000);
  }

  function stopSlideshow() {
    window.clearInterval(rotationTimer);
    rotationTimer = undefined;
  }

  nextSlidePromise = findNextLoadedSlide();
  startSlideshow();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  });
}
