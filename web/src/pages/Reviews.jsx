import { company } from '../content.js';
import LeadForm from '../components/LeadForm.jsx';
import { PageHero } from '../components/Sections.jsx';

// Published reviews: add real reviews of your clients here.
const reviews = [];

const fields = [
  { name: 'name', label: 'Имя', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'message', label: 'Отзыв', type: 'textarea', required: true },
];

export default function Reviews() {
  return (
    <>
      <PageHero title={`Отзывы о «${company.name}»`} />

      <section className="section">
        <div className="container reviews">
          <div className="reviews__list">
            {reviews.length === 0
              ? <p className="empty">Отзывов пока нет. Будем рады, если вы станете первым!</p>
              : reviews.map((review) => (
                <article key={review.name + review.date} className="review">
                  <header><strong>{review.name}</strong><span>{review.date}</span></header>
                  <p>{review.text}</p>
                </article>
              ))}
          </div>

          <div className="panel">
            <h2>Добавить отзыв</h2>
            <p className="muted">Отзыв появится на сайте после проверки.</p>
            <LeadForm type="review" fields={fields} submitLabel="Отправить отзыв"
              successText="Спасибо за отзыв! Он появится на сайте после проверки." />
          </div>
        </div>
      </section>
    </>
  );
}
