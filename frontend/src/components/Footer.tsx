
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
              Discover your unique style and shop the latest trends.
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
                <Link to="/collections" className="text-muted-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/lookbook/1" className="text-muted-foreground hover:text-primary transition-colors">
                  Lookbooks
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Account</h4>
            <ul className="space-y-3">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="text-muted-foreground hover:text-primary transition-colors">
                      Favorites
                    </Link>
                  </li>
                  <li>
                    <Link to="/past-orders" className="text-muted-foreground hover:text-primary transition-colors">
                      Past Orders
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} FLEXORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
