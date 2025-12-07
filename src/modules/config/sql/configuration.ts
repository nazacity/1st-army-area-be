import { registerAs } from '@nestjs/config'

// Local with mysql
// export default registerAs('sql', () => {
//   return {
//     type: process.env.DB_TYPE || 'mysql',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 3306,
//     username: process.env.DB_USERNAME || 'root',
//     password: process.env.DB_PASSWORD || 'tu101135',
//     database: process.env.DB_DATABASE || 'fitstudio',
//     synchronize: process.env.DB_SYNCHRONIZE === 'true',
//     logging: false,
//   }
// })

// Legacy Mssql
export default registerAs('sql', () => {
  return {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '101135',
    database: process.env.DB_DATABASE || 'armyarea',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: false,
  }
})
