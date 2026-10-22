!(function () {
  "use strict";
  const e = (e) => document.getElementById(e),
    t = (e) => String(e).padStart(2, "0"),
    n = (e) =>
      String(e ?? "").replace(
        /[&<>"']/g,
        (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e],
      ),
    a = (e) => ((e = Number(e) || 0) < 0 ? "−" : "") + "₹" + Math.abs(Math.round(e)).toLocaleString("en-IN"),
    o = (e) => (Number(e) || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 }),
    s = (e) => "₹" + (Number(e) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    i = (e) => {
      const t = parseFloat(String(e ?? "").replace(/[,₹\s]/g, ""));
      return isFinite(t) ? t : 0;
    },
    r = (e) => e.getFullYear() + "-" + t(e.getMonth() + 1) + "-" + t(e.getDate()),
    c = () => r(new Date()),
    l = (e) => String(e).slice(0, 7),
    d = () =>
      crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
    u = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    m = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    p = (e) => new Date(e + "T00:00"),
    h = (e) => {
      const t = p(e);
      return t.getDate() + " " + u[t.getMonth()] + " " + t.getFullYear();
    },
    f = (e, t) => {
      const n = p(e),
        a = n.getDate();
      (n.setDate(1), n.setMonth(n.getMonth() + t));
      const o = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      return (n.setDate(Math.min(a, o)), r(n));
    },
    y = (e) => {
      const t = p(e);
      return t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1;
    },
    v = (e) => "FY " + e + "-" + String(e + 1).slice(2),
    g = (e) => Math.round((p(e) - p(c())) / 864e5),
    w = {
      expense: [
        "Food",
        "Rent",
        "Transport",
        "Shopping",
        "Bills",
        "Health",
        "Education",
        "Entertainment",
        "Travel",
        "Other",
      ],
      income: ["Salary", "Stipend", "Dividend", "Interest", "Freelance", "Rental", "Gift", "Other"],
    },
    b = {
      stock: {
        label: "Stocks",
        short: "ST",
        name: "Stock name",
        inst: "Broker",
        nameReq: 1,
        instReq: 1,
        sides: [
          ["Buy", "out"],
          ["Sell", "in"],
        ],
        qty: "Quantity",
        price: "Price per share",
      },
      mf: {
        label: "Mutual Fund",
        short: "MF",
        name: "Fund / scheme name",
        inst: "Platform / AMC",
        nameReq: 1,
        sides: [
          ["SIP", "out"],
          ["Lumpsum", "out"],
          ["Redeem", "in"],
        ],
        qty: "Units",
        price: "NAV",
      },
      ppf: {
        label: "PPF",
        short: "PF",
        name: "Account holder",
        inst: "Bank / Post office",
        sides: [
          ["Deposit", "out"],
          ["Withdrawal", "in"],
        ],
        limit: 15e4,
      },
      ssy: {
        label: "Sukanya Samriddhi",
        short: "SS",
        name: "Daughter's name",
        inst: "Bank / Post office",
        sides: [
          ["Deposit", "out"],
          ["Withdrawal", "in"],
        ],
        limit: 15e4,
      },
      insurance: {
        label: "Insurance",
        short: "IN",
        name: "Policy name",
        inst: "Insurer",
        nameReq: 1,
        sides: [
          ["Premium", "out"],
          ["Claim / Maturity", "in"],
        ],
        policy: 1,
        ptypes: ["Term", "Health", "Life / Endowment", "Vehicle", "Other"],
      },
      ulip: {
        label: "ULIP",
        short: "UL",
        name: "Plan name",
        inst: "Insurer",
        nameReq: 1,
        sides: [
          ["Premium", "out"],
          ["Withdrawal", "in"],
        ],
        policy: 1,
        fund: 1,
      },
      fd: {
        label: "Fixed Deposit",
        short: "FD",
        name: "FD name",
        inst: "Bank",
        sides: [
          ["Deposit", "out"],
          ["Maturity", "in"],
        ],
      },
      gold: {
        label: "Gold",
        short: "AU",
        name: "Type (SGB, coin, ETF)",
        inst: "Seller / platform",
        sides: [
          ["Buy", "out"],
          ["Sell", "in"],
        ],
        qty: "Grams / units",
        price: "Price per unit",
      },
      nps: {
        label: "NPS",
        short: "NP",
        name: "Account / tier",
        inst: "Bank / POP",
        sides: [
          ["Contribution", "out"],
          ["Withdrawal", "in"],
        ],
      },
      crypto: {
        label: "Crypto",
        short: "CR",
        name: "Coin",
        inst: "Exchange",
        sides: [
          ["Buy", "out"],
          ["Sell", "in"],
        ],
        qty: "Quantity",
        price: "Price per coin",
      },
      other: {
        label: "Other",
        short: "OT",
        name: "Name",
        inst: "Institution",
        sides: [
          ["Invest", "out"],
          ["Withdraw", "in"],
        ],
      },
    },
    x = (e) => {
      if (b[e]) return b[e];
      if (e && String(e).startsWith("c:")) {
        const t = e.slice(2);
        return {
          label: t,
          short: t.slice(0, 2).toUpperCase(),
          name: "Name",
          inst: "Institution",
          sides: [
            ["Invest", "out"],
            ["Withdraw", "in"],
          ],
        };
      }
      return b.other;
    },
    k = (e) => {
      if (e.ftype) return e.ftype;
      const t = (e.name || "").toLowerCase();
      return /elss|tax ?saver/.test(t)
        ? "ELSS"
        : /debt|liquid|gilt|bond|overnight|money market|corporate|banking (and|&) psu|duration|treasury/.test(
              t,
            )
          ? "Debt"
          : /hybrid|balanced/.test(t)
            ? "Hybrid"
            : "Equity";
    },
    C = {
      expense: {
        c: "var(--exp)",
        cs: "var(--exp-soft)",
        word: "Expense",
        acct: "Paid from",
        cat: "Category",
      },
      income: { c: "var(--inc)", cs: "var(--inc-soft)", word: "Income", acct: "Received in", cat: "Source" },
      invest: { c: "var(--inv)", cs: "var(--inv-soft)", word: "Investment", acct: "Paid from", cat: "Type" },
    };
  function S(e) {
    try {
      return JSON.parse(localStorage.getItem(e) || "null");
    } catch (e) {
      return null;
    }
  }
  function $(t, n) {
    try {
      return (localStorage.setItem(t, JSON.stringify(n)), !0);
    } catch (t) {
      return (
        "Couldn't save on this phone. Storage may be full or blocked.",
        (e("status").textContent = "Couldn't save on this phone. Storage may be full or blocked."),
        !1
      );
    }
  }
  let M = [],
    L = [],
    E = { expense: [], income: [], invest: [] },
    T = [];
  const N = {
      balanced: { label: "50/30/20 balanced", needs: 50, wants: 30, invest: 10, emergency: 10 },
      saver: { label: "Saver 50/20/30", needs: 50, wants: 20, invest: 20, emergency: 10 },
      student: { label: "Student / first job", needs: 60, wants: 20, invest: 10, emergency: 10 },
      custom: { label: "Custom" },
    },
    A = ["Shopping", "Entertainment", "Travel", "Other"];
  let I = {};
  function F() {
    return {
      salary: 0,
      preset: "balanced",
      pct: { needs: 50, wants: 30, invest: 10, emergency: 10 },
      wants: A.slice(),
      emAccts: [],
      emMonths: 6,
      regime: "",
      other80c: {},
    };
  }
  const P = {
    "Mutual Fund / SIP": "mf",
    Stocks: "stock",
    FD: "fd",
    PPF: "ppf",
    Gold: "gold",
    NPS: "nps",
    Crypto: "crypto",
  };
  function D(e) {
    if ("invest" === e.type) {
      e.kind || (e.kind = P[e.cat] || "other");
      const t = x(e.kind);
      ("in" !== e.side && (e.side = "out"),
        e.action || (e.action = (t.sides.find((t) => t[1] === e.side) || t.sides[0])[0]),
        (e.cat = t.label));
    }
    return ((e.amount = Number(e.amount) || 0), e);
  }
  // Each save returns true when it worked. (Before v15, _() returned nothing, so every new entry
  // showed "Couldn't save" and was dropped from memory, and the next entry overwrote it.)
  const saveAndSync = (k, v) => {
      const ok = $(k, v);
      return (ft(), ok);
    },
    q = () => saveAndSync("pl_plan", I),
    _ = () => saveAndSync("pl_txns", M),
    B = () => saveAndSync("pl_accts", L),
    O = () => saveAndSync("pl_cats", E);
  function j(e) {
    const t = w[e].filter((e) => "Other" !== e),
      n = E[e].filter((e) => !t.some((t) => t.toLowerCase() === e.toLowerCase()));
    return t.concat(n, ["Other"]);
  }
  const H = () =>
    Object.keys(b)
      .filter((e) => "other" !== e)
      .concat(
        E.invest.map((e) => "c:" + e),
        ["other"],
      );
  function R(e) {
    const t = String(e || "")
      .toLowerCase()
      .trim();
    if (!t) return null;
    for (const e of E.invest) if (e.toLowerCase() === t) return "c:" + e;
    for (const e in b) if (b[e].label.toLowerCase() === t || e === t) return e;
    const n = [
      [/sukanya|\bssy\b/, "ssy"],
      [/\bulip/, "ulip"],
      [/\bppf\b|provident/, "ppf"],
      [/\bnps\b|pension/, "nps"],
      [/insur|policy|\blic\b|term plan|health plan|mediclaim/, "insurance"],
      [/mutual|\bmf\b|\bsip\b|fund|scheme|\belss\b/, "mf"],
      [/stock|share|equity|demat|\bnse\b|\bbse\b/, "stock"],
      [/\bfd\b|fixed dep|\brd\b|recurring/, "fd"],
      [/gold|\bsgb\b|silver/, "gold"],
      [/crypto|bitcoin|\bbtc\b|\beth\b/, "crypto"],
    ];
    for (const [e, a] of n) if (e.test(t)) return a;
    return null;
  }
  function Y(e, t) {
    if (
      !(t = String(t || "")
        .trim()
        .replace(/\s+/g, " "))
    )
      return { err: "Type a name first." };
    if (t.length > 30) return { err: "Keep the name under 30 characters." };
    if ("invest" === e) {
      const e = R(t);
      return e && x(e).label.toLowerCase() === t.toLowerCase()
        ? { val: e, existing: 1 }
        : (E.invest.push(t), O(), { val: "c:" + t });
    }
    const n = j(e).find((e) => e.toLowerCase() === t.toLowerCase());
    return n ? { val: n, existing: 1 } : (E[e].push(t), O(), { val: t });
  }
  let U = [],
    G = [],
    W = !1,
    V = new Date();
  V = new Date(V.getFullYear(), V.getMonth(), 1);
  const J = (e) => e.getFullYear() + "-" + t(e.getMonth() + 1),
    Q = (e) =>
      "income" === e.type
        ? e.amount
        : "expense" === e.type
          ? -e.amount
          : "in" === e.side
            ? e.amount
            : -e.amount;
  function z(e) {
    const t = { income: 0, expense: 0, invest: 0 };
    return (
      e.forEach((e) => {
        "invest" === e.type ? (t.invest += "in" === e.side ? -e.amount : e.amount) : (t[e.type] += e.amount);
      }),
      t
    );
  }
  function X() {
    if (((W = 0 === M.length && 0 === L.length), W)) {
      const e = (function () {
        const e = new Date(),
          t = e.getFullYear(),
          n = e.getMonth(),
          a = (e, a) => r(new Date(t, n - e, Math.min(a, 28))),
          o = [],
          s = (e) => o.push(Object.assign({ type: "invest", account: "ex-bank", side: "out" }, e));
        for (let e = 5; e >= 0; e--)
          (o.push({
            type: "income",
            amount: 42e3,
            cat: "Salary",
            account: "ex-bank",
            date: a(e, 1),
            note: "Monthly salary",
          }),
            o.push({
              type: "expense",
              amount: 9e3,
              cat: "Rent",
              account: "ex-bank",
              date: a(e, 2),
              note: "Room rent",
            }),
            o.push({
              type: "expense",
              amount: 3200 + 150 * e,
              cat: "Food",
              account: "ex-upi",
              date: a(e, 3),
              note: "Mess bill",
            }),
            s({
              kind: "mf",
              action: "SIP",
              amount: 3e3,
              name: "Example Flexi Cap Fund",
              inst: "Groww",
              qty: +(3e3 / (80 + e)).toFixed(3),
              price: 80 + e,
              date: a(e, 5),
            }),
            s({ kind: "ppf", action: "Deposit", amount: 2e3, name: "Self", inst: "SBI", date: a(e, 7) }),
            o.push({
              type: "expense",
              amount: 800 + (e % 3) * 400,
              cat: "Transport",
              account: "ex-cash",
              date: a(e, 9),
              note: "Auto & bus",
            }),
            o.push({
              type: "expense",
              amount: 499,
              cat: "Bills",
              account: "ex-bank",
              date: a(e, 18),
              note: "Mobile recharge",
            }),
            e % 3 == 0 &&
              o.push({
                type: "income",
                amount: 640,
                cat: "Dividend",
                account: "ex-bank",
                date: a(e, 20),
                note: "ITC dividend",
              }));
        return (
          s({
            kind: "stock",
            action: "Buy",
            amount: 7e3,
            name: "TCS",
            inst: "Zerodha",
            qty: 2,
            price: 3500,
            date: a(4, 12),
          }),
          s({
            kind: "stock",
            action: "Buy",
            amount: 4500,
            name: "ITC",
            inst: "Zerodha",
            qty: 10,
            price: 450,
            date: a(3, 12),
          }),
          s({
            kind: "stock",
            action: "Buy",
            amount: 6e3,
            name: "HDFC Bank",
            inst: "Upstox",
            qty: 4,
            price: 1500,
            date: a(1, 15),
          }),
          s({
            kind: "insurance",
            action: "Premium",
            amount: 9800,
            name: "Term plan ₹1 crore",
            inst: "Example Life",
            ptype: "Term",
            sumAssured: 1e7,
            freq: "Yearly",
            nextDue: f(a(11, 25), 12),
            date: a(11, 25),
          }),
          s({
            kind: "insurance",
            action: "Premium",
            amount: 1450,
            name: "Family health cover",
            inst: "Example Health",
            ptype: "Health",
            sumAssured: 5e5,
            freq: "Monthly",
            nextDue: f(a(0, 26), 1),
            date: a(0, 26),
          }),
          {
            acc: [
              { id: "ex-bank", name: "Bank account", kind: "bank", opening: 6e4 },
              { id: "ex-cash", name: "Cash", kind: "cash", opening: 3e3 },
              { id: "ex-upi", name: "UPI wallet", kind: "wallet", opening: 1500 },
            ],
            t: o.filter((e) => e.date <= c()).map((e, t) => D(Object.assign({ id: "ex" + t }, e))),
          }
        );
      })();
      ((U = e.t), (G = e.acc));
    } else ((U = M), (G = L));
    ((e("exBanner").hidden = !W), Z());
  }
  const K = (e) => {
    const t = G.find((t) => t.id === e);
    return t ? t.name : "—";
  };
  function Z() {
    const t = J(V);
    e("monthLbl").textContent = u[V.getMonth()] + " " + V.getFullYear();
    const i = U.filter((e) => l(e.date) === t),
      r = z(i),
      d = r.income - r.expense - r.invest;
    ((e("sumInc").textContent = a(r.income)),
      (e("sumExp").textContent = a(r.expense)),
      (e("sumInv").textContent = a(r.invest)),
      (e("netAmt").textContent = a(d)),
      (e("netAmt").style.color = d < 0 ? "var(--exp)" : "var(--ink)"),
      (e("rate").textContent =
        r.income > 0
          ? `You kept ${Math.round(((r.income - r.expense) / r.income) * 100)}% of income after spending, and invested ${Math.max(0, Math.round((r.invest / r.income) * 100))}%.`
          : i.length
            ? "No income recorded this month."
            : "Nothing recorded this month yet."));
    const f = (e, t) => {
      const n = {};
      return (
        e.forEach((e) => {
          const a = t(e);
          n[a] = (n[a] || 0) + e.amount;
        }),
        Object.entries(n).sort((e, t) => t[1] - e[1])
      );
    };
    (te(
      "expBars",
      f(
        i.filter((e) => "expense" === e.type),
        (e) => e.cat,
      ),
      "var(--exp)",
      "No spending recorded this month.",
    ),
      te(
        "incBars",
        f(
          i.filter((e) => "income" === e.type),
          (e) => e.cat,
        ),
        "var(--inc)",
        "No income recorded this month.",
      ),
      te(
        "invBars",
        f(
          i.filter((e) => "invest" === e.type && "out" === e.side),
          (e) => e.cat,
        ),
        "var(--inv)",
        "No investments recorded this month.",
      ),
      ee(),
      (function () {
        const t = e("trend");
        t.innerHTML = "";
        const n = [];
        for (let e = 5; e >= 0; e--) {
          const t = new Date(V.getFullYear(), V.getMonth() - e, 1);
          n.push({ d: t, t: z(U.filter((e) => l(e.date) === J(t))) });
        }
        const o = Math.max(1, ...n.flatMap((e) => [e.t.income, e.t.expense, e.t.invest])),
          s = (e) => ((Math.max(0, e) / o) * 100).toFixed(1) + "%";
        n.forEach((e, n) => {
          const o = document.createElement("div");
          ((o.className = "tcol" + (5 === n ? " cur" : "")),
            (o.innerHTML = `<div class="tbars"><i style="height:${s(e.t.income)};background:var(--inc)" title="Income ${a(e.t.income)}"></i><i style="height:${s(e.t.expense)};background:var(--exp)" title="Spent ${a(e.t.expense)}"></i><i style="height:${s(e.t.invest)};background:var(--inv)" title="Invested ${a(e.t.invest)}"></i></div><small>${u[e.d.getMonth()]}</small>`),
            t.appendChild(o));
        });
      })(),
      ae(),
      (function () {
        const t = ie()
          .filter((e) => e.nextDue && g(e.nextDue) <= 30)
          .sort((e, t) => e.nextDue.localeCompare(t.nextDue));
        ((e("duesCard").hidden = !t.length),
          (e("duesList").innerHTML = t
            .map(
              (e) =>
                `<div class="hold"><div style="min-width:0"><div class="t">${n(e.name)}</div><div class="s">${n(x(e.kind).label)}${e.inst ? " · " + n(e.inst) : ""}</div></div><div class="r">${a(e.premium)}<small>${re(e)}</small></div></div>`,
            )
            .join("")));
      })(),
      (function (t) {
        const i = e("txList");
        i.innerHTML = "";
        const r = ue.toLowerCase(),
          c = t
            .filter(
              (e) =>
                ("all" === de || e.type === de) &&
                (!r ||
                  [e.cat, e.name, e.inst, e.note, e.action, K(e.account)]
                    .join(" ")
                    .toLowerCase()
                    .includes(r)),
            )
            .sort((e, t) => t.date.localeCompare(e.date) || (t.created || 0) - (e.created || 0));
        if (!c.length)
          return void (i.innerHTML = `<div class="empty">${r ? "No entries match your search." : "No entries for this month. Tap Add to record one."}</div>`);
        let l = "";
        c.forEach((e) => {
          if (e.date !== l) {
            l = e.date;
            const t = document.createElement("div");
            t.className = "day";
            const n = p(e.date);
            ((t.textContent = n.getDate() + " " + u[n.getMonth()] + ", " + m[n.getDay()]), i.appendChild(t));
          }
          const t = C[e.type],
            r = document.createElement("div");
          ((r.className = "tx"),
            (r.tabIndex = 0),
            r.style.setProperty("--c", t.c),
            r.style.setProperty("--cs", t.cs));
          const c = "income" === e.type || ("invest" === e.type && "in" === e.side);
          let d, h, f;
          if ("invest" === e.type) {
            const t = x(e.kind);
            ((d = e.name || t.label), (f = t.short));
            const n = e.qty ? ` · ${o(e.qty)} @ ${s(e.price)}` : "";
            h = [t.label + " " + e.action.toLowerCase() + n, e.inst, K(e.account), e.note]
              .filter(Boolean)
              .join(" · ");
          } else
            ((d = e.cat), (f = e.cat.slice(0, 2)), (h = [e.note, K(e.account)].filter(Boolean).join(" · ")));
          if (
            ((r.innerHTML = `<div class="dot">${n(f)}</div><div style="min-width:0"><div class="t">${n(d)}</div><div class="s">${n(h)}</div></div><div class="a">${c ? "+" : "−"}${a(e.amount)}</div>`),
            me === e.id && !W)
          ) {
            const t = document.createElement("div");
            ((t.className = "tx-actions"),
              (t.innerHTML =
                '<button class="ghost" data-a="cancel">Cancel</button><button class="danger" data-a="del">Delete entry</button>'),
              t.addEventListener("click", (t) => {
                var n;
                (t.stopPropagation(),
                  "del" === t.target.dataset.a &&
                    ((M = M.filter((t) => t.id !== e.id)),
                    (n = e.id),
                    T.includes(n) || T.push(n),
                    $("pl_deleted", T),
                    _()),
                  (me = null),
                  X());
              }),
              r.appendChild(t));
          }
          const y = () => {
            W || ((me = me === e.id ? null : e.id), Z());
          };
          (r.addEventListener("click", y),
            r.addEventListener("keydown", (e) => {
              "Enter" === e.key && y();
            }),
            i.appendChild(r));
        });
      })(i),
      (function () {
        const t = oe(),
          o = new Map();
        [...new Set(t.map((e) => e.kind))].forEach((e) =>
          o.set(
            e,
            ce(e).reduce((e, t) => e + t.invested, 0),
          ),
        );
        const s = [...o.values()].reduce((e, t) => e + t, 0);
        e("pfTotal").textContent = a(s);
        const i = y(c()),
          r = t.filter((e) => y(e.date) === i && "out" === e.side).reduce((e, t) => e + t.amount, 0),
          l = t.filter((e) => y(e.date) === i && "in" === e.side).reduce((e, t) => e + t.amount, 0);
        ((e("pfFy").textContent = t.length
          ? `${v(i)} so far: ${a(r)} invested` + (l ? `, ${a(l)} received from sales and withdrawals.` : ".")
          : ""),
          (e("pfKinds").innerHTML = [...o.entries()]
            .sort((e, t) => t[1] - e[1])
            .map(
              ([e, t]) =>
                `<div><div class="label">${n(x(e).label)}</div><span class="num">${a(t)}</span></div>`,
            )
            .join("")),
          (e("pfEmpty").hidden = t.length > 0));
        const d = ce("stock");
        ((e("stCard").hidden = !d.length), (e("stList").innerHTML = d.map((e) => le(e, "shares")).join("")));
        const u = ce("mf");
        ((e("mfCard").hidden = !u.length), (e("mfList").innerHTML = u.map((e) => le(e, "units")).join("")));
        const m = [];
        (["ppf", "ssy"].forEach((e) =>
          se(
            t.filter((t) => t.kind === e),
            (e) => (e.name || "").toLowerCase(),
          ).forEach((t) => {
            const n = t.reduce((e, t) => e + ("in" === t.side ? -t.amount : t.amount), 0),
              a = t.filter((e) => "out" === e.side && y(e.date) === i).reduce((e, t) => e + t.amount, 0);
            m.push({ k: e, name: t[0].name || "Account", inst: t[0].inst || "", net: n, fyDep: a });
          }),
        ),
          (e("ppfCard").hidden = !m.length),
          (e("ppfEmpty").hidden = !!m.length),
          (e("ppfList").innerHTML = m
            .map((e) => {
              const t = b[e.k].limit,
                o = Math.min(100, (e.fyDep / t) * 100),
                s = Math.max(0, t - e.fyDep);
              return `<div class="hold"><div style="min-width:0"><div class="t">${n(e.name)} <span class="pill">${n(b[e.k].label)}</span></div><div class="s">${n(e.inst || "—")}</div></div><div class="r">${a(e.net)}<small>total deposited</small></div>\n    <div class="full bar-row" style="--c:var(--inv)"><span class="small">${v(i)}: ${a(e.fyDep)} of ${a(t)}</span><span class="small muted">${s ? a(s) + " left" : "Limit reached"}</span><div class="track"><div class="fill" style="width:${o.toFixed(1)}%"></div></div></div></div>`;
            })
            .join("")));
        const p = ie().sort((e, t) => (e.nextDue || "9").localeCompare(t.nextDue || "9"));
        ((e("polCard").hidden = !p.length),
          (e("polEmpty").hidden = !!p.length),
          (e("polList").innerHTML = p
            .map((e) => {
              const t = [x(e.kind).label, e.ptype, e.inst].filter(Boolean).map(n).join(" · "),
                o = [
                  `Premium ${a(e.premium)}${e.freq ? " " + n(e.freq.toLowerCase()) : ""}`,
                  `Paid so far ${a(e.paid)}`,
                ];
              (e.sum && o.push(`Cover ${a(e.sum)}`), e.got && o.push(`Received ${a(e.got)}`));
              let s = "";
              if (e.value) {
                const t = Number(e.value) - e.paid + e.got;
                s = ` · Fund value ${a(e.value)} (<span style="color:${t >= 0 ? "var(--inc)" : "var(--exp)"}">${t >= 0 ? "+" : "−"}${a(Math.abs(t)).slice(0)}</span>)`;
              }
              return `<div class="hold"><div style="min-width:0"><div class="t">${n(e.name)}</div><div class="s">${t}</div></div><div class="r">${re(e) || "<small>No due date</small>"}</div><div class="full s" style="white-space:normal">${o.join(" · ")}${s}</div></div>`;
            })
            .join("")));
        const h = [...o.keys()].filter(
            (e) => !["stock", "mf", "ppf", "ssy", "insurance", "ulip"].includes(e),
          ),
          f = [];
        (h.forEach((e) => ce(e).forEach((t) => f.push(Object.assign(t, { k: e })))),
          (e("othCard").hidden = !f.length),
          (e("holdEmpty").hidden = !(t.length && !d.length && !u.length && !f.length)),
          (e("othList").innerHTML = f
            .map((e) => ((e.insts = [x(e.k).label, e.insts].filter(Boolean).join(" · ")), le(e, "units")))
            .join("")));
      })(),
      (function () {
        const t = new Set([y(c())]);
        U.forEach((e) => t.add(y(e.date)));
        const o = e("taxFy");
        ((o.innerHTML = [...t]
          .sort((e, t) => t - e)
          .map((e) => `<option value="${e}">${v(e)}</option>`)
          .join("")),
          (o.value = String(Ge)),
          (e("taxRegime").value = I.regime || ""),
          (e("taxRegimeNote").textContent =
            "new" === I.regime
              ? "Under the new regime, 80C, NPS extra and health insurance deductions don't reduce your tax. The totals below are for your information."
              : "old" === I.regime
                ? "Under the old regime, these investments reduce your taxable income up to the limits shown."
                : "The new regime is the default for salaried people unless you choose the old regime. Deductions below only reduce tax under the old regime."));
        const s = We(Ge);
        if (
          ((e("t80c").innerHTML = s.items
            .map(([e, t]) => `<div class="trow"><span>${e}</span><span class="num">${a(t)}</span></div>`)
            .join("")),
          document.activeElement !== e("tOther"))
        ) {
          const t = (I.other80c || {})[Ge];
          e("tOther").value = t ? String(t) : "";
        }
        ((e("t80cTot").textContent =
          `${a(Math.min(s.total, 15e4))} of ${a(15e4)} used` +
          (s.total > 15e4 ? ` (you invested ${a(s.total)})` : "")),
          (e("t80cLeft").textContent = s.total >= 15e4 ? "Limit reached" : a(15e4 - s.total) + " left"),
          (e("t80cFill").style.width = Math.min(100, s.total / 1500).toFixed(1) + "%"),
          (e("tNps").textContent = `${a(Math.min(s.nps, 5e4))}${s.nps > 5e4 ? " (limit reached)" : ""}`),
          (e("tHealth").textContent =
            `${a(Math.min(s.health, 25e3))}${s.health > 25e3 ? " (limit reached)" : ""}`));
        const i = Ve(Ge);
        e("cgTitle").textContent = "Capital gains " + v(Ge);
        const r = (e) =>
          `<span class="num" style="color:${e >= 0 ? "var(--inc)" : "var(--exp)"}">${e < 0 ? "−" : ""}${a(Math.abs(e))}</span>`;
        ((e("cgSum").innerHTML =
          i.rows.length || i.warn.length
            ? `<div class="trow"><span>Short-term gains, equity (20%)</span>${r(i.st)}</div><div class="trow"><span>Long-term gains, equity (12.5% above ₹1.25 lakh)</span>${r(i.lt)}</div>` +
              (i.debt ? `<div class="trow"><span>Debt fund gains (slab rate)</span>${r(i.debt)}</div>` : "") +
              `<div class="trow" style="border-top:1px solid var(--rule);padding-top:8px;font-weight:600"><span>Estimated tax on equity gains</span><span class="num">${a(i.tax)}</span></div>` +
              i.warn.map((e) => `<div class="hint" style="margin-top:6px">${n(e)}</div>`).join("")
            : '<div class="empty">No sales of stocks or mutual funds recorded in this year.</div>'),
          (e("cgList").innerHTML = i.rows
            .sort((e, t) => t.date.localeCompare(e.date))
            .map((e) => {
              const t = e.st + e.lt,
                o = e.debt
                  ? "Debt fund"
                  : e.lt && e.st
                    ? "Short + long term"
                    : e.lt
                      ? "Long term"
                      : "Short term";
              return `<div class="hold"><div style="min-width:0"><div class="t">${n(e.name)}</div><div class="s">Sold ${h(e.date)} for ${a(e.amount)} · ${o}</div></div><div class="r">${r(t)}<small>${t >= 0 ? "gain" : "loss"}</small></div></div>`;
            })
            .join("")));
      })(),
      e("v-itr").hidden || nt(),
      (function () {
        const t = e("acctList");
        t.innerHTML = "";
        const o = he();
        (o.length || (t.innerHTML = '<div class="empty">No accounts yet.</div>'),
          o.forEach((e) => {
            const o = document.createElement("div");
            if (
              ((o.className = "acct"),
              (o.innerHTML = `<div style="min-width:0"><div style="font-weight:600">${n(e.name)}</div><div class="k">${pe[e.kind] || ""} · started at ${a(e.opening)}</div></div><div class="b" style="color:${e.bal < 0 ? "var(--exp)" : "var(--ink)"}">${a(e.bal)}</div>`),
              !W && !M.some((t) => t.account === e.id))
            ) {
              const t = document.createElement("button");
              ((t.className = "ghost"),
                (t.textContent = "Remove"),
                (t.style.cssText = "justify-self:end;grid-column:2;padding:5px 10px"),
                (t.onclick = () => {
                  ((L = L.filter((t) => t.id !== e.id)), B(), X());
                }),
                o.appendChild(t));
            }
            t.appendChild(o);
          }),
          (e("acctTotal").textContent = a(o.reduce((e, t) => e + t.bal, 0))));
      })(),
      fe(e("fAcct")),
      ve(),
      (function (t, o) {
        const s = Ue(),
          i = Math.round(Ye());
        (document.activeElement !== e("pSalary") && (e("pSalary").value = I.salary ? String(I.salary) : ""),
          (e("pSalary").placeholder = i ? String(i) : "0"),
          (e("pSalaryHint").textContent =
            !I.salary && i
              ? `Using ${a(i)}, the average of your recent salary and stipend entries. Type a number to set your own.`
              : ""),
          (function (e, t, n, a, o, s) {
            ((e.innerHTML = ""),
              t.forEach((t) => {
                const a = document.createElement("button");
                ((a.type = "button"),
                  (a.textContent = N[t].label),
                  a.setAttribute("aria-pressed", t === n),
                  (a.onclick = () =>
                    ((e) => {
                      ((I.preset = e),
                        "custom" !== e &&
                          (I.pct = {
                            needs: N[e].needs,
                            wants: N[e].wants,
                            invest: N[e].invest,
                            emergency: N[e].emergency,
                          }),
                        q(),
                        Z());
                    })(t)),
                  e.appendChild(a));
              }));
          })(e("pPresets"), Object.keys(N), I.preset),
          je.forEach((t) => {
            const n = e("pp_" + t);
            (document.activeElement !== n && (n.value = I.pct[t]),
              (e("pa_" + t).textContent = a((s * I.pct[t]) / 100)));
          }));
        const r = je.reduce((e, t) => e + Number(I.pct[t] || 0), 0),
          d = e("pMsg");
        ((e("pHeroSal").textContent = s ? a(s) : "Not set"),
          [...e("pSplit").children].forEach(
            (e, t) => (e.style.width = (r ? (Number(I.pct[je[t]] || 0) / r) * 100 : 25) + "%"),
          ),
          (e("pHeroTxt").textContent = s
            ? `${I.pct.needs}% needs · ${I.pct.wants}% wants · ${I.pct.invest}% invest · ${I.pct.emergency}% emergency`
            : "Enter your salary below to build your plan."),
          (d.className = 100 === r ? "msg" : "msg err"),
          (d.textContent = 100 === r ? "" : `Your percentages add up to ${r}%. Make them total 100%.`),
          (e("pCmpTitle").textContent = u[V.getMonth()] + " " + V.getFullYear() + " vs plan"));
        const m = e("pCompare");
        if (s) {
          const e = t.filter((e) => "expense" === e.type),
            n = e.filter((e) => !Re(e.cat)).reduce((e, t) => e + t.amount, 0),
            i = e.filter((e) => Re(e.cat)).reduce((e, t) => e + t.amount, 0),
            r = He(t),
            c = o.income - o.expense - r,
            l = [
              ["Needs", n, I.pct.needs, "var(--exp)", 1],
              ["Wants", i, I.pct.wants, "var(--warn)", 1],
              ["Invested this month", r, I.pct.invest, "var(--inv)", 0],
              ["Left over for emergency fund", c, I.pct.emergency, "var(--inc)", 0],
            ];
          m.innerHTML = l
            .map(([e, t, n, o, i]) => {
              const r = (s * n) / 100,
                c = r ? Math.min(100, Math.max(0, (t / r) * 100)) : 0;
              let l;
              return (
                (l = i
                  ? t > r
                    ? `<span class="pill over">Over by ${a(t - r)}</span>`
                    : `<span class="pill ok">${a(r - t)} left</span>`
                  : t >= r
                    ? '<span class="pill ok">On track</span>'
                    : `<span class="pill soon">Short by ${a(r - t)}</span>`),
                `<div class="cmp" style="--c:${o}"><span class="t">${e}</span><span class="v">${a(t)}</span><div class="track" style="grid-column:1/-1"><div class="fill" style="width:${c.toFixed(1)}%"></div></div><div class="s"><span>Plan ${a(r)} (${n}% of salary) · actual ${s ? Math.round((t / s) * 100) : 0}%</span>${l}</div></div>`
              );
            })
            .join("");
        } else
          m.innerHTML =
            '<div class="empty">Enter your monthly salary above to compare your spending with your plan.</div>';
        const p = (function () {
          const e = Ue(),
            t =
              (function () {
                const e = {};
                U.filter((e) => "expense" === e.type && !Re(e.cat)).forEach((t) => {
                  const n = l(t.date);
                  e[n] = (e[n] || 0) + t.amount;
                });
                const t = Object.keys(e).sort().slice(-3);
                return t.length ? t.reduce((t, n) => t + e[n], 0) / t.length : 0;
              })() || (e * I.pct.needs) / 100,
            n = Math.round(t * Number(I.emMonths || 6)),
            a = he()
              .filter((e) => I.emAccts.includes(e.id))
              .reduce((e, t) => e + t.bal, 0);
          return { need: t, target: n, have: a, months: t ? a / t : 0 };
        })();
        ((e("emMonths").value = String(I.emMonths || 6)),
          (e("emTarget").textContent = a(p.target)),
          (e("emHave").textContent = a(p.have) + " saved"));
        const h = p.target ? Math.min(100, Math.max(0, (p.have / p.target) * 100)) : 0;
        ((e("emFill").style.width = h.toFixed(1) + "%"),
          (e("emPct").textContent = p.target ? Math.round(h) + "%" : ""));
        const f = (s * I.pct.emergency) / 100,
          g = p.target - p.have;
        ((e("emText").textContent = I.emAccts.length
          ? g <= 0
            ? `Done. You have ${p.months.toFixed(1)} months of essential expenses saved. Send your emergency share to investments now.`
            : `This covers ${p.months.toFixed(1)} months of essential expenses (about ${a(p.need)} a month).` +
              (f > 0
                ? ` Saving ${a(f)} a month, you'll reach the target in about ${Math.ceil(g / f)} months.`
                : "")
          : "Tick the account that holds your emergency money below. A separate savings account named Emergency fund works best."),
          (e("emAccts").innerHTML = G.length
            ? G.map(
                (e) =>
                  `<label><input type="checkbox" data-id="${n(e.id)}" ${I.emAccts.includes(e.id) ? "checked" : ""}>${n(e.name)}</label>`,
              ).join("")
            : '<span class="empty">Add an account first, under Accounts.</span>'));
        const w = e("pWants");
        ((w.innerHTML = ""),
          j("expense").forEach((e) => {
            const t = document.createElement("button");
            ((t.type = "button"),
              (t.textContent = e),
              t.setAttribute("aria-pressed", Re(e)),
              (t.onclick = () => {
                ((I.wants = Re(e)
                  ? I.wants.filter((t) => t.toLowerCase() !== e.toLowerCase())
                  : I.wants.concat(e)),
                  q(),
                  Z());
              }),
              w.appendChild(t));
          }),
          (function (t, o, s, i) {
            const r = [],
              l = (e, t) => r.push([e, t]);
            if (s) {
              const e = t.filter((e) => "expense" === e.type),
                n = e.filter((e) => !Re(e.cat)).reduce((e, t) => e + t.amount, 0),
                r = {};
              e.filter((e) => Re(e.cat)).forEach((e) => (r[e.cat] = (r[e.cat] || 0) + e.amount));
              const c = Object.values(r).reduce((e, t) => e + t, 0),
                d = Object.entries(r).sort((e, t) => t[1] - e[1])[0];
              (I.emAccts.length
                ? i.months < 3
                  ? l(
                      "bad",
                      `Your emergency fund covers only ${i.months.toFixed(1)} months. Build it to at least 3 months before increasing risky investments.`,
                    )
                  : i.have < i.target
                    ? l(
                        "info",
                        `Emergency fund: ${i.months.toFixed(1)} months covered. Keep adding until you reach ${I.emMonths} months.`,
                      )
                    : l(
                        "ok",
                        "Your emergency fund target is reached. Move that monthly share into investments.",
                      )
                : l(
                    "warn",
                    "Set up an emergency fund first: keep 3 to 6 months of essential expenses in a savings account, sweep FD or liquid fund. Don't keep it in stocks.",
                  ),
                n > (s * I.pct.needs) / 100 &&
                  l(
                    "bad",
                    `Essentials take ${Math.round((n / s) * 100)}% of your salary this month, above your ${I.pct.needs}% plan. Check rent, bills and food for savings.`,
                  ));
              const u = (s * I.pct.wants) / 100;
              c > u && d && l("warn", `Wants are ${a(c - u)} over plan. Biggest: ${d[0]} at ${a(d[1])}.`);
              const m = He(t),
                p = (s * I.pct.invest) / 100;
              if (
                (m < p
                  ? l(
                      "info",
                      `Invest ${a(p - m)} more this month to meet your plan. A monthly SIP on salary day makes this automatic.`,
                    )
                  : l("ok", `You invested ${a(m)} this month, meeting your ${I.pct.invest}% plan.`),
                o.income > 0)
              ) {
                const e = (o.income - o.expense) / o.income;
                e >= 0.3
                  ? l(
                      "ok",
                      `You saved or invested ${Math.round(100 * e)}% of this month's income. Excellent.`,
                    )
                  : e < 0.1 &&
                    l(
                      "bad",
                      `Only ${Math.max(0, Math.round(100 * e))}% of this month's income is left after spending. Try to keep at least 20%.`,
                    );
              }
            } else
              l(
                "warn",
                "Enter your monthly take-home salary at the top of this page to get a plan and personal guidance.",
              );
            const d = ie();
            (d.some((e) => /health/i.test(e.ptype || "")) ||
              l(
                "warn",
                "No health insurance recorded. A health or family floater policy protects your savings from a big hospital bill. Add it under Add → Investment → Insurance if you have one.",
              ),
              s &&
                !d.some((e) => /term/i.test(e.ptype || "")) &&
                l(
                  "info",
                  `If anyone depends on your income, consider a term plan. A common rule of thumb is cover of 10 to 15 times your yearly income, about ${a(12 * s * 10)} to ${a(12 * s * 15)}.`,
                ));
            const u = y(c()),
              m = We(u);
            ("old" === I.regime &&
              m.total < 15e4 &&
              l(
                "info",
                `${a(15e4 - m.total)} of your Section 80C limit is unused in ${v(u)}. PPF, ELSS or Sukanya Samriddhi deposits before 31 March can fill it.`,
              ),
              "" === I.regime &&
                l(
                  "info",
                  "Find out which tax regime you use. Under the new regime, 80C investments don't reduce your tax, so invest for your goals, not for tax.",
                ),
              (e("pTips").innerHTML = r
                .map(([e, t]) => `<li class="${e}"><span>${n(t)}</span></li>`)
                .join("")));
          })(t, o, s, p));
      })(i, r));
  }
  // Backup reminder: a small note after 14 days, and a banner on Overview after 30 days or when there is no backup.
  const BK_BANNER_DAYS = 30,
    BK_SNOOZE_DAYS = 7;
  function hasPortfolioData() {
    try {
      const p = JSON.parse(localStorage.getItem("pl_port") || "null");
      return !!(
        p &&
        Array.isArray(p.list) &&
        p.list.some((x) => (x.holdings && x.holdings.length) || (x.trades && x.trades.length))
      );
    } catch (e) {
      return !1;
    }
  }
  function ee() {
    const t = e("bkNote"),
      w = e("bkWarn");
    if (!t) return;
    let n = null,
      z = 0;
    try {
      ((n = +localStorage.getItem("pl_backup_at") || null), (z = +localStorage.getItem("pl_bk_snooze") || 0));
    } catch (e) {}
    const hasData = M.length > 0 || hasPortfolioData(),
      a = n ? Math.floor((Date.now() - n) / 864e5) : null;
    if (w) {
      const show = hasData && (null === a || a >= BK_BANNER_DAYS) && Date.now() > z;
      ((w.hidden = !show),
        show &&
          (e("bkWarnText").textContent =
            null === a
              ? "You have never saved a backup. If this phone is lost or Chrome data is cleared, your entries are gone."
              : `Your last backup was ${a} days ago. Save a new one to keep your recent entries safe.`));
    }
    if (!hasData) return void (t.textContent = "");
    if (null === a)
      return void (t.textContent = "You have no backup yet. Go to Accounts → Backup and tap Save backup.");
    t.textContent =
      a >= 14 ? `Your last backup was ${a} days ago. Save a new one from Accounts → Backup.` : "";
  }
  function te(t, o, s, i) {
    const r = e(t);
    if (((r.innerHTML = ""), !o.length)) return void (r.innerHTML = `<div class="empty">${i}</div>`);
    const c = o[0][1],
      l = o.reduce((e, t) => e + t[1], 0);
    o.forEach(([e, t]) => {
      const o = document.createElement("div");
      ((o.className = "bar-row"),
        o.style.setProperty("--c", s),
        (o.innerHTML = `<span>${n(e)}</span><span class="num">${a(t)} <span class="muted" style="font-size:.8em">${Math.round((t / l) * 100)}%</span></span><div class="track"><div class="fill" style="width:${((t / c) * 100).toFixed(1)}%"></div></div>`),
        r.appendChild(o));
    });
  }
  let ne = null;
  function ae() {
    const t = [...new Set(U.map((e) => y(e.date)))].sort((e, t) => t - e);
    if (!t.length)
      return (
        (e("yrSel").innerHTML = ""),
        (e("yTiles").innerHTML = ""),
        (e("yNote").textContent =
          "No entries yet. Import a statement or add entries to see a yearly summary."),
        (e("yTab").innerHTML = ""),
        (e("yInc").innerHTML = ""),
        void (e("yExp").innerHTML = "")
      );
    const n = y(c());
    (t.includes(ne) || (ne = t.includes(n) ? n : t[0]),
      (e("yrSel").innerHTML = t.map((e) => `<option value="${e}">${v(e)}</option>`).join("")),
      (e("yrSel").value = String(ne)));
    const o = U.filter((e) => y(e.date) === ne),
      s = z(o),
      i = s.income - s.expense - s.invest,
      r = [
        ["Income", s.income, "var(--inc)"],
        ["Spent", s.expense, "var(--exp)"],
        ["Invested (net)", s.invest, "var(--inv)"],
        ["Left over", i, i < 0 ? "var(--exp)" : "var(--ink)"],
      ];
    ((e("yTiles").innerHTML = r
      .map(
        ([e, t, n]) =>
          `<div class="ytile"><span class="tl">${e}</span><span class="num" style="color:${n}">${a(t)}</span></div>`,
      )
      .join("")),
      (e("yNote").textContent =
        s.income > 0
          ? `You kept ${Math.round(((s.income - s.expense) / s.income) * 100)}% of income after spending. ${v(ne)} runs from April to March.`
          : `No income recorded in ${v(ne)}.`));
    let d = "<tr><th>Month</th><th>Income</th><th>Spent</th><th>Invested</th><th>Left over</th></tr>";
    for (let e = 0; e < 12; e++) {
      const t = new Date(ne, 3 + e, 1),
        n = z(o.filter((e) => l(e.date) === J(t))),
        s = n.income - n.expense - n.invest;
      d += `<tr><td>${u[t.getMonth()]} ${t.getFullYear()}</td><td>${a(n.income)}</td><td>${a(n.expense)}</td><td>${a(n.invest)}</td><td style="color:${s < 0 ? "var(--exp)" : "inherit"}">${a(s)}</td></tr>`;
    }
    ((d += `<tr><th>Total</th><th>${a(s.income)}</th><th>${a(s.expense)}</th><th>${a(s.invest)}</th><th style="color:${i < 0 ? "var(--exp)" : "inherit"}">${a(i)}</th></tr>`),
      (e("yTab").innerHTML = d));
    const m = (e, t) => {
      const n = {};
      return (
        e.forEach((e) => {
          const a = t(e);
          n[a] = (n[a] || 0) + e.amount;
        }),
        Object.entries(n).sort((e, t) => t[1] - e[1])
      );
    };
    (te(
      "yInc",
      m(
        o.filter((e) => "income" === e.type),
        (e) => e.cat,
      ),
      "var(--inc)",
      "No income recorded this year.",
    ),
      te(
        "yExp",
        m(
          o.filter((e) => "expense" === e.type),
          (e) => e.cat,
        ),
        "var(--exp)",
        "No spending recorded this year.",
      ));
  }
  e("yrSel").addEventListener("change", (e) => {
    ((ne = +e.target.value), ae());
  });
  const oe = () => U.filter((e) => "invest" === e.type);
  function se(e, t) {
    const n = new Map();
    return (
      e.forEach((e) => {
        const a = t(e);
        (n.has(a) || n.set(a, []), n.get(a).push(e));
      }),
      n
    );
  }
  function ie() {
    const e = [];
    return (
      se(
        oe().filter((e) => x(e.kind).policy),
        (e) => e.kind + "|" + (e.name || "").toLowerCase(),
      ).forEach((t) => {
        t.sort((e, t) => e.date.localeCompare(t.date));
        const n = t.filter((e) => "out" === e.side),
          a = n[n.length - 1] || t[t.length - 1],
          o = (e) => {
            for (let n = t.length - 1; n >= 0; n--) if (t[n][e]) return t[n][e];
            return "";
          };
        e.push({
          kind: a.kind,
          name: a.name || x(a.kind).label,
          inst: o("inst"),
          ptype: o("ptype"),
          sum: o("sumAssured"),
          freq: a.freq || "",
          premium: a.amount,
          nextDue: a.nextDue || "",
          paid: n.reduce((e, t) => e + t.amount, 0),
          got: t.filter((e) => "in" === e.side).reduce((e, t) => e + t.amount, 0),
          value: o("fundValue"),
          count: n.length,
        });
      }),
      e
    );
  }
  function re(e) {
    if (!e.nextDue) return "";
    const t = g(e.nextDue);
    return t < 0
      ? `<span class="pill over">Overdue by ${-t} day${-1 === t ? "" : "s"}</span>`
      : 0 === t
        ? '<span class="pill over">Due today</span>'
        : t <= 30
          ? `<span class="pill soon">Due in ${t} day${1 === t ? "" : "s"}</span>`
          : `<span class="pill ok">Due ${h(e.nextDue)}</span>`;
  }
  function ce(e) {
    const t = [];
    return (
      se(
        oe().filter((t) => t.kind === e),
        (e) => (e.name || "Unnamed").toLowerCase(),
      ).forEach((e) => {
        const n = new Set();
        let a = "",
          o = 0,
          s = 0,
          i = 0,
          r = null;
        const c = [];
        [...e]
          .sort((e, t) => e.date.localeCompare(t.date) || (e.side === t.side ? 0 : "out" === e.side ? -1 : 1))
          .forEach((e) => {
            if (((a = e.name || "Unnamed"), e.inst && n.add(e.inst), "out" === e.side))
              return (
                (s += e.amount),
                void (e.qty > 0
                  ? ((o += Number(e.qty)), c.push({ qty: Number(e.qty), cpu: e.amount / e.qty }))
                  : c.push({ qty: 0, cost: e.amount }))
              );
            if (((i += e.amount), e.qty > 0)) {
              let t = Number(e.qty),
                n = 0;
              for (; t > 1e-9 && c.length;) {
                const e = c[0];
                if (!e.qty) {
                  c.shift();
                  continue;
                }
                const a = Math.min(t, e.qty);
                ((n += a * e.cpu), (e.qty -= a), (t -= a), e.qty <= 1e-9 && c.shift());
              }
              r = (r || 0) + (e.amount - n);
            }
          });
        const l = o > 0,
          d = c.reduce((e, t) => e + (t.qty || 0), 0),
          u = c.reduce((e, t) => e + (t.qty ? t.qty * t.cpu : 0), 0),
          m = l ? u : Math.max(0, s - i);
        t.push({
          name: a,
          insts: [...n].join(", "),
          held: d,
          avg: d ? u / d : 0,
          invested: m,
          realised: l ? r : null,
          hasQty: l,
          count: e.length,
        });
      }),
      t.sort((e, t) => t.invested - e.invested)
    );
  }
  function le(e, t) {
    const i = e.hasQty
        ? `${a(e.invested)}<small>${o(e.held)} ${t} · avg ${s(e.avg)}</small>`
        : `${a(e.invested)}<small>${e.count} entr${1 === e.count ? "y" : "ies"}</small>`,
      r =
        null != e.realised
          ? `<div class="full s">Realised ${e.realised >= 0 ? "profit" : "loss"}: <span class="num" style="color:${e.realised >= 0 ? "var(--inc)" : "var(--exp)"}">${a(Math.abs(e.realised))}</span></div>`
          : "";
    return `<div class="hold"><div style="min-width:0"><div class="t">${n(e.name)}</div><div class="s">${n(e.insts || "—")}</div></div><div class="r">${i}</div>${r}</div>`;
  }
  let de = "all",
    ue = "",
    me = null;
  const pe = {
    bank: "Bank",
    cash: "Cash",
    wallet: "UPI / Wallet",
    card: "Credit card",
    demat: "Demat / Broker",
  };
  function he() {
    return G.map((e) => {
      let t = Number(e.opening) || 0;
      return (
        U.forEach((n) => {
          n.account === e.id && (t += Q(n));
        }),
        Object.assign({}, e, { bal: t })
      );
    });
  }
  function fe(e, t) {
    const n = e.value;
    if (
      ((e.innerHTML = ""),
      (L.length
        ? L
        : [
            { id: "__bank", name: "Bank account" },
            { id: "__cash", name: "Cash" },
          ]
      ).forEach((t) => {
        const n = document.createElement("option");
        ((n.value = t.id), (n.textContent = t.name), e.appendChild(n));
      }),
      t)
    ) {
      const t = document.createElement("option");
      ((t.value = "__import"), (t.textContent = "New account: Imported"), e.appendChild(t));
    }
    [...e.options].some((e) => e.value === n) && (e.value = n);
  }
  async function ye(e) {
    if (L.length) return e;
    const t = { id: d(), name: "Bank account", kind: "bank", opening: 0 },
      n = { id: d(), name: "Cash", kind: "cash", opening: 0 };
    return (L.push(t, n), B(), "__cash" === e ? n.id : t.id);
  }
  function ve() {
    const t = e("catManage"),
      a = { expense: "Expense categories", income: "Income sources", invest: "Investment types" },
      o = ["expense", "income", "invest"]
        .filter((e) => E[e].length)
        .map(
          (e) =>
            `<div><div class="label" style="margin-bottom:6px">${a[e]}</div><div class="mycat">${E[e].map((t, a) => `<span>${n(t)}<button type="button" aria-label="Remove ${n(t)}" data-t="${e}" data-i="${a}">×</button></span>`).join("")}</div></div>`,
        );
    t.innerHTML = o.length ? o.join("") : '<div class="empty">You haven\'t added any categories yet.</div>';
  }
  (e("catManage").addEventListener("click", (t) => {
    const n = t.target.closest("button[data-t]");
    if (!n) return;
    const a = n.dataset.t,
      o = E[a][+n.dataset.i];
    (E[a].splice(+n.dataset.i, 1),
      O(),
      (e("catMsg").className = "msg"),
      (e("catMsg").textContent = `Removed ${o}. Past entries keep their category.`),
      ge === a && Ce(a),
      ve());
  }),
    (e("cAdd").onclick = () => {
      const t = e("cType").value,
        n = Y(t, e("cName").value),
        a = e("catMsg");
      if (n.err) return ((a.className = "msg err"), void (a.textContent = n.err));
      ((a.className = "msg"),
        (a.textContent = n.existing
          ? `${"invest" === t ? x(n.val).label : n.val} is already in the list.`
          : `Added ${e("cName").value.trim()}.`),
        (e("cName").value = ""),
        ge === t && Ce(t),
        ve());
    }));
  let ge = "expense",
    we = null,
    be = "stock",
    xe = 0;
  function ke(e, t, a, o, s, i, r) {
    ((e.innerHTML =
      a.map((e) => `<option value="${n(e)}">${n(s(e))}</option>`).join("") +
      '<option value="__new">+ Add new…</option>'),
      (e.value = o),
      (e.onchange = () => {
        "__new" === e.value
          ? ((e.value = o),
            (function (e, t) {
              ((e.hidden = !1),
                (e.innerHTML =
                  '<input maxlength="30" placeholder="Name of the new one" aria-label="New name"><button type="button" class="primary">Add</button><button type="button" class="ghost" aria-label="Cancel">✕</button>'));
              const n = e.querySelector("input"),
                [a, o] = e.querySelectorAll("button");
              n.focus();
              const s = () => {
                const a = t(n.value);
                a && a.err
                  ? (n.setCustomValidity(a.err),
                    n.reportValidity(),
                    setTimeout(() => n.setCustomValidity(""), 1500))
                  : ((e.hidden = !0), (e.innerHTML = ""));
              };
              ((a.onclick = s),
                (n.onkeydown = (e) => {
                  ("Enter" === e.key && (e.preventDefault(), s()), "Escape" === e.key && o.click());
                }),
                (o.onclick = () => {
                  ((e.hidden = !0), (e.innerHTML = ""));
                }));
            })(t, r))
          : i(e.value);
      }));
  }
  function Ce(t) {
    if (
      ((ge = t),
      document
        .querySelectorAll("#typeSeg button")
        .forEach((e) => e.setAttribute("aria-pressed", e.dataset.t === t)),
      (e("acctLbl").textContent = C[t].acct),
      (e("saveBtn").textContent = "Save " + C[t].word.toLowerCase()),
      (e("catField").hidden = "invest" === t),
      (e("invBox").hidden = "invest" !== t),
      "invest" === t)
    )
      return void Se();
    ((e("policyBox").hidden = !0), (e("limitHint").hidden = !0), (e("amtLbl").textContent = "Amount (₹)"));
    const n = j(t);
    (n.includes(we) || (we = n[0]),
      (e("catLbl").textContent = C[t].cat),
      ke(
        e("fCat"),
        e("catNew"),
        n,
        we,
        (e) => e,
        (e) => {
          we = e;
        },
        (e) => {
          const n = Y(t, e);
          if (n.err) return n;
          ((we = n.val), Ce(t), ve());
        },
      ));
  }
  function Se() {
    const t = H();
    (t.includes(be) || (be = "stock"),
      ke(
        e("fKind"),
        e("kindNew"),
        t,
        be,
        (e) => x(e).label,
        (t) => {
          (t !== be && ((e("fInst").value = ""), (e("fName").value = "")), (be = t), (xe = 0), Se());
        },
        (e) => {
          const t = Y("invest", e);
          if (t.err) return t;
          ((be = t.val), (xe = 0), Se(), ve());
        },
      ));
    const a = x(be);
    xe >= a.sides.length && (xe = 0);
    const o = e("sideSeg");
    (o.style.setProperty("--n", a.sides.length),
      (o.innerHTML = ""),
      a.sides.forEach((e, t) => {
        const n = document.createElement("button");
        ((n.type = "button"),
          (n.textContent = e[0]),
          n.setAttribute("aria-pressed", t === xe),
          (n.onclick = () => {
            ((xe = t), Se());
          }),
          o.appendChild(n));
      }));
    const s = a.sides[xe];
    if (
      ((e("fNameLbl").textContent = a.name + (a.nameReq ? "" : " (optional)")),
      (e("fInstLbl").textContent = a.inst + (a.instReq ? "" : " (optional)")),
      (e("qtyRow").hidden = !a.qty),
      a.qty &&
        ((e("fQtyLbl").textContent = a.qty + " (optional)"), (e("fPriceLbl").textContent = a.price + " (₹)")),
      (e("amtLbl").textContent = "in" === s[1] ? "Amount received (₹)" : "Amount (₹)"),
      (e("acctLbl").textContent = "in" === s[1] ? "Received in" : "Paid from"),
      (e("saveBtn").textContent = "Save " + s[0].toLowerCase()),
      (e("policyBox").hidden = !(a.policy && "out" === s[1])),
      (e("ptypeField").hidden = !a.ptypes),
      (e("fundField").hidden = !a.fund),
      (e("ftypeField").hidden = "mf" !== be),
      a.ptypes)
    ) {
      const t = e("fPType"),
        n = t.value;
      ((t.innerHTML = a.ptypes.map((e) => `<option>${e}</option>`).join("")),
        a.ptypes.includes(n) && (t.value = n));
    }
    const i = U.filter((e) => "invest" === e.type && e.kind === be);
    ((e("dlName").innerHTML = [...new Set(i.map((e) => e.name).filter(Boolean))]
      .map((e) => `<option value="${n(e)}">`)
      .join("")),
      (e("dlInst").innerHTML = [...new Set(i.map((e) => e.inst).filter(Boolean))]
        .map((e) => `<option value="${n(e)}">`)
        .join("")),
      $e());
  }
  function $e() {
    const t = e("limitHint");
    if ("invest" !== ge || !x(be).limit || "out" !== x(be).sides[xe][1]) return void (t.hidden = !0);
    const n = x(be),
      o = y(e("fDate").value || c()),
      s = e("fName").value.trim().toLowerCase(),
      i = U.filter(
        (e) =>
          "invest" === e.type &&
          e.kind === be &&
          "out" === e.side &&
          y(e.date) === o &&
          (!s || (e.name || "").toLowerCase() === s),
      ).reduce((e, t) => e + t.amount, 0);
    ((t.hidden = !1),
      (t.textContent = `${v(o)}: ${a(i)} deposited${s ? " in this account" : ""}. You can deposit up to ${a(n.limit)} a year, so ${a(Math.max(0, n.limit - i))} is left.`));
  }
  function Me() {
    const t = i(e("fQty").value),
      n = i(e("fPrice").value);
    t > 0 && n > 0 && (e("fAmt").value = String(Math.round(t * n * 100) / 100));
  }
  (e("fQty").addEventListener("input", Me),
    e("fPrice").addEventListener("input", Me),
    e("fName").addEventListener("input", $e),
    e("fDate").addEventListener("change", $e),
    e("typeSeg").addEventListener("click", (e) => {
      e.target.dataset.t && Ce(e.target.dataset.t);
    }),
    e("txForm").addEventListener("submit", (t) => {
      t.preventDefault();
      const n = e("formMsg");
      n.className = "msg";
      const o = (e, t) => {
        ((n.className = "msg err"), (n.textContent = e), t && t.focus());
      };
      let s = i(e("fAmt").value);
      const r = e("fDate").value || c(),
        l = { id: d(), type: ge, date: r, note: e("fNote").value.trim(), created: Date.now() };
      if ("invest" === ge) {
        const t = x(be),
          n = t.sides[xe],
          a = e("fName").value.trim(),
          c = e("fInst").value.trim();
        if (t.nameReq && !a) return o(`Enter the ${t.name.toLowerCase()}.`, e("fName"));
        if (t.instReq && !c) return o(`Enter the ${t.inst.toLowerCase()} name.`, e("fInst"));
        const d = i(e("fQty").value),
          u = i(e("fPrice").value);
        if (
          (!(s > 0) && d > 0 && u > 0 && (s = Math.round(d * u * 100) / 100),
          Object.assign(l, { kind: be, cat: t.label, side: n[1], action: n[0], name: a, inst: c }),
          t.qty && (d > 0 && (l.qty = d), u > 0 && (l.price = u)),
          "mf" === be && (l.ftype = e("fFtype").value),
          t.policy && "out" === n[1])
        ) {
          t.ptypes && (l.ptype = e("fPType").value);
          const n = i(e("fSum").value);
          (n > 0 && (l.sumAssured = n), (l.freq = e("fFreq").value));
          const a = { Monthly: 1, Quarterly: 3, "Half-yearly": 6, Yearly: 12 };
          if (((l.nextDue = e("fDue").value || (a[l.freq] ? f(r, a[l.freq]) : "")), t.fund)) {
            const t = i(e("fValue").value);
            t > 0 && (l.fundValue = t);
          }
        }
      } else l.cat = we;
      if (!(s > 0)) return o("Enter an amount greater than 0.", e("fAmt"));
      ((l.amount = Math.round(100 * s) / 100),
        ye(e("fAcct").value).then((t) => {
          if (((l.account = t), M.push(l), !_()))
            return (M.pop(), o("Couldn't save. Your phone storage may be full."));
          ((n.textContent = `Saved ${a(l.amount)} · ${"invest" === l.type ? (l.name || l.cat) + " " + l.action.toLowerCase() : l.cat}`),
            ["fAmt", "fNote", "fName", "fQty", "fPrice", "fSum", "fDue", "fValue"].forEach(
              (t) => (e(t).value = ""),
            ));
          const s = p(r);
          ((V = new Date(s.getFullYear(), s.getMonth(), 1)), X(), "invest" === ge && Se());
        }));
    }),
    e("acctForm").addEventListener("submit", (t) => {
      t.preventDefault();
      const n = e("acctMsg");
      n.className = "msg";
      const a = e("aName").value.trim();
      if (!a) return ((n.className = "msg err"), void (n.textContent = "Give the account a name."));
      (L.push({
        id: d(),
        name: a,
        kind: e("aKind").value,
        opening: i(e("aOpen").value),
        created: Date.now(),
      }),
        B(),
        (n.textContent = "Added " + a),
        (e("aName").value = ""),
        (e("aOpen").value = ""),
        X());
    }));
  let Le = null;
  function Ee() {
    return window.XLSX
      ? Promise.resolve(window.XLSX)
      : (Le ||
          (Le = new Promise((e, t) => {
            const n = document.createElement("script");
            ((n.src = "xlsx.full.min.js"),
              (n.onload = () => e(window.XLSX)),
              (n.onerror = () => {
                ((Le = null), t(new Error("load")));
              }),
              document.head.appendChild(n));
          })),
        Le);
  }
  const Te = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Account",
    "Note",
    "Investment Type",
    "Name",
    "Broker / Institution",
    "Action",
    "Quantity",
    "Price / NAV",
    "Sum Assured",
    "Premium Frequency",
    "Next Due Date",
    "Policy Type",
    "Fund Type",
  ];
  function Ne(e) {
    const t = "invest" === e.type;
    return [
      e.date,
      C[e.type].word,
      t ? "" : e.cat,
      e.amount,
      K(e.account),
      e.note || "",
      t ? x(e.kind).label : "",
      e.name || "",
      e.inst || "",
      t ? e.action : "",
      e.qty || "",
      e.price || "",
      e.sumAssured || "",
      e.freq || "",
      e.nextDue || "",
      e.ptype || "",
      "mf" === e.kind ? k(e) : "",
    ];
  }
  ((e("expBtn").onclick = () => {
    try {
      (localStorage.setItem("pl_backup_at", String(Date.now())), ee());
    } catch (e) {}
    !(function (e, t) {
      const n = document.createElement("a");
      ((n.href = URL.createObjectURL(t)),
        (n.download = e),
        document.body.appendChild(n),
        n.click(),
        setTimeout(() => {
          (URL.revokeObjectURL(n.href), n.remove());
        }, 1e3));
    })(
      "paisa-ledger-backup-" + c() + ".json",
      new Blob(
        [
          JSON.stringify(
            {
              app: "paisa-ledger",
              v: 4,
              txns: M,
              accounts: L,
              custom: E,
              plan: I,
              port: window.plPortfolio ? window.plPortfolio.data() : void 0,
            },
            null,
            1,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const t = e("bkMsg");
    ((t.className = "msg"), (t.textContent = "Backup saved to your Downloads."));
  }),
    (e("xlsxBtn").onclick = async () => {
      const t = e("bkMsg");
      if (((t.className = "msg"), !M.length))
        return ((t.className = "msg err"), void (t.textContent = "There are no entries to export yet."));
      try {
        const e = await Ee(),
          n = e.utils.book_new(),
          a = [Te].concat([...M].sort((e, t) => e.date.localeCompare(t.date)).map(Ne)),
          o = e.utils.aoa_to_sheet(a);
        ((o["!cols"] = Te.map((e) => ({ wch: Math.max(10, e.length + 2) }))),
          e.utils.book_append_sheet(n, o, "Entries"));
        const s = e.utils.aoa_to_sheet(
          [["Account", "Type", "Opening balance", "Current balance"]].concat(
            he().map((e) => [
              e.name,
              pe[e.kind] || "",
              Number(e.opening) || 0,
              Math.round(100 * e.bal) / 100,
            ]),
          ),
        );
        e.utils.book_append_sheet(n, s, "Accounts");
        const i = y(c()),
          r = We(i),
          l = Ve(i),
          d = [
            ["Tax summary " + v(i)],
            ["Estimate only. Check with your CA before filing."],
            [],
            ["Section 80C (Section 123)", "Amount"],
          ].concat(r.items, [
            ["Total 80C", r.total],
            ["Allowed (max 1,50,000)", Math.min(r.total, 15e4)],
            [],
            ["NPS extra (old 80CCD(1B), max 50,000)", r.nps],
            ["Health insurance (old 80D)", r.health],
            [],
            ["Capital gains", "Amount"],
            ["Short-term equity (20%)", Math.round(l.st)],
            ["Long-term equity (12.5% above 1,25,000)", Math.round(l.lt)],
            ["Debt fund gains (slab rate)", Math.round(l.debt)],
            ["Estimated tax on equity gains", Math.round(l.tax)],
          ]);
        (e.utils.book_append_sheet(n, e.utils.aoa_to_sheet(d), "Tax summary"),
          e.writeFile(n, "paisa-ledger-" + c() + ".xlsx"),
          (t.textContent = "Excel file saved to your Downloads."));
      } catch (e) {
        ((t.className = "msg err"),
          (t.textContent = "Couldn't create the Excel file. Connect to the internet once, then try again."));
      }
    }),
    (e("impFile").onchange = (t) => {
      const n = t.target.files[0];
      if (!n) return;
      const a = new FileReader(),
        o = e("bkMsg");
      ((a.onload = () => {
        try {
          const e = JSON.parse(a.result);
          if ("paisa-ledger" !== e.app || !Array.isArray(e.txns) || !Array.isArray(e.accounts)) throw 0;
          ((M = e.txns.map(D)),
            (L = e.accounts),
            e.custom &&
              (E = {
                expense: e.custom.expense || [],
                income: e.custom.income || [],
                invest: e.custom.invest || [],
              }),
            e.plan && ((I = Object.assign(F(), e.plan)), q()));
          const pc = e.port && window.plPortfolio ? window.plPortfolio.replace(e.port) : 0;
          (_(),
            B(),
            O(),
            Ce(ge),
            X(),
            (o.className = "msg"),
            (o.textContent =
              `Restored ${M.length} entries and ${L.length} accounts` +
              (pc ? ` and ${pc} portfolio${1 === pc ? "" : "s"}.` : ".") +
              (e.port
                ? ""
                : " This older backup has no Portfolio data, so your portfolios were left as they are.")));
        } catch (e) {
          ((o.className = "msg err"), (o.textContent = "That file isn't a Paisa Ledger backup."));
        }
        t.target.value = "";
      }),
        a.readAsText(n));
    }),
    (e("mergeFile").onchange = (t) => {
      const n = t.target.files[0];
      if (!n) return;
      const a = new FileReader(),
        o = e("bkMsg");
      ((a.onload = () => {
        try {
          const e = JSON.parse(a.result);
          if ("paisa-ledger" !== e.app || !Array.isArray(e.txns) || !Array.isArray(e.accounts)) throw 0;
          const t = new Set(M.map((e) => e.id)),
            n = (e) =>
              [
                e.date,
                e.type,
                Math.round(100 * e.amount),
                (e.note || e.name || "").toLowerCase().slice(0, 40),
              ].join("|"),
            s = new Set(M.map(n));
          let i = 0,
            r = 0;
          e.txns.map(D).forEach((e) => {
            t.has(e.id) || s.has(n(e)) ? r++ : (t.add(e.id), s.add(n(e)), M.push(e), i++);
          });
          const c = new Set(L.map((e) => e.id));
          let l = 0;
          (e.accounts.forEach((e) => {
            c.has(e.id) || (c.add(e.id), L.push(e), l++);
          }),
            e.custom &&
              ["expense", "income", "invest"].forEach((t) => {
                (e.custom[t] || []).forEach((e) => {
                  E[t].includes(e) || E[t].push(e);
                });
              }),
            _(),
            B(),
            O(),
            Ce(ge),
            X());
          const pm = e.port && window.plPortfolio ? window.plPortfolio.merge(e.port) : 0;
          ((o.className = "msg"),
            (o.textContent =
              `Merged ${i} new entries and ${l} accounts` +
              (pm ? ` and ${pm} portfolio${1 === pm ? "" : "s"}` : "") +
              `. ${r} already here were kept as they are.`));
        } catch (e) {
          ((o.className = "msg err"), (o.textContent = "That file isn't a Paisa Ledger backup."));
        }
        t.target.value = "";
      }),
        a.readAsText(n));
    }));
  const Ae = {
      date: [
        "date",
        "txndate",
        "transactiondate",
        "tradedate",
        "valuedate",
        "postingdate",
        "orderdate",
        "trandate",
        "entrydate",
        "paymentdate",
        "dateoftransaction",
      ],
      type: [
        "type",
        "entrytype",
        "transactiontype",
        "txntype",
        "drcr",
        "crdr",
        "debitcredit",
        "incomeexpense",
      ],
      category: [
        "category",
        "source",
        "head",
        "subcategory",
        "expensecategory",
        "incomesource",
        "expensetype",
        "expensehead",
      ],
      amount: [
        "amount",
        "amt",
        "value",
        "amountrs",
        "amountinr",
        "rs",
        "inr",
        "total",
        "netamount",
        "tradevalue",
        "transactionamount",
        "amountrupees",
        "totalamount",
      ],
      debit: [
        "debit",
        "withdrawal",
        "withdrawalamt",
        "withdrawalamount",
        "debitamount",
        "dr",
        "paidout",
        "withdrawals",
        "debitamt",
        "withdrawalamountinr",
        "debitinr",
      ],
      credit: [
        "credit",
        "deposit",
        "depositamt",
        "depositamount",
        "creditamount",
        "cr",
        "paidin",
        "deposits",
        "creditamt",
        "depositamountinr",
        "creditinr",
      ],
      account: ["account", "accountname", "paidfrom", "receivedin", "paymentmode", "paymentmethod", "wallet"],
      note: [
        "note",
        "notes",
        "description",
        "narration",
        "remarks",
        "remark",
        "details",
        "particulars",
        "memo",
        "transactiondetails",
        "transactionremarks",
      ],
      kind: [
        "investmenttype",
        "instrumenttype",
        "instrument",
        "assettype",
        "assetclass",
        "product",
        "producttype",
        "investment",
      ],
      name: [
        "name",
        "stockname",
        "stock",
        "symbol",
        "scrip",
        "scripname",
        "company",
        "companyname",
        "fundname",
        "scheme",
        "schemename",
        "policyname",
        "plan",
        "planname",
        "security",
        "accountholder",
        "holder",
      ],
      inst: [
        "broker",
        "brokername",
        "brokerinstitution",
        "platform",
        "amc",
        "insurer",
        "insurancecompany",
        "institution",
        "bank",
        "bankname",
        "postoffice",
        "provider",
      ],
      action: ["action", "side", "buysell", "ordertype", "tradetype", "transaction"],
      qty: ["quantity", "qty", "units", "shares", "noofshares", "noofunits", "unitsallotted"],
      price: [
        "price",
        "rate",
        "nav",
        "pricenav",
        "priceperunit",
        "avgprice",
        "tradeprice",
        "buyprice",
        "pricepershare",
        "navrs",
      ],
      sum: ["sumassured", "cover", "coveramount", "suminsured"],
      freq: ["frequency", "premiumfrequency", "paymentfrequency", "premiummode"],
      due: ["nextdue", "duedate", "nextduedate", "renewaldate", "nextpremiumdate", "nextpremiumduedate"],
      ptype: ["policytype", "insurancetype", "plantype"],
      ftype: ["fundtype", "fundcategory", "schemetype"],
    },
    Ie = (e) =>
      String(e ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
  function Fe(e) {
    const t = {},
      n = new Set();
    e.forEach((e, a) => {
      const o = Ie(e);
      if (o)
        for (const e in Ae)
          if (null == t[e] && Ae[e].includes(o)) {
            ((t[e] = a), n.add(a));
            break;
          }
    });
    const a = (a, o) => {
      null == t[a] &&
        e.forEach((e, s) => {
          const i = Ie(e);
          null == t[a] && !n.has(s) && i && o(i) && ((t[a] = s), n.add(s));
        });
    };
    return (
      a("date", (e) => e.includes("date") && !/due|birth|next|renew|maturity/.test(e)),
      a("debit", (e) => /debit|withdraw/.test(e)),
      a("credit", (e) => /credit|deposit/.test(e)),
      a("amount", (e) => e.includes("amount")),
      a("note", (e) => /narration|description|remark|particular/.test(e)),
      t
    );
  }
  function Pe(e) {
    if (null == e || "" === e) return null;
    if (e instanceof Date && !isNaN(e)) return r(e);
    if ("number" == typeof e) {
      if (e > 2e4 && e < 8e4) {
        const n = new Date(Math.round(864e5 * (e - 25569)));
        return n.getUTCFullYear() + "-" + t(n.getUTCMonth() + 1) + "-" + t(n.getUTCDate());
      }
      return null;
    }
    let n = String(e)
      .trim()
      .replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*[ap]m)?$/i, "")
      .trim();
    const a = (e) => {
        const t = u.findIndex((t) => t.toLowerCase() === e.slice(0, 3).toLowerCase());
        return t < 0 ? null : t + 1;
      },
      o = (e, n, a) => (
        (e = ((e) => ((e = +e) < 100 ? 2e3 + e : e))(e)),
        (a = +a),
        (n = +n) >= 1 && n <= 12 && a >= 1 && a <= 31 && e > 1990 && e < 2100
          ? e + "-" + t(n) + "-" + t(a)
          : null
      );
    let s;
    if ((s = n.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) return o(s[1], s[2], s[3]);
    if ((s = n.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/))) {
      let e = +s[1],
        t = +s[2];
      return (t > 12 && e <= 12 && ([e, t] = [t, e]), o(s[3], t, e));
    }
    return (s = n.match(/^(\d{1,2})[-\/ .]?([A-Za-z]{3,9})[-\/ .,]*(\d{2,4})$/))
      ? a(s[2])
        ? o(s[3], a(s[2]), s[1])
        : null
      : (s = n.match(/^([A-Za-z]{3,9})[ .-]?(\d{1,2}),?[ -](\d{2,4})$/)) && a(s[1])
        ? o(s[3], a(s[1]), s[2])
        : null;
  }
  function De(e) {
    if (null == e || "" === e) return { v: 0 };
    if ("number" == typeof e) return { v: Math.abs(e), neg: e < 0 };
    let t = String(e).trim(),
      n = !1,
      a = !1,
      o = !1;
    (/\bdr\.?$/i.test(t) && ((a = !0), (t = t.replace(/dr\.?$/i, ""))),
      /\bcr\.?$/i.test(t) && ((o = !0), (t = t.replace(/cr\.?$/i, ""))),
      /^\(.*\)$/.test(t) && ((n = !0), (t = t.slice(1, -1))),
      (t = t.replace(/₹|rs\.?|inr|,|\s/gi, "")),
      t.startsWith("-") && ((n = !0), (t = t.slice(1))));
    const s = parseFloat(t);
    return isFinite(s) ? { v: Math.abs(s), neg: n, dr: a, cr: o } : { v: 0 };
  }
  const qe = [
      [
        /swiggy|zomato|restaurant|cafe|food|hotel|dominos|pizza|mess|canteen|bakery|blinkit|zepto|grocery|bigbasket|dmart/,
        "Food",
      ],
      [
        /uber|ola|rapido|irctc|railway|metro|petrol|fuel|diesel|redbus|fastag|indianoil|hpcl|bpcl/,
        "Transport",
      ],
      [/amazon|flipkart|myntra|ajio|meesho|nykaa|mall|store|mart/, "Shopping"],
      [
        /electric|recharge|jio|airtel|\bvi\b|vodafone|bsnl|broadband|wifi|gas|water|bill|dth|tatasky/,
        "Bills",
      ],
      [/\brent\b|landlord|\bpg\b|hostel/, "Rent"],
      [/pharma|medic|hospital|clinic|apollo|doctor|lab|1mg|netmeds/, "Health"],
      [/college|school|tuition|fees|course|udemy|coursera|book/, "Education"],
      [/netflix|spotify|hotstar|prime|movie|bookmyshow|pvr|inox|youtube/, "Entertainment"],
      [/flight|indigo|airindia|makemytrip|goibibo|oyo|trip/, "Travel"],
    ],
    _e = [
      [/salary|sal\b|payroll/, "Salary"],
      [/stipend|scholarship|fellowship/, "Stipend"],
      [/dividend|\bdiv\b/, "Dividend"],
      [/interest|\bint\b|int\.pd/, "Interest"],
      [/rent/, "Rental"],
      [/refund|cashback/, "Other"],
    ];
  function Be(e, t) {
    const n = String(t || "").toLowerCase();
    for (const [t, a] of "income" === e ? _e : qe) if (t.test(n)) return a;
    return "Other";
  }
  let Oe = null;
  ((e("tplBtn").onclick = async () => {
    const t = e("impMsg");
    t.className = "msg";
    try {
      const e = await Ee(),
        n = e.utils.book_new(),
        a = c(),
        o = (e) => r(new Date(Date.now() - 864e5 * e)),
        s = [
          Te,
          [
            o(9),
            "Income",
            "Salary",
            42e3,
            "Bank account",
            "October salary",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ],
          [o(8), "Expense", "Food", 3200, "UPI wallet", "Mess bill", "", "", "", "", "", "", "", "", "", ""],
          [o(7), "Income", "Dividend", 640, "Bank account", "", "", "", "", "", "", "", "", "", "", ""],
          [
            o(6),
            "Investment",
            "",
            7e3,
            "Bank account",
            "",
            "Stocks",
            "TCS",
            "Zerodha",
            "Buy",
            2,
            3500,
            "",
            "",
            "",
            "",
          ],
          [
            o(5),
            "Investment",
            "",
            3e3,
            "Bank account",
            "Monthly SIP",
            "Mutual Fund",
            "Example Flexi Cap Fund",
            "Groww",
            "SIP",
            36.5,
            82.19,
            "",
            "",
            "",
            "",
            "Equity",
          ],
          [
            o(4),
            "Investment",
            "",
            2e3,
            "Bank account",
            "",
            "PPF",
            "Self",
            "SBI",
            "Deposit",
            "",
            "",
            "",
            "",
            "",
            "",
          ],
          [
            o(3),
            "Investment",
            "",
            1e3,
            "Bank account",
            "",
            "Sukanya Samriddhi",
            "Daughter's name",
            "Post office",
            "Deposit",
            "",
            "",
            "",
            "",
            "",
            "",
          ],
          [
            o(2),
            "Investment",
            "",
            9800,
            "Bank account",
            "",
            "Insurance",
            "Term plan",
            "Example Life",
            "Premium",
            "",
            "",
            1e7,
            "Yearly",
            "",
            "Term",
          ],
          [
            a,
            "Investment",
            "",
            5e3,
            "Bank account",
            "",
            "ULIP",
            "Example ULIP",
            "Example Life",
            "Premium",
            "",
            "",
            "",
            "Monthly",
            "",
            "",
          ],
        ],
        i = e.utils.aoa_to_sheet(s);
      ((i["!cols"] = Te.map((e) => ({ wch: Math.max(12, e.length + 2) }))),
        e.utils.book_append_sheet(n, i, "Entries"));
      const l = [
        ["How to fill this template"],
        [""],
        ["Date", "Any date format works, e.g. 15-10-2026 or 2026-10-15."],
        ["Type", "Expense, Income or Investment."],
        ["Category", "For expenses and income. A new name becomes your own category."],
        [
          "Amount",
          "In rupees. For stocks and funds you can leave it empty and fill Quantity and Price instead.",
        ],
        [
          "Account",
          "Bank account, Cash, UPI wallet or your own account name. New names become new accounts.",
        ],
        [
          "Investment Type",
          "Stocks, Mutual Fund, PPF, Sukanya Samriddhi, Insurance, ULIP, Fixed Deposit, Gold, NPS, Crypto, Other, or your own type.",
        ],
        ["Name", "Stock name, fund name, policy name or account holder."],
        ["Broker / Institution", "Broker, platform, insurer, bank or post office."],
        ["Action", "Buy, Sell, SIP, Redeem, Deposit, Withdrawal, Premium."],
        ["Premium Frequency", "Monthly, Quarterly, Half-yearly, Yearly or Single."],
        [
          "Policy Type",
          "For insurance: Term, Health, Life / Endowment, Vehicle or Other. Used for tax saving.",
        ],
        ["Fund Type", "For mutual funds: Equity, ELSS, Debt or Hybrid. ELSS counts for 80C."],
        [""],
        ["Delete the example rows before adding your own."],
      ];
      (e.utils.book_append_sheet(n, e.utils.aoa_to_sheet(l), "How to fill"),
        e.writeFile(n, "paisa-ledger-template.xlsx"),
        (t.textContent =
          "Template saved to your Downloads. Fill it in Excel or Google Sheets, then choose it above."));
    } catch (e) {
      ((t.className = "msg err"),
        (t.textContent = "Couldn't create the template. Connect to the internet once, then try again."));
    }
  }),
    (e("xlsFile").onchange = async (t) => {
      const o = t.target.files[0];
      if (((t.target.value = ""), !o)) return;
      const s = e("impMsg");
      ((s.className = "msg"), (s.textContent = "Reading " + o.name + "…"), (e("impBox").hidden = !0));
      try {
        const t = await Ee(),
          r = await o.arrayBuffer(),
          c = t.read(r, { type: "array", raw: /\.csv$/i.test(o.name) }),
          l = (function (e, t) {
            let n = null;
            return (
              t.SheetNames.forEach((a) => {
                const o = e.utils.sheet_to_json(t.Sheets[a], { header: 1, raw: !0, defval: "" });
                for (let e = 0; e < Math.min(o.length, 40); e++) {
                  const t = Fe(o[e]),
                    i =
                      null == (s = t).date ||
                      (null == s.amount &&
                        null == s.debit &&
                        null == s.credit &&
                        (null == s.qty || null == s.price))
                        ? 0
                        : Object.keys(s).length;
                  i > 0 && (!n || i > n.score) && (n = { sheet: a, rows: o, hr: e, map: t, score: i });
                }
                var s;
              }),
              n
            );
          })(t, c);
        if (!l)
          return (
            (s.className = "msg err"),
            void (s.textContent =
              "Couldn't find Date and Amount columns in this file. Add a header row with Date and Amount, or use the template.")
          );
        const u = (function (e) {
          const t = e.map,
            n = [];
          let a = 0;
          const o = { expense: new Set(), income: new Set(), invest: new Set() },
            s = new Set(),
            r = (e) => L.find((t) => t.name.toLowerCase() === e.toLowerCase());
          for (let c = e.hr + 1; c < e.rows.length; c++) {
            const l = e.rows[c];
            if (!l || l.every((e) => "" === String(e).trim())) continue;
            const u = (e) => (null != t[e] ? l[t[e]] : ""),
              m = (e) => String(u(e) ?? "").trim(),
              p = Pe(u("date")),
              h = m("type").toLowerCase(),
              f = m("kind"),
              y = m("category"),
              v = m("note"),
              g = m("action").toLowerCase();
            let w = null;
            (h &&
              (/^(exp|spen|debit|dr\b|dr\.?$|paid|withdraw|outflow)/.test(h)
                ? (w = "expense")
                : /^(inc|earn|credit|cr\b|cr\.?$|receiv|salary|dividend|inflow)/.test(h)
                  ? (w = "income")
                  : /^(inv|buy|sell|sip|redeem|premium|purchase|lumpsum)/.test(h) && (w = "invest")),
              !w && f && (w = "invest"),
              w ||
                !m("name") ||
                (null == t.qty && null == t.price) ||
                (!m("qty") && !m("price")) ||
                (w = "invest"));
            const b = De(u("amount")),
              C = De(u("debit")),
              S = De(u("credit"));
            let $ = 0;
            C.v > 0 || S.v > 0
              ? (($ = C.v > 0 ? C.v : S.v), w || (w = C.v > 0 ? "expense" : "income"))
              : (($ = b.v),
                w ||
                  (w =
                    b.neg || b.dr ? "expense" : b.cr ? "income" : (null != t.debit || t.credit, "expense")));
            const M = i(u("qty")),
              L = i(u("price"));
            if ((!($ > 0) && M > 0 && L > 0 && ($ = Math.round(M * L * 100) / 100), !(p && $ > 0))) {
              a++;
              continue;
            }
            const E = {
                id: d(),
                type: w,
                date: p,
                amount: Math.round(100 * $) / 100,
                note: v,
                created: Date.now() + c,
              },
              T = m("account");
            if (T) {
              const e = r(T);
              e ? (E.account = e.id) : ((E._acct = T), s.add(T));
            }
            if ("invest" === w) {
              let e = R(f) || R(y) || R(h) || R(m("name")) || R(v);
              (!e && f && ((e = "c:" + f.slice(0, 30)), o.invest.add(f.slice(0, 30))), e || (e = "other"));
              const t = x(e),
                n = g || h,
                a =
                  /sell|redeem|withdraw|matur|claim|exit|sold/.test(n) || (0 === C.v && S.v > 0 && !n)
                    ? "in"
                    : "out",
                s =
                  t.sides.find((e) => e[1] === a && n && n.includes(e[0].toLowerCase())) ||
                  t.sides.find((e) => e[1] === a) ||
                  t.sides[0];
              (Object.assign(E, {
                kind: e,
                cat: t.label,
                side: a,
                action: s[0],
                name: m("name"),
                inst: m("inst"),
              }),
                M > 0 && (E.qty = M),
                L > 0 && (E.price = L));
              const r = i(u("sum"));
              r > 0 && (E.sumAssured = r);
              const c = m("freq").toLowerCase();
              c &&
                (E.freq = /month/.test(c)
                  ? "Monthly"
                  : /quart/.test(c)
                    ? "Quarterly"
                    : /half/.test(c)
                      ? "Half-yearly"
                      : /single|one/.test(c)
                        ? "Single"
                        : "Yearly");
              const l = Pe(u("due"));
              if ((l && (E.nextDue = l), m("ptype") && (E.ptype = m("ptype")), "mf" === e)) {
                const e = m("ftype").toLowerCase();
                E.ftype = /elss|tax/.test(e)
                  ? "ELSS"
                  : /debt|liquid/.test(e)
                    ? "Debt"
                    : /hybrid/.test(e)
                      ? "Hybrid"
                      : e
                        ? "Equity"
                        : k(E);
              }
            } else {
              let e = y ? j(w).find((e) => e.toLowerCase() === y.toLowerCase()) : null;
              (!e && y && ((e = y.slice(0, 30)), o[w].add(e)),
                e || (e = Be(w, v + " " + m("name"))),
                (E.cat = e));
            }
            n.push(E);
          }
          const c = (e) =>
              [
                e.date,
                e.type,
                Math.round(100 * e.amount),
                (e.note || e.name || "").toLowerCase().slice(0, 40),
              ].join("|"),
            l = new Set(M.map(c)),
            u = [];
          let m = 0;
          return (
            n.forEach((e) => {
              const t = c(e);
              l.has(t) ? m++ : (l.add(t), u.push(e));
            }),
            { rows: u, skipped: a, dups: m, newCats: o, newAccts: s }
          );
        })(l);
        if (!u.rows.length)
          return (
            (s.className = "msg err"),
            void (s.textContent = u.dups
              ? `All ${u.dups} entries in this file are already in the app.`
              : "No rows with a valid date and amount were found.")
          );
        ((Oe = u), (s.textContent = ""));
        const m = { expense: 0, income: 0, invest: 0 };
        u.rows.forEach((e) => m[e.type]++);
        const p = Object.entries(l.map)
            .map(([e, t]) => `${e}: “${n(l.rows[l.hr][t])}”`)
            .join(", "),
          h = [...u.newCats.expense, ...u.newCats.income, ...u.newCats.invest];
        e("impSummary").innerHTML =
          `<b>${u.rows.length} entries ready</b> from sheet “${n(l.sheet)}”: ${m.expense} expenses, ${m.income} income, ${m.invest} investments.` +
          (u.dups ? ` ${u.dups} already in the app will be skipped.` : "") +
          (u.skipped ? ` ${u.skipped} rows without a date or amount were skipped.` : "") +
          (h.length ? `<br>New categories: ${h.map(n).join(", ")}.` : "") +
          (u.newAccts.size ? `<br>New accounts: ${[...u.newAccts].map(n).join(", ")}.` : "") +
          `<br><span class="muted small">Columns used: ${p}</span>`;
        const f = "<tr><th>Date</th><th>Type</th><th>Category / name</th><th>Amount</th></tr>";
        ((e("impTable").innerHTML =
          f +
          u.rows
            .slice(0, 8)
            .map(
              (e) =>
                `<tr><td>${n(e.date)}</td><td>${C[e.type].word}</td><td>${n("invest" === e.type ? e.cat + ": " + (e.name || e.action) : e.cat)}</td><td class="num">${a(e.amount)}</td></tr>`,
            )
            .join("") +
          (u.rows.length > 8
            ? `<tr><td colspan="4" class="muted">and ${u.rows.length - 8} more</td></tr>`
            : "")),
          fe(e("impAcct"), !0),
          (e("impBox").hidden = !1));
      } catch (e) {
        ((s.className = "msg err"),
          (s.textContent =
            "Couldn't read this file. Save it as .xlsx or .csv and try again. If you are offline, connect to the internet once first."));
      }
    }),
    (e("impCancel").onclick = () => {
      ((Oe = null), (e("impBox").hidden = !0));
    }),
    (e("impGo").onclick = async () => {
      if (!Oe) return;
      const t = e("impMsg");
      let n = e("impAcct").value;
      if ("__import" === n) {
        const e = { id: d(), name: "Imported", kind: "bank", opening: 0 };
        (L.push(e), (n = e.id));
      } else n = await ye(n);
      const a = {};
      (Oe.newAccts.forEach((e) => {
        const t = { id: d(), name: e.slice(0, 40), kind: "bank", opening: 0 };
        (L.push(t), (a[e] = t.id));
      }),
        ["expense", "income"].forEach((e) =>
          Oe.newCats[e].forEach((t) => {
            j(e).some((e) => e.toLowerCase() === t.toLowerCase()) || E[e].push(t);
          }),
        ),
        Oe.newCats.invest.forEach((e) => {
          E.invest.some((t) => t.toLowerCase() === e.toLowerCase()) || E.invest.push(e);
        }),
        Oe.rows.forEach((e) => {
          (e._acct && ((e.account = a[e._acct] || n), delete e._acct),
            e.account || (e.account = n),
            M.push(e));
        }));
      const o = Oe.rows.length;
      ((Oe = null),
        _(),
        B(),
        O(),
        (e("impBox").hidden = !0),
        (t.className = "msg"),
        (t.textContent = `Imported ${o} entries. New accounts start at ₹0, so set their opening balance if needed.`));
      const s = M.reduce((e, t) => (t.date > e ? t.date : e), "");
      if (s) {
        const e = p(s);
        V = new Date(e.getFullYear(), e.getMonth(), 1);
      }
      (Ce(ge), X());
    }));
  const je = ["needs", "wants", "invest", "emergency"],
    He = (e) => e.filter((e) => "invest" === e.type && "out" === e.side).reduce((e, t) => e + t.amount, 0),
    Re = (e) => I.wants.some((t) => t.toLowerCase() === String(e).toLowerCase());
  function Ye() {
    const e = {};
    U.filter((e) => "income" === e.type && /salary|stipend/i.test(e.cat)).forEach((t) => {
      const n = l(t.date);
      e[n] = (e[n] || 0) + t.amount;
    });
    const t = Object.keys(e).sort().slice(-3);
    return t.length ? t.reduce((t, n) => t + e[n], 0) / t.length : 0;
  }
  const Ue = () => Number(I.salary) || Math.round(Ye());
  (je.forEach((t) =>
    e("pp_" + t).addEventListener("input", (e) => {
      const n = Math.max(0, Math.min(100, Math.round(i(e.target.value))));
      ((I.pct[t] = n), (I.preset = "custom"), q(), Z());
    }),
  ),
    e("pSalary").addEventListener("input", (e) => {
      ((I.salary = Math.max(0, i(e.target.value))), q(), Z());
    }),
    e("emMonths").addEventListener("change", (e) => {
      ((I.emMonths = +e.target.value), q(), Z());
    }),
    e("emAccts").addEventListener("change", (e) => {
      const t = e.target.dataset.id;
      t &&
        ((I.emAccts = e.target.checked ? I.emAccts.concat(t) : I.emAccts.filter((e) => e !== t)), q(), Z());
    }));
  let Ge = y(c());
  function We(e) {
    const t = oe().filter((t) => "out" === t.side && y(t.date) === e),
      n = (e) => t.filter(e).reduce((e, t) => e + t.amount, 0),
      a = [
        ["PPF", n((e) => "ppf" === e.kind)],
        ["Sukanya Samriddhi", n((e) => "ssy" === e.kind)],
        ["ELSS tax-saver funds", n((e) => "mf" === e.kind && "ELSS" === k(e))],
        [
          "Life / term insurance premiums",
          n((e) => "insurance" === e.kind && /term|life|endow/i.test(e.ptype || "")),
        ],
        ["ULIP premiums", n((e) => "ulip" === e.kind)],
        ["Other (EPF, tuition, home loan)", i((I.other80c || {})[e])],
      ];
    return {
      items: a,
      total: a.reduce((e, t) => e + t[1], 0),
      nps: n((e) => "nps" === e.kind),
      health: n((e) => "insurance" === e.kind && /health/i.test(e.ptype || "")),
    };
  }
  function Ve(e) {
    const t = { st: 0, lt: 0, debt: 0, rows: [], warn: [] };
    ["stock", "mf"].forEach((n) =>
      se(
        oe().filter((e) => e.kind === n),
        (e) => (e.name || "Unnamed").toLowerCase(),
      ).forEach((a) => {
        const s = [...a].sort(
            (e, t) =>
              e.date.localeCompare(t.date) ||
              (e.side === t.side ? 0 : "out" === e.side ? -1 : 1) ||
              (e.created || 0) - (t.created || 0),
          ),
          i = [],
          r = "mf" === n && "Debt" === k(s.find((e) => "out" === e.side) || s[0]);
        s.forEach((a) => {
          if ("out" === a.side)
            return void (a.qty > 0 && i.push({ date: a.date, qty: Number(a.qty), cpu: a.amount / a.qty }));
          const s = y(a.date) === e;
          if (!(a.qty > 0))
            return void (
              s &&
              t.warn.push(
                `${a.name || "A sale"} on ${h(a.date)} has no quantity, so its gain can't be worked out.`,
              )
            );
          let c = Number(a.qty),
            l = 0,
            d = 0;
          const u = a.amount / a.qty,
            m = [];
          for (; c > 1e-9 && i.length;) {
            const e = i[0],
              t = Math.min(c, e.qty),
              n = (u - e.cpu) * t,
              o = f(e.date, 12) < a.date;
            (o ? (d += n) : (l += n),
              m.push({ buy: e.date, qty: t, cost: t * e.cpu, sale: t * u, lt: o }),
              (e.qty -= t),
              (c -= t),
              e.qty <= 1e-9 && i.shift());
          }
          s &&
            (c > 1e-9 &&
              t.warn.push(
                `${a.name} on ${h(a.date)}: ${o(c)} units sold were never recorded as bought. Add the purchase for an accurate gain.`,
              ),
            r ? (t.debt += l + d) : ((t.st += l), (t.lt += d)),
            t.rows.push({
              name: a.name || x(n).label,
              date: a.date,
              amount: a.amount,
              st: l,
              lt: d,
              debt: r,
              kind: n,
              det: m,
            }));
        });
      }),
    );
    let n = t.st,
      a = t.lt;
    return (
      n < 0 && ((a += n), (n = 0)),
      (t.ltTaxable = Math.max(0, a - 125e3)),
      (t.tax = 0.2 * Math.max(0, n) + 0.125 * t.ltTaxable),
      (t.stNet = n),
      (t.ltNet = Math.max(0, a)),
      t
    );
  }
  (e("taxFy").addEventListener("change", (e) => {
    ((Ge = +e.target.value), Z());
  }),
    e("taxRegime").addEventListener("change", (e) => {
      ((I.regime = e.target.value), q(), Z());
    }),
    e("tOther").addEventListener("input", (e) => {
      ((I.other80c = I.other80c || {}), (I.other80c[Ge] = Math.max(0, i(e.target.value))), q(), Z());
    }),
    (e("printBtn").onclick = () => window.print()));
  const Je = [
      [4e5, 0],
      [8e5, 0.05],
      [12e5, 0.1],
      [16e5, 0.15],
      [2e6, 0.2],
      [24e5, 0.25],
      [1 / 0, 0.3],
    ],
    Qe = [
      [25e4, 0],
      [5e5, 0.05],
      [1e6, 0.2],
      [1 / 0, 0.3],
    ],
    ze = (e, t) => {
      let n = 0,
        a = 0;
      for (const [o, s] of t) (e > a && (n += (Math.min(e, o) - a) * s), (a = o));
      return n;
    },
    Xe = [
      "salary",
      "ptax",
      "tds",
      "int",
      "div",
      "oth",
      "fnoTurn",
      "fnoPl",
      "fnoExp",
      "intTurn",
      "intPl",
      "intExp",
    ];
  let Ke = y(c()) - 1;
  const Ze = (e) => ((I.itr = I.itr || {}), (I.itr[e] = I.itr[e] || {}));
  function et(e, t) {
    return U.filter((n) => "income" === n.type && y(n.date) === e && t.test(n.cat)).reduce(
      (e, t) => e + t.amount,
      0,
    );
  }
  function tt(e) {
    const t = Ze(e),
      n = (e) => i(t[e]),
      a = et(e, /interest/i),
      o = et(e, /dividend/i),
      s = (e) => null != t[e] && "" !== t[e],
      r = {
        salary: n("salary"),
        ptax: n("ptax"),
        tds: n("tds"),
        int: s("int") ? n("int") : a,
        div: s("div") ? n("div") : o,
        oth: n("oth"),
        autoInt: a,
        autoDiv: o,
        fnoTurn: n("fnoTurn"),
        fnoNet: n("fnoPl") - n("fnoExp"),
        intTurn: n("intTurn"),
        intNet: n("intPl") - n("intExp"),
      },
      c = Ve(e),
      l = We(e),
      d = (e) => {
        const t = Math.max(
          0,
          r.salary - (r.salary ? ("new" === e ? 75e3 : 5e4) : 0) - ("old" === e ? r.ptax : 0),
        );
        let n = r.int + r.div + r.oth,
          a = Math.max(0, c.st),
          o = c.lt,
          s = r.fnoNet,
          i = Math.max(0, r.intNet),
          d = 0;
        if ((c.st < 0 && (o += c.st), (o = Math.max(0, o)), s < 0)) {
          let e = -s;
          s = 0;
          const t = (t) => {
            const n = Math.min(t, e);
            return ((e -= n), t - n);
          };
          ((i = t(i)), (n = t(n)), (a = t(a)), (o = t(o)), (d = e));
        }
        const u = r.intNet < 0 ? -r.intNet : 0,
          m = "old" === e ? Math.min(l.total, 15e4) + Math.min(l.nps, 5e4) + Math.min(l.health, 25e3) : 0,
          p = t + n + s + i,
          h = Math.max(0, p - m),
          f = h + a + o;
        let y = ze(h, "new" === e ? Je : Qe);
        "new" === e
          ? (y = f <= 12e5 ? Math.max(0, y - 6e4) : Math.min(y, f - 12e5))
          : f <= 5e5 && (y = Math.max(0, y - 12500));
        const v = 0.2 * a + 0.125 * Math.max(0, o - 125e3),
          g = Math.round(1.04 * (y + v));
        return {
          sal: t,
          oth: n,
          fno: s,
          spec: i,
          st: a,
          lt: o,
          gross: p,
          ded: Math.min(m, p),
          normal: h,
          total: f,
          tax: g,
          fnoCF: d,
          intraCF: u,
          due: g - r.tds,
        };
      };
    return { I: r, cg: c, t8: l, nw: d("new"), od: d("old") };
  }
  function nt() {
    const t = new Set([y(c()), y(c()) - 1]);
    U.forEach((e) => t.add(y(e.date)));
    const o = e("itrFy");
    ((o.innerHTML = [...t]
      .sort((e, t) => t - e)
      .map((e) => `<option value="${e}">${v(e)} (AY ${e + 1}-${String(e + 2).slice(2)})</option>`)
      .join("")),
      (o.value = String(Ke)),
      (e("itrDue").textContent = (function (e) {
        const t = e + 1 + "-07-31",
          n = e + 1 + "-12-31",
          a = c();
        return a <= t
          ? `File the return for ${v(e)} by 31 July ${e + 1} (non-audit cases). Filing on time lets you carry forward F&O and intraday losses.`
          : a <= n
            ? `The 31 July ${e + 1} due date for ${v(e)} has passed. You can still file a belated return until 31 December ${e + 1} with a late fee, but F&O and intraday losses can't be carried forward in a late return.`
            : `The filing window for ${v(e)} has closed. Talk to a CA about an updated return (ITR-U).`;
      })(Ke)));
    const s = Ze(Ke),
      r = tt(Ke),
      l = r.I;
    (Xe.forEach((t) => {
      const n = e("i_" + t);
      document.activeElement !== n && (n.value = null != s[t] ? s[t] : "");
    }),
      (e("i_int").placeholder = String(Math.round(l.autoInt))),
      (e("i_div").placeholder = String(Math.round(l.autoDiv))),
      (e("itrAutoNote").textContent =
        l.autoInt || l.autoDiv
          ? "Grey numbers come from your Interest and Dividend entries in this year. Type your own if your AIS shows different amounts."
          : "Tip: interest and dividends from your AIS on the portal are the safest numbers to use."));
    const d = r.cg,
      u = (e) =>
        `<span class="num" style="color:${e >= 0 ? "var(--inc)" : "var(--exp)"}">${e < 0 ? "−" : ""}${a(Math.abs(e))}</span>`;
    e("itrCg").innerHTML =
      `<div class="trow"><span>Short-term (Section 111A, 20%)</span>${u(d.st)}</div><div class="trow"><span>Long-term (Section 112A, 12.5%)</span>${u(d.lt)}</div>` +
      (d.debt ? `<div class="trow"><span>Debt funds (slab rate)</span>${u(d.debt)}</div>` : "") +
      d.warn.map((e) => `<div class="hint">${n(e)}</div>`).join("");
    const m = "old" === I.regime ? r.od : "new" === I.regime ? r.nw : r.od.tax < r.nw.tax ? r.od : r.nw,
      p = (e, t) => `<div class="trow"><span>${e}</span><span class="num">${t}</span></div>`,
      h = (e, t, n) => `<div class="sched"><h3>${e}<small>${t}</small></h3>${n}</div>`,
      f = [];
    (l.salary &&
      f.push(
        h(
          "Schedule S",
          "Salary",
          p("Gross salary", a(l.salary)) +
            p("Standard deduction", a(Math.min(l.salary, m === r.od ? 5e4 : 75e3))) +
            (m === r.od && l.ptax ? p("Professional tax", a(l.ptax)) : "") +
            p("Income from salary", a(m.sal)),
        ),
      ),
      (l.fnoTurn || l.fnoNet || l.intTurn || l.intNet) &&
        (f.push(
          h(
            "Part A – Trading account / P&amp;L",
            "No accounts case",
            (l.fnoTurn || l.fnoNet
              ? p("F&amp;O turnover", a(l.fnoTurn)) +
                p("F&amp;O gross profit / loss", a(i(Ze(Ke).fnoPl))) +
                p("F&amp;O expenses", a(i(Ze(Ke).fnoExp))) +
                p("F&amp;O net profit / loss", a(l.fnoNet))
              : "") +
              (l.intTurn || l.intNet
                ? p("Intraday turnover", a(l.intTurn)) +
                  p("Intraday gross profit / loss", a(i(Ze(Ke).intPl))) +
                  p("Intraday expenses", a(i(Ze(Ke).intExp))) +
                  p("Intraday net profit / loss", a(l.intNet))
                : ""),
          ),
        ),
        f.push(
          h(
            "Schedule BP",
            "Business income",
            p("Non-speculative business (F&amp;O)", a(l.fnoNet)) +
              p("Speculative business (intraday)", a(l.intNet)),
          ),
        )),
      d.rows.length &&
        f.push(
          h(
            "Schedule CG",
            "Capital gains",
            p("Short-term under 111A (20%)", a(d.st)) +
              p("Long-term under 112A (12.5%)", a(d.lt)) +
              (d.debt ? p("Debt funds (slab rate)", a(d.debt)) : "") +
              (d.lt
                ? '<div class="small muted">Section 112A needs a line for each share or fund. The Excel worksheet has this list ready.</div>'
                : ""),
          ),
        ),
      (l.int || l.div || l.oth) &&
        f.push(
          h(
            "Schedule OS",
            "Other sources",
            p("Interest", a(l.int)) + p("Dividends", a(l.div)) + (l.oth ? p("Other income", a(l.oth)) : ""),
          ),
        ),
      (m.fnoCF || m.intraCF || l.fnoNet < 0) &&
        f.push(
          h(
            "Schedule CYLA / CFL",
            "Losses",
            (l.fnoNet < 0
              ? p("F&amp;O loss set off against other income this year", a(-l.fnoNet - m.fnoCF))
              : "") +
              (m.fnoCF ? p("F&amp;O loss to carry forward (8 years)", a(m.fnoCF)) : "") +
              (m.intraCF ? p("Intraday loss to carry forward (4 years)", a(m.intraCF)) : "") +
              '<div class="small muted">F&amp;O loss can\'t reduce salary income. Intraday loss can only be set off against future intraday profit. Carry forward works only if you file by the due date.</div>',
          ),
        ),
      m === r.od &&
        m.ded &&
        f.push(
          h(
            "Schedule VI-A",
            "Deductions (old regime)",
            p("80C (Section 123)", a(Math.min(r.t8.total, 15e4))) +
              (r.t8.nps ? p("80CCD(1B) NPS", a(Math.min(r.t8.nps, 5e4))) : "") +
              (r.t8.health ? p("80D health insurance", a(Math.min(r.t8.health, 25e3))) : ""),
          ),
        ));
    const g = l.fnoTurn + l.intTurn,
      w = l.fnoNet + l.intNet,
      b = [];
    (b.push(
      g > 1e8
        ? `<li class="bad"><span>Trading turnover ${a(g)} is above ₹10 crore. A tax audit by a CA is required.</span></li>`
        : g
          ? `<li class="ok"><span>Turnover ${a(g)} is below ₹10 crore, so no tax audit is needed on turnover alone (for fully digital trading).</span></li>`
          : "",
    ),
      g &&
        b.push(
          '<li class="warn"><span>If you used presumptive taxation (44AD) in any of the last 5 years and now show lower profit or a loss, an audit may be needed. Ask a CA.</span></li>',
        ),
      (g > 25e5 || w > 25e4) &&
        b.push(
          '<li class="info"><span>With turnover above ₹25 lakh or business income above ₹2.5 lakh, you should keep basic books of account (your broker\'s contract notes and P&amp;L reports).</span></li>',
        ),
      f.push(`<ul class="tips">${b.join("")}</ul>`),
      (e("itrOut").innerHTML =
        f.join("") || '<div class="empty">Fill the boxes above to see your numbers.</div>'));
    const x = r.od.tax < r.nw.tax ? "old" : "new",
      k = (e, t, n) =>
        `<div class="${n === x ? "best" : ""}"><span class="label">${e}</span><span class="num">${a(t.tax)}</span><span class="small muted">Taxable income ${a(t.total)}</span>${n === x ? '<span class="pill ok" style="margin-top:4px">Lower tax</span>' : ""}</div>`;
    e("itrRegime").innerHTML = k("New regime", r.nw, "new") + k("Old regime", r.od, "old");
    const C = !!(l.fnoTurn || l.fnoNet || l.intTurn || l.intNet),
      S = c() > Ke + 1 + "-07-31",
      $ = "old" === I.regime ? r.od : "new" === I.regime || (C && S) ? r.nw : "old" === x ? r.od : r.nw,
      M = C
        ? `<div class="hint" style="margin-bottom:6px">With F&amp;O or intraday income, the new regime applies by default. To use the old regime you must file Form 10-IEA before the due date (31 July ${Ke + 1}).${S ? " Your due date has passed, so the new regime applies to this return." : ""}</div>`
        : "";
    e("itrPay").innerHTML =
      M +
      p("Tax already paid (TDS + advance tax)", a(l.tds)) +
      ($.due > 0
        ? `<div class="trow" style="font-weight:600"><span>Estimated tax still to pay${I.regime ? "" : " (lower regime)"}</span><span class="num" style="color:var(--exp)">${a($.due)}</span></div>`
        : `<div class="trow" style="font-weight:600"><span>Estimated refund${I.regime ? "" : " (lower regime)"}</span><span class="num" style="color:var(--inc)">${a(-$.due)}</span></div>`);
  }
  (Xe.forEach((t) =>
    e("i_" + t).addEventListener("input", (e) => {
      const n = Ze(Ke),
        a = e.target.value.trim();
      ("" === a ? delete n[t] : (n[t] = a.replace(/[^\d.\-]/g, "")), q(), nt());
    }),
  ),
    e("itrFy").addEventListener("change", (e) => {
      ((Ke = +e.target.value), nt());
    }));
  const at = (e) => {
    (document.querySelectorAll(".view").forEach((t) => (t.hidden = t.id !== "v-" + e)),
      window.scrollTo(0, 0));
  };
  ((e("openItr").onclick = () => {
    ((Ke = Ge < y(c()) ? Ge : y(c()) - 1), nt(), at("itr"));
  }),
    (e("itrBack").onclick = () => at("invest")),
    (e("itrPrint").onclick = () => window.print()));
  const ot = [
    "realizedpnl",
    "realisedpnl",
    "realizedprofit",
    "realisedprofit",
    "pnl",
    "profit",
    "profitloss",
    "netpnl",
    "realisedpl",
    "realizedpl",
    "pl",
    "grosspnl",
    "netrealisedpnl",
    "netrealizedpnl",
    "realisedprofitloss",
    "realizedprofitloss",
    "totalpnl",
    "profitandloss",
    "netprofit",
  ];
  ([
    ["fnoFile", "fno", "fnoMsg"],
    ["intraFile", "int", "intraMsg"],
  ].forEach(([t, n, o]) =>
    e(t).addEventListener("change", async (t) => {
      const s = t.target.files[0];
      if (((t.target.value = ""), !s)) return;
      const i = e(o);
      ((i.className = "msg"), (i.textContent = "Reading " + s.name + "…"));
      try {
        const e = await (async function (e, t) {
          const n = await Ee(),
            a = n.read(await e.arrayBuffer(), { type: "array", raw: /\.csv$/i.test(e.name) }),
            o = "fno" === t ? /f\s*&?\s*o|fno|deriv|future|option/i : /intra|specul/i,
            s = [...a.SheetNames].sort((e, t) => (o.test(t) ? 1 : 0) - (o.test(e) ? 1 : 0));
          for (const e of s) {
            const t = n.utils.sheet_to_json(a.Sheets[e], { header: 1, raw: !0, defval: "" });
            for (let n = 0; n < Math.min(t.length, 60); n++) {
              const a = t[n].findIndex((e) => ot.includes(Ie(e)));
              if (a < 0) continue;
              let o = 0,
                s = 0,
                i = 0;
              for (let e = n + 1; e < t.length; e++) {
                const n = t[e];
                if (!n || n.every((e) => "" === String(e).trim())) continue;
                if (n.some((e) => /^\s*(total|grand total|net|charges|summary)/i.test(String(e)))) continue;
                const r = De(n[a]);
                if (!r.v) continue;
                const c = r.neg || r.dr ? -r.v : r.v;
                (o++, (s += c), (i += Math.abs(c)));
              }
              if (o)
                return {
                  sheet: e,
                  col: t[n][a],
                  n: o,
                  sum: Math.round(100 * s) / 100,
                  abs: Math.round(100 * i) / 100,
                };
            }
          }
          return null;
        })(s, "fno" === n ? "fno" : "intra");
        if (!e)
          return (
            (i.className = "msg err"),
            void (i.textContent =
              "Couldn't find a profit / P&L column for each trade. Type the totals from your broker's tax P&L report instead.")
          );
        const t = Ze(Ke);
        ((t[n + "Turn"] = String(e.abs)),
          (t[n + "Pl"] = String(e.sum)),
          q(),
          nt(),
          (i.textContent = `Read ${e.n} trades from sheet “${e.sheet}” (column “${e.col}”). Turnover ${a(e.abs)}, profit/loss ${a(e.sum)}. Compare with your broker's summary and add charges below.`));
      } catch (e) {
        ((i.className = "msg err"),
          (i.textContent = "Couldn't read this file. Save it as .xlsx or .csv and try again."));
      }
    }),
  ),
    (e("itrXlsx").onclick = async () => {
      const t = e("itrMsg");
      t.className = "msg";
      try {
        const e = await Ee(),
          n = tt(Ke),
          a = n.I,
          o = Ze(Ke),
          s = e.utils.book_new(),
          r = "old" === I.regime ? n.od : "new" === I.regime ? n.nw : n.od.tax < n.nw.tax ? n.od : n.nw,
          c = [
            ["ITR-3 worksheet " + v(Ke) + " (AY " + (Ke + 1) + "-" + String(Ke + 2).slice(2) + ")"],
            [
              "Estimate prepared with Paisa Ledger. Check against Form 16, AIS and broker reports before filing.",
            ],
            [],
            ["Schedule", "Item", "Amount (₹)"],
            ["Schedule S", "Gross salary", a.salary],
            ["Schedule S", "Professional tax", a.ptax],
            ["Schedule S", "Income from salary (" + (r === n.od ? "old" : "new") + " regime)", r.sal],
            ["Schedule OS", "Interest", a.int],
            ["Schedule OS", "Dividends", a.div],
            ["Schedule OS", "Other income", a.oth],
            ["Part A Trading / P&L", "F&O turnover", a.fnoTurn],
            ["Part A Trading / P&L", "F&O gross profit/loss", i(o.fnoPl)],
            ["Part A Trading / P&L", "F&O expenses", i(o.fnoExp)],
            ["Schedule BP", "Non-speculative income (F&O)", a.fnoNet],
            ["Part A Trading / P&L", "Intraday turnover", a.intTurn],
            ["Part A Trading / P&L", "Intraday gross profit/loss", i(o.intPl)],
            ["Part A Trading / P&L", "Intraday expenses", i(o.intExp)],
            ["Schedule BP", "Speculative income (intraday)", a.intNet],
            ["Schedule CG", "STCG 111A (20%)", Math.round(n.cg.st)],
            ["Schedule CG", "LTCG 112A (12.5%)", Math.round(n.cg.lt)],
            ["Schedule CG", "Debt fund gains (slab)", Math.round(n.cg.debt)],
            ["Schedule CFL", "F&O loss to carry forward", r.fnoCF],
            ["Schedule CFL", "Intraday loss to carry forward", r.intraCF],
            ["Schedule VI-A", "80C / Section 123 (old regime)", Math.min(n.t8.total, 15e4)],
            ["Schedule VI-A", "80CCD(1B) NPS (old regime)", Math.min(n.t8.nps, 5e4)],
            ["Schedule VI-A", "80D health (old regime)", Math.min(n.t8.health, 25e3)],
            [],
            ["Estimate", "Tax, new regime", n.nw.tax],
            ["Estimate", "Tax, old regime", n.od.tax],
            ["Estimate", "TDS + advance tax paid", a.tds],
            ["Estimate", r.due > 0 ? "Tax to pay" : "Refund", Math.abs(r.due)],
          ],
          l = e.utils.aoa_to_sheet(c);
        ((l["!cols"] = [{ wch: 22 }, { wch: 42 }, { wch: 16 }]),
          e.utils.book_append_sheet(s, l, "ITR-3 worksheet"));
        const d = [
          ["Schedule 112A – long-term equity sales"],
          [
            "ISIN is on your contract note or broker holdings page. FMV on 31-Jan-2018 is only needed for shares bought before 1 Feb 2018.",
          ],
          [],
          [
            "Name of share / unit",
            "ISIN",
            "Buy date",
            "Sale date",
            "Quantity",
            "Sale value (₹)",
            "Cost of acquisition (₹)",
            "FMV on 31-Jan-2018",
            "Gain (₹)",
          ],
        ];
        n.cg.rows
          .filter((e) => !e.debt)
          .forEach((e) =>
            e.det
              .filter((e) => e.lt)
              .forEach((t) =>
                d.push([
                  e.name,
                  "",
                  t.buy,
                  e.date,
                  +t.qty.toFixed(4),
                  Math.round(100 * t.sale) / 100,
                  Math.round(100 * t.cost) / 100,
                  "",
                  Math.round(100 * (t.sale - t.cost)) / 100,
                ]),
              ),
          );
        const u = [
          ["Schedule CG – short-term equity sales (111A)"],
          [],
          ["Name", "Buy date", "Sale date", "Quantity", "Sale value (₹)", "Cost (₹)", "Gain (₹)"],
        ];
        (n.cg.rows
          .filter((e) => !e.debt)
          .forEach((e) =>
            e.det
              .filter((e) => !e.lt)
              .forEach((t) =>
                u.push([
                  e.name,
                  t.buy,
                  e.date,
                  +t.qty.toFixed(4),
                  Math.round(100 * t.sale) / 100,
                  Math.round(100 * t.cost) / 100,
                  Math.round(100 * (t.sale - t.cost)) / 100,
                ]),
              ),
          ),
          e.utils.book_append_sheet(s, e.utils.aoa_to_sheet(d), "112A long-term"),
          e.utils.book_append_sheet(s, e.utils.aoa_to_sheet(u), "111A short-term"),
          e.writeFile(s, "ITR3-worksheet-" + v(Ke).replace(/\s/g, "-") + ".xlsx"),
          (t.textContent = "Worksheet saved to your Downloads."));
      } catch (e) {
        ((t.className = "msg err"),
          (t.textContent = "Couldn't create the worksheet. Connect to the internet once, then try again."));
      }
    }),
    e("histFilter").addEventListener("click", (e) => {
      const t = e.target.dataset.f;
      t &&
        ((de = t),
        document
          .querySelectorAll("#histFilter button")
          .forEach((e) => e.setAttribute("aria-selected", e.dataset.f === t)),
        Z());
    }),
    e("histQ").addEventListener("input", (e) => {
      ((ue = e.target.value.trim()), Z());
    }),
    (e("prevM").onclick = () => {
      ((V = new Date(V.getFullYear(), V.getMonth() - 1, 1)), Z());
    }),
    (e("nextM").onclick = () => {
      ((V = new Date(V.getFullYear(), V.getMonth() + 1, 1)), Z());
    }),
    document.querySelectorAll("label[for][tabindex]").forEach((t) =>
      t.addEventListener("keydown", (n) => {
        ("Enter" !== n.key && " " !== n.key) || (n.preventDefault(), e(t.htmlFor).click());
      }),
    ),
    e("tabs").addEventListener("click", (e) => {
      const t = e.target.closest("button");
      t &&
        (document
          .querySelectorAll("#tabs button")
          .forEach((e) =>
            e === t ? e.setAttribute("aria-current", "page") : e.removeAttribute("aria-current"),
          ),
        document.querySelectorAll(".view").forEach((e) => (e.hidden = e.id !== "v-" + t.dataset.v)),
        window.scrollTo(0, 0));
    }));
  const st = "PASTE_CLIENT_ID_HERE",
    it = "paisa-ledger-sync.json";
  let rt = null,
    ct = null,
    lt = !1;
  const dt = () => {
      try {
        return "1" === localStorage.getItem("pl_gdrive");
      } catch (e) {
        return !1;
      }
    },
    ut = (e) => {
      try {
        e ? localStorage.setItem("pl_gdrive", "1") : localStorage.removeItem("pl_gdrive");
      } catch (e) {}
    },
    mt = (e) =>
      [e.date, e.type, Math.round(100 * e.amount), (e.note || e.name || "").toLowerCase().slice(0, 40)].join(
        "|",
      );
  function pt() {
    const t = dt();
    ((e("gdConnect").hidden = t), (e("gdSync").hidden = !t), (e("gdDisconnect").hidden = !t));
  }
  function ht(t, n) {
    const a = e("gdMsg");
    ((a.className = n ? "msg err" : "msg"), (a.textContent = t));
  }
  function ft() {
    dt() && (clearTimeout(ct), (ct = setTimeout(gt, 3e3)));
  }
  function yt(e) {
    return st.startsWith("PASTE")
      ? Promise.reject(new Error("setup"))
      : new Promise((e, t) => {
          if (window.google && google.accounts) return e();
          const n = document.createElement("script");
          ((n.src = "https://accounts.google.com/gsi/client"),
            (n.async = !0),
            (n.onload = () => e()),
            (n.onerror = () => t(new Error("offline"))),
            document.head.appendChild(n));
        }).then(
          () =>
            new Promise((t, n) => {
              google.accounts.oauth2
                .initTokenClient({
                  client_id: st,
                  scope: "https://www.googleapis.com/auth/drive.appdata",
                  callback: (e) => {
                    e.error ? n(new Error(e.error)) : ((rt = e.access_token), t(rt));
                  },
                  error_callback: (e) => n(new Error(e.type || "popup_failed")),
                })
                .requestAccessToken({ prompt: e ? "consent" : "" });
            }),
        );
  }
  async function vt(e, t = {}) {
    const n = await fetch(
      e,
      Object.assign({}, t, { headers: Object.assign({ Authorization: "Bearer " + rt }, t.headers || {}) }),
    );
    if (401 === n.status) throw new Error("auth");
    if (!n.ok) throw new Error("Google Drive returned " + n.status);
    return n;
  }
  async function gt() {
    if (!lt && dt()) {
      lt = !0;
      try {
        rt || (await yt(!1));
        const e = await (async function () {
          const e = await (
            await vt(
              "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)&q=" +
                encodeURIComponent("name='" + it + "'"),
            )
          ).json();
          return (e.files && e.files[0]) || null;
        })();
        if (e) {
          const t = await (
            await vt("https://www.googleapis.com/drive/v3/files/" + e.id + "?alt=media")
          ).json();
          t &&
            "paisa-ledger" === t.app &&
            (function (e) {
              const t = new Set([...T, ...(e.deleted || [])]),
                n = new Set(M.map((e) => e.id)),
                a = new Set(M.map(mt));
              ((M = M.filter((e) => !t.has(e.id))),
                (e.txns || []).map(D).forEach((e) => {
                  t.has(e.id) || n.has(e.id) || a.has(mt(e)) || (n.add(e.id), a.add(mt(e)), M.push(e));
                }));
              const o = new Set(L.map((e) => e.id));
              ((e.accounts || []).forEach((e) => {
                o.has(e.id) || (o.add(e.id), L.push(e));
              }),
                e.custom &&
                  ["expense", "income", "invest"].forEach((t) =>
                    (e.custom[t] || []).forEach((e) => {
                      E[t].includes(e) || E[t].push(e);
                    }),
                  ),
                (T = [...t]));
            })(t);
        }
        ($("pl_txns", M),
          $("pl_accts", L),
          $("pl_cats", E),
          $("pl_deleted", T),
          X(),
          await (async function (e, t) {
            const n = JSON.stringify(t),
              a = { "Content-Type": "application/json" };
            return (
              e ||
                (e = (
                  await (
                    await vt("https://www.googleapis.com/drive/v3/files", {
                      method: "POST",
                      headers: a,
                      body: JSON.stringify({ name: it, parents: ["appDataFolder"] }),
                    })
                  ).json()
                ).id),
              await vt("https://www.googleapis.com/upload/drive/v3/files/" + e + "?uploadType=media", {
                method: "PATCH",
                headers: a,
                body: n,
              }),
              e
            );
          })(e ? e.id : null, {
            app: "paisa-ledger",
            v: 4,
            txns: M,
            accounts: L,
            custom: E,
            plan: I,
            deleted: T,
            updated: Date.now(),
          }),
          ht(
            "Synced at " +
              new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
              ".",
          ));
      } catch (e) {
        "setup" === e.message
          ? ht("Google Drive sync isn't set up in this copy of the app yet.", !0)
          : navigator.onLine && "offline" !== e.message
            ? "auth" === e.message || /access_denied|popup|immediate|interaction|cookie/i.test(e.message)
              ? ((rt = null), ht("Please reconnect Google Drive (tap Sync now).", !0))
              : ht("Sync didn't finish (" + e.message + "). Entries are still saved on this phone.", !0)
            : ht("You're offline. Entries are saved on this phone and will sync later.", !0);
      } finally {
        lt = !1;
      }
    }
  }
  ((e("gdConnect").onclick = async () => {
    try {
      (ht("Opening Google sign-in…"), await yt(!0), ut(!0), pt(), ht("Connected. Syncing…"), await gt());
    } catch (e) {
      ht(
        "setup" === e.message
          ? "Google Drive sync isn't set up in this copy of the app yet."
          : "Couldn't connect to Google. Check your internet and try again.",
        !0,
      );
    }
  }),
    (e("gdSync").onclick = () => gt()),
    (e("gdDisconnect").onclick = () => {
      (ut(!1),
        (rt = null),
        pt(),
        ht(
          "Disconnected. Entries stay on this phone; the copy in Google Drive is kept until you delete it.",
        ));
    }));
  const wt = new TextEncoder();
  async function bt(e, t) {
    const n = await crypto.subtle.digest("SHA-256", wt.encode(t + ":" + e));
    return [...new Uint8Array(n)].map((e) => e.toString(16).padStart(2, "0")).join("");
  }
  function xt() {
    try {
      return JSON.parse(localStorage.getItem("pl_lock") || "null");
    } catch (e) {
      return null;
    }
  }
  async function kt(e) {
    const t = [...crypto.getRandomValues(new Uint32Array(4))].join("-"),
      n = await bt(e, t);
    localStorage.setItem("pl_lock", JSON.stringify({ salt: t, hash: n }));
  }
  function Ct() {
    const t = !!xt();
    ((e("lockSetup").hidden = t), (e("lockOn").hidden = !t));
  }
  function St() {
    xt() &&
      ((e("lock").hidden = !1),
      (e("lockPin").value = ""),
      (e("lockMsg").textContent = ""),
      setTimeout(() => e("lockPin").focus(), 50));
  }
  async function $t() {
    const t = xt();
    t
      ? (await bt(e("lockPin").value.trim(), t.salt)) === t.hash
        ? ((e("lock").hidden = !0), (e("lockMsg").textContent = ""))
        : ((e("lockMsg").textContent = "Wrong PIN. Try again."), (e("lockPin").value = ""))
      : (e("lock").hidden = !0);
  }
  async function Mt() {
    const e = xt(),
      t = prompt("Enter your current PIN");
    return null !== t && (await bt(t.trim(), e.salt)) === e.hash;
  }
  ((e("lockBtn").onclick = $t),
    e("lockPin").addEventListener("keydown", (e) => {
      "Enter" === e.key && $t();
    }),
    (e("lockForgot").onclick = () => {
      confirm(
        "Forgot PIN? This erases all entries on this phone and removes the lock. You can restore them only from a backup file. Continue?",
      ) &&
        ([
          "pl_txns",
          "pl_accts",
          "pl_cats",
          "pl_plan",
          "pl_lock",
          "pl_backup_at",
          "pl_port",
          "pl_deleted",
          "pl_bk_snooze",
        ].forEach((e) => {
          try {
            localStorage.removeItem(e);
          } catch (e) {}
        }),
        location.reload());
    }),
    (e("setPinBtn").onclick = async () => {
      const t = e("newPin").value.trim(),
        n = e("newPin2").value.trim(),
        a = e("lockSetMsg");
      if (!/^\d{4,6}$/.test(t))
        return ((a.className = "msg err"), void (a.textContent = "Use 4 to 6 digits."));
      if (t !== n) return ((a.className = "msg err"), void (a.textContent = "The two PINs don't match."));
      if (!crypto.subtle)
        return (
          (a.className = "msg err"),
          void (a.textContent = "This browser can't set a PIN here. Open the app over https.")
        );
      try {
        (await kt(t),
          (e("newPin").value = ""),
          (e("newPin2").value = ""),
          (a.className = "msg"),
          (a.textContent = "App lock is on. You'll be asked for this PIN next time."),
          Ct());
      } catch (e) {
        ((a.className = "msg err"), (a.textContent = "Couldn't save the PIN."));
      }
    }),
    (e("changePinBtn").onclick = async () => {
      const t = e("lockSetMsg");
      if (!(await Mt())) return ((t.className = "msg err"), void (t.textContent = "Wrong PIN."));
      const n = prompt("New PIN (4 to 6 digits)");
      if (null !== n) {
        if (!/^\d{4,6}$/.test(n.trim()))
          return ((t.className = "msg err"), void (t.textContent = "Use 4 to 6 digits."));
        (await kt(n.trim()), (t.className = "msg"), (t.textContent = "PIN changed."));
      }
    }),
    (e("removePinBtn").onclick = async () => {
      const t = e("lockSetMsg");
      if (!(await Mt())) return ((t.className = "msg err"), void (t.textContent = "Wrong PIN."));
      (localStorage.removeItem("pl_lock"),
        Ct(),
        (t.className = "msg"),
        (t.textContent = "App lock removed."));
    }),
    document.addEventListener("visibilitychange", () => {
      document.hidden ? St() : ft();
    }),
    Ct(),
    xt() && St(),
    pt(),
    document.querySelectorAll(".subtabs[data-for]").forEach((e) => {
      const t = e.dataset.for,
        n = [...e.querySelectorAll("button")],
        a = (e) => {
          (n.forEach((t) => t.setAttribute("aria-selected", t.dataset.p === e)),
            document
              .querySelectorAll(`[data-panel^="${t}:"]`)
              .forEach((n) => (n.hidden = n.dataset.panel !== t + ":" + e)));
          try {
            localStorage.setItem("pl_sub_" + t, e);
          } catch (e) {}
        };
      e.addEventListener("click", (e) => {
        const t = e.target.closest("button");
        t && (a(t.dataset.p), t.scrollIntoView({ block: "nearest", inline: "nearest" }));
      });
      let o = null;
      try {
        o = localStorage.getItem("pl_sub_" + t);
      } catch (e) {}
      a(n.some((e) => e.dataset.p === o) ? o : n[0].dataset.p);
    }),
    (function () {
      ((M = (S("pl_txns") || []).map(D)), (L = S("pl_accts") || []));
      const e = S("pl_cats") || {};
      ((E = { expense: e.expense || [], income: e.income || [], invest: e.invest || [] }),
        (I = Object.assign(F(), S("pl_plan") || {})),
        (T = S("pl_deleted") || []));
    })(),
    (e("fDate").value = c()),
    Ce("expense"),
    X(),
    dt() && ft(),
    (e("updBtn").onclick = () => location.reload()),
    (e("bkWarnSave").onclick = () => e("expBtn").click()),
    (e("bkWarnLater").onclick = () => {
      try {
        localStorage.setItem("pl_bk_snooze", String(Date.now() + BK_SNOOZE_DAYS * 864e5));
      } catch (e) {}
      e("bkWarn").hidden = !0;
    }),
    // Ask the browser to keep this app's data even when the phone is low on space.
    (function () {
      const t = e("bkPersist"),
        show = (ok) => {
          t &&
            (t.textContent = ok
              ? "Storage: protected. Chrome won't clear this app's data on its own when the phone is low on space."
              : "Storage: not protected. Chrome may clear this app's data if the phone runs low on space, so keep regular backups. Installing the app to your home screen usually turns protection on.");
        };
      try {
        navigator.storage && navigator.storage.persisted
          ? navigator.storage
              .persisted()
              .then((ok) => (ok ? ok : navigator.storage.persist ? navigator.storage.persist() : !1))
              .then(show, () => show(!1))
          : show(!1);
      } catch (e) {
        show(!1);
      }
    })(),
    "serviceWorker" in navigator &&
      window.addEventListener("load", () =>
        navigator.serviceWorker
          .register("sw.js")
          .then((t) => {
            t.addEventListener("updatefound", () => {
              const n = t.installing;
              n &&
                n.addEventListener("statechange", () => {
                  "installed" === n.state && navigator.serviceWorker.controller && (e("updBar").hidden = !1);
                });
            });
          })
          .catch(() => {}),
      ));
})();
