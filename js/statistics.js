
"use strict";

window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;
  const KEY = "agendaPodaMovements";

  const money = value =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);

  const escape = value => AP.utils.escapeHTML(String(value ?? ""));

  const dateKey = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = value => {
    if (!value) return "Sin fecha";
    const parts = value.split("-");
    return parts.length === 3
      ? `${parts[2]}/${parts[1]}/${parts[0]}`
      : value;
  };

  function getMovements() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function isCompleted(job) {
    return job.status === "realizado" || job.completed === true;
  }

  function getJobDate(job) {
    return isCompleted(job)
      ? job.completedDate || job.date || job.scheduledDate || ""
      : job.scheduledDate || job.date || "";
  }

  function getBalance(job) {
    if (job.balance != null && Number.isFinite(Number(job.balance))) {
      return Math.max(0, Number(job.balance));
    }

    return Math.max(
      0,
      (Number(job.price) || 0) - (Number(job.paid) || 0)
    );
  }

  AP.statistics = {
    render() {
      const clients = Array.isArray(AP.clients?.list)
        ? AP.clients.list
        : [];

      const jobs = Array.isArray(AP.state.events)
        ? AP.state.events
        : [];

      const movements = getMovements();

      const now = new Date();
      const month = dateKey(
        new Date(now.getFullYear(), now.getMonth(), 1)
      ).slice(0, 7);

      const nextMonth = dateKey(
        new Date(now.getFullYear(), now.getMonth() + 1, 1)
      ).slice(0, 7);

      const monthlyClients = clients.filter(
        client => client.serviceType === "monthly"
      );

      const monthlyTotal = monthlyClients.reduce(
        (sum, client) => sum + (Number(client.agreedPrice) || 0),
        0
      );

      const monthJobs = jobs.filter(job => {
        const date = getJobDate(job);
        return date.startsWith(month);
      });

      const pendingJobs = jobs.filter(job =>
        !isCompleted(job) &&
        (job.scheduledDate || job.date || "").startsWith(month)
      );

      const pendingBalance = jobs
        .filter(job => {
          const date = getJobDate(job);
          return date.startsWith(month);
        })
        .reduce((sum, job) => sum + getBalance(job), 0);

      const monthMovements = movements.filter(movement =>
        String(movement.date || "").startsWith(month)
      );

      const income = monthMovements
        .filter(movement => movement.type === "ingreso")
        .reduce((sum, movement) =>
          sum + (Number(movement.amount) || 0), 0);

      const expenses = monthMovements
        .filter(movement => movement.type === "gasto")
        .reduce((sum, movement) =>
          sum + (Number(movement.amount) || 0), 0);

      const upcomingJobs = jobs
        .filter(job => {
          const date = job.scheduledDate || job.date || "";
          return !isCompleted(job) && date >= dateKey(now);
        })
        .sort((a, b) =>
          String(a.scheduledDate || a.date || "")
            .localeCompare(String(b.scheduledDate || b.date || ""))
        )
        .slice(0, 8);

      const recentJobs = jobs
        .filter(isCompleted)
        .sort((a, b) =>
          String(b.completedDate || b.date || "")
            .localeCompare(String(a.completedDate || a.date || ""))
        )
        .slice(0, 8);

      const card = (label, value, detail, icon) => `
        <article class="stats-card">
          <span class="stats-card-icon">${icon}</span>
          <p>${label}</p>
          <strong>${value}</strong>
          <small>${detail}</small>
        </article>
      `;

      return `
        <section class="page-intro">
          <h2>Resumen del negocio</h2>
          <p>Indicadores de ${escape(
            now.toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric"
            })
          )}.</p>
        </section>

        <section class="stats-grid">
          ${card(
            "Clientes registrados",
            clients.length,
            "Total en la cartera",
            "👥"
          )}
          ${card(
            "Mensualidades",
            money(monthlyTotal),
            `${monthlyClients.length} clientes con servicio mensual`,
            "🔁"
          )}
          ${card(
            "Pendiente de cobro",
            money(pendingBalance),
            "Trabajos del mes",
            "🧾"
          )}
          ${card(
            "Trabajos pendientes",
            pendingJobs.length,
            "Programados para este mes",
            "📅"
          )}
          ${card(
            "Ingresos registrados",
            money(income),
            "Movimientos del mes",
            "💰"
          )}
          ${card(
            "Gastos registrados",
            money(expenses),
            "Movimientos del mes",
            "🧰"
          )}
          ${card(
            "Resultado financiero",
            money(income - expenses),
            "Ingresos menos gastos",
            income - expenses < 0 ? "📉" : "📈"
          )}
        </section>

        <section class="content-card stats-section">
          <h3>Próximos cortes</h3>
          ${
            upcomingJobs.length
              ? `<div class="stats-job-list">
                  ${upcomingJobs.map(job => `
                    <article class="stats-job">
                      <div>
                        <strong>${escape(
                          job.clientName || job.title || "Sin nombre"
                        )}</strong>
                        <p>${escape(job.address || "Sin dirección")}</p>
                        <small>${escape(
                          job.locality || "Localidad sin indicar"
                        )} · ${escape(formatDate(
                          job.scheduledDate || job.date
                        ))}</small>
                      </div>
                      <span>Debe ${money(getBalance(job))}</span>
                    </article>
                  `).join("")}
                </div>`
              : "<p>No hay próximos cortes programados.</p>"
          }
        </section>

        <section class="content-card stats-section">
          <h3>Últimos trabajos realizados</h3>
          ${
            recentJobs.length
              ? `<div class="stats-job-list">
                  ${recentJobs.map(job => `
                    <article class="stats-job">
                      <div>
                        <strong>${escape(
                          job.clientName || job.title || "Sin nombre"
                        )}</strong>
                        <p>Trabajo terminado: ${escape(formatDate(
                          job.completedDate || job.date
                        ))}</p>
                        <small>Precio: ${money(job.price)} · Cobrado: ${money(job.paid)}</small>
                      </div>
                      <span>Debe ${money(getBalance(job))}</span>
                    </article>
                  `).join("")}
                </div>`
              : "<p>Todavía no hay trabajos finalizados.</p>"
          }
        </section>
      `;
    }
  };
})();
