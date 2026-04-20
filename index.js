const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            let q = _supabase.from('productos').select('*').eq('disponible', true);
            if (cat !== 'Todos') q = q.eq('categoria', cat);
            const { data } = await q.order('created_at', { ascending: false });
            setItems(data || []);
            setLoading(false);
        };
        loadData();
    }, [cat]);

    // Textos personalizados para el Hero según la categoría
    const getHeroText = () => {
        switch(cat) {
            case 'Bebé': return "Pequeños Sueños, Grandes Estilos";
            case 'Niño': return "Aventuras con Estilo Propio";
            case 'Niña': return "Magia y Color en cada Prenda";
            case 'Hombre': return "Sofisticación Moderna";
            case 'Mujer': return "Elegancia Sin Límites";
            default: return "Moda Exclusiva con Historia";
        }
    };

    return (
        <div className={`tema-${cat}`}>
            <nav className="nav-bar">
                <div className="sua-text">SUA</div>
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
            </nav>

            <header className="hero">
                <div style={{maxWidth: '600px'}}>
                    <p style={{letterSpacing: '5px', fontSize: '0.7rem'}}>{cat.toUpperCase()}</p>
                    <h1>{getHeroText()}</h1>
                </div>
            </header>

            <main className="grid">
                {loading ? (
                    <p style={{gridColumn: '1/-1', textAlign: 'center'}}>Actualizando galería...</p>
                ) : items.map(item => (
                    <article key={item.id} className="card">
                        <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                        <div style={{padding: '10px'}}>
                            <h3 style={{margin: '10px 0 5px'}}>{item.nombre}</h3>
                            <span style={{fontWeight: '700', color: 'var(--accent)'}}>₡{item.price?.toLocaleString() || item.precio?.toLocaleString()}</span>
                            <button className="btn-action">Ver Detalles</button>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
