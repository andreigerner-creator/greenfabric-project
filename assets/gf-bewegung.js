// Greenfabric: Bewegung fuer die gf-Sektionen (Aussehen und Bausteine: gf-signatur.css).
// Uebertragen von der Dr.-Sleep-Seite (seite.js): Einblenden (gestaffelt), Parallax, Hero (Bild
// mit halber Geschwindigkeit, Inhalt blendet aus), Linien, die sich beim Scrollen zeichnen,
// hochzaehlende Zahlen. Im Theme-Editor meldet sich jede neu geladene Sektion wieder an.
// Ohne JavaScript bleibt alles sichtbar, "Bewegung reduzieren" schaltet Bewegung ab.
(function () {
  'use strict';
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var handy = window.matchMedia('(max-width: 639px)');
  var imEditor = !!(window.Shopify && window.Shopify.designMode);
  if (imEditor) document.documentElement.classList.add('gf-editor');

  // Einblenden beim Hereinscrollen. Was gemeinsam hereinkommt, erscheint nacheinander
  // (--staffel, 90 ms je Stufe), ausser es bringt seinen eigenen Versatz (--verzoegerung) mit.
  // Hohe Elemente (laenger als der Bildschirm) erreichen 12 % nie: dafuer zaehlt die Hoehe.
  var einblendBeobachter = null;
  if ('IntersectionObserver' in window && !ruhig) {
    einblendBeobachter = new IntersectionObserver(function (eintraege) {
      var vh = window.innerHeight;
      var neu = eintraege.filter(function (e) {
        return e.isIntersecting && (e.intersectionRatio >= 0.12 || e.intersectionRect.height >= vh * 0.25);
      });
      neu.sort(function (a, b) {
        return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left);
      });
      var stufe = 0;
      neu.forEach(function (e) {
        var el = e.target;
        if ((el.getAttribute('style') || '').indexOf('--verzoegerung') < 0) {
          if (stufe) el.style.setProperty('--staffel', Math.min(stufe, 6) * 90 + 'ms');
          stufe++;
        }
        el.classList.add('ist-sichtbar');
        einblendBeobachter.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: [0, 0.03, 0.06, 0.09, 0.12] });
  }

  // Hochzaehlende Zahlen (die fertige Zahl steht im HTML), mit Tausendertrennung der Seitensprache
  var format = function (n) {
    try { return new Intl.NumberFormat(document.documentElement.lang || 'bg').format(n); } catch (e) { return String(n); }
  };
  var zaehlen = function (el) {
    var ziel = parseFloat(el.getAttribute('data-zaehlen')) || 0;
    if (ruhig) { el.textContent = format(ziel); return; }
    var start = null, dauer = 1400;
    var schritt = function (zeit) {
      if (start === null) start = zeit;
      var p = Math.min(1, (zeit - start) / dauer);
      el.textContent = format(Math.round(ziel * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  };
  var zaehlBeobachter = 'IntersectionObserver' in window ? new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (e.isIntersecting) { zaehlen(e.target); zaehlBeobachter.unobserve(e.target); }
    });
  }, { threshold: 0.6 }) : null;

  // Bewegung beim Scrollen, ein rAF je Scroll-Ereignis, erst alles messen, dann schreiben:
  //   data-parallax="0.5"   halbe Scrollgeschwindigkeit (Bezug: Elternelement)
  //   data-hero             Hero-Bild [data-hero-bild] mit halber Geschwindigkeit, --hero-p
  //   data-zeichnen         Linie mit Punkten (direkte Kinder): --fortschritt, .ist-erreicht
  var parallax = [], heros = [], linien = [];
  var geplant = false;

  var bewegen = function () {
    geplant = false;
    var vh = window.innerHeight;
    var p = parallax.map(function (el) {
      if (!el.isConnected) return null;
      var faktor = parseFloat(el.getAttribute('data-parallax')) || 0.5;
      var bezug = el.parentElement.getBoundingClientRect();
      if (bezug.bottom < -200 || bezug.top > vh + 200) return null;
      return (bezug.top + bezug.height / 2 - vh / 2) * (faktor - 1);
    });
    var h = heros.map(function (hero) {
      if (!hero.el.isConnected) return null;
      var r = hero.el.getBoundingClientRect();
      if (r.bottom <= -50) return null;
      var s = Math.max(0, -r.top);
      // Handy: das Hero-Bild laeuft mit der Seite, kein Parallax
      return { y: handy.matches ? 0 : s * 0.5, p: Math.min(1, s / (vh * 0.75)) };
    });
    var l = linien.map(function (linie) {
      if (!linie.el.isConnected) return null;
      var r = linie.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return null;
      var erster = linie.punkte[0], zweiter = linie.punkte[1];
      var waagerecht = erster && zweiter && Math.abs(erster.offsetTop - zweiter.offsetTop) < 4;
      return {
        p: Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35))),
        lagen: linie.punkte.map(function (pkt) {
          return waagerecht ? pkt.offsetLeft / (linie.el.clientWidth || 1) : pkt.offsetTop / (linie.el.clientHeight || 1);
        })
      };
    });

    parallax.forEach(function (el, i) {
      if (p[i] !== null) el.style.transform = 'translate3d(0,' + p[i].toFixed(1) + 'px,0)';
    });
    heros.forEach(function (hero, i) {
      if (!h[i]) return;
      hero.bilder.forEach(function (bild) { bild.style.transform = 'translate3d(0,' + h[i].y.toFixed(1) + 'px,0)'; });
      hero.el.style.setProperty('--hero-p', h[i].p.toFixed(3));
    });
    linien.forEach(function (linie, i) {
      var m = l[i];
      if (!m) return;
      linie.el.style.setProperty('--fortschritt', m.p.toFixed(3));
      linie.punkte.forEach(function (pkt, j) {
        pkt.classList.toggle('ist-erreicht', m.p > 0.001 && m.p + 0.01 >= m.lagen[j]);
      });
    });
  };
  var anstossen = function () { if (!geplant) { geplant = true; requestAnimationFrame(bewegen); } };

  // Alles unterhalb von wurzel anmelden (beim Laden die ganze Seite, im Editor eine Sektion)
  var anmelden = function (wurzel) {
    var alle = function (sel) {
      var liste = [].slice.call(wurzel.querySelectorAll(sel));
      if (wurzel.matches && wurzel.matches(sel)) liste.unshift(wurzel);
      return liste;
    };
    alle('[data-einblenden]').forEach(function (el) {
      if (einblendBeobachter && !imEditor) einblendBeobachter.observe(el);
      else el.classList.add('ist-sichtbar');
    });
    alle('[data-zaehlen]').forEach(function (el) {
      el.textContent = format(parseFloat(el.getAttribute('data-zaehlen')) || 0);
      if (zaehlBeobachter && !imEditor && !ruhig) zaehlBeobachter.observe(el);
    });
    if (ruhig) return;
    parallax = parallax.filter(function (el) { return el.isConnected; }).concat(alle('[data-parallax]'));
    heros = heros.filter(function (x) { return x.el.isConnected; }).concat(alle('[data-hero]').map(function (el) {
      return { el: el, bilder: [].slice.call(el.querySelectorAll('[data-hero-bild]')) };
    }));
    linien = linien.filter(function (x) { return x.el.isConnected; }).concat(alle('[data-zeichnen]').map(function (el) {
      el.classList.add('zeichnen-an');
      return { el: el, punkte: [].slice.call(el.children) };
    }));
    anstossen();
  };

  if (!ruhig) {
    window.addEventListener('scroll', anstossen, { passive: true });
    window.addEventListener('resize', anstossen);
  }
  anmelden(document);

  // Theme-Editor: neu geladene oder ausgewaehlte Sektionen wieder anmelden
  document.addEventListener('shopify:section:load', function (e) { anmelden(e.target); });
  document.addEventListener('shopify:section:select', anstossen);
})();
