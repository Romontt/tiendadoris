import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function LandingPage() {
  const [productos, setProductos] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  const categorias = ['Todos', 'Bebé', 'Niño', 'Niña', 'Hombre', 'Mujer'];

  useEffect(() => {
    fetchProductos();
  }, [categoriaActual]);

  async function fetchProductos() {
    setCargando(true);
    let query = supabase
      .from('productos')
      .select('*')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (categoriaActual !== 'Todos') {
      query = query.eq('categoria', categoriaActual);
    }

    const { data, error } = await query;
    if (!error) setProductos(data);
    setCargando(false);
  }

  return (
    <div style={styles.pageWrapper}>
      
      {/* --- NAVBAR EXCLUSIVO --- */}
      <nav style={styles.nav}>
        <div style={styles.logo}>LA AMERICANA DE DORIS</div>
        <div style={styles.menu}>
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCategoriaActual(cat)}
              style={{
                ...styles.navButton,
                opacity: categoriaActual === cat ? 1 : 0.5,
                fontWeight: categoriaActual === cat ? '600' : '300'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* --- HERO EDITORIAL --- */}
      <header style={styles.hero}>
        <span style={styles.heroLabel}>Colección 2026</span>
        <h1 style={styles.heroTitle}>Tesoros con Historia</h1>
        <p style={styles.heroSubtitle}>Curaduría de ropa americana seleccionada pieza por pieza.</p>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.categoryTitle}>
            {categoriaActual === 'Todos' ? 'Novedades' : categoriaActual}
          </h2>
          <div style={styles.divider}></div>
        </div>

        {cargando ? (
          <div style={styles.loadingContainer}>
            <p>Explorando el archivo...</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {productos.map(prod => (
              <div key={prod.id} style={styles.card}>
                <div style={styles.imageWrapper}>
                  <img src={prod.imagen_url} alt={prod.nombre} style={styles.image} />
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.prodName}>{prod.nombre}</h3>
                  <p style={styles.price}>₡{prod.precio.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>GUÁPILES • COSTA RICA</p>
        <p style={styles.footerSub}>Piezas únicas con propósito.</p>
      </footer>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#ffffff', // Blanco puro para exclusividad
    minHeight: '100vh',
    fontFamily: '"Montserrat", sans-serif',
    color: '#000'
  },
  nav: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f2f2f2',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    letterSpacing: '4px',
    marginBottom: '20px',
    fontFamily: '"Playfair Display", serif'
  },
  menu: {
    display: 'flex',
    gap: '30px',
    justifyContent: 'center',
    textTransform: 'uppercase'
  },
  navButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.7rem',
    letterSpacing: '2px',
    transition: '0.3s'
  },
  hero: {
    padding: '120px 20px',
    textAlign: 'center',
    backgroundColor: '#fff'
  },
  heroLabel: {
    fontSize: '0.7rem',
    letterSpacing: '5px',
    textTransform: 'uppercase',
    color: '#d46a4e',
    display: 'block',
    marginBottom: '15px'
  },
  heroTitle: {
    fontSize: '4rem',
    fontFamily: '"Playfair Display", serif',
    fontWeight: '400',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1
  },
  heroSubtitle: {
    fontSize: '1rem',
    fontWeight: '300',
    color: '#666',
    marginTop: '20px',
    letterSpacing: '1px'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px 100px 40px'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: '6px',
    marginBottom: '15px'
  },
  divider: {
    width: '40px',
    height: '1px',
    backgroundColor: '#d46a4e',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '60px'
  },
  card: {
    cursor: 'pointer'
  },
  imageWrapper: {
    aspectRatio: '3/4',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cardInfo: {
    textAlign: 'center'
  },
  prodName: {
    fontSize: '1rem',
    fontWeight: '400',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  price: {
    fontSize: '0.9rem',
    color: '#d46a4e',
    fontWeight: '600'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '100px 0',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontSize: '0.8rem'
  },
  footer: {
    padding: '80px 20px',
    borderTop: '1px solid #f2f2f2',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '0.8rem',
    letterSpacing: '4px',
    fontWeight: '600'
  },
  footerSub: {
    fontSize: '0.7rem',
    color: '#999',
    marginTop: '10px'
  }
};
