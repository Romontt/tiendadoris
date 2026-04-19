// Sacamos las funciones que ocupamos de las librerías globales
const { useState, useEffect } = React;

// CONFIGURA TU SUPABASE AQUÍ
const _supabase = supabase.createClient(
  'TU_URL_DE_SUPABASE', 
  'TU_API_KEY_ANONIMA'
);

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
      let query = _supabase.from('productos').select('*').eq('disponible', true);
      if (categoria !== 'Todos') query = query.eq('categoria', categoria);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="boutique-wrapper">
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
        {cargando ? (
          <div className="loader">Buscando en el archivo...</div>
        ) : (
          <div className="product-grid">
            {productos.map((p, index) => (
              <article 
                key={p.id} 
                className="product-card" 
                style={{ marginTop: index % 2 !== 0 ? '60px' : '0' }}
              >
                <div className="image-wrapper">
                  <img src={p.imagen_url} alt={p.nombre} />
                  <span className="card-badge">{p.categoria}</span>
                </div>
                <div className="card-info">
                  <h3>{p.nombre}</h3>
                  <p className="price">₡{p.precio.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Renderizado final para navegador
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
