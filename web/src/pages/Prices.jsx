import { company, priceList } from '../content.js';
import { EstimateSection, Packages, PageHero, SectionTitle } from '../components/Sections.jsx';

export default function Prices() {
  return (
    <>
      <PageHero title={`Цены на услуги электрика в ${company.area}`}
        subtitle={`Комплексные работы и прайс на отдельные услуги. Выезд мастера — ${company.callOutPrice}.`} />

      <section className="section">
        <div className="container">
          <Packages />
        </div>
      </section>

      <EstimateSection />

      <section className="section">
        <div className="container">
          <SectionTitle title="Цены на электромонтажные работы" subtitle={`Выезд мастера — ${company.callOutPrice}.`} />
          <div className="price-groups">
            {priceList.map((group) => (
              <div key={group.group} className="price-group">
                <h3>{group.group}</h3>
                <table className="price-table">
                  <tbody>
                    {group.items.map(([work, price]) => (
                      <tr key={work}><td>{work}</td><td>{price}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
