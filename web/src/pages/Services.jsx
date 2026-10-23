import { Link } from 'react-router-dom';

import { company, lightingService, services } from '../content.js';
import Icon from '../components/Icon.jsx';
import { CallOut, EstimateSection, PageHero } from '../components/Sections.jsx';

export default function Services() {
  const items = [...services.filter((service) => service.icon !== 'chat'), { icon: 'bolt', ...lightingService }];

  return (
    <>
      <PageHero title={`Услуги электрика в ${company.area}`} subtitle={`Выезд мастера — ${company.callOutPrice}.`} />

      {items.map((service, index) => (
        <section key={service.title} className={`section ${index % 2 ? 'section--tinted' : ''}`}>
          <div className={`container split ${index % 2 ? 'split--reverse' : ''}`}>
            <div className="placeholder-img" role="img" aria-label="Место для фото">
              <Icon name={service.icon} />
            </div>
            <div>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
              <div className="split__actions">
                <a href="#estimate" className="btn btn--primary">Заказать</a>
                <Link to="/prices" className="btn btn--ghost">Цены</Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CallOut />
      <EstimateSection />
    </>
  );
}
