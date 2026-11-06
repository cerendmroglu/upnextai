document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("mobileMenuToggle");
  const navWrapper = document.getElementById("mainNavWrapper");

  if (menuToggle && navWrapper) {
    const setMenuState = (isOpen) => {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      navWrapper.classList.toggle("is-open", isOpen);
    };

    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isExpanded);
    });

    // Menü içindeki sayfa içi bağlantılara tıklanınca mobil menüyü kapat
    navWrapper.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    // Escape tuşuyla menüyü kapat
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navWrapper.classList.contains("is-open")) {
        setMenuState(false);
        menuToggle.focus();
      }
    });
  }

  // Henüz hazırlanmayan detay ve ekran bağlantıları için "Yakında" açıklaması
  let toastEl = null;
  let toastTimer = null;

  const ensureToast = () => {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.className = "coming-soon-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.hidden = true;

    const textSpan = document.createElement("span");
    textSpan.className = "coming-soon-text";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "coming-soon-close";
    closeBtn.textContent = "Tamam";
    closeBtn.addEventListener("click", () => {
      toastEl.hidden = true;
    });

    toastEl.appendChild(textSpan);
    toastEl.appendChild(closeBtn);
    document.body.appendChild(toastEl);
    return toastEl;
  };

  document.querySelectorAll("[data-coming-soon]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const message =
        trigger.getAttribute("data-coming-soon") ||
        "Yakında: Bu sayfa veya form hazırlık aşamasındadır.";

      const container = trigger.closest(
        ".bootcamp-card-actions, .application-card-action, .bottom-cta-action"
      );
      if (container) {
        const inlineMsg = container.querySelector(".coming-soon-inline");
        if (inlineMsg) {
          inlineMsg.textContent = message;
          inlineMsg.hidden = false;
        }
      }

      const toast = ensureToast();
      const textSpan = toast.querySelector(".coming-soon-text");
      if (textSpan) {
        textSpan.textContent = message;
      }
      toast.hidden = false;

      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, 5000);
    });
  });

  // Program eşleştirme tablosu
  const programMap = {
    "ai-forge": "AI Forge",
    "ai forge": "AI Forge",
    "ai-agent": "AI Agent",
    "ai agent": "AI Agent",
    "system-network": "System & Network",
    "system & network": "System & Network",
  };

  const programSlugMap = {
    "AI Forge": "ai-forge",
    "AI Agent": "ai-agent",
    "System & Network": "system-network",
  };

  const isConfirmedCohort = (val) => {
    if (!val) return false;
    const normalized = val.trim().toLowerCase();
    return (
      normalized !== "" &&
      normalized !== "aciklanacak" &&
      normalized !== "açıklanacak" &&
      normalized !== "tarih aciklanacak" &&
      normalized !== "tarih açıklanacak"
    );
  };

  // Ön Başvuru Formu Simülasyonu (on-basvuru.html)
  const preApplicationForm = document.getElementById("preApplicationForm");
  if (preApplicationForm) {
    const formView = document.getElementById("applicationFormView");
    const successView = document.getElementById("applicationSuccessView");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const educationSelect = document.getElementById("education");
    const programSelect = document.getElementById("program");
    const cohortInput = document.getElementById("cohort");
    const cohortHint = document.getElementById("cohortHint");
    const programAutoHint = document.getElementById("programAutoHint");
    const infoNoticeCheckbox = document.getElementById("infoNotice");
    const contactConsentCheckbox = document.getElementById("contactConsent");
    const resetSimulationBtn = document.getElementById("resetSimulationBtn");
    const nextStepLink = document.getElementById("nextStepLink");

    // İletişim izninin önceden işaretli olmadığından emin ol
    if (contactConsentCheckbox) {
      contactConsentCheckbox.checked = false;
    }

    const applyUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const rawProgram = (params.get("program") || "").trim().toLowerCase();
      const rawCohort = (params.get("donem") || "").trim();

      if (rawProgram && programMap[rawProgram] && programSelect) {
        programSelect.value = programMap[rawProgram];
        if (programAutoHint) {
          programAutoHint.innerHTML = `Seçtiğiniz bağlantıdan geldiğiniz için <strong>${programMap[rawProgram]}</strong> otomatik seçildi. Dilerseniz değiştirebilirsiniz.`;
          programAutoHint.hidden = false;
        }
      } else if (programSelect) {
        programSelect.value = "";
        if (programAutoHint) {
          programAutoHint.hidden = true;
        }
      }

      if (cohortInput) {
        if (isConfirmedCohort(rawCohort)) {
          cohortInput.value = rawCohort;
          if (cohortHint) {
            cohortHint.textContent = "Seçilen programa ait dönem bilgisi otomatik aktarıldı.";
          }
        } else {
          cohortInput.value = "Tarih açıklanacak";
          if (cohortHint) {
            cohortHint.textContent =
              "Dönem takvimi henüz kesinleşmediği için tarih seçimi gerekmemektedir.";
          }
        }
      }
    };

    applyUrlParams();

    const setFieldError = (control, errorId, message) => {
      const errorEl = document.getElementById(errorId);
      if (!errorEl) return;
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        if (control) control.setAttribute("aria-invalid", "true");
      } else {
        errorEl.textContent = "";
        errorEl.hidden = true;
        if (control) control.removeAttribute("aria-invalid");
      }
    };

    const validateFullName = () => {
      const val = (fullNameInput.value || "").trim();
      if (!val) {
        setFieldError(fullNameInput, "error-fullName", "Lütfen adınızı ve soyadınızı giriniz.");
        return false;
      }
      if (val.length < 3) {
        setFieldError(fullNameInput, "error-fullName", "Ad soyad alanı en az 3 karakter olmalıdır.");
        return false;
      }
      setFieldError(fullNameInput, "error-fullName", "");
      return true;
    };

    const validateEmail = () => {
      const val = (emailInput.value || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        setFieldError(emailInput, "error-email", "Lütfen e-posta adresinizi giriniz.");
        return false;
      }
      if (!emailRegex.test(val)) {
        setFieldError(emailInput, "error-email", "Lütfen geçerli bir e-posta adresi giriniz (örn. ad@alanadi.com).");
        return false;
      }
      setFieldError(emailInput, "error-email", "");
      return true;
    };

    const validatePhone = () => {
      const val = (phoneInput.value || "").trim();
      const digitsOnly = val.replace(/\D/g, "");
      if (!val) {
        setFieldError(phoneInput, "error-phone", "Lütfen telefon numaranızı giriniz.");
        return false;
      }
      if (digitsOnly.length < 10) {
        setFieldError(phoneInput, "error-phone", "Lütfen en az 10 haneli geçerli bir telefon numarası giriniz.");
        return false;
      }
      setFieldError(phoneInput, "error-phone", "");
      return true;
    };

    const validateEducation = () => {
      const val = (educationSelect.value || "").trim();
      if (!val) {
        setFieldError(educationSelect, "error-education", "Lütfen eğitim durumunuzu seçiniz.");
        return false;
      }
      setFieldError(educationSelect, "error-education", "");
      return true;
    };

    const validateProgram = () => {
      const val = (programSelect.value || "").trim();
      if (!val) {
        setFieldError(programSelect, "error-program", "Lütfen ilgilendiğiniz bootcamp programını seçiniz.");
        return false;
      }
      setFieldError(programSelect, "error-program", "");
      return true;
    };

    const validateInfoNotice = () => {
      if (!infoNoticeCheckbox.checked) {
        setFieldError(
          infoNoticeCheckbox,
          "error-infoNotice",
          "Devam etmek için ön başvuru bilgilendirme metnini onaylamanız gerekmektedir."
        );
        return false;
      }
      setFieldError(infoNoticeCheckbox, "error-infoNotice", "");
      return true;
    };

    fullNameInput.addEventListener("input", () => {
      if (fullNameInput.getAttribute("aria-invalid") === "true") validateFullName();
    });
    emailInput.addEventListener("input", () => {
      if (emailInput.getAttribute("aria-invalid") === "true") validateEmail();
    });
    phoneInput.addEventListener("input", () => {
      if (phoneInput.getAttribute("aria-invalid") === "true") validatePhone();
    });
    educationSelect.addEventListener("change", validateEducation);
    programSelect.addEventListener("change", () => {
      validateProgram();
      if (programAutoHint) {
        programAutoHint.hidden = true;
      }
    });
    infoNoticeCheckbox.addEventListener("change", validateInfoNotice);

    preApplicationForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const vName = validateFullName();
      const vEmail = validateEmail();
      const vPhone = validatePhone();
      const vEdu = validateEducation();
      const vProg = validateProgram();
      const vInfo = validateInfoNotice();

      if (!(vName && vEmail && vPhone && vEdu && vProg && vInfo)) {
        const firstInvalid = preApplicationForm.querySelector("[aria-invalid='true']");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Simüle edilen özeti doldur (hiçbir yere kaydetme veya gönderme)
      const selectedProgram = programSelect.value;
      const currentCohort = cohortInput.value || "Tarih açıklanacak";

      const summaryFullName = document.getElementById("summaryFullName");
      const summaryProgram = document.getElementById("summaryProgram");
      const summaryCohort = document.getElementById("summaryCohort");

      if (summaryFullName) summaryFullName.textContent = fullNameInput.value.trim();
      if (summaryProgram) summaryProgram.textContent = selectedProgram;
      if (summaryCohort) summaryCohort.textContent = currentCohort;

      // "Sonraki Adımı İncele" bağlantısına yalnızca program (ve varsa teyitli dönem) bilgisini taşı.
      // Ad, telefon veya e-posta bilgisini bağlantıya kesinlikle taşıma.
      if (nextStepLink) {
        const nextParams = new URLSearchParams();
        const slug = programSlugMap[selectedProgram] || selectedProgram;
        nextParams.set("program", slug);
        if (isConfirmedCohort(currentCohort)) {
          nextParams.set("donem", currentCohort.trim());
        }
        nextStepLink.href = `bilgilendirme.html?${nextParams.toString()}`;
      }

      if (formView && successView) {
        formView.hidden = true;
        successView.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    if (resetSimulationBtn) {
      resetSimulationBtn.addEventListener("click", () => {
        preApplicationForm.reset();
        if (contactConsentCheckbox) {
          contactConsentCheckbox.checked = false;
        }
        applyUrlParams();
        if (formView && successView) {
          successView.hidden = true;
          formView.hidden = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  // Bilgilendirme Sayfası (bilgilendirme.html)
  const infoStepPage = document.getElementById("infoStepPage");
  if (infoStepPage) {
    const infoSelectedProgram = document.getElementById("infoSelectedProgram");
    const infoSelectedCohort = document.getElementById("infoSelectedCohort");
    const backToFormLink = document.getElementById("backToFormLink");
    const viewPaymentPrototypeLink = document.getElementById("viewPaymentPrototypeLink");

    const params = new URLSearchParams(window.location.search);
    const rawProgram = (params.get("program") || "").trim();
    const rawCohort = (params.get("donem") || "").trim();

    const matchedProgram =
      programMap[rawProgram.toLowerCase()] || rawProgram || "AI Forge";
    const slug = programSlugMap[matchedProgram] || rawProgram.toLowerCase() || "ai-forge";

    if (infoSelectedProgram) {
      infoSelectedProgram.textContent = matchedProgram;
    }

    if (infoSelectedCohort) {
      infoSelectedCohort.textContent = isConfirmedCohort(rawCohort)
        ? rawCohort
        : "Tarih açıklanacak";
    }

    if (backToFormLink && rawProgram) {
      backToFormLink.href = `on-basvuru.html?program=${encodeURIComponent(slug)}`;
    }

    if (viewPaymentPrototypeLink) {
      const paymentParams = new URLSearchParams();
      paymentParams.set("program", slug);
      if (isConfirmedCohort(rawCohort)) {
        paymentParams.set("donem", rawCohort);
      }
      viewPaymentPrototypeLink.href = `odeme.html?${paymentParams.toString()}`;
    }
  }

  // Ödeme ve Kesin Kayıt Prototipi (odeme.html)
  const paymentPrototypePage = document.getElementById("paymentPrototypePage");
  if (paymentPrototypePage) {
    const paymentSummaryView = document.getElementById("paymentSummaryView");
    const paymentResultSuccess = document.getElementById("paymentResultSuccess");
    const paymentResultPending = document.getElementById("paymentResultPending");
    const paymentResultFailed = document.getElementById("paymentResultFailed");
    const paymentProgramName = document.getElementById("paymentProgramName");
    const paymentCohort = document.getElementById("paymentCohort");
    const backToInfoLink = document.getElementById("backToInfoLink");

    const params = new URLSearchParams(window.location.search);
    const rawProgram = (params.get("program") || "").trim();
    const rawCohort = (params.get("donem") || "").trim();

    const matchedProgram =
      programMap[rawProgram.toLowerCase()] || rawProgram || "AI Forge";
    const slug = programSlugMap[matchedProgram] || rawProgram.toLowerCase() || "ai-forge";
    const cohortDisplay = isConfirmedCohort(rawCohort) ? rawCohort : "Açıklanacak";

    if (paymentProgramName) {
      paymentProgramName.textContent = matchedProgram;
    }

    if (paymentCohort) {
      paymentCohort.textContent = cohortDisplay;
    }

    paymentPrototypePage.querySelectorAll(".js-result-program").forEach((el) => {
      el.textContent = matchedProgram;
    });

    paymentPrototypePage.querySelectorAll(".js-result-cohort").forEach((el) => {
      el.textContent = cohortDisplay;
    });

    if (backToInfoLink) {
      const infoParams = new URLSearchParams();
      infoParams.set("program", slug);
      if (isConfirmedCohort(rawCohort)) {
        infoParams.set("donem", rawCohort);
      }
      backToInfoLink.href = `bilgilendirme.html?${infoParams.toString()}`;
    }

    const showPaymentState = (state) => {
      if (paymentSummaryView) paymentSummaryView.hidden = state !== "summary";
      if (paymentResultSuccess) paymentResultSuccess.hidden = state !== "success";
      if (paymentResultPending) paymentResultPending.hidden = state !== "pending";
      if (paymentResultFailed) paymentResultFailed.hidden = state !== "failed";
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    paymentPrototypePage.querySelectorAll("[data-payment-simulate]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetState = btn.getAttribute("data-payment-simulate");
        if (targetState) {
          showPaymentState(targetState);
        }
      });
    });

    paymentPrototypePage.querySelectorAll("[data-payment-reset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        showPaymentState("summary");
      });
    });
  }

  // İletişim Sayfası (iletisim.html)
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const contactFormView = document.getElementById("contactFormView");
    const contactSuccessView = document.getElementById("contactSuccessView");
    const contactName = document.getElementById("contactName");
    const contactEmail = document.getElementById("contactEmail");
    const contactTopic = document.getElementById("contactTopic");
    const contactTopicHint = document.getElementById("contactTopicHint");
    const contactMessage = document.getElementById("contactMessage");
    const resetContactBtn = document.getElementById("resetContactBtn");

    const applyContactParams = () => {
      const params = new URLSearchParams(window.location.search);
      const rawTopic = (params.get("konu") || "").trim().toLowerCase();
      if (
        (rawTopic === "is-birligi" || rawTopic === "isbirligi") &&
        contactTopic
      ) {
        contactTopic.value = "İş Birliği Talebi";
        if (contactTopicHint) contactTopicHint.hidden = false;
      } else if (rawTopic === "ogrenci-sorusu" && contactTopic) {
        contactTopic.value = "Öğrenci Sorusu";
        if (contactTopicHint) contactTopicHint.hidden = true;
      } else if (contactTopicHint) {
        contactTopicHint.hidden = true;
      }
    };

    applyContactParams();

    const setContactError = (control, errorId, message) => {
      const errEl = document.getElementById(errorId);
      if (!errEl) return;
      if (message) {
        errEl.textContent = message;
        errEl.hidden = false;
        if (control) control.setAttribute("aria-invalid", "true");
      } else {
        errEl.textContent = "";
        errEl.hidden = true;
        if (control) control.removeAttribute("aria-invalid");
      }
    };

    if (contactName) {
      contactName.addEventListener("input", () =>
        setContactError(contactName, "error-contactName", "")
      );
    }
    if (contactEmail) {
      contactEmail.addEventListener("input", () =>
        setContactError(contactEmail, "error-contactEmail", "")
      );
    }
    if (contactTopic) {
      contactTopic.addEventListener("change", () => {
        setContactError(contactTopic, "error-contactTopic", "");
        if (contactTopicHint) contactTopicHint.hidden = true;
      });
    }
    if (contactMessage) {
      contactMessage.addEventListener("input", () =>
        setContactError(contactMessage, "error-contactMessage", "")
      );
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameVal = (contactName ? contactName.value : "").trim();
      const emailVal = (contactEmail ? contactEmail.value : "").trim();
      const topicVal = (contactTopic ? contactTopic.value : "").trim();
      const msgVal = (contactMessage ? contactMessage.value : "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      let valid = true;
      if (!nameVal || nameVal.length < 3) {
        setContactError(
          contactName,
          "error-contactName",
          "Lütfen adınızı ve soyadınızı giriniz."
        );
        valid = false;
      } else {
        setContactError(contactName, "error-contactName", "");
      }

      if (!emailVal || !emailRegex.test(emailVal)) {
        setContactError(
          contactEmail,
          "error-contactEmail",
          "Lütfen geçerli bir e-posta adresi giriniz."
        );
        valid = false;
      } else {
        setContactError(contactEmail, "error-contactEmail", "");
      }

      if (!topicVal) {
        setContactError(
          contactTopic,
          "error-contactTopic",
          "Lütfen iletişim konusunu seçiniz."
        );
        valid = false;
      } else {
        setContactError(contactTopic, "error-contactTopic", "");
      }

      if (!msgVal || msgVal.length < 10) {
        setContactError(
          contactMessage,
          "error-contactMessage",
          "Lütfen mesajınızı en az 10 karakter olacak şekilde yazınız."
        );
        valid = false;
      } else {
        setContactError(contactMessage, "error-contactMessage", "");
      }

      if (!valid) {
        const firstInvalid = contactForm.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const summaryName = document.getElementById("contactSummaryName");
      const summaryTopic = document.getElementById("contactSummaryTopic");
      if (summaryName) summaryName.textContent = nameVal;
      if (summaryTopic) summaryTopic.textContent = topicVal;

      if (contactFormView && contactSuccessView) {
        contactFormView.hidden = true;
        contactSuccessView.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    if (resetContactBtn) {
      resetContactBtn.addEventListener("click", () => {
        contactForm.reset();
        applyContactParams();
        if (contactFormView && contactSuccessView) {
          contactSuccessView.hidden = true;
          contactFormView.hidden = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  // Blog Kategori Filtresi (blog.html)
  const blogGrid = document.getElementById("blogGrid");
  if (blogGrid) {
    const filterButtons = document.querySelectorAll("[data-blog-filter]");
    const blogCards = blogGrid.querySelectorAll("[data-blog-category]");

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = btn.getAttribute("data-blog-filter") || "all";
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        blogCards.forEach((card) => {
          const cat = card.getAttribute("data-blog-category");
          card.hidden = selected !== "all" && cat !== selected;
        });
      });
    });
  }

  // Blog Detay Sayfası (blog-detay.html)
  const blogDetailPage = document.getElementById("blogDetailPage");
  if (blogDetailPage) {
    const blogArticles = {
      "yapay-zeka": {
        category: "Yapay Zekâ",
        title: "Üretken Yapay Zekâ Projelerinde Gerçek İş Senaryosu Kurgulama",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 16px;">
            Modern yazılım geliştirme süreçlerinde büyük dil modellerini (LLM) bir projeye dahil etmek, yalnızca tekil bir API çağrısı yapmaktan ibaret değildir. Gerçek iş senaryolarında başarılı bir uygulama; net bir problem tanımı, yapılandırılmış veri akışı ve ölçülebilir çıktı doğrulaması gerektirir.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">1. Problem Tanımı ve Kapsam</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Portföy projesi geliştirirken ilk adım, çözümün hangi iş problemini hedeflediğini açıkça ortaya koymaktır. Kullanıcının girdisi, sistemin uygulayacağı kurallar ve beklenen çıktı şeması baştan tanımlandığında hem mimari tasarım hem de test süreci çok daha sağlıklı ilerler.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">2. Yapılandırılmış Çıktı ve Doğrulama</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Serbest metin yanıtları yerine şema doğrulamalı JSON çıktılar üretmek ve harici bilgi kaynaklarıyla (RAG) yanıtları desteklemek, kurumsal senaryolarda güvenilirliği artırır.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">3. Portföy Sunumu</h2>
          <p class="info-card-text">
            Geliştirdiğiniz projeyi teknik dokümantasyon, mimari diyagram ve örnek senaryo çıktılarıyla bir araya getirdiğinizde, iş ve staj başvurularında somut bir mühendislik çıktısı sunabilirsiniz.
          </p>
        `,
      },
      "proje-gelistirme": {
        category: "Proje Geliştirme",
        title: "Teknik Portföy İçin Uçtan Uca Proje Dokümantasyonu Nasıl Hazırlanır?",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 16px;">
            Bir yazılım veya sistem projesinin değeri, yalnızca kodunun çalışmasıyla değil; bir başka mühendisin veya teknik değerlendiricinin o projeyi ne kadar hızlı anlayabildiğiyle ölçülür.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">1. Mimari Özeti ve Kurulum Adımları</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Proje deposunun girişinde projenin hangi problemi çözdüğünü, hangi bileşenlerden oluştuğunu ve yerel ortamda nasıl çalıştırılacağını adım adım açıklayan net bir README yer almalıdır.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">2. Karar Gerekçeleri ve Sınırlar</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Seçilen veri tabanı, API yapısı veya ağ topolojisinin neden tercih edildiğini ve bilinen sınırlarını açıkça yazmak, adayın mühendislik yaklaşımını doğrudan gösterir.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">3. Örnek Çıktılar ve Test Senaryoları</h2>
          <p class="info-card-text">
            Çalışan servisin örnek istek/yanıt çıktıları veya laboratuvar doğrulama adımları eklendiğinde proje, portföy incelemelerinde güçlü bir referansa dönüşür.
          </p>
        `,
      },
      "kariyere-hazirlik": {
        category: "Kariyere Hazırlık",
        title: "Teknoloji Staj ve İş Başvurularında Proje Sunumu Rehberi",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 16px;">
            Mezuniyet veya staj başvurularında teknik ekipler, adayın yalnızca hangi eğitimleri aldığına değil, öğrendiklerini nasıl bir probleme uyguladığına odaklanır.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">1. Süreç ve Sorumluluk Bilinci</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Staj başvurularında başvuru takibini ve resmi evrak süreçlerini adayın düzenli yürütmesi, teknik hazırlık kadar önemlidir. Mentorluk görüşmelerinde alınan geri bildirimlerle portföyü güncel tutmak süreci kolaylaştırır.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">2. Teknik Görüşmede Proje Anlatımı</h2>
          <p class="info-card-text" style="margin-bottom: 16px;">
            Mülakatta projeyi anlatırken önce iş senaryosunu, ardından kurduğunuz teknik mimariyi, karşılaştığınız bir sorunu ve onu nasıl çözdüğünüzü paylaşmak etkili bir sunum akışı sağlar.
          </p>
          <h2 class="info-card-title" style="margin-top: 22px;">3. Gerçekçi Beklenti ve Sürekli Gelişim</h2>
          <p class="info-card-text">
            Her şirketin değerlendirme ve mülakat süreci kendi kriterlerine göre ilerler. Somut proje çıktılarıyla desteklenen başvurular, teknik değerlendirme aşamasında adaya net bir avantaj kazandırır.
          </p>
        `,
      },
    };

    const params = new URLSearchParams(window.location.search);
    const slug = (params.get("yazi") || "yapay-zeka").trim().toLowerCase();
    const article = blogArticles[slug] || blogArticles["yapay-zeka"];

    const breadcrumbEl = document.getElementById("blogDetailBreadcrumb");
    const badgeEl = document.getElementById("blogDetailCategoryBadge");
    const titleEl = document.getElementById("blogDetailTitle");
    const contentEl = document.getElementById("blogDetailContent");

    if (breadcrumbEl) breadcrumbEl.textContent = article.category;
    if (badgeEl) badgeEl.textContent = article.category;
    if (titleEl) titleEl.textContent = article.title;
    if (contentEl) contentEl.innerHTML = article.bodyHtml;
  }

  // Öğrenci Girişi Prototipi (ogrenci-girisi.html)
  const studentLoginForm = document.getElementById("studentLoginForm");
  if (studentLoginForm) {
    const studentLoginCard = document.getElementById("studentLoginCard");
    const forgotPasswordView = document.getElementById("forgotPasswordView");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const resetEmail = document.getElementById("resetEmail");
    const resetDemoResult = document.getElementById("resetDemoResult");
    const backToLoginBtn = document.getElementById("backToLoginBtn");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

    const setLoginError = (inputEl, errorId, message) => {
      const errEl = document.getElementById(errorId);
      if (!errEl) return;
      if (message) {
        errEl.textContent = message;
        errEl.hidden = false;
        if (inputEl) inputEl.setAttribute("aria-invalid", "true");
      } else {
        errEl.textContent = "";
        errEl.hidden = true;
        if (inputEl) inputEl.removeAttribute("aria-invalid");
      }
    };

    if (forgotPasswordBtn && studentLoginCard && forgotPasswordView) {
      forgotPasswordBtn.addEventListener("click", () => {
        studentLoginCard.hidden = true;
        forgotPasswordView.hidden = false;
        if (resetDemoResult) resetDemoResult.hidden = true;
        if (resetEmail) resetEmail.focus();
      });
    }

    if (backToLoginBtn && studentLoginCard && forgotPasswordView) {
      backToLoginBtn.addEventListener("click", () => {
        forgotPasswordView.hidden = true;
        studentLoginCard.hidden = false;
      });
    }

    if (forgotPasswordForm && resetEmail) {
      resetEmail.addEventListener("input", () => {
        setLoginError(resetEmail, "error-resetEmail", "");
      });

      forgotPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const emailVal = (resetEmail.value || "").trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
          setLoginError(
            resetEmail,
            "error-resetEmail",
            "Lütfen geçerli bir e-posta adresi giriniz."
          );
          return;
        }
        setLoginError(resetEmail, "error-resetEmail", "");
        if (resetDemoResult) {
          resetDemoResult.innerHTML =
            "<strong>Demo Bilgilendirmesi:</strong> Şifre yenileme adımı simüle edildi. Prototipte gerçek e-posta gönderimi veya şifre sıfırlama yapılmaz; örnek paneli görmek için giriş ekranındaki <strong>“Demo Panele Gir”</strong> butonunu kullanabilirsiniz.";
          resetDemoResult.hidden = false;
        }
      });
    }

    if (loginEmail) {
      loginEmail.addEventListener("input", () => {
        setLoginError(loginEmail, "error-loginEmail", "");
      });
    }

    if (loginPassword) {
      loginPassword.addEventListener("input", () => {
        setLoginError(loginPassword, "error-loginPassword", "");
      });
    }

    studentLoginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailVal = (loginEmail ? loginEmail.value : "").trim();
      const passVal = (loginPassword ? loginPassword.value : "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      let valid = true;
      if (!emailVal || !emailRegex.test(emailVal)) {
        setLoginError(
          loginEmail,
          "error-loginEmail",
          "Lütfen geçerli bir e-posta adresi giriniz."
        );
        valid = false;
      } else {
        setLoginError(loginEmail, "error-loginEmail", "");
      }

      if (!passVal) {
        setLoginError(
          loginPassword,
          "error-loginPassword",
          "Lütfen şifre alanını doldurunuz veya 'Demo Panele Gir' butonunu kullanınız."
        );
        valid = false;
      } else {
        setLoginError(loginPassword, "error-loginPassword", "");
      }

      if (!valid) return;

      // Gerçek hesap doğrulama veya şifre saklama yapmadan demo panele yönlendir
      if (loginPassword) loginPassword.value = "";
      window.location.href = "ogrenci-paneli.html";
    });
  }

  // Öğrenci Paneli Menüsü ve Bölümleri (ogrenci-paneli.html)
  const studentPanelPage = document.getElementById("studentPanelPage");
  if (studentPanelPage) {
    const tabButtons = studentPanelPage.querySelectorAll("[data-panel-tab]");
    const tabViews = studentPanelPage.querySelectorAll("[data-panel-view]");

    const switchPanelTab = (targetTab) => {
      if (!targetTab) return;
      tabViews.forEach((view) => {
        const viewName = view.getAttribute("data-panel-view");
        view.hidden = viewName !== targetTab;
      });
      document.querySelectorAll(".panel-nav-btn[data-panel-tab]").forEach((btn) => {
        const isMatch = btn.getAttribute("data-panel-tab") === targetTab;
        btn.classList.toggle("is-active", isMatch);
        if (isMatch) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-panel-tab");
        switchPanelTab(targetTab);
      });
    });

    // Materyal Önizleme (Proje İçi Örnek Kaynak)
    const materialData = {
      "not-1": {
        category: "Ders Notu · Önizleme (Demo)",
        title:
          "Modül 1 Ders Notu: Gerçek İş Senaryolarında LLM Kullanım Kontrol Listesi",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>1. Problem Sınırları:</strong> Çözülecek iş probleminin girdi formatını, doğruluk kriterlerini ve kabul edilebilir yanıt süresini tanımlayın.
          </p>
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>2. Yapılandırılmış Çıktı Şeması:</strong> Model yanıtlarını serbest metin yerine JSON şeması ile doğrulayarak uygulama katmanına aktarın.
          </p>
          <p class="info-card-text">
            <strong>3. Hata ve Yedekleme (Fallback) Planı:</strong> Harici API gecikmelerinde veya beklenmeyen çıktılarda kullanıcıya güvenli durum mesajı döndürün.
          </p>
        `,
      },
      "sunum-2": {
        category: "Sunum Özeti · Önizleme (Demo)",
        title:
          "Modül 2 Sunum Özeti: Bilgi Erişimi Destekli Sistemler (RAG) Mimarisi",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>1. Doküman Hazırlığı ve Parçalama (Chunking):</strong> Kurumsal metinleri anlam bütünlüğünü koruyacak başlık ve paragraf sınırlarına göre indeksleyin.
          </p>
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>2. İlgililik ve Kaynak Gösterimi:</strong> Üretilen her yanıtta kullanılan kaynak doküman bölümünü referans olarak çıktıya ekleyin.
          </p>
          <p class="info-card-text">
            <strong>3. Yanıt Kalitesi Kontrolü:</strong> Kaynakta yer almayan konularda modelin tahminde bulunmasını engelleyen sistem yönergeleri kullanın.
          </p>
        `,
      },
      "kaynak-3": {
        category: "Örnek Kaynak · Önizleme (Demo)",
        title: "Portföy Projesi README ve Sunum Şablonu",
        bodyHtml: `
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>Bölüm 1 — Problem ve Senaryo:</strong> Projenin çözdüğü iş problemini ve hedef kullanıcı akışını 3 maddede özetleyin.
          </p>
          <p class="info-card-text" style="margin-bottom: 10px;">
            <strong>Bölüm 2 — Mimari ve Teknoloji Seçimi:</strong> Kullanılan servislerin ve veri akışının şemasını paylaşın.
          </p>
          <p class="info-card-text">
            <strong>Bölüm 3 — Kurulum ve Örnek Çıktılar:</strong> Projeyi yerel ortamda çalıştırma adımlarını ve örnek test çıktılarını ekleyin.
          </p>
        `,
      },
    };

    const materialPreviewCategory = document.getElementById("materialPreviewCategory");
    const materialPreviewTitle = document.getElementById("materialPreviewTitle");
    const materialPreviewBody = document.getElementById("materialPreviewBody");
    const materialPreviewBox = document.getElementById("materialPreviewBox");

    studentPanelPage.querySelectorAll("[data-material-preview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-material-preview");
        const item = materialData[key];
        if (!item) return;
        if (materialPreviewCategory) materialPreviewCategory.textContent = item.category;
        if (materialPreviewTitle) materialPreviewTitle.textContent = item.title;
        if (materialPreviewBody) materialPreviewBody.innerHTML = item.bodyHtml;
        if (materialPreviewBox) {
          materialPreviewBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });

    // Proje Teslim Simülasyonu (Tarayıcı İçi Demo)
    const demoProjectSubmitForm = document.getElementById("demoProjectSubmitForm");
    if (demoProjectSubmitForm) {
      const projectRepoNote = document.getElementById("projectRepoNote");
      const projectStatusBadge = document.getElementById("projectStatusBadge");
      const projectStatusText = document.getElementById("projectStatusText");
      const projectFeedbackText = document.getElementById("projectFeedbackText");
      const projectSimNotice = document.getElementById("projectSimNotice");
      const resetProjectSimBtn = document.getElementById("resetProjectSimBtn");
      const repoError = document.getElementById("error-projectRepoNote");

      demoProjectSubmitForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const noteVal = (projectRepoNote ? projectRepoNote.value : "").trim();
        if (!noteVal) {
          if (repoError) {
            repoError.textContent = "Lütfen örnek proje özeti veya teslim notu giriniz.";
            repoError.hidden = false;
          }
          return;
        }
        if (repoError) repoError.hidden = true;

        if (projectStatusBadge) {
          projectStatusBadge.textContent = "Teslim Durumu: Teslim Edildi — İncelemede (Demo)";
          projectStatusBadge.className = "status-pill status-pill-success";
        }
        if (projectStatusText) {
          projectStatusText.textContent = "Teslim Edildi — Mentor İncelemesinde (Demo)";
        }
        if (projectFeedbackText) {
          projectFeedbackText.textContent =
            "Örnek Geri Bildirim (Demo): Mimari şema ve yapılandırılmış çıktı doğrulaması başarılı; hata yakalama senaryoları canlı sunumda birlikte incelenecektir.";
        }
        if (projectSimNotice) {
          projectSimNotice.innerHTML =
            "<strong>Demo Simülasyonu Tamamlandı:</strong> Proje teslim durumu yalnızca tarayıcıda güncellendi; gerçek dosya yüklenmedi ve veri kaydedilmedi.";
          projectSimNotice.hidden = false;
        }
      });

      if (resetProjectSimBtn) {
        resetProjectSimBtn.addEventListener("click", () => {
          if (projectStatusBadge) {
            projectStatusBadge.textContent = "Teslim Durumu: Teslim Bekleniyor (Demo)";
            projectStatusBadge.className = "status-pill status-pill-pending";
          }
          if (projectStatusText) {
            projectStatusText.textContent = "Teslim Bekleniyor (Demo)";
          }
          if (projectFeedbackText) {
            projectFeedbackText.textContent =
              "Teslim sonrasında mentor değerlendirmesi burada görüntülenir (Demo).";
          }
          if (projectSimNotice) {
            projectSimNotice.hidden = true;
          }
        });
      }
    }

    // Staj Başvuru Takibi Simülasyonu (Demo)
    const myInternshipTitle = document.getElementById("myInternshipTitle");
    const myInternshipStageBadge = document.getElementById("myInternshipStageBadge");
    const myInternshipNote = document.getElementById("myInternshipNote");

    studentPanelPage.querySelectorAll("[data-internship-simulate]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const title = btn.getAttribute("data-internship-simulate") || "Örnek Staj İlanı (Demo)";
        if (myInternshipTitle) {
          myInternshipTitle.textContent = `Seçilen Örnek İlan: ${title}`;
        }
        if (myInternshipStageBadge) {
          myInternshipStageBadge.textContent = "Aşama: 1. Başvuru → 2. Değerlendirme (Demo)";
        }
        if (myInternshipNote) {
          myInternshipNote.innerHTML =
            "<strong>Demo Takip Güncellemesi:</strong> Seçtiğiniz örnek ilan “Başvurularım” alanında simüle edildi. Gerçek süreçte öğrenci kendi başvurusu ve evraklarıyla süreci yürütür; Upnext AI portföy mentorluğu sağlar.";
        }
        if (myInternshipTitle) {
          myInternshipTitle.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }
});
