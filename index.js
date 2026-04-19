const { useState, useEffect } = React;

function App() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [cargando, setCargando] = useState(true);

    const categorias = ['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'];

    // IMPORTANTE: Aquí conectas tu tabla de Supabase
    const SUPABASE_URL = 'https://hvnpkljyoocqdzwdptgt.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    useEffect(() => {
        fetchProductos();
    }, [filtro]);

    async function fetchProductos() {
        setCargando(true);
        let query = _supabase.from('productos').select('*').eq('disponible', true);
        
        if (filtro !== 'Todos') {
            query = query.eq('categoria', filtro);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error) setProductos(data);
        setCargando(false);
    }

    return (
        <div>
            <nav className="nav-boutique">
                <div className="logo">DORIS.</div>
                <div className="cart-icon">🛒</div>
            </nav>

            <header className="hero">
                <p style={{letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.7rem'}}>Selección Exclusiva</p>
                <h1>La Tiendita de Doris</h1>
            </header>

            <div className="filter-bar">
                {categorias.map(cat => (
                    <button 
                        key={cat} 
                        className={`filter-btn ${filtro === cat ? 'active' : ''}`}
                        onClick={() => setFiltro(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <main className="product-grid">
                {cargando ? (
                    <p style={{gridColumn: '1/-1', textAlign: 'center'}}>Actualizando escaparate...</p>
                ) : (
                    productos.map((prod, index) => (
                        <div className="card" key={prod.id} style={{marginTop: index % 2 !== 0 ? '40px' : '0'}}>
                            <div className="img-wrapper">
                                <img src={prod.imagen_url} alt={prod.nombre} />
                            </div>
                            <h3>{prod.nombre}</h3>
                            <p className="price">₡{prod.precio.toLocaleString()}</p>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
