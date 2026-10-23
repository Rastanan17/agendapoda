
"use strict";

window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;

  const EVENTS_KEY = "agendaPodaEvents";
  const DB_NAME = "AgendaPodaDB";
  const DB_VERSION = 1;
  const PHOTO_STORE = "photos";

  let dbPromise = null;

  function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("Este navegador no admite IndexedDB."));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => {
        dbPromise = null;
        reject(request.error || new Error("No se pudo abrir la base de datos."));
      };

      request.onblocked = () => {
        console.warn("Agenda Poda: la base de datos está bloqueada por otra pestaña.");
      };
    });

    return dbPromise;
  }

  function photoTransaction(mode, callback) {
    return openDatabase().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, mode);
      const store = transaction.objectStore(PHOTO_STORE);

      let result;

      try {
        result = callback(store);
      } catch (error) {
        reject(error);
        return;
      }

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(
        transaction.error || new Error("Falló la operación de fotos.")
      );
      transaction.onabort = () => reject(
        transaction.error || new Error("Se canceló la operación de fotos.")
      );
    }));
  }

  function readEvents() {
    const raw = localStorage.getItem(EVENTS_KEY);

    if (!raw) return [];

    const events = JSON.parse(raw);

    if (!Array.isArray(events)) {
      throw new Error("Los datos guardados de Agenda Poda no tienen el formato esperado.");
    }

    return events;
  }

  function saveEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  AP.storage = {
    async init() {
      try {
        await openDatabase();
      } catch (error) {
        console.warn("Agenda Poda: almacenamiento de fotos no disponible.", error);
      }

      try {
        const storedEvents = readEvents();

        if (Array.isArray(AP.state.events) && AP.state.events.length === 0) {
          AP.state.events = storedEvents;
        }
      } catch (error) {
        console.error("No se pudieron recuperar los trabajos guardados.", error);
      }

      return AP.state.events;
    },

    load() {
      try {
        return readEvents();
      } catch (error) {
        console.error("No se pudieron leer los trabajos.", error);
        return [];
      }
    },

    save() {
      try {
        saveEvents(AP.state.events);
        return true;
      } catch (error) {
        console.error("No se pudieron guardar los trabajos.", error);
        return false;
      }
    },

    async savePhoto(id, blob) {
      if (!id || !blob) {
        throw new Error("Falta el identificador o el archivo de imagen.");
      }

      return photoTransaction("readwrite", (store) => {
        store.put({
          id: String(id),
          blob,
          updatedAt: new Date().toISOString()
        });
      });
    },

    async getPhoto(id) {
      if (!id) return null;

      const db = await openDatabase();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE, "readonly");
        const request = transaction.objectStore(PHOTO_STORE).get(String(id));

        request.onsuccess = () => {
          resolve(request.result?.blob || null);
        };

        request.onerror = () => reject(
          request.error || new Error("No se pudo recuperar la foto.")
        );
      });
    },

    async deletePhoto(id) {
      if (!id) return;

      return photoTransaction("readwrite", (store) => {
        store.delete(String(id));
      });
    },

    async clearPhotos() {
      return photoTransaction("readwrite", (store) => {
        store.clear();
      });
    },

    async saveCutPhoto(cutId, dataUrl) {
      if (!cutId || !dataUrl) return null;

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await this.savePhoto(cutId, blob);

      return String(cutId);
    },

    async getCutPhotoUrl(cutId) {
      const blob = await this.getPhoto(cutId);

      return blob ? URL.createObjectURL(blob) : null;
    }
  };
})();
