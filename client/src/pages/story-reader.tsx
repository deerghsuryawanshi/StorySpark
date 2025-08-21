import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/audio-player";
import { ChevronLeft, ChevronRight, Download, Share, Home } from "lucide-react";
import { Link } from "wouter";
import { THEMES } from "@/lib/constants";
import type { Story, StoryPage } from "@shared/schema";

interface StoryWithPages extends Story {
  pages?: StoryPage[];
}

export default function StoryReader() {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(0);

  const { data: story, isLoading, error } = useQuery<StoryWithPages>({
    queryKey: ['/api/stories', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <p className="text-xl font-fredoka text-gray-600">Loading your magical story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-fredoka mb-4">Story Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the story you're looking for.</p>
            <Link href="/">
              <Button className="bg-story-purple text-white">
                <Home className="mr-2" size={16} />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = THEMES.find(t => t.value === story.theme);
  const pages = story.pages || [];
  const totalPages = Math.max(pages.length, 1);
  const hasPages = pages.length > 0;

  const currentContent = hasPages 
    ? pages[currentPage]?.content || story.content
    : story.content;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this amazing story: ${story.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/library">
            <Button variant="outline" className="mb-4">
              <ChevronLeft size={16} className="mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-br from-story-cream to-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Story Header */}
          <CardHeader className="bg-gradient-to-r from-story-purple to-story-pink p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-fredoka mb-2" data-testid="story-title">
                  {story.title}
                </h1>
                <div className="flex items-center space-x-4 flex-wrap">
                  <Badge className="bg-white/20 text-white" data-testid="story-theme">
                    {theme?.emoji} {theme?.label || story.theme}
                  </Badge>
                  <Badge className="bg-white/20 text-white" data-testid="story-age">
                    {story.ageGroup}
                  </Badge>
                  <Badge className="bg-white/20 text-white" data-testid="story-language">
                    {story.language}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  data-testid="button-download"
                >
                  <Download size={20} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  data-testid="button-share"
                >
                  <Share size={20} />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Story Content */}
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Story Illustration */}
                <div className="w-full h-64 bg-gradient-to-br from-story-cream to-gray-100 rounded-2xl shadow-lg flex items-center justify-center text-6xl">
                  {theme?.emoji || '📖'}
                </div>
                
                {/* Audio Player */}
                <AudioPlayer 
                  text={currentContent}
                  language={story.language as 'english' | 'hindi'}
                />
              </div>

              <div className="space-y-6">
                {/* Story Text */}
                <Card className="bg-white rounded-2xl shadow-lg">
                  <CardContent className="p-6">
                    <div 
                      className="text-lg font-comic leading-relaxed text-gray-800 min-h-[200px]"
                      data-testid="story-content"
                    >
                      {currentContent}
                    </div>
                  </CardContent>
                </Card>

                {/* Character List */}
                {story.characters && story.characters.length > 0 && (
                  <Card className="bg-story-cream rounded-2xl">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-700 mb-2">Characters:</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.characters.map((character, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-white text-gray-700"
                            data-testid={`character-${index}`}
                          >
                            {character}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Page Navigation */}
                {hasPages && (
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className="bg-story-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-opacity-80 transition-all flex items-center space-x-2"
                      data-testid="button-previous-page"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </Button>
                    
                    <span className="text-lg font-bold text-gray-600" data-testid="page-indicator">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={nextPage}
                      disabled={currentPage === totalPages - 1}
                      className="bg-story-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-opacity-80 transition-all flex items-center space-x-2"
                      data-testid="button-next-page"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
