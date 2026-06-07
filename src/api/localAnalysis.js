import { dailyComparison, toEverydayPortion } from "./everydayServings.js";

function formatNum(n) {
  if (n == null) return null;
  return Math.round(n * 10) / 10;
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
    });
  }

  if (sugar != null) {
    key_stats.push({
      label: "Sugar",
      value: `${formatNum(sugar)}g`,
      context:
        dailyComparison(sugar, portion.daily_guide.sugar, "sugar", "sugar") ||
        (sugar < 5
          ? "Nice and low"
          : "Worth a glance if you're watching sugar"),
    });
  }

  if (salt != null) {
    const saltDisplay =
      salt < 0.01
        ? "a trace"
        : salt < 1
          ? `${Math.max(1, Math.round(salt * 1000))}mg`
          : `${formatNum(salt)}g`;
    key_stats.push({
      label: "Salt",
      value: saltDisplay,
      context:
        salt < 0.05
          ? "Hardly any salt"
          : dailyComparison(salt, portion.daily_guide.salt, "salt", "salt") ||
            "Pretty low",
    });
  }

  if (sat_fat != null) {
    key_stats.push({
      label: "Saturated Fat",
      value: `${formatNum(sat_fat)}g`,
      context:
        dailyComparison(
          sat_fat,
          portion.daily_guide.sat_fat,
          "saturated fat",
          "sat_fat"
        ) || "Nothing wild here",
    });
  } else if (fat != null) {
    key_stats.push({
      label: "Fat",
      value: `${formatNum(fat)}g`,
      context: fat < 3 ? "Pretty lean" : "Moderate",
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
