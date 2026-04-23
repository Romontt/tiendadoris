const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);
    
    // --- NUEVO: ESTADO DEL CARRITO ---
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
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

    // --- NUEVA: LÓGICA DE FUNCIONES DEL CARRITO ---
    const addToCart = (product) => {
        // Usamos cartId para poder borrar items individuales aunque sean el mismo producto
        setCart([...cart, { ...product, cartId: Date.now() + Math.random() }]);
        if(!isMobile) setIsCartOpen(true); // Abrir carrito automáticamente en PC
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const cartTotal = cart.reduce((acc, item) => {
        const precio = item.tiene_descuento ? (item.precio_offer || item.precio_oferta) : item.precio;
        return acc + parseInt(precio);
    }, 0);

    const enviarPedidoWhatsApp = () => {
        const mensajeBase = `¡Hola Siwá! 🌬️ Me interesa realizar el siguiente pedido:%0A%0A`;
        const lista = cart.map(i => `- ${i.nombre} (₡${parseInt(i.tiene_descuento ? (i.precio_offer || i.precio_oferta) : i.precio).toLocaleString()})`).join('%0A');
        const totalTexto = `%0A%0A*Total: ₡${cartTotal.toLocaleString()}*%0A_Envío gratis en Guápiles Centro_`;
        
        window.open(`https://wa.me/50683337497?text=${mensajeBase}${lista}${totalTexto}`);
    };

    const navTo = (nuevaCat) => {
        setCat(nuevaCat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isMobile = window.innerWidth < 768;

    return (
        <div className={`app-container theme-siwa`}>
            {/* NAVEGACIÓN */}
            <nav className="nav-bar" style={{ 
                padding: isMobile ? '10px 15px' : '25px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)'
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
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
                        <button 
                            key={c} 
                            className={cat === c ? 'nav-btn active' : 'nav-btn'} 
                            onClick={() => setCat(c)}
                            style={{ 
                                fontSize: isMobile ? '0.75rem' : '1rem', 
                                padding: isMobile ? '6px 10px' : '10px 20px',
                                borderRadius: '12px'
                            }}
                        >
                            {c}
                        </button>
                    ))}
                    
                    {/* BOTÓN CARRITO EN NAV */}
                    <button onClick={() => setIsCartOpen(!isCartOpen)} style={{
                        background: '#f8f8f8', border: 'none', padding: '10px', borderRadius: '50%',
                        position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        {cart.length > 0 && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-color, #E8AAB8)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* HERO DINÁMICO */}
            <header className="hero-section">
                <div className="hero-content">
                    <span className="hero-label">Colección 2026</span>
                    <h1>{cat === 'Todos' ? 'Historias que se visten' : `Especial ${cat}`}</h1>
                    <p>Prendas elegidas con amor para acompañar cada pequeño gran paso.</p>
                </div>
            </header>

            {/* GRID DE PRODUCTOS */}
            <main className="main-content" style={{ padding: isMobile ? '15px 8px' : '40px 20px', paddingBottom: '100px' }}>
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
                                            padding: '4px 8px',
                                            background: '#E8AAB8', color: 'white', left: '10px', top: '10px', borderRadius: '8px'
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
                                    <span className="product-cat" style={{ fontSize: '0.7rem', opacity: 0.6 }}>{item.categoria}</span>
                                    <h3 style={{ fontSize: isMobile ? '0.9rem' : '1.1rem', margin: '4px 0', lineHeight: '1.2' }}>{item.nombre}</h3>
                                    <div className="product-price" style={{ marginBottom: '10px' }}>
                                        {item.tiene_descuento ? (
                                            <>
                                                <span className="current-price" style={{ fontSize: '1rem', fontWeight: '700' }}>₡{parseInt(item.precio_offer || item.precio_oferta).toLocaleString()}</span>
                                                <span className="old-price" style={{ fontSize: '0.8rem', opacity: 0.5, textDecoration: 'line-through', marginLeft: '8px' }}>₡{parseInt(item.precio).toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="current-price" style={{ fontSize: '1rem', fontWeight: '700' }}>₡{parseInt(item.precio).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <button 
                                        className="wa-button"
                                        onClick={() => addToCart(item)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            background: '#25D366', color: 'white', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        Añadir al carrito
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* --- NUEVA INTERFAZ DE CARRITO (OVERLAY) --- */}
            {isCartOpen && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : '400px',
                    background: 'white', zIndex: 1000, boxShadow: '-5px 0 30px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Tu Carrito 🛒</h2>
                        <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {cart.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>El carrito está vacío</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartId} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                                    <img src={item.imagen_url} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{item.nombre}</h4>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>₡{parseInt(item.tiene_descuento ? (item.precio_offer || item.precio_oferta) : item.precio).toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div style={{ padding: '20px', background: '#fcfcfc', borderTop: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                                <span>Total:</span>
                                <span>₡{cartTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ background: '#e9f7ef', padding: '10px', borderRadius: '8px', color: '#27ae60', fontSize: '0.8rem', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                                ✨ ¡Envío gratis en Guápiles Centro!
                            </div>
                            <button onClick={enviarPedidoWhatsApp} className="wa-button" style={{ 
                                width: '100%', padding: '15px', borderRadius: '12px', background: '#25D366', color: 'white', 
                                border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' 
                            }}>
                                Confirmar Pedido (WhatsApp)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* SECCIÓN NOSOTROS */}
            <section className="about-section">
                <div className="about-container">
                    <div className="about-visual">
                        <div className="floating-kite">◊</div>
                    </div>
                    <div className="about-text">
                        <h2>Nuestra Historia</h2>
                        <p>
                            En la lengua ancestral <strong>Bribri</strong>, <strong>Siwá</strong> es el viento... Enviamos a todo el país desde Guápiles.
                        </p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="main-footer">
                <div className="footer-top">
                    <div className="footer-column brand-col">
                        <div className="siwa-logo-footer">Siwá</div>
                        <p>Moda infantil con propósito y raíz.</p>
                    </div>
                    <div className="footer-column">
                        <h4>Categorías</h4>
                        <ul>{['Bebé', 'Niño', 'Niña'].map(c => <li key={c} onClick={() => navTo(c)} style={{ cursor: 'pointer' }}>{c}</li>)}</ul>
                    </div>
                    <div className="footer-column">
                        <h4>Ayuda</h4>
                        <ul><li>Guía de Tallas</li><li>Envíos</li><li>Términos</li></ul>
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
