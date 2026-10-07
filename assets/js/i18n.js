const translations = {
  pt: {
    nav: { services: "Serviços", about: "Sobre", contact: "Contato" },
    hero: { title: "Título principal", subtitle: "Subtítulo da empresa", cta: "Fale conosco" },
    services: { title: "Serviços" },
    about: { title: "Sobre", text: "Descrição da empresa." },
    contact: {
      title: "Contato",
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
      send: "Enviar"
    }
  },
  en: {
    nav: { services: "Services", about: "About", contact: "Contact" },
    hero: { title: "Main title", subtitle: "Company subtitle", cta: "Get in touch" },
    services: { title: "Services" },
    about: { title: "About", text: "Company description." },
    contact: {
      title: "Contact",
      name: "Name",
      email: "E-mail",
      message: "Message",
      send: "Send"
    }
  }
};

let currentLang = "pt";

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.getElementById("lang-toggle").textContent = lang === "pt" ? "EN" : "PT";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n.split(".");
    el.textContent = translations[lang][key[0]][key[1]];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder.split(".");
    el.placeholder = translations[lang][key[0]][key[1]];
  });
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  applyLang(currentLang === "pt" ? "en" : "pt");
});
