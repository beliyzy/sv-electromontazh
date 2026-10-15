import { Link } from 'react-router-dom';

import { PageHero } from '../components/Sections.jsx';

export default function NotFound() {
  return (
    <>
      <PageHero title="Страница не найдена" />
      <section className="section">
        <div className="container center"><Link to="/" className="btn btn--primary">На главную</Link></div>
      </section>
    </>
  );
}
