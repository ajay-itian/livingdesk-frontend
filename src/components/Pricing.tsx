"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const plans = [
  {
    name: "Day Pass",
    price: "₹249",
    period: "per day",
    description: "Perfect for occasional visits and trial days",
    features: [
      "Flexible seating",
      "High-speed WiFi",
      "Air-conditioned workspace",
      "Complimentary beverages",
      "Access during business hours",
      "Community events",
    ],
  },
  {
    name: "Hot Desk",
    price: "₹4,999",
    period: "per month",
    description: "Perfect for freelancers and remote workers",
    features: [
      "Flexible seating",
      "High-speed WiFi",
      "Air-conditioned workspace",
      "Complimentary beverages",
      "Access during business hours",
      "Community events",
    ],
  },
  {
    name: "Dedicated Desk",
    price: "₹5,999",
    period: "per month",
    description: "Your own space in a shared environment",
    features: [
      "Personal desk",
      "24/7 access",
      "High-speed WiFi",
      "Air-conditioned workspace",
      "Complimentary beverages",
      "Storage locker",
      "Mail handling",
      "Community events",
    ],
    popular: true,
  },
  {
    name: "Small Cabin",
    price: "₹20,000",
    period: "per month",
    description: "Perfect private space for small teams (4 persons)",
    features: [
      "Fully furnished cabin",
      "Capacity for 4 people",
      "24/7 access",
      "High-speed WiFi",
      "Air-conditioned workspace",
      "Storage space",
      "Mail handling",
      "Community events",
    ],
  },
  {
    name: "Private Office",
    price: "₹24,999",
    period: "per month",
    description: "Exclusive space for your team (6 persons)",
    features: [
      "Fully furnished office",
      "Capacity for 6 people",
      "24/7 access",
      "High-speed WiFi",
      "Air-conditioned workspace",
      "Meeting room credits",
      "Storage space",
      "Mail handling",
      "Customizable setup",
    ],
  },
];

const Pricing = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground tracking-tight">Flexible Pricing Plans</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your work style and budget
          </p>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on small desktop, 5 on large desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1400px] mx-auto items-stretch">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col relative transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-primary border-2 shadow-lg scale-105 z-10' : 'hover:-translate-y-1'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">/{plan.period.split(' ')[1]}</span>
                  </div>
                </div>
                <CardDescription className="min-h-[40px] mt-2 leading-tight">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? 'shadow-md' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={scrollToContact}
                >
                  {plan.name === "Day Pass" ? "Book Now" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 text-sm flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          Custom enterprise solutions available for teams larger than 10.
        </p>
      </div>
    </section>
  );
};

export default Pricing;