import { Activity } from 'lucide-react';

export function Navbar({ currentPage, setCurrentPage }) {
  const navItemClass = (page) => 
    `cursor-pointer text-sm font-medium transition-colors hover:text-primary ${
      currentPage === page ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
    } pb-1`;

  return (
    <nav className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => setCurrentPage('home')}
        >
          <div className="bg-primary p-2 rounded-lg text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Earth<span className="text-primary">Lense</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <span className={navItemClass('home')} onClick={() => setCurrentPage('home')}>Home</span>
          <span className={navItemClass('upload')} onClick={() => setCurrentPage('upload')}>Analyze</span>
          <span className={navItemClass('about')} onClick={() => setCurrentPage('about')}>About</span>
        </div>
        
        <button 
          onClick={() => setCurrentPage('upload')}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Analyze Soil
        </button>
      </div>
    </nav>
  );
}
export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">EarthLense</span>
        </div>
        <p>© {new Date().getFullYear()} EarthLense. Hyperspectral Soil Analysis.</p>
      </div>
    </footer>
  );
}
