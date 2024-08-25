document.addEventListener("DOMContentLoaded", (event) => {
  //#region GSAP registration
  gsap.registerPlugin(ScrollTrigger);
  //#endregion GSAP registration

  //#region Mouse trailer
  const trailer = document.getElementById("trailer");
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let mouseX = windowWidth / 2;
  let mouseY = windowHeight / 2;
  let trailerX = windowWidth / 2;
  let trailerY = windowHeight / 2;

  const speed = 0.1;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    let distX = mouseX - trailerX;
    let distY = mouseY - trailerY;

    trailerX += distX * speed;
    trailerY += distY * speed;

    trailer.style.left = `${trailerX}px`;
    trailer.style.top = `${trailerY}px`;

    requestAnimationFrame(animate);
  }

  animate();

  const targetElements = document.querySelectorAll(
    "a , button, input, select, textarea"
  );

  targetElements.forEach((element) => {
    element.addEventListener("mouseover", () => {
      trailer.style.setProperty("--cursor-size", "0px");
      trailer.style.setProperty("--cursor-opacity", "0");
    });

    element.addEventListener("mouseout", () => {
      trailer.style.setProperty("--cursor-size", "40px");
      trailer.style.setProperty("--cursor-opacity", "1");
    });
  });

  function isTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  if (isTouchDevice()) {
    trailer.classList.add("hide-cursor-trailer");
  }
  //#endregion Mouse trailer

  //#region Smooth scroll
  const scroll = new LocomotiveScroll({
    el: document.querySelector("[data-scroll-container]"),
    smooth: true,
    multiplier: 0.8, // Adjust this value
    gestureDirection: "both", // Can be 'vertical' or 'both'
    lerp: 0.05, // Lower values make it smoother but slower
    smartphone: {
      smooth: true,
      lerp: 0.075,
    },
    tablet: {
      smooth: true,
      lerp: 0.075,
    },
  });
  //#endregion Smooth scroll

  //#region Reveal words
  const revealWords = document.querySelectorAll(".revealwords");
  revealWords.forEach((element) => {
    // Split the text into words
    const words = element.textContent.trim().split(/\s+/);

    // Wrap each word in a span
    element.innerHTML = words
      .map(
        (word) =>
          `<span class="reveal-word"><span class="reveal-word-inner">${word}</span></span>`
      )
      .join(" ");

    // Create the reveal animation
    gsap.from(element.querySelectorAll(".reveal-word-inner"), {
      yPercent: 100,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%", // Starts when the top of the element hits 80% from the top of the viewport
        toggleActions: "play none none none",
      },
    });
  });
  //#endregion Reveal words

  //#region Reveal lines
  if ($(".reveallines").length) {
    let resizeTimer;

    function initRevealLines() {
      // Kill all existing ScrollTriggers related to reveal lines
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger.classList.contains("reveallines")) {
          st.kill();
        }
      });

      // Select all elements with class 'reveallines'
      const revealLines = document.querySelectorAll(".reveallines");

      revealLines.forEach((element) => {
        // Split the text into lines
        const lines = splitTextIntoLines(element);

        // Wrap each line in a span
        element.innerHTML = lines
          .map(
            (line) =>
              `<span class="reveal-line"><span class="reveal-line-inner">${line}</span></span>`
          )
          .join("");

        // Create the reveal animation
        gsap.from(element.querySelectorAll(".reveal-line-inner"), {
          yPercent: 100,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    }

    // Function to split text into lines
    function splitTextIntoLines(element) {
      const words = element.textContent.split(/(\s+)/);
      const lines = [];
      let currentLine = [];

      const temp = document.createElement("span");
      temp.style.visibility = "hidden";
      temp.style.position = "absolute";
      temp.style.whiteSpace = "nowrap";
      temp.style.font = getComputedStyle(element).font;
      document.body.appendChild(temp);

      words.forEach((word) => {
        currentLine.push(word);
        temp.textContent = currentLine.join("");

        if (temp.offsetWidth > element.offsetWidth) {
          currentLine.pop();
          lines.push(currentLine.join(""));
          currentLine = [word];
        }
      });

      if (currentLine.length > 0) {
        lines.push(currentLine.join(""));
      }

      document.body.removeChild(temp);
      return lines;
    }

    // Initialize reveal lines on load
    initRevealLines();

    // Reinitialize reveal lines on window resize
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initRevealLines();
      }, 250);
    });
  }
  //#endregion Reveal lines

  //#region Page transition
  function pageTransition(url) {
    return new Promise((resolve) => {
      const overlay = document.getElementById("page-transition-overlay");
      const tl = gsap.timeline();

      // Exit transition: Move overlay up from bottom to cover the screen
      tl.fromTo(
        overlay,
        { height: "0%", bottom: "0", top: "auto" },
        { duration: 0.5, height: "100%", ease: "power4.inOut" }
      );

      // Add a pause
      tl.to({}, { duration: 0.2 });

      // Change page after the pause
      tl.add(() => {
        window.location.href = url;
      });
    });
  }

  // Use this function for all anchor elements with an href attribute
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (e) => {
      // Check if it's an internal link
      if (link.host === window.location.host) {
        // New check: Is it a link to a section on the same page?
        const currentPath = window.location.pathname + window.location.search;
        const linkPath = link.pathname + link.search;
        const isHashLink = currentPath === linkPath && link.hash !== "";

        if (!isHashLink) {
          e.preventDefault();
          pageTransition(link.href);
        }
        // If it's a hash link, let it behave normally
      }
      // External links will behave normally
    });
  });

  // Handle the transition when the new page loads
  window.addEventListener("load", () => {
    const overlay = document.getElementById("page-transition-overlay");

    // Ensure the overlay is covering the screen when the new page loads
    overlay.style.height = "100%";
    overlay.style.top = "0";
    overlay.style.bottom = "auto";

    // Animate the overlay to move upwards, revealing the new page
    gsap.to(overlay, {
      duration: 0.5,
      top: "-100%",
      delay: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        // After moving up, reset the overlay for the next transition
        overlay.style.height = "0";
        overlay.style.top = "auto";
        overlay.style.bottom = "0";
      },
    });
  });
  //#endregion Page transition

  let tl = gsap.timeline();

  tl.from(".nav-logo img", {
    y: -200,
    opacity: 0,
    duration: 0.5,
    delay: 0.5,
  });

  tl.from(".nav-menu a", {
    x: 200,
    stagger: 0.1,
    opacity: 0,
    duration: 0.5,
  });
});

var logo = $(".nav-logo img");
var menuItems = $(".nav-menu .menu-item");

$(window).on("scroll", function () {
  if ($(window).scrollTop() > 120) {
    // Animate logo and menu items to go up and fade out
    gsap.to(logo, { y: -250, opacity: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(menuItems, {
      x: 200,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  } else {
    // Animate logo and menu items to return to original position and fade in
    gsap.to(logo, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.to(menuItems, {
      x: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  }
});

gsap.from(".header-img .car", {
  x: 500,
  scale: 0.4,
  opacity: 0,
});

gsap.from(".header-img .car-bg", {
  opacity: 0,
  scale: 0,
  duration: 0.8,
});

gsap.to(".services .services-right", {
  y: "-70%",
  scrollTrigger: {
    trigger: ".services",
    scrub: 2,
    pin: true,
    start: "top 0%",
  },
});

gsap.from(".about-img .about-car", {
  y: -300,
  scale: 0.3,
  duration: 1,
  scrollTrigger: {
    trigger: ".about",
    scroller: "body",
    start: "top 50%",
    end: "top 0%",
    scrub: 2,
  },
});

gsap.to(".about-img .about-circle", {
  transform: "translate(-50%,-50%) scale(1)",
  duration: 1,
  scrollTrigger: {
    trigger: ".about",
    scroller: "body",
    start: "top 50%",
    end: "top 0%",
    scrub: 2,
  },
  transformOrigin: "center center",
});

// REVIEW SECTION

const revTab = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");
const progressBar = document.querySelector(".progress");
let activeIndex = 0;
const tabCount = revTab.length;
const switchInterval = 8000; // 4 seconds

// Function to switch revTab
function switchTab(index) {
  revTab.forEach((tab) => tab.classList.remove("active"));
  contents.forEach((content) => content.classList.remove("active"));

  revTab[index].classList.add("active");
  contents[index].classList.add("active");

  activeIndex = index;
  updateProgressBar();
}

// Function to update progress bar
function updateProgressBar() {
  const progressPercentage = ((activeIndex + 1) / tabCount) * 100;
  progressBar.style.height = progressPercentage + "%";
}

// Auto switch revTab every 4 seconds
setInterval(() => {
  activeIndex = (activeIndex + 1) % tabCount;
  switchTab(activeIndex);
}, switchInterval);

// Handle tab click
revTab.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    switchTab(index);
  });
});

// Initial activation
switchTab(activeIndex);

// Initialize Owl Carousel
$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  mouseDrag: false,
  nav: true,
  dots: false,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 1,
    },
    1000: {
      items: 1,
    },
  },
});

$(".logo-carousel2").owlCarousel({
  loop: true,
  margin: 10,
  nav: false,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 3,
    },
    1000: {
      items: 5,
    },
  },
});

let arrow = `<img src="../assets/images/arrow.svg" alt="" />`;

$(".owl-prev").html(arrow);
$(".owl-next").html(arrow);

$(function () {
  $(".twentytwenty-container").twentytwenty();
});

// COMPANY LOGOS SECTION
