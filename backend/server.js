import express from 'express'

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.get('/products', async (_req, res) => {
  try {
    const response = await fetch('https://dummyjson.com/products')
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function start(port) {
  const server = app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`)
  })

}
start(PORT)
