const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "c4nd4d0$",
    host: "localhost",
    port: 5432,
    database: "management"
})

module.exports = pool;