-- =============================================================
--  SISTEMA DE GESTIÓN DE ÁRBOLES
--  Script completo de base de datos Oracle
--  Esquema: GESTIONARBOLES
--  Generado: Mayo 2025
--
--  Orden de ejecución:
--    1. Secuencias
--    2. Tablas (sin FK primero, luego con FK)
--    3. Paquetes PL/SQL (spec + body)
--    4. Datos iniciales
-- =============================================================


-- =============================================================
-- SECCIÓN 1: SECUENCIAS
-- =============================================================

CREATE SEQUENCE SEQ_ROL
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_USUARIO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_SESION
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_AUDITORIA
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_FINCA
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_SECTOR
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_ESTADO_ARBOL
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_TIPO_VAR_ARBOL
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_ARBOL
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_HISTORIAL_ESTADO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_PLAGA_ENFERMEDAD
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_REGISTRO_PLAGA
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_TIPO_TRATAMIENTO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_TIPO_FERTILIZANTE
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_REG_TRATAMIENTO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_RESIEMBRA
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_MOVIMIENTO_INVENTARIO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_TIPO_MOVIMIENTO_INVENTARIO
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;

CREATE SEQUENCE SEQ_PRODUCCION
  MINVALUE 1 MAXVALUE 9999999999999999999999999999
  INCREMENT BY 1 START WITH 1 NOCACHE NOORDER NOCYCLE;


-- =============================================================
-- SECCIÓN 2: TABLAS
-- Orden: tablas sin FK primero, luego las que dependen de ellas
-- =============================================================

-- ------- Tablas raíz (sin FK) --------------------------------

CREATE TABLE ROL (
    ID_ROL        NUMBER        NOT NULL,
    NOMBRE_ROL    VARCHAR2(50)  NOT NULL,
    DESCRIPCION   VARCHAR2(200),
    ACTIVO        CHAR(1)       DEFAULT 'S',
    FECHA_CREACION DATE         DEFAULT SYSDATE,
    CONSTRAINT PK_ROL        PRIMARY KEY (ID_ROL),
    CONSTRAINT CHK_ROL_ACTIVO CHECK (ACTIVO IN ('S','N'))
);

CREATE TABLE FINCA (
    ID_FINCA           NUMBER        NOT NULL,
    NOMBRE_FINCA       VARCHAR2(100) NOT NULL,
    UBICACION          VARCHAR2(200),
    AREA_HECTAREAS     NUMBER(10,2),
    PROPIETARIO        VARCHAR2(150),
    TELEFONO_CONTACTO  VARCHAR2(20),
    DESCRIPCION        VARCHAR2(500),
    ACTIVO             CHAR(1)       DEFAULT 'S',
    ANCHO              NUMBER(10,2),
    LARGO              NUMBER(10,2),
    CONSTRAINT PK_FINCA        PRIMARY KEY (ID_FINCA),
    CONSTRAINT CHK_FINCA_ACTIVO CHECK (ACTIVO IN ('S','N'))
);

CREATE TABLE ESTADO_ARBOL (
    ID_ESTADO      NUMBER        NOT NULL,
    NOMBRE_ESTADO  VARCHAR2(100) NOT NULL,
    ORDEN_CICLO    NUMBER,
    ES_PRODUCTIVO  CHAR(1)       DEFAULT 'N',
    DESCRIPCION    VARCHAR2(500),
    ACTIVO         CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_ESTADO_ARBOL        PRIMARY KEY (ID_ESTADO),
    CONSTRAINT CHK_ESTADO_PRODUCTIVO  CHECK (ES_PRODUCTIVO IN ('S','N')),
    CONSTRAINT CHK_ESTADO_ACTIVO      CHECK (ACTIVO IN ('S','N'))
);

CREATE TABLE TIPO_VARIEDAD_ARBOL (
    ID_TIPO_ARBOL  NUMBER        NOT NULL,
    NOMBRE_ARBOL   VARCHAR2(100),
    TIPO_USO       VARCHAR2(80),
    DESCRIPCION    VARCHAR2(500),
    ACTIVO         CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_TIPO_VARIEDAD_ARBOL  PRIMARY KEY (ID_TIPO_ARBOL),
    CONSTRAINT CHK_TVA_ACTIVO          CHECK (ACTIVO IN ('S','N'))
);

CREATE TABLE PLAGA_ENFERMEDAD (
    ID_PLAGA      NUMBER        NOT NULL,
    NOMBRE_PLAGA  VARCHAR2(100),
    TIPO_PLAGA    VARCHAR2(80),
    NIVEL_RIESGO  VARCHAR2(30),
    DESCRIPCION   VARCHAR2(500),
    ACTIVO        CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_PLAGA_ENFERMEDAD    PRIMARY KEY (ID_PLAGA),
    CONSTRAINT CHK_PLAGA_RIESGO       CHECK (NIVEL_RIESGO IN ('BAJO','MEDIO','ALTO','CRITICO')),
    CONSTRAINT CHK_PLAGA_ACTIVO       CHECK (ACTIVO IN ('S','N'))
);

CREATE TABLE TIPO_TRATAMIENTO (
    ID_TIPO_TRATAMIENTO  NUMBER        NOT NULL,
    NOMBRE_TRATAMIENTO   VARCHAR2(100),
    CATEGORIA            VARCHAR2(80),
    METODO_APLICACION    VARCHAR2(150),
    FRECUENCIA           VARCHAR2(80),
    DESCRIPCION          VARCHAR2(500),
    ACTIVO               CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_TIPO_TRATAMIENTO PRIMARY KEY (ID_TIPO_TRATAMIENTO)
);

CREATE TABLE TIPO_FERTILIZANTE (
    ID_FERTILIZANTE         NUMBER        NOT NULL,
    NOMBRE_FERTILIZANTE     VARCHAR2(100),
    TIPO_FERTILIZANTE       VARCHAR2(80),
    NUTRIENTES_PRINCIPALES  VARCHAR2(200),
    METODO_APLICACION       VARCHAR2(150),
    FRECUENCIA              VARCHAR2(80),
    DESCRIPCION             VARCHAR2(500),
    ACTIVO                  CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_TIPO_FERTILIZANTE PRIMARY KEY (ID_FERTILIZANTE)
);

CREATE TABLE TIPO_MOVIMIENTO_INVENTARIO (
    ID_TIPO_MOVIMIENTO  NUMBER        GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    NOMBRE              VARCHAR2(50)  NOT NULL,
    DESCRIPCION         VARCHAR2(200),
    CONSTRAINT PK_TIPO_MOV_INV PRIMARY KEY (ID_TIPO_MOVIMIENTO)
);

CREATE TABLE AUDITORIA (
    ID_AUDITORIA   NUMBER        NOT NULL,
    TABLA          VARCHAR2(60)  NOT NULL,
    OPERACION      VARCHAR2(20)  NOT NULL,
    ID_REGISTRO    NUMBER,
    DESCRIPCION    VARCHAR2(500),
    USUARIO_ID     NUMBER,
    USUARIO_NOMBRE VARCHAR2(100),
    FECHA          DATE          DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_AUDITORIA       PRIMARY KEY (ID_AUDITORIA),
    CONSTRAINT CHK_AUD_OPERACION  CHECK (OPERACION IN ('INSERT','UPDATE','DELETE'))
);

-- ------- Tablas con FK de nivel 1 ----------------------------

CREATE TABLE USUARIO (
    ID_USUARIO     NUMBER        NOT NULL,
    ROL_ID         NUMBER        NOT NULL,
    USERNAME       VARCHAR2(80)  NOT NULL,
    PASSWORD_HASH  VARCHAR2(255) NOT NULL,
    NOMBRES        VARCHAR2(100),
    APELLIDOS      VARCHAR2(100),
    EMAIL          VARCHAR2(150),
    TELEFONO       VARCHAR2(20),
    ESTADO         VARCHAR2(20)  DEFAULT 'ACTIVO',
    FECHA_CREACION DATE          DEFAULT SYSDATE,
    ULTIMO_ACCESO  DATE,
    ACTIVO         CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_USUARIO        PRIMARY KEY (ID_USUARIO),
    CONSTRAINT UQ_USERNAME       UNIQUE (USERNAME),
    CONSTRAINT UQ_EMAIL          UNIQUE (EMAIL),
    CONSTRAINT CHK_USU_ESTADO    CHECK (ESTADO IN ('ACTIVO','INACTIVO','BLOQUEADO')),
    CONSTRAINT CHK_USU_ACTIVO    CHECK (ACTIVO IN ('S','N')),
    CONSTRAINT FK_USU_ROL        FOREIGN KEY (ROL_ID) REFERENCES ROL(ID_ROL)
);

CREATE TABLE SECTOR (
    ID_SECTOR            NUMBER        NOT NULL,
    ID_FINCA             NUMBER        NOT NULL,
    NOMBRE_SECTOR        VARCHAR2(100),
    AREA_HECTAREAS       NUMBER(10,2),
    NUMERO_SURCOS        NUMBER,
    POSICIONES_POR_SURCO NUMBER,
    TIPO_CULTIVO         VARCHAR2(80),
    ACTIVO               CHAR(1)       DEFAULT 'S',
    CONSTRAINT PK_SECTOR        PRIMARY KEY (ID_SECTOR),
    CONSTRAINT CHK_SEC_ACTIVO   CHECK (ACTIVO IN ('S','N')),
    CONSTRAINT FK_SEC_FINCA     FOREIGN KEY (ID_FINCA) REFERENCES FINCA(ID_FINCA)
);

-- ------- Tablas con FK de nivel 2 ----------------------------

CREATE TABLE SESION_USUARIO (
    ID_SESION    NUMBER       NOT NULL,
    ID_USUARIO   NUMBER       NOT NULL,
    FECHA_INICIO DATE         DEFAULT SYSDATE,
    FECHA_FIN    DATE,
    IP_ORIGEN    VARCHAR2(50),
    ACTIVA       CHAR(1)      DEFAULT 'S',
    CONSTRAINT PK_SESION_USUARIO  PRIMARY KEY (ID_SESION),
    CONSTRAINT CHK_SES_ACTIVA     CHECK (ACTIVA IN ('S','N')),
    CONSTRAINT FK_SES_USUARIO     FOREIGN KEY (ID_USUARIO) REFERENCES USUARIO(ID_USUARIO)
);

CREATE TABLE ARBOL (
    ID_ARBOL               NUMBER        NOT NULL,
    ID_SECTOR              NUMBER        NOT NULL,
    ID_TIPO_VARIEDAD_ARBOL NUMBER        NOT NULL,
    ID_ESTADO              NUMBER        NOT NULL,
    NUMERO_SURCO           NUMBER,
    DESCRIPCION            VARCHAR2(500),
    ACTIVO                 CHAR(1)       DEFAULT 'S',
    POSICION_X             NUMBER(10,2),
    POSICION_Y             NUMBER(10,2),
    CONSTRAINT PK_ARBOL         PRIMARY KEY (ID_ARBOL),
    CONSTRAINT CHK_ARBOL_ACTIVO CHECK (ACTIVO IN ('S','N')),
    CONSTRAINT FK_ARBOL_SECTOR  FOREIGN KEY (ID_SECTOR)              REFERENCES SECTOR(ID_SECTOR),
    CONSTRAINT FK_ARBOL_TIPO    FOREIGN KEY (ID_TIPO_VARIEDAD_ARBOL) REFERENCES TIPO_VARIEDAD_ARBOL(ID_TIPO_ARBOL),
    CONSTRAINT FK_ARBOL_ESTADO  FOREIGN KEY (ID_ESTADO)              REFERENCES ESTADO_ARBOL(ID_ESTADO)
);

-- ------- Tablas con FK de nivel 3 ----------------------------

CREATE TABLE HISTORIAL_ESTADO (
    ID_HISTORIAL        NUMBER        NOT NULL,
    ID_ARBOL            NUMBER        NOT NULL,
    ID_ESTADO_ANTERIOR  NUMBER,
    ID_ESTADO_NUEVO     NUMBER,
    FECHA_CAMBIO        DATE          NOT NULL,
    OBSERVACIONES       VARCHAR2(500),
    USUARIO_CAMBIO      VARCHAR2(100),
    CONSTRAINT PK_HISTORIAL_ESTADO   PRIMARY KEY (ID_HISTORIAL),
    CONSTRAINT FK_HIST_ARBOL         FOREIGN KEY (ID_ARBOL)           REFERENCES ARBOL(ID_ARBOL),
    CONSTRAINT FK_HIST_EST_ANTERIOR  FOREIGN KEY (ID_ESTADO_ANTERIOR)  REFERENCES ESTADO_ARBOL(ID_ESTADO),
    CONSTRAINT FK_HIST_EST_NUEVO     FOREIGN KEY (ID_ESTADO_NUEVO)     REFERENCES ESTADO_ARBOL(ID_ESTADO)
);

CREATE TABLE REGISTRO_PLAGA (
    ID_REGISTRO       NUMBER       NOT NULL,
    ID_ARBOL          NUMBER,
    ID_PLAGA          NUMBER,
    FECHA_DETECCION   DATE,
    FECHA_RESOLUCION  DATE,
    OBSERVACIONES     VARCHAR2(500),
    ACTIVO            CHAR(1)      DEFAULT 'S',
    CONSTRAINT PK_REGISTRO_PLAGA  PRIMARY KEY (ID_REGISTRO),
    CONSTRAINT FK_RP_ARBOL        FOREIGN KEY (ID_ARBOL) REFERENCES ARBOL(ID_ARBOL),
    CONSTRAINT FK_RP_PLAGA        FOREIGN KEY (ID_PLAGA) REFERENCES PLAGA_ENFERMEDAD(ID_PLAGA)
);

CREATE TABLE REGISTRO_TRATAMIENTO (
    ID_REGISTRO           NUMBER    NOT NULL,
    ID_ARBOL              NUMBER    NOT NULL,
    ID_TIPO_TRATAMIENTO   NUMBER    NOT NULL,
    ID_FERTILIZANTE       NUMBER,
    FECHA_APLICACION      DATE      NOT NULL,
    OBSERVACIONES         VARCHAR2(500),
    CONSTRAINT PK_REGISTRO_TRATAMIENTO  PRIMARY KEY (ID_REGISTRO),
    CONSTRAINT FK_RT_ARBOL              FOREIGN KEY (ID_ARBOL)            REFERENCES ARBOL(ID_ARBOL),
    CONSTRAINT FK_RT_TIPO_TRAT          FOREIGN KEY (ID_TIPO_TRATAMIENTO) REFERENCES TIPO_TRATAMIENTO(ID_TIPO_TRATAMIENTO),
    CONSTRAINT FK_RT_FERTILIZANTE       FOREIGN KEY (ID_FERTILIZANTE)     REFERENCES TIPO_FERTILIZANTE(ID_FERTILIZANTE)
);

CREATE TABLE RESIEMBRA (
    ID_RESIEMBRA     NUMBER        NOT NULL,
    ID_ARBOL_NUEVO   NUMBER,
    FECHA_RESIEMBRA  DATE,
    MOTIVO           VARCHAR2(500),
    CONSTRAINT PK_RESIEMBRA    PRIMARY KEY (ID_RESIEMBRA),
    CONSTRAINT FK_RE_ARBOL     FOREIGN KEY (ID_ARBOL_NUEVO) REFERENCES ARBOL(ID_ARBOL)
);

CREATE TABLE MOVIMIENTO_INVENTARIO_ARBOL (
    ID_MOVIMIENTO           NUMBER        GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    ID_ARBOL                NUMBER        NOT NULL,
    ID_TIPO_MOVIMIENTO      NUMBER        NOT NULL,
    ID_SECTOR_ORIGEN        NUMBER,
    ID_SECTOR_DESTINO       NUMBER,
    FECHA_MOVIMIENTO        DATE          DEFAULT SYSDATE NOT NULL,
    OBSERVACION             VARCHAR2(500),
    USUARIO_REGISTRO        VARCHAR2(100),
    FECHA_APLICACION        DATE,
    FECHA_PROXIMA_REVISION  DATE,
    CONSTRAINT PK_MOV_INV          PRIMARY KEY (ID_MOVIMIENTO),
    CONSTRAINT FK_MOV_ARBOL        FOREIGN KEY (ID_ARBOL)           REFERENCES ARBOL(ID_ARBOL),
    CONSTRAINT FK_MOV_TIPO         FOREIGN KEY (ID_TIPO_MOVIMIENTO) REFERENCES TIPO_MOVIMIENTO_INVENTARIO(ID_TIPO_MOVIMIENTO),
    CONSTRAINT FK_MOV_SEC_ORIGEN   FOREIGN KEY (ID_SECTOR_ORIGEN)   REFERENCES SECTOR(ID_SECTOR),
    CONSTRAINT FK_MOV_SEC_DESTINO  FOREIGN KEY (ID_SECTOR_DESTINO)  REFERENCES SECTOR(ID_SECTOR)
);


-- =============================================================
-- SECCIÓN 3: PAQUETES PL/SQL
-- =============================================================

-- ------- PKG_AUDITORIA ---------------------------------------

CREATE OR REPLACE PACKAGE PKG_AUDITORIA AS
    PROCEDURE REGISTRAR(
        p_tabla          IN VARCHAR2,
        p_operacion      IN VARCHAR2,
        p_id_registro    IN NUMBER   DEFAULT NULL,
        p_descripcion    IN VARCHAR2 DEFAULT NULL,
        p_usuario_id     IN NUMBER   DEFAULT NULL,
        p_usuario_nombre IN VARCHAR2 DEFAULT 'Sistema'
    );
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE LISTAR_RECIENTES(
        p_limite IN NUMBER DEFAULT 100,
        p_cursor OUT SYS_REFCURSOR
    );
    PROCEDURE LISTAR_POR_TABLA(
        p_tabla  IN  VARCHAR2,
        p_cursor OUT SYS_REFCURSOR
    );
END PKG_AUDITORIA;
/

CREATE OR REPLACE PACKAGE BODY PKG_AUDITORIA AS

    PROCEDURE REGISTRAR(
        p_tabla          IN VARCHAR2,
        p_operacion      IN VARCHAR2,
        p_id_registro    IN NUMBER   DEFAULT NULL,
        p_descripcion    IN VARCHAR2 DEFAULT NULL,
        p_usuario_id     IN NUMBER   DEFAULT NULL,
        p_usuario_nombre IN VARCHAR2 DEFAULT 'Sistema'
    ) AS
    BEGIN
        INSERT INTO AUDITORIA (
            id_auditoria, tabla, operacion, id_registro,
            descripcion, usuario_id, usuario_nombre, fecha
        ) VALUES (
            SEQ_AUDITORIA.NEXTVAL,
            UPPER(p_tabla), UPPER(p_operacion),
            p_id_registro, p_descripcion,
            p_usuario_id, NVL(p_usuario_nombre, 'Sistema'),
            SYSTIMESTAMP
        );
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END REGISTRAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_auditoria, tabla, operacion, id_registro,
                   descripcion, usuario_id, usuario_nombre, fecha
            FROM AUDITORIA ORDER BY fecha DESC;
    END LISTAR;

    PROCEDURE LISTAR_RECIENTES(
        p_limite IN NUMBER DEFAULT 100,
        p_cursor OUT SYS_REFCURSOR
    ) AS
        v_limite NUMBER := LEAST(NVL(p_limite, 100), 200);
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM (
                SELECT id_auditoria, tabla, operacion, id_registro,
                       descripcion, usuario_id, usuario_nombre, fecha
                FROM AUDITORIA ORDER BY fecha DESC
            ) WHERE ROWNUM <= v_limite;
    END LISTAR_RECIENTES;

    PROCEDURE LISTAR_POR_TABLA(
        p_tabla  IN  VARCHAR2,
        p_cursor OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_auditoria, tabla, operacion, id_registro,
                   descripcion, usuario_id, usuario_nombre, fecha
            FROM AUDITORIA
            WHERE tabla = UPPER(p_tabla)
            ORDER BY fecha DESC;
    END LISTAR_POR_TABLA;

END PKG_AUDITORIA;
/

-- ------- PKG_ROL ---------------------------------------------

CREATE OR REPLACE PACKAGE PKG_ROL AS
    PROCEDURE INSERTAR(p_nombre_rol IN ROL.nombre_rol%TYPE, p_descripcion IN ROL.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_rol IN ROL.id_rol%TYPE, p_nombre_rol IN ROL.nombre_rol%TYPE, p_descripcion IN ROL.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_rol IN ROL.id_rol%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_rol IN ROL.id_rol%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_ROL;
/

CREATE OR REPLACE PACKAGE BODY PKG_ROL AS

    PROCEDURE INSERTAR(p_nombre_rol IN ROL.nombre_rol%TYPE, p_descripcion IN ROL.descripcion%TYPE) AS
    BEGIN
        INSERT INTO ROL (id_rol, nombre_rol, descripcion)
        VALUES (SEQ_ROL.NEXTVAL, p_nombre_rol, p_descripcion);
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END INSERTAR;

    PROCEDURE ACTUALIZAR(p_id_rol IN ROL.id_rol%TYPE, p_nombre_rol IN ROL.nombre_rol%TYPE, p_descripcion IN ROL.descripcion%TYPE) AS
    BEGIN
        UPDATE ROL SET nombre_rol = p_nombre_rol, descripcion = p_descripcion WHERE id_rol = p_id_rol;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END ACTUALIZAR;

    PROCEDURE ELIMINAR(p_id_rol IN ROL.id_rol%TYPE) AS
    BEGIN
        UPDATE ROL SET activo = 'N' WHERE id_rol = p_id_rol;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_rol, nombre_rol, descripcion, activo, fecha_creacion
            FROM ROL WHERE activo = 'S' ORDER BY id_rol;
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_rol IN ROL.id_rol%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_rol, nombre_rol, descripcion, activo, fecha_creacion
            FROM ROL WHERE id_rol = p_id_rol;
    END OBTENER_POR_ID;

END PKG_ROL;
/

-- ------- PKG_USUARIO -----------------------------------------

CREATE OR REPLACE PACKAGE PKG_USUARIO AS
    PROCEDURE INSERTAR(
        p_rol_id IN USUARIO.rol_id%TYPE, p_username IN USUARIO.username%TYPE,
        p_password_hash IN USUARIO.password_hash%TYPE, p_nombres IN USUARIO.nombres%TYPE,
        p_apellidos IN USUARIO.apellidos%TYPE, p_email IN USUARIO.email%TYPE,
        p_telefono IN USUARIO.telefono%TYPE, p_estado IN USUARIO.estado%TYPE
    );
    PROCEDURE ACTUALIZAR(
        p_id_usuario IN USUARIO.id_usuario%TYPE, p_rol_id IN USUARIO.rol_id%TYPE,
        p_username IN USUARIO.username%TYPE, p_nombres IN USUARIO.nombres%TYPE,
        p_apellidos IN USUARIO.apellidos%TYPE, p_email IN USUARIO.email%TYPE,
        p_telefono IN USUARIO.telefono%TYPE, p_estado IN USUARIO.estado%TYPE
    );
    PROCEDURE CAMBIAR_PASSWORD(p_id_usuario IN USUARIO.id_usuario%TYPE, p_password_hash IN USUARIO.password_hash%TYPE);
    PROCEDURE ELIMINAR(p_id_usuario IN USUARIO.id_usuario%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_usuario IN USUARIO.id_usuario%TYPE, p_cursor OUT SYS_REFCURSOR);
    PROCEDURE LOGIN(p_username IN USUARIO.username%TYPE, p_cursor OUT SYS_REFCURSOR);
    PROCEDURE ACTUALIZAR_ULTIMO_ACCESO(p_id_usuario IN USUARIO.id_usuario%TYPE);
END PKG_USUARIO;
/

CREATE OR REPLACE PACKAGE BODY PKG_USUARIO AS

    PROCEDURE INSERTAR(
        p_rol_id IN USUARIO.rol_id%TYPE, p_username IN USUARIO.username%TYPE,
        p_password_hash IN USUARIO.password_hash%TYPE, p_nombres IN USUARIO.nombres%TYPE,
        p_apellidos IN USUARIO.apellidos%TYPE, p_email IN USUARIO.email%TYPE,
        p_telefono IN USUARIO.telefono%TYPE, p_estado IN USUARIO.estado%TYPE
    ) AS
    BEGIN
        INSERT INTO USUARIO (id_usuario, rol_id, username, password_hash, nombres, apellidos, email, telefono, estado)
        VALUES (SEQ_USUARIO.NEXTVAL, p_rol_id, p_username, p_password_hash,
                p_nombres, p_apellidos, p_email, p_telefono, NVL(p_estado, 'ACTIVO'));
        COMMIT;
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'El username o email ya existe.');
        WHEN OTHERS THEN ROLLBACK; RAISE;
    END INSERTAR;

    PROCEDURE ACTUALIZAR(
        p_id_usuario IN USUARIO.id_usuario%TYPE, p_rol_id IN USUARIO.rol_id%TYPE,
        p_username IN USUARIO.username%TYPE, p_nombres IN USUARIO.nombres%TYPE,
        p_apellidos IN USUARIO.apellidos%TYPE, p_email IN USUARIO.email%TYPE,
        p_telefono IN USUARIO.telefono%TYPE, p_estado IN USUARIO.estado%TYPE
    ) AS
    BEGIN
        UPDATE USUARIO SET rol_id = p_rol_id, username = p_username,
            nombres = p_nombres, apellidos = p_apellidos,
            email = p_email, telefono = p_telefono, estado = p_estado
        WHERE id_usuario = p_id_usuario;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END ACTUALIZAR;

    PROCEDURE CAMBIAR_PASSWORD(p_id_usuario IN USUARIO.id_usuario%TYPE, p_password_hash IN USUARIO.password_hash%TYPE) AS
    BEGIN
        UPDATE USUARIO SET password_hash = p_password_hash WHERE id_usuario = p_id_usuario;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END CAMBIAR_PASSWORD;

    PROCEDURE ELIMINAR(p_id_usuario IN USUARIO.id_usuario%TYPE) AS
    BEGIN
        UPDATE USUARIO SET activo = 'N', estado = 'INACTIVO' WHERE id_usuario = p_id_usuario;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT u.id_usuario, u.rol_id, r.nombre_rol, u.username,
                   u.nombres, u.apellidos, u.email, u.telefono,
                   u.estado, u.fecha_creacion, u.ultimo_acceso
            FROM USUARIO u JOIN ROL r ON r.id_rol = u.rol_id
            WHERE u.activo = 'S' ORDER BY u.id_usuario;
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_usuario IN USUARIO.id_usuario%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT u.id_usuario, u.rol_id, r.nombre_rol, u.username,
                   u.nombres, u.apellidos, u.email, u.telefono,
                   u.estado, u.fecha_creacion, u.ultimo_acceso
            FROM USUARIO u JOIN ROL r ON r.id_rol = u.rol_id
            WHERE u.id_usuario = p_id_usuario AND u.activo = 'S';
    END OBTENER_POR_ID;

    PROCEDURE LOGIN(p_username IN USUARIO.username%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT u.id_usuario, u.rol_id, r.nombre_rol, u.username,
                   u.nombres, u.apellidos, u.email, u.password_hash, u.estado
            FROM USUARIO u JOIN ROL r ON r.id_rol = u.rol_id
            WHERE u.username = p_username AND u.activo = 'S' AND u.estado = 'ACTIVO';
    END LOGIN;

    PROCEDURE ACTUALIZAR_ULTIMO_ACCESO(p_id_usuario IN USUARIO.id_usuario%TYPE) AS
    BEGIN
        UPDATE USUARIO SET ultimo_acceso = SYSDATE WHERE id_usuario = p_id_usuario;
        COMMIT;
    END ACTUALIZAR_ULTIMO_ACCESO;

END PKG_USUARIO;
/

-- ------- PKG_FINCA -------------------------------------------

CREATE OR REPLACE PACKAGE PKG_FINCA AS
    PROCEDURE INSERTAR(
        p_nombre_finca IN FINCA.nombre_finca%TYPE, p_ubicacion IN FINCA.ubicacion%TYPE,
        p_area_hectareas IN FINCA.area_hectareas%TYPE, p_propietario IN FINCA.propietario%TYPE,
        p_telefono_contacto IN FINCA.telefono_contacto%TYPE, p_descripcion IN FINCA.descripcion%TYPE
    );
    PROCEDURE ACTUALIZAR(
        p_id_finca IN FINCA.id_finca%TYPE, p_nombre_finca IN FINCA.nombre_finca%TYPE,
        p_ubicacion IN FINCA.ubicacion%TYPE, p_area_hectareas IN FINCA.area_hectareas%TYPE,
        p_propietario IN FINCA.propietario%TYPE, p_telefono_contacto IN FINCA.telefono_contacto%TYPE,
        p_descripcion IN FINCA.descripcion%TYPE
    );
    PROCEDURE ELIMINAR(p_id_finca IN FINCA.id_finca%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_finca IN FINCA.id_finca%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_FINCA;
/

CREATE OR REPLACE PACKAGE BODY PKG_FINCA AS

    PROCEDURE INSERTAR(
        p_nombre_finca IN FINCA.nombre_finca%TYPE, p_ubicacion IN FINCA.ubicacion%TYPE,
        p_area_hectareas IN FINCA.area_hectareas%TYPE, p_propietario IN FINCA.propietario%TYPE,
        p_telefono_contacto IN FINCA.telefono_contacto%TYPE, p_descripcion IN FINCA.descripcion%TYPE
    ) AS
    BEGIN
        INSERT INTO FINCA (id_finca, nombre_finca, ubicacion, area_hectareas,
                           propietario, telefono_contacto, descripcion, activo)
        VALUES (SEQ_FINCA.NEXTVAL, p_nombre_finca, p_ubicacion, p_area_hectareas,
                p_propietario, p_telefono_contacto, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'Error al insertar FINCA: ' || SQLERRM);
    END INSERTAR;

    PROCEDURE ACTUALIZAR(
        p_id_finca IN FINCA.id_finca%TYPE, p_nombre_finca IN FINCA.nombre_finca%TYPE,
        p_ubicacion IN FINCA.ubicacion%TYPE, p_area_hectareas IN FINCA.area_hectareas%TYPE,
        p_propietario IN FINCA.propietario%TYPE, p_telefono_contacto IN FINCA.telefono_contacto%TYPE,
        p_descripcion IN FINCA.descripcion%TYPE
    ) AS
    BEGIN
        UPDATE FINCA SET nombre_finca = p_nombre_finca, ubicacion = p_ubicacion,
            area_hectareas = p_area_hectareas, propietario = p_propietario,
            telefono_contacto = p_telefono_contacto, descripcion = p_descripcion
        WHERE id_finca = p_id_finca AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'No se encontro FINCA con ID: ' || p_id_finca);
        END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar FINCA: ' || SQLERRM);
    END ACTUALIZAR;

    PROCEDURE ELIMINAR(p_id_finca IN FINCA.id_finca%TYPE) AS
    BEGIN
        UPDATE FINCA SET activo = 'N' WHERE id_finca = p_id_finca AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'No se encontro FINCA con ID: ' || p_id_finca);
        END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar FINCA: ' || SQLERRM);
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_finca, nombre_finca, ubicacion, area_hectareas,
                   propietario, telefono_contacto, descripcion, activo
            FROM FINCA WHERE activo = 'S' ORDER BY id_finca;
    EXCEPTION WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20004, 'Error al listar FINCA: ' || SQLERRM);
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_finca IN FINCA.id_finca%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT id_finca, nombre_finca, ubicacion, area_hectareas,
                   propietario, telefono_contacto, descripcion, activo
            FROM FINCA WHERE id_finca = p_id_finca AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20005, 'Error al obtener FINCA por ID: ' || SQLERRM);
    END OBTENER_POR_ID;

END PKG_FINCA;
/

-- ------- PKG_SECTOR ------------------------------------------

CREATE OR REPLACE PACKAGE PKG_SECTOR AS
    PROCEDURE INSERTAR(
        p_id_finca IN SECTOR.id_finca%TYPE, p_nombre_sector IN SECTOR.nombre_sector%TYPE,
        p_area_hectareas IN SECTOR.area_hectareas%TYPE, p_numero_surcos IN SECTOR.numero_surcos%TYPE,
        p_posiciones_por_surco IN SECTOR.posiciones_por_surco%TYPE, p_tipo_cultivo IN SECTOR.tipo_cultivo%TYPE
    );
    PROCEDURE ACTUALIZAR(
        p_id_sector IN SECTOR.id_sector%TYPE, p_id_finca IN SECTOR.id_finca%TYPE,
        p_nombre_sector IN SECTOR.nombre_sector%TYPE, p_area_hectareas IN SECTOR.area_hectareas%TYPE,
        p_numero_surcos IN SECTOR.numero_surcos%TYPE, p_posiciones_por_surco IN SECTOR.posiciones_por_surco%TYPE,
        p_tipo_cultivo IN SECTOR.tipo_cultivo%TYPE
    );
    PROCEDURE ELIMINAR(p_id_sector IN SECTOR.id_sector%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_sector IN SECTOR.id_sector%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_SECTOR;
/

CREATE OR REPLACE PACKAGE BODY PKG_SECTOR AS

    PROCEDURE INSERTAR(
        p_id_finca IN SECTOR.id_finca%TYPE, p_nombre_sector IN SECTOR.nombre_sector%TYPE,
        p_area_hectareas IN SECTOR.area_hectareas%TYPE, p_numero_surcos IN SECTOR.numero_surcos%TYPE,
        p_posiciones_por_surco IN SECTOR.posiciones_por_surco%TYPE, p_tipo_cultivo IN SECTOR.tipo_cultivo%TYPE
    ) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM FINCA WHERE id_finca = p_id_finca AND activo = 'S';
        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'La FINCA con ID ' || p_id_finca || ' no existe o esta inactiva.');
        END IF;
        INSERT INTO SECTOR (id_sector, id_finca, nombre_sector, area_hectareas,
                            numero_surcos, posiciones_por_surco, tipo_cultivo, activo)
        VALUES (SEQ_SECTOR.NEXTVAL, p_id_finca, p_nombre_sector, p_area_hectareas,
                p_numero_surcos, p_posiciones_por_surco, p_tipo_cultivo, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'Error al insertar SECTOR: ' || SQLERRM);
    END INSERTAR;

    PROCEDURE ACTUALIZAR(
        p_id_sector IN SECTOR.id_sector%TYPE, p_id_finca IN SECTOR.id_finca%TYPE,
        p_nombre_sector IN SECTOR.nombre_sector%TYPE, p_area_hectareas IN SECTOR.area_hectareas%TYPE,
        p_numero_surcos IN SECTOR.numero_surcos%TYPE, p_posiciones_por_surco IN SECTOR.posiciones_por_surco%TYPE,
        p_tipo_cultivo IN SECTOR.tipo_cultivo%TYPE
    ) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM FINCA WHERE id_finca = p_id_finca AND activo = 'S';
        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'La FINCA con ID ' || p_id_finca || ' no existe o esta inactiva.');
        END IF;
        UPDATE SECTOR SET id_finca = p_id_finca, nombre_sector = p_nombre_sector,
            area_hectareas = p_area_hectareas, numero_surcos = p_numero_surcos,
            posiciones_por_surco = p_posiciones_por_surco, tipo_cultivo = p_tipo_cultivo
        WHERE id_sector = p_id_sector AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'No se encontro SECTOR con ID: ' || p_id_sector);
        END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar SECTOR: ' || SQLERRM);
    END ACTUALIZAR;

    PROCEDURE ELIMINAR(p_id_sector IN SECTOR.id_sector%TYPE) AS
    BEGIN
        UPDATE SECTOR SET activo = 'N' WHERE id_sector = p_id_sector AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'No se encontro SECTOR con ID: ' || p_id_sector);
        END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar SECTOR: ' || SQLERRM);
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT s.id_sector, s.id_finca, f.nombre_finca, s.nombre_sector,
                   s.area_hectareas, s.numero_surcos, s.posiciones_por_surco,
                   s.tipo_cultivo, s.activo
            FROM SECTOR s JOIN FINCA f ON f.id_finca = s.id_finca
            WHERE s.activo = 'S' ORDER BY s.id_sector;
    EXCEPTION WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20004, 'Error al listar SECTOR: ' || SQLERRM);
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_sector IN SECTOR.id_sector%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT s.id_sector, s.id_finca, f.nombre_finca, s.nombre_sector,
                   s.area_hectareas, s.numero_surcos, s.posiciones_por_surco,
                   s.tipo_cultivo, s.activo
            FROM SECTOR s JOIN FINCA f ON f.id_finca = s.id_finca
            WHERE s.id_sector = p_id_sector AND s.activo = 'S';
    EXCEPTION WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20005, 'Error al obtener SECTOR por ID: ' || SQLERRM);
    END OBTENER_POR_ID;

END PKG_SECTOR;
/

-- ------- PKG_ESTADO_ARBOL ------------------------------------

CREATE OR REPLACE PACKAGE PKG_ESTADO_ARBOL AS
    PROCEDURE INSERTAR(p_nombre_estado IN ESTADO_ARBOL.nombre_estado%TYPE, p_orden_ciclo IN ESTADO_ARBOL.orden_ciclo%TYPE, p_es_productivo IN ESTADO_ARBOL.es_productivo%TYPE, p_descripcion IN ESTADO_ARBOL.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE, p_nombre_estado IN ESTADO_ARBOL.nombre_estado%TYPE, p_orden_ciclo IN ESTADO_ARBOL.orden_ciclo%TYPE, p_es_productivo IN ESTADO_ARBOL.es_productivo%TYPE, p_descripcion IN ESTADO_ARBOL.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_ESTADO_ARBOL;
/

CREATE OR REPLACE PACKAGE BODY PKG_ESTADO_ARBOL AS
    PROCEDURE INSERTAR(p_nombre_estado IN ESTADO_ARBOL.nombre_estado%TYPE, p_orden_ciclo IN ESTADO_ARBOL.orden_ciclo%TYPE, p_es_productivo IN ESTADO_ARBOL.es_productivo%TYPE, p_descripcion IN ESTADO_ARBOL.descripcion%TYPE) AS
    BEGIN
        INSERT INTO ESTADO_ARBOL (id_estado, nombre_estado, orden_ciclo, es_productivo, descripcion, activo)
        VALUES (SEQ_ESTADO_ARBOL.NEXTVAL, p_nombre_estado, p_orden_ciclo, p_es_productivo, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'Error al insertar ESTADO_ARBOL: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE, p_nombre_estado IN ESTADO_ARBOL.nombre_estado%TYPE, p_orden_ciclo IN ESTADO_ARBOL.orden_ciclo%TYPE, p_es_productivo IN ESTADO_ARBOL.es_productivo%TYPE, p_descripcion IN ESTADO_ARBOL.descripcion%TYPE) AS
    BEGIN
        UPDATE ESTADO_ARBOL SET nombre_estado = p_nombre_estado, orden_ciclo = p_orden_ciclo, es_productivo = p_es_productivo, descripcion = p_descripcion WHERE id_estado = p_id_estado AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro ESTADO_ARBOL con ID: ' || p_id_estado); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar ESTADO_ARBOL: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE) AS
    BEGIN
        UPDATE ESTADO_ARBOL SET activo = 'N' WHERE id_estado = p_id_estado AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro ESTADO_ARBOL con ID: ' || p_id_estado); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar ESTADO_ARBOL: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_estado, nombre_estado, orden_ciclo, es_productivo, descripcion, activo FROM ESTADO_ARBOL WHERE activo = 'S' ORDER BY orden_ciclo, id_estado;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar ESTADO_ARBOL: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_estado IN ESTADO_ARBOL.id_estado%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_estado, nombre_estado, orden_ciclo, es_productivo, descripcion, activo FROM ESTADO_ARBOL WHERE id_estado = p_id_estado AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener ESTADO_ARBOL por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_ESTADO_ARBOL;
/

-- ------- PKG_TIPO_VARIEDAD_ARBOL -----------------------------

CREATE OR REPLACE PACKAGE PKG_TIPO_VARIEDAD_ARBOL AS
    PROCEDURE INSERTAR(p_nombre_arbol IN TIPO_VARIEDAD_ARBOL.nombre_arbol%TYPE, p_tipo_uso IN TIPO_VARIEDAD_ARBOL.tipo_uso%TYPE, p_descripcion IN TIPO_VARIEDAD_ARBOL.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE, p_nombre_arbol IN TIPO_VARIEDAD_ARBOL.nombre_arbol%TYPE, p_tipo_uso IN TIPO_VARIEDAD_ARBOL.tipo_uso%TYPE, p_descripcion IN TIPO_VARIEDAD_ARBOL.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_TIPO_VARIEDAD_ARBOL;
/

CREATE OR REPLACE PACKAGE BODY PKG_TIPO_VARIEDAD_ARBOL AS
    PROCEDURE INSERTAR(p_nombre_arbol IN TIPO_VARIEDAD_ARBOL.nombre_arbol%TYPE, p_tipo_uso IN TIPO_VARIEDAD_ARBOL.tipo_uso%TYPE, p_descripcion IN TIPO_VARIEDAD_ARBOL.descripcion%TYPE) AS
    BEGIN
        INSERT INTO TIPO_VARIEDAD_ARBOL (id_tipo_arbol, nombre_arbol, tipo_uso, descripcion, activo)
        VALUES (SEQ_TIPO_VAR_ARBOL.NEXTVAL, p_nombre_arbol, p_tipo_uso, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar TIPO_VARIEDAD_ARBOL: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE, p_nombre_arbol IN TIPO_VARIEDAD_ARBOL.nombre_arbol%TYPE, p_tipo_uso IN TIPO_VARIEDAD_ARBOL.tipo_uso%TYPE, p_descripcion IN TIPO_VARIEDAD_ARBOL.descripcion%TYPE) AS
    BEGIN
        UPDATE TIPO_VARIEDAD_ARBOL SET nombre_arbol = p_nombre_arbol, tipo_uso = p_tipo_uso, descripcion = p_descripcion WHERE id_tipo_arbol = p_id_tipo_arbol AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro TIPO_VARIEDAD_ARBOL con ID: ' || p_id_tipo_arbol); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar TIPO_VARIEDAD_ARBOL: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE) AS
    BEGIN
        UPDATE TIPO_VARIEDAD_ARBOL SET activo = 'N' WHERE id_tipo_arbol = p_id_tipo_arbol AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro TIPO_VARIEDAD_ARBOL con ID: ' || p_id_tipo_arbol); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar TIPO_VARIEDAD_ARBOL: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_tipo_arbol, nombre_arbol, tipo_uso, descripcion, activo FROM TIPO_VARIEDAD_ARBOL WHERE activo = 'S' ORDER BY id_tipo_arbol;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar TIPO_VARIEDAD_ARBOL: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_tipo_arbol IN TIPO_VARIEDAD_ARBOL.id_tipo_arbol%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_tipo_arbol, nombre_arbol, tipo_uso, descripcion, activo FROM TIPO_VARIEDAD_ARBOL WHERE id_tipo_arbol = p_id_tipo_arbol AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener TIPO_VARIEDAD_ARBOL por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_TIPO_VARIEDAD_ARBOL;
/

-- ------- PKG_ARBOL -------------------------------------------

CREATE OR REPLACE PACKAGE PKG_ARBOL AS
    PROCEDURE INSERTAR(p_id_sector IN ARBOL.id_sector%TYPE, p_id_tipo_variedad_arbol IN ARBOL.id_tipo_variedad_arbol%TYPE, p_id_estado IN ARBOL.id_estado%TYPE, p_numero_surco IN ARBOL.numero_surco%TYPE, p_posicion_x IN ARBOL.posicion_x%TYPE, p_posicion_y IN ARBOL.posicion_y%TYPE, p_descripcion IN ARBOL.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_arbol IN ARBOL.id_arbol%TYPE, p_id_sector IN ARBOL.id_sector%TYPE, p_id_tipo_variedad_arbol IN ARBOL.id_tipo_variedad_arbol%TYPE, p_id_estado IN ARBOL.id_estado%TYPE, p_numero_surco IN ARBOL.numero_surco%TYPE, p_posicion_x IN ARBOL.posicion_x%TYPE, p_posicion_y IN ARBOL.posicion_y%TYPE, p_descripcion IN ARBOL.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_arbol IN ARBOL.id_arbol%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_arbol IN ARBOL.id_arbol%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_ARBOL;
/

CREATE OR REPLACE PACKAGE BODY PKG_ARBOL AS

    PROCEDURE INSERTAR(p_id_sector IN ARBOL.id_sector%TYPE, p_id_tipo_variedad_arbol IN ARBOL.id_tipo_variedad_arbol%TYPE, p_id_estado IN ARBOL.id_estado%TYPE, p_numero_surco IN ARBOL.numero_surco%TYPE, p_posicion_x IN ARBOL.posicion_x%TYPE, p_posicion_y IN ARBOL.posicion_y%TYPE, p_descripcion IN ARBOL.descripcion%TYPE) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM SECTOR WHERE id_sector = p_id_sector AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El SECTOR con ID ' || p_id_sector || ' no existe o esta inactivo.'); END IF;
        SELECT COUNT(*) INTO v_count FROM TIPO_VARIEDAD_ARBOL WHERE id_tipo_arbol = p_id_tipo_variedad_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El TIPO_VARIEDAD_ARBOL con ID ' || p_id_tipo_variedad_arbol || ' no existe o esta inactivo.'); END IF;
        SELECT COUNT(*) INTO v_count FROM ESTADO_ARBOL WHERE id_estado = p_id_estado AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ESTADO_ARBOL con ID ' || p_id_estado || ' no existe o esta inactivo.'); END IF;
        INSERT INTO ARBOL (id_arbol, id_sector, id_tipo_variedad_arbol, id_estado, numero_surco, posicion_x, posicion_y, descripcion, activo)
        VALUES (SEQ_ARBOL.NEXTVAL, p_id_sector, p_id_tipo_variedad_arbol, p_id_estado, p_numero_surco, p_posicion_x, p_posicion_y, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar ARBOL: ' || SQLERRM);
    END INSERTAR;

    PROCEDURE ACTUALIZAR(p_id_arbol IN ARBOL.id_arbol%TYPE, p_id_sector IN ARBOL.id_sector%TYPE, p_id_tipo_variedad_arbol IN ARBOL.id_tipo_variedad_arbol%TYPE, p_id_estado IN ARBOL.id_estado%TYPE, p_numero_surco IN ARBOL.numero_surco%TYPE, p_posicion_x IN ARBOL.posicion_x%TYPE, p_posicion_y IN ARBOL.posicion_y%TYPE, p_descripcion IN ARBOL.descripcion%TYPE) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM SECTOR WHERE id_sector = p_id_sector AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'El SECTOR con ID ' || p_id_sector || ' no existe o esta inactivo.'); END IF;
        SELECT COUNT(*) INTO v_count FROM TIPO_VARIEDAD_ARBOL WHERE id_tipo_arbol = p_id_tipo_variedad_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'El TIPO_VARIEDAD_ARBOL con ID ' || p_id_tipo_variedad_arbol || ' no existe o esta inactivo.'); END IF;
        SELECT COUNT(*) INTO v_count FROM ESTADO_ARBOL WHERE id_estado = p_id_estado AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'El ESTADO_ARBOL con ID ' || p_id_estado || ' no existe o esta inactivo.'); END IF;
        UPDATE ARBOL SET id_sector = p_id_sector, id_tipo_variedad_arbol = p_id_tipo_variedad_arbol, id_estado = p_id_estado, numero_surco = p_numero_surco, posicion_x = p_posicion_x, posicion_y = p_posicion_y, descripcion = p_descripcion WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro ARBOL con ID: ' || p_id_arbol); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar ARBOL: ' || SQLERRM);
    END ACTUALIZAR;

    PROCEDURE ELIMINAR(p_id_arbol IN ARBOL.id_arbol%TYPE) AS
    BEGIN
        UPDATE ARBOL SET activo = 'N' WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro ARBOL con ID: ' || p_id_arbol); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar ARBOL: ' || SQLERRM);
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT a.id_arbol, a.id_sector, s.nombre_sector, a.id_tipo_variedad_arbol,
                   t.nombre_arbol, a.id_estado, e.nombre_estado, a.numero_surco,
                   a.posicion_x, a.posicion_y, a.descripcion, a.activo
            FROM ARBOL a
            JOIN SECTOR s ON s.id_sector = a.id_sector
            JOIN TIPO_VARIEDAD_ARBOL t ON t.id_tipo_arbol = a.id_tipo_variedad_arbol
            JOIN ESTADO_ARBOL e ON e.id_estado = a.id_estado
            WHERE a.activo = 'S' ORDER BY a.id_arbol;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar ARBOL: ' || SQLERRM);
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_arbol IN ARBOL.id_arbol%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT a.id_arbol, a.id_sector, s.nombre_sector, a.id_tipo_variedad_arbol,
                   t.nombre_arbol, a.id_estado, e.nombre_estado, a.numero_surco,
                   a.posicion_x, a.posicion_y, a.descripcion, a.activo
            FROM ARBOL a
            JOIN SECTOR s ON s.id_sector = a.id_sector
            JOIN TIPO_VARIEDAD_ARBOL t ON t.id_tipo_arbol = a.id_tipo_variedad_arbol
            JOIN ESTADO_ARBOL e ON e.id_estado = a.id_estado
            WHERE a.id_arbol = p_id_arbol AND a.activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener ARBOL por ID: ' || SQLERRM);
    END OBTENER_POR_ID;

END PKG_ARBOL;
/

-- ------- PKG_HISTORIAL_ESTADO --------------------------------

CREATE OR REPLACE PACKAGE PKG_HISTORIAL_ESTADO AS
    PROCEDURE INSERTAR(p_id_arbol IN HISTORIAL_ESTADO.id_arbol%TYPE, p_id_estado_nuevo IN HISTORIAL_ESTADO.id_estado_nuevo%TYPE, p_observaciones IN HISTORIAL_ESTADO.observaciones%TYPE);
    PROCEDURE ACTUALIZAR(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE, p_id_arbol IN HISTORIAL_ESTADO.id_arbol%TYPE, p_id_estado_anterior IN HISTORIAL_ESTADO.id_estado_anterior%TYPE, p_id_estado_nuevo IN HISTORIAL_ESTADO.id_estado_nuevo%TYPE, p_fecha_cambio IN HISTORIAL_ESTADO.fecha_cambio%TYPE, p_observaciones IN HISTORIAL_ESTADO.observaciones%TYPE);
    PROCEDURE ELIMINAR(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_HISTORIAL_ESTADO;
/

CREATE OR REPLACE PACKAGE BODY PKG_HISTORIAL_ESTADO AS

    PROCEDURE INSERTAR(p_id_arbol IN HISTORIAL_ESTADO.id_arbol%TYPE, p_id_estado_nuevo IN HISTORIAL_ESTADO.id_estado_nuevo%TYPE, p_observaciones IN HISTORIAL_ESTADO.observaciones%TYPE) AS
        v_count NUMBER;
        v_estado_anterior ARBOL.id_estado%TYPE;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ARBOL no existe.'); END IF;
        SELECT id_estado INTO v_estado_anterior FROM ARBOL WHERE id_arbol = p_id_arbol;
        SELECT COUNT(*) INTO v_count FROM ESTADO_ARBOL WHERE id_estado = p_id_estado_nuevo AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ESTADO nuevo no existe.'); END IF;
        INSERT INTO HISTORIAL_ESTADO (id_historial, id_arbol, id_estado_anterior, id_estado_nuevo, fecha_cambio, observaciones)
        VALUES (SEQ_HISTORIAL_ESTADO.NEXTVAL, p_id_arbol, v_estado_anterior, p_id_estado_nuevo, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Guatemala' AS DATE), p_observaciones);
        UPDATE ARBOL SET id_estado = p_id_estado_nuevo WHERE id_arbol = p_id_arbol;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar HISTORIAL: ' || SQLERRM);
    END INSERTAR;

    PROCEDURE ACTUALIZAR(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE, p_id_arbol IN HISTORIAL_ESTADO.id_arbol%TYPE, p_id_estado_anterior IN HISTORIAL_ESTADO.id_estado_anterior%TYPE, p_id_estado_nuevo IN HISTORIAL_ESTADO.id_estado_nuevo%TYPE, p_fecha_cambio IN HISTORIAL_ESTADO.fecha_cambio%TYPE, p_observaciones IN HISTORIAL_ESTADO.observaciones%TYPE) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'El ARBOL con ID ' || p_id_arbol || ' no existe o esta inactivo.'); END IF;
        UPDATE HISTORIAL_ESTADO SET id_arbol = p_id_arbol, id_estado_anterior = p_id_estado_anterior, id_estado_nuevo = p_id_estado_nuevo, fecha_cambio = p_fecha_cambio, observaciones = p_observaciones WHERE id_historial = p_id_historial;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro HISTORIAL_ESTADO con ID: ' || p_id_historial); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar HISTORIAL_ESTADO: ' || SQLERRM);
    END ACTUALIZAR;

    PROCEDURE ELIMINAR(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE) AS
    BEGIN
        DELETE FROM HISTORIAL_ESTADO WHERE id_historial = p_id_historial;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro HISTORIAL_ESTADO con ID: ' || p_id_historial); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar HISTORIAL_ESTADO: ' || SQLERRM);
    END ELIMINAR;

    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT h.id_historial, h.id_arbol, h.id_estado_anterior, ea.nombre_estado AS nombre_estado_anterior,
                   h.id_estado_nuevo, en.nombre_estado AS nombre_estado_nuevo,
                   TO_CHAR(h.fecha_cambio, 'DD/MM/YYYY HH:MI:SS PM') AS fecha_cambio, h.observaciones
            FROM HISTORIAL_ESTADO h
            LEFT JOIN ESTADO_ARBOL ea ON ea.id_estado = h.id_estado_anterior
            LEFT JOIN ESTADO_ARBOL en ON en.id_estado = h.id_estado_nuevo
            ORDER BY h.id_historial;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar HISTORIAL_ESTADO: ' || SQLERRM);
    END LISTAR;

    PROCEDURE OBTENER_POR_ID(p_id_historial IN HISTORIAL_ESTADO.id_historial%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT h.id_historial, h.id_arbol, h.id_estado_anterior, ea.nombre_estado AS nombre_estado_anterior,
                   h.id_estado_nuevo, en.nombre_estado AS nombre_estado_nuevo,
                   TO_CHAR(h.fecha_cambio, 'DD/MM/YYYY HH:MI:SS PM') AS fecha_cambio, h.observaciones
            FROM HISTORIAL_ESTADO h
            LEFT JOIN ESTADO_ARBOL ea ON ea.id_estado = h.id_estado_anterior
            LEFT JOIN ESTADO_ARBOL en ON en.id_estado = h.id_estado_nuevo
            WHERE h.id_historial = p_id_historial;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener HISTORIAL_ESTADO por ID: ' || SQLERRM);
    END OBTENER_POR_ID;

END PKG_HISTORIAL_ESTADO;
/

-- ------- PKG_PLAGA_ENFERMEDAD --------------------------------

CREATE OR REPLACE PACKAGE PKG_PLAGA_ENFERMEDAD AS
    PROCEDURE INSERTAR(p_nombre_plaga IN PLAGA_ENFERMEDAD.nombre_plaga%TYPE, p_tipo_plaga IN PLAGA_ENFERMEDAD.tipo_plaga%TYPE, p_nivel_riesgo IN PLAGA_ENFERMEDAD.nivel_riesgo%TYPE, p_descripcion IN PLAGA_ENFERMEDAD.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE, p_nombre_plaga IN PLAGA_ENFERMEDAD.nombre_plaga%TYPE, p_tipo_plaga IN PLAGA_ENFERMEDAD.tipo_plaga%TYPE, p_nivel_riesgo IN PLAGA_ENFERMEDAD.nivel_riesgo%TYPE, p_descripcion IN PLAGA_ENFERMEDAD.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_PLAGA_ENFERMEDAD;
/

CREATE OR REPLACE PACKAGE BODY PKG_PLAGA_ENFERMEDAD AS
    PROCEDURE INSERTAR(p_nombre_plaga IN PLAGA_ENFERMEDAD.nombre_plaga%TYPE, p_tipo_plaga IN PLAGA_ENFERMEDAD.tipo_plaga%TYPE, p_nivel_riesgo IN PLAGA_ENFERMEDAD.nivel_riesgo%TYPE, p_descripcion IN PLAGA_ENFERMEDAD.descripcion%TYPE) AS
    BEGIN
        INSERT INTO PLAGA_ENFERMEDAD (id_plaga, nombre_plaga, tipo_plaga, nivel_riesgo, descripcion, activo)
        VALUES (SEQ_PLAGA_ENFERMEDAD.NEXTVAL, p_nombre_plaga, p_tipo_plaga, p_nivel_riesgo, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar PLAGA_ENFERMEDAD: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE, p_nombre_plaga IN PLAGA_ENFERMEDAD.nombre_plaga%TYPE, p_tipo_plaga IN PLAGA_ENFERMEDAD.tipo_plaga%TYPE, p_nivel_riesgo IN PLAGA_ENFERMEDAD.nivel_riesgo%TYPE, p_descripcion IN PLAGA_ENFERMEDAD.descripcion%TYPE) AS
    BEGIN
        UPDATE PLAGA_ENFERMEDAD SET nombre_plaga = p_nombre_plaga, tipo_plaga = p_tipo_plaga, nivel_riesgo = p_nivel_riesgo, descripcion = p_descripcion WHERE id_plaga = p_id_plaga AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro PLAGA_ENFERMEDAD con ID: ' || p_id_plaga); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar PLAGA_ENFERMEDAD: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE) AS
    BEGIN
        UPDATE PLAGA_ENFERMEDAD SET activo = 'N' WHERE id_plaga = p_id_plaga AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro PLAGA_ENFERMEDAD con ID: ' || p_id_plaga); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar PLAGA_ENFERMEDAD: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_plaga, nombre_plaga, tipo_plaga, nivel_riesgo, descripcion, activo FROM PLAGA_ENFERMEDAD WHERE activo = 'S' ORDER BY id_plaga;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar PLAGA_ENFERMEDAD: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_plaga IN PLAGA_ENFERMEDAD.id_plaga%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_plaga, nombre_plaga, tipo_plaga, nivel_riesgo, descripcion, activo FROM PLAGA_ENFERMEDAD WHERE id_plaga = p_id_plaga AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener PLAGA_ENFERMEDAD por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_PLAGA_ENFERMEDAD;
/

-- ------- PKG_REGISTRO_PLAGA ----------------------------------

CREATE OR REPLACE PACKAGE PKG_REGISTRO_PLAGA AS
    PROCEDURE INSERTAR(p_id_arbol IN REGISTRO_PLAGA.id_arbol%TYPE, p_id_plaga IN REGISTRO_PLAGA.id_plaga%TYPE, p_fecha_deteccion IN VARCHAR2, p_fecha_resolucion IN VARCHAR2, p_observaciones IN REGISTRO_PLAGA.observaciones%TYPE);
    PROCEDURE ACTUALIZAR(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE, p_id_arbol IN REGISTRO_PLAGA.id_arbol%TYPE, p_id_plaga IN REGISTRO_PLAGA.id_plaga%TYPE, p_fecha_deteccion IN VARCHAR2, p_fecha_resolucion IN VARCHAR2, p_observaciones IN REGISTRO_PLAGA.observaciones%TYPE);
    PROCEDURE ELIMINAR(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_REGISTRO_PLAGA;
/

CREATE OR REPLACE PACKAGE BODY PKG_REGISTRO_PLAGA AS
    PROCEDURE INSERTAR(p_id_arbol IN REGISTRO_PLAGA.id_arbol%TYPE, p_id_plaga IN REGISTRO_PLAGA.id_plaga%TYPE, p_fecha_deteccion IN VARCHAR2, p_fecha_resolucion IN VARCHAR2, p_observaciones IN REGISTRO_PLAGA.observaciones%TYPE) AS
        v_count NUMBER;
    BEGIN
        IF p_id_arbol IS NOT NULL THEN
            SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol AND activo = 'S';
            IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ARBOL con ID ' || p_id_arbol || ' no existe o esta inactivo.'); END IF;
        END IF;
        IF p_id_plaga IS NOT NULL THEN
            SELECT COUNT(*) INTO v_count FROM PLAGA_ENFERMEDAD WHERE id_plaga = p_id_plaga AND activo = 'S';
            IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'La PLAGA_ENFERMEDAD con ID ' || p_id_plaga || ' no existe o esta inactiva.'); END IF;
        END IF;
        INSERT INTO REGISTRO_PLAGA (id_registro, id_arbol, id_plaga, fecha_deteccion, fecha_resolucion, observaciones, activo)
        VALUES (SEQ_REGISTRO_PLAGA.NEXTVAL, p_id_arbol, p_id_plaga, TO_DATE(TRIM(p_fecha_deteccion), 'YYYY-MM-DD'), CASE WHEN p_fecha_resolucion IS NOT NULL AND TRIM(p_fecha_resolucion) IS NOT NULL THEN TO_DATE(TRIM(p_fecha_resolucion), 'YYYY-MM-DD') ELSE NULL END, p_observaciones, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar REGISTRO_PLAGA: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE, p_id_arbol IN REGISTRO_PLAGA.id_arbol%TYPE, p_id_plaga IN REGISTRO_PLAGA.id_plaga%TYPE, p_fecha_deteccion IN VARCHAR2, p_fecha_resolucion IN VARCHAR2, p_observaciones IN REGISTRO_PLAGA.observaciones%TYPE) AS
    BEGIN
        UPDATE REGISTRO_PLAGA SET id_arbol = p_id_arbol, id_plaga = p_id_plaga, fecha_deteccion = TO_DATE(TRIM(p_fecha_deteccion), 'YYYY-MM-DD'), fecha_resolucion = TO_DATE(TRIM(p_fecha_resolucion), 'YYYY-MM-DD'), observaciones = p_observaciones WHERE id_registro = p_id_registro;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro REGISTRO_PLAGA con ID: ' || p_id_registro); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar REGISTRO_PLAGA: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE) AS
    BEGIN
        UPDATE REGISTRO_PLAGA SET activo = 'N' WHERE id_registro = p_id_registro AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro REGISTRO_PLAGA con ID: ' || p_id_registro); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar REGISTRO_PLAGA: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT rp.id_registro, rp.id_arbol, rp.id_plaga, pe.nombre_plaga, pe.nivel_riesgo,
                   TO_CHAR(rp.fecha_deteccion, 'YYYY-MM-DD') AS fecha_deteccion,
                   TO_CHAR(rp.fecha_resolucion, 'YYYY-MM-DD') AS fecha_resolucion,
                   rp.observaciones, rp.activo, a.numero_surco, a.id_sector,
                   s.nombre_sector, s.id_finca, f.nombre_finca
            FROM REGISTRO_PLAGA rp
            LEFT JOIN ARBOL a ON a.id_arbol = rp.id_arbol
            LEFT JOIN SECTOR s ON s.id_sector = a.id_sector
            LEFT JOIN FINCA f ON f.id_finca = s.id_finca
            LEFT JOIN PLAGA_ENFERMEDAD pe ON pe.id_plaga = rp.id_plaga
            WHERE rp.activo = 'S' ORDER BY rp.id_registro;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar REGISTRO_PLAGA: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_registro IN REGISTRO_PLAGA.id_registro%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT rp.id_registro, rp.id_arbol, rp.id_plaga, pe.nombre_plaga, pe.nivel_riesgo,
                   TO_CHAR(rp.fecha_deteccion, 'YYYY-MM-DD') AS fecha_deteccion,
                   TO_CHAR(rp.fecha_resolucion, 'YYYY-MM-DD') AS fecha_resolucion,
                   rp.observaciones, rp.activo, a.numero_surco, a.id_sector,
                   s.nombre_sector, s.id_finca, f.nombre_finca
            FROM REGISTRO_PLAGA rp
            LEFT JOIN ARBOL a ON a.id_arbol = rp.id_arbol
            LEFT JOIN SECTOR s ON s.id_sector = a.id_sector
            LEFT JOIN FINCA f ON f.id_finca = s.id_finca
            LEFT JOIN PLAGA_ENFERMEDAD pe ON pe.id_plaga = rp.id_plaga
            WHERE rp.id_registro = p_id_registro AND rp.activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener REGISTRO_PLAGA por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_REGISTRO_PLAGA;
/

-- ------- PKG_TIPO_TRATAMIENTO --------------------------------

CREATE OR REPLACE PACKAGE PKG_TIPO_TRATAMIENTO AS
    PROCEDURE INSERTAR(p_nombre_tratamiento IN TIPO_TRATAMIENTO.nombre_tratamiento%TYPE, p_categoria IN TIPO_TRATAMIENTO.categoria%TYPE, p_metodo_aplicacion IN TIPO_TRATAMIENTO.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_TRATAMIENTO.frecuencia%TYPE, p_descripcion IN TIPO_TRATAMIENTO.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_nombre_tratamiento IN TIPO_TRATAMIENTO.nombre_tratamiento%TYPE, p_categoria IN TIPO_TRATAMIENTO.categoria%TYPE, p_metodo_aplicacion IN TIPO_TRATAMIENTO.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_TRATAMIENTO.frecuencia%TYPE, p_descripcion IN TIPO_TRATAMIENTO.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_TIPO_TRATAMIENTO;
/

CREATE OR REPLACE PACKAGE BODY PKG_TIPO_TRATAMIENTO AS
    PROCEDURE INSERTAR(p_nombre_tratamiento IN TIPO_TRATAMIENTO.nombre_tratamiento%TYPE, p_categoria IN TIPO_TRATAMIENTO.categoria%TYPE, p_metodo_aplicacion IN TIPO_TRATAMIENTO.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_TRATAMIENTO.frecuencia%TYPE, p_descripcion IN TIPO_TRATAMIENTO.descripcion%TYPE) AS
    BEGIN
        INSERT INTO TIPO_TRATAMIENTO (id_tipo_tratamiento, nombre_tratamiento, categoria, metodo_aplicacion, frecuencia, descripcion, activo)
        VALUES (SEQ_TIPO_TRATAMIENTO.NEXTVAL, p_nombre_tratamiento, p_categoria, p_metodo_aplicacion, p_frecuencia, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar TIPO_TRATAMIENTO: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_nombre_tratamiento IN TIPO_TRATAMIENTO.nombre_tratamiento%TYPE, p_categoria IN TIPO_TRATAMIENTO.categoria%TYPE, p_metodo_aplicacion IN TIPO_TRATAMIENTO.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_TRATAMIENTO.frecuencia%TYPE, p_descripcion IN TIPO_TRATAMIENTO.descripcion%TYPE) AS
    BEGIN
        UPDATE TIPO_TRATAMIENTO SET nombre_tratamiento = p_nombre_tratamiento, categoria = p_categoria, metodo_aplicacion = p_metodo_aplicacion, frecuencia = p_frecuencia, descripcion = p_descripcion WHERE id_tipo_tratamiento = p_id_tipo_tratamiento AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro TIPO_TRATAMIENTO con ID: ' || p_id_tipo_tratamiento); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar TIPO_TRATAMIENTO: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE) AS
    BEGIN
        UPDATE TIPO_TRATAMIENTO SET activo = 'N' WHERE id_tipo_tratamiento = p_id_tipo_tratamiento AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro TIPO_TRATAMIENTO con ID: ' || p_id_tipo_tratamiento); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar TIPO_TRATAMIENTO: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_tipo_tratamiento, nombre_tratamiento, categoria, metodo_aplicacion, frecuencia, descripcion, activo FROM TIPO_TRATAMIENTO WHERE activo = 'S' ORDER BY id_tipo_tratamiento;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar TIPO_TRATAMIENTO: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_tipo_tratamiento IN TIPO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_tipo_tratamiento, nombre_tratamiento, categoria, metodo_aplicacion, frecuencia, descripcion, activo FROM TIPO_TRATAMIENTO WHERE id_tipo_tratamiento = p_id_tipo_tratamiento AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener TIPO_TRATAMIENTO por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_TIPO_TRATAMIENTO;
/

-- ------- PKG_TIPO_FERTILIZANTE -------------------------------

CREATE OR REPLACE PACKAGE PKG_TIPO_FERTILIZANTE AS
    PROCEDURE INSERTAR(p_nombre_fertilizante IN TIPO_FERTILIZANTE.nombre_fertilizante%TYPE, p_tipo_fertilizante IN TIPO_FERTILIZANTE.tipo_fertilizante%TYPE, p_nutrientes_principales IN TIPO_FERTILIZANTE.nutrientes_principales%TYPE, p_metodo_aplicacion IN TIPO_FERTILIZANTE.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_FERTILIZANTE.frecuencia%TYPE, p_descripcion IN TIPO_FERTILIZANTE.descripcion%TYPE);
    PROCEDURE ACTUALIZAR(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE, p_nombre_fertilizante IN TIPO_FERTILIZANTE.nombre_fertilizante%TYPE, p_tipo_fertilizante IN TIPO_FERTILIZANTE.tipo_fertilizante%TYPE, p_nutrientes_principales IN TIPO_FERTILIZANTE.nutrientes_principales%TYPE, p_metodo_aplicacion IN TIPO_FERTILIZANTE.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_FERTILIZANTE.frecuencia%TYPE, p_descripcion IN TIPO_FERTILIZANTE.descripcion%TYPE);
    PROCEDURE ELIMINAR(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_TIPO_FERTILIZANTE;
/

CREATE OR REPLACE PACKAGE BODY PKG_TIPO_FERTILIZANTE AS
    PROCEDURE INSERTAR(p_nombre_fertilizante IN TIPO_FERTILIZANTE.nombre_fertilizante%TYPE, p_tipo_fertilizante IN TIPO_FERTILIZANTE.tipo_fertilizante%TYPE, p_nutrientes_principales IN TIPO_FERTILIZANTE.nutrientes_principales%TYPE, p_metodo_aplicacion IN TIPO_FERTILIZANTE.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_FERTILIZANTE.frecuencia%TYPE, p_descripcion IN TIPO_FERTILIZANTE.descripcion%TYPE) AS
    BEGIN
        INSERT INTO TIPO_FERTILIZANTE (id_fertilizante, nombre_fertilizante, tipo_fertilizante, nutrientes_principales, metodo_aplicacion, frecuencia, descripcion, activo)
        VALUES (SEQ_TIPO_FERTILIZANTE.NEXTVAL, p_nombre_fertilizante, p_tipo_fertilizante, p_nutrientes_principales, p_metodo_aplicacion, p_frecuencia, p_descripcion, 'S');
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar TIPO_FERTILIZANTE: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE, p_nombre_fertilizante IN TIPO_FERTILIZANTE.nombre_fertilizante%TYPE, p_tipo_fertilizante IN TIPO_FERTILIZANTE.tipo_fertilizante%TYPE, p_nutrientes_principales IN TIPO_FERTILIZANTE.nutrientes_principales%TYPE, p_metodo_aplicacion IN TIPO_FERTILIZANTE.metodo_aplicacion%TYPE, p_frecuencia IN TIPO_FERTILIZANTE.frecuencia%TYPE, p_descripcion IN TIPO_FERTILIZANTE.descripcion%TYPE) AS
    BEGIN
        UPDATE TIPO_FERTILIZANTE SET nombre_fertilizante = p_nombre_fertilizante, tipo_fertilizante = p_tipo_fertilizante, nutrientes_principales = p_nutrientes_principales, metodo_aplicacion = p_metodo_aplicacion, frecuencia = p_frecuencia, descripcion = p_descripcion WHERE id_fertilizante = p_id_fertilizante AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro TIPO_FERTILIZANTE con ID: ' || p_id_fertilizante); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar TIPO_FERTILIZANTE: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE) AS
    BEGIN
        UPDATE TIPO_FERTILIZANTE SET activo = 'N' WHERE id_fertilizante = p_id_fertilizante AND activo = 'S';
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro TIPO_FERTILIZANTE con ID: ' || p_id_fertilizante); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar TIPO_FERTILIZANTE: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_fertilizante, nombre_fertilizante, tipo_fertilizante, nutrientes_principales, metodo_aplicacion, frecuencia, descripcion, activo FROM TIPO_FERTILIZANTE WHERE activo = 'S' ORDER BY id_fertilizante;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar TIPO_FERTILIZANTE: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_fertilizante IN TIPO_FERTILIZANTE.id_fertilizante%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT id_fertilizante, nombre_fertilizante, tipo_fertilizante, nutrientes_principales, metodo_aplicacion, frecuencia, descripcion, activo FROM TIPO_FERTILIZANTE WHERE id_fertilizante = p_id_fertilizante AND activo = 'S';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener TIPO_FERTILIZANTE por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_TIPO_FERTILIZANTE;
/

-- ------- PKG_REGISTRO_TRATAMIENTO ----------------------------

CREATE OR REPLACE PACKAGE PKG_REGISTRO_TRATAMIENTO AS
    PROCEDURE INSERTAR(p_id_arbol IN REGISTRO_TRATAMIENTO.id_arbol%TYPE, p_id_tipo_tratamiento IN REGISTRO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_id_fertilizante IN REGISTRO_TRATAMIENTO.id_fertilizante%TYPE, p_fecha_aplicacion IN VARCHAR2, p_observaciones IN REGISTRO_TRATAMIENTO.observaciones%TYPE);
    PROCEDURE ACTUALIZAR(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE, p_id_arbol IN REGISTRO_TRATAMIENTO.id_arbol%TYPE, p_id_tipo_tratamiento IN REGISTRO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_id_fertilizante IN REGISTRO_TRATAMIENTO.id_fertilizante%TYPE, p_fecha_aplicacion IN VARCHAR2, p_observaciones IN REGISTRO_TRATAMIENTO.observaciones%TYPE);
    PROCEDURE ELIMINAR(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_REGISTRO_TRATAMIENTO;
/

CREATE OR REPLACE PACKAGE BODY PKG_REGISTRO_TRATAMIENTO AS
    PROCEDURE INSERTAR(p_id_arbol IN REGISTRO_TRATAMIENTO.id_arbol%TYPE, p_id_tipo_tratamiento IN REGISTRO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_id_fertilizante IN REGISTRO_TRATAMIENTO.id_fertilizante%TYPE, p_fecha_aplicacion IN VARCHAR2, p_observaciones IN REGISTRO_TRATAMIENTO.observaciones%TYPE) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ARBOL con ID ' || p_id_arbol || ' no existe o esta inactivo.'); END IF;
        SELECT COUNT(*) INTO v_count FROM TIPO_TRATAMIENTO WHERE id_tipo_tratamiento = p_id_tipo_tratamiento AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El TIPO_TRATAMIENTO con ID ' || p_id_tipo_tratamiento || ' no existe o esta inactivo.'); END IF;
        IF p_id_fertilizante IS NOT NULL THEN
            SELECT COUNT(*) INTO v_count FROM TIPO_FERTILIZANTE WHERE id_fertilizante = p_id_fertilizante AND activo = 'S';
            IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El TIPO_FERTILIZANTE con ID ' || p_id_fertilizante || ' no existe o esta inactivo.'); END IF;
        END IF;
        INSERT INTO REGISTRO_TRATAMIENTO (id_registro, id_arbol, id_tipo_tratamiento, id_fertilizante, fecha_aplicacion, observaciones)
        VALUES (SEQ_REG_TRATAMIENTO.NEXTVAL, p_id_arbol, p_id_tipo_tratamiento, p_id_fertilizante, TO_DATE(p_fecha_aplicacion, 'YYYY-MM-DD'), p_observaciones);
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar REGISTRO_TRATAMIENTO: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE, p_id_arbol IN REGISTRO_TRATAMIENTO.id_arbol%TYPE, p_id_tipo_tratamiento IN REGISTRO_TRATAMIENTO.id_tipo_tratamiento%TYPE, p_id_fertilizante IN REGISTRO_TRATAMIENTO.id_fertilizante%TYPE, p_fecha_aplicacion IN VARCHAR2, p_observaciones IN REGISTRO_TRATAMIENTO.observaciones%TYPE) AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol AND activo = 'S';
        IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'El ARBOL con ID ' || p_id_arbol || ' no existe o esta inactivo.'); END IF;
        UPDATE REGISTRO_TRATAMIENTO SET id_arbol = p_id_arbol, id_tipo_tratamiento = p_id_tipo_tratamiento, id_fertilizante = p_id_fertilizante, fecha_aplicacion = TO_DATE(p_fecha_aplicacion, 'YYYY-MM-DD'), observaciones = p_observaciones WHERE id_registro = p_id_registro;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro REGISTRO_TRATAMIENTO con ID: ' || p_id_registro); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar REGISTRO_TRATAMIENTO: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE) AS
    BEGIN
        DELETE FROM REGISTRO_TRATAMIENTO WHERE id_registro = p_id_registro;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro REGISTRO_TRATAMIENTO con ID: ' || p_id_registro); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar REGISTRO_TRATAMIENTO: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT rt.id_registro, rt.id_arbol, rt.id_tipo_tratamiento, tt.nombre_tratamiento,
                   rt.id_fertilizante, tf.nombre_fertilizante,
                   TO_CHAR(rt.fecha_aplicacion, 'DD/MM/YYYY') AS fecha_aplicacion, rt.observaciones
            FROM REGISTRO_TRATAMIENTO rt
            JOIN ARBOL a ON a.id_arbol = rt.id_arbol
            JOIN TIPO_TRATAMIENTO tt ON tt.id_tipo_tratamiento = rt.id_tipo_tratamiento
            LEFT JOIN TIPO_FERTILIZANTE tf ON tf.id_fertilizante = rt.id_fertilizante
            ORDER BY rt.id_registro;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar REGISTRO_TRATAMIENTO: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_registro IN REGISTRO_TRATAMIENTO.id_registro%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT rt.id_registro, rt.id_arbol, rt.id_tipo_tratamiento, tt.nombre_tratamiento,
                   rt.id_fertilizante, tf.nombre_fertilizante,
                   TO_CHAR(rt.fecha_aplicacion, 'DD/MM/YYYY') AS fecha_aplicacion, rt.observaciones
            FROM REGISTRO_TRATAMIENTO rt
            JOIN ARBOL a ON a.id_arbol = rt.id_arbol
            JOIN TIPO_TRATAMIENTO tt ON tt.id_tipo_tratamiento = rt.id_tipo_tratamiento
            LEFT JOIN TIPO_FERTILIZANTE tf ON tf.id_fertilizante = rt.id_fertilizante
            WHERE rt.id_registro = p_id_registro;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener REGISTRO_TRATAMIENTO por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_REGISTRO_TRATAMIENTO;
/

-- ------- PKG_RESIEMBRA ---------------------------------------

CREATE OR REPLACE PACKAGE PKG_RESIEMBRA AS
    PROCEDURE INSERTAR(p_id_arbol_nuevo IN RESIEMBRA.id_arbol_nuevo%TYPE, p_fecha_resiembra IN VARCHAR2, p_motivo IN RESIEMBRA.motivo%TYPE);
    PROCEDURE ACTUALIZAR(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE, p_id_arbol_nuevo IN RESIEMBRA.id_arbol_nuevo%TYPE, p_fecha_resiembra IN VARCHAR2, p_motivo IN RESIEMBRA.motivo%TYPE);
    PROCEDURE ELIMINAR(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE);
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE, p_cursor OUT SYS_REFCURSOR);
END PKG_RESIEMBRA;
/

CREATE OR REPLACE PACKAGE BODY PKG_RESIEMBRA AS
    PROCEDURE INSERTAR(p_id_arbol_nuevo IN RESIEMBRA.id_arbol_nuevo%TYPE, p_fecha_resiembra IN VARCHAR2, p_motivo IN RESIEMBRA.motivo%TYPE) AS
        v_count NUMBER;
    BEGIN
        IF p_id_arbol_nuevo IS NOT NULL THEN
            SELECT COUNT(*) INTO v_count FROM ARBOL WHERE id_arbol = p_id_arbol_nuevo AND activo = 'S';
            IF v_count = 0 THEN RAISE_APPLICATION_ERROR(-20001, 'El ARBOL con ID ' || p_id_arbol_nuevo || ' no existe o esta inactivo.'); END IF;
        END IF;
        INSERT INTO RESIEMBRA (id_resiembra, id_arbol_nuevo, fecha_resiembra, motivo)
        VALUES (SEQ_RESIEMBRA.NEXTVAL, p_id_arbol_nuevo, TO_DATE(p_fecha_resiembra, 'YYYY-MM-DD'), p_motivo);
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar RESIEMBRA: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE ACTUALIZAR(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE, p_id_arbol_nuevo IN RESIEMBRA.id_arbol_nuevo%TYPE, p_fecha_resiembra IN VARCHAR2, p_motivo IN RESIEMBRA.motivo%TYPE) AS
    BEGIN
        UPDATE RESIEMBRA SET id_arbol_nuevo = p_id_arbol_nuevo, fecha_resiembra = TO_DATE(p_fecha_resiembra, 'YYYY-MM-DD'), motivo = p_motivo WHERE id_resiembra = p_id_resiembra;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20002, 'No se encontro RESIEMBRA con ID: ' || p_id_resiembra); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20002, 'Error al actualizar RESIEMBRA: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE) AS
    BEGIN
        DELETE FROM RESIEMBRA WHERE id_resiembra = p_id_resiembra;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20003, 'No se encontro RESIEMBRA con ID: ' || p_id_resiembra); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20003, 'Error al eliminar RESIEMBRA: ' || SQLERRM);
    END ELIMINAR;
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT r.id_resiembra, r.id_arbol_nuevo, TO_CHAR(r.fecha_resiembra, 'DD/MM/YYYY') AS fecha_resiembra, r.motivo FROM RESIEMBRA r LEFT JOIN ARBOL a ON a.id_arbol = r.id_arbol_nuevo ORDER BY r.id_resiembra;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20004, 'Error al listar RESIEMBRA: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(p_id_resiembra IN RESIEMBRA.id_resiembra%TYPE, p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR SELECT r.id_resiembra, r.id_arbol_nuevo, TO_CHAR(r.fecha_resiembra, 'DD/MM/YYYY') AS fecha_resiembra, r.motivo FROM RESIEMBRA r LEFT JOIN ARBOL a ON a.id_arbol = r.id_arbol_nuevo WHERE r.id_resiembra = p_id_resiembra;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20005, 'Error al obtener RESIEMBRA por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
END PKG_RESIEMBRA;
/

-- ------- PKG_TIPO_MOVIMIENTO_INVENTARIO ----------------------

CREATE OR REPLACE PACKAGE PKG_TIPO_MOVIMIENTO_INVENTARIO AS
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR);
END PKG_TIPO_MOVIMIENTO_INVENTARIO;
/

CREATE OR REPLACE PACKAGE BODY PKG_TIPO_MOVIMIENTO_INVENTARIO AS
    PROCEDURE LISTAR(p_cursor OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN p_cursor FOR
            SELECT ID_TIPO_MOVIMIENTO, NOMBRE AS NOMBRE_TIPO_MOVIMIENTO, DESCRIPCION
            FROM TIPO_MOVIMIENTO_INVENTARIO ORDER BY ID_TIPO_MOVIMIENTO;
    EXCEPTION WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Error al listar tipos de movimiento inventario: ' || SQLERRM);
    END LISTAR;
END PKG_TIPO_MOVIMIENTO_INVENTARIO;
/

-- ------- PKG_MOVIMIENTO_INVENTARIO_ARBOL ---------------------

CREATE OR REPLACE PACKAGE PKG_MOVIMIENTO_INVENTARIO_ARBOL AS
    PROCEDURE INSERTAR(P_ID_ARBOL IN NUMBER, P_ID_TIPO_MOVIMIENTO IN NUMBER, P_ID_SECTOR_ORIGEN IN NUMBER, P_ID_SECTOR_DESTINO IN NUMBER, P_FECHA_MOVIMIENTO IN VARCHAR2, P_OBSERVACION IN VARCHAR2, P_USUARIO_REGISTRO IN VARCHAR2);
    PROCEDURE LISTAR(P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE OBTENER_POR_ID(P_ID_MOVIMIENTO IN NUMBER, P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE ACTUALIZAR(P_ID_MOVIMIENTO IN NUMBER, P_ID_ARBOL IN NUMBER, P_ID_TIPO_MOVIMIENTO IN NUMBER, P_ID_SECTOR_ORIGEN IN NUMBER, P_ID_SECTOR_DESTINO IN NUMBER, P_FECHA_MOVIMIENTO IN VARCHAR2, P_OBSERVACION IN VARCHAR2, P_USUARIO_REGISTRO IN VARCHAR2);
    PROCEDURE ELIMINAR(P_ID_MOVIMIENTO IN NUMBER);
END PKG_MOVIMIENTO_INVENTARIO_ARBOL;
/

CREATE OR REPLACE PACKAGE BODY PKG_MOVIMIENTO_INVENTARIO_ARBOL AS
    PROCEDURE INSERTAR(P_ID_ARBOL IN NUMBER, P_ID_TIPO_MOVIMIENTO IN NUMBER, P_ID_SECTOR_ORIGEN IN NUMBER, P_ID_SECTOR_DESTINO IN NUMBER, P_FECHA_MOVIMIENTO IN VARCHAR2, P_OBSERVACION IN VARCHAR2, P_USUARIO_REGISTRO IN VARCHAR2) AS
    BEGIN
        INSERT INTO MOVIMIENTO_INVENTARIO_ARBOL (ID_MOVIMIENTO, ID_ARBOL, ID_TIPO_MOVIMIENTO, ID_SECTOR_ORIGEN, ID_SECTOR_DESTINO, FECHA_MOVIMIENTO, OBSERVACION, USUARIO_REGISTRO)
        VALUES (SEQ_MOVIMIENTO_INVENTARIO.NEXTVAL, P_ID_ARBOL, P_ID_TIPO_MOVIMIENTO, P_ID_SECTOR_ORIGEN, P_ID_SECTOR_DESTINO, TO_DATE(P_FECHA_MOVIMIENTO, 'YYYY-MM-DD'), P_OBSERVACION, P_USUARIO_REGISTRO);
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20001, 'Error al insertar movimiento inventario arbol: ' || SQLERRM);
    END INSERTAR;
    PROCEDURE LISTAR(P_CURSOR OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT M.ID_MOVIMIENTO, M.ID_ARBOL, M.ID_TIPO_MOVIMIENTO, T.NOMBRE AS TIPO_MOVIMIENTO,
                   M.ID_SECTOR_ORIGEN, SO.NOMBRE_SECTOR AS SECTOR_ORIGEN,
                   M.ID_SECTOR_DESTINO, SD.NOMBRE_SECTOR AS SECTOR_DESTINO,
                   TO_CHAR(M.FECHA_MOVIMIENTO, 'DD/MM/YYYY') AS FECHA_MOVIMIENTO,
                   M.OBSERVACION, M.USUARIO_REGISTRO
            FROM MOVIMIENTO_INVENTARIO_ARBOL M
            INNER JOIN TIPO_MOVIMIENTO_INVENTARIO T ON M.ID_TIPO_MOVIMIENTO = T.ID_TIPO_MOVIMIENTO
            LEFT JOIN SECTOR SO ON M.ID_SECTOR_ORIGEN = SO.ID_SECTOR
            LEFT JOIN SECTOR SD ON M.ID_SECTOR_DESTINO = SD.ID_SECTOR
            ORDER BY M.ID_MOVIMIENTO DESC;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20002, 'Error al listar movimiento inventario arbol: ' || SQLERRM);
    END LISTAR;
    PROCEDURE OBTENER_POR_ID(P_ID_MOVIMIENTO IN NUMBER, P_CURSOR OUT SYS_REFCURSOR) AS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT M.ID_MOVIMIENTO, M.ID_ARBOL, M.ID_TIPO_MOVIMIENTO, T.NOMBRE AS TIPO_MOVIMIENTO,
                   M.ID_SECTOR_ORIGEN, SO.NOMBRE_SECTOR AS SECTOR_ORIGEN,
                   M.ID_SECTOR_DESTINO, SD.NOMBRE_SECTOR AS SECTOR_DESTINO,
                   TO_CHAR(M.FECHA_MOVIMIENTO, 'DD/MM/YYYY') AS FECHA_MOVIMIENTO,
                   M.OBSERVACION, M.USUARIO_REGISTRO
            FROM MOVIMIENTO_INVENTARIO_ARBOL M
            INNER JOIN TIPO_MOVIMIENTO_INVENTARIO T ON M.ID_TIPO_MOVIMIENTO = T.ID_TIPO_MOVIMIENTO
            LEFT JOIN SECTOR SO ON M.ID_SECTOR_ORIGEN = SO.ID_SECTOR
            LEFT JOIN SECTOR SD ON M.ID_SECTOR_DESTINO = SD.ID_SECTOR
            WHERE M.ID_MOVIMIENTO = P_ID_MOVIMIENTO;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20003, 'Error al obtener movimiento inventario arbol por ID: ' || SQLERRM);
    END OBTENER_POR_ID;
    PROCEDURE ACTUALIZAR(P_ID_MOVIMIENTO IN NUMBER, P_ID_ARBOL IN NUMBER, P_ID_TIPO_MOVIMIENTO IN NUMBER, P_ID_SECTOR_ORIGEN IN NUMBER, P_ID_SECTOR_DESTINO IN NUMBER, P_FECHA_MOVIMIENTO IN VARCHAR2, P_OBSERVACION IN VARCHAR2, P_USUARIO_REGISTRO IN VARCHAR2) AS
    BEGIN
        UPDATE MOVIMIENTO_INVENTARIO_ARBOL SET ID_ARBOL = P_ID_ARBOL, ID_TIPO_MOVIMIENTO = P_ID_TIPO_MOVIMIENTO, ID_SECTOR_ORIGEN = P_ID_SECTOR_ORIGEN, ID_SECTOR_DESTINO = P_ID_SECTOR_DESTINO, FECHA_MOVIMIENTO = TO_DATE(P_FECHA_MOVIMIENTO, 'YYYY-MM-DD'), OBSERVACION = P_OBSERVACION, USUARIO_REGISTRO = P_USUARIO_REGISTRO WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20004, 'No se encontro el movimiento inventario arbol con ID: ' || P_ID_MOVIMIENTO); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20005, 'Error al actualizar movimiento inventario arbol: ' || SQLERRM);
    END ACTUALIZAR;
    PROCEDURE ELIMINAR(P_ID_MOVIMIENTO IN NUMBER) AS
    BEGIN
        DELETE FROM MOVIMIENTO_INVENTARIO_ARBOL WHERE ID_MOVIMIENTO = P_ID_MOVIMIENTO;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20006, 'No se encontro el movimiento inventario arbol con ID: ' || P_ID_MOVIMIENTO); END IF;
        COMMIT;
    EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20007, 'Error al eliminar movimiento inventario arbol: ' || SQLERRM);
    END ELIMINAR;
END PKG_MOVIMIENTO_INVENTARIO_ARBOL;
/


-- =============================================================
-- SECCIÓN 4: DATOS INICIALES
-- Usuario y roles mínimos para poder ingresar al sistema
-- IMPORTANTE: Cambiar la contraseña después del primer login
-- =============================================================

-- Roles del sistema
INSERT INTO ROL (ID_ROL, NOMBRE_ROL, DESCRIPCION, ACTIVO)
VALUES (SEQ_ROL.NEXTVAL, 'Super Administrador', 'Acceso total al sistema', 'S');

INSERT INTO ROL (ID_ROL, NOMBRE_ROL, DESCRIPCION, ACTIVO)
VALUES (SEQ_ROL.NEXTVAL, 'Administrador', 'Gestión general del sistema', 'S');

INSERT INTO ROL (ID_ROL, NOMBRE_ROL, DESCRIPCION, ACTIVO)
VALUES (SEQ_ROL.NEXTVAL, 'Técnico de Campo', 'Registro de operaciones de campo', 'S');

-- Usuario administrador inicial
-- Contraseña: Admin123! (hash bcrypt generado con 10 salt rounds)
-- CAMBIAR DESPUÉS DEL PRIMER LOGIN
INSERT INTO USUARIO (ID_USUARIO, ROL_ID, USERNAME, PASSWORD_HASH, NOMBRES, APELLIDOS, EMAIL, ESTADO, ACTIVO)
VALUES (
    SEQ_USUARIO.NEXTVAL, 1, 'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    'Administrador', 'Sistema', 'admin@gestionarboles.com', 'ACTIVO', 'S'
);

-- Tipos de movimiento de inventario básicos
INSERT INTO TIPO_MOVIMIENTO_INVENTARIO (NOMBRE, DESCRIPCION)
VALUES ('Trasplante', 'Movimiento de árbol de un sector a otro');

INSERT INTO TIPO_MOVIMIENTO_INVENTARIO (NOMBRE, DESCRIPCION)
VALUES ('Baja', 'Retiro definitivo del árbol del inventario');

INSERT INTO TIPO_MOVIMIENTO_INVENTARIO (NOMBRE, DESCRIPCION)
VALUES ('Ingreso', 'Incorporación de nuevo árbol al inventario');

COMMIT;

-- =============================================================
-- FIN DEL SCRIPT
-- Verificar instalación con:
--   SELECT table_name FROM user_tables ORDER BY table_name;
--   SELECT object_name, status FROM user_objects WHERE object_type = 'PACKAGE BODY';
-- =============================================================
