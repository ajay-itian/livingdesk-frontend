"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, Coffee } from "lucide-react";

const VTPAltitude = '/images/VTP/VTP_Altitude.webp';
const Cabin1 = '/images/CABIN_1.webp';
const Cabin2 = '/images/CABIN_2.webp';
const Cabin3 = '/images/CABIN_3.webp';
const hot_desk = '/images/hot_desk.webp';

interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  image: string;
  path?: string;
}

const services: ServiceItem[] = [
  {
    icon: Building2,
    title: "Private Offices",
    description: "Fully furnished private office spaces for teams of all sizes with 24/7 access and premium amenities.",
    image: Cabin2,
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description: "Professional meeting rooms equipped with the latest technology for presentations and collaborations.",
    image: Cabin1,
  },
  {
    icon: Briefcase,
    title: "Dedicated Desks",
    description: "Your own dedicated desk in our vibrant coworking community with all the amenities you need.",
    image: Cabin3,
  },
  {
    icon: Coffee,
    title: "Hot Desks",
    description: "Flexible hot desk workspace solutions perfect for freelancers and remote workers.",
    image: hot_desk,
  },
  {
    icon: Building2,
    title: "Managed Office",
    description: "Fully managed office solutions with complete setup, maintenance, and premium services.",
    image: VTPAltitude,
    path: "/managed-office-pune",
  },
];

const Services = () => {
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
          {services.map((service, index) => {
            // Extract the UI into a variable to avoid repeating code
            const CardUI = (
              <Card
                className={`h-full overflow-hidden hover:shadow-lg transition-all duration-300 group ${service.path ? "cursor-pointer hover:ring-2 ring-primary/50" : ""
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
            );

            // If the service has a path, wrap it in Next.js <Link> tag
            if (service.path) {
              return (
                <Link href={service.path} key={index} className="block h-full">
                  {CardUI}
                </Link>
              );
            }

            // Otherwise, render just the Card
            return (
              <div key={index} className="h-full">
                {CardUI}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;