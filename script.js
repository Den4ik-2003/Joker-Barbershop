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
const revealEls = document.querySelectorAll(
  ".reveal, .reveal-right, .reveal-left",
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target;

      const delay = el.style.animationDelay || "0s";
      const ms = parseFloat(delay) * 1000;

      if (entry.isIntersecting) {
        setTimeout(() => {
          el.classList.add("revealed");
        }, ms);
      } else {
        el.classList.remove("revealed");
      }
    });
  },
  {
    threshold: 0.12,
  },
);
revealEls.forEach((el) => observer.observe(el));
// ========================
// CALENDAR
// ========================
const calContainer = document.getElementById("calendar");
const MONTHS_UA = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];
const DAYS_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
let calDate = new Date();
let selectedDate = null;
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
      <button id="calPrev">‹</button>
      <span>${MONTHS_UA[month]} ${year}</span>
      <button id="calNext">›</button>
    </div>
    <div class="cal-grid">
  `;
  DAYS_UA.forEach((d) => {
    html += `<div class="cal-day-name">${d}</div>`;
  });
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSelected =
      selectedDate && date.getTime() === selectedDate.getTime();
    let cls = "cal-day";
    if (isPast) cls += " past";
    if (isToday) cls += " today";
    if (isSelected) cls += " selected";
    html += `<div class="${cls}" data-ts="${date.getTime()}">${d}</div>`;
  }
  html += `</div>`;
  calContainer.innerHTML = html;
  document.getElementById("calPrev").addEventListener("click", () => {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", () => {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
  });
  calContainer
    .querySelectorAll(".cal-day:not(.empty):not(.past)")
    .forEach((el) => {
      el.addEventListener("click", () => {
        selectedDate = new Date(parseInt(el.dataset.ts));
        renderCalendar();
      });
    });
}
renderCalendar();
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
  let selectedDate = null;
  let selectedTime = null;
  let isSending = false;
  function showModal(text) {
    modalText.textContent = text;
    modal.classList.add("open");
  }
  modalBtn.onclick = () => {
    modal.classList.remove("open");
  };
  document.querySelectorAll(".cal-day").forEach((day) => {
    day.addEventListener("click", () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      selectedDate = `${day.textContent.padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
      document
        .querySelectorAll(".cal-day")
        .forEach((d) => d.classList.remove("selected"));
      day.classList.add("selected");
    });
  });
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      selectedTime = slot.textContent;
      document
        .querySelectorAll(".time-slot")
        .forEach((s) => s.classList.remove("active"));
      slot.classList.add("active");
    });
  });
  async function sendBooking() {
    if (isSending) return;
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = serviceSelect.value;
    const barber = barberSelect.value;
    if (!name) return showModal("Введіть ім'я");
    if (!phone) return showModal("Введіть телефон");
    if (!service || service === "Виберіть послугу")
      return showModal("Оберіть послугу");
    if (!barber || barber === "Виберіть барбера")
      return showModal("Оберіть барбера");
    if (!selectedDate) return showModal("Оберіть дату");
    if (!selectedTime) return showModal("Оберіть час");
    isSending = true;
    const text = `💈 НОВИЙ ЗАПИС
Ім'я: ${name}
Телефон: ${phone}
Послуга: ${service}
Барбер: ${barber}
Дата: ${selectedDate}
Час: ${selectedTime}`;
    const formData = new FormData();
    formData.append("chat_id", "2129690062");
    formData.append("text", text);
    try {
      const res = await fetch(
        "https://api.telegram.org/bot8665211387:AAGfiXBdXqJxPcw6K4OQzchoPGnA_r2raXI/sendMessage",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.ok) {
        form.style.display = "none";
        success.style.display = "block";
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
// CHANGE CLOCK
// ========================
document.querySelectorAll(".time-slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    selectedTime = slot.textContent;
    document
      .querySelectorAll(".time-slot")
      .forEach((s) => s.classList.remove("active"));
    slot.classList.add("active");
    document.querySelector(".time-grid").classList.add("has-selected");
  });
});
// ========================
// FLIP MASTERS
// ========================
document.querySelectorAll(".master-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });
});
document.querySelectorAll(".select-barber").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});
document.querySelectorAll(".insta-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.stopPropagation();
  });
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
      const options = barberSelect.querySelectorAll("option");
      options.forEach((opt) => {
        if (opt.value === barberName) {
          opt.selected = true;
        } else {
          opt.selected = false;
        }
      });
      barberSelect.dispatchEvent(new Event("change"));
      document.querySelector("#booking").scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
