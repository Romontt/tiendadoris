import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';

function App() {
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  const categorias = ['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'];

  useEffect(() => {
    fetchProductos();
  }, [categoria]);

  async function fetchProductos() {
    setCargando(true);
    try {
      let query = supabase.from('productos').select('*').eq('disponible', true);
      
      if (categoria !== 'Todos') {
        query = query.eq('categoria', categoria);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    // IMPORTANTE: Envolvemos todo en un Fragment <> o un div para evitar el error de sintaxis
    <div className="boutique-container">
      <nav className="nav-container">
        <div className="logo">DORIS.</div>
        <div className="nav-menu">
          {categorias.map(cat => (
            <button 
              key={cat} 
              className={`btn-cat ${categoria === cat ? 'active' : ''}`}
              onClick={() => setCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <p className="hero-label">Curaduría Americana</p>
          <h1>Tesoros con <br/><i>Pasado</i></h1>
          <div className="hero-accent"></div>
        </div>
      </header>

      <main className="main-content">
        <div className="section-header">
          <h2 className="category-title">{categoria === 'Todos' ? 'Colección Completa' : categoria}</h2>
          <span className="product-count">{productos.length} piezas únicas</span>
        </div>

        {cargando ? (
          <div className="loader-box">
            <p className="loading-text">BUSCANDO PIEZAS...</p>
          </div>
        ) : (
          <div className="product-grid">
            {productos.map((p, index) => (
              <article 
                key={p.id} 
                className="product-card" 
                style={{ marginTop: index % 2 !== 0 ? '60px' : '0' }}
              >
                <div className="image-wrapper">
                  <div className="image-overlay"></div>
                  <img src={p.imagen_url} alt={p.nombre} loading="lazy" />
                  <span className="card-badge">{p.categoria}</span>
                </div>
                <div className="card-info">
                  <h3 className="product-name">{p.nombre}</h3>
                  <p className="price">₡{p.precio.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer-simple">
        <p>© 2026 La Americana de Doris — Guápiles, Pococí</p>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
