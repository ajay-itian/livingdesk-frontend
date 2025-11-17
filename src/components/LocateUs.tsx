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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.9807462977456!2d73.75890919999999!3d18.5921498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9a2c94a9e1d%3A0xe5e8d937f600f662!2sOffice%20607%2C608%2C609%2C%20Vision%20Flora%2C%20Kunal%20Icon%20Rd%2C%20in%20front%20of%20PCMC%20ground%2C%20Siddhivinayak%20Ginger%20Society%2C%20Siddhivinayak%20Ginger%2C%20Pimple%20Saudagar%2C%20Pune%2C%20Pimpri-Chinchwad%2C%20Maharashtra%20411027!5e0!3m2!1sen!2sin!4v1708934400000!5m2!1sen!2sin"
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
                  Office 607, 608, 609, Vision Flora<br />
                  Kunal Icon Rd, in front of PCMC ground<br />
                  Siddhivinayak Ginger Society<br />
                  Pimple Saudagar, Pune<br />
                  Pimpri-Chinchwad, Maharashtra 411027
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
