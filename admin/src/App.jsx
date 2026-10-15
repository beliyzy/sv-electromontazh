import { useCallback, useEffect, useState } from 'react';

import { api, UnauthorizedError } from './api.js';

const STATUS_LABELS = { new: 'Новая', in_progress: 'В работе', done: 'Обработана', rejected: 'Отклонена' };
const PAGE_SIZE = 20;

const formatDate = (iso) => new Date(iso).toLocaleString('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api('/login', { method: 'POST', body: { login, password } });
      onLogin();
    } catch (e) {
      setError(e instanceof UnauthorizedError ? 'Неверный логин или пароль' : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Вход в админку</h1>
        <label>Логин<input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required /></label>
        <label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      </form>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function LeadDetails({ lead, meta, onClose, onSaved, onUnauthorized }) {
  const [status, setStatus] = useState(lead.status);
  const [comment, setComment] = useState(lead.comment);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save() {
    setState('saving');
    setError('');

    try {
      const saved = await api(`/leads/${lead.id}`, { method: 'PATCH', body: { status, comment } });
      onSaved(saved);
      setState('saved');
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        onUnauthorized();
        return;
      }
      setError(e.message);
      setState('idle');
    }
  }

  const labels = meta.types[lead.type]?.fields ?? {};
  const rows = [
    ['name', lead.name], ['phone', lead.phone], ['email', lead.email], ['message', lead.message],
    ...Object.entries(lead.details),
  ].filter(([, value]) => value);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Заявка №${lead.id}`}
        onClick={(event) => event.stopPropagation()}>
        <header className="drawer__header">
          <div>
            <h2>Заявка №{lead.id}</h2>
            <p className="muted">{meta.types[lead.type]?.title} · {formatDate(lead.created_at)}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
        </header>

        <dl className="fields">
          {rows.map(([field, value]) => (
            <div key={field}>
              <dt>{labels[field] ?? field}</dt>
              <dd>
                {field === 'phone' ? <a href={`tel:${value.replace(/[^\d+]/g, '')}`}>{value}</a>
                  : field === 'email' ? <a href={`mailto:${value}`}>{value}</a>
                    : value}
              </dd>
            </div>
          ))}
          {lead.page && <div><dt>Страница</dt><dd>{lead.page}</dd></div>}
        </dl>

        <div className="drawer__form">
          <label>Статус
            <select value={status} onChange={(e) => { setStatus(e.target.value); setState('idle'); }}>
              {meta.statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </label>
          <label>Комментарий
            <textarea rows={4} value={comment} maxLength={3000}
              onChange={(e) => { setComment(e.target.value); setState('idle'); }} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="drawer__actions">
            <button type="button" className="btn btn--primary" onClick={save} disabled={state === 'saving'}>
              {state === 'saving' ? 'Сохраняем…' : 'Сохранить'}
            </button>
            {state === 'saved' && <span className="saved">Сохранено</span>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Leads({ admin, onLogout, onUnauthorized }) {
  const [meta, setMeta] = useState(null);
  const [filter, setFilter] = useState({ type: '', status: '', q: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const guard = useCallback(async (call) => {
    try {
      return await call();
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        onUnauthorized();
      } else {
        setError(e.message);
      }
      return null;
    }
  }, [onUnauthorized]);

  const query = new URLSearchParams(Object.entries(filter).filter(([, v]) => v)).toString();

  const loadMeta = useCallback(() => guard(() => api('/meta')).then((m) => m && setMeta(m)), [guard]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await guard(() => api(`/leads?${query}&page=${page}&pageSize=${PAGE_SIZE}`));
    if (result) {
      setData(result);
    }
    setLoading(false);
  }, [guard, query, page]);

  useEffect(() => { loadMeta(); }, [loadMeta]);
  useEffect(() => { loadLeads(); }, [loadLeads]);

  // Debounced search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((f) => (f.q === search.trim() ? f : { ...f, q: search.trim() }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const setFilterValue = (key, value) => {
    setFilter((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const onSaved = (lead) => {
    setSelected(lead);
    setData((d) => ({ ...d, items: d.items.map((item) => (item.id === lead.id ? lead : item)) }));
    loadMeta();
  };

  if (!meta) {
    return <div className="loading">{error || 'Загрузка…'}</div>;
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const totalNew = Object.values(meta.newByType).reduce((sum, n) => sum + n, 0);

  return (
    <div className="app">
      <header className="topbar">
        <strong className="topbar__title">Заявки с сайта</strong>
        <div className="topbar__right">
          <span className="muted">{admin}</span>
          <button type="button" className="btn btn--ghost" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      <main className="content">
        <nav className="tabs" aria-label="Тип заявки">
          {[['', 'Все', totalNew], ...Object.entries(meta.types).map(([type, spec]) => [type, spec.title,
            meta.newByType[type] ?? 0])].map(([type, title, count]) => (
            <button key={type || 'all'} type="button" className={`tab ${filter.type === type ? 'tab--active' : ''}`}
              onClick={() => setFilterValue('type', type)}>
              {title}{count > 0 && <span className="tab__count" title="Новых">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="toolbar">
          <input type="search" placeholder="Поиск: имя, телефон, email, текст" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Поиск" />
          <select value={filter.status} onChange={(e) => setFilterValue('status', e.target.value)} aria-label="Статус">
            <option value="">Все статусы</option>
            {meta.statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <a className="btn btn--ghost" href={`/api/admin/leads.csv?${query}`} download>Экспорт CSV</a>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>№</th><th>Дата</th><th>Тип</th><th>Имя</th><th>Контакт</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {data.items.map((lead) => (
                <tr key={lead.id} className={lead.status === 'new' ? 'row--new' : ''} onClick={() => setSelected(lead)}
                  tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelected(lead)}>
                  <td>{lead.id}</td>
                  <td className="nowrap">{formatDate(lead.created_at)}</td>
                  <td>{meta.types[lead.type]?.title ?? lead.type}</td>
                  <td>{[lead.name, lead.details.lastName].filter(Boolean).join(' ')}</td>
                  <td>{lead.phone || lead.email}</td>
                  <td><StatusBadge status={lead.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.items.length === 0 && <p className="empty">Заявок не найдено</p>}
        </div>

        <div className="pager">
          <span className="muted">Всего: {data.total}</span>
          <div>
            <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
            <span className="pager__page">{page} / {pages}</span>
            <button type="button" className="btn btn--ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>→</button>
          </div>
        </div>
      </main>

      {selected && (
        <LeadDetails key={selected.id} lead={selected} meta={meta} onClose={() => setSelected(null)} onSaved={onSaved}
          onUnauthorized={onUnauthorized} />
      )}
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(undefined); // undefined: checking, null: logged out

  const check = useCallback(() => {
    api('/me').then((me) => setAdmin(me.login)).catch(() => setAdmin(null));
  }, []);

  useEffect(check, [check]);

  const logout = async () => {
    await api('/logout', { method: 'POST' }).catch(() => {});
    setAdmin(null);
  };

  if (admin === undefined) {
    return <div className="loading">Загрузка…</div>;
  }

  return admin
    ? <Leads admin={admin} onLogout={logout} onUnauthorized={() => setAdmin(null)} />
    : <Login onLogin={check} />;
}
