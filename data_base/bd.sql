CREATE DATABASE management;

/*Creamos la tabla Estado */
CREATE TABLE estado(
    id_estado INT,
    nombre_estado VARCHAR NULL, 
    PRIMARY KEY (id_estado)
);

/*Creamos la tabla Rol */
CREATE TABLE rol(
    id_rol SERIAL,
    nombre_rol VARCHAR NULL, 
    PRIMARY KEY (id_rol)
);

/*Creamos la tabla Usuario */
CREATE TABLE usuario(
    id_usuario SERIAL,
    nombre_usuario VARCHAR NULL, 
    documento_usuario INT NULL,
    telefono_usuario INT NULL,
    fecha_nacimiento_usuario DATE NULL,
    correo_usuario VARCHAR,
    url_img_usuario VARCHAR NULL,
    estado_usuario INT NULL,
    rol_usuario INT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (rol_usuario) REFERENCES rol(id_rol),
    FOREIGN KEY (estado_usuario) REFERENCES estado(id_estado)
);

/*Creamos la tabla Contrataciones */
CREATE TABLE contrataciones(
    id_contrataciones SERIAL,
    id_admin INT NULL,
    id_barbero INT NULL,
    PRIMARY KEY (id_contrataciones),
    FOREIGN KEY (id_admin) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_barbero) REFERENCES usuario(id_usuario)
);

/*Creamos la tabla Servicio */
CREATE TABLE servicio(
    id_servicio SERIAL,
    nombre_servicio VARCHAR NULL,
    precio_servicio INT NULL, 
    PRIMARY KEY (id_servicio)
);

/*Creamos la tabla Cita */
CREATE TABLE cita(
    id_cita SERIAL,
    nombre_cliente VARCHAR NULL,
    hora_cita DATE NULL,
    id_servicio INT NULL, 
    PRIMARY KEY (id_cita),
    FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
);


/*Creamos la tabla Historial */
CREATE TABLE historial(
    id_historial SERIAL,
    id_usuario INT NULL,
    id_cita INT NULL,
    PRIMARY KEY (id_historial),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_cita) REFERENCES cita(id_cita)
);

/* 
INSERT INTO usuario(nombre_usuario, documento_usuario)
VALUES('Administrador', 12345); */


INSERT INTO usuario(nombre_usuario,  correo_usuario , documento_usuario)
VALUES('Administrador', 'hola@gmail.com' , 12345); 

INSERT INTO usuario(nombre_usuario,  correo_usuario , documento_usuario)
VALUES('Alejandro', 'alejandrovillamilcarmona@gmail.com' , 1193142843); 

INSERT INTO usuario(nombre_usuario,  correo_usuario , documento_usuario)
VALUES('Santiago ', 'santiagosancheze8.1@gmail.com' , 1005784999); 

INSERT INTO usuario(nombre_usuario,  correo_usuario , documento_usuario)
VALUES('Javier ', 'javier.castrillon@correounivalle.edu.co' , 1006206865); 

INSERT INTO usuario(nombre_usuario,  correo_usuario , documento_usuario)
VALUES('Sebastian ', 'sebastian.rey@correounivalle.edu.co' , 119341658); 

INSERT INTO rol(nombre_rol)
VALUES('Administrador') , ('Barbero'); 

INSERT INTO estado
VALUES(1, 'Activo'),
(0, 'Deshabilitado')