import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Share, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Story } from "@shared/schema";
import { THEMES } from "@/lib/constants";

interface StoryCardProps {
  story: Story;
  onRead: (storyId: string) => void;
  onPlay: (storyId: string) => void;
  onShare: (storyId: string) => void;
}

export default function StoryCard({ story, onRead, onPlay, onShare }: StoryCardProps) {
  const theme = THEMES.find(t => t.value === story.theme);
  const themeColor = theme?.color || 'story-purple';

  return (
    <Card className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300" data-testid={`story-card-${story.id}`}>
      {/* Story Image Placeholder */}
      <div className={`w-full h-48 bg-gradient-to-br from-${themeColor} to-story-cream flex items-center justify-center`}>
        <div className="text-6xl">
          {theme?.emoji || '📖'}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`bg-${themeColor} text-white`} data-testid="story-theme">
            {theme?.label || story.theme}
          </Badge>
          <span className="text-sm text-gray-500" data-testid="story-date">
            {story.createdAt ? formatDistanceToNow(new Date(story.createdAt), { addSuffix: true }) : ''}
          </span>
        </div>
        
        <h3 className="text-xl font-fredoka text-gray-800 mb-2" data-testid="story-title">
          {story.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2" data-testid="story-preview">
          {story.content.substring(0, 100)}...
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              className="bg-story-purple text-white p-2 rounded-lg hover:bg-opacity-80 transition-all"
              onClick={() => onRead(story.id)}
              data-testid="button-read"
            >
              <BookOpen size={16} />
            </Button>
            <Button
              size="sm"
              className="bg-story-green text-white p-2 rounded-lg hover:bg-opacity-80 transition-all"
              onClick={() => onPlay(story.id)}
              data-testid="button-play"
            >
              <Play size={16} />
            </Button>
            <Button
              size="sm"
              className="bg-story-orange text-white p-2 rounded-lg hover:bg-opacity-80 transition-all"
              onClick={() => onShare(story.id)}
              data-testid="button-share"
            >
              <Share size={16} />
            </Button>
          </div>
          
          {story.readingTime && (
            <div className="flex items-center space-x-1 text-xs text-gray-500" data-testid="reading-time">
              <Clock size={12} />
              <span>{story.readingTime} min read</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
