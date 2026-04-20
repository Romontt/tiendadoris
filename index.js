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
            // Filtramos siempre por 'disponible' = true para que lo que quites en el admin desaparezca aquí
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

    const navTo = (nuevaCat) => {
        setCat(nuevaCat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                    <article key={item.id} className="card" style={{ position: 'relative' }}>
                        {/* Badge de Oferta flotante si tiene descuento */}
                        {item.tiene_descuento && (
                            <div style={{
                                position: 'absolute', top: '10px', right: '10px',
                                background: 'var(--naranja-sua)', color: 'white',
                                padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem',
                                fontWeight: '700', zIndex: 2
                            }}>
                                -{item.porcentaje_descuento}%
                            </div>
                        )}
                        
                        <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                        
                        <div style={{padding: '10px 5px'}}>
                            <h3 style={{fontSize: '1rem', margin: '5px 0', fontWeight: '500'}}>{item.nombre}</h3>
                            
                            {/* Lógica de Precios con Descuento */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {item.tiene_descuento ? (
                                    <>
                                        <span style={{ color: 'var(--naranja-sua)', fontWeight: '700', fontSize: '1.1rem' }}>
                                            ₡{parseInt(item.precio_oferta).toLocaleString()}
                                        </span>
                                        <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: '0.85rem' }}>
                                            ₡{parseInt(item.precio).toLocaleString()}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ color: 'var(--naranja-sua)', fontWeight: '700' }}>
                                        ₡{parseInt(item.precio).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={() => window.open(`https://wa.me/50688888888?text=Me interesa este producto de la web: ${item.nombre}`)}
                                style={{
                                    width: '100%', marginTop: '12px', padding: '10px',
                                    background: 'var(--verde-boutique)', color: 'white',
                                    border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem',
                                    transition: '0.3s'
                                }}
                            >
                                WhatsApp
                            </button>
                        </div>
                    </article>
                ))}
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="sua-logo">SUA</div>
                        <p className="footer-location">SUA KIDS / Pococí, Limón</p>
                    </div>

                    <div className="footer-links-wrapper">
                        <div className="footer-links">
                            <h4>Colecciones</h4>
                            <ul>
                                {['Bebé', 'Niño', 'Niña'].map(c => (
                                    <li key={c}>
                                        <button onClick={() => navTo(c)}>{c}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4>Contacto</h4>
                            <ul>
                                <li><button onClick={() => window.open('https://wa.me/50688888888')}>WhatsApp</button></li>
                                <li><button>Instagram</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div>© 2026 SUA Boutique</div>
                    <div className="designer-credit">
                        DISEÑADO POR <span style={{color: 'white', fontWeight: '700'}}>MONTZUCR</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
