
"use strict";

(() => {
  const AP = window.AgendaPoda;
  const $ = selector => document.querySelector(selector);

  AP.render = function () {
    const page = AP.pages[AP.state.currentPage];
    const app = $("#app");

    $("#pageTitle").textContent = page.title;
    $("#pageEyebrow").textContent = page.eyebrow;

    document.querySelectorAll(".nav-item").forEach(button => {
      const active = button.dataset.page === AP.state.currentPage;

      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    if (
      AP.state.currentPage === "inicio" ||
      AP.state.currentPage === "calendario"
    ) {
      app.innerHTML = AP.calendar.render();
      return;
    }

    if (AP.state.currentPage === "clientes" && AP.clients) {
      app.innerHTML = AP.clients.render();
      return;
    }

    if (AP.state.currentPage === "trabajos") {
      app.innerHTML = renderJobs();
      return;
    }

    app.innerHTML = `
      <section class="page-intro">
        <h2>${AP.utils.escapeHTML(page.title)}</h2>
        <p>${AP.utils.escapeHTML(page.description || "")}</p>
      </section>

      <section class="content-card">
        <h3>Sección preparada</h3>
        <p>
          Esta sección está preparada para incorporar sus funciones
          y conectarse con los datos de la aplicación.
        </p>
      </section>
    `;
  };

function renderJobs() {
  const esc = AP.utils.escapeHTML;

  const jobs = [...(AP.state.events || [])].sort((a, b) => {
    const dateA = a.completedDate || a.scheduledDate || a.date || "";
    const dateB = b.completedDate || b.scheduledDate || b.date || "";
    return dateB.localeCompare(dateA);
  });

  return `
    <section class="page-intro">
      <h2>Mis trabajos</h2>
      <p>Consultá tus trabajos y accedé a sus detalles cuando los necesites.</p>
    </section>

    <section class="content-card jobs-section">
      <div class="jobs-toolbar">
        <div>
          <h3>Trabajos registrados</h3>
          <p>${jobs.length} ${jobs.length === 1 ? "trabajo" : "trabajos"}</p>
        </div>
      </div>

      ${
        jobs.length
          ? `
            <div class="jobs-list">
              ${jobs.map(job => {
                const id = esc(String(job.id || ""));
                const completed =
                  job.status === "realizado" || job.completed;

                const date =
                  job.completedDate || job.scheduledDate || job.date || "";

                return `
                  <article class="job-card">
                    <div class="job-card-icon">🌿</div>

                    <div class="job-card-info">
                      <h3>${esc(job.title || job.clientName || "Trabajo sin nombre")}</h3>

                      <p>
                        ${date
                          ? esc(AP.calendar.formatDate(date))
                          : "Fecha sin indicar"}
                      </p>

                      <span class="job-status ${completed ? "is-complete" : "is-pending"}">
                        ${completed ? "Realizado" : "Pendiente"}
                      </span>

                      <div class="job-card-actions">
                        <button
                          type="button"
                          class="primary-button"
                          data-calendar-view-event="${id}">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          `
          : `
            <div class="clients-empty">
              <div class="clients-empty-icon">🌱</div>
              <h3>Todavía no hay trabajos</h3>
              <p>Cuando registres trabajos en el calendario, aparecerán acá.</p>
            </div>
          `
      }
    </section>
  `;
}

  function formatDate(value) {
    const date = AP.utils.dateFromKey(value);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  AP.goToToday = function () {
    const now = new Date();

    AP.state.calendarMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    AP.state.selectedDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    if (
      AP.state.currentPage !== "inicio" &&
      AP.state.currentPage !== "calendario"
    ) {
      AP.state.currentPage = "inicio";
    }

    AP.render();
  };

  function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(button => {
      button.addEventListener("click", () => {
        const page = button.dataset.page;

        if (!AP.pages[page]) return;

        AP.state.currentPage = page;
        AP.sidebar.close();
        AP.render();
      });
    });

    $("#todayTopButton").addEventListener("click", AP.goToToday);
  }

  function init() {
    AP.sidebar.init();
    AP.calendar.init();

    if (AP.clients) {
      AP.clients.init();
    }

    initNavigation();
    AP.render();

    console.log("Agenda Poda iniciada correctamente.");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
