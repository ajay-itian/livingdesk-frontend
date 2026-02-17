import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import privateOfficeImage from "@/assets/private-office.webp";
import meetingRoomImage from "@/assets/meeting-room.webp";
import dedicatedDeskImage from "@/assets/dedicated-desk.webp";
import VTPAltitude from '@/assets/VTP/VTP_Altitude.webp';

// Define interface for Service item (optional if using TypeScript)
interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  image: string;
  path?: string; // Optional path property
}

const services: ServiceItem[] = [
  {
    icon: Building2,
    title: "Private Offices",
    description: "Fully furnished private office spaces for teams of all sizes with 24/7 access and premium amenities.",
    image: privateOfficeImage,
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description: "Professional meeting rooms equipped with the latest technology for presentations and collaborations.",
    image: meetingRoomImage,
  },
  {
    icon: Briefcase,
    title: "Dedicated Desks",
    description: "Your own dedicated desk in our vibrant coworking community with all the amenities you need.",
    image: dedicatedDeskImage,
  },
  {
    icon: Coffee,
    title: "Hot Desks",
    description: "Flexible hot desk workspace solutions perfect for freelancers and remote workers.",
    image: privateOfficeImage,
  },
  {
    icon: Building2,
    title: "Managed Office",
    description: "Fully managed office solutions with complete setup, maintenance, and premium services.",
    image: VTPAltitude,
    path: "/managed-offices", // 2. Add the path here
  },
];

const Services = () => {
  const navigate = useNavigate(); // 3. Initialize hook

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Our Workspace Solutions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible office space and workspace solutions tailored for startups, freelancers, and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              // 4. Handle click navigation
              onClick={() => service.path && navigate(service.path)}
              className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${service.path ? "cursor-pointer hover:ring-2 ring-primary/50" : ""
                }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={`${service.title} - coworking space solution in Pimple Saudagar Pune`}
                  loading="lazy"
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