import { useEffect, useMemo, useState } from 'react';
import DatePickerField from './DatePickerField';
import s from './CrudFormNuevo.module.css';

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

  const [posConflict, setPosConflict] = useState(false);
  const [checkingPos, setCheckingPos] = useState(false);

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

    if (key === 'posicion_y' || key === 'POSICION_Y') {
      return `Posición ${rawValue}`;
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

  const isArbolesEndpoint = endpoint === '/arbol';


  const sector = form['id_sector'];
const surco = form['numero_surco'];
const posicionY = form['posicion_y'];

  // Validar colisión por Sector + Surco + Posición Y
  useEffect(() => {
    if (!isArbolesEndpoint) return;

    const py = posicionY;

    if (
      !sector ||
      surco === '' ||
      py === '' ||
      surco === null ||
      py === null
    ) {
      setPosConflict(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      setCheckingPos(true);

      try {
        const res = await apiFetch(`${API}/arbol`);
        const json = await res.json();

        const rows = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.rows)
            ? json.rows
            : [];

        const conflict = rows.some(r => {
          const sameSector =
            String(r.ID_SECTOR ?? r.id_sector) === String(sector);

          const sameSurco =
            Number(r.NUMERO_SURCO ?? r.numero_surco) === Number(surco);

          const samePosY =
            Number(r.POSICION_Y ?? r.posicion_y) === Number(py);

          const sameId =
            String(r.ID_ARBOL ?? r.id_arbol) === String(editId);

          if (isEdit) {
            return sameSector && sameSurco && samePosY && !sameId;
          }

          return sameSector && sameSurco && samePosY;
        });

        if (!cancelled) {
          setPosConflict(conflict);
        }
      } catch {
        if (!cancelled) {
          setPosConflict(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingPos(false);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [
  sector,
  surco,
  posicionY,
  isArbolesEndpoint,
  isEdit,
  editId,
]);

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

    if (isArbolesEndpoint && posConflict) {
      setError('Ya existe un árbol en ese sector, surco y posición. Elige una posición diferente.');
      return;
    }

    setError('');
    setSaving(true);

    const body = {};
    fields.forEach(field => {
      if (field.omitOnSubmit) return;
      body[field.name] = normalizeValueForSubmit(field);
    });

    try {
      const url = isEdit ? `${API}${endpoint}/${editId}` : `${API}${endpoint}`;
      const method = isEdit ? 'PUT' : 'POST';

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

        if (endpoint === '/arbol') {
          window.dispatchEvent(new Event('arbol_actualizado'));
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

  const shouldShowPositionStatus = fieldName =>
    isArbolesEndpoint &&
    (fieldName === 'numero_surco' || fieldName === 'posicion_y');

  const hasPositionData =
    form['id_sector'] &&
    form['numero_surco'] !== '' &&
    form['numero_surco'] !== null &&
    form['posicion_y'] !== '' &&
    form['posicion_y'] !== null;

  return (
    <div
      className={s.overlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
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
                className={`${s.fieldWrap} ${field.type === 'textarea' ? s.fieldFull : ''}`}
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
                      shouldShowPositionStatus(field.name) && posConflict
                        ? s.inputError
                        : ''
                    }`}
                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                    min={field.type === 'number' ? 1 : undefined}
                  />
                )}

                {field.hint && (
                  <span className={s.hint}>{field.hint}</span>
                )}

                {shouldShowPositionStatus(field.name) && field.name === 'posicion_y' && (
                  checkingPos ? (
                    <span className={s.posChecking}>
                      <span className={s.spinnerSm} /> Verificando posición…
                    </span>
                  ) : posConflict ? (
                    <span className={s.posConflict}>
                      <span
                        className="material-icons"
                        style={{ fontSize: '14px', verticalAlign: 'middle' }}
                      >
                        warning
                      </span>
                      {' '}
                      ¡Posición ocupada! Ya existe un árbol en el surco {form['numero_surco']} y posición {form['posicion_y']}.
                    </span>
                  ) : hasPositionData ? (
                    <span className={s.posOk}>
                      <span
                        className="material-icons"
                        style={{ fontSize: '14px', verticalAlign: 'middle' }}
                      >
                        check_circle
                      </span>
                      {' '}
                      Posición disponible
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
              <span className={s.iconCircle}>
                <span className="material-icons">close</span>
              </span>
              Cancelar
            </button>

            <button type="submit" form="crudForm" className={s.btnSave} disabled={saving}>
              {saving ? (
                <>
                  <span className={s.spinner} />
                  Guardando...
                </>
              ) : isEdit ? (
                <>
                  <span className={s.iconCircle}>
                    <span className="material-icons">save</span>
                  </span>
                  Guardar cambios
                </>
              ) : (
                <>
                  <span className={s.iconCircle}>
                    <span className="material-icons">add</span>
                  </span>
                  Crear registro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}