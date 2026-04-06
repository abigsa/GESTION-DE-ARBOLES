import 'package:flutter/material.dart';
import '../core/mock_api_service.dart';
import '../widgets/dynamic_form.dart';

// 🎨 COLORES (mismo que main.dart)
class AppColors {
  static const Color primaryGreen = Color(0xFF2D7A3E);
  static const Color lightGreen = Color(0xFF4CB968);
  static const Color darkGreen = Color(0xFF1B4D2A);
  static const Color lightBg = Color(0xFFF0F5F2);
  static const Color white = Colors.white;
  static const Color greyText = Color(0xFF666666);
  static const Color redAccent = Color(0xFFE74C3C);
  static const Color editGreen = Color(0xFF27AE60);
  static const Color borderGrey = Color(0xFFE0E0E0);
}

class GenericCrudScreen extends StatefulWidget {
  final String title;
  final String endpoint;
  final List fields;

  const GenericCrudScreen({
    super.key,
    required this.title,
    required this.endpoint,
    required this.fields,
  });

  @override
  State<GenericCrudScreen> createState() => _GenericCrudScreenState();
}

class _GenericCrudScreenState extends State<GenericCrudScreen> {
  List data = [];
  bool loading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    setState(() {
      loading = true;
      errorMessage = null;
    });

    try {
      final result = await MockApiService.get(widget.endpoint);
      print("✅ DATA RECIBIDA: $result");

      setState(() {
        data = result;
        loading = false;
      });
    } catch (e) {
      print("❌ ERROR: $e");
      setState(() {
        errorMessage = e.toString();
        loading = false;
      });
    }
  }

  // 📊 OBTENER COLUMNAS DINÁMICAMENTE DEL PRIMER ITEM
  List<String> _getColumnsFromData() {
    if (data.isEmpty) return [];
    final firstItem = data[0] as Map<String, dynamic>;
    // Retorna todas las claves excepto 'id'
    return firstItem.keys.where((key) => key != 'id').toList();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 📌 HEADER CON INFORMACIÓN
          Container(
            padding: const EdgeInsets.all(24),
            color: AppColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.lightBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.dataset,
                        color: AppColors.primaryGreen,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PANEL ADMINISTRATIVO',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.greyText,
                              letterSpacing: 1,
                            ),
                          ),
                          Text(
                            widget.title,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppColors.darkGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Botón Agregar
                    ElevatedButton.icon(
                      onPressed: () async {
                        final result = await showDialog(
                          context: context,
                          builder: (context) => DynamicForm(
                            fields: widget.fields,
                            endpoint: widget.endpoint,
                          ),
                        );
                        if (result == true) {
                          fetchData();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(
                        Icons.add,
                        color: AppColors.white,
                        size: 20,
                      ),
                      label: const Text(
                        'Agregar',
                        style: TextStyle(
                          color: AppColors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Gestiona registros de forma simple y comparte cambios con tu equipo usando un backend centralizado.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.greyText,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),

          // 🔥 CONTENIDO PRINCIPAL
          Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Mostrar errores
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      border: Border.all(color: AppColors.redAccent),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: AppColors.redAccent,
                          size: 24,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '⚠️ Error de conexión',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.redAccent,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                errorMessage!,
                                style: const TextStyle(
                                  color: AppColors.redAccent,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: fetchData,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.redAccent,
                          ),
                          icon: const Icon(Icons.refresh),
                          label: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Mostrar tabla o loading
                if (loading)
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(height: 48),
                        const CircularProgressIndicator(
                          color: AppColors.primaryGreen,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Cargando ${widget.title.toLowerCase()}...',
                          style: const TextStyle(
                            color: AppColors.greyText,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 48),
                      ],
                    ),
                  )
                else if (data.isEmpty)
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(48),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.inbox,
                            size: 64,
                            color: AppColors.greyText.withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No hay registros',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.greyText,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Agrega el primer registro para empezar',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.greyText.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Encabezado con contador
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Registros',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.darkGreen,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.lightBg,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${data.length} encontrados',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.greyText,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // TABLA
                      _buildDataTable(),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 📊 CONSTRUIR TABLA DINÁMICAMENTE CON LOS DATOS REALES
  Widget _buildDataTable() {
    if (data.isEmpty) {
      return const SizedBox.shrink();
    }

    // OBTENER COLUMNAS DINÁMICAMENTE DEL PRIMER ITEM
    final displayColumns = _getColumnsFromData();

    if (displayColumns.isEmpty) {
      return Center(
        child: Text(
          'No hay columnas para mostrar',
          style: TextStyle(color: AppColors.greyText),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.borderGrey),
          borderRadius: BorderRadius.circular(8),
          color: AppColors.white,
        ),
        child: DataTable(
          columnSpacing: 20,
          dataRowHeight: 56,
          headingRowHeight: 48,
          headingRowColor: MaterialStateColor.resolveWith(
            (states) => AppColors.lightBg,
          ),
          columns: displayColumns
              .map(
                (col) => DataColumn(
                  label: Text(
                    col.toUpperCase(),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryGreen,
                      fontSize: 10,
                    ),
                  ),
                ),
              )
              .toList(),
          rows: data.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value as Map<String, dynamic>;

            return DataRow(
              color: MaterialStateColor.resolveWith(
                (states) => index.isEven
                    ? AppColors.white
                    : AppColors.lightBg.withOpacity(0.3),
              ),
              cells: [
                ...displayColumns.map((col) {
                  final value = item[col] ?? '';
                  final valueStr = value.toString();

                  return DataCell(
                    Text(
                      valueStr.length > 25
                          ? '${valueStr.substring(0, 25)}...'
                          : valueStr,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.greyText,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  );
                }).toList(),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}


