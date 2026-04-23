const { useState, useEffect } = React;

function App() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('Todos');
    const [loading, setLoading] = useState(true);
    
    // --- ESTADO DEL CARRITO ---
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- ESTADO DE MODALES DE AYUDA ---
    const [helpModal, setHelpModal] = useState({ open: false, title: '', content: '' });

    // --- ESTADO PARA VISOR DE FOTOS ---
    const [selectedImage, setSelectedImage] = useState(null);

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    // --- LÓGICA DE RASTREO (Punto 506 / SIWÁ) ---
    const sessionId = (() => {
        let id = sessionStorage.getItem('siwa_session');
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem('siwa_session', id);
        }
        return id;
    })();

    const trackEvent = async (table, data) => {
        try {
            await _supabase.from(table).insert([{ ...data, session_id: sessionId }]);
        } catch (e) {
            console.error("Tracking error:", e);
        }
    };

    // Rastrear vista de página al cambiar categoría
    useEffect(() => {
        trackEvent('page_views', {
            page_path: cat === 'Todos' ? '/' : `/${cat}`,
            user_agent: navigator.userAgent,
            referrer: document.referrer
        });
    }, [cat]);

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

    // --- LÓGICA DE FUNCIONES DEL CARRITO ---
    const addToCart = (product) => {
        const exists = cart.find(item => item.id === product.id);
        if (!exists) {
            setCart([...cart, { ...product, cartId: Date.now() + Math.random() }]);
            // Rastrear clic en añadir
            trackEvent('user_clicks', {
                element_id: 'btn-add-to-cart',
                click_text: `Añadir: ${product.nombre}`,
                page_path: window.location.pathname
            });
        }
    };

    const removeFromCart = (cartId) => {
        const item = cart.find(i => i.cartId === cartId);
        setCart(cart.filter(item => item.cartId !== cartId));
        trackEvent('user_clicks', {
            element_id: 'btn-remove-cart',
            click_text: `Remover: ${item?.nombre}`,
            page_path: window.location.pathname
        });
    };

    const cartTotal = cart.reduce((acc, item) => {
        const precio = item.tiene_descuento ? (item.precio_offer || item.precio_oferta) : item.precio;
        return acc + parseInt(precio);
    }, 0);

    const enviarPedidoWhatsApp = () => {
        trackEvent('user_clicks', {
            element_id: 'btn-confirm-whatsapp',
            click_text: 'Confirmar Pedido WhatsApp',
            page_path: window.location.pathname
        });

        const mensajeBase = `¡Hola Siwá! 🌬️ Me interesa realizar el siguiente pedido:%0A%0A`;
        const lista = cart.map(i => `- ${i.nombre} (₡${parseInt(i.tiene_descuento ? (i.precio_offer || i.precio_oferta) : i.precio).toLocaleString()})`).join('%0A');
        const totalTexto = `%0A%0A*Total: ₡${cartTotal.toLocaleString()}*%0A_Envío gratis en Guápiles Centro_`;
        
        window.open(`https://wa.me/50683337497?text=${mensajeBase}${lista}${totalTexto}`);
    };

    const navTo = (nuevaCat) => {
        setCat(nuevaCat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- LÓGICA MODALES DE AYUDA ---
    const openHelp = (type) => {
        const info = {
            envios: {
                title: 'Políticas de Envío 🚚',
                content: 'Realizamos envíos a todo el país vía Correos de Costa Rica. En Guápiles Centro el envío es gratuito. Para el resto del país, el costo se calcula según la zona.'
            },
            terminos: {
                title: 'Términos y Condiciones 📄',
                content: 'Todas nuestras prendas son revisadas cuidadosamente antes del envío para garantizar su calidad. Al ser piezas de talla única, no se realizan cambios ni devoluciones. Una vez confirmada la compra, el artículo se reserva exclusivamente para usted.'
            }
        };
        trackEvent('user_clicks', {
            element_id: `help-${type}`,
            click_text: `Abrir ayuda: ${type}`,
            page_path: window.location.pathname
        });
        setHelpModal({ open: true, ...info[type] });
    };

    const isMobile = window.innerWidth < 768;

    return (
        <div className={`app-container tema-${cat}`} style={{ boxSizing: 'border-box' }}>
            {/* NAVEGACIÓN */}
            <nav className="nav-bar" style={{ 
                padding: isMobile ? '15px 10px' : '25px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
                boxSizing: 'border-box',
                width: '100%'
            }}>
                <div className="logo-wrapper" style={{ flexShrink: 0 }}>
                    <div className="siwa-brand" style={{ 
                        fontSize: isMobile ? '2rem' : '3.2rem',
                        lineHeight: '1',
                        fontWeight: '900'
                    }}>
                        <span className="logo-symbol" style={{ fontWeight: '800' }}>@</span>
                        <span className="logo-text">Siwá</span>
                        <span className="logo-dot">.</span>
                    </div>
                    <small className="logo-tagline" style={{ 
                        fontSize: isMobile ? '0.75rem' : '1.1rem',
                        letterSpacing: isMobile ? '2px' : '4px',
                        display: 'block',
                        marginTop: '6px',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                    }}>
                        TIENDA VIRTUAL INFANTIL
                    </small>
                </div>
                
                <div className="nav-links" style={{ 
                    gap: isMobile ? '5px' : '15px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '5px'
                }}>
                    {['Todos', 'Bebé', 'Niño', 'Niña'].map(c => (
                        <button 
                            key={c} 
                            className={cat === c ? 'nav-btn active' : 'nav-btn'} 
                            onClick={() => setCat(c)}
                            style={{ 
                                fontSize: isMobile ? '0.7rem' : '1rem', 
                                padding: isMobile ? '6px 8px' : '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {c}
                        </button>
                    ))}
                    
                    <button onClick={() => setIsCartOpen(!isCartOpen)} style={{
                        background: '#f8f8f8', border: 'none', padding: isMobile ? '8px' : '10px', borderRadius: '50%',
                        position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: isMobile ? '5px' : '10px'
                    }}>
                        <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        {cart.length > 0 && (
                            <span style={{ 
                                position: 'absolute', 
                                top: isMobile ? '-2px' : '-5px', 
                                right: isMobile ? '-2px' : '-5px', 
                                background: 'var(--rosa-siwa)', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: isMobile ? '16px' : '18px', 
                                height: isMobile ? '16px' : '18px', 
                                fontSize: '0.65rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <span className="hero-label">Colección 2026</span>
                    <h1>{cat === 'Todos' ? 'Historias que se visten' : `Especial ${cat}`}</h1>
                    <p>Prendas elegidas con amor para acompañar cada pequeño gran paso.</p>
                </div>
            </header>

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
                        {items.map(item => {
                            const alreadyInCart = cart.some(c => c.id === item.id);
                            return (
                                <article key={item.id} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="image-wrapper" 
                                        onClick={() => {
                                            setSelectedImage(item.imagen_url);
                                            trackEvent('user_clicks', {
                                                element_id: 'product-zoom',
                                                click_text: `Zoom: ${item.nombre}`,
                                                page_path: window.location.pathname
                                            });
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            aspectRatio: '4 / 5', 
                                            overflow: 'hidden',
                                            position: 'relative',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                            flexShrink: 0,
                                            cursor: 'zoom-in'
                                        }}>
                                        {item.tiene_descuento && (
                                            <span className="promo-badge" style={{ 
                                                position: 'absolute', 
                                                zIndex: 2,
                                                fontSize: '0.7rem',
                                                padding: '4px 8px',
                                                left: '10px', top: '10px'
                                            }}>-{item.porcentaje_descuento}%</span>
                                        )}
                                        <img 
                                            src={item.imagen_url} 
                                            alt={item.nombre} 
                                            loading="lazy" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    
                                    <div className="product-info" style={{ 
                                        padding: '12px 2px', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        flexGrow: 1 
                                    }}>
                                        <span className="product-cat" style={{ fontSize: '0.7rem', opacity: 0.6 }}>{item.categoria}</span>
                                        <h3 style={{ 
                                            fontSize: isMobile ? '0.9rem' : '1.1rem', 
                                            margin: '4px 0', 
                                            lineHeight: '1.2',
                                            minHeight: isMobile ? '2.2rem' : '2.6rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>{item.nombre}</h3>
                                        
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
                                            <strong>Tallas:</strong> {item.tallas || 'Única'}
                                        </div>

                                        <div className="product-price" style={{ marginBottom: '12px', minHeight: '1.5rem' }}>
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
                                            disabled={alreadyInCart}
                                            style={{ 
                                                width: '100%', 
                                                padding: '10px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: alreadyInCart ? '#ccc' : 'var(--verde-siwa)', 
                                                color: 'white', 
                                                border: 'none', 
                                                cursor: alreadyInCart ? 'default' : 'pointer',
                                                marginTop: 'auto'
                                            }}
                                        >
                                            {alreadyInCart ? 'Ya en el carrito' : 'Añadir al carrito'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODAL VISOR DE IMAGEN */}
            {selectedImage && (
                <div 
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-out'
                    }}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        style={{ 
                            position: 'absolute', top: '25px', right: '25px', 
                            background: 'white', border: 'none', borderRadius: '50%', 
                            width: '44px', height: '44px', fontSize: '1.4rem', 
                            cursor: 'pointer', zIndex: 3001, display: 'flex', 
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            color: '#333'
                        }}
                    >✕</button>
                    
                    <div style={{ position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={selectedImage} 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                objectFit: 'contain', 
                                borderRadius: '4px'
                            }} 
                            alt="Vista ampliada"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {isCartOpen && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : '400px',
                    background: 'white', zIndex: 1001, boxShadow: '-5px 0 30px rgba(0,0,0,0.1)',
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
                            <button onClick={enviarPedidoWhatsApp} style={{ 
                                width: '100%', padding: '15px', borderRadius: '12px', background: '#25D366', color: 'white', 
                                border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' 
                            }}>
                                Confirmar Pedido (WhatsApp)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {helpModal.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', position: 'relative' }}>
                        <button onClick={() => setHelpModal({ ...helpModal, open: false })} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        <h2 style={{ marginTop: 0, color: 'var(--rosa-siwa)' }}>{helpModal.title}</h2>
                        <p style={{ lineHeight: '1.6', color: '#666' }}>{helpModal.content}</p>
                        <button onClick={() => setHelpModal({ ...helpModal, open: false })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#333', color: 'white', border: 'none', marginTop: '20px', cursor: 'pointer' }}>Entendido</button>
                    </div>
                </div>
            )}

            <section className="about-section">
                <div className="about-container">
                    <div className="about-visual">
                        <div className="floating-kite">◊</div>
                    </div>
                    <div className="about-text">
                        <h2>Nuestra Historia</h2>
                        <p>
                            En la lengua ancestral <strong>Bribri</strong>, <strong>Siwá</strong> es el viento, el soplo de vida y las historias que viajan con él. 
                            Nuestra tienda virtual en Guápiles nace para ser ese viento fresco que trae lo mejor del mundo para vestir los momentos más importantes de tus hijos.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="main-footer">
                <div className="footer-top">
                    <div className="footer-column brand-col">
                        <div className="siwa-logo-footer" style={{ fontWeight: '900', fontSize: '2rem' }}>Siwá</div>
                        <p>Moda infantil con propósito y raíz.</p>
                    </div>
                    <div className="footer-column">
                        <h4>Categorías</h4>
                        <ul>{['Bebé', 'Niño', 'Niña'].map(c => <li key={c} onClick={() => navTo(c)} style={{ cursor: 'pointer' }}>{c}</li>)}</ul>
                    </div>
                    <div className="footer-column">
                        <h4>Ayuda</h4>
                        <ul>
                            <li onClick={() => openHelp('envios')} style={{ cursor: 'pointer' }}>Envíos</li>
                            <li onClick={() => openHelp('terminos')} style={{ cursor: 'pointer' }}>Términos</li>
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
                        <p className="credit">
                            By <a href="https://wa.me/50661961136" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}><strong>MONTZU</strong></a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
