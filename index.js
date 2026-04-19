const { useState, useEffect } = React;

function App() {
    const [productos, setProductos] = useState([]);
    const [categoria, setCategoria] = useState('Todos');

    const _supabase = supabase.createClient(
        'https://hvnpkljyoocqdzwdptgt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnBrbGp5b29jcWR6d2RwdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTAxMTQsImV4cCI6MjA5MjE4NjExNH0.-pq3iVzqJsJCyGNXkFPlHSIQeBTrr7i7ptsY6FYjJZ0'
    );

    return (
        <div>
            {/* Nav Superior */}
            <nav className="nav-container">
                <div className="logo">DORIS</div>
                <div className="filter-bar" style={{padding: 0, margin: 0}}>
                    {['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'].map(cat => (
                        <button 
                            key={cat} 
                            className={`filter-btn ${categoria === cat ? 'active' : ''}`}
                            onClick={() => setCategoria(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Encabezado Terciopelo */}
            <header className="hero-velvet">
                <p style={{color: 'var(--dorado-relieve)', letterSpacing: '8px', fontSize: '0.8rem', marginBottom: '20px'}}>EST. 2026</p>
                <h1>Elegancia <i>Reencontrada</i></h1>
                <div className="ornament"></div>
            </header>

            {/* Sección Decorativa Central */}
            <div className="center-piece">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/1014/1014732.png" 
                    className="mannequin-icon" 
                    alt="Decoración"
                    style={{filter: 'sepia(0.5)'}}
                />
                <p style={{
                    fontFamily: 'Cormorant Garamond', 
                    fontStyle: 'italic', 
                    fontSize: '1.5rem',
                    opacity: 0.6
                }}>
                    Próximamente: Una selección exclusiva para ti
                </p>
            </div>

            {/* Espacio para Productos (Cuando tengas ropa) */}
            <main style={{padding: '0 8% 100px', textAlign: 'center'}}>
                <div style={{
                    border: '1px solid rgba(197,160,89,0.3)', 
                    padding: '100px', 
                    borderRadius: '2px'
                }}>
                    <p style={{letterSpacing: '5px', opacity: 0.4}}>EL ESCAPARATE SE ESTÁ PREPARANDO</p>
                </div>
            </main>

            <footer style={{
                textAlign: 'center', 
                padding: '60px', 
                background: 'var(--verde-imperial)', 
                color: 'var(--crema-tapiz)'
            }}>
                <p style={{letterSpacing: '10px', fontSize: '0.7rem'}}>GUÁPILES • COSTA RICA</p>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
