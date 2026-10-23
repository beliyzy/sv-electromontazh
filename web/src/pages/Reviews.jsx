import { company } from '../content.js';
import { CallPanel, PageHero } from '../components/Sections.jsx';

// Published reviews: add real reviews of your clients here.
const reviews = [];

export default function Reviews() {
  return (
    <>
      <PageHero title={`Отзывы о «${company.name}»`} />

      <section className="section">
        <div className="container reviews">
          <div className="reviews__list">
            {reviews.length === 0
              ? <p className="empty">Отзывов пока нет.</p>
              : reviews.map((review) => (
                <article key={review.name + review.date} className="review">
                  <header><strong>{review.name}</strong><span>{review.date}</span></header>
                  <p>{review.text}</p>
                </article>
              ))}
          </div>

          <CallPanel title="Нужен электрик?" text="Позвоните — приеду в день обращения." />
        </div>
      </section>
    </>
  );
}
