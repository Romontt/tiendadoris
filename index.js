const { useState, useEffect } = React;

function App() {
    const [productos, setProductos] = useState([]);
    const [categoria, setCategoria] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => { fetchData(); }, [categoria]);

    async function fetchData() {
        setLoading(true);
        let q = _supabase.from('productos').select('*').eq('disponible', true);
        if (categoria !== 'Todos') q = q.eq('categoria', categoria);
        const { data } = await q.order('created_at', { ascending: false });
        setProductos(data || []);
        setLoading(false);
    }

    return (
        <div>
            <nav className="nav-container">
                <div className="logo">DORIS</div>
                <div className="cart-dummy" style={{color: 'white', letterSpacing: '2px', fontSize: '0.7rem'}}>COSTA RICA</div>
            </nav>

            <header className="hero">
                <div className="hero-text">
                    <p style={{letterSpacing: '10px', fontSize: '0.7rem', opacity: 0.6}}>BOUTIQUE EXCLUSIVE</p>
                    <h1>Nueva <br/><i>Esencia</i></h1>
                </div>
                <div className="hero-image"></div>
            </header>

            <div className="filter-wrapper">
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

            <main className="main-content">
                {loading ? (
                    <div style={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <p style={{letterSpacing: '15px', fontSize: '0.8rem'}}>REVELANDO...</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {productos.map((p, index) => (
                            <article key={p.id} className="product-card">
                                <div className="image-holder">
                                    <img src={p.imagen_url} alt={p.nombre} />
                                </div>
                                <div className="product-info">
                                    <p style={{fontSize: '0.6rem', letterSpacing: '4px', opacity: 0.5}}>{p.categoria.toUpperCase()}</p>
                                    <h3>{p.nombre}</h3>
                                    <div className="price">₡{p.precio.toLocaleString()}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <footer style={{padding: '100px 5%', background: '#0d211a', color: '#f4f1ea', textAlign: 'center'}}>
                <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '3rem', letterSpacing: '10px'}}>DORIS</h2>
                <p style={{opacity: 0.4, fontSize: '0.7rem', marginTop: '20px'}}>EDICIÓN LIMITADA 2026</p>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
