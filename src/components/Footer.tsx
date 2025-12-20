import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">The Living Desk</h3>
            <p className="text-primary-foreground/80">
              Your premium coworking space for productivity and growth
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Pricing
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>+91 70660 02650</li>
              <li>thelivingdesk@gmail.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/The-Living-Desk-Coworking-Spaces/61580666948052/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/thelivingdesk" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/living-desk/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} The Living Desk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
