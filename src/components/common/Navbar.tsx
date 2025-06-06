
import { Link, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NavItem = ({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      {children}
    </Link>
  );
};

const roleBasedLinks: Record<UserRole, { label: string; path: string }[]> = {
  farmer: [
    { label: "Dashboard", path: "/dashboard/farmer" },
    { label: "My Questions", path: "/farmer/questions" },
    { label: "Weather", path: "/farmer/weather" },
  ],
  expert: [
    { label: "Dashboard", path: "/dashboard/expert" },
    { label: "Answer Questions", path: "/expert/questions" },
  ],
  vendor: [
    { label: "Dashboard", path: "/dashboard/vendor" },
    { label: "My Warehouses", path: "/vendor/warehouses" },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-krishi-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-krishi-500 to-krishi-700 flex items-center justify-center">
                <span className="text-white font-bold">KS</span>
              </div>
              <span className="text-xl font-bold text-krishi-800">
                Krishi-Samadhan
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {roleBasedLinks[user.role].map((link) => (
                  <NavItem key={link.path} to={link.path}>
                    {link.label}
                  </NavItem>
                ))}
                <div className="px-3 py-1 ml-2 rounded-md bg-muted text-sm font-medium">
                  {user.name} ({user.role})
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavItem to="/login">Login</NavItem>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200">
            <div className="flex flex-col space-y-2 px-2 pt-2 pb-3">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 rounded-md bg-muted text-sm font-medium">
                    {user.name} ({user.role})
                  </div>
                  {roleBasedLinks[user.role].map((link) => (
                    <NavItem
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </NavItem>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavItem to="/login" onClick={closeMenu}>
                    Login
                  </NavItem>
                  <NavItem to="/register" onClick={closeMenu}>
                    Register
                  </NavItem>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
