"use client";

import { ReviewCard } from "./ReviewCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Rahul Sharma",
    date: "2 weeks ago",
    text: "The Living Desk is by far the best coworking space in Pimple Saudagar. The ambiance is professional, WiFi is blazing fast, and the staff is very supportive. Highly recommended for startups!",
  },
  {
    name: "Sneha Patil",
    date: "1 month ago",
    text: "I've been working from here for 3 months now. The private cabins are spacious and the 24/7 access is a game-changer for my flexible working hours. Great community too.",
  },
  {
    name: "Amit Deshmukh",
    date: "2 months ago",
    text: "Excellent infrastructure! The meeting rooms are well-equipped and the air conditioning is perfect. It's a very productive environment, definitely worth the price.",
  },
];

export const ReviewsCarousel = () => {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-4 text-foreground">What Our Members Say</h2>
            <p className="text-xl text-muted-foreground">
              Don't just take our word for it. Here's what professionals in Pune think about The Living Desk.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="group whitespace-nowrap"
            onClick={() => window.open("https://g.page/r/CWL2APY32ejlEBM/review", "_blank")}
          >
            Read all Google Reviews
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <ReviewCard {...review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
