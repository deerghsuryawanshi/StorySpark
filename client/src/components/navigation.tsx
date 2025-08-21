import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, Home, Plus, Library, Info } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";

interface NavigationProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function Navigation({ currentLanguage, onLanguageChange }: NavigationProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/library", label: "My Stories", icon: Library },
    { href: "/create", label: "Create", icon: Plus },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="logo">
            <div className="w-10 h-10 bg-gradient-to-r from-story-purple to-story-pink rounded-xl flex items-center justify-center">
              <BookOpen className="text-white text-lg" />
            </div>
            <span className="text-2xl font-fredoka text-story-purple">StoryMagic</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link 
                key={href}
                href={href} 
                className={`text-gray-700 hover:text-story-purple transition-colors flex items-center space-x-1 ${
                  location === href ? 'text-story-purple font-semibold' : ''
                }`}
                data-testid={`nav-link-${label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-100 rounded-full p-1" data-testid="language-toggle">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.value}
                  onClick={() => onLanguageChange(lang.value)}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentLanguage === lang.value
                      ? 'bg-story-purple text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid={`language-${lang.value}`}
                >
                  {lang.label}
                </Button>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <Menu />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200" data-testid="mobile-menu">
            <div className="flex flex-col space-y-3">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-story-purple hover:bg-gray-50 rounded-lg transition-colors ${
                    location === href ? 'text-story-purple bg-gray-50 font-semibold' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-nav-link-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
