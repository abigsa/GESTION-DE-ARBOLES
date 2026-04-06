import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class RegistroScreen extends StatefulWidget {
  const RegistroScreen({super.key});
  @override
  State<RegistroScreen> createState() => _RegistroScreenState();
}

class _RegistroScreenState extends State<RegistroScreen> {
  final _formKey      = GlobalKey<FormState>();
  final _userCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passCtrl     = TextEditingController();
  final _nombresCtrl  = TextEditingController();
  final _apellidosCtrl = TextEditingController();
  final _telefonoCtrl = TextEditingController();
  bool _verPassword   = false;

  @override
  void dispose() {
    _userCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _nombresCtrl.dispose();
    _apellidosCtrl.dispose();
    _telefonoCtrl.dispose();
    super.dispose();
  }

  Future<void> _registrar() async {
    if (!_formKey.currentState!.validate()) return;
    final auth   = context.read<AuthProvider>();
    final result = await auth.registrar({
      'username':      _userCtrl.text.trim(),
      'email':         _emailCtrl.text.trim(),
      'password_hash': _passCtrl.text,
      'nombres':       _nombresCtrl.text.trim(),
      'apellidos':     _apellidosCtrl.text.trim(),
      'telefono':      _telefonoCtrl.text.trim(),
      'rol_id':        3,
      'estado':        'ACTIVO',
    });
    if (!mounted) return;
    if (result['ok'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Cuenta creada. Inicia sesión.'),
        backgroundColor: ArbolColors.exito,
        behavior: SnackBarBehavior.floating,
      ));
      context.go('/login');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(result['mensaje'] ?? 'Error al registrar'),
        backgroundColor: ArbolColors.rojoAlerta,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: ArbolColors.fondoClaro,
      appBar: AppBar(
        title: const Text('Crear cuenta'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [ArbolColors.verdeProfundo, ArbolColors.verdeMedio],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: ArbolColors.oroForestal,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.park_rounded,
                          color: ArbolColors.verdeProfundo, size: 28),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Nueva cuenta',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700)),
                          Text('Completa tus datos para acceder al sistema',
                              style: TextStyle(
                                  color: ArbolColors.verdeSalvia,
                                  fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Sección datos de acceso
              _sectionLabel('Datos de acceso', Icons.lock_outline_rounded),
              const SizedBox(height: 14),

              _buildField(
                controller: _userCtrl,
                label: 'Nombre de usuario',
                icon: Icons.person_outline_rounded,
                validator: (v) => (v == null || v.isEmpty)
                    ? 'Campo requerido' : null,
              ),
              const SizedBox(height: 12),

              _buildField(
                controller: _emailCtrl,
                label: 'Correo electrónico',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Campo requerido';
                  if (!v.contains('@')) return 'Correo inválido';
                  return null;
                },
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _passCtrl,
                obscureText: !_verPassword,
                style: const TextStyle(
                    fontSize: 14, color: ArbolColors.verdeProfundo),
                decoration: InputDecoration(
                  labelText: 'Contraseña',
                  prefixIcon: const Icon(Icons.lock_outline_rounded,
                      color: ArbolColors.verdeMedio, size: 19),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _verPassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: ArbolColors.tierraCalida,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _verPassword = !_verPassword),
                  ),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Campo requerido';
                  if (v.length < 6) return 'Mínimo 6 caracteres';
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Sección datos personales
              _sectionLabel('Datos personales', Icons.badge_outlined),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: _buildField(
                      controller: _nombresCtrl,
                      label: 'Nombres',
                      icon: Icons.person_outline_rounded,
                      validator: (v) => (v == null || v.isEmpty)
                          ? 'Campo requerido' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildField(
                      controller: _apellidosCtrl,
                      label: 'Apellidos',
                      icon: Icons.person_outline_rounded,
                      validator: (v) => (v == null || v.isEmpty)
                          ? 'Campo requerido' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildField(
                controller: _telefonoCtrl,
                label: 'Teléfono (opcional)',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 32),

              // Botón registrar
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: auth.loading ? null : _registrar,
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5),
                  ),
                  child: auth.loading
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2.5))
                      : const Text('CREAR CUENTA'),
                ),
              ),
              const SizedBox(height: 16),

              // Link login
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('¿Ya tienes cuenta?',
                      style: TextStyle(
                          fontSize: 13, color: ArbolColors.tierraCalida)),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    style: TextButton.styleFrom(
                      foregroundColor: ArbolColors.verdeProfundo,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    child: const Text('Inicia sesión',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(String label, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: ArbolColors.verdeMenta,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: ArbolColors.verdeProfundo, size: 16),
        ),
        const SizedBox(width: 10),
        Text(label,
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: ArbolColors.verdeProfundo)),
      ],
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscure = false,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: const TextStyle(
          fontSize: 14, color: ArbolColors.verdeProfundo),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon:
            Icon(icon, color: ArbolColors.verdeMedio, size: 19),
      ),
      validator: validator,
    );
  }
}
