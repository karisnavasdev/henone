/* Hen One ($HEN) — gate, sparks, CA copy, conditional Dex, Lenis */
(() => {
  const cfg = window.HEN || {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ----- GATE ----- */
  const gate = $("#gate");
  const enterBtn = $("#gate-enter");
  document.body.classList.add("is-gated");

  function enterSite() {
    gate?.classList.add("is-out");
    document.body.classList.remove("is-gated");
    setTimeout(() => gate?.setAttribute("hidden", ""), 600);
    initLenis();
  }
  enterBtn?.addEventListener("click", enterSite);
  gate?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      enterSite();
    }
  });

  /* ----- NAV MOBILE ----- */
  const burger = $("#burger");
  const mobile = $("#nav-mobile");
  burger?.addEventListener("click", () => {
    const open = !mobile.hasAttribute("hidden");
    if (open) mobile.setAttribute("hidden", "");
    else mobile.removeAttribute("hidden");
  });
  $$("#nav-mobile a").forEach((a) =>
    a.addEventListener("click", () => mobile.setAttribute("hidden", ""))
  );

  /* ----- CONFIG WIRING ----- */
  const ca = (cfg.ca || "COMING_SOON").trim();
  const caAddr = $("#ca-addr");
  const caPill = $("#ca-pill");
  if (caAddr) caAddr.textContent = ca;
  if (ca === "COMING_SOON") caPill?.classList.add("is-soon");

  const buyHref = cfg.buyUrl && cfg.buyUrl !== "#" ? cfg.buyUrl : "#buy";
  let chartHref = "#chart";
  if (cfg.chartUrl && cfg.chartUrl !== "#" && cfg.chartUrl !== "#chart") {
    chartHref = cfg.chartUrl;
  } else if (cfg.dexscreenerPair) {
    const pair = String(cfg.dexscreenerPair).replace(/^\/+/, "");
    chartHref = pair.includes("/")
      ? `https://dexscreener.com/${pair}`
      : `https://dexscreener.com/${pair}`;
  }

  ["#btn-buy", "#nav-buy", "#nav-buy-m"].forEach((sel) => {
    const el = $(sel);
    if (el) el.setAttribute("href", buyHref);
  });
  const btnChart = $("#btn-chart");
  if (btnChart) btnChart.setAttribute("href", chartHref);
  if (cfg.twitter) {
    const bx = $("#btn-x");
    if (bx) bx.setAttribute("href", cfg.twitter);
  }

  /* ----- COPY CA ----- */
  const toast = $("#toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-on"));
    setTimeout(() => {
      toast.classList.remove("is-on");
      setTimeout(() => (toast.hidden = true), 220);
    }, 1600);
  }

  $("#ca-copy")?.addEventListener("click", async () => {
    const text = caAddr?.textContent?.trim() || ca;
    try {
      await navigator.clipboard.writeText(text);
      showToast(text === "COMING_SOON" ? "Copied COMING_SOON" : "CA copied");
    } catch {
      showToast("Copy failed");
    }
  });

  /* ----- DEX / CHART ----- */
  const pairRaw = (cfg.dexscreenerPair || "").trim();
  const pairNote = $("#pair-note");
  const chartEmpty = $("#chart-empty");
  const chartLive = $("#chart-live");

  if (pairRaw) {
    pairNote?.setAttribute("hidden", "");
    chartEmpty?.setAttribute("hidden", "");
    chartLive?.removeAttribute("hidden");
    const path = pairRaw.replace(/^\/+/, "");
    const iframe = $("#dex-iframe");
    if (iframe) {
      iframe.src = `https://dexscreener.com/${encodeURI(path)}?embed=1&theme=dark&trades=0&info=0`;
    }
    const apiPath = path.includes("/") ? path : path;
    fetch(`https://api.dexscreener.com/latest/dex/pairs/${apiPath}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data?.pair || data?.pairs?.[0];
        if (!p) return;
        const fmt = (n) => {
          if (n == null) return "—";
          const x = Number(n);
          if (x >= 1e6) return "$" + (x / 1e6).toFixed(2) + "M";
          if (x >= 1e3) return "$" + (x / 1e3).toFixed(1) + "K";
          return "$" + x.toFixed(2);
        };
        const set = (id, v) => {
          const el = $(id);
          if (el) el.textContent = v;
        };
        set("#stat-price", p.priceUsd ? "$" + Number(p.priceUsd).toPrecision(4) : "—");
        set("#stat-liq", fmt(p.liquidity?.usd));
        set("#stat-vol", fmt(p.volume?.h24));
        set("#stat-fdv", fmt(p.fdv));
      })
      .catch(() => {});
  } else {
    chartLive?.setAttribute("hidden", "");
    chartEmpty?.removeAttribute("hidden");
  }

  /* ----- LENIS ----- */
  let lenis;
  function initLenis() {
    if (reduced || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70 });
      });
    });
  }

  /* ----- CIRCUIT SPARKS ----- */
  const canvas = $("#spark-canvas");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let w, h, sparks, rafId;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function spawn(n) {
      sparks = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.8,
        vy: -0.15 - Math.random() * 0.45,
        vx: -0.2 + Math.random() * 0.4,
        a: 0.12 + Math.random() * 0.4,
        orange: Math.random() > 0.62,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const s of sparks) {
        s.y += s.vy;
        s.x += s.vx + Math.sin(s.y * 0.012) * 0.2;
        if (s.y < -4) {
          s.y = h + 4;
          s.x = Math.random() * w;
        }
        if (s.x < -4) s.x = w + 4;
        if (s.x > w + 4) s.x = -4;
        ctx.beginPath();
        ctx.fillStyle = s.orange
          ? `rgba(255,138,61,${s.a})`
          : `rgba(77,232,255,${s.a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    }
    resize();
    spawn(Math.min(80, Math.floor((w * h) / 20000)));
    tick();
    window.addEventListener("resize", () => {
      resize();
      spawn(Math.min(80, Math.floor((w * h) / 20000)));
    });
  }
})();
