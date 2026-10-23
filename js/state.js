
"use strict";

window.AgendaPoda = window.AgendaPoda || {};

(() => {
  const AP = window.AgendaPoda;

  AP.state = {
    currentPage: "inicio",
    calendarMonth: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ),
    selectedDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ),
    events: []
  };

  AP.pages = {
    inicio: {
      title: "Inicio",
      eyebrow: "TU ESPACIO DE TRABAJO"
    },
    calendario: {
      title: "Calendario",
      eyebrow: "ORGANIZACIÓN DE VISITAS"
    },
    clientes: {
      title: "Clientes",
      eyebrow: "TU CARTERA DE CLIENTES",
      description: "Acá organizaremos los datos, direcciones, teléfonos y trabajos de cada cliente."
    },
    trabajos: {
      title: "Trabajos",
      eyebrow: "TRABAJOS DE PODA",
      description: "Acá podrás organizar las podas, tareas pendientes, fechas programadas y trabajos realizados."
    },
    presupuestos: {
      title: "Presupuestos",
      eyebrow: "CONTROL DE PRESUPUESTOS",
      description: "Acá prepararemos presupuestos para clientes y llevaremos el control de los importes."
    },
    movimientos: {
      title: "Movimientos",
      eyebrow: "ECONOMÍA",
      description: "Ingresos, gastos y saldo del trabajo."
    },
    estadisticas: {
      title: "Estadísticas",
      eyebrow: "RESUMEN DEL NEGOCIO",
      description: "Acá veremos los trabajos realizados, los ingresos y la evolución de la actividad."
    },
    configuracion: {
      title: "Configuración",
      eyebrow: "AJUSTES DE LA APLICACIÓN",
      description: "Acá reuniremos las preferencias y las opciones de la aplicación."
    }
  };

  AP.monthNames = [
    "enero", "febrero", "marzo", "abril",
    "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"
  ];

  AP.weekDays = [
    "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
  ];
})();
