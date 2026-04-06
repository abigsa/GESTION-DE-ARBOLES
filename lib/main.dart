import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GestionArbolesApp());
}

class GestionArbolesApp extends StatelessWidget {
  const GestionArbolesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: Builder(
        builder: (context) {
          final router = AppRouter.createRouter(context);
          return MaterialApp.router(
            title: 'Gestión de Árboles',
            debugShowCheckedModeBanner: false,
            theme: ArbolTheme.light,
            routerConfig: router,
          );
        },
      ),
    );
  }
}
