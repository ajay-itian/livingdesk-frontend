"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Day Pass",
    price: "₹249",
    period: "per day",
    description: "Perfect for occasional visits and trial days",
    features: [
      "Flexible seating",
      "High-speed WiFi",
      "Complimentary beverages",
      "Access during business hours",
      "Community events",
    ],
  },
  {
    name: "Hot Desk",
    price: "₹3,999",
    period: "per month",
    description: "Perfect for freelancers and remote workers",
    features: [
      "Flexible seating",
      "High-speed WiFi",
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
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Flexible Pricing Plans</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your work style and budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period.split(' ')[1]}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={scrollToContact}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

