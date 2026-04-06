import 'dart:convert';

class MockApiService {
  // 📦 DATOS CORRECTOS - VERIFICADOS UNO POR UNO
  static final Map<String, List<Map<String, dynamic>>> mockData = {
    // ✅ TIPOS DE VARIEDAD - Con: nombre_arbol, tipo_uso, descripcion
    "/tipos-variedad": [
      {
        "id": 1,
        "nombre_arbol": "Mango",
        "tipo_uso": "Frutal",
        "descripcion": "Árbol frutal tropical de alto valor comercial"
      },
      {
        "id": 2,
        "nombre_arbol": "Limón",
        "tipo_uso": "Cítrico",
        "descripcion": "Árbol cítrico para exportación"
      },
      {
        "id": 3,
        "nombre_arbol": "Cacao",
        "tipo_uso": "Industrial",
        "descripcion": "Árbol para producción de cacao"
      },
      {
        "id": 4,
        "nombre_arbol": "Pino",
        "tipo_uso": "Maderero",
        "descripcion": "Árbol para madera y construcción"
      },
    ],
    
    // ✅ FERTILIZANTES - Con: nombre_fertilizante, tipo_fertilizante, etc
    "/tipo-fertilizante": [
      {
        "id": 1,
        "nombre_fertilizante": "NPK 10-10-10",
        "tipo_fertilizante": "Químico",
        "nutrientes_principales": "N-P-K Balanceado",
        "metodo_aplicacion": "Foliar",
        "frecuencia": "Semanal",
        "descripcion": "Fertilizante balanceado para crecimiento general"
      },
      {
        "id": 2,
        "nombre_fertilizante": "Urea 46%",
        "tipo_fertilizante": "Químico",
        "nutrientes_principales": "Nitrógeno",
        "metodo_aplicacion": "Suelo",
        "frecuencia": "Mensual",
        "descripcion": "Alto contenido de nitrógeno"
      },
      {
        "id": 3,
        "nombre_fertilizante": "Compost Orgánico",
        "tipo_fertilizante": "Orgánico",
        "nutrientes_principales": "Materia Orgánica",
        "metodo_aplicacion": "Suelo",
        "frecuencia": "Trimestral",
        "descripcion": "Fertilizante natural y ecológico"
      },
    ],
    
    // ✅ TRATAMIENTOS - Con: nombre_tratamiento, categoria, etc
    "/tipo-tratamiento": [
      {
        "id": 1,
        "nombre_tratamiento": "Fungicida Sistémico",
        "categoria": "Preventivo",
        "metodo_aplicacion": "Aspersión",
        "frecuencia": "Quincenal",
        "descripcion": "Previene enfermedades fúngicas"
      },
      {
        "id": 2,
        "nombre_tratamiento": "Insecticida Orgánico",
        "categoria": "Correctivo",
        "metodo_aplicacion": "Aspersión",
        "frecuencia": "Semanal",
        "descripcion": "Control de plagas insectiles"
      },
      {
        "id": 3,
        "nombre_tratamiento": "Bactericida",
        "categoria": "Preventivo",
        "metodo_aplicacion": "Foliar",
        "frecuencia": "Mensual",
        "descripcion": "Previene enfermedades bacterianas"
      },
    ],
    
    // ✅ ESTADO ÁRBOL - Con: nombre_estado, orden_ciclo, etc
    "/estado-arbol": [
      {
        "id": 1,
        "nombre_estado": "Germinación",
        "orden_ciclo": 1,
        "es_productivo": "N",
        "descripcion": "Árbol en fase de germinación y enraizamiento"
      },
      {
        "id": 2,
        "nombre_estado": "Crecimiento",
        "orden_ciclo": 2,
        "es_productivo": "N",
        "descripcion": "Árbol en desarrollo vegetativo"
      },
      {
        "id": 3,
        "nombre_estado": "Productivo",
        "orden_ciclo": 3,
        "es_productivo": "S",
        "descripcion": "Árbol dando frutos y en producción"
      },
      {
        "id": 4,
        "nombre_estado": "Declinante",
        "orden_ciclo": 4,
        "es_productivo": "N",
        "descripcion": "Árbol viejo con baja productividad"
      },
    ],
    
    // ✅ FINCAS
    "/finca": [
      {
        "id": 1,
        "nombre_finca": "Finca El Paraíso",
        "ubicacion": "Guatemala City",
        "area_hectareas": 50,
        "propietario": "Juan Pérez",
        "telefono_contacto": "5551234567",
        "descripcion": "Finca de cultivos variados"
      },
      {
        "id": 2,
        "nombre_finca": "La Montaña Verde",
        "ubicacion": "Antigua Guatemala",
        "area_hectareas": 80,
        "propietario": "María González",
        "telefono_contacto": "5559876543",
        "descripcion": "Finca especializada en árboles frutales"
      },
      {
        "id": 3,
        "nombre_finca": "Finca Sostenible",
        "ubicacion": "Chichicastenango",
        "area_hectareas": 120,
        "propietario": "Carlos López",
        "telefono_contacto": "5555555555",
        "descripcion": "Cultivo orgánico certificado"
      },
    ],
    
    // ✅ SECTORES
    "/sector": [
      {
        "id": 1,
        "id_finca": 1,
        "nombre_sector": "Sector A - Sur",
        "area_hectareas": 10,
        "numero_surcos": 5,
        "posiciones_por_surco": 20
      },
      {
        "id": 2,
        "id_finca": 1,
        "nombre_sector": "Sector B - Norte",
        "area_hectareas": 15,
        "numero_surcos": 8,
        "posiciones_por_surco": 25
      },
      {
        "id": 3,
        "id_finca": 2,
        "nombre_sector": "Sector C - Este",
        "area_hectareas": 20,
        "numero_surcos": 10,
        "posiciones_por_surco": 30
      },
    ],
    
    // ✅ PLAGAS Y ENFERMEDADES - Con: nombre_plaga, tipo_plaga, nivel_riesgo
    "/plaga-enfermedad": [
      {
        "id": 1,
        "nombre_plaga": "Mosca Blanca",
        "tipo_plaga": "PLAGA",
        "nivel_riesgo": "ALTO",
        "descripcion": "Insecto que afecta hojas y tallos"
      },
      {
        "id": 2,
        "nombre_plaga": "Roya",
        "tipo_plaga": "ENFERMEDAD",
        "nivel_riesgo": "MEDIO",
        "descripcion": "Enfermedad fúngica en hojas"
      },
      {
        "id": 3,
        "nombre_plaga": "Antracnosis",
        "tipo_plaga": "ENFERMEDAD",
        "nivel_riesgo": "ALTO",
        "descripcion": "Hongo que afecta frutos y hojas"
      },
      {
        "id": 4,
        "nombre_plaga": "Ácaros Rojos",
        "tipo_plaga": "PLAGA",
        "nivel_riesgo": "MEDIO",
        "descripcion": "Ácaros que succionan savia"
      },
    ],
    
    // ✅ ÁRBOLES
    "/arbol": [
      {
        "id": 1,
        "id_sector": 1,
        "id_tipo_variedad_arbol": 1,
        "id_estado": 3,
        "numero_surco": 1,
        "descripcion": "Árbol en buen estado de producción"
      },
      {
        "id": 2,
        "id_sector": 1,
        "id_tipo_variedad_arbol": 2,
        "id_estado": 2,
        "numero_surco": 1,
        "descripcion": "Árbol joven en crecimiento"
      },
      {
        "id": 3,
        "id_sector": 2,
        "id_tipo_variedad_arbol": 1,
        "id_estado": 3,
        "numero_surco": 2,
        "descripcion": "Productor de alto rendimiento"
      },
    ],
    
    // ✅ HISTORIAL ESTADO
    "/historial-estado": [
      {
        "id": 1,
        "id_arbol": 1,
        "id_estado_nuevo": 3,
        "observaciones": "Árbol alcanzó estado productivo"
      },
      {
        "id": 2,
        "id_arbol": 2,
        "id_estado_nuevo": 2,
        "observaciones": "En desarrollo vegetativo normal"
      },
    ],
    
    // ✅ REGISTRO PLAGA
    "/registro-plaga": [
      {
        "id": 1,
        "id_arbol": 1,
        "id_plaga": 1,
        "fecha_deteccion": "2024-01-15",
        "fecha_resolucion": "2024-01-20",
        "observaciones": "Mosca blanca controlada con fungicida"
      },
      {
        "id": 2,
        "id_arbol": 2,
        "id_plaga": 2,
        "fecha_deteccion": "2024-02-10",
        "fecha_resolucion": "2024-02-15",
        "observaciones": "Roya eliminada"
      },
    ],
    
    // ✅ REGISTRO TRATAMIENTO
    "/registro-tratamiento": [
      {
        "id": 1,
        "id_arbol": 1,
        "id_tipo_tratamiento": 1,
        "id_fertilizante": 1,
        "fecha_aplicacion": "2024-01-10",
        "observaciones": "Aplicación exitosa"
      },
      {
        "id": 2,
        "id_arbol": 2,
        "id_tipo_tratamiento": 2,
        "id_fertilizante": 2,
        "fecha_aplicacion": "2024-01-12",
        "observaciones": "Árbol responde bien"
      },
    ],
    
    // ✅ RESIEMBRA
    "/resiembra": [
      {
        "id": 1,
        "id_arbol_nuevo": 1,
        "fecha_resiembra": "2024-01-05",
        "motivo": "Reemplazo de árbol dañado"
      },
      {
        "id": 2,
        "id_arbol_nuevo": 2,
        "fecha_resiembra": "2024-01-08",
        "motivo": "Expansión de finca"
      },
    ],
    
    // ✅ MOVIMIENTO INVENTARIO
    "/movimiento-inventario": [
      {
        "id": 1,
        "id_arbol": 1,
        "tipo_movimiento": "Entrada",
        "fecha_movimiento": "2024-01-01",
        "observaciones": "Nuevo árbol plantado"
      },
      {
        "id": 2,
        "id_arbol": 2,
        "tipo_movimiento": "Entrada",
        "fecha_movimiento": "2024-01-02",
        "observaciones": "Entrada de material vegetal"
      },
    ],
  };

  static Future<List<dynamic>> get(String endpoint) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print("📦 Mock GET: $endpoint");
    
    if (mockData.containsKey(endpoint)) {
      final data = mockData[endpoint]!;
      print("✅ Retornando ${data.length} items de $endpoint");
      return data;
    } else {
      print("⚠️ Endpoint '$endpoint' no encontrado");
      return [];
    }
  }

  static Future<void> post(String endpoint, Map body) async {
    await Future.delayed(const Duration(milliseconds: 300));
    print("✅ Mock POST: $endpoint - $body");
  }

  static Future<void> put(String endpoint, int id, Map body) async {
    await Future.delayed(const Duration(milliseconds: 300));
    print("✅ Mock PUT: $endpoint/$id - $body");
  }

  static Future<void> delete(String endpoint, int id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    print("✅ Mock DELETE: $endpoint/$id");
  }
}
