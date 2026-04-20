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
            // Filtramos por disponibles. Asegúrate de tener activada la política SELECT para 'anon' en Supabase
            let q = _supabase.from('productos').select('*').eq('disponible', true);
            
            if (cat !== 'Todos') {
                q = q.eq('categoria', cat);
            }
            
            const { data, error } = await q.order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error cargando datos:", error.message);
            } else {
                setItems(data || []);
            }
            setLoading(false);
        };
        loadData();
    }, [cat]);

    const navTo = (nuevaCat) => {
        setCat(nuevaCat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={`app-container theme-siwa`}>
            {/* NAVEGACIÓN PROFESIONAL */}
            <nav className="nav-bar">
                <div className="logo-wrapper">
                    <div className="siwa-brand">
                        <span className="logo-symbol">@</span>
                        <span className="logo-text">Siwá</span>
                        <span className="logo-dot">.</span>
                    </div>
                    <small className="logo-tagline">TIENDA VIRTUAL INFANTIL</small>
                </div>
                
                <div className="nav-links">
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
                        <button 
                            key={c} 
                            className={cat === c ? 'nav-btn active' : 'nav-btn'} 
                            onClick={() => setCat(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </nav>

            {/* HERO DINÁMICO */}
            <header className="hero-section">
                <div className="hero-content">
                    <span className="hero-label">Colección 2026</span>
                    <h1>{cat === 'Todos' ? 'Historias que se visten' : `Especial ${cat}`}</h1>
                    <p>Moda importada con la esencia del viento y la frescura de nuestra tierra.</p>
                </div>
            </header>

            {/* GRID DE PRODUCTOS */}
            <main className="main-content">
                {loading ? (
                    <div className="loader">Cargando tesoros...</div>
                ) : (
                    <div className="product-grid">
                        {items.map(item => (
                            <article key={item.id} className="product-card">
                                <div className="image-wrapper">
                                    {item.tiene_descuento && (
                                        <span className="promo-badge">-{item.porcentaje_descuento}%</span>
                                    )}
                                    <img src={item.imagen_url} alt={item.nombre} loading="lazy" />
                                </div>
                                
                                <div className="product-info">
                                    <span className="product-cat">{item.categoria}</span>
                                    <h3>{item.nombre}</h3>
                                    <div className="product-price">
                                        {item.tiene_descuento ? (
                                            <>
                                                <span className="current-price">₡{parseInt(item.precio_oferta).toLocaleString()}</span>
                                                <span className="old-price">₡{parseInt(item.precio).toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="current-price">₡{parseInt(item.precio).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <button 
                                        className="wa-button"
                                        onClick={() => window.open(`https://wa.me/50688888888?text=Hola Siwá! Me interesa: ${item.nombre}`)}
                                    >
                                        <i className="wa-icon"></i> Consultar Disponibilidad
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* SECCIÓN NOSOTROS / SIGNIFICADO */}
            <section className="about-section">
                <div className="about-container">
                    <div className="about-visual">
                        <div className="floating-kite">◊</div>
                    </div>
                    <div className="about-text">
                        <h2>Nuestra Historia</h2>
                        <p>
                            En la lengua ancestral <strong>Bribri</strong>, <strong>Siwá</strong> es el viento, el soplo de vida y las historias que viajan con él. 
                            Nuestra boutique en Pococí nace para ser ese viento fresco que trae lo mejor del mundo para vestir los momentos más importantes de tus hijos.
                        </p>
                    </div>
                </div>
            </section>

            {/* FOOTER PROFESIONAL Y ADAPTABLE */}
            <footer className="main-footer">
                <div className="footer-top">
                    <div className="footer-column brand-col">
                        <div className="siwa-logo-footer">Siwá</div>
                        <p>Moda infantil con propósito y raíz. Enviamos a todo el país desde Guápiles.</p>
                        <div className="social-icons">
                            <button className="social-btn">IG</button>
                            <button className="social-btn">FB</button>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Categorías</h4>
                        <ul>
                            {['Bebé', 'Niño', 'Niña'].map(c => (
                                <li key={c} onClick={() => navTo(c)}>{c}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Ayuda</h4>
                        <ul>
                            <li>Guía de Tallas</li>
                            <li>Envíos</li>
                            <li>Términos</li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Ubicación</h4>
                        <p>Guápiles, Pococí<br/>Limón, Costa Rica</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="bottom-container">
                        <p>© 2026 Siwá Boutique. Todos los derechos reservados.</p>
                        <p className="credit">By <strong>MONTZU</strong></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
