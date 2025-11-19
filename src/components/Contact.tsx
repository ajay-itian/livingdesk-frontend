import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again or contact us directly.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Get In Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to elevate your work experience? Contact us today for a tour
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form and we'll get back to you shortly</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Tell us about your workspace needs"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Office 607, 608, 609, Vision Flora<br />
                  Kunal Icon Rd, Pimple Saudagar<br />
                  Pune, Maharashtra 411027
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="tel:+917066002650" className="text-muted-foreground hover:text-primary">
                  +91 70660 02650
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:thelivingdesk@gmail.com" className="text-muted-foreground hover:text-primary">
                  thelivingdesk@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Monday - Saturday: 8:00 AM - 10:00 PM</p>
                <p className="text-muted-foreground">Sunday: 10:00 AM - 6:00 PM</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('https://web.whatsapp.com/send?phone=917066002650&text=Hello!%20I%27m%20interested%20in%20your%20coworking%20space.', '_blank')}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </Button>
              
              <Button
                onClick={() => window.open('https://www.google.com/maps/place/Office+607,608,609,+Vision+Flora,+Kunal+Icon+Rd,+in+front+of+PCMC+ground,+Siddhivinayak+Ginger+Society,+Siddhivinayak+Ginger,+Pimple+Saudagar,+Pune,+Pimpri-Chinchwad,+Maharashtra+411027/@18.5921498,73.7589091,17z/data=!4m8!3m7!1s0x3bc2b9a2c94a9e1d:0xe5e8d937f600f662!8m2!3d18.5921498!4d73.758909!9m1!1b1!16s%2Fg%2F11y4g5fwh4?entry=ttu', '_blank')}
                className="w-full"
                variant="outline"
              >
                <Star className="mr-2 h-5 w-5 text-yellow-500 fill-yellow-500" />
                Leave a Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
