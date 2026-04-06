import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/api_config.dart';
import '../../providers/auth_provider.dart';

// ─────────────────────────────────────────────────
//  BREAKPOINTS
// ─────────────────────────────────────────────────
const double _kMobile = 600;
const double _kTablet = 900;

// ─────────────────────────────────────────────────
//  KPI DATA
// ─────────────────────────────────────────────────
class _KpiData {
  final String label;
  final IconData icon;
  final Color accent;
  final bool isUp;
  final String endpoint;
  const _KpiData({
    required this.label,
    required this.icon,
    required this.accent,
    required this.endpoint,
    this.isUp = true,
  });
}

const _kpiDefs = [
  _KpiData(
    label: 'Total árboles',
    icon: Icons.park_rounded,
    accent: ArbolColors.verdeMedio,
    endpoint: ApiConfig.arboles,
  ),
  _KpiData(
    label: 'Fincas activas',
    icon: Icons.landscape_rounded,
    accent: ArbolColors.verdeProfundo,
    endpoint: ApiConfig.fincas,
  ),
  _KpiData(
    label: 'Plagas activas',
    icon: Icons.bug_report_rounded,
    accent: ArbolColors.rojoAlerta,
    isUp: false,
    endpoint: ApiConfig.plagasEnf,
  ),
  _KpiData(
    label: 'Tratamientos',
    icon: Icons.medical_services_rounded,
    accent: ArbolColors.oroForestal,
    endpoint: ApiConfig.registrosTrat,
  ),
];

// ─────────────────────────────────────────────────
//  NAV STRUCTURE
// ─────────────────────────────────────────────────
class _NavSection {
  final String title;
  final List<_NavEntry> entries;
  const _NavSection({required this.title, required this.entries});
}

class _NavEntry {
  final String label;
  final IconData icon;
  final String? route;
  final List<_NavEntry> children;
  const _NavEntry({
    required this.label,
    required this.icon,
    this.route,
    this.children = const [],
  });
}

const _navSections = [
  _NavSection(title: 'Catálogos', entries: [
    _NavEntry(
      label: 'Variedades',
      icon: Icons.category_rounded,
      route: '/admin/tipos-variedad',
    ),
    _NavEntry(
      label: 'Fertilizantes',
      icon: Icons.science_rounded,
      route: '/admin/fertilizantes',
    ),
    _NavEntry(
      label: 'Tratamientos',
      icon: Icons.medical_services_rounded,
      route: '/admin/tratamientos',
    ),
    _NavEntry(
      label: 'Estados de árbol',
      icon: Icons.device_hub_rounded,
      route: '/admin/estados-arbol',
    ),
    _NavEntry(
      label: 'Plagas y Enfermedades',
      icon: Icons.bug_report_rounded,
      route: '/admin/plagas',
    ),
  ]),
  _NavSection(title: 'Operativo', entries: [
    _NavEntry(
      label: 'Fincas',
      icon: Icons.landscape_rounded,
      route: '/admin/fincas',
    ),
    _NavEntry(
      label: 'Sectores',
      icon: Icons.map_rounded,
      route: '/admin/sectores',
    ),
    _NavEntry(
      label: 'Árboles',
      icon: Icons.park_rounded,
      route: '/admin/arboles',
    ),
  ]),
  _NavSection(title: 'Registros', entries: [
    _NavEntry(
      label: 'Historial de estados',
      icon: Icons.history_rounded,
      route: '/admin/historial-estados',
    ),
    _NavEntry(
      label: 'Registro de plagas',
      icon: Icons.pest_control_rounded,
      route: '/admin/registros-plaga',
    ),
    _NavEntry(
      label: 'Reg. tratamientos',
      icon: Icons.assignment_rounded,
      route: '/admin/registros-tratamiento',
    ),
    _NavEntry(
      label: 'Resiembras',
      icon: Icons.restart_alt_rounded,
      route: '/admin/resiembras',
    ),
    _NavEntry(
      label: 'Mov. inventario',
      icon: Icons.swap_horiz_rounded,
      route: '/admin/movimiento-inventario',
    ),
  ]),
];

const _quickModules = [
  {'label': 'Variedades',    'icon': Icons.category_rounded,          'route': '/admin/tipos-variedad'},
  {'label': 'Fertilizantes', 'icon': Icons.science_rounded,           'route': '/admin/fertilizantes'},
  {'label': 'Tratamientos',  'icon': Icons.medical_services_rounded,  'route': '/admin/tratamientos'},
  {'label': 'Estados',       'icon': Icons.device_hub_rounded,        'route': '/admin/estados-arbol'},
  {'label': 'Plagas',        'icon': Icons.bug_report_rounded,        'route': '/admin/plagas'},
  {'label': 'Fincas',        'icon': Icons.landscape_rounded,         'route': '/admin/fincas'},
  {'label': 'Sectores',      'icon': Icons.map_rounded,               'route': '/admin/sectores'},
  {'label': 'Árboles',       'icon': Icons.park_rounded,              'route': '/admin/arboles'},
  {'label': 'Historial',     'icon': Icons.history_rounded,           'route': '/admin/historial-estados'},
  {'label': 'Reg. plagas',   'icon': Icons.pest_control_rounded,      'route': '/admin/registros-plaga'},
  {'label': 'Reg. trat.',    'icon': Icons.assignment_rounded,        'route': '/admin/registros-tratamiento'},
  {'label': 'Resiembras',    'icon': Icons.restart_alt_rounded,       'route': '/admin/resiembras'},
  {'label': 'Inventario',    'icon': Icons.swap_horiz_rounded,        'route': '/admin/movimiento-inventario'},
];

// ─────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────
class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});
  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  final Set<String> _expanded = {};
  final Map<String, int> _kpiValues = {};

  @override
  void initState() {
    super.initState();
    _cargarKpis();
  }

  Future<void> _cargarKpis() async {
    for (final kpi in _kpiDefs) {
      try {
        final res  = await http.get(Uri.parse('${ApiConfig.baseUrl}${kpi.endpoint}'));
        final data = jsonDecode(res.body);
        if (data['ok'] == true) {
          final list = data['data'] as List;
          if (mounted) setState(() => _kpiValues[kpi.endpoint] = list.length);
        }
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth     = context.watch<AuthProvider>();
    final width    = MediaQuery.of(context).size.width;
    final isCompact  = width < _kMobile;
    final isMedium   = width >= _kMobile && width < _kTablet;
    final isExpanded = width >= _kTablet;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: ArbolColors.fondoClaro,
      drawer: (isCompact || isMedium)
          ? _buildDrawer(context, auth)
          : null,
      body: Row(
        children: [
          if (isMedium)   _buildRailCompact(context, auth),
          if (isExpanded) _buildSidebarFull(context, auth),
          Expanded(
            child: Column(
              children: [
                _buildTopBar(context, auth, !isExpanded),
                Expanded(child: _buildBody(context, width)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── TOP BAR ─────────────────────────────────────
  Widget _buildTopBar(BuildContext context, AuthProvider auth, bool showHamburger) {
    return Container(
      height: 58,
      color: ArbolColors.verdeProfundo,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          if (showHamburger)
            IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            ),
          const SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Bienvenido, ${auth.displayName}',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
                  decoration: BoxDecoration(
                    color: ArbolColors.oroForestal.withOpacity(0.22),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: ArbolColors.oroForestal.withOpacity(0.45)),
                  ),
                  child: Text(auth.rolLabel,
                      style: const TextStyle(
                          color: ArbolColors.oroForestal,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.4)),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Actualizar KPIs',
            onPressed: _cargarKpis,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            tooltip: 'Cerrar sesión',
            onPressed: () async {
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }

  // ── BODY ─────────────────────────────────────────
  Widget _buildBody(BuildContext context, double totalWidth) {
    return RefreshIndicator(
      color: ArbolColors.verdeProfundo,
      onRefresh: _cargarKpis,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPIs
            _sectionLabel('Resumen del sistema'),
            const SizedBox(height: 12),
            _buildKpiGrid(totalWidth),
            const SizedBox(height: 28),

            // Catálogos
            _sectionLabel('Catálogos'),
            const SizedBox(height: 10),
            _buildModuleGrid(context, _quickModules.sublist(0, 5), totalWidth),
            const SizedBox(height: 24),

            // Operativo
            _sectionLabel('Operativo'),
            const SizedBox(height: 10),
            _buildModuleGrid(context, _quickModules.sublist(5, 8), totalWidth),
            const SizedBox(height: 24),

            // Registros
            _sectionLabel('Registros'),
            const SizedBox(height: 10),
            _buildModuleGrid(context, _quickModules.sublist(8), totalWidth),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // ── KPI GRID ─────────────────────────────────────
  Widget _buildKpiGrid(double totalWidth) {
    final cw   = _contentWidth(totalWidth);
    final cols = cw > 560 ? 4 : (cw > 300 ? 2 : 1);
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: cols,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: cols >= 4 ? 2.2 : 2.4,
      ),
      itemCount: _kpiDefs.length,
      itemBuilder: (_, i) {
        final kpi = _kpiDefs[i];
        final val = _kpiValues[kpi.endpoint];
        return _HoverKpiCard(kpi: kpi, value: val);
      },
    );
  }

  // ── MODULE GRID ──────────────────────────────────
  Widget _buildModuleGrid(BuildContext context,
      List<Map<String, dynamic>> items, double totalWidth) {
    final cw   = _contentWidth(totalWidth);
    final cols = cw > 700 ? 6 : cw > 460 ? 4 : cw > 300 ? 3 : 2;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: cols,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1.15,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) => _HoverModuleTile(item: items[i]),
    );
  }

  // ── SIDEBAR FULL (≥900px) ────────────────────────
  Widget _buildSidebarFull(BuildContext context, AuthProvider auth) {
    return Container(
      width: 224,
      color: ArbolColors.verdeProfundo,
      child: Column(
        children: [
          // Logo
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 14),
            decoration: BoxDecoration(
              border: Border(
                  bottom: BorderSide(color: Colors.white.withOpacity(0.08))),
            ),
            child: Row(
              children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(
                    color: ArbolColors.oroForestal,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.park_rounded,
                      color: ArbolColors.verdeProfundo, size: 22),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Gestión Árboles',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700),
                          overflow: TextOverflow.ellipsis),
                      Text('Panel de control',
                          style: TextStyle(
                              color: ArbolColors.verdeSalvia, fontSize: 10)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Nav
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                // Inicio
                _buildFullNavTile(
                  icon: Icons.dashboard_rounded,
                  label: 'Inicio',
                  onTap: () {},
                ),
                for (final sec in _navSections) ...[
                  _sidebarSectionLabel(sec.title),
                  for (final entry in sec.entries)
                    _buildFullNavEntry(context, entry),
                  const SizedBox(height: 4),
                ],
              ],
            ),
          ),
          // Logout
          Container(
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(color: Colors.white.withOpacity(0.08))),
            ),
            child: _buildFullNavTile(
              icon: Icons.logout_rounded,
              label: 'Cerrar sesión',
              iconColor: ArbolColors.rojoAlerta,
              textColor: ArbolColors.rojoAlerta,
              onTap: () async {
                await auth.logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _sidebarSectionLabel(String label) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 14, 16, 3),
    child: Text(label.toUpperCase(),
        style: const TextStyle(
            color: ArbolColors.verdeSalvia,
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2)),
  );

  Widget _buildFullNavEntry(BuildContext context, _NavEntry entry) {
    if (entry.children.isEmpty) {
      return _buildFullNavTile(
        icon: entry.icon,
        label: entry.label,
        onTap: () { if (entry.route != null) context.go(entry.route!); },
      );
    }
    final isOpen = _expanded.contains(entry.label);
    return Column(children: [
      InkWell(
        onTap: () => setState(() => isOpen
            ? _expanded.remove(entry.label)
            : _expanded.add(entry.label)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 1),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
            child: Row(children: [
              Icon(entry.icon, size: 16, color: ArbolColors.verdeSalvia),
              const SizedBox(width: 10),
              Expanded(child: Text(entry.label,
                  style: const TextStyle(color: Colors.white, fontSize: 13))),
              AnimatedRotation(
                turns: isOpen ? 0.25 : 0,
                duration: const Duration(milliseconds: 180),
                child: const Icon(Icons.chevron_right_rounded,
                    size: 16, color: ArbolColors.verdeSalvia),
              ),
            ]),
          ),
        ),
      ),
      AnimatedCrossFade(
        duration: const Duration(milliseconds: 180),
        crossFadeState:
            isOpen ? CrossFadeState.showSecond : CrossFadeState.showFirst,
        firstChild: const SizedBox.shrink(),
        secondChild: Container(
          color: Colors.black.withOpacity(0.15),
          child: Column(
            children: entry.children
                .map((c) => _buildFullNavTile(
                      icon: c.icon, label: c.label, indent: true,
                      onTap: () { if (c.route != null) context.go(c.route!); },
                    ))
                .toList(),
          ),
        ),
      ),
    ]);
  }

  Widget _buildFullNavTile({
    required IconData icon,
    required String label,
    bool indent = false,
    Color? iconColor,
    Color? textColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: indent ? 6 : 10, vertical: 1),
        child: Container(
          padding: EdgeInsets.only(
              left: indent ? 28 : 8, right: 8, top: 9, bottom: 9),
          child: Row(children: [
            Icon(icon, size: 16, color: iconColor ?? ArbolColors.verdeSalvia),
            const SizedBox(width: 10),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                      color: textColor ?? Colors.white.withOpacity(0.88),
                      fontSize: 13)),
            ),
          ]),
        ),
      ),
    );
  }

  // ── RAIL COMPACTO (600–900px) ────────────────────
  Widget _buildRailCompact(BuildContext context, AuthProvider auth) {
    final flat = [
      for (final s in _navSections)
        for (final e in s.entries) ...[
          if (e.route != null) e,
          for (final c in e.children) if (c.route != null) c,
        ]
    ];
    return Container(
      width: 62,
      color: ArbolColors.verdeProfundo,
      child: Column(children: [
        const SizedBox(height: 48),
        Container(
          width: 38, height: 38,
          margin: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
              color: ArbolColors.oroForestal,
              borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.park_rounded,
              color: ArbolColors.verdeProfundo, size: 22),
        ),
        Container(
            height: 1,
            color: Colors.white.withOpacity(0.08),
            margin: const EdgeInsets.symmetric(vertical: 4)),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 4),
            children: flat.map((e) => _buildRailIcon(context, e)).toList(),
          ),
        ),
        Container(height: 1, color: Colors.white.withOpacity(0.08)),
        _buildRailIconRaw(
          icon: Icons.logout_rounded,
          tooltip: 'Cerrar sesión',
          color: ArbolColors.rojoAlerta,
          onTap: () async {
            await auth.logout();
            if (context.mounted) context.go('/login');
          },
        ),
        const SizedBox(height: 12),
      ]),
    );
  }

  Widget _buildRailIcon(BuildContext context, _NavEntry entry) {
    return _buildRailIconRaw(
      icon: entry.icon,
      tooltip: entry.label,
      onTap: () { if (entry.route != null) context.go(entry.route!); },
    );
  }

  Widget _buildRailIconRaw({
    required IconData icon,
    required String tooltip,
    Color? color,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: tooltip,
      preferBelow: false,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
          child: Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10)),
            child:
                Icon(icon, size: 20, color: color ?? ArbolColors.verdeSalvia),
          ),
        ),
      ),
    );
  }

  // ── DRAWER (móvil) ───────────────────────────────
  Widget _buildDrawer(BuildContext context, AuthProvider auth) {
    return Drawer(
      backgroundColor: ArbolColors.verdeProfundo,
      width: 265,
      child: Column(children: [
        DrawerHeader(
          margin: EdgeInsets.zero,
          padding: EdgeInsets.zero,
          decoration: const BoxDecoration(color: ArbolColors.verdeProfundo),
          child: Stack(children: [
            Positioned(
              top: -15, right: -15,
              child: Container(
                width: 90, height: 90,
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: ArbolColors.oroForestal.withOpacity(0.08)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 36, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Row(children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                          color: ArbolColors.oroForestal,
                          borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.park_rounded,
                          color: ArbolColors.verdeProfundo, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Gestión Árboles',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700),
                              overflow: TextOverflow.ellipsis),
                          Text('Panel de control',
                              style: TextStyle(
                                  color: ArbolColors.verdeSalvia,
                                  fontSize: 11)),
                        ],
                      ),
                    ),
                  ]),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: Colors.white.withOpacity(0.10)),
                    ),
                    child: Row(children: [
                      Container(
                        width: 26, height: 26,
                        decoration: BoxDecoration(
                            color: ArbolColors.oroForestal,
                            borderRadius: BorderRadius.circular(6)),
                        alignment: Alignment.center,
                        child: Text(
                          auth.displayName.isNotEmpty
                              ? auth.displayName[0].toUpperCase()
                              : 'U',
                          style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: ArbolColors.verdeProfundo),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(auth.displayName,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w500),
                            overflow: TextOverflow.ellipsis),
                      ),
                    ]),
                  ),
                ],
              ),
            ),
          ]),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 8),
            children: [
              _buildFullNavTile(
                icon: Icons.dashboard_rounded,
                label: 'Inicio',
                onTap: () => Navigator.pop(context),
              ),
              for (final sec in _navSections) ...[
                _sidebarSectionLabel(sec.title),
                for (final entry in sec.entries)
                  _buildDrawerNavEntry(context, entry),
                const SizedBox(height: 4),
              ],
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(color: Colors.white.withOpacity(0.08)))),
          child: _buildFullNavTile(
            icon: Icons.logout_rounded,
            label: 'Cerrar sesión',
            iconColor: ArbolColors.rojoAlerta,
            textColor: ArbolColors.rojoAlerta,
            onTap: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ),
      ]),
    );
  }

  Widget _buildDrawerNavEntry(BuildContext context, _NavEntry entry) {
    if (entry.children.isEmpty) {
      return _buildFullNavTile(
        icon: entry.icon,
        label: entry.label,
        onTap: () {
          Navigator.pop(context);
          if (entry.route != null) context.go(entry.route!);
        },
      );
    }
    final key    = 'drawer_${entry.label}';
    final isOpen = _expanded.contains(key);
    return Column(children: [
      InkWell(
        onTap: () => setState(() =>
            isOpen ? _expanded.remove(key) : _expanded.add(key)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 1),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
            child: Row(children: [
              Icon(entry.icon, size: 16, color: ArbolColors.verdeSalvia),
              const SizedBox(width: 10),
              Expanded(child: Text(entry.label,
                  style: const TextStyle(color: Colors.white, fontSize: 13))),
              AnimatedRotation(
                turns: isOpen ? 0.25 : 0,
                duration: const Duration(milliseconds: 180),
                child: const Icon(Icons.chevron_right_rounded,
                    size: 16, color: ArbolColors.verdeSalvia),
              ),
            ]),
          ),
        ),
      ),
      AnimatedCrossFade(
        duration: const Duration(milliseconds: 180),
        crossFadeState:
            isOpen ? CrossFadeState.showSecond : CrossFadeState.showFirst,
        firstChild: const SizedBox.shrink(),
        secondChild: Container(
          color: Colors.black.withOpacity(0.15),
          child: Column(
            children: entry.children.map((c) => _buildFullNavTile(
              icon: c.icon, label: c.label, indent: true,
              onTap: () {
                Navigator.pop(context);
                if (c.route != null) context.go(c.route!);
              },
            )).toList(),
          ),
        ),
      ),
    ]);
  }

  // ── HELPERS ──────────────────────────────────────
  double _contentWidth(double totalWidth) {
    if (totalWidth >= _kTablet) return totalWidth - 224;
    if (totalWidth >= _kMobile) return totalWidth - 62;
    return totalWidth;
  }

  Widget _sectionLabel(String label) => Row(children: [
    Container(
      width: 3, height: 16,
      decoration: BoxDecoration(
          color: ArbolColors.oroForestal,
          borderRadius: BorderRadius.circular(2)),
    ),
    const SizedBox(width: 8),
    Text(label,
        style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: ArbolColors.verdeProfundo)),
  ]);
}

// ─────────────────────────────────────────────────
//  HOVER KPI CARD
// ─────────────────────────────────────────────────
class _HoverKpiCard extends StatefulWidget {
  final _KpiData kpi;
  final int? value;
  const _HoverKpiCard({required this.kpi, this.value});
  @override
  State<_HoverKpiCard> createState() => _HoverKpiCardState();
}

class _HoverKpiCardState extends State<_HoverKpiCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final k = widget.kpi;
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit:  (_) => setState(() => _hovered = false),
      cursor: SystemMouseCursors.click,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        transform: Matrix4.identity()
          ..translate(0.0, _hovered ? -4.0 : 0.0),
        decoration: BoxDecoration(
          color: _hovered ? const Color(0xFFF8FFF9) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _hovered
                ? ArbolColors.oroForestal.withOpacity(0.55)
                : ArbolColors.pergaminoVerde.withOpacity(0.9),
            width: _hovered ? 1.5 : 1.0,
          ),
          boxShadow: _hovered
              ? [
                  BoxShadow(
                    color: k.accent.withOpacity(0.18),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: ArbolColors.oroForestal.withOpacity(0.08),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [
                  BoxShadow(
                    color: k.accent.withOpacity(0.07),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
        ),
        child: Row(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: _hovered
                    ? k.accent.withOpacity(0.20)
                    : k.accent.withOpacity(0.10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(k.icon, size: 18, color: k.accent),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    widget.value != null ? '${widget.value}' : '—',
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: ArbolColors.verdeProfundo,
                        letterSpacing: -0.5),
                  ),
                  Text(k.label,
                      style: const TextStyle(
                          fontSize: 10.5,
                          color: ArbolColors.tierraCalida,
                          fontWeight: FontWeight.w500),
                      overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20, height: 20,
              decoration: BoxDecoration(
                color: k.isUp
                    ? const Color(0xFFDDF3E0)
                    : const Color(0xFFFCEBEB),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                k.isUp
                    ? Icons.arrow_upward_rounded
                    : Icons.arrow_downward_rounded,
                size: 11,
                color: k.isUp
                    ? const Color(0xFF2E7D32)
                    : ArbolColors.rojoAlerta,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────
//  HOVER MODULE TILE
// ─────────────────────────────────────────────────
class _HoverModuleTile extends StatefulWidget {
  final Map<String, dynamic> item;
  const _HoverModuleTile({required this.item});
  @override
  State<_HoverModuleTile> createState() => _HoverModuleTileState();
}

class _HoverModuleTileState extends State<_HoverModuleTile> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final active = _hovered || _pressed;
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit:  (_) => setState(() => _hovered = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => context.go(widget.item['route'] as String),
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp:   (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          transform: Matrix4.identity()
            ..translate(0.0, _pressed ? 1.0 : _hovered ? -5.0 : 0.0)
            ..scale(_pressed ? 0.97 : 1.0),
          transformAlignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: active
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white,
                      ArbolColors.oroForestal.withOpacity(0.05),
                    ],
                  )
                : const LinearGradient(
                    colors: [Colors.white, Colors.white]),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: active
                  ? ArbolColors.oroForestal.withOpacity(0.65)
                  : ArbolColors.pergaminoVerde.withOpacity(0.8),
              width: active ? 1.5 : 1.0,
            ),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: ArbolColors.verdeProfundo.withOpacity(0.14),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: ArbolColors.verdeProfundo.withOpacity(0.07),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
          ),
          child: Stack(
            children: [
              // Línea dorada superior difuminada en orillas
              Positioned(
                top: 0, left: 0, right: 0,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 180),
                  opacity: active ? 1.0 : 0.0,
                  child: Container(
                    height: 3,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          ArbolColors.oroForestal,
                          ArbolColors.oroForestal,
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.2, 0.8, 1.0],
                      ),
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(11)),
                    ),
                  ),
                ),
              ),
              // Contenido
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 38, height: 38,
                    decoration: BoxDecoration(
                      color: active
                          ? ArbolColors.verdeProfundo.withOpacity(0.14)
                          : ArbolColors.verdeProfundo.withOpacity(0.07),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      widget.item['icon'] as IconData,
                      color: active
                          ? ArbolColors.verdeProfundo
                          : ArbolColors.verdeProfundo.withOpacity(0.75),
                      size: 19,
                    ),
                  ),
                  const SizedBox(height: 7),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: AnimatedDefaultTextStyle(
                      duration: const Duration(milliseconds: 180),
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight:
                            active ? FontWeight.w700 : FontWeight.w600,
                        color: active
                            ? ArbolColors.verdeProfundo
                            : ArbolColors.verdeProfundo.withOpacity(0.75),
                      ),
                      child: Text(
                        widget.item['label'] as String,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
