const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./data_base/bd");
const app = express();


let bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

app.use(express.json());
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
    //console.log(authHeader);
    if (token == null)
        return res.status(401).send("Token requerido");
    jwt.verify(token, TOKEN_KEY, (err, user) => {
        if (err) return res.status(403).send("Token invalido");
        //console.log(user);
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
    if (usuario == use.rows[0]?.correo_usuario && clave == use.rows[0]?.documento_usuario) {

        const token = jwt.sign(
            { userId: use.rows[0].id_usuario, email: use.rows[0].correo_usuario },
            TOKEN_KEY,
            { expiresIn: "2h" }
        );

        //Traemos la información del usuario cuando ya se confirma la autenticación
        const info = await pool.query("SELECT id_usuario, nombre_usuario , nombre_rol , url_img_usuario FROM usuario INNER JOIN rol ON rol.id_rol = usuario.rol_usuario WHERE correo_usuario = $1;", [usuario]);
        let nDatos = { token, ...info.rows[0] };

        res.status(200).json(nDatos);
    } else {
        res.status(400).send("Credenciales incorrectas");
    }
});


/*----------- FIN AUTENTICACIÓN
Nombre
Nombre del rol
url_img

------------- */



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
        const cantidad = await pool.query(`SELECT count(1) AS cantidad FROM usuario;`)
        let count = cantidad.rows[0]['cantidad'];
        res.json({
            cantidad: count,
            result: usuarios.rows
        });
    } catch (err) {
        console.log(err)
    }
});


/* Creamos el API para la creación de un nuevo usuario */
app.post("/crearUsuario", verifyToken, async (req, res) => {
    const { nombre_usuario, documento_usuario, telefono_usuario, fecha_nacimiento_usuario, correo_usuario, estado_usuario, url_img_usuario, rol_usuario, id_admin } = req.body

    /* Validamos que el usuario no este creado primero */
    const verificarCorreo = await pool.query("SELECT correo_usuario FROM usuario WHERE correo_usuario = $1;", [req.body.correo_usuario]);
    if (verificarCorreo.rows != '') {
        if (verificarCorreo.rows[0].correo_usuario == req.body.correo_usuario) {
            res.status(400).send("El usuario ya existe :(");
        }
    } else { /* Si no esta creado entonces lo creamos */
        try {
            const crearUsuario = await pool.query(`INSERT INTO usuario(nombre_usuario , documento_usuario , telefono_usuario , fecha_nacimiento_usuario , correo_usuario , estado_usuario , url_img_usuario , rol_usuario) VALUES ('${nombre_usuario}', ${documento_usuario}, ${telefono_usuario}, '${fecha_nacimiento_usuario}', '${correo_usuario}', ${estado_usuario}, '${url_img_usuario}', ${rol_usuario});`);

            const id_barbero = await pool.query(`SELECT id_usuario FROM usuario WHERE correo_usuario = '${correo_usuario}'`);
            await pool.query(`INSERT INTO contratacion(id_admin , id_barbero) VALUES (${id_admin}, ${id_barbero.rows[0].id_usuario});`);

            res.status(200).send("Usuario creado con Exito :)");




        } catch (err) {
            console.log(err)
            res.status(400).send("Error en el query");
        }
    }
});



/* Creamos el API para actualizar la informacion de un usuario por su ID */
app.post("/editarUsuario/:id/", verifyToken, async (req, res) => {
    const { nombre_usuario, estado_usuario, url_img_usuario, telefono_usuario } = req.body;
    const { id } = req.params

    try {
        if (nombre_usuario !== "") {
            const actualizarNombre = await pool.query(`UPDATE usuario SET nombre_usuario = '${nombre_usuario}' WHERE id_usuario = ${id};`, function (err, result) {
                if (err) {
                    console.log(err + " Actualizando el Nombre")
                    res.status(400).send("Error en el query");
                    return console.error('error en el query', err);
                }

            });
        }
        if (estado_usuario !== "") {
            const actualizarEstado = await pool.query(`UPDATE usuario SET estado_usuario = ${estado_usuario} WHERE id_usuario = ${id};`, function (err, result) {
                if (err) {
                    console.log(err + " Actualizando el Estado")
                    res.status(400).send("Error en el query");
                    return console.error('error en el query', err);
                }

            });
        }
        if (url_img_usuario !== "") {
            const actualizarUrl = await pool.query(`UPDATE usuario SET url_img_usuario = '${url_img_usuario}' WHERE id_usuario = ${id};`, function (err, result) {
                if (err) {
                    console.log(err + " Actualizando el Url")
                    res.status(400).send("Error en el query");
                    return console.error('error en el query', err);
                }

            });
        }

        if (telefono_usuario !== "") {
            const actualizarTelefono = await pool.query(`UPDATE usuario SET telefono_usuario = ${telefono_usuario} WHERE id_usuario = ${id};`, function (err, result) {
                if (err) {
                    console.log(err + " Actualizando el Telefono")
                    res.status(400).send("Error en el query");
                    return console.error('error en el query', err);
                }

            });
        }
        res.status(200).send("Usuario actualizado con Exito :)");
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
            res.status(200).send("Usuario actualizado con Exito :)");
        });
    } catch (err) {
        console.log(err)
    }
});

/*----------- FIN USUARIOS ------------- */

/*----------- BARBEROS ------------- */


/* Creamos el API para obtener las citas registradas hoy por un barbero */
app.get("/serviciosHoy/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;
    try {
        let serviciosHoy = '';
        if (id === '0') {
            serviciosHoy = await pool.query(
                `select count(*) from historial as h
            join cita as c on c.id_cita = h.id_cita
            where to_char(c.fecha_cita, 'yy/mm/dd') = to_char(current_timestamp, 'yy/mm/dd');`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query', err);
                    }
                    res.json(result.rows[0].count);
                });
        } else {
            serviciosHoy = await pool.query(
                `select count(*) from historial as h
            join cita as c on c.id_cita = h.id_cita
            where to_char(c.fecha_cita, 'yy/mm/dd') = to_char(current_timestamp, 'yy/mm/dd') AND h.id_usuario =${id};`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query', err);
                    }
                    res.json(result.rows[0].count);
                });
        }


    } catch (err) {
        console.log(err)
    }
});

/* Creamos el API para obtener las citas registradas en el mes por un barbero */
app.get("/serviciosMes/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;
    try {
        let serviciosMes = '';
        if (id === '0') {
            serviciosMes = await pool.query(
                `select count(*) from historial as h
                join cita as c on c.id_cita = h.id_cita
                where to_char(c.fecha_cita, 'yy/mm/') = to_char(current_timestamp, 'yy/mm/');`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query', err);
                    }
                    res.json(result.rows[0].count);
                });
        } else {
            serviciosMes = await pool.query(
                `select count(*) from historial as h
                join cita as c on c.id_cita = h.id_cita
                where to_char(c.fecha_cita, 'yy/mm/') = to_char(current_timestamp, 'yy/mm/') AND h.id_usuario =${id};`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query', err);
                    }
                    res.json(result.rows[0].count);
                });
        }


    } catch (err) {
        console.log(err)
    }
});

/* Creamos el API para obtener el promedio de citas registradas por un barbero */
app.get("/serviciosPromedio/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;

    const verificarHistorial = await pool.query("select count(DISTINCT to_char(c.fecha_cita, 'yy/mm/dd')) from historial as h join cita as c on c.id_cita = h.id_cita where h.id_usuario = $1", [id]);
    if (verificarHistorial.rows[0].count == 0 && id != 0) {
        res.json(0);
    } else {
        try {
            let promedioServicios = '';
            if (id === '0') {
                promedioServicios = await pool.query(
                    `select 
            (select count(*) from historial as h
            join cita as c on c.id_cita = h.id_cita)
            / (select count(DISTINCT to_char(c.fecha_cita, 'yy/mm/dd')) from historial as h
            join cita as c on c.id_cita = h.id_cita) as resultado;`,
                    function (err, result) {
                        if (err) {
                            res.status(400).send("Error en el query");
                            return console.error('error en el query: ', err);
                        }

                        res.json(result.rows[0].resultado);
                    });
            } else {

                promedioServicios = await pool.query(
                    `select 
            (select count(*) from historial as h
            join cita as c on c.id_cita = h.id_cita where h.id_usuario = ${id})
            / (select count(DISTINCT to_char(c.fecha_cita, 'yy/mm/dd')) from historial as h
            join cita as c on c.id_cita = h.id_cita where h.id_usuario = ${id}) as resultado;`,
                    function (err, result) {
                        if (err) {
                            res.status(400).send("Error en el query");
                            return console.error('error en el query: ', err);
                        }
                        res.json(result.rows[0].resultado);
                    });
            }

        } catch (err) {
            console.log(err)
        }

    }
});


/* Creamos el API para obetener el historial de servicios que tiene el barbero */
app.get("/serviciosHistorial/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;

    try {
        const historialServicios = await pool.query(
            `SELECT s.nombre_servicio, to_char(c.fecha_cita,'yyyy-mm-dd HH12:MI:SS AM') as fecha_cita, s.precio_servicio, c.nombre_cliente FROM cita AS c
                JOIN historial AS h ON c.id_cita = h.id_cita
                JOIN servicio AS s ON s.id_servicio = c.id_servicio
                WHERE id_usuario = ${id}
                ORDER BY c.fecha_cita DESC;`,
            function (err, result) {
                if (err) {
                    res.status(400).send("Error en el query");
                    return console.error('error en el query: ', err);
                }
                res.json(result.rows);
            });

    } catch (err) {
        console.log(err)
    }

});


/* Creamos el API para obetener el historial de servicios que tiene el barbero, nombre del servicio y su precio */
app.get("/serviciosMesGrafico/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;

    try {
        let historialServicios = '';
        if (id === '0') {
            historialServicios = await pool.query(
                `SELECT s.nombre_servicio, count(*)  FROM cita AS c
                JOIN historial AS h ON c.id_cita = h.id_cita
                JOIN servicio AS s ON s.id_servicio = c.id_servicio
                WHERE to_char(current_timestamp, 'yy/mm/') = to_char(c.fecha_cita, 'yy/mm/') 
                GROUP BY s.nombre_servicio;`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query: ', err);
                    }
                    res.json(result.rows);
                });
        } else {
            historialServicios = await pool.query(
                `SELECT s.nombre_servicio, count(*)  FROM cita AS c
                JOIN historial AS h ON c.id_cita = h.id_cita
                JOIN servicio AS s ON s.id_servicio = c.id_servicio
                WHERE h.id_usuario = '${id}' AND to_char(current_timestamp, 'yy/mm/') = to_char(c.fecha_cita, 'yy/mm/') 
                GROUP BY s.nombre_servicio;`,
                function (err, result) {
                    if (err) {
                        res.status(400).send("Error en el query");
                        return console.error('error en el query: ', err);
                    }
                    res.json(result.rows);
                });
        }


    } catch (err) {
        console.log(err)
    }

});


/* Creamos el API para obetener el top 3 de barberos con mas servicios en el mes actual */
app.get("/serviciosTop/", verifyToken, async (req, res) => {
    try {
        const historialServicios = await pool.query(
            `select u.nombre_usuario, u.url_img_usuario, u.id_usuario, count(*) from historial as h
            join cita as c on c.id_cita = h.id_cita
            join usuario as u on u.id_usuario = h.id_usuario
            where to_char(c.fecha_cita, 'yy/mm/') = to_char(current_timestamp, 'yy/mm/')
            group by u.nombre_usuario, u.url_img_usuario, u.id_usuario
            ORDER BY count(*) DESC
            LIMIT 3
            `,
            function (err, result) {
                if (err) {
                    res.status(400).send("Error en el query");
                    return console.error('error en el query: ', err);
                }
                res.json(result.rows);
            });

    } catch (err) {
        console.log(err)
    }

});



/* Creamos el API para obtener todos los barberos */
app.get("/barberos", verifyToken, async (req, res) => {
    try {
        const barberos = await pool.query("SELECT * FROM usuario AS u JOIN rol AS r ON u.rol_usuario = r.id_rol WHERE r.nombre_rol = 'Barbero' ORDER BY nombre_usuario ASC;");
        const cantidad = await pool.query(`SELECT count(1) AS cantidad FROM usuario AS u JOIN rol AS r ON u.rol_usuario = r.id_rol WHERE r.nombre_rol = 'Barbero';`)
        let count = cantidad.rows[0]['cantidad'];
        res.json({
            cantidad: count,
            result: barberos.rows
        });
    } catch (err) {
        console.log(err)
    }
});

/*----------- FIN BARBEROS ------------- */

/*----------- CITAS ------------- */

/* Creamos el API para la creación de un nuevo usuario */
app.post("/crearCita", verifyToken, async (req, res) => {
    const { nombre_cliente, fecha_cita, id_servicio } = req.body
    try {
        const crearCita = await pool.query(`INSERT INTO cita(nombre_cliente, fecha_cita, id_servicio) VALUES ('${nombre_cliente}', '${fecha_cita}', ${id_servicio});`, function (err, result) {
            if (err) {
                res.status(400).send("Error en el query");
                return console.error('error en el query', err);
            }
            res.status(200).send("Cita creada con Exito :)");
        });


    } catch (err) {
        console.log(err)
    }

});

/* Creamos el API para obtener todos los roles */
app.post("/idCita", verifyToken, async (req, res) => {
    const { nombre_cliente, fecha_cita, id_servicio } = req.body

    try {
        const id_cita = await pool.query(`SELECT id_cita FROM cita WHERE nombre_cliente = '${nombre_cliente}' AND fecha_cita = '${fecha_cita}' AND id_servicio = ${id_servicio}`);
        res.json(id_cita.rows);
    } catch (err) {
        console.log(err)
    }
});


/*----------- FIN CITAS ------------- */


/*----------- HISTORIAL ------------- */

/* Creamos el API para la creación de un nuevo usuario */
app.post("/crearHistorial", verifyToken, async (req, res) => {
    const { id_usuario, id_cita } = req.body
    try {
        const crearCita = await pool.query(`INSERT INTO historial(id_usuario , id_cita ) VALUES (${id_usuario}, ${id_cita});`, function (err, result) {
            if (err) {
                res.status(400).send("Error en el query");
                return console.error('error en el query', err);
            }
            res.status(200).send("Historial creado con Exito :)");
        });
    } catch (err) {
        console.log(err)
    }

});

/*----------- FIN HISTORIAL ------------- */


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

/*----------- SERVICIOS ------------- */

/* Creamos el API para obtener todos los servicios */
app.get("/servicio", verifyToken, async (req, res) => {
    try {
        const servicios = await pool.query("SELECT * FROM servicio;");

        res.json(servicios.rows);
    } catch (err) {
        console.log(err)
    }
});

/* Creamos el API para obtener el precio de un servicio por su ID */
app.get("/servicio/:id/", verifyToken, async (req, res) => {
    let { id } = req.params;
    try {
        const servicio = await pool.query(`SELECT precio_servicio FROM servicio WHERE id_servicio = ${id};`);
        res.json(servicio.rows);
    } catch (err) {
        console.log(err)
    }
});


/*----------- FIN SERVICIOS ------------- */

/*----------- BUSQUEDA ------------- */
/* Creamos el API para obtener la busqueda con sus datos especificos */
app.post("/busqueda/:itemForSearch/", verifyToken, async (req, res) => {
    let { page } = req.body;
    let { type } = req.body;
    let { itemForSearch } = req.params;
    let limit = parseFloat(10);

    //let offset = (page - 1) * limit;
    try {
        let cantidad;
        let busqueda;
        if (type == 'usuarios') {

            cantidad = await pool.query(`SELECT 
    count(*) AS cantidad 
    FROM usuario AS u 
    JOIN estado AS e ON u.estado_usuario = e.id_estado
    JOIN rol AS r ON u.rol_usuario = r.id_rol
    WHERE
    (nombre_usuario LIKE '%${itemForSearch}%'
    OR documento_usuario LIKE '%${itemForSearch}%'
    OR telefono_usuario LIKE '%${itemForSearch}%'
    OR correo_usuario LIKE '%${itemForSearch}%'
    OR nombre_rol LIKE '%${itemForSearch}%'
    );`);

            busqueda = await pool.query(`SELECT 
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
    OR nombre_rol LIKE '%${itemForSearch}%'
    )
    LIMIT ${limit}
   
    ;`)
        } else {

            cantidad = await pool.query(`SELECT 
        count(*) AS cantidad 
        FROM usuario AS u 
        JOIN estado AS e ON u.estado_usuario = e.id_estado
        JOIN rol AS r ON u.rol_usuario = r.id_rol
        WHERE r.nombre_rol = 'Barbero' AND 
        (nombre_usuario LIKE '%${itemForSearch}%'
        OR documento_usuario LIKE '%${itemForSearch}%'
        OR telefono_usuario LIKE '%${itemForSearch}%'
        OR correo_usuario LIKE '%${itemForSearch}%'
        OR nombre_rol LIKE '%${itemForSearch}%'
        );`);

            busqueda = await pool.query(`SELECT 
        *
        FROM usuario AS u 
        JOIN estado AS e ON u.estado_usuario = e.id_estado
        JOIN rol AS r ON u.rol_usuario = r.id_rol
        WHERE r.nombre_rol = 'Barbero' AND 
        (nombre_usuario LIKE '%${itemForSearch}%'
        OR documento_usuario LIKE '%${itemForSearch}%'
        OR telefono_usuario LIKE '%${itemForSearch}%'
        OR correo_usuario LIKE '%${itemForSearch}%'
        OR nombre_estado LIKE '%${itemForSearch}%'
        OR nombre_rol LIKE '%${itemForSearch}%'
        )
        LIMIT ${limit}
       
        ;`)
        }



        let count = cantidad.rows[0]['cantidad'];

        //pages (cantidad total de paginas)
        let cantidadpages = Math.ceil(count / limit);

        //pagina anterior
        let previous = page - 1 == 0 ? null : page - 1;

        //pagina siguiente
        let next = page + 1 <= cantidadpages ? page + 1 : null;

        let data = {
            page: page,
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
