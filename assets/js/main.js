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

// Botões de contacto -> WhatsApp com mensagem pré-preenchida (PT/EN)
// Cada link usa data-wa="<chave>" e o href é atualizado conforme o idioma ativo.
const whatsappNumber = "258870584831";
const whatsappTexts = {
  pt: {
    diagnosis: "Olá, gostaria de solicitar um diagnóstico gratuito para a minha empresa.",
    expert: "Olá, gostaria de falar com um especialista da Proxmeru sobre as necessidades tecnológicas da minha empresa.",
    "solution-1": "Olá, tenho interesse na solução de Software & SaaS da Proxmeru e gostaria de receber mais informações.",
    "solution-2": "Olá, tenho interesse na solução de Cloud & Infraestrutura da Proxmeru e gostaria de falar com um especialista.",
    "solution-3": "Olá, tenho interesse na solução de Hiperautomação & Analytics da Proxmeru e gostaria de saber como automatizar os processos da minha empresa.",
    "solution-4": "Olá, tenho interesse na solução de Segurança de Dados da Proxmeru e gostaria de solicitar uma auditoria de segurança.",
    "solution-5": "Olá, tenho interesse na solução de Presença Digital da Proxmeru e gostaria de saber como fazer crescer a minha empresa online.",
    "solution-6": "Olá, tenho interesse na Formação Tecnológica da Proxmeru e gostaria de saber mais sobre a capacitação para a minha equipa."
  },
  en: {
    diagnosis: "Hello, I would like to request a free assessment for my company.",
    expert: "Hello, I would like to talk to a Proxmeru specialist about my company's technology needs.",
    "solution-1": "Hello, I am interested in Proxmeru's Software & SaaS solution and would like to receive more information.",
    "solution-2": "Hello, I am interested in Proxmeru's Cloud & Infrastructure solution and would like to talk to a specialist.",
    "solution-3": "Hello, I am interested in Proxmeru's Hyperautomation & Analytics solution and would like to know how to automate my company's processes.",
    "solution-4": "Hello, I am interested in Proxmeru's Data Security solution and would like to request a security audit.",
    "solution-5": "Hello, I am interested in Proxmeru's Digital Presence solution and would like to know how to grow my company online.",
    "solution-6": "Hello, I am interested in Proxmeru's Technology Training and would like to know more about training for my team."
  }
};

function updateWhatsappLinks() {
  const texts = document.documentElement.lang === "en" ? whatsappTexts.en : whatsappTexts.pt;
  document.querySelectorAll("[data-wa]").forEach(link => {
    const text = texts[link.dataset.wa];
    if (text) link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  });
}

updateWhatsappLinks();
// O listener do i18n.js (carregado antes) já trocou o idioma quando este corre
document.getElementById("lang-toggle").addEventListener("click", updateWhatsappLinks);

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

