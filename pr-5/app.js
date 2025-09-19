'use strict';

const $ = (id) => document.getElementById(id);
const tempMap = { claro: 100, medio: 95, oscuro: 90 };

function getSelectedRoast() {
  const el = document.querySelector('input[name="tueste"]:checked');
  return el ? el.value : 'claro';
}

function validate(p, c, r) {
  const issues = [];
  if (!Number.isFinite(p) || p < 1) issues.push("• 'Cantidad de personas' debe ser al menos 1.");
  if (!Number.isFinite(c) || c < 60) issues.push("• 'Consumo por persona' debe ser ≥ 60 mL.");
  if (!Number.isFinite(r) || r < 0) issues.push("• '¿Cuántas personas repiten?' no puede ser negativa.");
  if (Number.isFinite(p) && Number.isFinite(r) && r > p) {
    issues.push(
      "• Por claridad, 'personas que repiten' no debería exceder la cantidad de personas (se asume una repetición por persona)."
    );
  }
  return issues;
}

function format(n, decimals = 1) {
  return Number.isFinite(n) ? n.toFixed(decimals) : '—';
}

function calcular() {
  const personas = parseFloat($("personas").value);
  const capacidad = parseFloat($("capacidad").value);
  const repiten = parseFloat($("repiten").value);
  const gxtbsp = parseFloat($("gxtbsp").value);
  const roast = getSelectedRoast();
  const temp = tempMap[roast];

  const issues = validate(personas, capacidad, repiten);
  const alert = $("alert");
  if (issues.length) {
    alert.style.display = '';
    alert.innerHTML = issues.join('<br>');
    $("salida").style.display = 'none';
    return;
  }

  alert.style.display = 'none';

  const servidas = personas + repiten;
  const aguaTotal = servidas * capacidad; // mL ≈ g
  const gramosCafe = aguaTotal / 16.0; // 1:16
  const cucharadas = gramosCafe / gxtbsp;

  $("salida").style.display = '';
  $("cucharadas").textContent = `${format(cucharadas, 1)} cucharadas`;
  $("gramos").textContent = `${format(gramosCafe, 0)} g`;
  $("agua").textContent = `${format(aguaTotal, 0)} mL`;
  $("temp").textContent = `${temp} °C`;
}

function limpiar() {
  $("personas").value = 4;
  $("capacidad").value = 200;
  $("repiten").value = 0;
  $("gxtbsp").value = 6;
  document.querySelector('input[name="tueste"][value="claro"]').checked = true;
  $("alert").style.display = 'none';
  $("salida").style.display = 'none';
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register('sw.js');
  } catch (error) {
    console.error('No se pudo registrar el service worker:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $("calc").addEventListener('click', calcular);
  $("reset").addEventListener('click', () => {
    limpiar();
  });
  limpiar();
  calcular();
  registerServiceWorker();
});
