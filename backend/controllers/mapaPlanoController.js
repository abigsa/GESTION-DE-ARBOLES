const oracledb = require("oracledb");
const db = require("../config/db");

const obtenerPlanoFinca = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await db.getConnection();

    // ==========================
    // 1. DATOS DE FINCA
    // ==========================
    const fincaQuery = `
      SELECT 
        ID_FINCA,
        NOMBRE_FINCA,
        NVL(ANCHO, 100) AS ANCHO,
        NVL(LARGO, 200) AS LARGO
      FROM FINCA
      WHERE ID_FINCA = :id
    `;

    const fincaResult = await connection.execute(
      fincaQuery,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (fincaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Finca no encontrada"
      });
    }

    // ==========================
    // 2. SECTORES DE LA FINCA
    // ==========================
    const sectoresQuery = `
      SELECT
        ID_SECTOR,
        ID_FINCA,
        NOMBRE_SECTOR,
        AREA_HECTAREAS,
        NUMERO_SURCOS,
        POSICIONES_POR_SURCO,
        TIPO_CULTIVO,
        ACTIVO
      FROM SECTOR
      WHERE ID_FINCA = :id
        AND NVL(ACTIVO, 'S') = 'S'
      ORDER BY ID_SECTOR
    `;

    const sectoresResult = await connection.execute(
      sectoresQuery,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ==========================
    // 3. ÁRBOLES + ESTADO + VARIEDAD
    // SOLO ACTIVOS
    // ==========================
    const arbolesQuery = `
      SELECT 
        A.ID_ARBOL,
        A.ID_SECTOR,
        A.ID_TIPO_VARIEDAD_ARBOL,
        A.ID_ESTADO,
        A.NUMERO_SURCO,
        A.DESCRIPCION,
        NVL(A.POSICION_X, 10) AS POSICION_X,
        NVL(A.POSICION_Y, 10) AS POSICION_Y,
        S.NOMBRE_SECTOR,
        TV.NOMBRE_ARBOL,
        EA.NOMBRE_ESTADO
      FROM ARBOL A
      INNER JOIN SECTOR S 
        ON A.ID_SECTOR = S.ID_SECTOR
      LEFT JOIN TIPO_VARIEDAD_ARBOL TV 
        ON A.ID_TIPO_VARIEDAD_ARBOL = TV.ID_TIPO_ARBOL
      LEFT JOIN ESTADO_ARBOL EA
        ON A.ID_ESTADO = EA.ID_ESTADO
      WHERE S.ID_FINCA = :id
        AND NVL(S.ACTIVO, 'S') = 'S'
        AND NVL(A.ACTIVO, 'S') = 'S'
      ORDER BY A.ID_ARBOL
    `;

    const arbolesResult = await connection.execute(
      arbolesQuery,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ==========================
    // 4. ÚLTIMO TRATAMIENTO / FERTILIZANTE POR ÁRBOL
    // SOLO ÁRBOLES ACTIVOS
    // ==========================
    const tratamientosQuery = `
      SELECT
        RT.ID_ARBOL,
        TT.NOMBRE_TRATAMIENTO,
        TF.NOMBRE_FERTILIZANTE,
        RT.FECHA_APLICACION,
        RT.OBSERVACIONES
      FROM REGISTRO_TRATAMIENTO RT
      LEFT JOIN TIPO_TRATAMIENTO TT
        ON RT.ID_TIPO_TRATAMIENTO = TT.ID_TIPO_TRATAMIENTO
      LEFT JOIN TIPO_FERTILIZANTE TF
        ON RT.ID_FERTILIZANTE = TF.ID_FERTILIZANTE
      WHERE RT.ID_ARBOL IN (
        SELECT A.ID_ARBOL
        FROM ARBOL A
        INNER JOIN SECTOR S ON A.ID_SECTOR = S.ID_SECTOR
        WHERE S.ID_FINCA = :id
          AND NVL(S.ACTIVO, 'S') = 'S'
          AND NVL(A.ACTIVO, 'S') = 'S'
      )
      ORDER BY RT.FECHA_APLICACION DESC
    `;

    const tratamientosResult = await connection.execute(
      tratamientosQuery,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ==========================
    // 5. PLAGAS POR ÁRBOL
    // SOLO ÁRBOLES ACTIVOS
    // ==========================
    const plagasQuery = `
      SELECT
        RP.ID_ARBOL,
        PE.NOMBRE_PLAGA,
        PE.TIPO_PLAGA,
        PE.NIVEL_RIESGO,
        RP.OBSERVACIONES
      FROM REGISTRO_PLAGA RP
      LEFT JOIN PLAGA_ENFERMEDAD PE
        ON RP.ID_PLAGA = PE.ID_PLAGA
      WHERE RP.ID_ARBOL IN (
        SELECT A.ID_ARBOL
        FROM ARBOL A
        INNER JOIN SECTOR S ON A.ID_SECTOR = S.ID_SECTOR
        WHERE S.ID_FINCA = :id
          AND NVL(S.ACTIVO, 'S') = 'S'
          AND NVL(A.ACTIVO, 'S') = 'S'
      )
      AND NVL(RP.ACTIVO, 'S') = 'S'
    `;

    const plagasResult = await connection.execute(
      plagasQuery,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ==========================
    // 6. UNIR INFO AL ÁRBOL
    // ==========================
    const arbolesEnriquecidos = arbolesResult.rows.map((arbol) => {
      const tratamiento = tratamientosResult.rows.find(
        (t) => Number(t.ID_ARBOL) === Number(arbol.ID_ARBOL)
      );

      const plagas = plagasResult.rows.filter(
        (p) => Number(p.ID_ARBOL) === Number(arbol.ID_ARBOL)
      );

      return {
        ...arbol,
        NOMBRE_TRATAMIENTO: tratamiento?.NOMBRE_TRATAMIENTO || null,
        NOMBRE_FERTILIZANTE: tratamiento?.NOMBRE_FERTILIZANTE || null,
        FECHA_APLICACION: tratamiento?.FECHA_APLICACION || null,
        OBS_TRATAMIENTO: tratamiento?.OBSERVACIONES || null,
        PLAGAS: plagas
      };
    });

    res.json({
      success: true,
      finca: fincaResult.rows[0],
      sectores: sectoresResult.rows,
      arboles: arbolesEnriquecidos
    });

  } catch (error) {
    console.error("❌ Error al obtener plano de finca:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el plano de la finca",
      error: error.message
    });

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error cerrando conexión:", err);
      }
    }
  }
};

const actualizarTamanoFinca = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { ancho, largo } = req.body;

    connection = await db.getConnection();

    await connection.execute(
      `
      UPDATE FINCA
      SET ANCHO = :ancho,
          LARGO = :largo
      WHERE ID_FINCA = :id
      `,
      {
        ancho: Number(ancho),
        largo: Number(largo),
        id: Number(id)
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Tamaño de finca actualizado correctamente"
    });

  } catch (error) {
    console.error("❌ Error actualizando tamaño de finca:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar tamaño de finca",
      error: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error cerrando conexión:", err);
      }
    }
  }
};

const actualizarPosicionArbol = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { posicion_x, posicion_y } = req.body;

    connection = await db.getConnection();

    await connection.execute(
      `
      UPDATE ARBOL
      SET POSICION_X = :posicion_x,
          POSICION_Y = :posicion_y
      WHERE ID_ARBOL = :id
        AND NVL(ACTIVO, 'S') = 'S'
      `,
      {
        posicion_x: Number(posicion_x),
        posicion_y: Number(posicion_y),
        id: Number(id)
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Posición del árbol actualizada correctamente"
    });

  } catch (error) {
    console.error("❌ Error actualizando posición del árbol:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar posición del árbol",
      error: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error cerrando conexión:", err);
      }
    }
  }
};

module.exports = {
  obtenerPlanoFinca,
  actualizarTamanoFinca,
  actualizarPosicionArbol
};