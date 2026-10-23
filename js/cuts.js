
"use strict";

(() => {
  const AP = window.AgendaPoda;

  AP.cuts = {
    editingId: null,
    selectedPhoto: null,

    openForm(cut = null) {
      this.editingId = cut?.id ?? null;
      this.selectedPhoto = cut?.photo ?? null;

      const date = cut?.scheduledDate
        || AP.utils.dateKey(AP.state.selectedDate || new Date());

      const modal = document.createElement("div");
      modal.className = "calendar-modal-overlay visible";
      modal.dataset.cutFormOverlay = "";

      modal.innerHTML = `
        <section class="calendar-action-modal cut-form-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cutFormTitle">

          <header class="calendar-modal-header">
            <div>
              <span class="calendar-modal-eyebrow">
                AGENDA PODA
              </span>
              <h2 id="cutFormTitle">
                ${cut ? "Editar corte único" : "Agregar corte único"}
              </h2>
            </div>

            <button type="button"
              class="calendar-modal-close"
              data-cut-close
              aria-label="Cerrar">×</button>
          </header>

          <form class="cut-form" data-cut-form>
            <div class="cut-form-field">
              <label for="cutClientName">Nombre del cliente *</label>
              <input id="cutClientName" name="clientName"
                type="text" maxlength="100" required
                value="${AP.utils.escapeHTML(cut?.clientName || "")}"
                placeholder="Nombre y apellido">
            </div>

            <div class="cut-form-field">
              <label for="cutPhone">Teléfono / WhatsApp</label>
              <input id="cutPhone" name="phone"
                type="tel" maxlength="30"
                value="${AP.utils.escapeHTML(cut?.phone || "")}"
                placeholder="Ej.: 223 555 1234">
            </div>

<div class="cut-form-field">
  <label for="cutAddress">Dirección *</label>
  <input
    id="cutAddress"
    name="address"
    type="text"
    maxlength="150"
    required
    value="${AP.utils.escapeHTML(cut?.address || "")}"
    placeholder="Calle y número">
</div>

<div class="cut-form-field">
  <label for="cutLocality">Localidad *</label>
  <input
    id="cutLocality"
    name="locality"
    type="text"
    maxlength="100"
    required
    value="${AP.utils.escapeHTML(cut?.locality || "")}"
    placeholder="Ej.: Santa Clara del Mar">
</div>

            <div class="cut-form-field">
              <label for="cutArea">Tamaño del terreno (m²)</label>
              <input id="cutArea" name="areaM2"
                type="number" min="0" step="0.01"
                value="${cut?.areaM2 ?? ""}"
                placeholder="Ej.: 250">
            </div>

            <div class="cut-form-row">
              <div class="cut-form-field">
                <label for="cutPrice">Precio ($) *</label>
                <input id="cutPrice" name="price"
                  type="number" min="0" step="0.01" required
                  value="${cut?.price ?? ""}"
                  placeholder="0">
              </div>

              <div class="cut-form-field">
                <label for="cutPaid">Pago recibido ($)</label>
                <input id="cutPaid" name="paid"
                  type="number" min="0" step="0.01"
                  value="${cut?.paid ?? 0}"
                  placeholder="0">
              </div>
            </div>

            <div class="cut-form-field">
              <label for="cutPaymentMethod">Forma de pago</label>
              <select id="cutPaymentMethod" name="paymentMethod">
                <option value="pendiente">Sin pago todavía</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercado_pago">Mercado Pago</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div class="cut-form-field">
              <label for="cutScheduledDate">Fecha programada *</label>
              <input id="cutScheduledDate" name="scheduledDate"
                type="date" required
                value="${date}">
            </div>

            <div class="cut-form-field">
              <label for="cutStatus">Estado del trabajo *</label>
              <select id="cutStatus" name="status">
                <option value="pendiente">Pendiente</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>

            <div class="cut-form-field"
              data-completed-date-field
              ${cut?.status === "realizado" ? "" : "hidden"}>
              <label for="cutCompletedDate">Fecha real del corte</label>
              <input id="cutCompletedDate" name="completedDate"
                type="date"
                value="${cut?.completedDate || ""}">
              <small>Usá el día en que realmente hiciste el trabajo.</small>
            </div>

            <div class="cut-form-field">
              <label>Foto del terreno o del trabajo</label>
              <div class="cut-photo-actions">
                <button type="button" data-cut-camera>
                  📷 Sacar foto
                </button>
                <button type="button" data-cut-gallery>
                  🖼️ Elegir de galería
                </button>
              </div>

              <input type="file" accept="image/*"
                capture="environment" data-cut-camera-input hidden>
              <input type="file" accept="image/*"
                data-cut-gallery-input hidden>

              <div class="cut-photo-preview" data-cut-photo-preview>
                ${this.selectedPhoto
                  ? `<img src="${this.selectedPhoto}" alt="Foto del trabajo">`
                  : `<span>Sin foto adjunta</span>`}
              </div>

              <button type="button" data-cut-remove-photo
                class="cut-remove-photo"
                ${this.selectedPhoto ? "" : "hidden"}>
                Quitar foto
              </button>
            </div>

            <div class="cut-form-balance" data-cut-balance>
              Saldo pendiente: $0
            </div>

            <div class="cut-form-message" data-cut-message
              role="status" aria-live="polite"></div>

            <div class="cut-form-footer">
              <button type="button" data-cut-close
                class="cut-secondary-button">Cancelar</button>
              <button type="submit" class="cut-primary-button">
                ${cut ? "Guardar cambios" : "Guardar corte"}
              </button>
            </div>
          </form>
        </section>
      `;

      document.body.appendChild(modal);

      const form = modal.querySelector("[data-cut-form]");
      const status = form.elements.status;
      const completedField = modal.querySelector(
        "[data-completed-date-field]"
      );
      const completedDate = form.elements.completedDate;
      const paymentMethod = form.elements.paymentMethod;

      status.value = cut?.status || "pendiente";
      paymentMethod.value = cut?.paymentMethod || "pendiente";

      const updateStatusFields = () => {
        const completed = status.value === "realizado";
        completedField.hidden = !completed;

        if (completed && !completedDate.value) {
          completedDate.value = AP.utils.dateKey(new Date());
        }
      };

      const updateBalance = () => {
        const price = Number(form.elements.price.value) || 0;
        const paid = Number(form.elements.paid.value) || 0;
        const balance = price - paid;

        modal.querySelector("[data-cut-balance]").textContent =
          `Saldo ${balance > 0 ? "pendiente" : "a favor"}: $${Math.abs(balance).toLocaleString("es-AR")}`;
      };

      status.addEventListener("change", updateStatusFields);
      form.elements.price.addEventListener("input", updateBalance);
      form.elements.paid.addEventListener("input", updateBalance);

      modal.addEventListener("click", (event) => {
        if (
          event.target === modal ||
          event.target.closest("[data-cut-close]")
        ) {
          modal.remove();
          this.editingId = null;
          this.selectedPhoto = null;
          return;
        }

        if (event.target.closest("[data-cut-camera]")) {
          modal.querySelector("[data-cut-camera-input]").click();
        }

        if (event.target.closest("[data-cut-gallery]")) {
          modal.querySelector("[data-cut-gallery-input]").click();
        }

        if (event.target.closest("[data-cut-remove-photo]")) {
          this.selectedPhoto = null;
          this.renderPhotoPreview(modal);
        }
      });

      const handlePhoto = (input) => {
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          this.showMessage(modal, "Elegí un archivo de imagen válido.");
          input.value = "";
          return;
        }

        if (file.size > 8 * 1024 * 1024) {
          this.showMessage(modal, "La imagen debe pesar menos de 8 MB.");
          input.value = "";
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          this.selectedPhoto = reader.result;
          this.renderPhotoPreview(modal);
        };

        reader.onerror = () => {
          this.showMessage(modal, "No se pudo leer la imagen.");
        };

        reader.readAsDataURL(file);
      };

      modal.querySelector("[data-cut-camera-input]")
        .addEventListener("change", (event) => handlePhoto(event.target));

      modal.querySelector("[data-cut-gallery-input]")
        .addEventListener("change", (event) => handlePhoto(event.target));

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.saveForm(form, modal);
      });

      updateStatusFields();
      updateBalance();
      form.elements.clientName.focus();
    },

    renderPhotoPreview(modal) {
      const preview = modal.querySelector("[data-cut-photo-preview]");
      const removeButton = modal.querySelector("[data-cut-remove-photo]");

      preview.innerHTML = this.selectedPhoto
        ? `<img src="${this.selectedPhoto}" alt="Foto del trabajo">`
        : `<span>Sin foto adjunta</span>`;

      removeButton.hidden = !this.selectedPhoto;
    },

    showMessage(modal, message) {
      const element = modal.querySelector("[data-cut-message]");
      if (element) element.textContent = message;
    },

    saveForm(form, modal) {
      const data = new FormData(form);
      const clientName = String(data.get("clientName") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const address = String(data.get("address") || "").trim();
      const locality = String(data.get("locality") || "").trim();
      const areaM2 = Number(data.get("areaM2")) || 0;
      const price = Number(data.get("price"));
      const paid = Number(data.get("paid")) || 0;
      const paymentMethod = String(data.get("paymentMethod") || "pendiente");
      const scheduledDate = String(data.get("scheduledDate") || "");
      const status = String(data.get("status") || "pendiente");
      const completedDate = String(data.get("completedDate") || "");

      if (!clientName) {
        this.showMessage(modal, "Ingresá el nombre del cliente.");
        form.elements.clientName.focus();
        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        this.showMessage(modal, "Ingresá un precio válido.");
        form.elements.price.focus();
        return;
      }

        if (!address) {
        this.showMessage(modal, "Ingresá la dirección del trabajo.");
        form.elements.address.focus();
        return;
        }

        if (!locality) {
        this.showMessage(modal, "Ingresá la localidad.");
        form.elements.locality.focus();
        return;
        }

      if (paid < 0) {
        this.showMessage(modal, "El pago no puede ser negativo.");
        form.elements.paid.focus();
        return;
      }

      if (paid > price) {
        this.showMessage(modal, "El pago recibido no puede superar el precio. Revisá los importes.");
        form.elements.paid.focus();
        return;
      }

      if (!scheduledDate) {
        this.showMessage(modal, "Elegí la fecha programada.");
        form.elements.scheduledDate.focus();
        return;
      }

      if (status === "realizado" && !completedDate) {
        this.showMessage(modal, "Indicá la fecha real en que hiciste el corte.");
        form.elements.completedDate.focus();
        return;
      }

      const existing = AP.state.events.find(
        (event) => event.id === this.editingId
      );

      const cut = {
        ...(existing || {}),
        id: this.editingId || `cut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: "corte_unico",
        clientName,
        phone,
        address,
        locality,
        areaM2,
        price,
        paid,
        balance: price - paid,
        paymentMethod,
        scheduledDate,
        completedDate: status === "realizado" ? completedDate : "",
        status,
        completed: status === "realizado",
        date: status === "realizado" ? completedDate : scheduledDate,
        title: clientName,
        photo: this.selectedPhoto,
        updatedAt: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString()
      };

      if (existing) {
        Object.assign(existing, cut);
      } else {
        AP.state.events.push(cut);
      }

      if (typeof AP.storage?.save === "function") {
        AP.storage.save();
      } else {
        try {
          localStorage.setItem(
            "agendaPodaEvents",
            JSON.stringify(AP.state.events)
          );
        } catch (error) {
          console.error("No se pudieron guardar los trabajos:", error);
          this.showMessage(
            modal,
            "No se pudo guardar. La foto podría ser demasiado grande."
          );
          return;
        }
      }

      AP.state.selectedDate = AP.utils.dateFromKey(cut.date);
      AP.state.calendarMonth = new Date(
        AP.state.selectedDate.getFullYear(),
        AP.state.selectedDate.getMonth(),
        1
      );

      modal.remove();
      this.editingId = null;
      this.selectedPhoto = null;

      if (typeof AP.render === "function") {
        AP.render();
      }

      console.log("Corte guardado:", cut);
    }
  };
})();
