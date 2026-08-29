
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-2xl font-bold text-primary mb-4 font-display">FLEXORA</h4>
            <p className="text-muted-foreground leading-relaxed">
              Flex your Aura - Your gateway to fashion innovation and student creativity. 
              Discover your unique style and connect with a vibrant community of fashion enthusiasts.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending-looks" className="text-muted-foreground hover:text-primary transition-colors">
                  Trending Looks
                </Link>
              </li>
              <li>
                <Link to="/style-categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Style Categories
                </Link>
              </li>
              <li>
                <Link to="/student-spotlights" className="text-muted-foreground hover:text-primary transition-colors">
                  Student Spotlights
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-muted-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              {/* Login and Sign Up links removed. Use account icon in navigation. */}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Connect</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/submit-design" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Your Design
                </Link>
              </li>
              <li>
                {user ? (
                  <Link to="/join-community" className="text-muted-foreground hover:text-primary transition-colors">
                    Join Community
                  </Link>
                ) : (
                  <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Login to Join Community
                  </Link>
                )}
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; 2025 FLEXORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
