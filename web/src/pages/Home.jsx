import { Link } from 'react-router-dom';

import { audiences, company, faq, hero, seoText, services, steps } from '../content.js';
import Icon from '../components/Icon.jsx';
import HeroIllustration from '../components/HeroIllustration.jsx';
import { EstimateSection, Packages, SectionTitle } from '../components/Sections.jsx';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="eyebrow"><span className="pulse" />Работаем без выходных</span>
            <h1>{hero.title}</h1>
            <p className="hero__subtitle">{hero.subtitle}</p>
            <ul className="hero__bullets">
              {hero.bullets.map((bullet) => <li key={bullet}><Icon name="check" />{bullet}</li>)}
            </ul>
            <div className="hero__actions">
              <a href={company.phoneHref} className="btn btn--primary btn--lg">Вызвать электрика</a>
              <a href={company.phoneHref} className="btn btn--outline-light btn--lg">{company.phone}</a>
            </div>
          </div>
          <div className="hero__visual">
            <HeroIllustration />
            <div className="hero__card">
              <span className="hero__card-label">Выезд мастера</span>
              <strong>{company.callOutPrice}</strong>
              <span>{company.hours}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Услуги" title={`Полный комплекс электромонтажных услуг в ${company.area}`} />
          <div className="cards cards--3">
            {services.map((service, index) => (
              <Link key={service.title} to="/services" className="card card--link card--service">
                <span className="card__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="card__icon"><Icon name={service.icon} /></span>
                <h3>{service.title}</h3>
                <p>{service.short}</p>
                <span className="card__more">Подробнее →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <SectionTitle eyebrow="Цены" title="Комплексные работы"
            subtitle="Окончательную стоимость называю после осмотра — она не меняется в процессе." />
          <Packages />
        </div>
      </section>

      <EstimateSection />

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Процесс" title="Как я работаю" />
          <ol className="steps">
            {steps.map((step, index) => (
              <li key={step.title} className="step">
                <span className="step__num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <SectionTitle eyebrow="Клиенты" title="С кем я работаю" />
          <div className="cards cards--2">
            {audiences.map((audience, index) => (
              <div key={audience.title} className="card card--row">
                <span className="card__icon"><Icon name={index === 0 ? 'user' : 'building'} /></span>
                <div>
                  <h3>{audience.title}</h3>
                  <p>{audience.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container faq">
          <SectionTitle eyebrow="Вопросы" title="Частые вопросы" />
          {faq.map((item) => (
            <details key={item.question} className="faq__item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container prose prose--card">
          <h2>Электрик в {company.area}</h2>
          {seoText.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
    </>
  );
}
