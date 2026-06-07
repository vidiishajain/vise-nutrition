import { dailyComparison, toEverydayPortion } from "./everydayServings.js";

function formatNum(n) {
  if (n == null) return null;
  return Math.round(n * 10) / 10;
}

function toEverydayMeasure(value, type) {
  if (value == null) return null;
  switch (type) {
    case "sugar": {
      const t = value / 4;
      if (t < 0.3) return "almost no sugar";
      if (t < 0.75) return "½ teaspoon of sugar";
      if (t < 1.25) return "1 teaspoon of sugar";
      if (t < 1.75) return "1½ teaspoons of sugar";
      return `${Math.round(t)} teaspoons of sugar`;
    }
    case "salt": {
      const t = value / 6;
      if (t < 0.08) return "a trace of salt";
      if (t < 0.2) return "⅛ teaspoon of salt";
      if (t < 0.4) return "¼ teaspoon of salt";
      if (t < 0.65) return "½ teaspoon of salt";
      if (t < 0.9) return "¾ teaspoon of salt";
      if (t < 1.25) return "1 teaspoon of salt";
      return `${+(t.toFixed(1))} teaspoons of salt`;
    }
    case "fat": {
      const t = value / 14;
      if (t < 0.2) return "barely any fat";
      if (t < 0.6) return "½ tablespoon of fat";
      if (t < 1.25) return "1 tablespoon of fat";
      if (t < 1.75) return "1½ tablespoons of fat";
      return `${Math.round(t)} tablespoons of fat`;
    }
    case "sat_fat": {
      const t = value / 5;
      if (t < 0.25) return "a trace of sat fat";
      if (t < 0.75) return "½ teaspoon of butter's worth";
      if (t < 1.25) return "1 teaspoon of butter's worth";
      if (t < 1.75) return "1½ teaspoons of butter's worth";
      return `${Math.round(t)} teaspoons of butter's worth`;
    }
    default:
      return null;
  }
}

function calcPercent(value, daily) {
  if (value == null || !daily) return null;
  return Math.min(100, Math.round((value / daily) * 100));
}

function trafficLight({ kcal, sugar, salt, sat_fat }) {
  let score = 0;
  if (sugar != null && sugar > 15) score += 2;
  else if (sugar != null && sugar > 5) score += 1;
  if (salt != null && salt > 1.5) score += 2;
  else if (salt != null && salt > 0.6) score += 1;
  if (sat_fat != null && sat_fat > 5) score += 2;
  else if (sat_fat != null && sat_fat > 2) score += 1;
  if (kcal != null && kcal > 400) score += 1;
  if (score >= 4) return "red";
  if (score >= 2) return "amber";
  return "green";
}

export function generateLocalAnalysis(productData) {
  const { product_name } = productData;
  const portion = toEverydayPortion(productData);
  const { portion_label, kcal, sugar, fat, sat_fat, salt } = portion;
  const light = trafficLight({ kcal, sugar, salt, sat_fat });

  const key_stats = [];

  if (kcal != null) {
    key_stats.push({
      label: "Calories",
      value: `${formatNum(kcal)} kcal`,
      context:
        dailyComparison(kcal, portion.daily_guide.kcal, "calories", "kcal") ||
        `In one ${portion_label.toLowerCase()}`,
      percent: calcPercent(kcal, portion.daily_guide.kcal),
    });
  }

  if (sugar != null) {
    key_stats.push({
      label: "Sugar",
      value: toEverydayMeasure(sugar, "sugar") || `${formatNum(sugar)}g of sugar`,
      context:
        dailyComparison(sugar, portion.daily_guide.sugar, "sugar", "sugar") ||
        (sugar < 5 ? "Nice and low" : "Worth a glance if you're watching sugar"),
      percent: calcPercent(sugar, portion.daily_guide.sugar),
    });
  }

  if (salt != null) {
    key_stats.push({
      label: "Salt",
      value: toEverydayMeasure(salt, "salt") || "a trace of salt",
      context:
        salt < 0.05
          ? "Hardly any salt"
          : dailyComparison(salt, portion.daily_guide.salt, "salt", "salt") ||
            "Pretty low",
      percent: calcPercent(salt, portion.daily_guide.salt),
    });
  }

  if (sat_fat != null) {
    key_stats.push({
      label: "Saturated Fat",
      value: toEverydayMeasure(sat_fat, "sat_fat") || `${formatNum(sat_fat)}g sat fat`,
      context:
        dailyComparison(sat_fat, portion.daily_guide.sat_fat, "saturated fat", "sat_fat") ||
        "Nothing wild here",
      percent: calcPercent(sat_fat, portion.daily_guide.sat_fat),
    });
  } else if (fat != null) {
    key_stats.push({
      label: "Fat",
      value: toEverydayMeasure(fat, "fat") || `${formatNum(fat)}g of fat`,
      context: fat < 3 ? "Pretty lean" : "Moderate",
      percent: calcPercent(fat, portion.daily_guide.fat ?? 70),
    });
  }

  const estimateNote = portion.portion_is_estimate
    ? " (estimated from a typical portion — the label didn't spell it out)"
    : "";

  const insights = {
    green: `Honestly? For ${portion_label.toLowerCase()}, ${product_name} is in decent shape${estimateNote}. Nothing here should raise eyebrows.`,
    amber: `${portion_label} of ${product_name} isn't bad — just maybe not your third one today${estimateNote}.`,
    red: `Okay, ${portion_label.toLowerCase()} of ${product_name} packs a punch${estimateNote}. Good to know before you commit!`,
  };

  const verdicts = {
    green: "Crack on — this one's a solid pick.",
    amber: "Totally fine now and then. Just maybe not your everyday go-to.",
    red: "Enjoy it when you fancy — just probably not your new daily habit.",
  };

  return {
    traffic_light: light,
    key_stats,
    insight: insights[light],
    verdict: verdicts[light],
    portion_label: portion.portion_label,
    portion_is_estimate: portion.portion_is_estimate,
  };
}
