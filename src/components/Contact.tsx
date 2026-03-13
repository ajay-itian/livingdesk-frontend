"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api"; // Import the shared API client

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use apiClient.post
      // The base URL (/api) is handled automatically. 
      // We just pass the endpoint '/contact/'.
      await apiClient.post('/contact/', formData);

      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });

    } catch (err: any) {
      console.error('Error sending message:', err);

      // Extract specific error message from the backend response if available
      const errorMessage = err.response?.data?.detail || "Failed to send message. Please try again.";
      toast.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev, [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      service: value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Get In Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to book your workspace? Contact us today for a tour of our coworking space
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                {/* Modified Phone Input Section */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    +91
                  </span>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-10" // Added padding to prevent text overlap with +91
                  />
                </div>

                <div>
                  <Label htmlFor="service">Service Interested In</Label>
                  <Select
                    value={formData.service}
                    onValueChange={handleSelectChange}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="Day Pass">Day Pass</SelectItem>
                      <SelectItem value="Hot Desk">Hot Desk</SelectItem>
                      <SelectItem value="Dedicated Desk">Dedicated Desk</SelectItem>
                      <SelectItem value="Small Cabin">Small Cabin</SelectItem>
                      <SelectItem value="Private Office">Private Office</SelectItem>
                      <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                      <SelectItem value="Managed Office">Managed Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Tell us about your workspace needs"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
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
              <CardContent className="flex flex-col space-y-2">
                <a href="tel:+917066002650" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  +91 70660 02650
                </a>
                <a href="tel:+919595910945" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  +91 95959 10945
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
                onClick={() => {
                  const phone = "917066002650"; // Primary number for WhatsApp
                  const msg = "Hello! I'm interested in your coworking space.";
                  const encoded = encodeURIComponent(msg);

                  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                  if (isMobile) {
                    window.location.href = `whatsapp://send?phone=${phone}&text=${encoded}`;
                  } else {
                    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
                  }
                }}
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
