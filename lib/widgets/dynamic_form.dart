import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../core/api_service.dart';

class DynamicForm extends StatefulWidget {
  final List fields;
  final String endpoint;
  final Map<String, dynamic>? editItem;
  final int? editId;

  const DynamicForm({
    super.key,
    required this.fields,
    required this.endpoint,
    this.editItem,
    this.editId,
  });

  @override
  State<DynamicForm> createState() => _DynamicFormState();
}

class _DynamicFormState extends State<DynamicForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, String?> _selectValues = {};
  bool _saving = false;

  bool get _isEditing => widget.editId != null;

  @override
  void initState() {
    super.initState();
    for (final field in widget.fields) {
      final name = field['name'] as String;
      final type = field['type'] as String;
      if (type == 'select') {
        final options = field['options'] as List;
        final initialVal = widget.editItem?[name]?.toString();
        _selectValues[name] = (initialVal != null && options.contains(initialVal))
            ? initialVal
            : null;
      } else {
        final initial = widget.editItem?[name]?.toString() ?? '';
        _controllers[name] = TextEditingController(text: initial);
      }
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) c.dispose();
    super.dispose();
  }

  Map<String, dynamic> _buildBody() {
    final body = <String, dynamic>{};
    for (final field in widget.fields) {
      final name = field['name'] as String;
      final type = field['type'] as String;
      if (type == 'select') {
        body[name] = _selectValues[name];
      } else if (type == 'number') {
        final v = _controllers[name]!.text.trim();
        body[name] = v.isEmpty ? null : num.tryParse(v);
      } else {
        body[name] = _controllers[name]!.text.trim();
      }
    }
    return body;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = _buildBody();
      if (_isEditing) {
        await ApiService.put(widget.endpoint, widget.editId!, body);
      } else {
        await ApiService.post(widget.endpoint, body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: ArbolColors.rojoAlerta,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.20),
                blurRadius: 40,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header degradado
              Container(
                padding: const EdgeInsets.fromLTRB(24, 20, 16, 16),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [ArbolColors.verdeProfundo, ArbolColors.verdeMedio],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ArbolColors.oroForestal,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _isEditing ? Icons.edit_rounded : Icons.add_rounded,
                        color: ArbolColors.verdeProfundo,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isEditing ? 'Editar registro' : 'Nuevo registro',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w700),
                          ),
                          Text(
                            _isEditing
                                ? 'Modifica los campos necesarios'
                                : 'Completa los campos para agregar',
                            style: const TextStyle(
                                color: ArbolColors.verdeSalvia, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded,
                          color: Colors.white, size: 20),
                      onPressed: () => Navigator.pop(context, false),
                    ),
                  ],
                ),
              ),

              // Campos
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        for (int i = 0; i < widget.fields.length; i++) ...[
                          if (i > 0) const SizedBox(height: 14),
                          _buildField(widget.fields[i]),
                        ],
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
                decoration: BoxDecoration(
                  color: ArbolColors.fondoClaro,
                  border: Border(
                      top: BorderSide(color: ArbolColors.pergaminoVerde)),
                  borderRadius:
                      const BorderRadius.vertical(bottom: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed:
                            _saving ? null : () => Navigator.pop(context, false),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _saving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: _saving
                            ? const SizedBox(
                                height: 18, width: 18,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2.5))
                            : Text(
                                _isEditing
                                    ? 'Guardar cambios'
                                    : 'Agregar registro',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(Map field) {
    final name  = field['name'] as String;
    final label = field['label'] as String;
    final type  = field['type'] as String;

    if (type == 'select') {
      final options = (field['options'] as List).cast<String>();
      return DropdownButtonFormField<String>(
        value: _selectValues[name],
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: const Icon(Icons.list_rounded,
              color: ArbolColors.verdeMedio, size: 18),
        ),
        items: options
            .map((o) => DropdownMenuItem(value: o, child: Text(o)))
            .toList(),
        onChanged: (v) => setState(() => _selectValues[name] = v),
        validator: (v) => v == null ? 'Selecciona una opción' : null,
        style: const TextStyle(
            fontSize: 14, color: ArbolColors.verdeProfundo),
        borderRadius: BorderRadius.circular(10),
      );
    }

    return TextFormField(
      controller: _controllers[name],
      keyboardType: type == 'number'
          ? const TextInputType.numberWithOptions(decimal: true)
          : TextInputType.text,
      style: const TextStyle(fontSize: 14, color: ArbolColors.verdeProfundo),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(
          type == 'number'
              ? Icons.pin_rounded
              : Icons.text_fields_rounded,
          color: ArbolColors.verdeMedio,
          size: 18,
        ),
      ),
      validator: (v) {
        if (name == 'descripcion' || name == 'observaciones') return null;
        if (v == null || v.trim().isEmpty) return 'Campo requerido';
        if (type == 'number' && num.tryParse(v.trim()) == null) {
          return 'Ingresa un número válido';
        }
        return null;
      },
    );
  }
}
