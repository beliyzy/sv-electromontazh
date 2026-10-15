import { useId, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DEMO, submitLead } from '../../../shared/demoStore.js';

/**
 * A site form that sends a lead of `type` to the server. `fields` describes the inputs:
 * { name, label, type?: 'text' | 'tel' | 'email' | 'textarea', required?, placeholder? }.
 */
export default function LeadForm({ type, fields, submitLabel = 'Отправить', successText, dark = false }) {
  const id = useId();
  const { pathname } = useLocation();
  const [values, setValues] = useState({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed

  const set = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const local = {};

    for (const field of fields) {
      if (field.required && !values[field.name]?.trim()) {
        local[field.name] = 'Обязательное поле';
      }
    }

    if (!consent) {
      local.consent = 'Нужно согласие на обработку данных';
    }

    setErrors(local);

    if (Object.keys(local).length > 0) {
      return;
    }

    setState('sending');

    if (DEMO) {
      try {
        submitLead({ ...values, type, consent, page: pathname, website: form.elements.website.value });
        setState('sent');
        setValues({});
        setConsent(false);
      } catch (e) {
        setErrors(e.body?.errors ?? {});
        setState(e.body?.errors ? 'idle' : 'failed');
      }
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values, type, consent, page: pathname, website: form.elements.website.value,
        }),
      });

      if (response.status === 400) {
        setErrors((await response.json()).errors ?? {});
        setState('idle');
        return;
      }

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      setState('sent');
      setValues({});
      setConsent(false);
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <div className={`form-success ${dark ? 'form-success--dark' : ''}`} role="status">
        <strong>Спасибо!</strong>
        <p>{successText ?? 'Заявка отправлена. Мы перезвоним в ближайшее время.'}</p>
        <button type="button" className="btn btn--ghost" onClick={() => setState('idle')}>Отправить ещё</button>
      </div>
    );
  }

  return (
    <form className={`lead-form ${dark ? 'lead-form--dark' : ''}`} onSubmit={onSubmit} noValidate>
      {fields.map((field) => {
        const inputId = `${id}-${field.name}`;
        const common = {
          id: inputId,
          name: field.name,
          value: values[field.name] ?? '',
          onChange: set(field.name),
          placeholder: field.placeholder ?? field.label,
          'aria-invalid': Boolean(errors[field.name]),
          required: field.required,
        };

        return (
          <div key={field.name} className={`field ${field.wide || field.type === 'textarea' ? 'field--wide' : ''}`}>
            <label htmlFor={inputId} className="field__label">
              {field.label}{field.required && <span aria-hidden="true"> *</span>}
            </label>
            {field.type === 'textarea'
              ? <textarea rows={4} {...common} />
              : <input type={field.type ?? 'text'} autoComplete={field.autoComplete} {...common} />}
            {errors[field.name] && <span className="field__error">{errors[field.name]}</span>}
          </div>
        );
      })}

      {/* Honeypot: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

      <label className="consent field--wide">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>Согласен на обработку персональных данных</span>
      </label>
      {errors.consent && <span className="field__error field--wide">{errors.consent}</span>}

      {state === 'failed' && (
        <p className="form-failed field--wide" role="alert">Не удалось отправить. Попробуйте ещё раз или позвоните нам.</p>
      )}

      <button type="submit" className="btn btn--primary field--wide" disabled={state === 'sending'}>
        {state === 'sending' ? 'Отправляем…' : submitLabel}
      </button>
    </form>
  );
}

export const estimateFields = [
  { name: 'name', label: 'Ваше имя', required: true, autoComplete: 'name' },
  { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel', placeholder: '+7 (___) ___-__-__' },
];
