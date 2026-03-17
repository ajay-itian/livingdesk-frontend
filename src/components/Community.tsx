"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Users, Calendar, MapPin, Sparkles, Network, BookOpen, Zap, Rocket, Timer
} from "lucide-react";

const Community = () => {
    const [email, setEmail] = useState("");

    const upcomingEvents = [
        {
            title: "Founder's Networking Mixer",
            date: "April 15, 2026",
            time: "5:00 PM - 8:00 PM",
            category: "Networking",
            attendees: 45,
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
            alt: "Entrepreneurs networking at The Living Desk Pimple Saudagar",
            description: "Join fellow founders and startups in Pune for an evening of collaboration and resource sharing."
        }
    ];

    const communityPerks = [
        {
            icon: Network,
            title: "Professional Directory",
            description: "Instant access to a network of 200+ professionals in Pimpri Chinchwad."
        },
        {
            icon: BookOpen,
            title: "Lunch & Learn",
            description: "Weekly skill-sharing sessions led by industry experts in our community."
        },
        {
            icon: Zap,
            title: "Investor Access",
            description: "Monthly pitch opportunities for startups based at our Pune coworking space."
        }
    ];

    const stats = [
        { number: "200+", label: "Active Members" },
        { number: "50+", label: "Tech Startups" },
        { number: "10+", label: "Monthly Events" },
        { number: "15+", label: "Industries" }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 pt-32">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 py-1">
                            <Sparkles className="w-3 h-3 mr-1" />
                            The Vibrant Living Desk Community
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                            The Hub for Innovators <br className="hidden md:block" /> in Pimple Saudagar
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            Join the premier startup community in Pune. Collaborate with 200+ entrepreneurs
                            and scale your business in a workspace designed for connection.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button size="lg" className="px-8 shadow-lg">Join Our Community</Button>
                            <Button size="lg" variant="outline" className="px-8">View Event Calendar</Button>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 bg-primary text-primary-foreground shadow-inner">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-5xl font-bold mb-1">{stat.number}</div>
                                    <div className="text-sm uppercase tracking-widest opacity-80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section id="events" className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Upcoming Events in Pune</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                From networking mixers to technical workshops, stay ahead of the curve.
                            </p>
                        </div>

                        <Tabs defaultValue="all" className="max-w-5xl mx-auto">
                            <TabsList className="flex justify-center mb-10 bg-transparent gap-2">
                                <TabsTrigger value="all" className="rounded-full border data-[state=active]:bg-primary">All Events</TabsTrigger>
                                <TabsTrigger value="networking" className="rounded-full border data-[state=active]:bg-primary">Networking</TabsTrigger>
                                <TabsTrigger value="workshop" className="rounded-full border data-[state=active]:bg-primary">Workshops</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-6">
                                {upcomingEvents.map((event, i) => (
                                    <Card key={i} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-1/3 h-52 md:h-auto overflow-hidden">
                                                <img
                                                    src={event.image}
                                                    alt={event.alt}
                                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="secondary">{event.category}</Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" /> Vision Flora, Pune
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                                                <p className="text-muted-foreground mb-4">{event.description}</p>
                                                <div className="flex items-center gap-6 text-sm font-medium mb-6">
                                                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> {event.date}</span>
                                                    <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-primary" /> {event.attendees} Registered</span>
                                                </div>
                                                <Button className="w-fit">Save My Spot</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>

                {/* Coming Soon Section (Replacing Testimonials) */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <Card className="max-w-4xl mx-auto border-dashed border-2 bg-muted/50 py-12">
                            <CardContent className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Timer className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Member Spotlight Coming Soon</h2>
                                <p className="text-muted-foreground max-w-md mb-8">
                                    We're gathering the success stories of our incredible founders and creators.
                                    Check back soon to see how our community is shaping the future of Pune's tech scene.
                                </p>
                                <Button variant="outline" className="gap-2">
                                    <Rocket className="w-4 h-4" /> Nominate a Member
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section className="py-20 bg-secondary/10">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Exclusive Member Perks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {communityPerks.map((perk, i) => (
                                <div key={i} className="group p-8 rounded-2xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                    <perk.icon className="w-10 h-10 mb-6 text-primary group-hover:text-primary-foreground" />
                                    <h4 className="text-xl font-bold mb-3">{perk.title}</h4>
                                    <p className="opacity-80 leading-relaxed">{perk.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA - Newsletter */}
                <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-4">Never Miss a Connection</h2>
                            <p className="mb-8 opacity-90">Get the monthly calendar of events and startup news in Pimple Saudagar delivered to your inbox.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    className="bg-white text-black h-12"
                                    placeholder="your-email@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button variant="secondary" size="lg" className="h-12 px-8">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Community;