const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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




app.get("/usuario/:id/", verifyToken, (req, res) => {


const datos = [
    {id: 1, cliente: "Santiago", total: 2500},
    {id: 2, cliente: "Alejandro", total: 2500},
    {id: 3, cliente: "Sebastian", total: 2500},
    {id: 4, cliente: "Javier", total: 2500}
];
res.json(datos);

});

app.listen(3001, () => {
    console.log("Servidor iniciado el puerto 3001");
})