import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, ChevronRight, Calendar, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ApiCategory {
  id: number;
  event_id: string;
  title: string;
  status: string;
  description: string | null;
  position: string;
}

interface ApiEvent {
  id: number;
  title: string;
  status: string;
  description: string | null;
  categories: ApiCategory[];
}

interface EventListResponse {
  success: boolean;
  data: ApiEvent[];
  message: string;
  code: number;
}

const EventPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://admin.printr.store/api/event/list');
        const result: EventListResponse = await response.json();
        
        if (result.success && result.data.length > 0) {
          setEvents(result.data);
        } else {
          toast.error('No events available');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Event Gallery
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Browse through our collection of memorable moments. Select an event to view and download photos.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  {events.length} {events.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No events available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const activeCategories = event.categories.filter(cat => cat.status === 'active');
                
                return (
                  <Card
                    key={event.id}
                    className="group overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer"
                    onClick={() => handleEventClick(event.id)}
                  >
                    {/* Card Image/Icon Section */}
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-12 flex items-center justify-center">
                      <div className="relative">
                        <ImageIcon className="w-20 h-20 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {activeCategories.length}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          <FolderOpen className="w-3 h-3 mr-1" />
                          {activeCategories.length} {activeCategories.length === 1 ? 'Category' : 'Categories'}
                        </Badge>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        View Gallery
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventPage;
