const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./database/bd");

const app = express();
app.use(express.json());
app.use(cors());

const TOKEN_KEY = "x4TvnErxRETbVcqaLl5dqMI115eNlp5y";

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


app.get("/usuarios/:id/", verifyToken, async (req, res) => {

    try {
        const {id} = req.params;
        const usuario = await pool.query("SELECT * FROM barbero WHERE id_barbero = $1;", [id]);
        res.json(usuario.rows);
    } catch (err) {
        console.log(err) 
    }
});

app.get("/usuarios/", verifyToken, async (req, res) => {
    try {
        const usuarios = await pool.query("SELECT * FROM barbero;");
        res.json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});

app.listen(3001, () => {
    console.log("Servidor iniciado el puerto 3001");
})