// Ano no footer
document.getElementById("year").textContent = new Date().getFullYear();

// Menu mobile
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(link =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

// Scroll com offset para links âncora (compensa header fixo)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#" || targetId === "#top") return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const headerHeight = document.querySelector("header").offsetHeight;
      const offsetTop = target.offsetTop - headerHeight - 20;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  });
});

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const contactMessages = {
  pt: {
    success: "Mensagem enviada com sucesso."
  },
  en: {
    success: "Message sent successfully."
  }
};

if (new URLSearchParams(window.location.search).get("contact") === "success") {
  const messages = document.documentElement.lang === "en" ? contactMessages.en : contactMessages.pt;
  contactStatus.dataset.state = "success";
  contactStatus.textContent = messages.success;
}

const faqItems = [...document.querySelectorAll(".faq-item")];
const faqAnimations = new Map();

function animateFaq(item, open) {
  const answer = item.querySelector(".faq-answer");
  const currentAnimation = faqAnimations.get(item);
  const startHeight = answer.getBoundingClientRect().height;
  const startOpacity = Number.parseFloat(getComputedStyle(answer).opacity);

  if (currentAnimation?.targetOpen === open) return;
  currentAnimation?.animation.cancel();

  if (open) item.open = true;

  const animationState = {
    targetOpen: open,
    animation: answer.animate(
      [
        { height: `${startHeight}px`, opacity: startOpacity },
        { height: `${open ? answer.scrollHeight : 0}px`, opacity: open ? 1 : 0 }
      ],
      {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300,
        easing: "ease"
      }
    )
  };

  faqAnimations.set(item, animationState);
  animationState.animation.onfinish = () => {
    if (faqAnimations.get(item) !== animationState) return;
    faqAnimations.delete(item);
    if (!open) item.open = false;
  };
}

faqItems.forEach(item => {
  item.querySelector("summary").addEventListener("click", event => {
    event.preventDefault();
    const targetOpen = faqAnimations.get(item)?.targetOpen ?? item.open;

    if (targetOpen) {
      animateFaq(item, false);
      return;
    }

    faqItems.forEach(otherItem => {
      const otherTargetOpen = faqAnimations.get(otherItem)?.targetOpen ?? otherItem.open;
      if (otherItem !== item && otherTargetOpen) animateFaq(otherItem, false);
    });

    animateFaq(item, true);
  });
});

