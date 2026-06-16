export default async (req) => {
    const body = await req.json()
    const { product_name, serving_size, kcal, sugar, fat, sat_fat, salt, nutrition_grade } = body
  
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: 'You are a plain-English food label translator. Return only valid JSON with: traffic_light ("green"/"amber"/"red"), key_stats (array of up to 4 objects with label, value, context), insight (one sentence), verdict (one short sentence).'
          },
          {
            role: 'user',
            content: `Product: ${product_name}\nServing: ${serving_size}\nCalories: $
            






