const DAILY_GUIDE = {
  kcal: 2000,
  sugar: 30,
  salt: 6,
  sat_fat: 20,
};

function isLikelyLiquid(text) {
  return /milk|drink|shake|juice|cola|soda|water|coffee|tea|smoothie|beer|wine|lemonade|squash|oat|ml\b|litre|liter|fluid/.test(
    text
  );
}

function parseServingMultiplier(servingSize, liquid) {
  if (!servingSize) return null;

  const ml = servingSize.match(/([\d.]+)\s*ml/i);
  if (ml) return { multiplier: parseFloat(ml[1]) / 100, label: servingSize };

  const g = servingSize.match(/([\d.]+)\s*g/i);
  if (g) return { multiplier: parseFloat(g[1]) / 100, label: servingSize };

  if (liquid && /bottle|can/.test(servingSize.toLowerCase())) {
    const isCan = /can/.test(servingSize.toLowerCase());
    const mlAmount = isCan ? 330 : 500;
    return {
      multiplier: mlAmount / 100,
      label: isCan ? "1 can (~330ml)" : "1 bottle (~500ml)",
    };
  }

  return null;
}

function guessPortion(productName, userQuery, liquid) {
  const text = `${productName} ${userQuery || ""}`.toLowerCase();

  if (liquid) {
    if (/bottle/.test(text)) return { multiplier: 5, label: "1 bottle (~500ml)" };
    if (/can/.test(text)) return { multiplier: 3.3, label: "1 can (~330ml)" };
    return { multiplier: 2.4, label: "1 cup (~240ml)" };
  }

  if (/bar\b|protein bar/.test(text))
    return { multiplier: 0.5, label: "1 bar (~50g)" };
  if (/crisp|chip|popcorn/.test(text))
    return { multiplier: 0.3, label: "1 handful (~30g)" };
  if (/biscuit|cookie|digestive/.test(text))
    return { multiplier: 0.25, label: "2 biscuits (~25g)" };
  if (/yoghurt|yogurt|pot/.test(text))
    return { multiplier: 1.5, label: "1 pot (~150g)" };

  return { multiplier: 0.4, label: "1 serving (~40g)" };
}

function scale(value, multiplier) {
  if (value == null) return null;
  return Math.round(value * multiplier * 10) / 10;
}

export function dailyComparison(value, dailyMax, unit, nutrient) {
  if (value == null || dailyMax == null || value <= 0) return null;

  const share = value / dailyMax;

  if (nutrient === "kcal") {
    if (share < 0.1) return "A small slice of your daily energy";
    if (share < 0.25) return `About ${Math.round(share * 100)}% of a typical day's calories`;
    if (share < 0.5) return `Roughly ${Math.round(share * 10) / 10}× a light snack's worth of calories`;
    if (share < 1) return `Nearly half a day's calories in one go`;
    return `Over a full day's calories — this is a big one`;
  }

  if (nutrient === "sugar") {
    if (share < 0.15) return "Barely touches your daily sugar";
    if (share < 0.35) return `About ${Math.round(share * 100)}% of a day's sugar — totally fine`;
    if (share < 0.7) return `Around a third to half your daily sugar in one serving`;
    if (share < 1) return `Most of a day's sugar in one serving`;
    return `More sugar than you'd want in a whole day`;
  }

  if (nutrient === "salt") {
    if (share < 0.1) return "Hardly any salt";
    if (share < 0.25) return `About ${Math.round(share * 100)}% of your daily salt`;
    if (share < 0.5) return `A fair chunk of a day's salt`;
    return `A lot of salt for one serving`;
  }

  if (nutrient === "sat_fat") {
    if (share < 0.15) return "Low saturated fat";
    if (share < 0.35) return `About ${Math.round(share * 100)}% of a day's sat fat`;
    return `On the higher side for saturated fat`;
  }

  const times = dailyMax / value;
  if (times >= 5) return `You could have about ${Math.round(times)} of these before hitting a day's ${unit}`;
  if (times >= 2) return `About ${Math.round(times)} of these ≈ one day's ${unit}`;
  return `One serving is a big hit of ${unit} for the day`;
}

export function toEverydayPortion({
  product_name,
  user_query,
  serving_size,
  per100g,
  kcal,
  sugar,
  fat,
  sat_fat,
  salt,
}) {
  const text = `${product_name} ${user_query || ""} ${serving_size || ""}`.toLowerCase();
  const liquid = isLikelyLiquid(text);

  let portion;
  let isEstimate = false;

  if (!per100g && serving_size) {
    const parsed = parseServingMultiplier(serving_size, liquid);
    portion = parsed || guessPortion(product_name, user_query, liquid);
    isEstimate = !parsed;
  } else {
    portion = guessPortion(product_name, user_query, liquid);
    isEstimate = true;
  }

  const { multiplier, label } = portion;

  return {
    portion_label: label,
    portion_is_estimate: isEstimate,
    per100g,
    liquid,
    kcal: scale(kcal, multiplier),
    sugar: scale(sugar, multiplier),
    fat: scale(fat, multiplier),
    sat_fat: scale(sat_fat, multiplier),
    salt: scale(salt, multiplier),
    daily_guide: DAILY_GUIDE,
  };
}
