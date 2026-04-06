import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

enum UserRole { admin, tecnico, none }

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  UserRole _role   = UserRole.none;
  Map<String, dynamic>? _usuario;
  bool _loading    = false;

  bool get isLoggedIn => _isLoggedIn;
  UserRole get role   => _role;
  Map<String, dynamic>? get usuario => _usuario;
  bool get loading    => _loading;
  bool get isAdmin    => _role == UserRole.admin;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs    = await SharedPreferences.getInstance();
    final userData = prefs.getString('usuario');
    final roleStr  = prefs.getString('role');
    if (userData != null && roleStr != null) {
      _usuario    = jsonDecode(userData);
      _role       = roleStr == 'admin' ? UserRole.admin : UserRole.tecnico;
      _isLoggedIn = true;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.usuarios}/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['ok'] == true) {
        _usuario = data['data'];
        final rolId = _usuario?['rol_id'] ?? _usuario?['ROL_ID'];
        // rol_id 1 o 2 = admin/tecnico supervisor, 3+ = técnico campo
        _role = (rolId != null && rolId <= 2) ? UserRole.admin : UserRole.tecnico;
        _isLoggedIn = true;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('usuario', jsonEncode(_usuario));
        await prefs.setString('role', _role == UserRole.admin ? 'admin' : 'tecnico');
        notifyListeners();
        return {'ok': true, 'role': _role};
      }
      return {'ok': false, 'mensaje': data['mensaje'] ?? 'Credenciales incorrectas'};
    } catch (e) {
      return {'ok': false, 'mensaje': 'Error de conexión: $e'};
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> registrar(Map<String, dynamic> data) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.usuarios}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      final res = jsonDecode(response.body);
      if (response.statusCode == 201 && res['ok'] == true) {
        return {'ok': true};
      }
      return {'ok': false, 'mensaje': res['mensaje'] ?? 'Error al registrar'};
    } catch (e) {
      return {'ok': false, 'mensaje': 'Error de conexión: $e'};
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isLoggedIn = false;
    _role       = UserRole.none;
    _usuario    = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  int? get usuarioId {
    if (_usuario == null) return null;
    return _usuario!['usu_id'] ?? _usuario!['USU_ID'];
  }

  String get displayName {
    if (_usuario == null) return 'Usuario';
    return _usuario!['username'] ?? _usuario!['USERNAME'] ?? 'Usuario';
  }

  String get rolLabel => isAdmin ? 'Administrador' : 'Técnico de campo';
}
