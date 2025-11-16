import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, Coffee } from "lucide-react";
import privateOfficeImage from "@/assets/private-office.jpg";
import meetingRoomImage from "@/assets/meeting-room.jpg";
import dedicatedDeskImage from "@/assets/dedicated-desk.jpg";

const services = [
  {
    icon: Building2,
    title: "Private Offices",
    description: "Fully furnished private offices for teams of all sizes with 24/7 access and premium amenities.",
    image: privateOfficeImage,
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description: "Professional meeting spaces equipped with the latest technology for presentations and collaborations.",
    image: meetingRoomImage,
  },
  {
    icon: Briefcase,
    title: "Dedicated Desks",
    description: "Your own dedicated workspace in our vibrant community with all the amenities you need.",
    image: dedicatedDeskImage,
  },
  {
    icon: Coffee,
    title: "Hot Desks",
    description: "Flexible workspace solutions perfect for freelancers and remote workers seeking variety.",
    image: privateOfficeImage,
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Our Workspace Solutions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from a variety of flexible workspace options tailored to your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
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
