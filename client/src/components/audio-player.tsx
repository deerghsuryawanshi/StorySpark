import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { speechService } from "@/lib/speech";

interface AudioPlayerProps {
  text: string;
  language: 'english' | 'hindi';
  className?: string;
}

export default function AudioPlayer({ text, language, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    speechService.setStateChangeCallback(setIsPlaying);
    
    return () => {
      speechService.stop();
    };
  }, []);

  const handlePlay = async () => {
    try {
      if (isPlaying) {
        speechService.pause();
      } else if (speechService.playing) {
        speechService.resume();
      } else {
        // Estimate duration based on text length (rough calculation)
        const estimatedDuration = Math.ceil(text.length / 10); // ~10 chars per second
        setDuration(estimatedDuration);
        
        await speechService.speak(text, language);
        setProgress(100);
        setCurrentTime(estimatedDuration);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleStop = () => {
    speechService.stop();
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-story-cream p-6 rounded-2xl ${className}`} data-testid="audio-player">
      <div className="flex items-center space-x-4 mb-4">
        <Button
          onClick={handlePlay}
          className="bg-story-green text-white p-3 rounded-full hover:bg-opacity-80 transition-all"
          data-testid="button-play-pause"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        
        <Button
          onClick={handleStop}
          variant="outline"
          className="p-3 rounded-full"
          data-testid="button-stop"
        >
          <Square size={20} />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-story-green" />
          <span className="text-lg font-bold text-gray-700">Audio Mode</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-story-green animate-pulse' : 'bg-gray-400'}`} />
          
          <div className="flex-1">
            <Progress 
              value={progress} 
              className="h-2"
              data-testid="audio-progress"
            />
          </div>
          
          <span className="text-sm text-gray-600" data-testid="audio-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
