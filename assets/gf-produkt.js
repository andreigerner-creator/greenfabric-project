// Greenfabric: Produktseite (Aussehen in gf-produkt.css).
// Schichten (sections/gf-schichten.liquid): beim Scrollen heben sich die Schichten voneinander ab
// (--auf), die Maus neigt den Stapel leicht, Liste und Stapel heben dieselbe Schicht hervor,
// der Knopf wendet zweiseitige Matratzen. Merkmalstabelle: "да" und "не" werden zu Zeichen.
// Ohne JavaScript steht der Stapel auseinandergezogen da, "Bewegung reduzieren" laesst ihn so.
(function () {
  'use strict';
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var feinZeiger = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var stapel = [];
  var geplant = false;

  var weich = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  // Fortschritt: zusammen, solange die Buehne unten hereinkommt, ganz offen ab der Bildschirmmitte
  var bewegen = function () {
    geplant = false;
    var vh = window.innerHeight;
    var werte = stapel.map(function (s) {
      if (!s.el.isConnected) return null;
      var r = s.raum.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return null;
      var p = (vh * 0.92 - r.top) / (vh * 0.55);
      return weich(Math.max(0, Math.min(1, p)));
    });
    stapel.forEach(function (s, i) {
      if (werte[i] !== null) s.el.style.setProperty('--auf', werte[i].toFixed(3));
    });
  };
  var anstossen = function () { if (!geplant) { geplant = true; requestAnimationFrame(bewegen); } };

  var aufbauen = function (el) {
    if (el.gfBereit) return;
    el.gfBereit = true;
    var raum = el.querySelector('.gf-schichten-raum');
    var punkte = [].slice.call(el.querySelectorAll('.gf-schichten-punkt'));
    var lagen = [].slice.call(el.querySelectorAll('.gf-lage'));

    // Hervorheben: Liste und Stapel zeigen dieselbe Schicht
    var aktiv = function (nr) {
      el.classList.toggle('hat-aktiv', nr !== null);
      punkte.concat(lagen).forEach(function (x) {
        x.classList.toggle('ist-aktiv', nr !== null && x.getAttribute('data-lage') === nr);
      });
    };
    punkte.forEach(function (p) {
      var nr = p.getAttribute('data-lage');
      p.addEventListener('mouseenter', function () { aktiv(nr); });
      p.addEventListener('mouseleave', function () { aktiv(null); });
      p.addEventListener('focus', function () { aktiv(nr); });
      p.addEventListener('blur', function () { aktiv(null); });
      p.addEventListener('click', function () { aktiv(nr); });
    });
    lagen.forEach(function (l) {
      var nr = l.getAttribute('data-lage');
      l.addEventListener('mouseenter', function () { aktiv(nr); });
      l.addEventListener('mouseleave', function () { aktiv(null); });
      l.addEventListener('click', function () {
        aktiv(nr);
        var p = el.querySelector('.gf-schichten-punkt[data-lage="' + nr + '"]');
        if (p && !feinZeiger) p.scrollIntoView({ block: 'nearest', behavior: ruhig ? 'auto' : 'smooth' });
      });
    });

    // Wenden (nur bei zwei verschiedenen Liegeseiten vorhanden)
    var wenden = el.querySelector('[data-gf-wenden]');
    if (wenden) {
      wenden.hidden = false;
      wenden.addEventListener('click', function () {
        var an = !el.classList.contains('ist-gewendet');
        el.classList.toggle('ist-gewendet', an);
        wenden.setAttribute('aria-pressed', an ? 'true' : 'false');
      });
    }

    if (ruhig || !raum) return;

    // Maus neigt den Stapel leicht (nur mit Maus, auf dem Handy bleibt Scrollen frei)
    if (feinZeiger) {
      raum.addEventListener('pointermove', function (e) {
        var r = raum.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('ist-zeiger');
        el.style.setProperty('--zeiger-x', (x * 24).toFixed(2) + 'deg');
        el.style.setProperty('--zeiger-y', (y * -10).toFixed(2) + 'deg');
      });
      raum.addEventListener('pointerleave', function () {
        el.classList.remove('ist-zeiger');
        el.style.setProperty('--zeiger-x', '0deg');
        el.style.setProperty('--zeiger-y', '0deg');
      });
    }

    stapel.push({ el: el, raum: raum });
    el.style.setProperty('--auf', '0');
    el.classList.add('ist-bereit');
    anstossen();
  };

  // Merkmalstabelle der alten Seite: Ja und Nein als Zeichen, Text bleibt fuer Screenreader
  var tabelle = function (wurzel) {
    [].slice.call(wurzel.querySelectorAll('.product__description td')).forEach(function (td) {
      var t = td.textContent.trim().toLowerCase();
      if (t === 'да') td.classList.add('gf-ja');
      else if (t === 'не') td.classList.add('gf-nein');
    });
  };

  var anmelden = function (wurzel) {
    [].slice.call(wurzel.querySelectorAll('[data-gf-schichten]')).forEach(aufbauen);
    tabelle(wurzel);
  };

  if (!ruhig) {
    window.addEventListener('scroll', anstossen, { passive: true });
    window.addEventListener('resize', anstossen);
  }
  anmelden(document);
  document.addEventListener('shopify:section:load', function (e) {
    stapel = stapel.filter(function (s) { return s.el.isConnected; });
    anmelden(e.target);
  });
})();
