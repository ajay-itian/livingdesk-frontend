import { MapPin } from "lucide-react";

const LocateUs = () => {
  return (
    <section id="locate" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Locate Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find us at our convenient location in the heart of the city
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg overflow-hidden shadow-lg mb-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.234!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTInMzkuNyJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Living Desk Location"
            ></iframe>
          </div>

          <div className="bg-card rounded-lg p-8 shadow-sm border">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Our Address</h3>
                <p className="text-muted-foreground text-lg">
                  The Living Desk Coworking Space<br />
                  Mumbai, Maharashtra<br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocateUs;
