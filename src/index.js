const app = require('./app')

const port = process.env.PORT || 2341
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`)
})
