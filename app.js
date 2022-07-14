const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./data_base/bd");
const app = express();
app.use(express.json());
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use(cors());

/*----------- AUTENTICACIÓN ------------- */

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
    if (token == null)
        return res.status(401).send("Token requerido");
    jwt.verify(token, TOKEN_KEY, (err, user) => {
        if (err) return res.status(403).send("Token invalido");
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
            { userId: use.rows[0].id_usuario, email: use.rows[0].correo_usuario },
            TOKEN_KEY,
            { expiresIn: "2h" }
        );

        let nDatos = { token, ...use.rows };
        res.status(200).json(nDatos);
    } else {
        res.status(400).send("Credenciales incorrectas");
    }
});

/*----------- FIN AUTENTICACIÓN ------------- */



/*----------- USUARIOS ------------- */

/* Creamos el API para obtener la informacion de un usuario por su ID */
app.get("/usuarios/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;
    try {
        const usuario = await pool.query(`SELECT * FROM usuario AS u
         JOIN estado AS e ON u.estado_usuario = e.id_estado
          JOIN rol AS r ON u.rol_usuario = r.id_rol WHERE id_usuario = ${id};`);
        res.json(usuario.rows);
    } catch (err) {
        console.log(err)
    }
});


/* Creamos el API para obtener todos los usuarios */
app.get("/usuarios", verifyToken, async (req, res) => {
    try {
        const usuarios = await pool.query("SELECT * FROM usuario ORDER BY nombre_usuario ASC;");
        res.json(usuarios.rows);
    } catch (err) {
        console.log(err)
    }
});


/* Creamos el API para la creación de un nuevo usuario */
app.post("/crearUsuario", verifyToken, async (req, res) => {
    const { nombre_usuario, documento_usuario, telefono_usuario, fecha_nacimiento_usuario, correo_usuario, estado_usuario, url_img_usuario, rol_usuario } = req.body

    /* Validamos que el usuario no este creado primero */
    const verificarCorreo = await pool.query("SELECT correo_usuario FROM usuario WHERE correo_usuario = $1;", [req.body.correo_usuario]);
    if (verificarCorreo.rows != '') {
        if (verificarCorreo.rows[0].correo_usuario == req.body.correo_usuario) {
            res.status(400).send("El usuario ya existe :(");
        }
    } else { /* Si no esta creado entonces lo creamos */
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



/* Creamos el API para actualizar la informacion de un usuario por su ID */
app.post("/editarUsuario/:id/", verifyToken, async (req, res) => {
    const { nombre_usuario, estado_usuario, url_img_usuario, telefono_usuario } = req.body;
    const { id } = req.params

    try {
        const actualizarUsuario = await pool.query(`UPDATE usuario SET nombre_usuario = '${nombre_usuario}' , url_img_usuario = '${url_img_usuario}' , estado_usuario = ${estado_usuario}, telefono_usuario = ${telefono_usuario}  WHERE id_usuario = ${id};`, function (err, result) {
            if (err) {
                console.log(err)
                res.status(400).send("Error en el query");
                return console.error('error en el query', err);
            }
            res.status(200).send("Usuario actualizado con Exito :)");
        });
    } catch (err) {
        console.log(err)
    }
});


/* Creamos el API para eliminar un usuario por su ID */
app.post("/eliminarUsuario/:id/", verifyToken, async (req, res) => {
    const { id } = req.params

    try {
        const borrarUsuario = await pool.query(`DELETE FROM usuario WHERE id_usuario = ${id};`, function (err, result) {
            if (err) {
                res.status(400).send("Error en el query");
                return console.error('error en el query', err);
            }
            res.status(200).send("Usuario eliminado con Exito :)");
        });
    } catch (err) {
        console.log(err)
    }
});

/*----------- FIN USUARIOS ------------- */


/*----------- ROLES ------------- */

/* Creamos el API para obtener todos los roles */
app.get("/roles", verifyToken, async (req, res) => {
    try {
        const roles = await pool.query("SELECT * FROM rol;");

        res.json(roles.rows);
    } catch (err) {
        console.log(err)
    }
});

/*----------- FIN ROLES ------------- */

/*----------- BUSQUEDA ------------- */
/* Creamos el API para obtener la busqueda con sus datos especificos */
app.post("/busqueda/:itemForSearch/", verifyToken, async (req, res) => {
    const { itemForSearch } = req.params;
    const { page } = req.body;
    let limit = parseFloat(10);

    try {
        const cantidad = await pool.query(`SELECT 
        count(*) AS cantidad 
        FROM usuario AS u 
        JOIN estado AS e ON u.estado_usuario = e.id_estado
        WHERE
        (nombre_usuario LIKE '%${itemForSearch}%'
        OR documento_usuario LIKE '%${itemForSearch}%'
        OR telefono_usuario LIKE '%${itemForSearch}%'
        OR correo_usuario LIKE '%${itemForSearch}%'
        OR nombre_estado LIKE '%${itemForSearch}%'
        );`);

        const busqueda = await pool.query(`SELECT 
        *
        FROM usuario AS u 
        JOIN estado AS e ON u.estado_usuario = e.id_estado
        JOIN rol AS r ON u.rol_usuario = r.id_rol
        WHERE
        (nombre_usuario LIKE '%${itemForSearch}%'
        OR documento_usuario LIKE '%${itemForSearch}%'
        OR telefono_usuario LIKE '%${itemForSearch}%'
        OR correo_usuario LIKE '%${itemForSearch}%'
        OR nombre_estado LIKE '%${itemForSearch}%'
        )
        LIMIT ${limit}
        ;`)

       
        let count = cantidad.rows[0]['cantidad'];

        //pages (cantidad total de paginas)
        let cantidadpages = Math.ceil(count / limit);

        //pagina anterior
        let previous = page - 1 == 0 ? null : page - 1;

        //pagina siguiente
        let next = page + 1 <= cantidadpages ? page + 1 : null;

        let data = {
            count: count,
            pages: cantidadpages,
            current_page: page,
            next: next,
            previous: previous,
            result: busqueda.rows,
            search: itemForSearch
        }

        res.json(data);
    } catch (err) {
        console.log(err)
    }
});



/*----------- FIN BUSQUEDA ------------- */

/*----------- SERVIDOR ------------- */

app.listen(3001, () => {
    console.log("Servidor iniciado el puerto 3001");
})

/*----------- FIN SERVIDOR ------------- */
