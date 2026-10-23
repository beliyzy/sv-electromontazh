import { company } from '../content.js';
import Icon from '../components/Icon.jsx';
import { CallPanel, PageHero } from '../components/Sections.jsx';

export default function Contacts() {
  const items = [
    { icon: 'phone', label: 'Телефон', value: <a href={company.phoneHref}>{company.phone}</a> },
    { icon: 'mail', label: 'Email', value: <a href={`mailto:${company.email}`}>{company.email}</a> },
    { icon: 'pin', label: 'Адрес', value: company.address },
    { icon: 'clock', label: 'Время работы', value: company.hours },
  ];

  return (
    <>
      <PageHero title="Контакты" subtitle={`Электрик в ${company.area}: ${company.hours.toLowerCase()}`} />

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

          <CallPanel title="Позвоните мне"
            text="Отвечу на вопросы, назову примерную стоимость и договоримся о времени выезда." />
        </div>
      </section>
    </>
  );
}
