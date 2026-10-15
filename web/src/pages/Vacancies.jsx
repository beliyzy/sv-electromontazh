import { company, vacancy } from '../content.js';
import Icon from '../components/Icon.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { PageHero } from '../components/Sections.jsx';

const fields = [
  { name: 'name', label: 'Имя', required: true, autoComplete: 'given-name' },
  { name: 'lastName', label: 'Фамилия', required: true, autoComplete: 'family-name' },
  { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'birthDate', label: 'Дата рождения', placeholder: 'дд.мм.гггг' },
  { name: 'maritalStatus', label: 'Семейное положение' },
  { name: 'education', label: 'Образование', wide: true },
  { name: 'lastJob', label: 'Последнее место работы', type: 'textarea' },
];

export default function Vacancies() {
  return (
    <>
      <PageHero title={`${vacancy.title} в ${company.city}`} subtitle="Вакансии" />

      <section className="section">
        <div className="container reviews">
          <div className="prose">
            <p>{vacancy.text}</p>
            <h3>Что мы ждём</h3>
            <ul className="checklist">
              {vacancy.requirements.map((item) => <li key={item}><Icon name="check" />{item}</li>)}
            </ul>
          </div>

          <div className="panel">
            <h2>Откликнуться</h2>
            <LeadForm type="vacancy" fields={fields} submitLabel="Отправить анкету"
              successText="Анкета отправлена. Мы свяжемся с вами, если ваш опыт нам подходит." />
          </div>
        </div>
      </section>
    </>
  );
}
