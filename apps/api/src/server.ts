import 'dotenv/config'

import app from './app.js'
import sequelize from './database/connection.js'

const PORT = Number(process.env.PORT ?? 3000)

async function startServer() {
  try {
    await sequelize.authenticate()

    console.log('Conexión con MySQL establecida correctamente')

    app.listen(PORT, () => {
      console.log(
        `FileVerseX API ejecutándose en http://localhost:${PORT}`,
      )
    })
  } catch (error) {
    console.error('No fue posible conectar con MySQL:', error)
    process.exit(1)
  }
}

startServer()