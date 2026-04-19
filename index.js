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
    let query = supabase.from('productos').select('*').eq('disponible', true);
    if (categoria !== 'Todos') query = query.eq('categoria', categoria);
    
    const { data } = await query.order('created_at', { ascending: false });
    setProductos(data || []);
    setCargando(false);
  }

  return (
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
        <p style={{ letterSpacing: '5px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Curaduría Americana</p>
        <h1>Tesoros con <br/><i>Pasado</i></h1>
      </header>

      <main className="main-content">
        {cargando ? (
          <p style={{ textAlign: 'center', letterSpacing: '3px' }}>BUSCANDO PIEZAS...</p>
        ) : (
          <div className="product-grid">
            {productos.map((p, index) => (
              <div key={p.id} className="card" style={{ marginTop: index % 2 !== 0 ? '50px' : '0' }}>
                <div className="image-container">
                  <img src={p.imagen_url} alt={p.nombre} />
                </div>
                <div className="card-info">
                  <h3>{p.nombre}</h3>
                  <p className="price">₡{p.precio.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
