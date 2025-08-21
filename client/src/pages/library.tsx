import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StoryCard from "@/components/story-card";
import { Link, useLocation } from "wouter";
import { Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { speechService } from "@/lib/speech";
import type { Story } from "@shared/schema";

export default function Library() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // For now, we'll fetch public stories since we don't have user authentication
  const { data: stories = [], isLoading, error } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
  });

  const handleReadStory = (storyId: string) => {
    setLocation(`/story/${storyId}`);
  };

  const handlePlayStory = async (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    try {
      await speechService.speak(story.content, story.language as 'english' | 'hindi');
      toast({
        title: "Playing Story 🔊",
        description: `Now playing: ${story.title}`,
      });
    } catch (error) {
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareStory = async (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const shareUrl = `${window.location.origin}/story/${storyId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this amazing story: ${story.title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋",
          description: "Story link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Error",
          description: "Unable to copy link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-story-cream to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📚</div>
            <p className="text-xl font-fredoka text-gray-600">Loading your story library...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-story-cream to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-2xl font-fredoka mb-4">Unable to Load Stories</h2>
              <p className="text-gray-600 mb-6">Something went wrong while loading your stories.</p>
              <Button onClick={() => window.location.reload()} className="bg-story-purple text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-story-cream to-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-4xl md:text-5xl font-fredoka text-gray-800" data-testid="page-title">
            My Story Library 📚
          </h1>
          <Link href="/create">
            <Button 
              className="bg-gradient-to-r from-story-purple to-story-pink text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              data-testid="button-create-new"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Create New Story</span>
            </Button>
          </Link>
        </div>
        
        {stories.length === 0 ? (
          <Card className="bg-white rounded-3xl shadow-xl">
            <CardHeader className="bg-gradient-to-r from-story-blue to-story-green p-8 text-white text-center">
              <CardTitle className="text-3xl font-fredoka">No Stories Yet!</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-12">
              <div className="text-8xl mb-8">📖</div>
              <h3 className="text-2xl font-fredoka text-gray-800 mb-4">
                Your story adventure starts here!
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Create your first magical story and watch it come to life with beautiful illustrations and audio.
              </p>
              <Link href="/create">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-story-purple to-story-pink text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
                  data-testid="button-create-first-story"
                >
                  <Plus />
                  <span>Create Your First Story</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onRead={handleReadStory}
                  onPlay={handlePlayStory}
                  onShare={handleShareStory}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/create">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-story-purple to-story-pink text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                  data-testid="button-create-more"
                >
                  <Plus />
                  <span>Create Another Story</span>
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
