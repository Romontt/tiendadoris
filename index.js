const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);

    // Conexión a Supabase
    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let q = _supabase.from('productos').select('*').eq('disponible', true);
                
                // Aplicamos filtro solo si no es 'Todos'
                if (cat !== 'Todos') {
                    q = q.eq('categoria', cat);
                }
                
                const { data, error } = await q.order('created_at', { ascending: false });
                
                if (error) throw error;
                setItems(data || []);
            } catch (err) {
                console.error("Error cargando productos:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [cat]);

    // Lógica de textos y estilos dinámicos
    const getThemeConfig = () => {
        const configs = {
            'Bebé': {
                titulo: "Pequeños Sueños, Grandes Estilos",
                desc: "Ternura y confort para los más nuevos de la casa.",
                tag: "Colección Recién Nacidos"
            },
            'Niño': {
                titulo: "Aventuras con Estilo Propio",
                desc: "Ropa resistente y moderna para pequeños exploradores.",
                tag: "Moda Infantil Masculina"
            },
            'Niña': {
                titulo: "Magia y Color en cada Prenda",
                desc: "Diseños encantadores para brillar en cada ocasión.",
                tag: "Moda Infantil Femenina"
            },
            'Hombre': {
                titulo: "Sofisticación Moderna",
                desc: "Cortes impecables y estilo contemporáneo.",
                tag: "Caballeros Select"
            },
            'Mujer': {
                titulo: "Elegancia Sin Límites",
                desc: "Piezas exclusivas que resaltan tu esencia.",
                tag: "Damas Vanguardia"
            },
            'Todos': {
                titulo: "Curaduría de Moda Exclusiva",
                desc: "Selección premium de ropa importada para toda la familia en Pococí.",
                tag: "SUA Boutique Select"
            }
        };
        return configs[cat] || configs['Todos'];
    };

    const config = getThemeConfig();

    return (
        // El className dinámico permite que el CSS cambie colores y bordes (radius)
        <div className={`app-container tema-${cat}`}>
            
            {/* Navegación con el Logo SUA que creamos */}
            <nav className="nav-bar">
                <div className="logo-container">
                    <span className="sua-text">SUA</span>
                    <span className="sua-tagline">Pococí • Curaduría</span>
                </div>
                
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(c => (
                        <button 
                            key={c} 
                            className={`btn-nav ${cat === c ? 'active' : ''}`} 
                            onClick={() => setCat(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Hero dinámico que cambia textos según el ambiente */}
            <header className="hero">
                <div className="hero-content">
                    <span className="hero-tag">{config.tag}</span>
                    <h1>{config.titulo}</h1>
                    <p className="hero-desc">{config.desc}</p>
                </div>
                <div className="hero-visual">
                    {/* Aquí podrías poner una imagen representativa de la categoría */}
                </div>
            </header>

            <main className="container">
                <h2 className="grid-title">Explorar {cat === 'Todos' ? 'todo' : cat}</h2>
                
                {loading ? (
                    <div className="loader">
                        <div className="spinner"></div>
                        <p>Actualizando stock de {cat}...</p>
                    </div>
                ) : (
                    <div className="grid">
                        {items.length > 0 ? (
                            items.map(item => (
                                <article key={item.id} className="card">
                                    <div className="card-image-wrapper">
                                        <img src={item.imagen_url} className="card-img" alt={item.nombre} />
                                    </div>
                                    <div className="card-info">
                                        <small className="item-cat">{item.categoria}</small>
                                        <h3>{item.nombre}</h3>
                                        <span className="card-price">
                                            ₡{(item.precio || item.price || 0).toLocaleString()}
                                        </span>
                                        <button className="btn-action">
                                            <span>Consultar</span>
                                            <i className="icon-arrow"></i>
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="empty-state">
                                <h3>Próximamente...</h3>
                                <p>Estamos seleccionando las mejores piezas de {cat} para ti.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="footer">
                <div className="sua-text" style={{fontSize: '1.5rem', color: 'white'}}>SUA</div>
                <p>Guápiles, Limón, Costa Rica</p>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
