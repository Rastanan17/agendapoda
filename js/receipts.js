
"use strict";

window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;

  AP.receipts = {
    formatMoney(value) {
      return "$ " + (Number(value) || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    formatDate(value) {
      if (!value) return "Pendiente";

      const parts = String(value).split("-").map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return value;

      return new Date(parts[0], parts[1] - 1, parts[2])
        .toLocaleDateString("es-AR");
    },

    escapeText(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    },

    paymentLabel(method) {
      const labels = {
        pendiente: "Sin pago todavía",
        efectivo: "Efectivo",
        transferencia: "Transferencia",
        mercado_pago: "Mercado Pago",
        otro: "Otro"
      };

      return labels[method] || "No especificado";
    },

    buildSVG(cut) {
      const width = 900;
      const height = 1500;
      const margin = 54;

      const esc = (value) => this.escapeText(value);
      const name = esc(cut.clientName || "Cliente");
      const phone = esc(cut.phone || "No informado");
      const address = esc(cut.address || "No informada");
      const locality = esc(cut.locality || "No informada");

      const area = cut.areaM2 !== undefined &&
        cut.areaM2 !== null &&
        cut.areaM2 !== ""
        ? `${Number(cut.areaM2).toLocaleString("es-AR")} m²`
        : "No especificada";

      const price = this.formatMoney(cut.price);
      const paid = this.formatMoney(cut.paid);
      const balanceValue = Number(cut.balance) || 0;
      const balance = this.formatMoney(balanceValue);
      const payment = esc(this.paymentLabel(cut.paymentMethod));
      const completed = cut.status === "realizado";
      const completionDate = completed
        ? this.formatDate(cut.completedDate || cut.date)
        : "Pendiente";

      const status = completed ? "REALIZADO" : "PENDIENTE";
      const statusColor = completed ? "#DCEBDD" : "#FFF1BD";
      const statusTextColor = completed ? "#183D2B" : "#745A00";

      const photoMarkup = cut.photo
        ? `
          <image
            href="${esc(cut.photo)}"
            x="74" y="930"
            width="350" height="230"
            preserveAspectRatio="xMidYMid slice"
            clip-path="url(#photoClip)"/>
        `
        : `
          <rect x="74" y="930" width="350" height="230"
            rx="18" fill="#DCEBDD"/>
          <text x="249" y="1028" text-anchor="middle"
            fill="#347A4B" font-size="25"
            font-family="Arial, sans-serif">🌿</text>
          <text x="249" y="1065" text-anchor="middle"
            fill="#183D2B" font-size="20"
            font-family="Arial, sans-serif">Trabajo realizado</text>
          <text x="249" y="1095" text-anchor="middle"
            fill="#707A72" font-size="16"
            font-family="Arial, sans-serif">Agenda Poda</text>
        `;

      const photoSection = `
        <text x="76" y="895" fill="#183D2B"
          font-size="23" font-weight="700"
          font-family="Arial, sans-serif">FOTO DEL TRABAJO</text>

        <rect x="68" y="924" width="362" height="242"
          rx="22" fill="#E1E7DF"/>

        ${photoMarkup}
      `;

      const field = (label, value, y) => `
        <text x="78" y="${y}" fill="#707A72"
          font-size="19" font-family="Arial, sans-serif">${label}</text>
        <text x="285" y="${y}" fill="#303832"
          font-size="20" font-weight="600"
          font-family="Arial, sans-serif">${value}</text>
      `;

      return `
        <svg xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="${width}" height="${height}"
          viewBox="0 0 ${width} ${height}">

          <defs>
            <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="100%" stop-color="#F4F6F2"/>
            </linearGradient>

            <linearGradient id="header" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#347A4B"/>
              <stop offset="100%" stop-color="#183D2B"/>
            </linearGradient>

            <clipPath id="photoClip">
              <rect x="74" y="930" width="350" height="230" rx="18"/>
            </clipPath>
          </defs>

          <!-- Fondo y marco -->
          <rect width="900" height="1500" fill="#F4F6F2"/>
          <rect x="24" y="24" width="852" height="1452"
            rx="30" fill="url(#paper)"
            stroke="#347A4B" stroke-width="5"/>

          <!-- Encabezado -->
          <path d="M27 54 Q27 27 54 27 H846 Q873 27 873 54
            V260 H27 Z" fill="url(#header)"/>

          <!-- Símbolo vegetal -->
          <g transform="translate(72 60)" fill="#DCEBDD">
            <path d="M0 115 Q-5 50 27 0 Q26 63 16 115Z"/>
            <path d="M22 115 Q26 37 76 8 Q54 72 35 115Z"/>
            <path d="M33 115 Q62 58 95 48 Q69 94 47 115Z"/>
            <path d="M10 115 Q-3 77 -25 57 Q-10 94 0 115Z"/>
          </g>

          <text x="185" y="100" fill="#F2C94C"
            font-size="21" font-weight="700" letter-spacing="4"
            font-family="Arial, sans-serif">SERVICIO DE JARDINERÍA</text>

          <text x="182" y="155" fill="#FFFFFF"
            font-size="47" font-weight="800"
            font-family="Arial, sans-serif">AGENDA PODA</text>

          <text x="185" y="193" fill="#DCEBDD"
            font-size="23" font-family="Arial, sans-serif">
            Cortes de pasto y jardines
          </text>

          <text x="185" y="229" fill="#FFFFFF"
            font-size="20" font-style="italic"
            font-family="Arial, sans-serif">
            Tu jardín, en buenas manos
          </text>

          <!-- Título -->
          <rect x="54" y="285" width="792" height="88"
            rx="20" fill="#183D2B"/>

          <text x="450" y="340" text-anchor="middle"
            fill="#FFFFFF" font-size="34" font-weight="800"
            font-family="Arial, sans-serif">
            COMPROBANTE DE TRABAJO
          </text>

          <!-- Fecha y estado -->
          <rect x="54" y="393" width="792" height="118"
            rx="18" fill="#EAF0E7"/>

          <text x="82" y="432" fill="#347A4B"
            font-size="18" font-weight="700"
            font-family="Arial, sans-serif">FECHA DE REALIZACIÓN</text>

          <text x="82" y="476" fill="#183D2B"
            font-size="32" font-weight="700"
            font-family="Arial, sans-serif">${completionDate}</text>

          <rect x="605" y="421" width="210" height="52"
            rx="16" fill="${statusColor}"/>

          <text x="710" y="454" text-anchor="middle"
            fill="${statusTextColor}" font-size="19"
            font-weight="700" font-family="Arial, sans-serif">
            ${status}
          </text>

          <!-- Datos del cliente -->
          <text x="74" y="563" fill="#183D2B"
            font-size="24" font-weight="800"
            font-family="Arial, sans-serif">DATOS DEL CLIENTE</text>

          <line x1="74" y1="582" x2="826" y2="582"
            stroke="#347A4B" stroke-width="2"/>

          ${field("Nombre:", name, 620)}
          ${field("Teléfono:", phone, 668)}
          ${field("Dirección:", address, 716)}
          ${field("Localidad:", locality, 764)}

          <!-- Detalle económico -->
          <rect x="54" y="795" width="792" height="78"
            rx="16" fill="#EAF0E7"/>

          <text x="78" y="825" fill="#183D2B"
            font-size="20" font-weight="800"
            font-family="Arial, sans-serif">DETALLE DEL TRABAJO</text>

          <text x="78" y="855" fill="#707A72"
            font-size="18" font-family="Arial, sans-serif">
            Superficie aprox.: ${esc(area)}
          </text>

          ${photoSection}

          <!-- Importes -->
          <rect x="460" y="920" width="360" height="246"
            rx="20" fill="#EAF0E7"/>

          <text x="485" y="961" fill="#707A72"
            font-size="19" font-family="Arial, sans-serif">Precio total</text>
          <text x="795" y="1000" text-anchor="end"
            fill="#183D2B" font-size="29" font-weight="800"
            font-family="Arial, sans-serif">${price}</text>

          <line x1="484" y1="1017" x2="796" y2="1017"
            stroke="#D5DED3" stroke-width="2"/>

          <text x="485" y="1052" fill="#707A72"
            font-size="19" font-family="Arial, sans-serif">Abonado</text>
          <text x="795" y="1084" text-anchor="end"
            fill="#183D2B" font-size="25" font-weight="700"
            font-family="Arial, sans-serif">${paid}</text>

          <text x="485" y="1120" fill="#707A72"
            font-size="19" font-family="Arial, sans-serif">Saldo pendiente</text>
          <text x="795" y="1150" text-anchor="end"
            fill="${balanceValue > 0 ? "#A33B2F" : "#183D2B"}"
            font-size="24" font-weight="800"
            font-family="Arial, sans-serif">${balance}</text>

          <!-- Forma de pago -->
          <text x="75" y="1200" fill="#707A72"
            font-size="18" font-family="Arial, sans-serif">FORMA DE PAGO</text>
          <text x="75" y="1232" fill="#183D2B"
            font-size="22" font-weight="700"
            font-family="Arial, sans-serif">${payment}</text>

          <!-- Agradecimiento y aclaración -->
          <text x="450" y="1280" text-anchor="middle"
            fill="#183D2B" font-size="29" font-style="italic"
            font-weight="700" font-family="Arial, sans-serif">
            ¡Gracias por confiar en nosotros!
          </text>

          <text x="450" y="1318" text-anchor="middle"
            fill="#707A72" font-size="17"
            font-family="Arial, sans-serif">
            Este comprobante es solo un registro de nuestro trabajo.
          </text>

          <text x="450" y="1343" text-anchor="middle"
            fill="#707A72" font-size="17"
            font-family="Arial, sans-serif">
            No es válido como ticket fiscal ni comprobante impositivo.
          </text>

          <!-- Césped decorativo -->
          <path d="
            M27 1400 L40 1370 L48 1400 L65 1360 L70 1400
            L90 1378 L96 1400 L117 1362 L125 1400
            L146 1374 L153 1400 L172 1358 L181 1400
            L204 1372 L210 1400 L231 1364 L239 1400
            L259 1378 L266 1400 L287 1357 L296 1400
            L320 1373 L326 1400 L349 1360 L357 1400
            L379 1375 L387 1400 L410 1359 L419 1400
            L440 1371 L449 1400 L472 1361 L480 1400
            L502 1377 L510 1400 L533 1358 L541 1400
            L563 1373 L571 1400 L593 1362 L602 1400
            L625 1378 L632 1400 L654 1357 L662 1400
            L684 1371 L692 1400 L715 1361 L723 1400
            L746 1375 L753 1400 L776 1359 L785 1400
            L807 1371 L816 1400 L838 1362 L850 1400
            L873 1380 L873 1450 L27 1450 Z"
            fill="#347A4B"/>

          <rect x="27" y="1400" width="846" height="73"
            rx="0" fill="#183D2B"/>

          <text x="450" y="1445" text-anchor="middle"
            fill="#FFFFFF" font-size="21" font-weight="700"
            font-family="Arial, sans-serif">
            Exclusivo, by ArcaPixelesStudio &amp; Rastanan
          </text>
        </svg>
      `;
    },

    async createImage(cut) {
      if (!cut) {
        throw new Error("No se recibió el trabajo para generar el comprobante.");
      }

      const svg = this.buildSVG(cut);
      const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);

      try {
        const image = new Image();

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(
            new Error("No se pudo preparar la imagen del comprobante.")
          );
          image.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 1500;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("No se pudo crear la imagen.");

        context.fillStyle = "#F4F6F2";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        return await new Promise((resolve, reject) => {
          canvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error("No se pudo exportar el comprobante PNG."));
          }, "image/png");
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    },

    async download(cut) {
      const blob = await this.createImage(cut);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `comprobante-${this.safeFilename(cut.clientName)}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    async shareWhatsApp(cut) {
      const blob = await this.createImage(cut);
      const filename =
        `comprobante-${this.safeFilename(cut.clientName)}.png`;

      const file = new File([blob], filename, { type: "image/png" });

      const text = [
        "Comprobante de trabajo - Pastos Zark",
        `Cliente: ${cut.clientName || "Cliente"}`,
        `Dirección: ${cut.address || "No informada"}`,
        `Localidad: ${cut.locality || "No informada"}`,
        `Fecha de realización: ${
          cut.status === "realizado"
            ? this.formatDate(cut.completedDate || cut.date)
            : "Pendiente"
        }`,
        `Trabajo: ${cut.status === "realizado" ? "Realizado" : "Pendiente"}`,
        `Precio: ${this.formatMoney(cut.price)}`,
        `Abonado: ${this.formatMoney(cut.paid)}`,
        `Saldo pendiente: ${this.formatMoney(cut.balance)}`
      ].join("\n");

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Comprobante de Pastos Zark",
          text,
          files: [file]
        });
        return;
      }

      await this.download(cut);

      const phone = String(cut.phone || "").replace(/\D/g, "");
      const message = encodeURIComponent(
        `${text}\n\nEl comprobante se descargó como imagen. Adjuntalo a este chat.`
      );

      const whatsappURL = phone
        ? `https://wa.me/${phone}?text=${message}`
        : `https://wa.me/?text=${message}`;

      window.open(whatsappURL, "_blank", "noopener,noreferrer");
    },

    safeFilename(value) {
      return String(value || "cliente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "cliente";
    }
  };
})();
