CREATE SEQUENCE SEQ_FINCA START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_SECTOR START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_PLAGA_ENFERMEDAD START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_ESTADO_ARBOL START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_TIPO_TRATAMIENTO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_PRODUCCION START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_TIPO_VAR_ARBOL START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_TIPO_FERTILIZANTE START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_ARBOL START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_REGISTRO_PLAGA START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_HISTORIAL_ESTADO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_REG_TRATAMIENTO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_RESIEMBRA START WITH 1 INCREMENT BY 1;



CREATE TABLE FINCA (
    id_finca NUMBER PRIMARY KEY,
    nombre_finca VARCHAR2(100) NOT NULL,
    ubicacion VARCHAR2(200),
    area_hectareas NUMBER(10,2),
    propietario VARCHAR2(150),
    telefono_contacto VARCHAR2(20),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N'))
);


CREATE TABLE SECTOR (
    id_sector NUMBER PRIMARY KEY,
    id_finca NUMBER NOT NULL,
    nombre_sector VARCHAR2(100),
    area_hectareas NUMBER(10,2),
    numero_surcos NUMBER,
    posiciones_por_surco NUMBER,
    tipo_cultivo VARCHAR2(80),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N')),
    FOREIGN KEY (id_finca) REFERENCES FINCA(id_finca)
);


CREATE TABLE ESTADO_ARBOL (
    id_estado NUMBER PRIMARY KEY,
    nombre_estado VARCHAR2(100) NOT NULL,
    orden_ciclo NUMBER,
    es_productivo CHAR(1) DEFAULT 'N' CHECK (es_productivo IN ('S','N')),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N'))
);


CREATE TABLE TIPO_VARIEDAD_ARBOL (
    id_tipo_arbol NUMBER PRIMARY KEY,
    nombre_arbol VARCHAR2(100),
    tipo_uso VARCHAR2(80),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N'))
);


CREATE TABLE ARBOL (
    id_arbol NUMBER PRIMARY KEY,
    id_sector NUMBER NOT NULL,
    id_tipo_variedad_arbol NUMBER NOT NULL,
    id_estado NUMBER NOT NULL,
    numero_surco NUMBER,
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N')),
    FOREIGN KEY (id_sector) REFERENCES SECTOR(id_sector),
    FOREIGN KEY (id_tipo_variedad_arbol) REFERENCES TIPO_VARIEDAD_ARBOL(id_tipo_arbol),
    FOREIGN KEY (id_estado) REFERENCES ESTADO_ARBOL(id_estado)
);


CREATE TABLE HISTORIAL_ESTADO (
    id_historial NUMBER PRIMARY KEY,
    id_arbol NUMBER NOT NULL,
    id_estado_anterior NUMBER,
    id_estado_nuevo NUMBER,
    fecha_cambio DATE NOT NULL,
    observaciones VARCHAR2(500),
    FOREIGN KEY (id_arbol) REFERENCES ARBOL(id_arbol),
    FOREIGN KEY (id_estado_anterior) REFERENCES ESTADO_ARBOL(id_estado),
    FOREIGN KEY (id_estado_nuevo) REFERENCES ESTADO_ARBOL(id_estado)
);


CREATE TABLE PLAGA_ENFERMEDAD (
    id_plaga NUMBER PRIMARY KEY,
    nombre_plaga VARCHAR2(100),
    tipo_plaga VARCHAR2(80),
    nivel_riesgo VARCHAR2(30) CHECK (nivel_riesgo IN ('BAJO','MEDIO','ALTO','CRITICO')),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S' CHECK (activo IN ('S','N'))
);



CREATE TABLE REGISTRO_PLAGA (
    id_registro NUMBER PRIMARY KEY,
    id_arbol NUMBER,
    id_plaga NUMBER,
    fecha_deteccion DATE,
    fecha_resolucion DATE,
    observaciones VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S',
    FOREIGN KEY (id_arbol) REFERENCES ARBOL(id_arbol),
    FOREIGN KEY (id_plaga) REFERENCES PLAGA_ENFERMEDAD(id_plaga)
);

CREATE TABLE TIPO_TRATAMIENTO (
    id_tipo_tratamiento NUMBER PRIMARY KEY,
    nombre_tratamiento VARCHAR2(100),
    categoria VARCHAR2(80),
    metodo_aplicacion VARCHAR2(150),
    frecuencia VARCHAR2(80),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S'
);

CREATE TABLE TIPO_FERTILIZANTE (
    id_fertilizante NUMBER PRIMARY KEY,
    nombre_fertilizante VARCHAR2(100),
    tipo_fertilizante VARCHAR2(80),
    nutrientes_principales VARCHAR2(200),
    metodo_aplicacion VARCHAR2(150),
    frecuencia VARCHAR2(80),
    descripcion VARCHAR2(500),
    activo CHAR(1) DEFAULT 'S'
);

CREATE TABLE REGISTRO_TRATAMIENTO (
    id_registro NUMBER PRIMARY KEY,
    id_arbol NUMBER NOT NULL,
    id_tipo_tratamiento NUMBER NOT NULL,
    id_fertilizante NUMBER,
    fecha_aplicacion DATE NOT NULL,
    observaciones VARCHAR2(500),
    FOREIGN KEY (id_arbol) REFERENCES ARBOL(id_arbol),
    FOREIGN KEY (id_tipo_tratamiento) REFERENCES TIPO_TRATAMIENTO(id_tipo_tratamiento),
    FOREIGN KEY (id_fertilizante) REFERENCES TIPO_FERTILIZANTE(id_fertilizante)
);


CREATE TABLE RESIEMBRA (
    id_resiembra NUMBER PRIMARY KEY,
    id_arbol_nuevo NUMBER,
    fecha_resiembra DATE,
    motivo VARCHAR2(500),
    FOREIGN KEY (id_arbol_nuevo) REFERENCES ARBOL(id_arbol)
);

