import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, Coffee } from "lucide-react";
import privateOfficeImage from "@/assets/private-office.jpg";
import meetingRoomImage from "@/assets/meeting-room.jpg";
import dedicatedDeskImage from "@/assets/dedicated-desk.jpg";
import managedOfficeImage from "@/assets/managed-office.jpg";

const services = [
  {
    icon: Building2,
    title: "Private Offices in Pune",
    description: "Fully furnished private office spaces in Pimple Saudagar for teams of all sizes with 24/7 access and premium amenities.",
    image: privateOfficeImage,
  },
  {
    icon: Users,
    title: "Meeting Rooms Pimpri Chinchwad",
    description: "Professional meeting rooms in Pune equipped with the latest technology for presentations and collaborations.",
    image: meetingRoomImage,
  },
  {
    icon: Briefcase,
    title: "Dedicated Desk Pune",
    description: "Your own dedicated desk in our vibrant coworking community in Pimple Saudagar with all the amenities you need.",
    image: dedicatedDeskImage,
  },
  {
    icon: Coffee,
    title: "Hot Desk Coworking Pune",
    description: "Flexible hot desk workspace solutions in Pimpri Chinchwad perfect for freelancers and remote workers.",
    image: privateOfficeImage,
  },
  {
    icon: Building2,
    title: "Managed Office Space Pune",
    description: "Fully managed office solutions in Pimple Saudagar with complete setup, maintenance, and premium services.",
    image: managedOfficeImage,
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Coworking Space Solutions in Pune</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible office space and workspace solutions in Pimple Saudagar, Pimpri Chinchwad tailored for startups, freelancers, and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={`${service.title} - coworking space solution in Pimple Saudagar Pune`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
