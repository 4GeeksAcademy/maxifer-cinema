// ==========================================
// Cinema Seat Manager System
// ==========================================

// Tipo para la matriz de asientos (0 = disponible, 1 = ocupado)
type SeatMatrix = number[][];

// Constantes para la sala
const ROWS = 8;
const COLUMNS = 10;
const TOTAL = ROWS * COLUMNS;
const AVAILABLE = 0;
const OCCUPIED = 1;

// Estado global
let cinema: SeatMatrix = [];
let selectedSeat: { row: number; column: number } | null = null;

const baseStatusClass =
  "rounded-lg bg-black/30 px-4 py-3 text-center text-sm font-semibold ring-1 ring-white/10";

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
 * Reserva un asiento en una posicion especifica (fila, columna)
 */
function reserveSeat(seats: SeatMatrix, row: number, column: number): boolean {
  if (row < 1 || row > ROWS || column < 1 || column > COLUMNS) {
    return false;
  }

  const seatIndex = row - 1;
  const columnIndex = column - 1;

  if (seats[seatIndex][columnIndex] === OCCUPIED) {
    return false;
  }

  seats[seatIndex][columnIndex] = OCCUPIED;
  return true;
}

/**
 * Cuenta y devuelve cuantos asientos estan ocupados y disponibles en toda la sala
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

  columnNumbers.innerHTML = "<div></div>";
  for (let col = 1; col <= COLUMNS; col++) {
    const num = document.createElement("div");
    num.className = "text-zinc-500";
    num.textContent = col.toString();
    columnNumbers.appendChild(num);
  }

  for (let row = 0; row < ROWS; row++) {
    const rowNumber = row + 1;
    const rowLetter = String.fromCharCode(64 + rowNumber);

    const rowDiv = document.createElement("div");
    rowDiv.className = "seat-grid-row";

    const label = document.createElement("div");
    label.className = "seat-row-label";
    label.textContent = rowLetter;
    rowDiv.appendChild(label);

    const seatsRowDiv = document.createElement("div");
    seatsRowDiv.className = "seat-row";

    for (let col = 0; col < COLUMNS; col++) {
      const seatNumber = cinema[row][col];
      const colNumber = col + 1;
      const seatId = `${rowLetter}${colNumber}`;

      const button = document.createElement("button");
      button.className = "seat";
      button.setAttribute("aria-label", `${seatId} ${seatNumber === OCCUPIED ? "ocupado" : "disponible"}`);

      if (seatNumber === OCCUPIED) {
        button.textContent = "X";
        button.classList.add("bg-rose-500", "text-white", "ring-2", "ring-rose-600");
        button.disabled = true;
      } else {
        button.textContent = colNumber.toString();
        button.classList.add("bg-emerald-500", "text-emerald-950", "ring-2", "ring-emerald-600", "hover:bg-emerald-400");

        if (selectedSeat && selectedSeat.row === rowNumber && selectedSeat.column === colNumber) {
          button.classList.remove("bg-emerald-500", "text-emerald-950", "ring-emerald-600", "hover:bg-emerald-400");
          button.classList.add("bg-orange-500", "text-white", "ring-orange-500", "shadow-[0_0_0_6px_rgba(251,146,60,0.22)]");
          button.setAttribute("aria-pressed", "true");
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

  if (selectedSeat && selectedSeat.row === row && selectedSeat.column === column) {
    if (reserveSeat(cinema, row, column)) {
      statusMessage.textContent = `Asiento ${seatId} reservado.`;
      statusMessage.className = `${baseStatusClass} text-emerald-300`;
      selectedSeat = null;
      selectionInfo.classList.add("hidden");
    } else {
      statusMessage.textContent = "Error al reservar.";
      statusMessage.className = `${baseStatusClass} text-rose-300`;
    }
  } else {
    selectedSeat = { row, column };
    selectedSeatSpan.textContent = seatId;
    selectionInfo.classList.remove("hidden");
    statusMessage.textContent = "Confirma haciendo clic de nuevo.";
    statusMessage.className = `${baseStatusClass} text-amber-300`;
  }

  updateStatistics();
  renderSeats();
  printSeatMatrix(cinema);
}

/**
 * Actualiza las estadisticas en la interfaz
 */
function updateStatistics(): void {
  const { occupied, available } = countSeats(cinema);

  const totalCount = document.getElementById("total-count");
  const occupiedCount = document.getElementById("occupied-count");
  const availableCount = document.getElementById("available-count");
  const dlTotal = document.getElementById("dl-total");
  const dlOccupied = document.getElementById("dl-occupied");
  const dlAvailable = document.getElementById("dl-available");

  if (totalCount) {
    totalCount.textContent = TOTAL.toString();
  }
  if (occupiedCount) {
    occupiedCount.textContent = occupied.toString();
  }
  if (availableCount) {
    availableCount.textContent = available.toString();
  }
  if (dlTotal) {
    dlTotal.textContent = TOTAL.toString();
  }
  if (dlOccupied) {
    dlOccupied.textContent = occupied.toString();
  }
  if (dlAvailable) {
    dlAvailable.textContent = available.toString();
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
    const [col1, col2] = result.columns;
    const rowLetter = String.fromCharCode(64 + result.row);
    selectedSeat = { row: result.row, column: col1 };

    reserveSeat(cinema, result.row, col1);
    reserveSeat(cinema, result.row, col2);

    statusMessage.textContent = `Contiguos reservados: ${rowLetter}${col1}-${col2}.`;
    statusMessage.className = `${baseStatusClass} text-emerald-300`;
    selectionInfo.classList.add("hidden");
  } else {
    statusMessage.textContent = "Sin asientos contiguos disponibles.";
    statusMessage.className = `${baseStatusClass} text-rose-300`;
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
    statusMessage.textContent = "Haz clic en un asiento para reservar.";
    statusMessage.className = `${baseStatusClass} text-zinc-300`;
  }
  if (selectionInfo) {
    selectionInfo.classList.add("hidden");
  }

  updateStatistics();
  renderSeats();
  printSeatMatrix(cinema);
}

/**
 * Inicializa la aplicacion
 */
function init(): void {
  cinema = initializeSeats();

  renderSeats();
  updateStatistics();
  printSeatMatrix(cinema);

  const findAdjacentBtn = document.getElementById("find-adjacent-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (findAdjacentBtn) {
    findAdjacentBtn.addEventListener("click", handleFindAdjacent);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleReset);
  }

  console.log("Cinema Seat Manager inicializado.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {};
