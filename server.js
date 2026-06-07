import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Serve React build files
app.use(express.static(path.join(__dirname, 'dist')))

// API endpoint
app.post('/api/analyse', async (req, res) => {
  const { product_name, serving_size, kcal, sugar, fat, sat_fat, salt, nutrition_grade } = req.body

  try {
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
            content: `You are a plain-English food label translator. Return only valid JSON with these fields: traffic_light ("green"/"amber"/"red"), key_stats (array of up to 4 objects with label, value, context), insight (one sentence), verdict (one short sentence). Be honest, specific, never preachy.`
          },
          {
            role: 'user',
            content: `Product: ${product_name}\nServing size: ${serving_size}\nCalories: ${kcal}kcal\nSugar: ${sugar}g\nFat: ${fat}g\nSaturated fat: ${sat_fat}g\nSalt: ${salt}g\nNutri-score: ${nutrition_grade}`
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.choices[0].message.content
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    res.json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// All other routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
