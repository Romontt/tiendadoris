const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);

    const _supabase = supabase.createClient(
        'https://hvProjectkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IjpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
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

    const isMobile = window.innerWidth < 768;

    return (
        <div className={`app-container theme-siwa`}>
            {/* NAVEGACIÓN MEJORADA PARA PC */}
            <nav className="nav-bar" style={{ 
                padding: isMobile ? '10px 15px' : '25px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div className="logo-wrapper" style={{ flexShrink: 0 }}>
                    <div className="siwa-brand" style={{ 
                        fontSize: isMobile ? '1.5rem' : '2.4rem', 
                        lineHeight: '1' 
                    }}>
                        <span className="logo-symbol">@</span>
                        <span className="logo-text">Siwá</span>
                        <span className="logo-dot">.</span>
                    </div>
                    <small className="logo-tagline" style={{ 
                        fontSize: isMobile ? '0.6rem' : '0.85rem',
                        letterSpacing: isMobile ? '1px' : '3px',
                        display: 'block',
                        marginTop: '4px'
                    }}>
                        TIENDA VIRTUAL INFANTIL
                    </small>
                </div>
                
                <div className="nav-links" style={{ 
                    gap: isMobile ? '8px' : '15px',
                    display: 'flex'
                }}>
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
                        <button 
                            key={c} 
                            className={cat === c ? 'nav-btn active' : 'nav-btn'} 
                            onClick={() => setCat(c)}
                            style={{ 
                                fontSize: isMobile ? '0.85rem' : '1rem', 
                                padding: isMobile ? '8px 12px' : '10px 20px',
                                borderRadius: '12px'
                            }}
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
                    <p>Prendas elegidas con amor para acompañar cada pequeño gran paso y las historias que están por vivir.</p>
                </div>
            </header>

            {/* GRID DE PRODUCTOS */}
            <main className="main-content" style={{ padding: isMobile ? '15px 8px' : '40px 20px' }}>
                {loading ? (
                    <div className="loader">Cargando tesoros...</div>
                ) : (
                    <div className="product-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                        gap: isMobile ? '12px' : '30px',
                        maxWidth: '1300px',
                        margin: '0 auto'
                    }}>
                        {items.map(item => (
                            <article key={item.id} className="product-card" style={{ background: 'transparent' }}>
                                <div className="image-wrapper" style={{ 
                                    width: '100%', 
                                    aspectRatio: '4 / 5', 
                                    borderRadius: '16px', 
                                    overflow: 'hidden',
                                    position: 'relative',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                                }}>
                                    {item.tiene_descuento && (
                                        <span className="promo-badge" style={{ 
                                            position: 'absolute', 
                                            zIndex: 2,
                                            fontSize: '0.7rem',
                                            padding: '4px 8px'
                                        }}>-{item.porcentaje_descuento}%</span>
                                    )}
                                    <img 
                                        src={item.imagen_url} 
                                        alt={item.nombre} 
                                        loading="lazy" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                
                                <div className="product-info" style={{ padding: '10px 2px' }}>
                                    <span className="product-cat" style={{ fontSize: '0.7rem' }}>{item.categoria}</span>
                                    <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', margin: '4px 0', lineHeight: '1.2' }}>{item.nombre}</h3>
                                    <div className="product-price" style={{ marginBottom: '10px' }}>
                                        {item.tiene_descuento ? (
                                            <>
                                                <span className="current-price" style={{ fontSize: '1rem', fontWeight: '700' }}>₡{parseInt(item.precio_offer || item.precio_oferta).toLocaleString()}</span>
                                                <br/>
                                                <span className="old-price" style={{ fontSize: '0.8rem', opacity: 0.5, textDecoration: 'line-through' }}>₡{parseInt(item.precio).toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="current-price" style={{ fontSize: '1rem', fontWeight: '700' }}>₡{parseInt(item.precio).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <button 
                                        className="wa-button"
                                        onClick={() => window.open(`https://wa.me/50683337497?text=Hola Siwá! Me interesa: ${item.nombre}`)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px', 
                                            borderRadius: '10px', 
                                            fontSize: '0.8rem',
                                            fontWeight: '600' 
                                        }}
                                    >
                                        Consultar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* SECCIÓN NOSOTROS */}
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

            {/* FOOTER */}
            <footer className="main-footer">
                <div className="footer-top">
                    <div className="footer-column brand-col">
                        <div className="siwa-logo-footer">Siwá</div>
                        <p>Moda infantil con propósito y raíz. Enviamos a todo el país desde Guápiles.</p>
                        <div className="social-icons" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" style={{ color: 'inherit' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" style={{ color: 'inherit' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Categorías</h4>
                        <ul>
                            {['Bebé', 'Niño', 'Niña'].map(c => (
                                <li key={c} onClick={() => navTo(c)} style={{ cursor: 'pointer' }}>{c}</li>
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
