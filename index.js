const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const loadData = async () => {
            let q = _supabase.from('productos').select('*').eq('disponible', true);
            if (cat !== 'Todos') {
                q = q.eq('categoria', cat);
            } else {
                q = q.in('categoria', ['Bebé', 'Niño', 'Niña']);
            }
            const { data } = await q.order('created_at', { ascending: false });
            setItems(data || []);
        };
        loadData();
    }, [cat]);

    return (
        <div className={`app-container tema-${cat}`}>
            <nav className="nav-bar">
                <div className="sua-logo">SUA</div>
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
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
                <h1>{cat === 'Todos' ? 'Tesoro Infantil' : cat}</h1>
                <p style={{fontSize: '0.85rem', opacity: 0.7, margin: '10px 0 0'}}>
                    Moda importada seleccionada para tu familia.
                </p>
            </header>

            <main className="grid">
                {items.map(item => (
                    <article key={item.id} className="card">
                        <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                        <div style={{padding: '10px 5px'}}>
                            <h3 style={{fontSize: '1rem', margin: '5px 0', fontWeight: '500'}}>{item.nombre}</h3>
                            <div style={{color: 'var(--naranja-sua)', fontWeight: '700'}}>₡{item.precio?.toLocaleString()}</div>
                            <button 
                                onClick={() => window.open(`https://wa.me/50688888888?text=Me interesa: ${item.nombre}`)}
                                style={{
                                    width: '100%', marginTop: '12px', padding: '10px',
                                    background: 'var(--verde-boutique)', color: 'white',
                                    border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >
                                WhatsApp
                            </button>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
