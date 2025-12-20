import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Users,
    Calendar,
    Coffee,
    Lightbulb,
    TrendingUp,
    Award,
    MessageCircle,
    Heart,
    Share2,
    Clock,
    MapPin,
    ArrowRight,
    Sparkles,
    Network,
    BookOpen,
    Zap
} from "lucide-react";

const Community = () => {
    const [email, setEmail] = useState("");

    const upcomingEvents = [
        {
            title: "Startup Pitch Night",
            date: "Dec 28, 2025",
            time: "6:00 PM - 9:00 PM",
            category: "Networking",
            attendees: 45,
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
            description: "Watch innovative startups pitch their ideas. Network with founders and investors."
        },
        {
            title: "Design Thinking Workshop",
            date: "Jan 5, 2026",
            time: "2:00 PM - 5:00 PM",
            category: "Workshop",
            attendees: 30,
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
            description: "Learn design thinking methodologies from industry experts."
        },
        {
            title: "Friday Networking Social",
            date: "Dec 27, 2025",
            time: "5:00 PM - 7:00 PM",
            category: "Social",
            attendees: 60,
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
            description: "Unwind with fellow members over drinks and conversations."
        },
        {
            title: "Digital Marketing Masterclass",
            date: "Jan 10, 2026",
            time: "3:00 PM - 6:00 PM",
            category: "Learning",
            attendees: 25,
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            description: "Master digital marketing strategies for your business growth."
        }
    ];

    const memberStories = [
        {
            name: "Priya Sharma",
            role: "Founder, TechStart",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
            story: "The Living Desk transformed how I work. The collaborative environment helped me grow my startup from an idea to a funded company.",
            likes: 124,
            company: "TechStart Solutions"
        },
        {
            name: "Rajesh Kumar",
            role: "Freelance Designer",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
            story: "I've found my tribe here! The networking events connected me with clients I never would have met otherwise.",
            likes: 89,
            company: "RK Designs"
        },
        {
            name: "Anita Desai",
            role: "Digital Marketer",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
            story: "The community here is incredibly supportive. I've learned so much from fellow members and grown my business exponentially.",
            likes: 156,
            company: "Growth Marketing Co"
        }
    ];

    const communityPerks = [
        {
            icon: Network,
            title: "Member Directory",
            description: "Connect with 200+ professionals across industries"
        },
        {
            icon: Calendar,
            title: "Monthly Events",
            description: "20+ workshops, networking sessions, and social events"
        },
        {
            icon: BookOpen,
            title: "Skill Sharing",
            description: "Learn from members through lunch & learn sessions"
        },
        {
            icon: Zap,
            title: "Collaboration Opportunities",
            description: "Find partners, clients, and team members"
        },
        {
            icon: Coffee,
            title: "Social Spaces",
            description: "Dedicated areas for casual meetings and conversations"
        },
        {
            icon: Award,
            title: "Member Recognition",
            description: "Celebrate achievements and milestones together"
        }
    ];

    const stats = [
        { number: "200+", label: "Active Members" },
        { number: "50+", label: "Companies" },
        { number: "25+", label: "Events/Month" },
        { number: "15+", label: "Industries" }
    ];

    const handleSubscribe = () => {
        if (email) {
            alert(`Thanks for subscribing! We'll send community updates to ${email}`);
            setEmail("");
        }
    };

    const scrollToContact = () => {
        window.location.href = "/#contact";
    };

    const categoryColors: Record<string, string> = {
        Networking: "bg-blue-500",
        Workshop: "bg-purple-500",
        Social: "bg-pink-500",
        Learning: "bg-green-500"
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 pt-32">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Community First
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                                More Than Just a Workspace
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Join a thriving community of entrepreneurs, freelancers, and innovators.
                                Collaborate, learn, and grow together at The Living Desk.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Button size="lg" className="group" onClick={scrollToContact}>
                                    Join Our Community
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => {
                                    const element = document.getElementById('events-section');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    View Events
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 bg-primary text-primary-foreground">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                                    <div className="text-sm md:text-base opacity-90">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Community Perks */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-foreground">Community Benefits</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Unlock exclusive perks and opportunities as a member
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {communityPerks.map((perk, index) => (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                                    <CardHeader>
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                            <perk.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{perk.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">{perk.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section id="events-section" className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-foreground">Upcoming Events</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Never miss an opportunity to learn, network, and grow
                            </p>
                        </div>

                        <Tabs defaultValue="all" className="max-w-6xl mx-auto">
                            <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto mb-8">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="networking">Networking</TabsTrigger>
                                <TabsTrigger value="workshop">Workshops</TabsTrigger>
                                <TabsTrigger value="social">Social</TabsTrigger>
                                <TabsTrigger value="learning">Learning</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-6">
                                {upcomingEvents.map((event, index) => (
                                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="relative h-64 md:h-auto">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Badge className={`absolute top-4 left-4 ${categoryColors[event.category]}`}>
                                                    {event.category}
                                                </Badge>
                                            </div>
                                            <div className="md:col-span-2 p-6">
                                                <CardHeader className="p-0 mb-4">
                                                    <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                                                    <CardDescription className="text-base">{event.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            {event.date}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            {event.time}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="h-4 w-4 mr-2" />
                                                            {event.attendees} attending
                                                        </div>
                                                    </div>
                                                    <Button>
                                                        Register Now
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </CardContent>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </TabsContent>

                            {["networking", "workshop", "social", "learning"].map((category) => (
                                <TabsContent key={category} value={category} className="space-y-6">
                                    {upcomingEvents
                                        .filter(event => event.category.toLowerCase() === category)
                                        .map((event, index) => (
                                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div className="relative h-64 md:h-auto">
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <Badge className={`absolute top-4 left-4 ${categoryColors[event.category]}`}>
                                                            {event.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="md:col-span-2 p-6">
                                                        <CardHeader className="p-0 mb-4">
                                                            <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                                                            <CardDescription className="text-base">{event.description}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="p-0">
                                                            <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                                                                <div className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                    {event.date}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="h-4 w-4 mr-2" />
                                                                    {event.time}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Users className="h-4 w-4 mr-2" />
                                                                    {event.attendees} attending
                                                                </div>
                                                            </div>
                                                            <Button>
                                                                Register Now
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </CardContent>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </section>

                {/* Member Stories */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-foreground">Member Success Stories</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Hear from our community members about their journey
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {memberStories.map((story, index) => (
                                <Card key={index} className="hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center mb-6">
                                            <img
                                                src={story.image}
                                                alt={story.name}
                                                className="w-16 h-16 rounded-full object-cover mr-4"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-lg">{story.name}</h3>
                                                <p className="text-sm text-muted-foreground">{story.role}</p>
                                                <p className="text-xs text-primary">{story.company}</p>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mb-6 leading-relaxed">
                                            "{story.story}"
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                                                <Heart className="h-5 w-5 mr-2" />
                                                {story.likes}
                                            </button>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                                                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                                </button>
                                                <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                                                    <Share2 className="h-5 w-5 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <Sparkles className="w-12 h-12 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-6">Stay Connected</h2>
                            <p className="text-xl mb-8 opacity-90">
                                Subscribe to our community newsletter and never miss an event, workshop, or networking opportunity
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 bg-white text-foreground"
                                />
                                <Button onClick={handleSubscribe} variant="secondary" size="lg">
                                    Subscribe
                                </Button>
                            </div>
                            <p className="text-sm mt-4 opacity-75">
                                Join 500+ members already receiving our updates
                            </p>
                        </div>
                    </div>
                </section>

                {/* Connect Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <Card className="border-2">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-3xl mb-4">Ready to Join Our Community?</CardTitle>
                                    <CardDescription className="text-lg">
                                        Experience the power of collaboration and networking at The Living Desk
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="group">
                                        Schedule a Visit
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button
                                        onClick={() => window.open('https://web.whatsapp.com/send?phone=917066002650&text=Hello!%20I%27m%20interested%20in%20your%20coworking%20space.', '_blank')}
                                        className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                                    >
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        Chat on WhatsApp
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Community;