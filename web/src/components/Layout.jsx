import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { company, nav } from '../content.js';
import Icon from './Icon.jsx';
import Seo from './Seo.jsx';

function Logo({ light = false }) {
  return (
    <span className={`logo__inner ${light ? 'logo__inner--light' : ''}`}>
      <span className="logo__mark">СВ<Icon name="bolt" /></span>
      <span className="logo__text">
        <strong>{company.name}</strong>
        <small>электромонтажные работы</small>
      </span>
    </span>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <span><Icon name="pin" />{company.address}</span>
        <span><Icon name="clock" />{company.hours}</span>
        <a href={`mailto:${company.email}`}><Icon name="mail" />{company.email}</a>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" aria-label={company.name}>
          <Logo />
        </Link>

        <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Основное меню">
          {nav.filter((item) => item.to !== '/').map((item) => (
            <NavLink key={item.to} to={item.to} className="nav__link">{item.label}</NavLink>
          ))}
        </nav>

        <div className="header__cta">
          <a className="header__phone" href={company.phoneHref}>
            <Icon name="phone" />
            <span>{company.phone}</span>
          </a>
          <a className="btn btn--accent btn--sm header__btn" href={company.phoneHref}>Вызвать электрика</a>
        </div>

        <button
          type="button"
          className={`burger ${open ? 'burger--open' : ''}`}
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__muted">Электромонтажные работы в {company.area}</p>
        </div>

        <nav className="footer__nav" aria-label="Разделы сайта">
          {nav.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>

        <div className="footer__contacts">
          <a href={company.phoneHref} className="footer__phone">{company.phone}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <span className="footer__muted">{company.hours}</span>
        </div>
      </div>
      <div className="container footer__bottom">© {new Date().getFullYear()} {company.name}</div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <Seo />
      <TopBar />
      <Header />
      <main><Outlet /></main>
      <Footer />
      <a className="call-fab" href={company.phoneHref} aria-label="Позвонить"><Icon name="phone" /></a>
    </>
  );
}
