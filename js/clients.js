
"use strict";

window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;
  const $ = (selector, root = document) => root.querySelector(selector);

  const STORAGE_KEY = "agendaPodaClients";

  function loadClients() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const clients = saved ? JSON.parse(saved) : [];
      return Array.isArray(clients) ? clients : [];
    } catch (error) {
      console.error("No se pudieron cargar los clientes:", error);
      return [];
    }
  }

  function formatDate(dateKey) {
    if (!dateKey) return "Sin fecha programada";

    const parts = dateKey.split("-");
    if (parts.length !== 3) return dateKey;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function getEventStore() {
    if (!Array.isArray(AP.state.events)) {
      AP.state.events = [];
    }

    return AP.state.events;
  }

  function syncFirstCut(client) {
    if (!client.firstCutDate) return true;

    const events = getEventStore();

    // Buscar el próximo trabajo pendiente de este cliente.
    const pendingEvent = events.find(event =>
      event.clientId === client.id &&
      event.type === "corte_unico" &&
      event.status !== "realizado"
    );

    const price = Number(client.agreedPrice) || 0;

    const cutData = {
      type: "corte_unico",
      clientId: client.id,
      clientName: client.name,
      phone: client.phone,
      address: client.address,
      locality: client.locality,
      areaM2: client.areaM2,
      price,
      paid: pendingEvent ? Number(pendingEvent.paid) || 0 : 0,
      balance: price - (
        pendingEvent ? Number(pendingEvent.paid) || 0 : 0
      ),
      paymentMethod: pendingEvent?.paymentMethod || "pendiente",
      scheduledDate: client.firstCutDate,
      completedDate: "",
      status: "pendiente",
      completed: false,
      date: client.firstCutDate,
      title: client.name,
      serviceType: client.serviceType,
      cycleNumber: pendingEvent?.cycleNumber || 1,
      photo: pendingEvent?.photo || null,
      updatedAt: new Date().toISOString()
    };

    if (pendingEvent) {
      Object.assign(pendingEvent, cutData);
    } else {
      events.push({
        ...cutData,
        id: `cut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString()
      });
    }

    try {
      if (AP.storage && typeof AP.storage.save === "function") {
        return AP.storage.save();
      }

      localStorage.setItem("agendaPodaEvents", JSON.stringify(events));
      return true;
    } catch (error) {
      console.error("No se pudo guardar el primer corte:", error);
      return false;
    }
  }

  AP.clients = {
    list: loadClients(),

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list));
        return true;
      } catch (error) {
        console.error("No se pudieron guardar los clientes:", error);
        alert("No se pudieron guardar los datos del cliente.");
        return false;
      }
    },

    render() {
      const clients = this.list;
      const esc = AP.utils.escapeHTML;

      return `
        <section class="page-intro">
          <h2>Mis clientes</h2>
          <p>Organizá los datos de contacto y los trabajos acordados.</p>
        </section>

        <section class="content-card clients-section">
          <div class="clients-toolbar">
            <input
              type="search"
              id="clientSearch"
              class="client-search"
              placeholder="Buscar por nombre, teléfono o localidad..."
              aria-label="Buscar clientes"
            >
            <button type="button" class="primary-button" data-client-action="add">
              + Agregar cliente
            </button>
          </div>

          <div id="clientsList">
            ${this.renderList(clients)}
          </div>
        </section>
      `;
    },

    renderList(clients = this.list) {
      const esc = AP.utils.escapeHTML;

      if (!clients.length) {
        return `
          <div class="clients-empty">
            <div class="clients-empty-icon">👤</div>
            <h3>Todavía no hay clientes</h3>
            <p>Agregá tu primer cliente para tener sus datos organizados.</p>
          </div>
        `;
      }

      return `
        <div class="clients-list">
          ${clients.map(client => {
            const serviceType = client.serviceType || "one_time";
            const serviceLabel = serviceType === "monthly"
              ? "🔁 Servicio mensual"
              : "✂️ Corte puntual";

            return `
              <article class="client-card">
                <div class="client-card-avatar">👤</div>

                <div class="client-card-info">
                  <h3>${esc(client.name)}</h3>
                  <p>${esc(client.locality || "Localidad sin indicar")}</p>
                  <p>${esc(client.address || "Dirección sin indicar")}</p>
                  ${client.phone ? `<p>☎ ${esc(client.phone)}</p>` : ""}
                  ${client.areaM2 ? `<p>Superficie: ${esc(client.areaM2)} m²</p>` : ""}
                  ${client.agreedPrice !== "" && client.agreedPrice != null
                    ? `<p>Precio acordado: ${this.formatMoney(client.agreedPrice)}</p>`
                    : ""}
                  <p>${serviceLabel}</p>
                  <p>Primer corte: ${esc(formatDate(client.firstCutDate))}</p>
                  ${client.notes
                    ? `<p class="client-card-notes">${esc(client.notes)}</p>`
                    : ""}
                </div>

                <div class="client-card-actions">
                  <button
                    type="button"
                    class="client-edit-button"
                    data-client-action="edit"
                    data-client-id="${esc(client.id)}"
                    aria-label="Editar ${esc(client.name)}"
                    title="Editar cliente"
                  >✎</button>

                  <button
                    type="button"
                    class="client-delete-button"
                    data-client-action="delete"
                    data-client-id="${esc(client.id)}"
                    aria-label="Eliminar ${esc(client.name)}"
                    title="Eliminar cliente"
                  >🗑️</button>
                </div>

              </article>
            `;
          }).join("")}
        </div>
      `;
    },

    formatMoney(value) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }).format(Number(value) || 0);
    },

    confirmDelete(clientId) {
  const client = this.list.find(c => String(c.id) === String(clientId));
  if (!client) return;

  document.querySelector("[data-client-delete-overlay]")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "calendar-modal-overlay visible";
  overlay.dataset.clientDeleteOverlay = "";

  overlay.innerHTML = `
    <div class="calendar-action-modal" role="dialog" aria-modal="true">
      <div class="calendar-modal-header">
        <h3>Eliminar cliente</h3>
      </div>
      <div class="calendar-modal-body">
        <p>¿Eliminar a <strong>${String(client.name).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}</strong> de la lista de clientes?</p>
        <p>Los cortes y registros existentes del calendario se conservarán.</p>
      </div>
      <div class="client-form-actions">
        <button type="button" class="secondary-button" data-client-delete-cancel>Cancelar</button>
        <button type="button" class="primary-button" data-client-delete-confirm>Eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("[data-client-delete-cancel]").addEventListener("click", () => overlay.remove());

  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.remove();
  });

  overlay.querySelector("[data-client-delete-confirm]").addEventListener("click", () => {
    const index = this.list.findIndex(c => String(c.id) === String(clientId));
    if (index < 0) return overlay.remove();

    const removed = this.list.splice(index, 1);

    if (!this.save()) {
      this.list.splice(index, 0, ...removed);
      return;
    }

    overlay.remove();

const container = document.querySelector("#clientsList");
if (container) {
  this.renderList(this.list);
} else {
  this.render();
}
  });
},

    openForm(clientId = null) {
      document.querySelector(".client-form-overlay")?.remove();

      const existing = clientId
        ? this.list.find(client => String(client.id) === String(clientId))
        : null;

      if (clientId && !existing) {
        alert("No se encontró ese cliente.");
        return;
      }

      const esc = AP.utils.escapeHTML;

      const client = existing || {
        name: "",
        phone: "",
        address: "",
        locality: "",
        areaM2: "",
        agreedPrice: "",
        notes: "",
        firstCutDate: "",
        serviceType: "one_time"
      };

      const overlay = document.createElement("div");
      overlay.className = "client-form-overlay";

      overlay.innerHTML = `
        <section
          class="client-form-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clientFormTitle"
        >
          <div class="client-form-header">
            <div>
              <p class="client-form-eyebrow">AGENDA PODA</p>
              <h2 id="clientFormTitle">
                ${existing ? "Editar cliente" : "Nuevo cliente"}
              </h2>
            </div>
            <button
              type="button"
              class="client-form-close"
              data-client-action="close"
              aria-label="Cerrar formulario"
            >×</button>
          </div>

          <form id="clientForm" class="client-form">
            <label>
              Nombre y apellido *
              <input name="name" required maxlength="100"
                value="${esc(client.name)}" placeholder="Nombre del cliente">
            </label>

            <label>
              Teléfono / WhatsApp
              <input name="phone" type="tel" maxlength="40"
                value="${esc(client.phone)}" placeholder="Teléfono de contacto">
            </label>

            <label>
              Dirección
              <input name="address" maxlength="180"
                value="${esc(client.address)}" placeholder="Calle y número">
            </label>

            <label>
              Localidad
              <input name="locality" maxlength="100"
                value="${esc(client.locality)}" placeholder="Ej.: Santa Clara del Mar">
            </label>

            <div class="client-form-row">
              <label>
                Superficie aproximada (m²)
                <input name="areaM2" type="number" min="0" step="any"
                  value="${esc(client.areaM2)}" placeholder="Ej.: 250">
              </label>

              <label>
                Precio acordado ($)
                <input name="agreedPrice" type="number" min="0" step="1"
                  value="${esc(client.agreedPrice)}" placeholder="Ej.: 35000">
              </label>
            </div>

<div class="client-service-choice">
  <span class="client-service-title">Modalidad del servicio</span>

  <div class="client-service-options">
    <label class="client-service-option">
      <input
        type="radio"
        name="serviceType"
        value="one_time"
        ${(client.serviceType || "one_time") === "one_time" ? "checked" : ""}
      >
      <span class="client-service-icon">✂️</span>
      <span class="client-service-name">Corte único</span>
      <small>Sin repetición automática</small>
    </label>

    <label class="client-service-option">
      <input
        type="radio"
        name="serviceType"
        value="monthly"
        ${client.serviceType === "monthly" ? "checked" : ""}
      >
      <span class="client-service-icon">🔄</span>
      <span class="client-service-name">Mensualidad</span>
      <small>Repetir cada 17 días</small>
    </label>
  </div>
</div>

            <label>
              Fecha del primer corte
              <input
                name="firstCutDate"
                type="date"
                value="${esc(client.firstCutDate || "")}"
              >
              <small>Si todavía no hay fecha confirmada, podés dejarla vacía.</small>
            </label>

            <label>
              Observaciones
              <textarea name="notes" rows="3" maxlength="1000"
                placeholder="Detalles del terreno, acceso, preferencias...">${esc(client.notes)}</textarea>
            </label>

            <p class="client-form-hint">Los campos con * son obligatorios.</p>

            <div class="client-form-actions">
              <button type="button" class="secondary-button"
                data-client-action="close">Cancelar</button>
              <button type="submit" class="primary-button">
                ${existing ? "Guardar cambios" : "Guardar cliente"}
              </button>
            </div>
          </form>
        </section>
      `;

      document.body.appendChild(overlay);

      $("#clientForm input[name='name']", overlay).focus();

      overlay.addEventListener("click", event => {
        if (event.target === overlay) overlay.remove();
      });

      overlay.addEventListener("click", event => {
        const button = event.target.closest("[data-client-action]");
        if (!button) return;

        if (button.dataset.clientAction === "close") {
          overlay.remove();
        }
      });

      $("#clientForm", overlay).addEventListener("submit", event => {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();

        if (!name) {
          alert("Ingresá el nombre del cliente.");
          return;
        }

        const firstCutDate = String(data.get("firstCutDate") || "").trim();
        const serviceType = data.get("serviceType") === "monthly"
          ? "monthly"
          : "one_time";

        const previousClient = existing
          ? { ...existing }
          : null;

        const record = {
          id: existing?.id || (
            window.crypto?.randomUUID
              ? crypto.randomUUID()
              : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
          ),
          name,
          phone: String(data.get("phone") || "").trim(),
          address: String(data.get("address") || "").trim(),
          locality: String(data.get("locality") || "").trim(),
          areaM2: String(data.get("areaM2") || "").trim(),
          agreedPrice: String(data.get("agreedPrice") || "").trim(),
          notes: String(data.get("notes") || "").trim(),
          firstCutDate,
          serviceType,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        let index = -1;

        if (existing) {
          index = this.list.findIndex(item => item.id === existing.id);
          if (index !== -1) this.list[index] = record;
        } else {
          this.list.push(record);
        }

        if (!this.save()) {
          if (existing && index !== -1) {
            this.list[index] = previousClient;
          } else {
            this.list = this.list.filter(item => item.id !== record.id);
          }
          return;
        }

        const eventsSaved = syncFirstCut(record);

        if (!eventsSaved) {
          alert(
            "El cliente se guardó, pero no se pudo guardar el trabajo en el calendario. " +
            "Revisá el almacenamiento antes de continuar."
          );
        }

        overlay.remove();

        if (AP.state.currentPage === "clientes") {
          AP.render();
        }

        console.log(
          existing ? "Cliente actualizado:" : "Cliente creado:",
          record.name
        );
      });
    },

    init() {
      document.addEventListener("click", event => {
        const button = event.target.closest("[data-client-action]");
        if (!button) return;

        const action = button.dataset.clientAction;

        if (action === "add") this.openForm();
        if (action === "edit") this.openForm(button.dataset.clientId);
        if (action === "delete") this.confirmDelete(button.dataset.clientId);
      });

      document.addEventListener("input", event => {
        if (event.target.id !== "clientSearch") return;

        const query = event.target.value.trim().toLocaleLowerCase("es-AR");

        const filtered = this.list.filter(client => {
          const searchable = [
            client.name,
            client.phone,
            client.address,
            client.locality
          ].join(" ").toLocaleLowerCase("es-AR");

          return searchable.includes(query);
        });

        const list = $("#clientsList");
        if (list) list.innerHTML = this.renderList(filtered);
      });
    }
  };
})();
