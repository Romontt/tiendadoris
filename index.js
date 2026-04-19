const { useState, useEffect } = React;

function App() {
    const [productos, setProductos] = useState([]);
    const [categoria, setCategoria] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const SUPABASE_URL = 'https://hvnpkljyoocqdzwdptgt.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    useEffect(() => {
        fetchData();
    }, [categoria]);

    async function fetchData() {
        setLoading(true);
        try {
            let q = _supabase.from('productos').select('*').eq('disponible', true);
            if (categoria !== 'Todos') q = q.eq('categoria', categoria);
            
            const { data, error } = await q.order('created_at', { ascending: false });
            if (error) throw error;
            setProductos(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-container">
            {/* Barra de Navegación con Sombra sutil */}
            <nav className="nav-container">
                <div className="nav-content">
                    <a href="#" className="logo">DORIS</a>
                    <div className="nav-links">
                        {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(cat => (
                            <button 
                                key={cat} 
                                className={`filter-btn ${categoria === cat ? 'active' : ''}`}
                                onClick={() => setCategoria(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Banner Principal con Overlay */}
            <header className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-text">
                        <span className="badge">CURADURÍA AMERICANA</span>
                        <h1>La Tiendita de Doris</h1>
                        <p>Moda con historia, seleccionada para ti.</p>
                    </div>
                </div>
            </header>

            <main className="main-content">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Cargando tesoros...</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {productos.map((p) => (
                            <article key={p.id} className="product-card">
                                <div className="card-image">
                                    <img src={p.imagen_url} alt={p.nombre} loading="lazy" />
                                    <div className="card-tag">{p.categoria}</div>
                                </div>
                                <div className="card-info">
                                    <div className="info-header">
                                        <h3>{p.nombre}</h3>
                                        <span className="price">₡{p.precio.toLocaleString()}</span>
                                    </div>
                                    <p className="description">Pieza única seleccionada a mano</p>
                                    <button className="view-btn">Ver Detalles</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-logo">DORIS</div>
                    <p>© 2026 Guápiles, Limón. Costa Rica</p>
                </div>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
