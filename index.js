const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);

    // Configuración de Supabase (Tu conexión actual)
    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            let query = _supabase.from('productos').select('*').eq('disponible', true);
            if (cat !== 'Todos') query = query.eq('categoria', cat);
            
            const { data } = await query.order('created_at', { ascending: false });
            setItems(data || []);
            setLoading(false);
        };
        loadData();
    }, [cat]);

    return (
        <div>
            {/* Header / Navbar */}
            <nav className="nav-bar">
                <div className="logo-container">
                    <span className="sua-text">SUA</span>
                    <span className="sua-tagline">Pococí • Curaduría</span>
                </div>
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(c => (
                        <button 
                            key={c} 
                            className={cat === c ? 'active' : ''} 
                            onClick={() => setCat(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div style={{color: 'var(--azul-noche)', fontSize: '1.2rem'}}>☰</div>
            </nav>

            {/* Hero Section Llamativa */}
            <header className="hero">
                <div className="hero-content">
                    <p style={{letterSpacing: '5px', fontSize: '0.7rem', marginBottom: '15px'}}>GUÁPILES, COSTA RICA</p>
                    <h1>Moda <i>Exclusiva</i> <br/>con Historia.</h1>
                    <p style={{opacity: 0.8, marginTop: '20px', maxWidth: '400px'}}>
                        Curaduría premium de piezas únicas para quienes buscan destacar en cada detalle.
                    </p>
                </div>
                <div className="hero-image"></div>
            </header>

            {/* Galería de Productos */}
            <main className="container">
                <h2 className="section-title">{cat === 'Todos' ? 'Nuestra Selección' : cat}</h2>
                
                {loading ? (
                    <div style={{textAlign: 'center', padding: '100px', letterSpacing: '10px'}}>CARGANDO...</div>
                ) : (
                    <div className="grid">
                        {items.length > 0 ? items.map(item => (
                            <article key={item.id} className="card">
                                <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                                <div className="card-info">
                                    <small style={{opacity: 0.5, textTransform: 'uppercase'}}>{item.categoria}</small>
                                    <h3>{item.nombre}</h3>
                                    <span className="card-price">₡{item.precio.toLocaleString()}</span>
                                    <button className="btn-add">Consultar</button>
                                </div>
                            </article>
                        )) : (
                            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px'}}>
                                <p>Próximamente nuevas piezas en esta categoría.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{background: 'var(--azul-noche)', color: 'white', padding: '80px 5%', textAlign: 'center'}}>
                <div className="sua-text" style={{color: 'white', marginBottom: '20px'}}>SUA</div>
                <p style={{opacity: 0.5, fontSize: '0.8rem'}}>© 2026 SUA BOUTIQUE | POCOCÍ, LIMÓN</p>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
