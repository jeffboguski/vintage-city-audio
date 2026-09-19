/* ==========================================================================
   Vintage City Audio — shared site logic
   Plain vanilla JS, no build step. Reads gear from data/inventory.json.
   ========================================================================== */

// ---- config -----------------------------------------------------------
// Swap this for a real inbox when you set one up (e.g. hello@vintagecityaudio.com).
const CONTACT_EMAIL = "jeffboguski@gmail.com";

// ---- mobile nav toggle --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  // wire up any [data-contact-email] elements
  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    el.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Inquiry from Vintage City Audio"
    )}`;
  });
});

// ---- placeholder art (used until real photos are added) -----------------
const PLACEHOLDER_ICONS = {
  Amps: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="14" width="48" height="36" rx="2"/><circle cx="18" cy="32" r="7"/><circle cx="32" cy="32" r="7"/><circle cx="46" cy="32" r="7"/><line x1="8" y1="54" x2="56" y2="54"/></svg>`,
  Guitars: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="42" r="14"/><path d="M32 30 44 8"/><rect x="41" y="5" width="10" height="6" rx="1" transform="rotate(20 46 8)"/></svg>`,
  Effects: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="20" width="40" height="26" rx="3"/><circle cx="24" cy="33" r="5"/><circle cx="40" cy="33" r="5"/><rect x="26" y="10" width="12" height="8" rx="1"/></svg>`,
  Default: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="10" width="44" height="44" rx="3"/><path d="M10 40 24 26 34 36 44 22 54 34"/></svg>`,
};

function mediaMarkup(item) {
  if (item.images && item.images.length) {
    return `<img src="${item.images[0]}" alt="${escapeHtml(item.title)}">`;
  }
  const icon = PLACEHOLDER_ICONS[item.category] || PLACEHOLDER_ICONS.Default;
  return icon;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatPrice(item) {
  if (item.status === "Sold") return "Sold";
  if (typeof item.price !== "number") return "Make Offer";
  return `$${item.price.toLocaleString("en-US")}`;
}

// ---- data loading ---------------------------------------------------------
async function loadInventory() {
  const res = await fetch("data/inventory.json");
  if (!res.ok) throw new Error("Could not load inventory.json");
  return res.json();
}

// Path helper so item.html (in the site root) and any nested pages
// resolve data/ and assets/ the same way. Kept simple since this site
// has no subfolders of HTML pages today.
function dataPath(p) {
  return p;
}

// ---- inventory grid (inventory.html + featured strip on index.html) -----
function cardMarkup(item) {
  const statusClass = item.status === "Sold" ? "sold" : "";
  return `
    <a class="card" href="item.html?id=${encodeURIComponent(item.id)}">
      <div class="card-media">
        <span class="card-status ${statusClass}">${escapeHtml(item.status)}</span>
        ${mediaMarkup(item)}
      </div>
      <div class="card-body">
        <span class="card-cat">${escapeHtml(item.category)}${item.year ? " · " + item.year : ""}</span>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-sub">${escapeHtml(item.summary || "")}</p>
        <div class="card-foot">
          <span class="price">${formatPrice(item)}</span>
          <span class="card-arrow">View Details &rarr;</span>
        </div>
      </div>
    </a>`;
}

function renderGrid(container, items) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No gear in this category right now — check back soon.</div>`;
    return;
  }
  container.innerHTML = items.map(cardMarkup).join("");
}

async function initInventoryPage() {
  const grid = document.getElementById("invGrid");
  if (!grid) return;
  const filterWrap = document.getElementById("invFilters");

  let items = [];
  try {
    items = await loadInventory();
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Couldn't load the inventory data. If you're viewing this from a local file, run a local server (see README) — browsers block fetch() over file://.</div>`;
    return;
  }

  const categories = ["All", ...new Set(items.map((i) => i.category))];
  if (filterWrap) {
    filterWrap.innerHTML = categories
      .map(
        (c, idx) =>
          `<button class="filter-btn${idx === 0 ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
      )
      .join("");

    filterWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterWrap.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      const filtered = cat === "All" ? items : items.filter((i) => i.category === cat);
      renderGrid(grid, filtered);
    });
  }

  renderGrid(grid, items);
}

async function initFeaturedStrip() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  try {
    const items = await loadInventory();
    renderGrid(grid, items.slice(0, 3));
  } catch (e) {
    grid.innerHTML = "";
  }
}

// ---- item detail page -----------------------------------------------------
async function initItemPage() {
  const root = document.getElementById("itemRoot");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  let items = [];
  try {
    items = await loadInventory();
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Couldn't load the inventory data. If you're viewing this from a local file, run a local server (see README).</div>`;
    return;
  }

  const item = items.find((i) => i.id === id);
  if (!item) {
    root.innerHTML = `<div class="empty-state">Couldn't find that item. <a href="inventory.html">Back to inventory &rarr;</a></div>`;
    return;
  }

  document.title = `${item.title} · Vintage City Audio`;

  const specsRows = Object.entries(item.specs || {})
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  const demoMarkup = item.soundDemo
    ? `<audio controls src="${item.soundDemo}"></audio>`
    : `<p>No sound demo uploaded yet for this piece — ask and we'll get you a clip.</p>`;

  const listingMarkup = item.externalListing
    ? `<a class="btn btn-outline-dark" href="${item.externalListing.url}" target="_blank" rel="noopener">View on ${escapeHtml(item.externalListing.platform)} &rarr;</a>`
    : "";

  root.innerHTML = `
    <div class="breadcrumb"><a href="inventory.html">Inventory</a> / ${escapeHtml(item.category)} / ${escapeHtml(item.title)}</div>
    <div class="item-hero">
      <div class="item-media">${mediaMarkup(item)}</div>
      <div class="item-info">
        <span class="eyebrow">${escapeHtml(item.category)}${item.year ? " · " + item.year : ""}</span>
        <h1>${escapeHtml(item.title)}</h1>
        <div class="item-price">${formatPrice(item)}</div>
        <div class="item-meta">
          <span class="tag">Condition: ${escapeHtml(item.condition || "—")}</span>
          <span class="tag">Status: ${escapeHtml(item.status)}</span>
          ${item.location ? `<span class="tag">${escapeHtml(item.location)}</span>` : ""}
        </div>
        <div class="item-actions">
          <a class="btn btn-primary" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Interested in: " + item.title)}">Message About This Piece</a>
          ${listingMarkup}
        </div>
      </div>
    </div>

    <section class="tight">
      <div class="section-head"><span class="eyebrow">The Details</span><h2>Description</h2></div>
      <p class="item-body">${escapeHtml(item.description || "")}</p>
    </section>

    ${
      specsRows
        ? `<section class="tight section-alt">
             <div class="section-head"><span class="eyebrow">Specs</span><h2>Stats &amp; Specifications</h2></div>
             <table class="specs-table">${specsRows}</table>
           </section>`
        : ""
    }

    <section class="tight">
      <div class="section-head"><span class="eyebrow">Listen</span><h2>Sound Demo</h2></div>
      <div class="demo-box">${demoMarkup}</div>
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  initInventoryPage();
  initFeaturedStrip();
  initItemPage();
});
