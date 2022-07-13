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
app.post("/usuario/login", async (req, res) => {
    const usuario = req.body.usuario;
    const clave = req.body.clave;
    const use = await pool.query("SELECT correo_usuario , documento_usuario , id_usuario FROM usuario WHERE correo_usuario = $1;", [usuario]);
    console.log(use.rows[0]);
    if (usuario == use.rows[0].correo_usuario && clave == use.rows[0].documento_usuario) {
       
        const token = jwt.sign(
            {userId: use.rows[0].id_usuario, email: use.rows[0].correo_usuario },
            TOKEN_KEY,
            {expiresIn: "2h"}
        );

        let nDatos = {token, ...use.rows};
        res.status(200).json(nDatos);
    } else {
        res.status(400).send("Credenciales incorrectas");
    }
});

/* Creamos el API para obtener la informacion de un usuario por su ID */
app.get("/usuarios/:id_usuario/", verifyToken, async (req, res) => {
    try {
        const {id_usuario} = req.params;
        const usuarios = await pool.query("SELECT * FROM usuario WHERE id_usuario = $1;", [id_usuario]);
        res.json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});


/* Creamos el API para obtener todos los usuarios */
app.get("/usuarios", verifyToken , async (req, res) => {
    try {
        const usuarios = await pool.query("SELECT * FROM usuario;");

        res.json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});

/* Creamos el API para obtener todos los roles*/
app.get("/roles", verifyToken , async (req, res) => {
    try {
        const roles = await pool.query("SELECT * FROM rol;");

        res.json(roles.rows);
    } catch (err) {
        console.log(err) 
    }
});



/* Creamos el API para la creación de un nuevo usuario */
app.post("/usuario", verifyToken , async (req, res) => {
    const { nombre_usuario , documento_usuario , telefono_usuario , fecha_nacimiento_usuario , correo_usuario , estado_usuario , url_img_usuario , rol_usuario } = req.body 
    
    /* Validamos que el usuario no este creado primero */
    const verificarCorreo = await pool.query("SELECT correo_usuario FROM usuario WHERE correo_usuario = $1;", [req.body.correo_usuario]);
    if (verificarCorreo.rows != ''){
        if (verificarCorreo.rows[0].correo_usuario == req.body.correo_usuario){
            res.status(400).send("El usuario ya existe :(");
        }
    }else{ /* Si no esta creado entonces lo creamos */
        try {
            const crearUsuario = await pool.query(`INSERT INTO usuario(nombre_usuario , documento_usuario , telefono_usuario , fecha_nacimiento_usuario , correo_usuario , estado_usuario , url_img_usuario , rol_usuario) VALUES ('${nombre_usuario}', ${documento_usuario}, ${telefono_usuario}, '${fecha_nacimiento_usuario}', '${correo_usuario}', ${estado_usuario}, '${url_img_usuario}', ${rol_usuario});`, function (err, result) {
                if (err) {
                    res.status(400).send("Error en el query");
                    return console.error('error en el query', err);
                }
                res.status(200).send("Usuario creado con Exito :)");
            });
        } catch (err) {
            console.log(err) 
        }
    }
});



/* Creamos el API para actualizar la informacion de un usuario por su ID ----- Falta por revisar funcionalidad ----- */ 
app.get("/usuarios/:id/", verifyToken, async (req, res) => {
    try {
        const {nombre_usuario , documento_usuario , telefono_usuario , fecha_nacimiento_usuario , correo_usuario , estado_usuario} = req.params;
        const usuarios = await pool.query("UPDATE usuario SET  WHERE id_usuario = $1;", [id]);
        res.json(usuarios.rows);
    } catch (err) {
        console.log(err) 
    }
});


