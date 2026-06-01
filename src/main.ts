// ==========================================
// Cinema Seat Manager System
// ==========================================

// Tipo para la matriz de asientos (0 = disponible, 1 = ocupado)
type SeatMatrix = number[][];

// Constantes para la sala
const ROWS = 8;
const COLUMNS = 10;
const AVAILABLE = 0;
const OCCUPIED = 1;

// Estado global
let cinema: SeatMatrix = [];
let selectedSeat: { row: number; column: number } | null = null;

/**
 * Inicializa una matriz de asientos con todos los asientos disponibles (0)
 */
function initializeSeats(): SeatMatrix {
  const seats: SeatMatrix = [];
  for (let i = 0; i < ROWS; i++) {
    seats[i] = [];
    for (let j = 0; j < COLUMNS; j++) {
      seats[i][j] = AVAILABLE;
    }
  }
  return seats;
}

/**
 * Reserva un asiento en una posición específica (fila, columna)
 */
function reserveSeat(seats: SeatMatrix, row: number, column: number): boolean {
  // Validar que los números de fila y columna estén en rango válido (1-8, 1-10)
  if (row < 1 || row > ROWS || column < 1 || column > COLUMNS) {
    return false;
  }

  const seatIndex = row - 1;
  const columnIndex = column - 1;

  // Validar si el asiento ya está ocupado
  if (seats[seatIndex][columnIndex] === OCCUPIED) {
    return false;
  }

  // Reservar el asiento
  seats[seatIndex][columnIndex] = OCCUPIED;
  return true;
}

/**
 * Cuenta y devuelve cuántos asientos están ocupados y disponibles en toda la sala
 */
function countSeats(seats: SeatMatrix): { occupied: number; available: number } {
  let occupied = 0;
  let available = 0;

  seats.forEach((row) => {
    row.forEach((seat) => {
      if (seat === OCCUPIED) {
        occupied++;
      } else {
        available++;
      }
    });
  });

  return { occupied, available };
}

/**
 * Imprime el estado actual de la sala en la consola.
 * Usa X para ocupados, L para libres, e incluye números de fila y columna.
 */
function printSeatMatrix(seats: SeatMatrix): void {
  console.log("\nEstado de la sala:");
  let headerRow = "   ";
  for (let col = 1; col <= COLUMNS; col++) {
    headerRow += col.toString().padStart(2, " ") + " ";
  }
  console.log(headerRow.trimEnd());

  for (let row = 0; row < ROWS; row++) {
    const rowNumber = (row + 1).toString().padStart(2, " ");
    let rowText = `${rowNumber} `;

    for (let col = 0; col < COLUMNS; col++) {
      const seatSymbol = seats[row][col] === OCCUPIED ? "X" : "L";
      rowText += ` ${seatSymbol}`;
    }

    console.log(rowText);
  }
}

/**
 * Busca dos asientos libres contiguos en la sala
 */
function findTwoAdjacentSeats(seats: SeatMatrix): { row: number; columns: [number, number] } | null {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLUMNS - 1; j++) {
      // Verificar si dos asientos contiguos (j y j+1) están libres
      if (seats[i][j] === AVAILABLE && seats[i][j + 1] === AVAILABLE) {
        return {
          row: i + 1,
          columns: [j + 1, j + 2],
        };
      }
    }
  }

  return null;
}

/**
 * Renderiza el mapa de asientos en la interfaz
 */
function renderSeats(): void {
  const container = document.getElementById("seats-container");
  const columnNumbers = document.getElementById("column-numbers");

  if (!container || !columnNumbers) return;

  container.innerHTML = "";
  columnNumbers.innerHTML = "";

  // Generar números de columnas
  columnNumbers.innerHTML = '<div class="column-num"></div>'; // Espacio para la etiqueta de fila
  for (let col = 1; col <= COLUMNS; col++) {
    const num = document.createElement("div");
    num.className = "column-num";
    num.textContent = col.toString();
    columnNumbers.appendChild(num);
  }

  // Generar filas
  for (let row = 0; row < ROWS; row++) {
    const rowNumber = row + 1;
    const rowLetter = String.fromCharCode(64 + rowNumber);

    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    // Label de fila
    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = rowLetter;
    rowDiv.appendChild(label);

    // Contenedor de asientos
    const seatsRowDiv = document.createElement("div");
    seatsRowDiv.className = "seats-row";

    // Crear asientos
    for (let col = 0; col < COLUMNS; col++) {
      const seatNumber = cinema[row][col];
      const colNumber = col + 1;

      const button = document.createElement("button");
      button.className = "seat";
      button.textContent = seatNumber === OCCUPIED ? "X" : "L";

      if (seatNumber === OCCUPIED) {
        button.classList.add("occupied");
        button.disabled = true;
      } else {
        button.classList.add("available");

        if (
          selectedSeat &&
          selectedSeat.row === rowNumber &&
          selectedSeat.column === colNumber
        ) {
          button.classList.remove("available");
          button.classList.add("selected");
        }

        button.addEventListener("click", () => handleSeatClick(rowNumber, colNumber));
      }

      seatsRowDiv.appendChild(button);
    }

    rowDiv.appendChild(seatsRowDiv);
    container.appendChild(rowDiv);
  }
}

/**
 * Maneja el clic en un asiento
 */
function handleSeatClick(row: number, column: number): void {
  const statusMessage = document.getElementById("status-message");
  const selectionInfo = document.getElementById("selection-info");
  const selectedSeatSpan = document.getElementById("selected-seat");

  if (!statusMessage || !selectionInfo || !selectedSeatSpan) return;

  const rowLetter = String.fromCharCode(64 + row);
  const seatId = `${rowLetter}${column}`;

  // Si el asiento ya estaba seleccionado, deseleccionar y reservar
  if (selectedSeat && selectedSeat.row === row && selectedSeat.column === column) {
    // Reservar el asiento
    if (reserveSeat(cinema, row, column)) {
      statusMessage.textContent = `✅ ¡Asiento ${seatId} reservado!`;
      statusMessage.className = "text-center text-sm text-green-600 font-semibold";
      selectedSeat = null;
      selectionInfo.classList.add("hidden");
    } else {
      statusMessage.textContent = "❌ Error al reservar";
      statusMessage.className = "text-center text-sm text-red-600 font-semibold";
    }
  } else {
    // Seleccionar el asiento
    selectedSeat = { row, column };
    selectedSeatSpan.textContent = seatId;
    selectionInfo.classList.remove("hidden");
    statusMessage.textContent = "Confirma haciendo clic de nuevo";
    statusMessage.className = "text-center text-sm text-orange-600 font-semibold";
  }

  updateStatistics();
  renderSeats();
  printSeatMatrix(cinema);
}

/**
 * Actualiza las estadísticas en la interfaz
 */
function updateStatistics(): void {
  const { occupied, available } = countSeats(cinema);

  const occupiedCount = document.getElementById("occupied-count");
  const availableCount = document.getElementById("available-count");

  if (occupiedCount) {
    occupiedCount.textContent = occupied.toString();
  }
  if (availableCount) {
    availableCount.textContent = available.toString();
  }
}

/**
 * Busca dos asientos contiguos y los selecciona
 */
function handleFindAdjacent(): void {
  const result = findTwoAdjacentSeats(cinema);
  const statusMessage = document.getElementById("status-message");
  const selectionInfo = document.getElementById("selection-info");

  if (!statusMessage || !selectionInfo) return;

  if (result) {
    // Seleccionar los dos asientos encontrados
    const [col1, col2] = result.columns;
    const rowLetter = String.fromCharCode(64 + result.row);
    selectedSeat = { row: result.row, column: col1 };

    // Reservar ambos asientos
    reserveSeat(cinema, result.row, col1);
    reserveSeat(cinema, result.row, col2);

    statusMessage.textContent = `✅ ¡Contiguos reservados: ${rowLetter}${col1}-${col2}!`;
    statusMessage.className = "text-center text-sm text-green-600 font-semibold";
    selectionInfo.classList.add("hidden");
  } else {
    statusMessage.textContent = "❌ Sin asientos contiguos disponibles";
    statusMessage.className = "text-center text-sm text-red-600 font-semibold";
  }

  updateStatistics();
  renderSeats();
  printSeatMatrix(cinema);
}

/**
 * Reinicia la sala a estado inicial
 */
function handleReset(): void {
  cinema = initializeSeats();
  selectedSeat = null;

  const statusMessage = document.getElementById("status-message");
  const selectionInfo = document.getElementById("selection-info");

  if (statusMessage) {
    statusMessage.textContent = "Haz clic en un asiento para reservar";
    statusMessage.className = "text-center text-sm text-gray-600";
  }
  if (selectionInfo) {
    selectionInfo.classList.add("hidden");
  }

  updateStatistics();
  renderSeats();
  printSeatMatrix(cinema);
}

/**
 * Inicializa la aplicación
 */
function init(): void {
  // Inicializar la sala
  cinema = initializeSeats();

  // Renderizar asientos iniciales
  renderSeats();
  updateStatistics();
  printSeatMatrix(cinema);

  // Conectar botones
  const findAdjacentBtn = document.getElementById("find-adjacent-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (findAdjacentBtn) {
    findAdjacentBtn.addEventListener("click", handleFindAdjacent);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleReset);
  }

  console.log("Cinema Seat Manager inicializado ✅");
}

// Iniciar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {};
