import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-coworking.jpg";

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Premium coworking space in Pimple Saudagar Pune with modern workspace and office solutions" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Your Workspace,
              <span className="block text-primary">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Premium coworking spaces with private offices, dedicated desks & meeting rooms. 
              Experience flexible workspace solutions designed for productivity and growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={scrollToContact} className="group">
                Schedule a Tour
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => window.open('https://www.youtube.com/shorts/CSPZWy99wzQ', '_blank')}
              >
                Virtual Tour
              </Button>
            </div>
          </div>
          
          <div className="relative w-full max-w-xs mx-auto">
            <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-[9/16]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/CSPZWy99wzQ"
                title="The Living Desk Virtual Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
