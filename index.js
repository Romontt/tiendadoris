const { useState, useEffect } = React;

function App() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            let q = _supabase.from('productos').select('*').eq('disponible', true);
            if (filtro !== 'Todos') q = q.eq('categoria', filtro);
            const { data } = await q.order('created_at', { ascending: false });
            setProductos(data || []);
            setLoading(false);
        };
        fetchItems();
    }, [filtro]);

    return (
        <div>
            <nav className="navbar">
                <div className="logo">DORIS.</div>
                <div style={{fontWeight: '600', fontSize: '0.8rem'}}>COSTA RICA</div>
            </nav>

            <header className="hero-container">
                <div className="hero-card">
                    <p>SELECCIÓN EXCLUSIVA</p>
                    <h1>Moda con <br/>Propósito</h1>
                </div>
                <div style={{padding: '20px'}}>
                    <h2 style={{fontFamily: 'Playfair Display', fontSize: '2.5rem'}}>Tesoros Curados</h2>
                    <p style={{opacity: 0.6}}>Encuentra piezas únicas importadas directamente para tu estilo en Guápiles.</p>
                </div>
            </header>

            <div className="category-scroller">
                {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(cat => (
                    <button 
                        key={cat} 
                        className={`cat-pill ${filtro === cat ? 'active' : ''}`}
                        onClick={() => setFiltro(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <main className="product-grid">
                {loading ? (
                    <p>Actualizando stock...</p>
                ) : productos.length > 0 ? (
                    productos.map(p => (
                        <article key={p.id} className="item-card">
                            <img src={p.imagen_url} className="item-image" alt={p.nombre} />
                            <div className="item-info">
                                <small style={{textTransform: 'uppercase', opacity: 0.5}}>{p.categoria}</small>
                                <h3>{p.nombre}</h3>
                                <span className="item-price">₡{p.precio.toLocaleString()}</span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px'}}>
                        <h3>Próximamente nuevas piezas</h3>
                    </div>
                )}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
