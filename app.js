const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./data_base/bd");

const app = express();
app.use(express.json());
app.use(cors());

const TOKEN_KEY = "x4TvnErxRETbVcqaLl5dqMI115eNlp5y";

app.use('/login', (req, res) => {
    res.send({
      token: TOKEN_KEY
    });
  });



const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(authHeader);
    if(token==null)
        return res.status(401).send("Token requerido");
    jwt.verify(token, TOKEN_KEY, (err, user)=>{
        if(err) return res.status(403).send("Token invalido");
        console.log(user);
        req.user = user;
        next();
    });
}

/* Creamos el API para el login con el webt token */

app.post("/usuario/login", (req, res) => {
    const usuario = req.body.usuario;
    const clave = req.body.clave;

    if (usuario == "administrador" && clave == "12345") {
        const datos = {
            id: "123",
            nombre: "Administrador",
            email: "santiagosancheze8.1@gmail.com"
        };

        const token = jwt.sign(
            {userId: datos.id, email: datos.email},
            TOKEN_KEY,
            {expiresIn: "2h"}
        );

        

            let nDatos = {...datos, token};
        res.status(200).json(nDatos);
    } else {
        res.status(400).send("Credenciales incorrectas");
    }
});

/* Creamos el API para obtener la informacion de un usuario por su ID */
app.get("/usuarios/:id/", verifyToken, async (req, res) => {

    try {
        const {id} = req.params;
        const usuarios = await pool.query("SELECT * FROM usuario WHERE id_usuario = $1;", [id]);
        res.json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});

/* Creamos el API para obtener todos los usuarios */
app.get("/usuarios/", async (req, res) => {
    try {
        console.log('holaa');
        const usuarios = await pool.query('SELECT * FROM usuario;');
        res.status(200).json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});

/* Creamos el API para obtener la informacion de un barbero por su ID */

app.get("/barberos/:id/", verifyToken, async (req, res) => {

    try {
        const {id} = req.params;
        const barberos = await pool.query("SELECT * FROM administrador WHERE estado_usuario = 1 AND id_usuario = $1;", [id]);
        res.json(barberos.rows);
    } catch (err) {
        console.log(err) 
    }
});

/* Creamos el API para obtener todos los barberos activos */

app.get("/barberos/", verifyToken, async (req, res) => {
    try {
        const barberos = await pool.query("SELECT * FROM usuario WHERE estado_usuario = 1;");
        res.json(barberos.rows);
    } catch (err) {
        console.log(err) 
    }
});

app.listen(3001, () => {
    console.log("Servidor iniciado el puerto 3001");
})