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
            if (cat !== 'Todos') q = q.eq('categoria', cat);
            const { data } = await q.order('created_at', { ascending: false });
            setItems(data || []);
        };
        loadData();
    }, [cat]);

    const getHeroTitle = () => {
        if (cat === 'Todos') return "Elegancia Reencontrada";
        return cat;
    };

    return (
        <div className={`app-container tema-${cat}`}>
            <nav className="nav-bar">
                <div className="sua-text">SUA</div>
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(c => (
                        <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>
                            {c}
                        </button>
                    ))}
                </div>
            </nav>

            <header className="hero">
                <p style={{letterSpacing: '5px', fontSize: '0.8rem', opacity: 0.8}}>EST. 2026</p>
                <h1>{getHeroTitle()}</h1>
            </header>

            <main className="grid">
                {items.map(item => (
                    <article key={item.id} className="card">
                        <img src={item.imagen_url} className="card-img" />
                        <h3>{item.nombre}</h3>
                        <p>₡{item.precio?.toLocaleString()}</p>
                    </article>
                ))}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
