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
            
            // Solo filtramos entre las categorías infantiles
            if (cat !== 'Todos') {
                q = q.eq('categoria', cat);
            } else {
                q = q.in('categoria', ['Bebé', 'Niño', 'Niña']);
            }
            
            const { data } = await q.order('created_at', { ascending: false });
            setItems(data || []);
            setLoading(false);
        };
        loadData();
    }, [cat]);

    const getContent = () => {
        const info = {
            'Bebé': { t: "Pequeños Sueños", d: "Ternura y suavidad para sus primeros días." },
            'Niño': { t: "Grandes Aventuras", d: "Estilo resistente para jugar sin límites." },
            'Niña': { t: "Magia y Estilo", d: "Diseños encantadores para brillar siempre." },
            'Todos': { t: "SUA Kids Boutique", d: "Curaduría exclusiva de moda infantil en Pococí." }
        };
        return info[cat] || info['Todos'];
    };

    return (
        <div className={`app-container tema-${cat}`}>
            <nav className="nav-bar">
                <div className="sua-logo">SUA KIDS</div>
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
                        <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>
                            {c}
                        </button>
                    ))}
                </div>
            </nav>

            <header className="hero">
                <h1>{getContent().t}</h1>
                <p>{getContent().d}</p>
            </header>

            <main className="grid">
                {loading ? (
                    <p style={{gridColumn: '1/-1', textAlign: 'center'}}>Cargando tesoros...</p>
                ) : items.map(item => (
                    <article key={item.id} className="card">
                        <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                        <div style={{padding: '10px'}}>
                            <small style={{textTransform: 'uppercase', opacity: 0.6}}>{item.categoria}</small>
                            <h3 style={{margin: '5px 0'}}>{item.nombre}</h3>
                            <span style={{fontWeight: '700', color: 'var(--naranja-sua)'}}>
                                ₡{item.precio?.toLocaleString()}
                            </span>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
