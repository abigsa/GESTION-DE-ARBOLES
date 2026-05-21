import { useEffect, useMemo, useState } from 'react';
import DatePickerField from './DatePickerField';
import s from './CrudFormNuevo.module.css';
import { Joyride } from 'react-joyride';

import { API, apiFetch } from '../context/AuthContext';

export default function CrudFormNuevo({ config, editItem, editId, onClose, onSaved }) {
  const { fields, endpoint, title = 'Módulo' } = config;
  const isEdit = editId !== null && editId !== undefined;

  const initForm = () => {
    const f = {};

    fields.forEach(field => {
      let val =
        editItem?.[field.name] ??
        editItem?.[field.name?.toUpperCase()] ??
        '';

      if (field.type === 'date' && val) {
        const d = new Date(val);
        if (!isNaN(d)) {
          val = d.toISOString().slice(0, 10);
        }
      }

      f[field.name] = val;
    });

    return f;
  };

  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [remoteOptions, setRemoteOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState({});


  // Colisión de posición
  const [posConflict, setPosConflict] = useState(false);
  const [checkingPos, setCheckingPos] = useState(false);

  const isVariedad = title === 'Tipos de Variedad';
  const isFertilizante = title === 'Fertilizantes';
  const isTratamiento = title === 'Tratamientos';
  const isEstadoArbol = title === 'Estados de Árbol';
  const isPlaga = title === 'Plagas y Enfermedades';
  const isFinca = title === 'Fincas';
  const isSector = title === 'Sectores';
  const isArbol = title === 'Árboles';
  const isHistorialEstado = title === 'Historial de Estados';
  const isRegistroPlaga = title === 'Registros de Plaga';
  const isRegistroTratamiento = title === 'Registros de Tratamiento';
  const isResiembra = title === 'Resiembras';
  const isMovimientoInventario = title === 'Movimiento de Inventario';

  const runFormTour =
    (
      isVariedad ||
      isFertilizante ||
      isTratamiento ||
      isEstadoArbol ||
      isPlaga ||
      isFinca ||
      isSector ||
      isArbol ||
      isHistorialEstado ||
      isRegistroPlaga ||
      isRegistroTratamiento ||
      isResiembra ||
      isMovimientoInventario
    ) && !!config;
const formTourSteps =
isMovimientoInventario
  ? [
      { target: '.tour-campo-finca-movimiento', content: 'Selecciona la finca.' },
      { target: '.tour-campo-sector-movimiento', content: 'Selecciona el sector.' },
      { target: '.tour-campo-arbol-movimiento', content: 'Selecciona el árbol.' },
      { target: '.tour-campo-tipo-movimiento', content: 'Selecciona el tipo de movimiento.' },
      { target: '.tour-campo-fecha-movimiento', content: 'Selecciona la fecha del movimiento.' },
      { target: '.tour-campo-observaciones', content: 'Agrega observaciones si es necesario.' },
      { target: '.tour-guardar', content: 'Cuando termines, presiona aquí para guardar.' },
    ]
      : isResiembra
  ? [
      { target: '.tour-campo-finca-resiembra', content: 'Selecciona la finca.' },
      { target: '.tour-campo-sector-resiembra', content: 'Selecciona el sector.' },
      { target: '.tour-campo-arbol-resiembra', content: 'Selecciona el árbol.' },
      { target: '.tour-campo-fecha-resiembra', content: 'Selecciona la fecha de resiembra.' },
      { target: '.tour-campo-motivo', content: 'Escribe el motivo de la resiembra.' },
      { target: '.tour-guardar', content: 'Cuando termines, presiona aquí para guardar.' },
    ]
:
isRegistroTratamiento
  ? [
      { target: '.tour-campo-finca-regtrat', content: 'Selecciona la finca.' },
      { target: '.tour-campo-sector-regtrat', content: 'Selecciona el sector.' },
      { target: '.tour-campo-arbol-regtrat', content: 'Selecciona el árbol.' },
      { target: '.tour-campo-tratamiento-regtrat', content: 'Selecciona el tratamiento.' },
      { target: '.tour-campo-fertilizante-regtrat', content: 'Selecciona el fertilizante si aplica.' },
      { target: '.tour-campo-fecha-aplicacion', content: 'Selecciona la fecha de aplicación.' },
      { target: '.tour-campo-observaciones', content: 'Agrega observaciones.' },
      { target: '.tour-guardar', content: 'Cuando termines, presiona aquí para guardar.' },
    ]
:
isRegistroPlaga
  ? [
      { target: '.tour-campo-finca-regplaga', content: 'Selecciona la finca.' },
      { target: '.tour-campo-sector-regplaga', content: 'Selecciona el sector.' },
      { target: '.tour-campo-arbol-regplaga', content: 'Selecciona el árbol.' },
      { target: '.tour-campo-plaga-regplaga', content: 'Selecciona la plaga o enfermedad.' },
      { target: '.tour-campo-deteccion', content: 'Selecciona la fecha de detección.' },
      { target: '.tour-campo-resolucion', content: 'Selecciona la fecha de resolución.' },
      { target: '.tour-campo-observaciones', content: 'Agrega observaciones.' },
      { target: '.tour-guardar', content: 'Cuando termines, presiona aquí para guardar.' },
    ]
: isArbol
    ? [
        {
          target: '.tour-campo-finca-arbol',
          content: 'Selecciona la finca.',
        },
        {
          target: '.tour-campo-sector-arbol',
          content: 'Selecciona el sector.',
        },
        {
          target: '.tour-campo-variedad-arbol',
          content: 'Selecciona la variedad del árbol.',
        },
        {
          target: '.tour-campo-estado-arbol',
          content: 'Selecciona el estado actual.',
        },
        {
          target: '.tour-campo-surco-arbol',
          content: 'Ingresa el número de surco.',
        },
        {
          target: '.tour-campo-posicion-arbol',
          content: 'Ingresa la posición dentro del surco.',
        },
        {
          target: '.tour-campo-descripcion',
          content: 'Agrega una descripción si deseas.',
        },
        {
          target: '.tour-guardar',
          content: 'Cuando termines, presiona aquí para guardar.',
        },
      ]
  : 
isSector
  ? [
      {
        target: '.tour-campo-finca-sector',
        content: 'Selecciona la finca correspondiente.',
      },
      {
        target: '.tour-campo-sector',
        content: 'Selecciona el sector. Ejemplo: Sector Norte.',
      },
      {
        target: '.tour-campo-area',
        content: 'Ingresa el área en hectáreas. Ejemplo: 10.',
      },
      {
        target: '.tour-campo-surcos',
        content: 'Ingresa la cantidad de surcos.',
      },
      {
        target: '.tour-campo-pos-surco',
        content: 'Ingresa las posiciones por surco.',
      },
      {
        target: '.tour-campo-tipo-cultivo',
        content: 'Escribe el tipo de cultivo. Ejemplo: Mango.',
      },
      {
        target: '.tour-guardar',
        content: 'Cuando termines, presiona aquí para guardar.',
      },
    ]
: isFinca
  ? [
      {
        target: '.tour-campo-nombre-finca',
        content: 'Escribe el nombre de la finca. Ejemplo: Finca El Paraíso.',
      },
      {
        target: '.tour-campo-ubicacion',
        content: 'Escribe la ubicación. Ejemplo: Baja Verapaz.',
      },
      {
        target: '.tour-campo-area',
        content: 'Indica el área en hectáreas. Ejemplo: 25.',
      },
      {
        target: '.tour-campo-propietario',
        content: 'Escribe el propietario. Ejemplo: Ángel Galeano.',
      },
      {
        target: '.tour-campo-telefono',
        content: 'Ingresa el teléfono de contacto. Ejemplo: 32945163.',
      },
      {
        target: '.tour-campo-descripcion',
        content: 'Agrega una descripción breve de la finca.',
      },
      {
        target: '.tour-guardar',
        content: 'Cuando termines, presiona aquí para crear la finca.',
      },
    ]
: isPlaga
  ? [
      {
        target: '.tour-campo-nombre-plaga',
        content: 'Selecciona la plaga o enfermedad. Ejemplo: Pulgones.',
      },
      {
        target: '.tour-campo-tipo-plaga',
        content: 'Selecciona el tipo. Ejemplo: PLAGA o ENFERMEDAD.',
      },
      {
        target: '.tour-campo-riesgo',
        content: 'Selecciona el nivel de riesgo. Ejemplo: ALTO, MEDIO o BAJO.',
      },
      {
        target: '.tour-campo-descripcion',
        content: 'Agrega una descripción breve.',
      },
      {
        target: '.tour-guardar',
        content: 'Cuando termines, presiona aquí para guardar el registro.',
      },
    ]
: isEstadoArbol
    ? [
        {
          target: '.tour-campo-nombre-estado',
          content: 'Escribe el estado del árbol. Ejemplo: Semilla, Crecimiento o Producción.',
        },
        {
          target: '.tour-campo-orden-ciclo',
          content: 'Indica el orden del ciclo. Ejemplo: 1 para etapas iniciales.',
        },
        {
          target: '.tour-campo-productivo',
          content: 'Selecciona si este estado es productivo. Ejemplo: Sí o No.',
        },
        {
          target: '.tour-campo-descripcion',
          content: 'Agrega una descripción breve del estado.',
        },
        {
          target: '.tour-guardar',
          content: 'Cuando termines, presiona aquí para crear el registro.',
        },
      ]
    : isTratamiento
    ? [
        {
          target: '.tour-campo-nombre-tratamiento',
          content: 'Selecciona el tratamiento. Ejemplo: Poda de Formación.',
        },
        {
          target: '.tour-campo-categoria',
          content: 'Escribe la categoría. Ejemplo: Fitosanitario.',
        },
        {
          target: '.tour-campo-metodo',
          content: 'Escribe el método de aplicación. Ejemplo: Aspersión foliar.',
        },
        {
          target: '.tour-campo-frecuencia',
          content: 'Indica la frecuencia. Ejemplo: Anual o Según necesidad.',
        },
        {
          target: '.tour-campo-descripcion',
          content: 'Agrega una descripción breve del tratamiento.',
        },
        {
          target: '.tour-guardar',
          content: 'Cuando termines, presiona aquí para crear el registro.',
        },
      ]
    : isFertilizante
    ? [
        {
          target: '.tour-campo-nombre-fertilizante',
          content: 'Selecciona el fertilizante. Ejemplo: Urea.',
        },
        {
          target: '.tour-campo-tipo-fertilizante',
          content: 'Escribe el tipo. Ejemplo: Químico.',
        },
        {
          target: '.tour-campo-nutrientes',
          content: 'Indica los nutrientes principales.',
        },
        {
          target: '.tour-campo-metodo',
          content: 'Método de aplicación.',
        },
        {
          target: '.tour-campo-frecuencia',
          content: 'Frecuencia de aplicación.',
        },
        {
          target: '.tour-campo-descripcion',
          content: 'Descripción del fertilizante.',
        },
        {
          target: '.tour-guardar',
          content: 'Presiona aquí para guardar.',
        },
      ]
    : [
        {
          target: '.tour-campo-arbol',
          content: 'Selecciona el árbol.',
        },
        {
          target: '.tour-campo-tipo-uso',
          content: 'Escribe el tipo de uso.',
        },
        {
          target: '.tour-campo-descripcion',
          content: 'Descripción del registro.',
        },
        {
          target: '.tour-guardar',
          content: 'Presiona aquí para guardar.',
        },
      ];
  const requiredCount = useMemo(
    () => fields.filter(field => field.required).length,
    [fields]
  );

  const fieldMap = useMemo(() => {
    const map = {};
    fields.forEach(field => {
      map[field.name] = field;
    });
    return map;
  }, [fields]);

  const getFieldValue = (obj, key) => {
    if (!key) return null;
    return obj?.[key] ?? obj?.[key?.toUpperCase()] ?? null;
  };

  const formatTemplateValue = (key, rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === '') return null;

    if (key === 'numero_surco' || key === 'NUMERO_SURCO') {
      return `Surco ${rawValue}`;
    }

    if (key === 'posicion_x' || key === 'POSICION_X') {
      return `Posición ${rawValue}`;
    }

    if (key === 'id_arbol' || key === 'ID_ARBOL') {
      return `ID ${rawValue}`;
    }

    return String(rawValue);
  };

  const dedupeOptions = options => {
    const seen = new Set();

    return options.filter(option => {
      const key = `${option.value}__${option.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const set = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };

      fields.forEach(field => {
        if (field.dependsOn?.field === k) {
          next[field.name] = '';
        }
      });

      return next;
    });

    fields.forEach(field => {
      if (field.dependsOn?.field === k) {
        setRemoteOptions(prev => ({
          ...prev,
          [field.name]: [],
        }));
      }
    });
  };

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    const buildRemoteUrlLocal = (field) => {
      const url = new URL(`${API}${field.optionSource}`);

      if (field.dependsOn?.field) {
        const parentValue = form[field.dependsOn.field];

        if (parentValue !== undefined && parentValue !== null && parentValue !== '') {
          const queryParam =
  field.dependsOn.queryParam ||
  field.dependsOn.optionField ||
  field.dependsOn.field;

url.searchParams.set(queryParam, parentValue);
        }
      }

      return url.toString();
    };

    const normalizeOptionLocal = (field, item, index) => {
      const value =
        getFieldValue(item, field.optionValue) ??
        item?.id ??
        item?.ID ??
        getFieldValue(item, field.name) ??
        index + 1;

      let label = null;

      if (Array.isArray(field.labelTemplate) && field.labelTemplate.length > 0) {
        const parts = field.labelTemplate
          .map(key => formatTemplateValue(key, getFieldValue(item, key)))
          .filter(Boolean);

        if (parts.length > 0) {
          label = parts.join(' · ');
        }
      }

      if (!label) {
        const candidateLabel =
          getFieldValue(item, field.optionLabel) ??
          item?.nombre ??
          item?.NOMBRE ??
          item?.descripcion ??
          item?.DESCRIPCION ??
          item?.nombre_finca ??
          item?.NOMBRE_FINCA ??
          item?.nombre_sector ??
          item?.NOMBRE_SECTOR ??
          item?.nombre_estado ??
          item?.NOMBRE_ESTADO ??
          item?.nombre_plaga ??
          item?.NOMBRE_PLAGA ??
          item?.nombre_tratamiento ??
          item?.NOMBRE_TRATAMIENTO ??
          item?.nombre_fertilizante ??
          item?.NOMBRE_FERTILIZANTE ??
          item?.nombre_arbol ??
          item?.NOMBRE_ARBOL;

        label =
          candidateLabel && String(candidateLabel).trim()
            ? String(candidateLabel)
            : `Registro #${value}`;
      }

      return {
        value: String(value),
        label,
        raw: item,
      };
    };

    const loadFieldOptions = async (field) => {
      const requiresParent = Boolean(field.dependsOn?.field);
      const parentValue = requiresParent ? form[field.dependsOn.field] : null;

      if (requiresParent && !parentValue) {
        if (!cancelledRef.cancelled) {
          setRemoteOptions(prev => ({
            ...prev,
            [field.name]: [],
          }));
          setLoadingOptions(prev => ({
            ...prev,
            [field.name]: false,
          }));
        }
        return;
      }

      if (!cancelledRef.cancelled) {
        setLoadingOptions(prev => ({
          ...prev,
          [field.name]: true,
        }));
      }

      try {
        const res = await apiFetch(buildRemoteUrlLocal(field));
        const json = await res.json();

        const rows = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.rows)
            ? json.rows
            : [];

        let options = rows.map((item, index) =>
          normalizeOptionLocal(field, item, index)
        );

        if (field.distinct) {
          const distinctMap = new Map();

          options.forEach(option => {
            const norm = String(option.value ?? '').trim();
            if (!norm) return;

            const dedupeKey =
              field.distinctBy === 'label'
                ? option.label
                : option.value;

            if (!distinctMap.has(dedupeKey)) {
              distinctMap.set(dedupeKey, option);
            }
          });

          options = Array.from(distinctMap.values());
        }

        options = dedupeOptions(options);

        if (!cancelledRef.cancelled) {
          setRemoteOptions(prev => ({
            ...prev,
            [field.name]: options,
          }));
        }
      } catch {
        if (!cancelledRef.cancelled) {
          setRemoteOptions(prev => ({
            ...prev,
            [field.name]: [],
          }));
        }
      } finally {
        if (!cancelledRef.cancelled) {
          setLoadingOptions(prev => ({
            ...prev,
            [field.name]: false,
          }));
        }
      }
    };

    const remoteFields = fields.filter(
      field => field.type === 'remote-select' && field.optionSource
    );

    remoteFields.forEach(field => {
      loadFieldOptions(field);
    });

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [fields, form]);

  const getDependentOptions = field => {
    return remoteOptions[field.name] ?? [];
  };

  // ── Validar colisión X/Y cuando cambian sector, posicion_x o posicion_y ──
  const isArbolesEndpoint = endpoint === '/arbol';
  useEffect(() => {
    if (!isArbolesEndpoint) return;
    const sector = form['id_sector'];
    const px = form['posicion_x'];
    const py = form['posicion_y'];
    if (!sector || px === '' || py === '' || px === null || py === null) {
      setPosConflict(false);
      return;
    }
    let cancelled = false;
    const check = async () => {
      setCheckingPos(true);
      try {
        const url = `${API}/arbol?id_sector=${sector}&posicion_x=${px}&posicion_y=${py}`;
        const res = await apiFetch(url);
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data
          : Array.isArray(json?.rows) ? json.rows : [];
        if (!cancelled) {
          // En edición ignorar el árbol actual
          const conflict = rows.some(r => {
            const id = r?.ID_ARBOL ?? r?.id_arbol;
            return isEdit ? String(id) !== String(editId) : true;
          });
          setPosConflict(conflict && rows.length > 0);
        }
      } catch {
        if (!cancelled) setPosConflict(false);
      } finally {
        if (!cancelled) setCheckingPos(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [form['id_sector'], form['posicion_x'], form['posicion_y'], isArbolesEndpoint, isEdit, editId]);

  const getRemotePlaceholder = field => {
    if (loadingOptions[field.name]) return 'Cargando opciones...';

    if (field.dependsOn?.field && !form[field.dependsOn.field]) {
      const parentLabel = fieldMap[field.dependsOn.field]?.label ?? 'campo anterior';
      return `Selecciona primero ${parentLabel.toLowerCase()}...`;
    }

    return 'Selecciona...';
  };

  const normalizeValueForSubmit = field => {
  const v = form[field.name];

  if (v === '' || v === null || v === undefined) return null;

  if (field.type === 'number') return Number(v);

  if (field.type === 'remote-select') {
    return field.valueType === 'string' ? String(v) : Number(v);
  }

  if (field.type === 'date') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return v;

    const parts = String(v).split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

    return v;
  }

  return v || null;
};  

  const handleSubmit = async e => {
    e.preventDefault();

    for (const field of fields) {
      if (field.omitOnSubmit) continue;

      if (field.required && !form[field.name] && form[field.name] !== 0) {
        setError(`El campo "${field.label}" es obligatorio`);
        return;
      }
    }

    setError('');
    setSaving(true);

    // Bloquear si hay conflicto de posición
    if (isArbolesEndpoint && posConflict) {
      setError('Ya existe un árbol en esa posición X/Y dentro del sector. Elige una posición diferente.');
      setSaving(false);
      return;
    }

    const body = {};
    fields.forEach(field => {
      if (field.omitOnSubmit) return;
      body[field.name] = normalizeValueForSubmit(field);
    });

    try {
      const url = isEdit ? `${API}${endpoint}/${editId}` : `${API}${endpoint}`;
      const method = isEdit ? 'PUT' : 'POST';
      console.log('BODY REGISTRO PLAGA:', body);
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.ok === true || json.success === true) {
  if (endpoint === '/registro-plaga') {
    window.dispatchEvent(new Event('plagas-actualizadas'));
  }

  onSaved();
} else {
        setError(json.mensaje ?? json.message ?? 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={s.overlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
  
 {runFormTour && (
  <Joyride
  steps={formTourSteps}
  run={runFormTour}
  continuous
  showSkipButton
  showProgress
  disableScrolling
  disableScrollParentFix
  floaterProps={{
  hideArrow: false,
  offset: 16,
}}
    disableOverlayClose
    spotlightClicks
    locale={{
      back: 'Atrás',
      close: 'Cerrar',
      last: 'Finalizar',
      next: 'Siguiente',
      skip: 'Saltar',
    }}
    styles={{
      options: {
        zIndex: 20000,
        primaryColor: '#14532d',
      },
    }}
  />
)}

      <div className={s.modal}>
        <div className={s.header}>
          <div className={s.headerMain}>
            <div className={s.hIcon}>
              <span className="material-icons">{isEdit ? 'edit' : 'add'}</span>
            </div>

            <div className={s.headerText}>
              <p className={s.eyebrow}>{isEdit ? 'EDICIÓN DE REGISTRO' : 'NUEVO REGISTRO'}</p>
              <h3>{isEdit ? 'Editar registro' : 'Crear registro'}</h3>
              <p className={s.headerDesc}>
                {isEdit
                  ? `Actualiza la información del módulo ${title.toLowerCase()}.`
                  : `Completa los campos para agregar un nuevo elemento en ${title.toLowerCase()}.`}
              </p>
            </div>
          </div>

          <button className={s.closeBtn} onClick={onClose} type="button">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className={s.metaBar}>
          <div className={s.metaItem}>
            <span className="material-icons">view_list</span>
            <span>{fields.length} campo{fields.length !== 1 ? 's' : ''}</span>
          </div>

          <div className={s.metaItem}>
            <span className="material-icons">priority_high</span>
            <span>{requiredCount} obligatorio{requiredCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className={s.body}>
          <form id="crudForm" onSubmit={handleSubmit} noValidate className={s.formGrid}>
            {fields.map(field => (
              <div
                key={field.name}
                className={`${s.fieldWrap} ${field.type === 'textarea' ? s.fieldFull : ''} ${
 field.name === 'nombre_arbol' ? 'tour-campo-arbol' :
field.name === 'tipo_uso' ? 'tour-campo-tipo-uso' :
field.name === 'nombre_fertilizante' ? 'tour-campo-nombre-fertilizante' :
field.name === 'tipo_fertilizante' ? 'tour-campo-tipo-fertilizante' :
field.name === 'nombre_tratamiento' ? 'tour-campo-nombre-tratamiento' :
field.name === 'categoria' ? 'tour-campo-categoria' :
field.name === 'nutrientes_principales' ? 'tour-campo-nutrientes' :
field.name === 'metodo_aplicacion' ? 'tour-campo-metodo' :
field.name === 'frecuencia' ? 'tour-campo-frecuencia' :
field.name === 'descripcion' ? 'tour-campo-descripcion' :
field.name === 'nombre_estado' ? 'tour-campo-nombre-estado' :
field.name === 'orden_ciclo' ? 'tour-campo-orden-ciclo' :
field.name === 'es_productivo' ? 'tour-campo-productivo' :
field.name === 'nombre_plaga' ? 'tour-campo-nombre-plaga' :
field.name === 'tipo_plaga' ? 'tour-campo-tipo-plaga' :
field.name === 'nivel_riesgo' ? 'tour-campo-riesgo' :
field.name === 'nombre_finca' ? 'tour-campo-nombre-finca' :
field.name === 'ubicacion' ? 'tour-campo-ubicacion' :
field.name === 'propietario' ? 'tour-campo-propietario' :
field.name === 'telefono_contacto' ? 'tour-campo-telefono' :
field.name === 'id_finca' ? 'tour-campo-finca-sector' :
field.name === 'nombre_sector' ? 'tour-campo-sector' :
field.name === 'area_hectareas' ? 'tour-campo-area' :
field.name === 'numero_surcos' ? 'tour-campo-surcos' :
field.name === 'posiciones_por_surco' ? 'tour-campo-pos-surco' :
field.name === 'tipo_cultivo' ? 'tour-campo-tipo-cultivo' :
field.name === 'id_sector' ? (
  isMovimientoInventario ? 'tour-campo-sector-movimiento' :
  isResiembra ? 'tour-campo-sector-resiembra' :
  'tour-campo-sector-arbol'
) :
field.name === 'id_tipo_variedad_arbol' ? 'tour-campo-variedad-arbol' :
field.name === 'id_estado' ? 'tour-campo-estado-arbol' :
field.name === 'numero_surco' ? 'tour-campo-surco-arbol' :
field.name === 'posicion_x' ? 'tour-campo-posicion-arbol' :
field.name === 'id_arbol_nuevo' ? 'tour-campo-arbol-resiembra' :
field.name === 'id_plaga' ? 'tour-campo-plaga-regplaga' :
field.name === 'fecha_deteccion' ? 'tour-campo-deteccion' :
field.name === 'fecha_resolucion' ? 'tour-campo-resolucion' :
field.name === 'observaciones' ? 'tour-campo-observaciones' :
field.name === 'id_tipo_tratamiento' ? 'tour-campo-tratamiento-regtrat' :
field.name === 'id_fertilizante' ? 'tour-campo-fertilizante-regtrat' :
field.name === 'fecha_aplicacion' ? 'tour-campo-fecha-aplicacion' :
field.name === 'fecha_resiembra' ? 'tour-campo-fecha-resiembra' :
field.name === 'motivo' ? 'tour-campo-motivo' :
field.name === 'id_finca_filtro' ? (
  isMovimientoInventario ? 'tour-campo-finca-movimiento' :
  isResiembra ? 'tour-campo-finca-resiembra' :
  isRegistroTratamiento ? 'tour-campo-finca-regtrat' :
  isRegistroPlaga ? 'tour-campo-finca-regplaga' :
  isHistorialEstado ? 'tour-campo-finca-historial' :
  'tour-campo-finca-arbol'
) :
field.name === 'id_sector_filtro' ? (
  isMovimientoInventario ? 'tour-campo-sector-movimiento' :
  isResiembra ? 'tour-campo-sector-resiembra' :
  isRegistroTratamiento ? 'tour-campo-sector-regtrat' :
  isRegistroPlaga ? 'tour-campo-sector-regplaga' :
  'tour-campo-sector-historial'
) :
field.name === 'id_arbol' ? (
  isMovimientoInventario ? 'tour-campo-arbol-movimiento' :
  isRegistroTratamiento ? 'tour-campo-arbol-regtrat' :
  isRegistroPlaga ? 'tour-campo-arbol-regplaga' :
  'tour-campo-arbol-historial'
) :
field.name === 'id_tipo_movimiento' ? 'tour-campo-tipo-movimiento' :
field.name === 'fecha_movimiento' ? 'tour-campo-fecha-movimiento' :
''
}`}
              >
                <label className={s.label}>
                  <span>{field.label}</span>
                  {field.required && <span className={s.req}>*</span>}
                </label>

                {field.type === 'select' ? (
                  <select
                    value={form[field.name]}
                    onChange={e => set(field.name, e.target.value)}
                    className={s.input}
                  >
                    <option value="">Selecciona...</option>
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'remote-select' ? (
                  <select
                    value={form[field.name] === null ? '' : String(form[field.name] ?? '')}
                    onChange={e => set(field.name, e.target.value)}
                    className={s.input}
                    disabled={
                      loadingOptions[field.name] ||
                      (field.dependsOn?.field && !form[field.dependsOn.field])
                    }
                  >
                    <option value="">{getRemotePlaceholder(field)}</option>
                    {getDependentOptions(field).map(option => (
                      <option key={`${field.name}-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={form[field.name]}
                    onChange={e => set(field.name, e.target.value)}
                    className={`${s.input} ${s.textarea}`}
                    rows={4}
                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  />
                ) : field.type === 'date' ? (
                  <DatePickerField
                    value={form[field.name]}
                    onChange={val => set(field.name, val)}
                    placeholder="dd/mm/aaaa"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={form[field.name]}
                    onChange={e => set(field.name, e.target.value)}
                    className={`${s.input} ${
                      (field.name === 'posicion_x' || field.name === 'posicion_y') && posConflict
                        ? s.inputError : ''}`}
                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                    min={field.type === 'number' ? 1 : undefined}
                  />
                )}

                {/* Hint text */}
                {field.hint && (
                  <span className={s.hint}>{field.hint}</span>
                )}

                {/* Indicador de colisión en campos X/Y */}
                {(field.name === 'posicion_x' || field.name === 'posicion_y') && (
                  checkingPos ? (
                    <span className={s.posChecking}>
                      <span className={s.spinnerSm} /> Verificando posición…
                    </span>
                  ) : posConflict ? (
                    <span className={s.posConflict}>
                      <span className="material-icons" style={{fontSize:'14px',verticalAlign:'middle'}}>warning</span>
                      {' '}¡Posición ocupada! Ya hay un árbol en X={form['posicion_x']} Y={form['posicion_y']} en este sector.
                    </span>
                  ) : (form['posicion_x'] !== '' && form['posicion_y'] !== '' &&
                       form['posicion_x'] !== null && form['posicion_y'] !== null &&
                       form['id_sector']) ? (
                    <span className={s.posOk}>
                      <span className="material-icons" style={{fontSize:'14px',verticalAlign:'middle'}}>check_circle</span>
                      {' '}Posición disponible
                    </span>
                  ) : null
                )}
              </div>
            ))}
          </form>
        </div>

        <div className={s.footer}>
          <div className={s.footerInfo}>
            {error ? (
              <p className={s.error}>
                <span className="material-icons">error_outline</span>
                <span>{error}</span>
              </p>
            ) : (
              <p className={s.helperText}>
                Los campos marcados con <span>*</span> son obligatorios.
              </p>
            )}
          </div>

          <div className={s.ftBtns}>
            <button type="button" className={s.btnCancel} onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" form="crudForm" className={`${s.btnSave} tour-guardar`} disabled={saving}>
              {saving ? (
                <>
                  <span className={s.spinner} />
                  Guardando...
                </>
              ) : isEdit ? (
                'Guardar cambios'
              ) : (
                'Crear registro'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}