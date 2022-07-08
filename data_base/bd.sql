

/*Creamos la base de datos*/
CREATE DATABASE management;


/*Creamos la tabla Administrador */
CREATE TABLE administrador(
    id_admin SERIAL,
    nombre_admin VARCHAR NULL, 
    documento_admin INT NULL,
    telefono_admin INT NULL,
    fecha_nacimiento_admin DATE NULL,
    rol_admin INT NULL,
    url_img_admin VARCHAR NULL,
    PRIMARY KEY (id_admin)
);

/*Creamos la tabla Barberos */
CREATE TABLE barbero(
    id_barbero SERIAL,
    nombre_barbero VARCHAR NULL,
    documento_barbero INT NULL,
    telefono_barbero INT NULL,
    fecha_nacimiento_admin DATE NULL,
    rol_barbero INT NULL,
    salario_barbero INT NULL,
    url_img_barbero VARCHAR NULL,
    estado_barbero INT NULL,
    PRIMARY KEY (id_barbero)
);


/*Creamos la tabla de Contrataciones */
CREATE TABLE contratacion(
    id_contratacion SERIAL,
    id_barbero INT NOT NULL,
    id_admin INT NOT NULL, 
    PRIMARY KEY (id_contratacion),
    FOREIGN KEY (id_barbero) REFERENCES barbero(id_barbero),
    FOREIGN KEY (id_admin) REFERENCES administrador(id_admin)
);

/*Creamos la tabla de Servicios*/
CREATE TABLE servicio(
    id_servicio SERIAL,
    nombre_servicio VARCHAR NOT NULL,
    precio_servicio MONEY NULL, 
    PRIMARY KEY (id_servicio)
);


/*Creamos la tabla de Historial para el registro de los servicios*/
CREATE TABLE historial(
    id_historial SERIAL,
    id_barbero INT NULL,
    id_servicio INT NULL, 
    fecha_servicio DATE NULL,
    PRIMARY KEY (id_historial),
    FOREIGN KEY (id_barbero) REFERENCES barbero(id_barbero),
    FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
);
