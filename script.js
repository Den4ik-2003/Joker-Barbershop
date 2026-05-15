// ========================
// NAV SCROLL
// ========================
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
});
// ========================
// BURGER MENU
// ========================
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
function closeMenu() {
  mobileMenu.classList.remove("open");
}
// ========================
// REVEAL ON SCROLL
// ========================
const revealEls = document.querySelectorAll(".reveal, .reveal-right, .reveal-left");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      const delay = el.style.animationDelay || "0s";
      const ms = parseFloat(delay) * 1000;
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add("revealed"), ms);
      } else {
        el.classList.remove("revealed");
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));
// ========================
// CALENDAR
// ========================
const calContainer = document.getElementById("calendar");
const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
const DAYS_UA = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];
let calDate = new Date();
let selectedDate = null;
let selectedDateStr = null;

function renderCalendar() {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  let html = `
    <div class="cal-header">
      <button type="button" id="calPrev">‹</button>
      <span>${MONTHS_UA[month]} ${year}</span>
      <button type="button" id="calNext">›</button>
    </div>
    <div class="cal-grid">
  `;
  DAYS_UA.forEach((day) => {
    html += `<div class="cal-day-name">${day}</div>`;
  });
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

    // Build classes — selected takes visual priority over today
    let cls = "cal-day";
    if (isPast) cls += " past";
    // Add today class only when NOT selected (CSS handles styling)
    if (isToday) cls += " today";
    if (isSelected) cls += " selected";

    html += `<div class="${cls}" data-ts="${date.getTime()}">${d}</div>`;
  }
  html += `</div>`;
  calContainer.innerHTML = html;
}

renderCalendar();

calContainer.addEventListener("click", (e) => {
  const target = e.target;
  if (target.id === "calPrev") {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
    return;
  }
  if (target.id === "calNext") {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
    return;
  }
  if (
    target.classList.contains("cal-day") &&
    !target.classList.contains("empty") &&
    !target.classList.contains("past")
  ) {
    selectedDate = new Date(Number(target.dataset.ts));
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const y = selectedDate.getFullYear();
    selectedDateStr = `${d}.${m}.${y}`;
    renderCalendar();
    updateTimeSlots();
  }
});
// ========================
// TIME SLOTS
// ========================
let selectedTime = null;

function updateTimeSlots() {
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
  const isToday = selectedDateStr === todayStr;

  document.querySelectorAll(".time-slot").forEach((slot) => {
    const slotHour = parseInt(slot.textContent.trim().split(":")[0]);
    if (isToday && slotHour <= now.getHours()) {
      slot.classList.add("past");
      slot.classList.remove("active");
      if (selectedTime === slot.textContent.trim()) selectedTime = null;
    } else {
      slot.classList.remove("past");
    }
    slot.onclick = () => {
      if (slot.classList.contains("past")) return;
      selectedTime = slot.textContent.trim();
      document.querySelectorAll(".time-slot").forEach((s) => s.classList.remove("active"));
      slot.classList.add("active");
    };
  });
}

updateTimeSlots();
// ========================
// PHONE MASK
// ========================
const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("38")) val = val.slice(2);
    if (val.startsWith("0") === false && val.length > 0) val = "0" + val;
    val = val.slice(0, 10);
    let formatted = "+38 ";
    if (val.length > 0) formatted += "(" + val.slice(0, 3);
    if (val.length >= 3) formatted += ") " + val.slice(3, 6);
    if (val.length >= 6) formatted += "-" + val.slice(6, 8);
    if (val.length >= 8) formatted += "-" + val.slice(8, 10);
    e.target.value = formatted;
  });
}
// ========================
// HISTORY — localStorage helpers
// ========================
const HISTORY_KEY = "joker_bookings";

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBookingToHistory(booking) {
  const history = getHistory();
  history.unshift(booking); // newest first
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const history = getHistory();
  if (!history.length) {
    list.innerHTML = `
      <div class="history-empty">
        <span>💈</span>
        Записів поки немає.<br>Зробіть перший запис!
      </div>`;
    return;
  }
  list.innerHTML = history.map((b, i) => `
    <div class="history-item">
      <div class="history-item__date">Запис #${history.length - i} · ${b.createdAt}</div>
      <div class="history-item__row"><strong>Ім'я:</strong> ${b.name}</div>
      <div class="history-item__row"><strong>Телефон:</strong> ${b.phone}</div>
      <div class="history-item__row"><strong>Послуга:</strong> ${b.service}</div>
      <div class="history-item__row"><strong>Барбер:</strong> ${b.barber}</div>
      <div class="history-item__row"><strong>Дата:</strong> ${b.date} о ${b.time}</div>
    </div>
  `).join("");
}

function openHistoryModal() {
  renderHistory();
  document.getElementById("historyModal").classList.add("open");
}

function closeHistoryModal() {
  document.getElementById("historyModal").classList.remove("open");
}

// History button wiring (desktop + mobile)
document.getElementById("historyBtn").addEventListener("click", openHistoryModal);
const historyBtnMobile = document.getElementById("historyBtnMobile");
if (historyBtnMobile) {
  historyBtnMobile.addEventListener("click", () => {
    closeMenu();
    openHistoryModal();
  });
}
document.getElementById("historyModalClose").addEventListener("click", closeHistoryModal);
document.getElementById("historyModalCloseBtn").addEventListener("click", closeHistoryModal);

// Close history modal on backdrop click
document.getElementById("historyModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("historyModal")) closeHistoryModal();
});
// ========================
// BOOKING SUBMIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const bookBtn = document.getElementById("bookBtn");
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modalText");
  const modalBtn = document.getElementById("modalBtn");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const serviceSelect = document.querySelector(".service-select");
  const barberSelect = document.getElementById("barberSelect");
  const form = document.querySelector(".booking__form");
  const success = document.getElementById("bookSuccess");
  let isSending = false;

  function showModal(text) {
    modalText.textContent = text;
    modal.classList.add("open");
  }

  modalBtn.onclick = () => modal.classList.remove("open");

  async function sendBooking() {
    if (isSending) return;
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = serviceSelect.value;
    const barber = barberSelect.value;
    if (!name) return showModal("Введіть ім'я");
    if (!phone) return showModal("Введіть телефон");
    if (!service || service === "Виберіть послугу") return showModal("Оберіть послугу");
    if (!barber || barber === "Виберіть барбера") return showModal("Оберіть барбера");
    if (!selectedDateStr) return showModal("Оберіть дату");
    if (!selectedTime) return showModal("Оберіть час");

    isSending = true;

    const text = `💈 НОВИЙ ЗАПИС\nІм'я: ${name}\nТелефон: ${phone}\nПослуга: ${service}\nБарбер: ${barber}\nДата: ${selectedDateStr}\nЧас: ${selectedTime}`;

    const formData = new FormData();
    formData.append("chat_id", "2129690062");
    formData.append("text", text);

    try {
      const res = await fetch(
        "https://api.telegram.org/bot8665211387:AAGfiXBdXqJxPcw6K4OQzchoPGnA_r2raXI/sendMessage",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.ok) {
        // Save to history
        const now = new Date();
        saveBookingToHistory({
          name,
          phone,
          service,
          barber,
          date: selectedDateStr,
          time: selectedTime,
          createdAt: now.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
        });

        form.style.opacity = "0";
        setTimeout(() => {
          form.style.display = "none";
          success.style.display = "block";
          requestAnimationFrame(() => success.classList.add("show"));
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);
      } else {
        showModal("Помилка відправки");
      }
    } catch (e) {
      showModal("Помилка мережі");
    }

    isSending = false;
  }

  bookBtn.addEventListener("click", sendBooking);
});
// ========================
// FLIP MASTERS
// ========================
document.querySelectorAll(".master-card").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("flipped"));
});
document.querySelectorAll(".select-barber").forEach((btn) => {
  btn.addEventListener("click", (e) => e.stopPropagation());
});
document.querySelectorAll(".insta-link").forEach((link) => {
  link.addEventListener("click", (e) => e.stopPropagation());
});
// ========================
// NOW YEAR
// ========================
document.getElementById("year").textContent = new Date().getFullYear();
// ========================
// CHANGE BARBER
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const barberSelect = document.getElementById("barberSelect");
  const buttons = document.querySelectorAll(".select-barber");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const barberName = btn.dataset.barber;
      barberSelect.querySelectorAll("option").forEach((opt) => {
        opt.selected = opt.value === barberName;
      });
      barberSelect.dispatchEvent(new Event("change"));
      document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    });
  });
});