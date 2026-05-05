// ========================
// NAV SCROLL
// ========================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ========================
// BURGER MENU
// ========================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMenu() {
  mobileMenu.classList.remove('open');
}

// ========================
// REVEAL ON SCROLL
// ========================
const revealEls = document.querySelectorAll('.reveal, .reveal-right, .reveal-left');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // respect animation-delay via style attribute
      const delay = entry.target.style.animationDelay || '0s';
      const ms = parseFloat(delay) * 1000;
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, ms);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// ========================
// CALENDAR
// ========================
const calContainer = document.getElementById('calendar');
const MONTHS_UA = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const DAYS_UA = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

let calDate = new Date();
let selectedDate = null;

function renderCalendar() {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const today = new Date();
  today.setHours(0,0,0,0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-first: 0=Mon,...,6=Sun
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

  DAYS_UA.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });

  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    date.setHours(0,0,0,0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
    let cls = 'cal-day';
    if (isPast) cls += ' past';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';
    html += `<div class="${cls}" data-ts="${date.getTime()}">${d}</div>`;
  }

  html += `</div>`;
  calContainer.innerHTML = html;

  document.getElementById('calPrev').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
  });

  calContainer.querySelectorAll('.cal-day:not(.empty):not(.past)').forEach(el => {
    el.addEventListener('click', () => {
      selectedDate = new Date(parseInt(el.dataset.ts));
      renderCalendar();
    });
  });
}

renderCalendar();

// ========================
// PHONE MASK
// ========================
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('38')) val = val.slice(2);
    if (val.startsWith('0') === false && val.length > 0) val = '0' + val;
    val = val.slice(0, 10);
    let formatted = '+38 ';
    if (val.length > 0) formatted += '(' + val.slice(0,3);
    if (val.length >= 3) formatted += ') ' + val.slice(3,6);
    if (val.length >= 6) formatted += '-' + val.slice(6,8);
    if (val.length >= 8) formatted += '-' + val.slice(8,10);
    e.target.value = formatted;
  });
}

// ========================
// BOOKING SUBMIT
// ========================
const bookBtn = document.getElementById('bookBtn');
const bookingForm = document.querySelector('.booking__form');
const bookSuccess = document.getElementById('bookSuccess');

if (bookBtn) {
  bookBtn.addEventListener('click', () => {
    const name = bookingForm.querySelector('input[type="text"]').value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name) {
      shakeField(bookingForm.querySelector('input[type="text"]'));
      return;
    }
    if (!selectedDate) {
      calContainer.style.borderColor = 'var(--gold)';
      setTimeout(() => { calContainer.style.borderColor = ''; }, 1500);
      return;
    }

    bookingForm.style.opacity = '0';
    bookingForm.style.transform = 'scale(0.97)';
    bookingForm.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => {
      bookingForm.style.display = 'none';
      bookSuccess.style.display = 'block';
    }, 300);
  });
}

function shakeField(el) {
  el.style.borderColor = '#e54';
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(0)' }
  ], { duration: 360, easing: 'ease' });
  setTimeout(() => { el.style.borderColor = ''; }, 1000);
}

// ========================
// SMOOTH HERO ENTRANCE
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Trigger hero elements immediately (they start hidden via .reveal)
  const heroEls = document.querySelectorAll('.hero .reveal, .hero .reveal-right');
  heroEls.forEach((el, i) => {
    const existing = parseFloat(el.style.animationDelay || '0');
    const baseDelay = 0.1 + i * 0.12;
    setTimeout(() => {
      el.classList.add('revealed');
    }, (existing + baseDelay) * 1000);
  });
});

// ========================
// FLIP MASTERS
// ========================
document.querySelectorAll('.master-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});
