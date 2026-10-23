import { useEffect, useState } from 'react';

import { company } from '../content.js';
import Icon from '../components/Icon.jsx';
import { CallOut, EstimateSection, PageHero } from '../components/Sections.jsx';

// Put your photos to web/public/photos and list them here: { src: '/photos/1.jpg', alt: '...' }.
const photos = Array.from({ length: 12 }, (_, index) => ({ src: null, alt: `Фото работы ${index + 1}` }));

export default function Photo() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <PageHero title={`Фотографии моих работ в ${company.area}`} />

      <section className="section">
        <div className="container gallery">
          {photos.map((photo, index) => (
            <button key={photo.alt} type="button" className="gallery__item" onClick={() => setActive(index)}
              aria-label={`Открыть: ${photo.alt}`}>
              {photo.src ? <img src={photo.src} alt={photo.alt} loading="lazy" /> : <Icon name="photo" />}
            </button>
          ))}
        </div>
      </section>

      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={photos[active].alt}
          onClick={() => setActive(null)}>
          <div className="lightbox__body" onClick={(event) => event.stopPropagation()}>
            {photos[active].src
              ? <img src={photos[active].src} alt={photos[active].alt} />
              : <div className="placeholder-img placeholder-img--large"><Icon name="photo" /></div>}
            <div className="lightbox__nav">
              <button type="button" className="btn btn--ghost"
                onClick={() => setActive((active - 1 + photos.length) % photos.length)}>←</button>
              <span>{active + 1} / {photos.length}</span>
              <button type="button" className="btn btn--ghost"
                onClick={() => setActive((active + 1) % photos.length)}>→</button>
              <button type="button" className="btn btn--ghost" onClick={() => setActive(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <CallOut />
      <EstimateSection />
    </>
  );
}
