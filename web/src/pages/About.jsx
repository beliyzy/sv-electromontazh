import { about } from '../content.js';
import { CallOut, EstimateSection, PageHero } from '../components/Sections.jsx';

export default function About() {
  return (
    <>
      <PageHero title="Обо мне" />

      <section className="section">
        <div className="container prose">
          {about.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <h2 className="center">В цифрах</h2>
          <div className="stats">
            {about.stats.map((stat) => (
              <div key={stat.label} className="stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CallOut />
      <EstimateSection />
    </>
  );
}
