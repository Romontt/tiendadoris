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
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    const sessionId = (() => {
        let id = sessionStorage.getItem('siwa_session');
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem('siwa_session', id);
        }
        return id;
    })();

    const trackEvent = async (table, data, gaEventName = null, gaParams = {}) => {
        try {
            await _supabase.from(table).insert([{ ...data, session_id: sessionId }]);
            if (window.gtag) {
                const eventName = gaEventName || table;
                window.gtag('event', eventName, {
                    ...gaParams,
                    session_id: sessionId,
                    custom_path: data.page_path || window.location.pathname
                });
            }
        } catch (e) {
            console.error("Tracking error:", e);
        }
    };

    useEffect(() => {
        const path = cat === 'Todos' ? '/' : `/${cat}`;
        trackEvent('page_views', 
            { page_path: path, user_agent: navigator.userAgent, referrer: document.referrer },
            'page_view', 
            { page_title: `Categoría: ${cat}`, page_location: window.location.href }
        );
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

    const addToCart = (product) => {
        const countInCart = cart.filter(item => item.id === product.id).length;
        if (countInCart === 0) {
            setCart([...cart, { ...product, cartId: Date.now() + Math.random() }]);
            trackEvent('user_clicks', 
                { element_id: 'btn-add-to-cart', click_text: `Añadir: ${product.nombre}`, page_path: window.location.pathname },
                'add_to_cart',
                {
                    currency: 'CRC',
                    value: product.tiene_descuento ? (product.precio_offer || product.precio_oferta) : product.precio,
                    items: [{ item_id: product.id, item_name: product.nombre, item_category: product.categoria }]
                }
            );
        }
    };

    const removeFromCart = (cartId) => {
        const item = cart.find(i => i.cartId === cartId);
        setCart(cart.filter(item => item.cartId !== cartId));
        trackEvent('user_clicks', 
            { element_id: 'btn-remove-cart', click_text: `Remover: ${item?.nombre}`, page_path: window.location.pathname },
            'remove_from_cart',
            { items: [{ item_id: item?.id, item_name: item?.nombre }] }
        );
    };

    const cartTotal = cart.reduce((acc, item) => {
        const precio = item.tiene_descuento ? (item.precio_offer || item.precio_oferta) : item.precio;
        return acc + parseInt(precio);
    }, 0);

    const enviarPedidoWhatsApp = async () => {
        // 1. Guardar en la tabla "ventas" para que aparezca en ventas.html como Pendiente
        try {
            const { error } = await _supabase.from('ventas').insert([
                {
                    productos: cart,
                    total: cartTotal,
                    estado: 'pendiente',
                    session_id: sessionId
                }
            ]);
            if (error) throw error;
        } catch (err) {
            console.error("Error al registrar venta:", err);
            alert("Error al registrar la venta en el sistema.");
            return; // No abrimos WhatsApp si no se pudo registrar
        }

        // 2. Lógica de Seguimiento
        trackEvent('user_clicks', 
            { element_id: 'btn-confirm-whatsapp', click_text: 'Confirmar Pedido WhatsApp', page_path: window.location.pathname },
            'begin_checkout',
            { currency: 'CRC', value: cartTotal, items: cart.map(i => ({ item_id: i.id, item_name: i.nombre })) }
        );

        // 3. Preparar mensaje de WhatsApp
        const mensajeBase = `¡Hola Siwá! 🌬️ Me interesa realizar el siguiente pedido:%0A%0A`;
        const itemsResumen = cart.reduce((acc, item) => {
            const precio = parseInt(item.tiene_descuento ? (item.precio_offer || item.precio_oferta) : item.precio);
            const key = `${item.nombre}-${precio}`;
            if (!acc[key]) {
                acc[key] = { nombre: item.nombre, precio, cantidad: 0 };
            }
            acc[key].cantidad += 1;
            return acc;
        }, {});

        const lista = Object.values(itemsResumen).map(i => 
            `- ${i.cantidad}x ${i.nombre} (₡${i.precio.toLocaleString()})`
        ).join('%0A');

        const totalTexto = `%0A%0A*Total: ₡${cartTotal.toLocaleString()}*%0A_Envío gratis en Guápiles Centro_`;
        
        // 4. Abrir WhatsApp, limpiar carrito y cerrar modal
        window.open(`https://wa.me/50683337497?text=${mensajeBase}${lista}${totalTexto}`);
        setCart([]);
        setIsCartOpen(false);
    };

    const navTo = (nuevaCat) => {
        setCat(nuevaCat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openHelp = (type) => {
        const info = {
            envios: { title: 'Políticas de Envío 🚚', content: 'Realizamos envíos a todo el país vía Correos de Costa Rica. En Guápiles Centro el envío es gratuito. Para el resto del país, el costo se calcula según la zona.' },
            terminos: { title: 'Términos y Condiciones 📄', content: 'Todas nuestras prendas son revisadas cuidadosamente antes del envío para garantizar su calidad. Al ser piezas de talla única, no se realizan cambios ni devoluciones. Una vez confirmada la compra, el artículo se reserva exclusivamente para usted.' }
        };
        trackEvent('user_clicks', 
            { element_id: `help-${type}`, click_text: `Abrir ayuda: ${type}`, page_path: window.location.pathname },
            'view_help_modal',
            { help_type: type }
        );
        setHelpModal({ open: true, ...info[type] });
    };

    const isMobile = window.innerWidth < 768;

    return (
        <div className={`app-container tema-${cat}`} style={{ boxSizing: 'border-box' }}>
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
                            const isAdded = cart.some(c => c.id === item.id);
                            const isBlocked = item.stock <= 0 || isAdded;
                            
                            return (
                                <article key={item.id} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="image-wrapper" 
                                        onClick={() => {
                                            setSelectedImage(item.imagen_url);
                                            trackEvent('user_clicks', {
                                                element_id: 'product-zoom',
                                                click_text: `Zoom: ${item.nombre}`,
                                                page_path: window.location.pathname
                                            }, 'view_item', { items: [{ item_id: item.id, item_name: item.nombre }] });
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
                                        {item.stock === 1 && (
                                            <span style={{
                                                position: 'absolute', bottom: '10px', right: '10px',
                                                background: 'rgba(255,255,255,0.9)', padding: '4px 8px',
                                                borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold',
                                                color: 'var(--rosa-siwa)', zIndex: 2
                                            }}>Única pieza</span>
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
