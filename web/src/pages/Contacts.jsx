import { company } from '../content.js';
import Icon from '../components/Icon.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { PageHero } from '../components/Sections.jsx';

const fields = [
  { name: 'name', label: 'Имя', required: true, autoComplete: 'name' },
  { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', wide: true },
  { name: 'message', label: 'Сообщение', type: 'textarea' },
];

export default function Contacts() {
  const items = [
    { icon: 'phone', label: 'Телефон', value: <a href={company.phoneHref}>{company.phone}</a> },
    { icon: 'mail', label: 'Email', value: <a href={`mailto:${company.email}`}>{company.email}</a> },
    { icon: 'pin', label: 'Адрес', value: company.address },
    { icon: 'clock', label: 'Время работы', value: company.hours },
  ];

  return (
    <>
      <PageHero title="Контакты" subtitle={`Электрик в ${company.city}: ${company.hours.toLowerCase()}`} />

      <section className="section">
        <div className="container reviews">
          <ul className="contact-list">
            {items.map((item) => (
              <li key={item.label}>
                <span className="card__icon"><Icon name={item.icon} /></span>
                <div><span className="muted">{item.label}</span><div>{item.value}</div></div>
              </li>
            ))}
          </ul>

          <div className="panel">
            <h2>Форма обратной связи</h2>
            <LeadForm type="contact" fields={fields} />
          </div>
        </div>
      </section>
    </>
  );
}
