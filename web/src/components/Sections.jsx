import { Link } from 'react-router-dom';

import { company, packages } from '../content.js';
import Icon from './Icon.jsx';

export function PageHero({ title, subtitle }) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="crumbs" aria-label="Навигация"><Link to="/">Главная</Link><span>/</span>{title}</nav>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

export function EstimateSection() {
  return (
    <section className="section estimate" id="estimate">
      <div className="container estimate__grid">
        <div>
          <span className="eyebrow">Бесплатно</span>
          <h2>Расчёт сметы по телефону</h2>
          <p>Позвоните мне — уточню задачу и сразу назову примерную стоимость.</p>
          <ul className="estimate__perks">
            <li><Icon name="check" />Консультация бесплатно</li>
            <li><Icon name="check" />Цена фиксируется в договоре</li>
            <li><Icon name="check" />Без предоплаты</li>
          </ul>
        </div>
        <div className="estimate__call">
          <span className="estimate__call-label">Звоните</span>
          <a className="estimate__phone" href={company.phoneHref}><Icon name="phone" />{company.phone}</a>
          <span className="muted">{company.hours}</span>
          <a className="btn btn--accent btn--lg" href={company.phoneHref}>Позвонить</a>
        </div>
      </div>
    </section>
  );
}

export function Packages() {
  return (
    <div className="packages">
      {packages.map((item) => (
        <article key={item.title} className={`package ${item.featured ? 'package--featured' : ''}`}>
          {item.featured && <span className="package__badge">Популярно</span>}
          <h3 className="package__title">{item.title}</h3>
          <div className="package__price">{item.price}</div>
          <ul className="checklist">
            {item.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}
          </ul>
          <a href={company.phoneHref} className={`btn ${item.featured ? 'btn--accent' : 'btn--primary'}`}>Заказать</a>
        </article>
      ))}
    </div>
  );
}

export function CallPanel({ title, text }) {
  return (
    <div className="panel call-panel">
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      <a className="call-panel__phone" href={company.phoneHref}><Icon name="phone" />{company.phone}</a>
      <span className="muted">{company.hours}</span>
      <a className="btn btn--accent btn--lg" href={company.phoneHref}>Позвонить</a>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      {eyebrow && <span className="eyebrow eyebrow--dark">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function CallOut() {
  return (
    <section className="callout">
      <div className="container callout__inner">
        <div>
          <h2>Доверьте электрику профессионалу</h2>
          <p>Ошибки в проводке опасны. Сделаю быстро, по нормам и с гарантией.</p>
        </div>
        <div className="callout__actions">
          <a className="btn btn--accent" href={company.phoneHref}>Позвонить</a>
          <Link className="btn btn--outline-light" to="/prices">Смотреть цены</Link>
        </div>
      </div>
    </section>
  );
}
