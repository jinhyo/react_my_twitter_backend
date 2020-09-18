require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.DB_SECRET,
    database: "my_twitter",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: "0",
    timezone: "+09:00",
    logging: false
  },
  tst: {
    username: "root",
    password: process.env.DB_SECRET,
    database: "my_twitter",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
    operatorsAliases: false
  },
  poduction: {
    username: "root",
    password: process.env.DB_SECRET,
    database: "my_twitter",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
    operatorsAliases: false
  }
};
