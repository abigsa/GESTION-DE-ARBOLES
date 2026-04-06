import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;

  // ── GET ─────────────────────────────────────────
  static Future<List<Map<String, dynamic>>> get(String endpoint) async {
    try {
      final url = '$baseUrl$endpoint';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 12),
        onTimeout: () => throw Exception(
            'Sin respuesta del servidor. ¿Está el backend activo?'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final raw = data['data'];
        if (raw == null) return [];
        if (raw is List) {
          return raw.map((e) => Map<String, dynamic>.from(e)).toList();
        }
        return [];
      } else {
        throw Exception(
            'Error ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  // ── POST ────────────────────────────────────────
  static Future<void> post(String endpoint, Map body) async {
    final url = '$baseUrl$endpoint';
    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 12));

    if (response.statusCode != 200 && response.statusCode != 201) {
      final d = jsonDecode(response.body);
      throw Exception(d['mensaje'] ?? 'Error ${response.statusCode}');
    }
  }

  // ── PUT ─────────────────────────────────────────
  static Future<void> put(String endpoint, int id, Map body) async {
    final url = '$baseUrl$endpoint/$id';
    final response = await http.put(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 12));

    if (response.statusCode != 200) {
      final d = jsonDecode(response.body);
      throw Exception(d['mensaje'] ?? 'Error ${response.statusCode}');
    }
  }

  // ── DELETE ───────────────────────────────────────
  static Future<void> delete(String endpoint, int id) async {
    final url = '$baseUrl$endpoint/$id';
    final response = await http
        .delete(Uri.parse(url))
        .timeout(const Duration(seconds: 12));

    if (response.statusCode != 200) {
      final d = jsonDecode(response.body);
      throw Exception(d['mensaje'] ?? 'Error ${response.statusCode}');
    }
  }
}
