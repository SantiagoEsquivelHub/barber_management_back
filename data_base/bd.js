const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "pg123",
    host: "localhost",
    port: 5432,
    database: "management"
})


module.exports = pool;