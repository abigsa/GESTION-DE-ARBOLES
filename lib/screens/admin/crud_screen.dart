import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/api_service.dart';
import '../../../modules/module_config.dart';
import '../../../widgets/dynamic_form.dart';

class CrudScreen extends StatefulWidget {
  final String moduleKey;
  const CrudScreen({super.key, required this.moduleKey});
  @override
  State<CrudScreen> createState() => _CrudScreenState();
}

class _CrudScreenState extends State<CrudScreen> {
  List<Map<String, dynamic>> _data = [];
  bool   _loading      = true;
  String? _errorMsg;
  String  _searchQuery = '';
  final _searchCtrl = TextEditingController();

  // Columnas a ocultar en la tabla (IDs internos ruidosos)
  static const _hiddenCols = {
    'fecha_creacion', 'fecha_actualizacion', 'created_at', 'updated_at',
    'FECHA_CREACION', 'FECHA_ACTUALIZACION', 'CREATED_AT', 'UPDATED_AT',
  };

  Map<String, dynamic> get _config => modulesConfig[widget.moduleKey]!;
  String get _title    => _config['title'];
  String get _endpoint => _config['endpoint'];
  List   get _fields   => _config['fields'];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Carga de datos ───────────────────────────────
  Future<void> _fetchData() async {
    setState(() { _loading = true; _errorMsg = null; });
    try {
      final result = await ApiService.get(_endpoint);
      setState(() {
        _data    = result.map((e) => Map<String, dynamic>.from(e)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() { _errorMsg = e.toString(); _loading = false; });
    }
  }

  // ── Detectar clave primaria ──────────────────────
  String? _idKey(Map<String, dynamic> row) {
    for (final k in ['id', 'ID', ...row.keys]) {
      if (k.toLowerCase() == 'id') return k;
    }
    // Buscar columna que contenga "_id" o "id_" al inicio
    for (final k in row.keys) {
      if (k.toLowerCase().startsWith('id_') ||
          k.toLowerCase().endsWith('_id')) {
        // Solo retornar si la clave es la primera (PK)
        return k;
      }
    }
    return null;
  }

  int? _idValue(Map<String, dynamic> row) {
    final key = _idKey(row);
    if (key == null) return null;
    final v = row[key];
    if (v == null) return null;
    return v is int ? v : int.tryParse(v.toString());
  }

  // ── Columnas visibles ────────────────────────────
  List<String> _visibleCols(Map<String, dynamic> row) {
    return row.keys
        .where((k) => !_hiddenCols.contains(k))
        .toList();
  }

  // ── Filtro de búsqueda ───────────────────────────
  List<Map<String, dynamic>> get _filtered {
    if (_searchQuery.isEmpty) return _data;
    final q = _searchQuery.toLowerCase();
    return _data.where((row) {
      return row.values.any((v) => v.toString().toLowerCase().contains(q));
    }).toList();
  }

  // ── Diálogo agregar / editar ─────────────────────
  Future<void> _openForm({Map<String, dynamic>? item}) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => DynamicForm(
        fields: _fields,
        endpoint: _endpoint,
        editItem: item,
        editId: item != null ? _idValue(item) : null,
      ),
    );
    if (result == true) _fetchData();
  }

  // ── Eliminar ─────────────────────────────────────
  Future<void> _delete(Map<String, dynamic> item) async {
    final id = _idValue(item);
    if (id == null) {
      _showSnack('No se puede identificar el registro', error: true);
      return;
    }
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Row(children: [
          Icon(Icons.warning_amber_rounded,
              color: ArbolColors.rojoAlerta, size: 22),
          SizedBox(width: 8),
          Text('Confirmar eliminación',
              style: TextStyle(fontSize: 16, color: ArbolColors.verdeProfundo)),
        ]),
        content: const Text('¿Eliminar este registro? Esta acción no se puede deshacer.',
            style: TextStyle(fontSize: 14)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: ArbolColors.rojoAlerta),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await ApiService.delete(_endpoint, id);
      _showSnack('Registro eliminado');
      _fetchData();
    } catch (e) {
      _showSnack('Error: $e', error: true);
    }
  }

  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor:
          error ? ArbolColors.rojoAlerta : ArbolColors.exito,
      behavior: SnackBarBehavior.floating,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  // ── BUILD ────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ArbolColors.fondoClaro,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: _loading
                ? _buildLoading()
                : _errorMsg != null
                    ? _buildError()
                    : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Breadcrumb + botón volver
          Row(
            children: [
              InkWell(
                onTap: () => context.go('/admin'),
                borderRadius: BorderRadius.circular(6),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Row(children: [
                    Icon(Icons.arrow_back_ios_rounded,
                        size: 14, color: ArbolColors.tierraCalida),
                    SizedBox(width: 4),
                    Text('Inicio',
                        style: TextStyle(
                            fontSize: 12, color: ArbolColors.tierraCalida)),
                  ]),
                ),
              ),
              const Text(' / ',
                  style: TextStyle(
                      fontSize: 12, color: ArbolColors.tierraCalida)),
              Text(_title,
                  style: const TextStyle(
                      fontSize: 12,
                      color: ArbolColors.verdeMedio,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),

          // Título + botón agregar
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: ArbolColors.verdeMenta,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.dataset_rounded,
                    color: ArbolColors.verdeProfundo, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('PANEL ADMINISTRATIVO',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: ArbolColors.tierraCalida,
                            letterSpacing: 1)),
                    Text(_title,
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: ArbolColors.verdeProfundo)),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _openForm(),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text('Agregar',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14)),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Barra de búsqueda
          TextField(
            controller: _searchCtrl,
            onChanged: (v) => setState(() => _searchQuery = v),
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Buscar en $_title...',
              prefixIcon: const Icon(Icons.search_rounded,
                  color: ArbolColors.verdeMedio, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded,
                          color: ArbolColors.tierraCalida, size: 18),
                      onPressed: () {
                        _searchCtrl.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 10),
              fillColor: ArbolColors.fondoClaro,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: ArbolColors.verdeMedio),
          const SizedBox(height: 16),
          Text('Cargando ${_title.toLowerCase()}...',
              style: const TextStyle(
                  color: ArbolColors.tierraCalida, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFEBEE),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.wifi_off_rounded,
                  color: ArbolColors.rojoAlerta, size: 48),
            ),
            const SizedBox(height: 16),
            const Text('Error de conexión',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: ArbolColors.rojoAlerta)),
            const SizedBox(height: 8),
            Text(_errorMsg!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 12, color: ArbolColors.tierraCalida)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _fetchData,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final filtered = _filtered;
    return Column(
      children: [
        // Sub-header con contador
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          color: ArbolColors.fondoClaro,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: ArbolColors.verdeMenta,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ArbolColors.pergaminoVerde),
                ),
                child: Text(
                  '${filtered.length} registro${filtered.length != 1 ? 's' : ''}',
                  style: const TextStyle(
                      fontSize: 12,
                      color: ArbolColors.verdeProfundo,
                      fontWeight: FontWeight.w600),
                ),
              ),
              if (_searchQuery.isNotEmpty) ...[
                const SizedBox(width: 8),
                Text('filtrado${filtered.length != 1 ? 's' : ''} de ${_data.length}',
                    style: const TextStyle(
                        fontSize: 12, color: ArbolColors.tierraCalida)),
              ],
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.refresh_rounded,
                    size: 18, color: ArbolColors.verdeMedio),
                tooltip: 'Actualizar',
                onPressed: _fetchData,
              ),
            ],
          ),
        ),

        // Tabla o vacío
        Expanded(
          child: filtered.isEmpty
              ? _buildEmpty()
              : _buildTable(filtered),
        ),
      ],
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_rounded,
              size: 72, color: ArbolColors.verdeSalvia.withOpacity(0.3)),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isNotEmpty
                ? 'Sin resultados para "$_searchQuery"'
                : 'Sin registros',
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: ArbolColors.verdeProfundo),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isNotEmpty
                ? 'Intenta con otro término de búsqueda'
                : 'Presiona "Agregar" para crear el primer registro',
            style: const TextStyle(
                fontSize: 13, color: ArbolColors.tierraCalida),
          ),
        ],
      ),
    );
  }

  Widget _buildTable(List<Map<String, dynamic>> rows) {
    if (rows.isEmpty) return const SizedBox.shrink();

    final cols = _visibleCols(rows.first);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ArbolColors.pergaminoVerde),
            boxShadow: [
              BoxShadow(
                color: ArbolColors.verdeProfundo.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: DataTable(
              columnSpacing: 20,
              dataRowMinHeight: 50,
              dataRowMaxHeight: 60,
              headingRowHeight: 46,
              horizontalMargin: 16,
              headingRowColor: WidgetStateColor.resolveWith(
                  (_) => ArbolColors.verdeMenta),
              dividerThickness: 0.8,
              border: TableBorder(
                horizontalInside: BorderSide(
                    color: ArbolColors.pergaminoVerde, width: 0.8),
              ),
              columns: [
                // Columnas de datos
                ...cols.map((col) => DataColumn(
                  label: Tooltip(
                    message: col,
                    child: Text(
                      colLabel(col),
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: ArbolColors.verdeProfundo,
                          letterSpacing: 0.3),
                    ),
                  ),
                )),
                // Columna acciones
                const DataColumn(
                  label: Text('Acciones',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: ArbolColors.verdeProfundo)),
                ),
              ],
              rows: rows.asMap().entries.map((entry) {
                final idx  = entry.key;
                final item = entry.value;
                return DataRow(
                  color: WidgetStateColor.resolveWith((_) =>
                      idx.isEven
                          ? Colors.white
                          : ArbolColors.fondoClaro.withOpacity(0.5)),
                  cells: [
                    // Celdas de datos
                    ...cols.map((col) {
                      final raw = item[col];
                      final val = raw?.toString() ?? '—';
                      final isBadge = col == 'nivel_riesgo' ||
                          col == 'NIVEL_RIESGO' ||
                          col == 'es_productivo' ||
                          col == 'ES_PRODUCTIVO' ||
                          col == 'tipo_plaga' ||
                          col == 'TIPO_PLAGA';

                      return DataCell(
                        isBadge
                            ? _buildBadge(col, val)
                            : Tooltip(
                                message: val.length > 30 ? val : '',
                                child: Text(
                                  val.length > 28
                                      ? '${val.substring(0, 28)}…'
                                      : val,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: ArbolColors.grafito),
                                ),
                              ),
                      );
                    }),
                    // Celda de acciones
                    DataCell(Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _ActionBtn(
                          icon: Icons.edit_outlined,
                          color: ArbolColors.verdeMedio,
                          tooltip: 'Editar',
                          onTap: () => _openForm(item: item),
                        ),
                        const SizedBox(width: 4),
                        _ActionBtn(
                          icon: Icons.delete_outline_rounded,
                          color: ArbolColors.rojoAlerta,
                          tooltip: 'Eliminar',
                          onTap: () => _delete(item),
                        ),
                      ],
                    )),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String col, String val) {
    Color bg;
    Color fg;
    final v = val.toUpperCase();

    if (col.contains('riesgo') || col.contains('RIESGO')) {
      switch (v) {
        case 'ALTO':
          bg = const Color(0xFFFFEBEE);
          fg = ArbolColors.rojoAlerta;
          break;
        case 'MEDIO':
          bg = const Color(0xFFFFF8E1);
          fg = const Color(0xFFF57F17);
          break;
        default:
          bg = const Color(0xFFE8F5E9);
          fg = ArbolColors.exito;
      }
    } else if (v == 'S' || v == 'SI' || v == 'PLAGA') {
      bg = const Color(0xFFFFEBEE);
      fg = ArbolColors.rojoAlerta;
    } else {
      bg = const Color(0xFFE8F5E9);
      fg = ArbolColors.exito;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: fg.withOpacity(0.25)),
      ),
      child: Text(val,
          style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: fg,
              letterSpacing: 0.3)),
    );
  }
}

// ─────────────────────────────────────────────────
//  BOTÓN DE ACCIÓN EN TABLA
// ─────────────────────────────────────────────────
class _ActionBtn extends StatefulWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onTap;
  const _ActionBtn({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onTap,
  });
  @override
  State<_ActionBtn> createState() => _ActionBtnState();
}

class _ActionBtnState extends State<_ActionBtn> {
  bool _hovered = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit:  (_) => setState(() => _hovered = false),
      cursor: SystemMouseCursors.click,
      child: Tooltip(
        message: widget.tooltip,
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: _hovered
                  ? widget.color.withOpacity(0.15)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
              border: _hovered
                  ? Border.all(color: widget.color.withOpacity(0.4))
                  : null,
            ),
            child: Icon(widget.icon, size: 17, color: widget.color),
          ),
        ),
      ),
    );
  }
}
