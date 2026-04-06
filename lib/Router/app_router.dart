import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

import '../screens/auth/login_screen.dart';
import '../screens/auth/registro_screen.dart';
import '../screens/admin/admin_home_screen.dart';
import '../screens/admin/crud_screen.dart';

class AppRouter {
  static GoRouter createRouter(BuildContext context) {
    return GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final auth = context.read<AuthProvider>();
        final enAuth = state.matchedLocation == '/login' ||
            state.matchedLocation == '/registro';
        if (!auth.isLoggedIn && !enAuth) return '/login';
        if (auth.isLoggedIn && enAuth)   return '/admin';
        return null;
      },
      routes: [
        // ── Auth ──────────────────────────────────────────
        GoRoute(path: '/login',    builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/registro', builder: (_, __) => const RegistroScreen()),

        // ── Admin / Técnico ───────────────────────────────
        GoRoute(path: '/admin', builder: (_, __) => const AdminHomeScreen()),

        // Catálogos
        GoRoute(
          path: '/admin/tipos-variedad',
          builder: (_, __) => const CrudScreen(moduleKey: 'tipos-variedad'),
        ),
        GoRoute(
          path: '/admin/fertilizantes',
          builder: (_, __) => const CrudScreen(moduleKey: 'tipos-fertilizante'),
        ),
        GoRoute(
          path: '/admin/tratamientos',
          builder: (_, __) => const CrudScreen(moduleKey: 'tipos-tratamiento'),
        ),
        GoRoute(
          path: '/admin/estados-arbol',
          builder: (_, __) => const CrudScreen(moduleKey: 'estados-arbol'),
        ),
        GoRoute(
          path: '/admin/plagas',
          builder: (_, __) => const CrudScreen(moduleKey: 'plagas-enfermedades'),
        ),

        // Operativos
        GoRoute(
          path: '/admin/fincas',
          builder: (_, __) => const CrudScreen(moduleKey: 'fincas'),
        ),
        GoRoute(
          path: '/admin/sectores',
          builder: (_, __) => const CrudScreen(moduleKey: 'sectores'),
        ),
        GoRoute(
          path: '/admin/arboles',
          builder: (_, __) => const CrudScreen(moduleKey: 'arboles'),
        ),

        // Registros
        GoRoute(
          path: '/admin/historial-estados',
          builder: (_, __) => const CrudScreen(moduleKey: 'historial-estados'),
        ),
        GoRoute(
          path: '/admin/registros-plaga',
          builder: (_, __) => const CrudScreen(moduleKey: 'registros-plaga'),
        ),
        GoRoute(
          path: '/admin/registros-tratamiento',
          builder: (_, __) => const CrudScreen(moduleKey: 'registros-tratamiento'),
        ),
        GoRoute(
          path: '/admin/resiembras',
          builder: (_, __) => const CrudScreen(moduleKey: 'resiembras'),
        ),
        GoRoute(
          path: '/admin/movimiento-inventario',
          builder: (_, __) => const CrudScreen(moduleKey: 'movimiento-inventario'),
        ),
      ],
    );
  }
}
