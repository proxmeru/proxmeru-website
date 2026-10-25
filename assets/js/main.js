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

// Botão "Solicitar Diagnóstico Gratuito" -> WhatsApp com texto pré-preenchido (PT/EN)
const whatsappNumber = "258870584831";
const whatsappDiagnosisTexts = {
  pt: "Olá, gostaria de solicitar um diagnóstico gratuito para a minha empresa.",
  en: "Hello, I would like to request a free assessment for my company."
};
const whatsappDiagnosisLink = document.getElementById("whatsapp-diagnosis");

if (whatsappDiagnosisLink) {
  whatsappDiagnosisLink.addEventListener("click", () => {
    const text = document.documentElement.lang === "en" ? whatsappDiagnosisTexts.en : whatsappDiagnosisTexts.pt;
    whatsappDiagnosisLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  });
}

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const contactMessages = {
  pt: {
    success: "Mensagem enviada com sucesso.",
    sending: "A enviar...",
    error: "Não foi possível enviar a mensagem. Tente novamente ou escreva-nos para info@proxmeru.com."
  },
  en: {
    success: "Message sent successfully.",
    sending: "Sending...",
    error: "Unable to send your message. Please try again or email us at info@proxmeru.com."
  }
};

function getContactMessages() {
  return document.documentElement.lang === "en" ? contactMessages.en : contactMessages.pt;
}

function setContactStatus(state, text) {
  contactStatus.dataset.state = state;
  contactStatus.textContent = text;
}

if (new URLSearchParams(window.location.search).get("contact") === "success") {
  setContactStatus("success", getContactMessages().success);
}

// Envio por AJAX (evita a página de erro do FormSubmit e mantém o utilizador no site)
contactForm.addEventListener("submit", async event => {
  // Honeypot preenchido: provável robô, ignora silenciosamente
  if (contactForm.elements["_honey"].value) {
    event.preventDefault();
    return;
  }

  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const messages = getContactMessages();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const endpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

  submitButton.disabled = true;
  setContactStatus("", messages.sending);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(contactForm)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === "false" || result.success === false) {
      throw new Error(result.message || "FormSubmit request failed");
    }

    contactForm.reset();
    setContactStatus("success", messages.success);
  } catch (error) {
    console.error("Contact form error:", error);
    setContactStatus("error", messages.error);
  } finally {
    submitButton.disabled = false;
  }
});

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

