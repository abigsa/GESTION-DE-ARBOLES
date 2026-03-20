import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { resources } from './config/resources';
import Sidebar from './components/Sidebar';
import EntityForm from './components/EntityForm';
import EntityTable from './components/EntityTable';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

function emptyForm(resource) {
  return resource.fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});
}

function normalizeValue(field, value) {
  if (value === '') return null;
  if (field.type === 'number') return Number(value);
  return value;
}

function App() {
  const [activeKey, setActiveKey] = useState(resources[0].key);
  const resource = useMemo(() => resources.find((item) => item.key === activeKey), [activeKey]);
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(emptyForm(resource));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(emptyForm(resource));
    setEditingId(null);
    setMessage('');
    setError('');
    fetchRows();
  }, [resource]);

  async function fetchRows() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}${resource.endpoint}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'No se pudo listar');
      setRows(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const body = resource.fields.reduce((acc, field) => {
      acc[field.name] = normalizeValue(field, formData[field.name]);
      return acc;
    }, {});

    const url = editingId
      ? `${API_BASE}${resource.endpoint}/${editingId}`
      : `${API_BASE}${resource.endpoint}`;

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Operación fallida');
      setMessage(json.message || 'Operación realizada con éxito');
      setFormData(emptyForm(resource));
      setEditingId(null);
      await fetchRows();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(row) {
    const next = emptyForm(resource);
    resource.fields.forEach((field) => {
      const upper = field.name.toUpperCase();
      next[field.name] = row[upper] ?? row[field.name] ?? '';
    });
    setFormData(next);
    setEditingId(row[resource.idField]);
    setMessage('');
    setError('');
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Deseas eliminar este registro?')) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}${resource.endpoint}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'No se pudo eliminar');
      setMessage(json.message || 'Registro eliminado');
      if (editingId === id) {
        setEditingId(null);
        setFormData(emptyForm(resource));
      }
      await fetchRows();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar resources={resources} activeKey={activeKey} onSelect={setActiveKey} />
      <main className="content">
        <header className="hero card">
          <div>
            <span className="eyebrow">Panel administrativo</span>
            <h2>{resource.title}</h2>
            <p>Gestiona registros de forma simple y comparte cambios con tu equipo usando un backend centralizado.</p>
          </div>
          <div className="hero-badge">🌱 Gestión de árboles</div>
        </header>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="grid">
          <EntityForm
            resource={resource}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingId(null);
              setFormData(emptyForm(resource));
            }}
            editing={Boolean(editingId)}
            loading={loading}
          />
          <EntityTable
            rows={rows}
            idField={resource.idField}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
