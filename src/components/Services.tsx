"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Briefcase, Coffee } from "lucide-react";

// ✅ Imagery should reflect the specific keyword for that service
const VTPAltitude = '/images/VTP/VTP_Altitude.webp';
const Cabin2 = '/images/CABIN_1.webp';
const Cabin1 = '/images/CABIN_3_NEW.webp';
const Cabin3 = '/images/CABIN_2_NEW.webp';
const hot_desk = '/images/hot_desk.webp';

interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  image: string;
  alt: string; // ✅ Added specific alt for SEO
  path?: string;
}

const services: ServiceItem[] = [
  {
    icon: Building2,
    title: "Private Offices",
    description: "Secure, fully-furnished, air-conditioned private office cabins in Pimple Saudagar for teams of all sizes with 24/7 access.",
    image: Cabin2,
    alt: "Private office cabins for rent at The Living Desk Pimple Saudagar"
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description: "Professional air-conditioned conference rooms in Pune equipped with high-speed WiFi and AV for seamless presentations.",
    image: Cabin1,
    alt: "Professional meeting and conference rooms at Vision Flora Pune"
  },
  {
    icon: Briefcase,
    title: "Dedicated Desks",
    description: "Your own permanent workspace in a vibrant air-conditioned coworking community, perfect for growing startups.",
    image: Cabin3,
    alt: "Dedicated coworking desk in Pimpri Chinchwad Pune"
  },
  {
    icon: Coffee,
    title: "Hot Desks",
    description: "Flexible, budget-friendly air-conditioned coworking day passes and hot desk solutions for freelancers and remote workers.",
    image: hot_desk,
    alt: "Flexible hot desk workspace solutions in Pune"
  },
  {
    icon: Building2,
    title: "Managed Office",
    description: "Tailor-made, fully managed air-conditioned office spaces in Pune with complete IT support and facility management.",
    image: VTPAltitude,
    alt: "Customized managed office solutions in Pimple Saudagar Pune",
    path: "/managed-office-pune",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* ✅ SEO: H2 contains primary service keyword */}
          <h2 className="text-4xl font-bold mb-4 text-foreground">Workspace Solutions in Pimple Saudagar</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible office space and managed workspace solutions tailored for startups, freelancers, and global businesses.
          </p>
        </div>

        {/* ✅ Optimized Grid: 5 columns on large screens can be tight, ensure readability */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service, index) => {
            const CardUI = (
              <article className="h-full"> {/* ✅ SEO: Changed to <article> for better semantic hierarchy */}
                <Card
                  className={`h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-muted/50 ${service.path ? "cursor-pointer hover:border-primary/50" : ""
                    }`}
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={service.image}
                      alt={service.alt} // ✅ Specific SEO Alt Text
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </article>
            );

            return service.path ? (
              <Link
                href={service.path}
                key={index}
                className="block h-full outline-none focus-visible:ring-2 ring-primary rounded-lg"
                title={`Learn more about ${service.title}`} // ✅ Accessibility title
              >
                {CardUI}
              </Link>
            ) : (
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