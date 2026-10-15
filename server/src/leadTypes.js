// Forms of the site. Every submitted form becomes a lead of its type; common fields are stored in their own columns
// (searchable, shown in the list), the rest go to `details`.

const PHONE = /^[+\d][\d\s()-]{5,24}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const STATUSES = ['new', 'in_progress', 'done', 'rejected'];

export const LEAD_TYPES = {
  estimate: {
    title: 'Расчёт сметы',
    fields: {
      name: { label: 'Имя', required: true, max: 100 },
      phone: { label: 'Телефон', required: true, pattern: PHONE },
    },
  },
  contact: {
    title: 'Обратная связь',
    fields: {
      name: { label: 'Имя', required: true, max: 100 },
      phone: { label: 'Телефон', required: true, pattern: PHONE },
      email: { label: 'Email', pattern: EMAIL, max: 200 },
      message: { label: 'Сообщение', max: 3000 },
    },
  },
  review: {
    title: 'Отзыв',
    fields: {
      name: { label: 'Имя', required: true, max: 100 },
      email: { label: 'Email', required: true, pattern: EMAIL, max: 200 },
      message: { label: 'Отзыв', required: true, max: 3000 },
    },
  },
  vacancy: {
    title: 'Отклик на вакансию',
    fields: {
      name: { label: 'Имя', required: true, max: 100 },
      lastName: { label: 'Фамилия', required: true, max: 100 },
      phone: { label: 'Телефон', required: true, pattern: PHONE },
      email: { label: 'Email', pattern: EMAIL, max: 200 },
      birthDate: { label: 'Дата рождения', max: 20 },
      maritalStatus: { label: 'Семейное положение', max: 100 },
      education: { label: 'Образование', max: 300 },
      lastJob: { label: 'Последнее место работы', max: 1000 },
    },
  },
};

const COLUMNS = ['name', 'phone', 'email', 'message'];

/** Returns { lead } with normalized values or { errors } keyed by field. */
export function validateLead(type, body) {
  const spec = LEAD_TYPES[type];

  if (!spec) {
    return { errors: { type: 'Неизвестный тип заявки' } };
  }

  const errors = {};
  const values = {};

  for (const [field, rule] of Object.entries(spec.fields)) {
    const raw = body?.[field];
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (!value) {
      if (rule.required) {
        errors[field] = 'Обязательное поле';
      }
      continue;
    }

    if (rule.max && value.length > rule.max) {
      errors[field] = `Не больше ${rule.max} символов`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = 'Неверный формат';
    } else {
      values[field] = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const lead = { type, details: {} };

  for (const [field, value] of Object.entries(values)) {
    if (COLUMNS.includes(field)) {
      lead[field] = value;
    } else {
      lead.details[field] = value;
    }
  }

  return { lead };
}
