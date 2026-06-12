import { useState } from 'react';
import '../App.css';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Home from '../pages/Home';

export default function SiteApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('cassino');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSelect = (id) => {
    setActive(id);
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <Header
        onMenu={() => setMenuOpen(true)}
        loggedIn={loggedIn}
        balance={150.0}
        onToggleAuth={() => setLoggedIn((v) => !v)}
      />
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={active}
        onSelect={handleSelect}
      />
      <main className="app-main">
        <div className="app-content">
          <Home />
        </div>
      </main>
      <BottomNav
        onMenu={() => setMenuOpen(true)}
        active={active}
        onSelect={handleSelect}
      />
    </div>
  );
}
