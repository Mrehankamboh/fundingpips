function parseSize(label) {
  const n = Number(String(label).replace(/[$,Kk]/g, ""));
  return Number.isFinite(n) ? n * 1000 : 0;
}

function formatSize(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return "";
  if (num >= 1000) return `$${Math.round(num / 1000)}K`;
  return `$${num}`;
}

const ZERO = {
  sizes: ["$5K", "$10K", "$25K", "$50K", "$100K", "$200K"],
  price: {
    "$5K": [60],
    "$10K": [88],
    "$25K": [188],
    "$50K": [244],
    "$100K": [444],
    "$200K": [888],
  },
};

const ONE = {
  sizes: ["$5K", "$10K", "$25K", "$50K", "$100K"],
  price: {
    "$5K": [74],
    "$10K": [111],
    "$25K": [255],
    "$50K": [353],
    "$100K": [666],
  },
};

const TWO = {
  sizes: ["$5K", "$10K", "$25K", "$50K", "$100K"],
  price: {
    "$5K": [39, 35, 29],
    "$10K": [72, 64, 55],
    "$25K": [195, 175, 145],
    "$50K": [349, 299, 249],
    "$100K": [652, 555, 466],
  },
  plans: ["2 Step Standard", "2 Step FLEX", "2 Step Pro"],
};

function fundingPipsPriceSeeds() {
  const rows = [];
  for (const size of ZERO.sizes) {
    rows.push({
      challenge_name: "Zero",
      account_size: parseSize(size),
      price: ZERO.price[size][0],
      leverage: "1:100",
    });
  }
  for (const size of ONE.sizes) {
    rows.push({
      challenge_name: "1 Step Flex",
      account_size: parseSize(size),
      price: ONE.price[size][0],
      leverage: "1:100",
    });
  }
  for (const size of TWO.sizes) {
    TWO.plans.forEach((name, i) => {
      rows.push({
        challenge_name: name,
        account_size: parseSize(size),
        price: TWO.price[size][i],
        leverage: "1:100",
      });
    });
  }
  return rows;
}

/** Build homepage PRICES shape from challenge_prices rows. */
function catalogFromRows(rows) {
  const catalog = {
    zero: { sizes: [...ZERO.sizes], price: {} },
    one: { sizes: [...ONE.sizes], price: {} },
    two: { sizes: [...TWO.sizes], price: {} },
  };
  for (const size of ZERO.sizes) catalog.zero.price[size] = [ZERO.price[size][0]];
  for (const size of ONE.sizes) catalog.one.price[size] = [ONE.price[size][0]];
  for (const size of TWO.sizes) catalog.two.price[size] = [...TWO.price[size]];

  for (const row of rows || []) {
    const size = formatSize(row.account_size);
    const name = String(row.challenge_name || "");
    const price = Number(row.price);
    if (!size || !Number.isFinite(price)) continue;
    if (name === "Zero" && catalog.zero.price[size]) {
      catalog.zero.price[size] = [price];
    } else if (name === "1 Step Flex" && catalog.one.price[size]) {
      catalog.one.price[size] = [price];
    } else if (name === "2 Step Standard" && catalog.two.price[size]) {
      catalog.two.price[size][0] = price;
    } else if (name === "2 Step FLEX" && catalog.two.price[size]) {
      catalog.two.price[size][1] = price;
    } else if (name === "2 Step Pro" && catalog.two.price[size]) {
      catalog.two.price[size][2] = price;
    }
  }
  return catalog;
}

/** Portal new-challenge shape: size -> { Standard, Flex, Pro }. */
function portalFromRows(rows) {
  const out = {};
  for (const size of ["$5K", "$10K", "$25K", "$50K", "$100K", "$200K"]) {
    out[size] = { Standard: 0, Flex: 0, Pro: 0 };
  }
  // defaults from TWO (+ $200K fallback)
  for (const size of TWO.sizes) {
    out[size] = {
      Standard: TWO.price[size][0],
      Flex: TWO.price[size][1],
      Pro: TWO.price[size][2],
    };
  }
  out["$200K"] = { Standard: 919, Flex: 919, Pro: 919 };

  for (const row of rows || []) {
    const size = formatSize(row.account_size);
    const name = String(row.challenge_name || "");
    const price = Number(row.price);
    if (!out[size] || !Number.isFinite(price)) continue;
    if (name === "2 Step Standard") out[size].Standard = price;
    if (name === "2 Step FLEX") out[size].Flex = price;
    if (name === "2 Step Pro") out[size].Pro = price;
  }
  return out;
}

function planToChallengeName(evaluationType, plan) {
  const type = String(evaluationType || "").toLowerCase();
  const p = String(plan || "").toLowerCase();
  if (type.includes("zero")) return "Zero";
  if (type.includes("1 step") || type.includes("one step")) return "1 Step Flex";
  if (p.includes("standard")) return "2 Step Standard";
  if (p.includes("pro")) return "2 Step Pro";
  if (p.includes("flex")) return "2 Step FLEX";
  return "2 Step FLEX";
}

module.exports = {
  fundingPipsPriceSeeds,
  catalogFromRows,
  portalFromRows,
  formatSize,
  planToChallengeName,
  ZERO,
  ONE,
  TWO,
};
