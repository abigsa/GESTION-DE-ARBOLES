import 'package:flutter/material.dart';

class ArbolColors {
  // Paleta principal — verdes naturales con acento tierra
  static const verdeProfundo   = Color(0xFF1B4D2A);  // verde oscuro bosque
  static const verdeMedio      = Color(0xFF2D7A3E);  // verde medio
  static const verdeSalvia     = Color(0xFF4CB968);  // verde claro
  static const verdeMenta      = Color(0xFFE8F5E9);  // fondo muy claro
  static const tierraCalida    = Color(0xFF8B6F47);  // café tierra
  static const oroForestal     = Color(0xFFD4A853);  // oro / acento
  static const rojoAlerta      = Color(0xFF8B2E2E);  // rojo suave
  static const fondoClaro      = Color(0xFFF2F7F3);  // fondo general
  static const pergaminoVerde  = Color(0xFFDCEDDF);  // borde/divider
  static const grafito         = Color(0xFF4A4A4A);
  static const exito           = Color(0xFF2E7D32);
  static const error           = Color(0xFF8B2E2E);
  static const aviso           = Color(0xFFD4A853);
  static const info            = Color(0xFF1B4D2A);
}

class ArbolTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: ArbolColors.fondoClaro,
    colorScheme: const ColorScheme(
      brightness: Brightness.light,
      primary:              ArbolColors.verdeProfundo,
      onPrimary:            Colors.white,
      primaryContainer:     ArbolColors.verdeMedio,
      onPrimaryContainer:   Colors.white,
      secondary:            ArbolColors.oroForestal,
      onSecondary:          ArbolColors.verdeProfundo,
      secondaryContainer:   ArbolColors.verdeMenta,
      onSecondaryContainer: ArbolColors.verdeProfundo,
      tertiary:             ArbolColors.tierraCalida,
      onTertiary:           Colors.white,
      error:                ArbolColors.rojoAlerta,
      onError:              Colors.white,
      errorContainer:       Color(0xFFFFDAD6),
      onErrorContainer:     ArbolColors.rojoAlerta,
      surface:              Colors.white,
      onSurface:            ArbolColors.grafito,
      surfaceContainerHighest: ArbolColors.pergaminoVerde,
      outline:              ArbolColors.verdeSalvia,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: ArbolColors.verdeProfundo,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 18, fontWeight: FontWeight.w600,
        color: Colors.white, letterSpacing: 1.2,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: ArbolColors.verdeProfundo,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: 0.8),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: ArbolColors.verdeProfundo,
        side: const BorderSide(color: ArbolColors.verdeProfundo, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: ArbolColors.verdeMedio,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
        borderSide: const BorderSide(color: ArbolColors.verdeProfundo, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: ArbolColors.rojoAlerta),
      ),
      labelStyle: const TextStyle(color: ArbolColors.tierraCalida),
      hintStyle: const TextStyle(color: ArbolColors.tierraCalida),
    ),
    cardTheme: CardThemeData(
      elevation: 2,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
    ),
    dividerTheme: const DividerThemeData(color: ArbolColors.pergaminoVerde, thickness: 1),
    chipTheme: ChipThemeData(
      backgroundColor: ArbolColors.verdeMenta,
      selectedColor: ArbolColors.verdeProfundo,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: ArbolColors.verdeProfundo,
      unselectedItemColor: ArbolColors.verdeSalvia,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    textTheme: const TextTheme(
      headlineLarge:  TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: ArbolColors.verdeProfundo),
      headlineMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: ArbolColors.verdeProfundo),
      headlineSmall:  TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: ArbolColors.verdeProfundo),
      titleLarge:     TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: ArbolColors.verdeProfundo),
      titleMedium:    TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: ArbolColors.grafito),
      titleSmall:     TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: ArbolColors.grafito),
      bodyLarge:      TextStyle(fontSize: 15, fontWeight: FontWeight.w400, color: ArbolColors.grafito),
      bodyMedium:     TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: ArbolColors.grafito),
      bodySmall:      TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: ArbolColors.tierraCalida),
      labelLarge:     TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: ArbolColors.verdeProfundo),
    ),
  );
}
