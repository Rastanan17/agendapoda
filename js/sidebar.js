
"use strict";

(() => {
  const AP = window.AgendaPoda;

  AP.sidebar = {
    init() {
      const sidebar = document.querySelector("#sidebar");
      const overlay = document.querySelector("#sidebarOverlay");
      const toggle = document.querySelector("#menuToggle");

      if (!sidebar || !overlay || !toggle) {
        console.error("Agenda Poda: faltan elementos del menú lateral.");
        return;
      }

      this.sidebar = sidebar;
      this.overlay = overlay;
      this.toggle = toggle;

      toggle.addEventListener("click", () => {
        this.toggleMenu();
      });

      overlay.addEventListener("click", () => {
        this.close();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.close();
        }
      });
    },

    open() {
      this.sidebar.classList.add("open");
      this.overlay.classList.add("visible");
      this.toggle.setAttribute("aria-expanded", "true");
    },

    close() {
      if (!this.sidebar || !this.overlay || !this.toggle) return;

      this.sidebar.classList.remove("open");
      this.overlay.classList.remove("visible");
      this.toggle.setAttribute("aria-expanded", "false");
    },

    toggleMenu() {
      if (this.sidebar.classList.contains("open")) {
        this.close();
      } else {
        this.open();
      }
    }
  };
})();
