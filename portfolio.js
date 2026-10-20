/* Paisa Ledger — Portfolio module. Keeps portfolios in localStorage key "pl_port". */
(function () {
  "use strict";
  var KEY = "pl_port";
  var root = document.getElementById("portRoot");
  if (!root) return;

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[,₹\s]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function inr(v) {
    v = Number(v) || 0;
    return (v < 0 ? "−" : "") + "₹" + Math.abs(Math.round(v)).toLocaleString("en-IN");
  }
  function inr2(v) {
    v = Number(v) || 0;
    return (v < 0 ? "−" : "") + "₹" + Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  function qtyf(v) {
    return (Number(v) || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 });
  }
  function pct(v) {
    return (v >= 0 ? "+" : "−") + Math.abs(v * 100).toFixed(1) + "%";
  }
  function uid() {
    return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fdate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? +m[3] + " " + MON[+m[2] - 1] + " " + m[1] : iso || "";
  }
  function col(v) {
    return v >= 0 ? "var(--inc)" : "var(--exp)";
  }
  function toISO(v) {
    if (v == null || v === "") return "";
    if (typeof v === "number" && v > 20000) {
      var d = new Date(Math.round((v - 25569) * 864e5));
      return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    }
    var s = String(v).trim(), m;
    if ((m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/.exec(s))) return m[3] + "-" + pad(m[2]) + "-" + pad(m[1]);
    if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return m[1] + "-" + m[2] + "-" + m[3];
    return "";
  }
  function same(a, b) {
    return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  }

  /* ---------- storage ---------- */
  var db = load();
  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!d || !Array.isArray(d.list) || !d.list.length) {
      d = { v: 1, active: "", list: [] };
      var a = blank("My portfolio");
      d.list.push(a);
      d.active = a.id;
    }
    if (!d.list.some(function (p) { return p.id === d.active; })) d.active = d.list[0].id;
    return d;
  }
  function blank(name) {
    return { id: uid(), name: name, cash0: 0, holdings: [], trades: [], targets: {} };
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      flash("Couldn't save. Storage may be full or blocked.", true);
      return false;
    }
  }
  function cur() {
    return db.list.find(function (p) { return p.id === db.active; }) || db.list[0];
  }

  /* ---------- calculations ---------- */
  function calc(p) {
    var held = p.holdings.filter(function (h) { return h.status !== "SOLD"; });
    var r = { held: held, value: 0, invested: 0, booked: 0, earlier: 0, cash: Number(p.cash0) || 0, sectors: {} };
    held.forEach(function (h) {
      var px = h.price > 0 ? h.price : h.avg;
      h._val = h.qty * px;
      h._inv = h.qty * h.avg;
      h._pl = h._val - h._inv;
      h._plp = h._inv ? h._pl / h._inv : 0;
      r.value += h._val;
      r.invested += h._inv;
      var s = h.sector || "Others";
      r.sectors[s] = (r.sectors[s] || 0) + h._val;
    });
    p.holdings.forEach(function (h) { r.earlier += Number(h.realEarlier) || 0; });
    p.trades.forEach(function (t) {
      var amt = t.amount != null ? t.amount : t.qty * t.price;
      r.cash += t.action === "SELL" ? amt : -amt;
      if (t.action === "SELL") r.booked += Number(t.pl) || 0;
    });
    var need = 0;
    Object.keys(p.targets || {}).forEach(function (s) {
      var want = (p.targets[s] / 100) * r.value, have = r.sectors[s] || 0;
      if (want > have) need += want - have;
    });
    r.need = need;
    return r;
  }

  /* ---------- UI state ---------- */
  var ui = { q: "", sort: "value", sold: false, trades: false };
  var msgText = "", msgErr = false, msgTimer = null;
  function flash(t, err) {
    msgText = t; msgErr = !!err;
    var m = document.getElementById("pfMsg");
    if (m) { m.textContent = t; m.className = "msg" + (err ? " err" : ""); }
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      var m2 = document.getElementById("pfMsg");
      if (m2) m2.textContent = "";
      msgText = "";
    }, 6000);
  }

  /* ---------- render ---------- */
  function render() {
    var p = cur(), r = calc(p), pl = r.value - r.invested, plp = r.invested ? pl / r.invested : 0;
    var h = "";
    h += '<section class="card ph-head"><div class="row2"><div class="field"><label class="flabel" for="pfSel">Portfolio</label><select id="pfSel">' +
      db.list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === p.id ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("") +
      '</select></div><div class="ph-mini"><button class="ghost" data-act="pnew" type="button">+ New</button><button class="ghost" data-act="pren" type="button">Rename</button><button class="ghost" data-act="pdel" type="button">Delete</button></div></div></section>';

    h += '<div class="hero"><div class="hlabel">Current value · ' + esc(p.name) + '</div><div class="big num">' + inr(r.value) + '</div>' +
      '<div class="hsub">' + r.held.length + " holding" + (r.held.length === 1 ? "" : "s") + " · unrealised " + (r.invested ? pct(plp) : "—") + "</div>" +
      '<div class="tiles"><div class="tile"><span class="tl">Invested</span><span class="num">' + inr(r.invested) + '</span></div>' +
      '<div class="tile"><span class="tl">Unrealised P/L</span><span class="num">' + inr(pl) + '</span></div>' +
      '<div class="tile"><span class="tl">Cash left</span><span class="num">' + inr(r.cash) + "</span></div></div>" +
      '<div class="hsub">Booked on recorded sales ' + inr(r.booked) + (r.earlier ? " · earlier realised (statement) " + inr(r.earlier) : "") + "</div></div>";

    h += '<section class="card"><div class="btns">' +
      '<button class="ghost" data-act="add" type="button">+ Add holding</button>' +
      '<button class="ghost" data-act="buy" type="button">Record buy</button>' +
      '<button class="ghost" data-act="sell" type="button">Record sale</button>' +
      '<button class="ghost" data-act="prices" type="button">Update prices</button></div>' +
      '<div class="btns" style="margin-top:8px">' +
      '<button class="ghost" data-act="import" type="button">Import Excel</button>' +
      '<button class="ghost" data-act="export" type="button">Download Excel</button>' +
      '<button class="ghost" data-act="ledger" type="button">Pull from ledger</button></div>' +
      '<input type="file" id="pfFile" accept=".xlsx,.xls,.csv" hidden><div class="msg" id="pfMsg" role="status">' + esc(msgText) + "</div></section>";

    /* holdings */
    var list = r.held.filter(function (x) {
      return !ui.q || (x.name + " " + (x.sector || "")).toLowerCase().indexOf(ui.q.toLowerCase()) >= 0;
    });
    var by = {
      value: function (a, b) { return b._val - a._val; },
      plp: function (a, b) { return b._plp - a._plp; },
      plpa: function (a, b) { return a._plp - b._plp; },
      pl: function (a, b) { return b._pl - a._pl; },
      name: function (a, b) { return a.name.localeCompare(b.name); },
      sector: function (a, b) { return (a.sector || "").localeCompare(b.sector || "") || b._val - a._val; }
    };
    list.sort(by[ui.sort] || by.value);
    h += '<section class="card"><h2>Holdings</h2><div class="row2" style="margin:10px 0 4px"><input id="pfQ" type="search" placeholder="Search name or sector" value="' + esc(ui.q) + '" aria-label="Search holdings">' +
      '<select id="pfSort" aria-label="Sort holdings">' +
      [["value", "Biggest value"], ["plp", "Best return %"], ["plpa", "Worst return %"], ["pl", "Biggest gain ₹"], ["name", "Name A–Z"], ["sector", "Sector"]]
        .map(function (o) { return '<option value="' + o[0] + '"' + (ui.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
      "</select></div>";
    if (!r.held.length) h += '<p class="empty" style="margin:8px 0 0">No holdings yet. Add one, import your Excel file, or pull stocks and funds from your ledger.</p>';
    else if (!list.length) h += '<p class="empty" style="margin:8px 0 0">Nothing matches your search.</p>';
    list.forEach(function (x) {
      h += '<div class="hold ph-row" role="button" tabindex="0" data-act="edit" data-id="' + esc(x.id) + '"><div style="min-width:0"><div class="t">' + esc(x.name) +
        '</div><div class="s">' + esc(x.sector || "Others") + " · " + qtyf(x.qty) + " × " + inr2(x.avg) + '</div></div><div class="r">' + inr(x._val) +
        '<small style="color:' + col(x._pl) + '">' + (x.price > 0 ? inr(x._pl) + " (" + pct(x._plp) + ")" : "set price") + "</small></div></div>";
    });
    var sold = p.holdings.filter(function (x) { return x.status === "SOLD"; });
    if (sold.length) {
      h += '<div class="chips" style="margin-top:12px"><button type="button" data-act="togsold" aria-pressed="' + ui.sold + '">' + (ui.sold ? "Hide" : "Show") + " sold (" + sold.length + ")</button></div>";
      if (ui.sold) sold.sort(function (a, b) { return String(b.soldOn || "").localeCompare(String(a.soldOn || "")); }).forEach(function (x) {
        var b = (x.soldPrice - x.avg) * x.qty;
        h += '<div class="hold ph-row" role="button" tabindex="0" data-act="edit" data-id="' + esc(x.id) + '"><div style="min-width:0"><div class="t">' + esc(x.name) +
          '</div><div class="s">Sold ' + esc(fdate(x.soldOn)) + " · " + qtyf(x.qty) + " @ " + inr2(x.soldPrice) + '</div></div><div class="r">' + inr(x.qty * x.soldPrice) +
          '<small style="color:' + col(b) + '">' + inr(b) + "</small></div></div>";
      });
    }
    h += "</section>";

    /* sector mix + targets */
    var secs = Object.keys(r.sectors);
    Object.keys(p.targets || {}).forEach(function (s) { if (secs.indexOf(s) < 0) secs.push(s); });
    secs.sort(function (a, b) { return (r.sectors[b] || 0) - (r.sectors[a] || 0); });
    h += '<section class="card"><h2>Sector mix &amp; targets</h2><p class="hint" style="margin:8px 0 10px">Tap a sector to set a target % of the portfolio. The app shows how much to add (or trim) to reach it.</p>';
    if (!secs.length) h += '<p class="empty" style="margin:0">Add holdings with a sector to see the mix.</p>';
    secs.forEach(function (s) {
      var v = r.sectors[s] || 0, share = r.value ? v / r.value : 0, tg = p.targets[s], extra = "";
      if (tg != null) {
        var diff = (tg / 100) * r.value - v;
        extra = '<span class="pill' + (diff > 0 ? "" : " over") + '">target ' + tg + "%</span> " + (diff > 0 ? "add " + inr(diff) : "over by " + inr(-diff));
      }
      h += '<div class="bar-row ph-sec" role="button" tabindex="0" data-act="target" data-s="' + esc(s) + '" style="padding:7px 0"><span>' + esc(s) + (extra ? " · <small>" + extra + "</small>" : "") +
        '</span><span class="num">' + inr(v) + " · " + (share * 100).toFixed(1) + '%</span><div class="track"><div class="fill" style="width:' + Math.min(100, share * 100).toFixed(1) + '%;--c:var(--accent)"></div></div></div>';
    });
    h += "</section>";

    /* cash */
    h += '<section class="card"><h2>Cash from sales</h2><div class="prow"><span>Cash left to invest</span><span class="num">' + inr(r.cash) + '</span></div>' +
      '<div class="prow"><span>Still to add for sector targets</span><span class="num">' + inr(r.need) + '</span></div>' +
      '<div class="prow"><span><b>Cash left after targets</b></span><span class="num" style="color:' + col(r.cash - r.need) + '"><b>' + inr(r.cash - r.need) + "</b></span></div>" +
      '<div class="btns" style="margin-top:10px"><button class="ghost" data-act="cash0" type="button">Set opening cash (' + inr(p.cash0 || 0) + ")</button></div></section>";

    /* trades */
    var tr = p.trades.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    h += '<section class="card"><h2>Trades</h2>';
    if (!tr.length) h += '<p class="empty" style="margin:8px 0 0">No trades recorded yet. Use Record buy or Record sale.</p>';
    var shown = ui.trades ? tr : tr.slice(0, 6);
    shown.forEach(function (t) {
      var amt = t.amount != null ? t.amount : t.qty * t.price;
      h += '<div class="hold"><div style="min-width:0"><div class="t">' + esc(t.action) + " · " + esc(t.name) + '</div><div class="s">' + esc(fdate(t.date)) + " · " + qtyf(t.qty) + " @ " + inr2(t.price) +
        (t.note ? " · " + esc(t.note) : "") + '</div></div><div class="r">' + inr(amt) + '<small style="color:' + (t.action === "SELL" ? col(t.pl || 0) : "var(--muted)") + '">' +
        (t.action === "SELL" ? inr(t.pl || 0) : "bought") + '</small></div><div class="full"><button class="ghost ph-del" type="button" data-act="deltrade" data-id="' + esc(t.id) + '">Delete this entry</button></div></div>';
    });
    if (tr.length > 6) h += '<div class="chips" style="margin-top:10px"><button type="button" data-act="togtr">' + (ui.trades ? "Show fewer" : "Show all " + tr.length) + "</button></div>";
    h += "</section>";
    root.innerHTML = h;
  }

  /* ---------- modal ---------- */
  var modal = null;
  function closeModal() {
    if (modal) { modal.remove(); modal = null; }
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") closeModal(); }
  function openModal(title, body) {
    closeModal();
    modal = document.createElement("div");
    modal.className = "pmodal";
    modal.innerHTML = '<div class="pbox" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h2 style="margin-bottom:12px">' + esc(title) + "</h2>" + body + "</div>";
    modal.addEventListener("mousedown", function (e) { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
    document.addEventListener("keydown", onKey);
    var f = modal.querySelector("input,select");
    if (f) f.focus();
    return modal;
  }
  function fld(id, label, val, opts) {
    opts = opts || {};
    return '<div class="field"><label class="flabel" for="' + id + '">' + esc(label) + "</label><input id=\"" + id + '" ' +
      (opts.type ? 'type="' + opts.type + '"' : 'type="text"') + (opts.mode ? ' inputmode="' + opts.mode + '"' : "") +
      (opts.list ? ' list="' + opts.list + '"' : "") + ' value="' + esc(val == null ? "" : val) + '"' + (opts.ph ? ' placeholder="' + esc(opts.ph) + '"' : "") + "></div>";
  }
  function sectorList(p) {
    var set = {};
    p.holdings.forEach(function (h) { if (h.sector) set[h.sector] = 1; });
    return '<datalist id="pfSectors">' + Object.keys(set).sort().map(function (s) { return '<option value="' + esc(s) + '">'; }).join("") + "</datalist>";
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value : ""; }
  function err(t) { var e = document.getElementById("pmErr"); if (e) { e.textContent = t; e.className = "msg err"; } }
  var ERR = '<div class="msg" id="pmErr" role="alert"></div>';

  function holdingForm(h, isNew) {
    var p = cur();
    var html = sectorList(p) + fld("pmName", "Name", h.name, { ph: "e.g. Tata Elxsi or Nifty ETF" }) +
      '<div class="row2">' + fld("pmSector", "Sector", h.sector, { list: "pfSectors", ph: "IT, Pharma, ETF…" }) + fld("pmQty", "Quantity", h.qty || "", { mode: "decimal" }) + "</div>" +
      '<div class="row2">' + fld("pmAvg", "Average cost per unit (₹)", h.avg ? +Number(h.avg).toFixed(4) : "", { mode: "decimal" }) + fld("pmPrice", "Current price (₹)", h.price || "", { mode: "decimal" }) + "</div>" +
      fld("pmReal", "Earlier realised profit/loss on this stock (optional)", h.realEarlier || "", { mode: "decimal" });
    if (isNew) html += '<label class="small" style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="pmCash" style="width:auto"> Paid from my cash (reduce cash and log a buy)</label>';
    return html;
  }
  function readHolding(h) {
    var name = val("pmName").trim();
    if (!name) { err("Type a name."); return false; }
    var qty = num(val("pmQty")), avg = num(val("pmAvg"));
    if (qty <= 0) { err("Quantity must be more than zero."); return false; }
    if (avg < 0) { err("Average cost can't be negative."); return false; }
    h.name = name; h.sector = val("pmSector").trim() || "Others"; h.qty = qty; h.avg = avg;
    h.price = num(val("pmPrice")); h.realEarlier = num(val("pmReal"));
    return true;
  }

  function addModal() {
    var p = cur(), h = { name: "", sector: "", qty: 0, avg: 0, price: 0 };
    openModal("Add holding", holdingForm(h, true) + ERR +
      '<div class="btns" style="margin-top:12px"><button class="primary" id="pmSave" type="button">Save</button><button class="ghost" id="pmCancel" type="button">Cancel</button></div>');
    document.getElementById("pmCancel").onclick = closeModal;
    document.getElementById("pmSave").onclick = function () {
      var n = { id: uid(), status: "HELD" };
      if (!readHolding(n)) return;
      if (p.holdings.some(function (x) { return x.status !== "SOLD" && same(x.name, n.name); })) return err("You already hold this. Use Record buy to add more.");
      p.holdings.push(n);
      if (document.getElementById("pmCash").checked) p.trades.push({ id: uid(), date: today(), name: n.name, action: "BUY", qty: n.qty, price: n.avg, amount: n.qty * n.avg, note: "Added holding" });
      save(); closeModal(); render(); flash("Added " + n.name + ".");
    };
  }

  function editModal(id) {
    var p = cur(), h = p.holdings.find(function (x) { return x.id === id; });
    if (!h) return;
    var sold = h.status === "SOLD";
    var body = holdingForm(h, false);
    if (sold) body += '<div class="row2" style="margin-top:8px">' + fld("pmSoldOn", "Sold on (yyyy-mm-dd)", h.soldOn || "") + fld("pmSoldAt", "Sold price (₹)", h.soldPrice || "", { mode: "decimal" }) + "</div>";
    body += ERR + '<div class="btns" style="margin-top:12px"><button class="primary" id="pmSave" type="button">Save changes</button>' +
      (sold ? '<button class="ghost" id="pmReopen" type="button">Mark as held again</button>' : '<button class="ghost" id="pmSell" type="button">Sell…</button><button class="ghost" id="pmBuy" type="button">Buy more…</button>') +
      '<button class="danger" id="pmDel" type="button">Delete</button><button class="ghost" id="pmCancel" type="button">Cancel</button></div>';
    openModal(sold ? "Sold holding" : "Edit holding", body);
    document.getElementById("pmCancel").onclick = closeModal;
    document.getElementById("pmSave").onclick = function () {
      var c = Object.assign({}, h);
      if (!readHolding(c)) return;
      if (sold) { c.soldOn = toISO(val("pmSoldOn")) || h.soldOn; c.soldPrice = num(val("pmSoldAt")); }
      Object.assign(h, c); save(); closeModal(); render(); flash("Saved " + h.name + ".");
    };
    document.getElementById("pmDel").onclick = function () {
      if (!confirm("Delete " + h.name + " from this portfolio? Trades already recorded stay in the trade log.")) return;
      p.holdings = p.holdings.filter(function (x) { return x.id !== id; });
      save(); closeModal(); render(); flash("Deleted " + h.name + ".");
    };
    if (sold) document.getElementById("pmReopen").onclick = function () {
      h.status = "HELD"; delete h.soldOn; delete h.soldPrice; save(); closeModal(); render(); flash(h.name + " is held again.");
    };
    else {
      document.getElementById("pmSell").onclick = function () { sellModal(id); };
      document.getElementById("pmBuy").onclick = function () { buyModal(id); };
    }
  }

  function holdOptions(p, selId, withNew) {
    var o = p.holdings.filter(function (x) { return x.status !== "SOLD"; }).sort(function (a, b) { return a.name.localeCompare(b.name); })
      .map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === selId ? " selected" : "") + ">" + esc(x.name) + " (" + qtyf(x.qty) + ")</option>"; }).join("");
    return (withNew ? '<option value="">New holding…</option>' : "") + o;
  }

  function sellModal(id) {
    var p = cur();
    if (!p.holdings.some(function (x) { return x.status !== "SOLD"; })) { flash("Nothing to sell yet. Add a holding first.", true); return; }
    var first = p.holdings.find(function (x) { return x.id === id; }) || p.holdings.find(function (x) { return x.status !== "SOLD"; });
    openModal("Record a sale",
      '<div class="field"><label class="flabel" for="pmH">Holding</label><select id="pmH">' + holdOptions(p, first.id, false) + "</select></div>" +
      '<div class="row2">' + fld("pmQty", "Quantity sold", first.qty, { mode: "decimal" }) + fld("pmPx", "Sell price (₹)", first.price || "", { mode: "decimal" }) + "</div>" +
      fld("pmDate", "Date (yyyy-mm-dd)", today()) + fld("pmNote", "Note (optional)", "") +
      '<div class="hint" id="pmPrev" style="margin-top:10px"></div>' + ERR +
      '<div class="btns" style="margin-top:12px"><button class="primary" id="pmSave" type="button">Save sale</button><button class="ghost" id="pmCancel" type="button">Cancel</button></div>');
    var sel = document.getElementById("pmH");
    function cu() { return p.holdings.find(function (x) { return x.id === sel.value; }); }
    function prev() {
      var h = cu(), q = num(val("pmQty")), px = num(val("pmPx"));
      document.getElementById("pmPrev").textContent = h && q > 0 && px > 0
        ? "You receive " + inr(q * px) + ". Profit/loss on this sale: " + inr((px - h.avg) * q) + " (average cost " + inr2(h.avg) + ")."
        : "Enter quantity and sell price to see the profit or loss.";
    }
    sel.onchange = function () { var h = cu(); document.getElementById("pmQty").value = h.qty; document.getElementById("pmPx").value = h.price || ""; prev(); };
    ["pmQty", "pmPx"].forEach(function (i) { document.getElementById(i).oninput = prev; });
    prev();
    document.getElementById("pmCancel").onclick = closeModal;
    document.getElementById("pmSave").onclick = function () {
      var h = cu(), q = num(val("pmQty")), px = num(val("pmPx")), d = toISO(val("pmDate"));
      if (!h) return err("Pick a holding.");
      if (q <= 0) return err("Quantity must be more than zero.");
      if (q > h.qty + 1e-9) return err("You hold only " + qtyf(h.qty) + ".");
      if (px <= 0) return err("Enter the sell price.");
      if (!d) return err("Use the date format yyyy-mm-dd.");
      p.trades.push({ id: uid(), date: d, name: h.name, action: "SELL", qty: q, price: px, avg: h.avg, amount: q * px, pl: (px - h.avg) * q, note: val("pmNote").trim() });
      if (q >= h.qty - 1e-9) { h.status = "SOLD"; h.soldOn = d; h.soldPrice = px; }
      else h.qty = +(h.qty - q).toFixed(6);
      h.price = px > 0 && h.price ? h.price : px;
      save(); closeModal(); render(); flash("Sale recorded: " + inr(q * px) + " added to cash.");
    };
  }

  function buyModal(id) {
    var p = cur(), h0 = p.holdings.find(function (x) { return x.id === id; });
    openModal("Record a buy",
      sectorList(p) + '<div class="field"><label class="flabel" for="pmH">Holding</label><select id="pmH">' + holdOptions(p, id, true) + "</select></div>" +
      '<div id="pmNew">' + fld("pmName", "Name (new holding)", "") + fld("pmSector", "Sector", "", { list: "pfSectors" }) + "</div>" +
      '<div class="row2">' + fld("pmQty", "Quantity bought", "", { mode: "decimal" }) + fld("pmPx", "Buy price (₹)", h0 ? h0.price || "" : "", { mode: "decimal" }) + "</div>" +
      fld("pmDate", "Date (yyyy-mm-dd)", today()) + fld("pmNote", "Note (optional)", "") +
      '<div class="hint" id="pmPrev" style="margin-top:10px"></div>' + ERR +
      '<div class="btns" style="margin-top:12px"><button class="primary" id="pmSave" type="button">Save buy</button><button class="ghost" id="pmCancel" type="button">Cancel</button></div>');
    var sel = document.getElementById("pmH");
    if (h0) sel.value = id;
    function cu() { return p.holdings.find(function (x) { return x.id === sel.value; }); }
    function showNew() { document.getElementById("pmNew").hidden = !!sel.value; prev(); }
    function prev() {
      var h = cu(), q = num(val("pmQty")), px = num(val("pmPx"));
      document.getElementById("pmPrev").textContent = q > 0 && px > 0
        ? "Cost " + inr(q * px) + " will be taken from cash." + (h ? " New average cost: " + inr2((h.qty * h.avg + q * px) / (h.qty + q)) + "." : "")
        : "Enter quantity and buy price.";
    }
    sel.onchange = showNew; ["pmQty", "pmPx"].forEach(function (i) { document.getElementById(i).oninput = prev; });
    showNew();
    document.getElementById("pmCancel").onclick = closeModal;
    document.getElementById("pmSave").onclick = function () {
      var h = cu(), q = num(val("pmQty")), px = num(val("pmPx")), d = toISO(val("pmDate"));
      if (q <= 0) return err("Quantity must be more than zero.");
      if (px <= 0) return err("Enter the buy price.");
      if (!d) return err("Use the date format yyyy-mm-dd.");
      var name;
      if (h) { h.avg = (h.qty * h.avg + q * px) / (h.qty + q); h.qty = +(h.qty + q).toFixed(6); if (!h.price) h.price = px; name = h.name; }
      else {
        name = val("pmName").trim();
        if (!name) return err("Type the name of the new holding.");
        var ex = p.holdings.find(function (x) { return same(x.name, name); });
        if (ex && ex.status !== "SOLD") return err("You already hold this. Pick it from the list.");
        if (ex) { ex.status = "HELD"; delete ex.soldOn; delete ex.soldPrice; ex.qty = q; ex.avg = px; ex.price = px; }
        else p.holdings.push({ id: uid(), name: name, sector: val("pmSector").trim() || "Others", qty: q, avg: px, price: px, status: "HELD" });
      }
      p.trades.push({ id: uid(), date: d, name: name, action: "BUY", qty: q, price: px, amount: q * px, note: val("pmNote").trim() });
      save(); closeModal(); render(); flash("Buy recorded: " + inr(q * px) + " taken from cash.");
    };
  }

  function pricesModal() {
    var p = cur(), held = p.holdings.filter(function (x) { return x.status !== "SOLD"; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (!held.length) { flash("No holdings to update.", true); return; }
    openModal("Update prices",
      '<p class="hint" style="margin:0 0 10px">Type today\'s price for each holding. Leave unchanged to keep it.</p>' +
      held.map(function (h, i) {
        return '<div class="hold" style="align-items:center"><div style="min-width:0"><div class="t">' + esc(h.name) + '</div><div class="s">avg ' + inr2(h.avg) + " · " + qtyf(h.qty) + '</div></div><div style="width:110px"><input type="text" inputmode="decimal" data-i="' + i + '" value="' + esc(h.price || "") + '" aria-label="Price of ' + esc(h.name) + '"></div></div>';
      }).join("") + '<div class="btns" style="margin-top:12px"><button class="primary" id="pmSave" type="button">Save prices</button><button class="ghost" id="pmCancel" type="button">Cancel</button></div>');
    document.getElementById("pmCancel").onclick = closeModal;
    document.getElementById("pmSave").onclick = function () {
      modal.querySelectorAll("input[data-i]").forEach(function (el) { var v = num(el.value); if (v > 0) held[+el.dataset.i].price = v; });
      p.pricesAt = today(); save(); closeModal(); render(); flash("Prices updated.");
    };
  }

  /* ---------- Excel import / export ---------- */
  var xlP = null;
  function xl() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlP) xlP = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "xlsx.full.min.js"; s.onload = function () { res(window.XLSX); };
      s.onerror = function () { xlP = null; rej(new Error("load")); };
      document.head.appendChild(s);
    });
    return xlP;
  }
  function norm(v) { return String(v == null ? "" : v).trim().toLowerCase(); }
  function findCols(row) {
    var m = {};
    row.forEach(function (c, i) {
      var k = norm(c);
      if (!k) return;
      if (/^(stock \/ etf|stock|name|holding|stock name)$/.test(k)) m.name = m.name == null ? i : m.name;
      else if (k === "invested") m.inv = i;
      else if (k === "sector") m.sector = i;
      else if (k === "status") m.status = i;
      else if (k === "qty" || k === "quantity") m.qty = i;
      else if (/^avg(\.|erage)? ?(cost|price)?$/.test(k)) m.avg = i;
      else if (/^(price|current price|ltp)$/.test(k)) m.price = i;
      else if (k.indexOf("realized p/l earlier") === 0 || k.indexOf("realised p/l earlier") === 0) m.real = i;
      else if (k === "sold on") m.soldOn = i;
      else if (k === "sold @" || k === "sold at") m.soldAt = i;
      else if (k === "date") m.date = i;
      else if (k === "action") m.action = i;
      else if (k === "avg cost") m.avg = i;
      else if (k.indexOf("amount") === 0) m.amount = i;
      else if (k.indexOf("p/l (") === 0 || k === "p/l") m.pl = i;
      else if (k === "note") m.note = i;
    });
    return m;
  }
  function parseBook(XLSX, wbk) {
    var out = { holdings: [], trades: [], cash0: 0, targets: {} };
    wbk.SheetNames.forEach(function (sn) {
      var rows = XLSX.utils.sheet_to_json(wbk.Sheets[sn], { header: 1, raw: true, defval: null });
      if (norm(sn) === "settings") {
        rows.forEach(function (r) {
          var k = String(r[0] || "");
          if (k === "Opening cash") out.cash0 = num(r[1]);
          else if (k.indexOf("Target: ") === 0) out.targets[k.slice(8)] = num(r[1]);
        });
        return;
      }
      for (var i = 0; i < Math.min(rows.length, 12); i++) {
        var c = findCols(rows[i] || []);
        if (c.name != null && c.qty != null && c.avg != null && c.action == null && !out.holdings.length) {
          for (var j = i + 1; j < rows.length; j++) {
            var r = rows[j] || [], nm = String(r[c.name] == null ? "" : r[c.name]).trim();
            if (!nm) continue;
            if (/^total/i.test(nm)) break;
            var qty = num(r[c.qty]), avg = num(r[c.avg]);
            if (c.inv != null && num(r[c.inv]) > 0 && qty > 0) avg = num(r[c.inv]) / qty;
            if (!(qty > 0)) continue;
            var sold = c.status != null && norm(r[c.status]) === "sold";
            var h = { id: uid(), name: nm, sector: c.sector != null && r[c.sector] ? String(r[c.sector]).trim() : "Others", qty: qty, avg: avg,
              price: c.price != null ? num(r[c.price]) : 0, status: sold ? "SOLD" : "HELD", realEarlier: c.real != null ? num(r[c.real]) : 0 };
            if (sold) { h.soldOn = c.soldOn != null ? toISO(r[c.soldOn]) : ""; h.soldPrice = c.soldAt != null ? num(r[c.soldAt]) : h.price; }
            out.holdings.push(h);
          }
          return;
        }
        if (c.date != null && c.action != null && c.name != null && !out.trades.length) {
          for (var k2 = i + 1; k2 < rows.length; k2++) {
            var t = rows[k2] || [], d = toISO(t[c.date]);
            if (!d) break;
            var act = String(t[c.action] || "").trim().toUpperCase();
            if (act !== "BUY" && act !== "SELL") continue;
            var q = num(t[c.qty]), px = num(t[c.price]), avg2 = c.avg != null ? num(t[c.avg]) : 0;
            var amount = c.amount != null && num(t[c.amount]) ? num(t[c.amount]) : q * px;
            var pl = c.pl != null && t[c.pl] != null && t[c.pl] !== "" ? num(t[c.pl]) : act === "SELL" ? (px - avg2) * q : 0;
            out.trades.push({ id: uid(), date: d, name: String(t[c.name] || "").trim(), action: act, qty: q, price: px, avg: avg2, amount: amount, pl: pl, note: c.note != null && t[c.note] ? String(t[c.note]).trim() : "", logOnly: true });
          }
          return;
        }
      }
    });
    return out;
  }
  function importFile(file) {
    flash("Reading " + file.name + "…");
    Promise.all([xl(), file.arrayBuffer()]).then(function (a) {
      var XLSX = a[0], wbk = XLSX.read(a[1], { type: "array" });
      var res = parseBook(XLSX, wbk);
      if (!res.holdings.length && !res.trades.length) { flash("Couldn't find a stock table in that file. It needs columns like Stock / ETF, Qty, Avg cost, Price.", true); return; }
      var def = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 30) || "Imported portfolio";
      var name = prompt("Import as a new portfolio. Name:", def);
      if (name === null) { flash(""); return; }
      var p = blank(name.trim() || def);
      p.holdings = res.holdings; p.trades = res.trades; p.cash0 = res.cash0; p.targets = res.targets;
      db.list.push(p); db.active = p.id; save(); render();
      flash("Imported " + res.holdings.filter(function (h) { return h.status !== "SOLD"; }).length + " holdings and " + res.trades.length + " trades into \"" + p.name + "\".");
    }).catch(function () { flash("Couldn't read that file. Use an .xlsx or .csv file.", true); });
  }
  function exportFile() {
    var p = cur();
    xl().then(function (XLSX) {
      var wb = XLSX.utils.book_new();
      var H = [["Stock / ETF", "Sector", "Status", "Qty", "Avg cost", "Invested", "Price", "Value", "Unrealized P/L", "Realized P/L earlier (statement)", "Sold on", "Sold @", "Booked on sale"]];
      p.holdings.forEach(function (h) {
        var sold = h.status === "SOLD", px = sold ? 0 : h.price || 0;
        H.push([h.name, h.sector || "Others", sold ? "SOLD" : "HELD", h.qty, h.avg, h.qty * h.avg, sold ? h.soldPrice || 0 : px, sold ? 0 : h.qty * (px || h.avg), sold ? 0 : h.qty * ((px || h.avg) - h.avg), h.realEarlier || 0, sold ? h.soldOn || "" : "", sold ? h.soldPrice || 0 : "", sold ? (h.soldPrice - h.avg) * h.qty : ""]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(H), "Holdings");
      var T = [["Date", "Stock / ETF", "Action", "Qty", "Price", "Avg cost", "Amount (₹)", "P/L (₹)", "Cash change (₹)", "Note"]];
      p.trades.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (t) {
        var amt = t.amount != null ? t.amount : t.qty * t.price;
        T.push([t.date, t.name, t.action, t.qty, t.price, t.avg || "", amt, t.action === "SELL" ? t.pl || 0 : "", t.action === "SELL" ? amt : -amt, t.note || ""]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(T), "Trades");
      var S = [["Setting", "Value"], ["Opening cash", p.cash0 || 0]];
      Object.keys(p.targets || {}).forEach(function (s) { S.push(["Target: " + s, p.targets[s]]); });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(S), "Settings");
      XLSX.writeFile(wb, "Portfolio - " + p.name.replace(/[\\/:*?"<>|]/g, "") + " - " + today() + ".xlsx");
      flash("Downloaded. You can re-import this file later.");
    }).catch(function () { flash("Couldn't create the Excel file.", true); });
  }

  function pullLedger() {
    var tx = [];
    try { tx = JSON.parse(localStorage.getItem("pl_txns") || "[]") || []; } catch (e) {}
    var g = {};
    tx.filter(function (t) { return t.type === "invest" && (t.kind === "stock" || t.kind === "mf") && t.name; }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (t) {
      var k = t.kind + "|" + String(t.name).trim().toLowerCase();
      var o = g[k] || (g[k] = { name: String(t.name).trim(), kind: t.kind, qty: 0, cost: 0, last: 0 });
      var q = Number(t.qty) || 0, amt = Number(t.amount) || 0;
      if (!(q > 0)) return;
      if (t.side === "in") { var av = o.qty > 0 ? o.cost / o.qty : 0; var sq = Math.min(q, o.qty); o.cost -= av * sq; o.qty -= sq; }
      else { o.qty += q; o.cost += amt; o.last = amt / q; }
    });
    var items = Object.keys(g).map(function (k) { return g[k]; }).filter(function (o) { return o.qty > 1e-9; });
    if (!items.length) { flash("No stock or fund holdings with quantities found in your ledger.", true); return; }
    if (!confirm("Copy " + items.length + " stock/fund holdings from your ledger into \"" + cur().name + "\"? Existing holdings with the same name get their quantity and average cost refreshed; prices and sectors are kept.")) return;
    var p = cur(), added = 0, upd = 0;
    items.forEach(function (o) {
      var ex = p.holdings.find(function (h) { return same(h.name, o.name) && h.status !== "SOLD"; });
      if (ex) { ex.qty = +o.qty.toFixed(6); ex.avg = o.cost / o.qty; upd++; }
      else { p.holdings.push({ id: uid(), name: o.name, sector: o.kind === "mf" ? "Mutual funds" : "Stocks", qty: +o.qty.toFixed(6), avg: o.cost / o.qty, price: o.last || o.cost / o.qty, status: "HELD" }); added++; }
    });
    save(); render(); flash("Ledger synced: " + added + " added, " + upd + " updated. Update prices to see current profit/loss.");
  }

  /* ---------- events ---------- */
  function act(el) {
    var a = el.dataset.act, p = cur();
    if (a === "add") return addModal();
    if (a === "edit") return editModal(el.dataset.id);
    if (a === "buy") return buyModal();
    if (a === "sell") return sellModal();
    if (a === "prices") return pricesModal();
    if (a === "import") return document.getElementById("pfFile").click();
    if (a === "export") return exportFile();
    if (a === "ledger") return pullLedger();
    if (a === "togsold") { ui.sold = !ui.sold; return render(); }
    if (a === "togtr") { ui.trades = !ui.trades; return render(); }
    if (a === "deltrade") {
      if (!confirm("Delete this trade entry? It only changes the trade log and cash. Holdings are not changed.")) return;
      p.trades = p.trades.filter(function (t) { return t.id !== el.dataset.id; }); save(); render(); return flash("Entry deleted.");
    }
    if (a === "cash0") {
      var v = prompt("Cash you already had before the trades listed here (₹):", p.cash0 || 0);
      if (v === null) return;
      p.cash0 = num(v); save(); render(); return flash("Opening cash saved.");
    }
    if (a === "target") {
      var s = el.dataset.s, cu = p.targets[s];
      var t = prompt("Target share of the portfolio for \"" + s + "\" in % (leave blank to remove):", cu == null ? "" : cu);
      if (t === null) return;
      if (String(t).trim() === "") delete p.targets[s];
      else { var n = num(t); if (n < 0 || n > 100) return flash("Enter a % between 0 and 100.", true); p.targets[s] = n; }
      save(); render(); return;
    }
    if (a === "pnew") {
      var nm = prompt("Name of the new portfolio:", "");
      if (!nm || !nm.trim()) return;
      var np = blank(nm.trim().slice(0, 30)); db.list.push(np); db.active = np.id; save(); render(); return flash("Created \"" + np.name + "\".");
    }
    if (a === "pren") {
      var rn = prompt("Rename portfolio:", p.name);
      if (!rn || !rn.trim()) return;
      p.name = rn.trim().slice(0, 30); save(); render(); return;
    }
    if (a === "pdel") {
      if (db.list.length < 2) return flash("Keep at least one portfolio. Create another first, or delete holdings one by one.", true);
      if (!confirm("Delete the portfolio \"" + p.name + "\" with all its holdings and trades? This cannot be undone.")) return;
      db.list = db.list.filter(function (x) { return x.id !== p.id; }); db.active = db.list[0].id; save(); render(); return flash("Portfolio deleted.");
    }
  }
  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (el && root.contains(el)) act(el);
  });
  root.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("[role=button][data-act]");
    if (el) { e.preventDefault(); act(el); }
  });
  root.addEventListener("change", function (e) {
    if (e.target.id === "pfSel") { db.active = e.target.value; save(); render(); }
    else if (e.target.id === "pfSort") { ui.sort = e.target.value; render(); }
    else if (e.target.id === "pfFile") { var f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) importFile(f); }
  });
  root.addEventListener("input", function (e) {
    if (e.target.id === "pfQ") {
      ui.q = e.target.value;
      var pos = e.target.selectionStart;
      render();
      var q = document.getElementById("pfQ"); q.focus(); try { q.setSelectionRange(pos, pos); } catch (x) {}
    }
  });

  /* ---------- styles ---------- */
  var st = document.createElement("style");
  st.textContent =
    ".ph-head .row2{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}.ph-head .ph-mini{display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap}.ph-head .ph-mini .ghost{padding:9px 10px;font-size:.82rem}" +
    ".ph-row{cursor:pointer}.ph-row:hover{background:var(--paper)}.ph-sec{cursor:pointer}.ph-sec:hover{background:var(--paper)}.hold .r small{display:block}" +
    ".ph-del{padding:5px 10px;font-size:.78rem;margin-top:4px}" +
    ".pmodal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;z-index:90}" +
    ".pbox{background:var(--sheet);color:var(--ink);width:100%;max-width:640px;border-radius:18px 18px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0));max-height:92vh;overflow:auto;display:flex;flex-direction:column;gap:10px}" +
    "@media(min-width:700px){.pmodal{align-items:center}.pbox{border-radius:18px}}" +
    ".hero .tiles .tile .num{font-size:.9rem}";
  document.head.appendChild(st);

  render();
})();
