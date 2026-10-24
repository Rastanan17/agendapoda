"use strict";
(() => {
  const e = window.AgendaPoda;

  e.calendar = {
    getEventsForDate(t) {
      const a = e.utils.dateKey(t);
      return e.state.events.filter(e => (("realizado" === e.status ? e.completedDate || e.date : e.scheduledDate || e.date) === a));
    },

    getEventDate(e) {
      return "realizado" === e.status ? e.completedDate || e.date || e.scheduledDate : e.scheduledDate || e.date;
    },

    formatMoney(e) {
      return "$" + (Number(e) || 0).toLocaleString("es-AR");
    },

    parseDateKey(e) {
      const [t, a, s] = e.split("-").map(Number);
      return new Date(t, a - 1, s);
    },

    render() {
      const { calendarMonth: t, selectedDate: a } = e.state;
      const { monthNames: s, weekDays: l } = e;
      const { dateKey: n, sameDay: r, formatLongDate: d, escapeHTML: i } = e.utils;

      const c = t.getFullYear(), o = t.getMonth();
      const m = new Date(c, o, 1);
      const g = (m.getDay() + 6) % 7;
      const v = new Date(c, o, 1 - g);
      const p = n(new Date());
      const h = [];

      for (let e = 0; e < 42; e++) {
        const t = new Date(v);
        t.setDate(v.getDate() + e);
        h.push(t);
      }

      const u = `${s[o][0].toUpperCase()}${s[o].slice(1)} ${c}`;
      const y = l.map(e => `<div class="weekday">${e}</div>`).join("");

      const S = h.map(t => {
        const s = n(t), l = t.getMonth() === o, c = s === p, m = r(t, a);
        const g = this.getEventsForDate(t);
        const v = ["calendar-day", l ? "" : "outside-month", c ? "is-today" : "", m ? "selected" : ""].filter(Boolean).join(" ");
        const h = g.slice(0, 3).map(t => `<div class="day-event ${"realizado" === t.status || t.completed ? "completed" : ""}">${i(t.title || t.clientName || "Trabajo")}</div>`).join("");
        const y = g.length > 3 ? `<div class="day-event more-events">+${g.length - 3} más</div>` : "";

        return `<button type="button" class="${v}" data-calendar-date="${s}" aria-label="${i(d(t))}, ${g.length} trabajos" aria-pressed="${m}"><span class="day-number">${t.getDate()}</span><div class="day-events">${h}${y}</div></button>`;
      }).join("");

      const f = this.getEventsForDate(a);
      const k = f.length ? f.map(t => {
        const a = t.title || t.clientName || "Trabajo sin nombre";
        const s = "realizado" === t.status || t.completed;
        return `<article class="calendar-event-row"><div class="calendar-event-info"><strong>${i(a)}</strong><span class="calendar-event-status ${s ? "is-completed" : "is-pending"}">${s ? "Realizado" : "Pendiente"}</span>${"corte_unico" === t.type ? `<small>Precio: ${this.formatMoney(t.price)} · Saldo: ${this.formatMoney(t.balance)}</small>` : ""}</div><button type="button" class="calendar-event-open" data-calendar-view-event="${i(t.id || "")}">Ver detalles</button></article>`;
      }).join("") : `<div class="empty-state"><strong>No hay trabajos programados.</strong> Todavía no hay visitas registradas para este día.</div>`;

      return `<section class="page-intro"><h2>${"inicio" === e.state.currentPage ? "Tu agenda de trabajo" : "Calendario de visitas"}</h2><p>Organizá tus podas, controlá las fechas y planificá tu semana.</p></section><section class="calendar-card"><div class="calendar-toolbar"><h3 class="calendar-month">${u}</h3><div class="calendar-actions"><button type="button" data-calendar-shift="-1" aria-label="Mes anterior">‹</button><button type="button" class="calendar-today" data-calendar-today>Hoy</button><button type="button" data-calendar-shift="1" aria-label="Mes siguiente">›</button></div></div><div class="calendar-legend"><span class="legend-item"><span class="legend-dot"></span> Trabajo pendiente</span><span class="legend-item"><span class="legend-dot completed"></span> Trabajo realizado</span></div><div class="calendar-grid">${y}${S}</div></section><section class="selected-day-card"><div class="selected-day-header"><h3>${i(d(a))}</h3><span>${f.length} ${1 === f.length ? "trabajo" : "trabajos"}</span></div><div class="calendar-event-list">${k}</div></section><div class="calendar-modal-overlay" data-calendar-modal-overlay role="presentation"><section class="calendar-action-modal" role="dialog" aria-modal="true" aria-labelledby="calendarModalTitle"><header class="calendar-modal-header"><div><span class="calendar-modal-eyebrow">FECHA SELECCIONADA</span><h2>${i(d(a))}</h2></div><button type="button" class="calendar-modal-close" data-calendar-modal-close aria-label="Cerrar">×</button></header><div class="calendar-modal-body"><h3 id="calendarModalTitle">Trabajos de esta fecha</h3>${this.getEventsForDate(a).length ? `<div class="calendar-modal-events">${this.getEventsForDate(a).map(e => {
        const t = i(e.title || e.clientName || "Trabajo sin nombre");
        const a = "realizado" === e.status || e.completed;
        return `<button type="button" class="calendar-modal-event" data-calendar-view-event="${i(String(e.id || ""))}"><span class="calendar-modal-event-icon">${a ? "✅" : "✂️"}</span><span class="calendar-modal-event-info"><strong>${t}</strong><small>${a ? "Realizado" : "Pendiente"}</small>${"corte_unico" === e.type ? `<small>${this.formatMoney(e.price)}</small>` : ""}</span><span class="calendar-modal-event-arrow">›</span></button>`;
      }).join("")}</div>` : `<div class="empty-state calendar-modal-empty"><strong>Fecha disponible</strong><p>No hay trabajos registrados para este día.</p></div>`}<h3 class="calendar-modal-actions-title">¿Qué querés hacer?</h3><p>Elegí una acción para esta fecha.</p><div class="calendar-action-grid"><button type="button" data-calendar-action="visita"><span class="calendar-action-icon">📍</span><span>Agregar visita</span></button><button type="button" data-calendar-action="corte"><span class="calendar-action-icon">✂️</span><span>Agregar corte único</span></button><button type="button" data-calendar-action="cliente"><span class="calendar-action-icon">👤</span><span>Agregar cliente nuevo</span></button><button type="button" data-calendar-action="pago"><span class="calendar-action-icon">💰</span><span>Registrar pago</span></button><button type="button" data-calendar-action="gasto"><span class="calendar-action-icon">🧾</span><span>Registrar gasto</span></button></div></div></section></div>`;
    },

    openVisitForm() {
      document.querySelector("[data-visit-form-overlay]")?.remove();
      const t = e.utils.escapeHTML;
      const a = e.utils.dateKey(e.state.selectedDate || new Date());
      const s = document.createElement("div");

      s.className = "calendar-modal-overlay visible";
      s.dataset.visitFormOverlay = "";
      s.innerHTML = `<section class="calendar-action-modal" role="dialog" aria-modal="true" aria-labelledby="visitFormTitle"><header class="calendar-modal-header"><div><span class="calendar-modal-eyebrow">CONSULTA COMERCIAL</span><h2 id="visitFormTitle">Agregar visita</h2></div><button type="button" class="calendar-modal-close" data-visit-close aria-label="Cerrar">×</button></header><div class="calendar-modal-body"><form data-visit-form class="client-form"><label>Nombre *<input name="name" required maxlength="100" placeholder="Nombre del interesado"></label><label>Domicilio *<input name="address" required maxlength="180" placeholder="Calle y número"></label><label>Fecha programada *<input name="scheduledDate" type="date" value="${t(a)}" required></label><label>Precio pactado ($)<input name="price" type="number" min="0" step="1" placeholder="Importe estimado o acordado"></label><p class="client-form-hint">Esta visita es una consulta. No registra un corte ni un ingreso.</p><div class="client-form-actions"><button type="button" class="secondary-button" data-visit-close>Cancelar</button><button type="submit" class="primary-button">Guardar visita</button></div></form></div></section>`;

      document.body.appendChild(s);
      const l = s.querySelector("[data-visit-form]");

      s.querySelectorAll("[data-visit-close]").forEach(e => { e.addEventListener("click", () => s.remove()); });
      s.addEventListener("click", e => { if (e.target === s) s.remove(); });

      l.addEventListener("submit", async t => {
        t.preventDefault();
        const a = new FormData(l);
        const n = String(a.get("name") || "").trim();
        const r = String(a.get("address") || "").trim();
        const d = String(a.get("scheduledDate") || "");
        const i = Number(a.get("price")) || 0;

        if (!n || !r || !d) return void alert("Completá el nombre, el domicilio y la fecha.");

        const c = {
          id: window.crypto?.randomUUID ? crypto.randomUUID() : `visita-${Date.now()}`,
          type: "visita_consulta",
          title: `Visita: ${n}`,
          clientName: n,
          address: r,
          scheduledDate: d,
          date: d,
          price: i,
          status: "pendiente",
          completed: !1,
          createdAt: (new Date()).toISOString()
        };

        e.state.events.push(c);

        if (await e.calendar.persistEvents()) {
          s.remove();
          e.state.selectedDate = e.utils.dateFromKey ? e.utils.dateFromKey(d) : e.calendar.parseDateKey(d);
          e.state.calendarMonth = new Date(e.state.selectedDate.getFullYear(), e.state.selectedDate.getMonth(), 1);
          e.render();
        } else {
          e.state.events = e.state.events.filter(e => e.id !== c.id);
        }
      });

      l.querySelector('[name="name"]').focus();
    },

    closeModal() {
      const e = document.querySelector("[data-calendar-modal-overlay]");
      if (e) e.classList.remove("visible");
    },

    openModal() {
      const e = document.querySelector("[data-calendar-modal-overlay]");
      if (e) {
        e.classList.add("visible");
        e.querySelector("[data-calendar-modal-close]")?.focus();
      }
    },

openRecurringForm(cut) {
  if (!cut || cut.type !== "corte_unico") {
    alert("No se encontró el corte seleccionado.");
    return;
  }

  document.querySelector("[data-recurring-form-overlay]")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "calendar-modal-overlay visible";
  overlay.dataset.recurringFormOverlay = "";

  const baseDate = cut.completedDate || cut.scheduledDate || cut.date;
  const suggestedDate = this.getNextRecurringDate(baseDate, {
    enabled: true,
    interval: 1,
    unit: "months"
  });

  const escape = e.utils.escapeHTML;

  overlay.innerHTML = `
    <section class="calendar-action-modal" role="dialog"
      aria-modal="true" aria-labelledby="recurringFormTitle">

      <header class="calendar-modal-header">
        <div>
          <span class="calendar-modal-eyebrow">NUEVO MANTENIMIENTO</span>
          <h2 id="recurringFormTitle">Programar próximo corte</h2>
        </div>
        <button type="button" class="calendar-modal-close"
          data-recurring-cancel aria-label="Cerrar">×</button>
      </header>

      <div class="calendar-modal-body">
        <p>Cliente: <strong>${escape(cut.clientName || cut.title || "")}</strong></p>

        <form data-recurring-form class="client-form">
          <label>
            Fecha del próximo corte *
            <input name="scheduledDate" type="date"
              value="${suggestedDate}" required>
          </label>

          <label>
            <input name="recurringEnabled" type="checkbox" checked>
            Continuar con mantenimiento periódico
          </label>

          <div data-recurring-options>
            <label>
              Repetir cada
              <input name="interval" type="number"
                min="1" max="365" value="1" required>
            </label>

            <label>
              Unidad
              <select name="unit">
                <option value="days">Días</option>
                <option value="weeks">Semanas</option>
                <option value="months" selected>Meses</option>
              </select>
            </label>
          </div>

          <p class="client-form-hint">
            El corte anterior no se modifica. Se creará un nuevo trabajo
            pendiente para la fecha elegida.
          </p>

          <div class="client-form-actions">
            <button type="button" class="secondary-button"
              data-recurring-cancel>Cancelar</button>
            <button type="submit" class="primary-button">
              Programar corte
            </button>
          </div>
        </form>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);

  const form = overlay.querySelector("[data-recurring-form]");
  const checkbox = form.elements.recurringEnabled;
  const options = form.querySelector("[data-recurring-options]");

  checkbox.addEventListener("change", () => {
    options.hidden = !checkbox.checked;
  });

  overlay.querySelectorAll("[data-recurring-cancel]").forEach(button => {
    button.addEventListener("click", () => overlay.remove());
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.remove();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const scheduledDate = form.elements.scheduledDate.value;
    const interval = Number(form.elements.interval.value);
    const unit = form.elements.unit.value;

    if (!scheduledDate) {
      alert("Elegí la fecha del próximo corte.");
      return;
    }

    if (checkbox.checked &&
        (!Number.isInteger(interval) || interval < 1)) {
      alert("Ingresá una frecuencia válida.");
      return;
    }

    const nextCut = {
      ...cut,
      id: `cut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      scheduledDate,
      completedDate: "",
      date: scheduledDate,
      status: "pendiente",
      completed: false,
      paid: 0,
      balance: Number(cut.price) || 0,
      paymentMethod: "pendiente",
      photo: null,
      recurring: checkbox.checked
        ? {
            enabled: true,
            interval,
            unit,
            nextDate: scheduledDate
          }
        : {
            enabled: false,
            interval: 0,
            unit: "days",
            nextDate: ""
          },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    e.state.events.push(nextCut);

    const saved = await this.persistEvents();

    if (!saved) {
      e.state.events = e.state.events.filter(
        item => String(item.id) !== String(nextCut.id)
      );
      return;
    }

    overlay.remove();
    e.state.selectedDate = this.parseDateKey(scheduledDate);
    e.state.calendarMonth = new Date(
      e.state.selectedDate.getFullYear(),
      e.state.selectedDate.getMonth(),
      1
    );

    e.render();
  });
},

    openEventDetails(t) {
      const a = e.state.events.find(e => String(e.id) === String(t));
      if (!a) return void alert("No se encontró ese trabajo.");

      document.querySelector("[data-event-details-overlay]")?.remove();
      const s = document.createElement("div");
      s.className = "calendar-modal-overlay visible";
      s.dataset.eventDetailsOverlay = "";

      const l = "corte_unico" === a.type;
      const n = "realizado" === a.status || a.completed;
      const r = e.utils.escapeHTML;

      s.innerHTML = `<section class="calendar-action-modal" role="dialog" aria-modal="true" aria-labelledby="eventDetailsTitle"><header class="calendar-modal-header"><div><span class="calendar-modal-eyebrow">DETALLE DEL TRABAJO</span><h2 id="eventDetailsTitle">${r(a.title || a.clientName || "Trabajo")}</h2></div><button type="button" class="calendar-modal-close" data-event-details-close aria-label="Cerrar">×</button></header><div class="calendar-modal-body"><p><strong>Estado:</strong> ${n ? "Realizado" : "Pendiente"}</p><p><strong>Fecha programada:</strong> ${r(this.formatDate(a.scheduledDate || a.date))}</p>${a.type === "visita_consulta" ? `
  <p><strong>Fecha real de visita:</strong> ${
    r(this.formatDate(a.visitCompletedDate))
  }</p>
` : ""}${l ? `<p><strong>Cliente:</strong> ${r(a.clientName)}</p><p><strong>Teléfono:</strong> ${r(a.phone || "No informado")}</p><p><strong>Dirección:</strong> ${r(a.address || "No informada")}</p><p><strong>Localidad:</strong> ${r(a.locality || "No informada")}</p><p><strong>Terreno:</strong> ${Number(a.areaM2) || 0} m²</p><p><strong>Precio:</strong> ${this.formatMoney(a.price)}</p><p><strong>Abonado:</strong> ${this.formatMoney(a.paid)}</p><p><strong>Saldo:</strong> ${this.formatMoney(a.balance)}</p><p><strong>Forma de pago:</strong> ${r(this.paymentLabel(a.paymentMethod))}</p>${a.completedDate ? `<p><strong>Fecha real del corte:</strong> ${r(this.formatDate(a.completedDate))}</p>` : ""}${a.photo ? `<img src="${a.photo}" alt="Foto del trabajo" style="display:block;max-width:100%;max-height:220px;object-fit:contain;border-radius:12px;margin:12px auto;">` : ""}` : ""}
<div class="calendar-action-grid">${l ? `<button type="button" data-event-edit="${r(a.id)}">
<span class="calendar-action-icon">✏️</span><span>Editar</span></button><button type="button" data-event-receipt="${r(a.id)}"><span class="calendar-action-icon">🧾</span><span>Descargar comprobante</span></button><button type="button" data-event-whatsapp="${r(a.id)}"><span class="calendar-action-icon">📲</span><span>Compartir por WhatsApp</span></button>` : ""}<button type="button" data-event-toggle-status="${r(a.id)}"><span class="calendar-action-icon">${n ? "↩️" : "✅"}</span><span>${n ? "Marcar pendiente" : "Marcar realizado"}</span></button><button type="button" data-event-delete="${r(a.id)}"><span class="calendar-action-icon">🗑️</span><span>Eliminar trabajo</span></button><button type="button" data-event-recurring="${r(a.id)}">
  <span class="calendar-action-icon">🔁</span>
  <span>Programar cortes periódicos</span>
</button></div></div></section>`;

      document.body.appendChild(s);
    },

    formatDate(e) {
      return e ? this.parseDateKey(e).toLocaleDateString("es-AR") : "Sin especificar";
    },

    paymentLabel(e) {
      return { pendiente: "Sin pago todavía", efectivo: "Efectivo", transferencia: "Transferencia", mercado_pago: "Mercado Pago", otro: "Otro" }[e] || "No especificado";
    },

    async persistEvents() {
      if (e.storage && "function" == typeof e.storage.save) {
        const t = await e.storage.save();
        return !1 === t && alert("No se pudieron guardar los cambios. Revisá el almacenamiento del navegador."), !1 !== t;
      }
      try {
        return localStorage.setItem("agendaPodaEvents", JSON.stringify(e.state.events)), !0;
      } catch (e) {
        return console.error(e), alert("No se pudieron guardar los cambios."), !1;
      }
    },

    getNextRecurringDate(completedDate, recurring) {
  const date = this.parseDateKey(completedDate);

  if (
    !recurring?.enabled ||
    !Number.isInteger(Number(recurring.interval)) ||
    Number(recurring.interval) < 1 ||
    !["days", "weeks", "months"].includes(recurring.unit)
  ) {
    return "";
  }

  const interval = Number(recurring.interval);

  if (recurring.unit === "days") {
    date.setDate(date.getDate() + interval);
  } else if (recurring.unit === "weeks") {
    date.setDate(date.getDate() + interval * 7);
  } else if (recurring.unit === "months") {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + interval);

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

    date.setDate(Math.min(day, lastDay));
  }

  return e.utils.dateKey(date);
},

    async handleClick(t) {
      const a = t.target;
      if (!(a instanceof Element)) return;

      if (a.closest("[data-calendar-shift]")) {
        const t = Number(a.closest("[data-calendar-shift]").dataset.calendarShift);
        const s = e.state.calendarMonth;
        return e.state.calendarMonth = new Date(s.getFullYear(), s.getMonth() + t, 1), e.state.selectedDate = new Date(e.state.calendarMonth.getFullYear(), e.state.calendarMonth.getMonth(), 1), void e.render();
      }

      if (a.closest("[data-calendar-today]")) {
        return void ("function" == typeof e.goToToday ? e.goToToday() : (e.state.selectedDate = new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()), e.state.calendarMonth = new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1), e.render()));
      }

      if (a.closest("[data-calendar-modal-close]")) return void this.closeModal();
      if (a.closest("[data-calendar-modal-overlay]") && a === a.closest("[data-calendar-modal-overlay]")) return void this.closeModal();

if (a.closest("[data-calendar-action]")) {
  const action = a.closest("[data-calendar-action]").dataset.calendarAction;

  this.closeModal();

  if (action === "visita") {
    this.openVisitForm();
  } else if (action === "corte") {
  if (typeof e.cuts?.openForm === "function") {
    e.cuts.openForm();
  } else {
    alert("No se encontró cuts.js.");
  }
  } else if (action === "cliente") {
    if (typeof e.clients?.openForm === "function") {
      e.clients.openForm();
    } else {
      alert("No se encontró el formulario de clientes.");
    }
  } else if (action === "pago" || action === "gasto") {
    e.state.currentPage = "movimientos";
    e.render();

    const form = document.querySelector("#movementForm");

    if (form) {
      form.elements.type.value =
        action === "pago" ? "ingreso" : "gasto";

      form.elements.concept.focus();
    }
  }

  return;
}

      if (a.closest("[data-calendar-date]")) {
        const t = a.closest("[data-calendar-date]").dataset.calendarDate;
        return e.state.selectedDate = this.parseDateKey(t), e.state.calendarMonth = new Date(e.state.selectedDate.getFullYear(), e.state.selectedDate.getMonth(), 1), e.render(), void this.openModal();
      }

      if (a.closest("[data-calendar-view-event]")) return void this.openEventDetails(a.closest("[data-calendar-view-event]").dataset.calendarViewEvent);
      if (a.closest("[data-event-details-close]")) return void document.querySelector("[data-event-details-overlay]")?.remove();

      const s = a.closest("[data-event-details-overlay]");
      if (s && a === s) return void s.remove();
if (a.closest("[data-event-recurring]")) {
  const id = a.closest("[data-event-recurring]").dataset.eventRecurring;
  const cut = e.state.events.find(
    event => String(event.id) === String(id)
  );

  if (!cut) return;

  document.querySelector("[data-event-details-overlay]")?.remove();

  if (typeof this.openRecurringForm === "function") {
    this.openRecurringForm(cut);
  } else {
    alert("No se encontró el formulario de mantenimiento.");
  }

  return;
}
      if (a.closest("[data-event-edit]")) {
        const t = a.closest("[data-event-edit]").dataset.eventEdit;
        const s = e.state.events.find(e => String(e.id) === String(t));
        if (!s) return;
        return document.querySelector("[data-event-details-overlay]")?.remove(), "function" == typeof e.cuts?.openForm ? e.cuts.openForm(s) : alert("No se encontró cuts.js."), void 0;
      }

if (a.closest("[data-event-delete]")) {
  const t = a.closest("[data-event-delete]").dataset.eventDelete;
  const s = e.state.events.find(e => String(e.id) === String(t));

  if (!s) return;

  document.querySelector("[data-delete-confirm-overlay]")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "calendar-modal-overlay visible";
  overlay.dataset.deleteConfirmOverlay = "";

  overlay.innerHTML = `
    <section class="calendar-action-modal" role="dialog"
      aria-modal="true" aria-labelledby="deleteConfirmTitle">

      <header class="calendar-modal-header">
        <div>
          <span class="calendar-modal-eyebrow">CONFIRMAR ACCIÓN</span>
          <h2 id="deleteConfirmTitle">Eliminar registro</h2>
        </div>
        <button type="button" class="calendar-modal-close"
          data-delete-cancel aria-label="Cerrar">×</button>
      </header>

      <div class="calendar-modal-body">
        <p>¿Querés eliminar <strong>${e.utils.escapeHTML(s.clientName || s.title || "este registro")}</strong>?</p>
        <p>Esta acción no se puede deshacer.</p>

        <div class="client-form-actions">
          <button type="button" class="secondary-button"
            data-delete-cancel>Cancelar</button>
          <button type="button" class="primary-button"
            data-delete-confirm>Eliminar</button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);

  overlay.querySelectorAll("[data-delete-cancel]").forEach(button => {
    button.addEventListener("click", () => overlay.remove());
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.remove();
  });

  overlay.querySelector("[data-delete-confirm]").addEventListener("click", async () => {
    e.state.events = e.state.events.filter(
      event => String(event.id) !== String(t)
    );

    if (e.storage?.deletePhoto) {
      try {
        await e.storage.deletePhoto(t);
      } catch (error) {
        console.warn("No se pudo eliminar la foto guardada.", error);
      }
    }

    const saved = await this.persistEvents();

    if (saved) {
      overlay.remove();
      document.querySelector("[data-event-details-overlay]")?.remove();
      e.render();
    }
  });

  return;
}

    if (a.closest("[data-event-toggle-status]")) {
      const t = a.closest("[data-event-toggle-status]").dataset.eventToggleStatus;
      const s = e.state.events.find(e => String(e.id) === String(t));

      if (!s) {
        console.warn("No se encontró el evento para cambiar su estado:", t);
        return;
      }

      if (s.status === "realizado" || s.completed) {
        s.status = "pendiente";
        s.completed = false;

        if (s.type === "visita_consulta") {
          s.visitCompletedDate = "";
        } else {
          s.completedDate = "";
          s.date = s.scheduledDate || s.date;
        }
      } else {
  s.status = "realizado";
  s.completed = true;

  const today = e.utils.dateKey(new Date());

  if (s.type === "visita_consulta") {
    s.visitCompletedDate = today;
  } else {
    s.completedDate = today;
    s.date = today;

  }
}

      await this.persistEvents();

      document.querySelector("[data-event-details-overlay]")?.remove();

      e.state.selectedDate = this.parseDateKey(this.getEventDate(s));
      e.state.calendarMonth = new Date(
        e.state.selectedDate.getFullYear(),
        e.state.selectedDate.getMonth(),
        1
      );

      return void e.render();
    }

      if (a.closest("[data-event-receipt]")) {
        const t = a.closest("[data-event-receipt]").dataset.eventReceipt;
        const s = e.state.events.find(e => String(e.id) === String(t));
        if (!s || !e.receipts?.download) return void alert("No se encontró receipts.js o el corte seleccionado.");

        try { await e.receipts.download(s); } catch (e) { console.error(e), alert("No se pudo generar el comprobante."); }
        return;
      }

      if (a.closest("[data-event-whatsapp]")) {
        const t = a.closest("[data-event-whatsapp]").dataset.eventWhatsapp;
        const s = e.state.events.find(e => String(e.id) === String(t));
        if (!s || !e.receipts?.shareWhatsApp) return void alert("No se encontró receipts.js o el corte seleccionado.");

        try { await e.receipts.shareWhatsApp(s); } catch (e) { if ("AbortError" !== e?.name) { console.error(e); alert("No se pudo compartir el comprobante."); } }
      }
    },

    init() {
      if (document.querySelector("#app")) {
        if (e.storage?.load && 0 === e.state.events.length) e.state.events = e.storage.load();
        if (!this.initialized) {
          this.initialized = !0;
          document.addEventListener("click", e => { this.handleClick(e); });
          document.addEventListener("keydown", e => {
            if ("Escape" === e.key) {
              this.closeModal();
              document.querySelector("[data-event-details-overlay]")?.remove();
            }
          });
        }
      }
    }
  };
})();