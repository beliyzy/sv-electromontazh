import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Prices from './pages/Prices.jsx';
import Services from './pages/Services.jsx';
import Photo from './pages/Photo.jsx';
import About from './pages/About.jsx';
import Reviews from './pages/Reviews.jsx';
import Vacancies from './pages/Vacancies.jsx';
import Contacts from './pages/Contacts.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prices" element={<Prices />} />
        <Route path="services" element={<Services />} />
        <Route path="photo" element={<Photo />} />
        <Route path="about" element={<About />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="vacancies" element={<Vacancies />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
