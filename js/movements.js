"use strict";
window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;
  const KEY = "agendaPodaMovements";
  const $ = (s, r = document) => r.querySelector(s);

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  AP.movements = {
    list: load(),

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.list));
        return true;
      } catch (error) {
        console.error(error);
        alert("No se pudieron guardar los movimientos.");
        return false;
      }
    },

    money(value) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }).format(Number(value) || 0);
    },

    render() {
      const income = this.list
        .filter(m => m.type === "ingreso")
        .reduce((sum, m) => sum + Number(m.amount || 0), 0);

      const expenses = this.list
        .filter(m => m.type === "gasto")
        .reduce((sum, m) => sum + Number(m.amount || 0), 0);

      const esc = AP.utils.escapeHTML;

      return `
        <section class="page-intro">
          <h2>Movimientos de dinero</h2>
          <p>Registrá los ingresos y gastos del trabajo.</p>
        </section>

        <section class="content-card">
          <h3>Balance</h3>
          <p>Ingresos: <strong>${this.money(income)}</strong></p>
          <p>Gastos: <strong>${this.money(expenses)}</strong></p>
          <h3>Saldo: ${this.money(income - expenses)}</h3>
        </section>

        <section class="content-card">
          <h3>Nuevo movimiento</h3>
          <form id="movementForm">
            <label>Tipo</label>
            <select name="type" required>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>

            <label>Concepto</label>
            <input name="concept" required maxlength="100"
              placeholder="Ej. corte de césped, combustible">

            <label>Importe ($)</label>
            <input name="amount" type="number" min="1" step="1"
              required placeholder="Ej. 25000">

            <label>Fecha</label>
            <input name="date" type="date"
              value="${new Date().toLocaleDateString("en-CA")}" required>

            <button class="primary-button" type="submit">
              Guardar movimiento
            </button>
          </form>
        </section>

        <section class="content-card">
          <h3>Historial (${this.list.length})</h3>
          ${this.list.length ? `
            <div class="jobs-list">
              ${[...this.list].sort((a, b) =>
                b.date.localeCompare(a.date)
              ).map(m => `
                <article class="job-card">
                  <div class="job-card-info">
                    <h3>${esc(m.concept)}</h3>
                    <p>${esc(m.date)}</p>
                    <strong>${m.type === "ingreso" ? "+" : "−"}
                      ${this.money(m.amount)}</strong>
                    <button type="button" class="secondary-button"
                      data-movement-delete="${esc(m.id)}">
                      Eliminar
                    </button>
                  </div>
                </article>
              `).join("")}
            </div>
          ` : "<p>Todavía no hay movimientos registrados.</p>"}
        </section>
      `;
    },

    init() {
      document.addEventListener("submit", event => {
        if (event.target.id !== "movementForm") return;
        event.preventDefault();

        const data = new FormData(event.target);
        const amount = Number(data.get("amount"));

        if (!Number.isFinite(amount) || amount <= 0) return;

        const movement = {
          id: String(Date.now()),
          type: data.get("type"),
          concept: String(data.get("concept")).trim(),
          amount,
          date: data.get("date")
        };

        if (!movement.concept || !movement.date) return;

        this.list.push(movement);

        if (!this.save()) {
          this.list.pop();
          return;
        }

        AP.render();
      });

      document.addEventListener("click", event => {
        const button = event.target.closest("[data-movement-delete]");
        if (!button || !confirm("¿Eliminar este movimiento?")) return;

        const index = this.list.findIndex(m =>
          String(m.id) === button.dataset.movementDelete
        );

        if (index < 0) return;

        const removed = this.list.splice(index, 1);

        if (!this.save()) {
          this.list.splice(index, 0, ...removed);
          return;
        }

        AP.render();
      });
    }
  };
})();