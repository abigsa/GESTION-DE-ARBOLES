import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey  = GlobalKey<FormState>();
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _verPassword = false;
  late final AnimationController _animCtrl;
  late final Animation<double> _fadeAnim;
  late final Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _fadeAnim  = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _userCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    final auth   = context.read<AuthProvider>();
    final result = await auth.login(_userCtrl.text.trim(), _passCtrl.text);
    if (!mounted) return;
    if (result['ok'] == true) {
      context.go('/admin');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(result['mensaje'] ?? 'Error al iniciar sesión'),
        backgroundColor: ArbolColors.rojoAlerta,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [

          // ── Fondo split: izquierda oscura / derecha clara ──
          Row(
            children: [
              Expanded(
                flex: 4,
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFF0D2B18),
                        Color(0xFF1B4D2A),
                        Color(0xFF245934),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                flex: 6,
                child: Container(
                  color: const Color(0xFFF2F7F3),
                  child: CustomPaint(
                    painter: _DotPainter(),
                    child: const SizedBox.expand(),
                  ),
                ),
              ),
            ],
          ),

          // ── Elementos decorativos izquierda ──────────────
          // Líneas diagonales sutiles
          Positioned(
            top: 0, left: 0, right: size.width * 0.60, bottom: 0,
            child: CustomPaint(painter: _LinePainter()),
          ),

          // Hexágonos / hojas decorativas
          Positioned(
            top: size.height * 0.08, left: 40,
            child: _LeafDeco(size: 90, opacity: 0.12),
          ),
          Positioned(
            bottom: size.height * 0.1, left: 60,
            child: _LeafDeco(size: 130, opacity: 0.08, rotated: true),
          ),
          Positioned(
            top: size.height * 0.4, left: -20,
            child: _LeafDeco(size: 70, opacity: 0.10),
          ),

          // Texto branding lado izquierdo
          Positioned(
            left: 48, bottom: size.height * 0.12,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Gestión\nForestal',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        height: 1.1,
                        letterSpacing: -0.5)),
                const SizedBox(height: 8),
                Text('Sistema de control y\nmonitoreo de árboles',
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.55),
                        fontSize: 13,
                        height: 1.5)),
              ],
            ),
          ),

          // ── Íconos de características (izq) ─────────────
          Positioned(
            left: 48, top: size.height * 0.22,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _FeatureChip(icon: Icons.park_rounded,           label: 'Control de árboles'),
                const SizedBox(height: 10),
                _FeatureChip(icon: Icons.bug_report_rounded,     label: 'Registro de plagas'),
                const SizedBox(height: 10),
                _FeatureChip(icon: Icons.science_rounded,        label: 'Gestión de tratamientos'),
                const SizedBox(height: 10),
                _FeatureChip(icon: Icons.landscape_rounded,      label: 'Administración de fincas'),
              ],
            ),
          ),

          // ── Card de login (derecha) ───────────────────────
          Align(
            alignment: Alignment.center,
            child: Padding(
              padding: EdgeInsets.only(left: size.width * 0.42),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SlideTransition(
                  position: _slideAnim,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(28, 28, 28, 24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.14),
                            blurRadius: 40,
                            offset: const Offset(-8, 12),
                          ),
                          BoxShadow(
                            color: ArbolColors.verdeProfundo.withOpacity(0.08),
                            blurRadius: 20,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [

                            // Logo + título
                            Row(children: [
                              Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(
                                  color: ArbolColors.oroForestal,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.park_rounded,
                                    color: ArbolColors.verdeProfundo, size: 24),
                              ),
                              const SizedBox(width: 12),
                              const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Bienvenido',
                                      style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: ArbolColors.verdeProfundo)),
                                  Text('Inicia sesión para continuar',
                                      style: TextStyle(
                                          fontSize: 11,
                                          color: ArbolColors.tierraCalida)),
                                ],
                              ),
                            ]),

                            const SizedBox(height: 24),
                            const Divider(color: ArbolColors.pergaminoVerde),
                            const SizedBox(height: 20),

                            // Campo usuario
                            _buildField(
                              controller: _userCtrl,
                              label: 'Usuario',
                              icon: Icons.person_outline_rounded,
                              validator: (v) => (v == null || v.isEmpty)
                                  ? 'Ingresa tu usuario' : null,
                            ),
                            const SizedBox(height: 12),

                            // Campo contraseña
                            _buildField(
                              controller: _passCtrl,
                              label: 'Contraseña',
                              icon: Icons.lock_outline_rounded,
                              obscure: !_verPassword,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _verPassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: ArbolColors.tierraCalida,
                                  size: 18,
                                ),
                                onPressed: () => setState(
                                    () => _verPassword = !_verPassword),
                              ),
                              validator: (v) => (v == null || v.isEmpty)
                                  ? 'Ingresa tu contraseña' : null,
                            ),
                            const SizedBox(height: 20),

                            // Botón ingresar
                            SizedBox(
                              height: 48,
                              child: ElevatedButton(
                                onPressed: auth.loading ? null : _login,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: ArbolColors.verdeProfundo,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                  textStyle: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 1.5),
                                ),
                                child: auth.loading
                                    ? const SizedBox(
                                        height: 18, width: 18,
                                        child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2.5))
                                    : const Text('INGRESAR'),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Divider + registro
                            Row(children: [
                              Expanded(child: Divider(
                                  color: ArbolColors.pergaminoVerde
                                      .withOpacity(0.8))),
                              const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 10),
                                child: Text('o',
                                    style: TextStyle(
                                        fontSize: 11,
                                        color: ArbolColors.tierraCalida)),
                              ),
                              Expanded(child: Divider(
                                  color: ArbolColors.pergaminoVerde
                                      .withOpacity(0.8))),
                            ]),
                            const SizedBox(height: 12),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('¿No tienes cuenta?',
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: ArbolColors.tierraCalida)),
                                TextButton(
                                  onPressed: () => context.go('/registro'),
                                  style: TextButton.styleFrom(
                                    foregroundColor: ArbolColors.verdeProfundo,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6),
                                    minimumSize: Size.zero,
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: const Text('Regístrate',
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Footer centrado ──────────────────────────────
          Positioned(
            bottom: 16, left: 0, right: 0,
            child: Center(
              child: Text(
                '© ${DateTime.now().year} Sistema de Gestión Forestal',
                style: TextStyle(
                    color: Colors.white.withOpacity(0.30),
                    fontSize: 10,
                    letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      style: const TextStyle(
          fontSize: 13,
          color: ArbolColors.verdeProfundo,
          fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(
            color: ArbolColors.tierraCalida, fontSize: 12),
        prefixIcon: Icon(icon, color: ArbolColors.verdeMedio, size: 17),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: ArbolColors.fondoClaro,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: ArbolColors.pergaminoVerde),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: ArbolColors.pergaminoVerde),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
              color: ArbolColors.verdeProfundo, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: ArbolColors.rojoAlerta),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              const BorderSide(color: ArbolColors.rojoAlerta, width: 1.5),
        ),
      ),
      validator: validator,
    );
  }
}

// ─────────────────────────────────────────────────
//  DECORACIONES
// ─────────────────────────────────────────────────

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _FeatureChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 30, height: 30,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.10),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Icon(icon, color: ArbolColors.oroForestal, size: 15),
      ),
      const SizedBox(width: 10),
      Text(label,
          style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 12,
              fontWeight: FontWeight.w500)),
    ]);
  }
}

class _LeafDeco extends StatelessWidget {
  final double size;
  final double opacity;
  final bool rotated;
  const _LeafDeco(
      {required this.size, required this.opacity, this.rotated = false});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: rotated ? 0.8 : -0.3,
      child: Icon(
        Icons.eco_rounded,
        size: size,
        color: Colors.white.withOpacity(opacity),
      ),
    );
  }
}

// Painter para líneas diagonales sutiles (lado izquierdo)
class _LinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;
    const spacing = 40.0;
    for (double x = -size.height; x < size.width + size.height; x += spacing) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + size.height, size.height),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_) => false;
}

// Painter para textura de puntos (lado derecho blanco)
class _DotPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1B4D2A).withOpacity(0.07)
      ..style = PaintingStyle.fill;
    const spacing = 22.0;
    const radius  = 1.5;
    for (double x = spacing; x < size.width; x += spacing) {
      for (double y = spacing; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
