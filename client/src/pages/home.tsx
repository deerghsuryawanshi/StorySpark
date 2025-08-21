import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  BookOpen, 
  Wand2, 
  Volume2, 
  Globe, 
  Palette, 
  Shield, 
  Share,
  Gift,
  Sparkles 
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Wand2,
      title: "AI Magic",
      description: "Smart AI creates unique stories just for you!",
      color: "from-story-purple to-story-pink"
    },
    {
      icon: Volume2,
      title: "Listen & Learn",
      description: "Turn any story into a bedtime audiobook!",
      color: "from-story-blue to-story-green"
    },
    {
      icon: Globe,
      title: "Two Languages",
      description: "Stories in English & Hindi for everyone!",
      color: "from-story-orange to-story-yellow"
    },
    {
      icon: Palette,
      title: "Beautiful Pictures",
      description: "Every story comes with amazing illustrations!",
      color: "from-story-pink to-story-purple"
    },
    {
      icon: Shield,
      title: "Safe & Fun",
      description: "Only happy, educational stories for kids!",
      color: "from-story-green to-story-blue"
    },
    {
      icon: Share,
      title: "Share Stories",
      description: "Share your favorite tales with family!",
      color: "from-story-yellow to-story-orange"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-story-purple via-story-pink to-story-orange py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-float mb-8">
            <div className="mx-auto w-80 h-60 bg-white/10 rounded-2xl flex items-center justify-center text-8xl">
              📚
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-fredoka text-white mb-6 drop-shadow-lg" data-testid="hero-title">
            Magical Stories for Kids! 
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
            Create personalized, AI-powered stories in English & Hindi. Listen, read, and share amazing adventures! 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create">
              <Button 
                size="lg"
                className="bg-white text-story-purple px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                data-testid="button-create-story"
              >
                <Wand2 />
                <span>Create My Story!</span>
              </Button>
            </Link>
            <Link href="/library">
              <Button 
                size="lg"
                className="bg-story-yellow text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                data-testid="button-listen-stories"
              >
                <Volume2 />
                <span>Listen to Stories</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-fredoka text-center text-gray-800 mb-16" data-testid="features-title">
            Why Kids Love StoryMagic ✨
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`bg-gradient-to-br ${feature.color} p-8 rounded-3xl shadow-xl text-white text-center transform hover:scale-105 transition-all duration-300 border-0`}
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="text-gray-800 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-fredoka mb-4">{feature.title}</h3>
                  <p className="text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Parental Safety Section */}
      <section className="py-20 bg-gradient-to-br from-story-green/10 to-story-blue/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-fredoka text-center text-gray-800 mb-16" data-testid="safety-title">
            Safe & Secure for Kids 🛡️
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="bg-white p-6 rounded-2xl shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-story-green rounded-full flex items-center justify-center">
                      <Shield className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Content Filtering</h3>
                  </div>
                  <p className="text-gray-600">All stories are automatically checked for age-appropriate content. No scary or inappropriate themes allowed!</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white p-6 rounded-2xl shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-story-blue rounded-full flex items-center justify-center">
                      <BookOpen className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Educational Focus</h3>
                  </div>
                  <p className="text-gray-600">Every story includes positive lessons and educational elements to help kids learn while having fun.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white p-6 rounded-2xl shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-story-purple rounded-full flex items-center justify-center">
                      <Palette className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Creative Expression</h3>
                  </div>
                  <p className="text-gray-600">Kids can customize characters and themes to create stories that reflect their interests and imagination.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <div className="w-full h-96 bg-gradient-to-br from-story-cream to-white rounded-3xl shadow-2xl flex items-center justify-center text-9xl">
                👨‍👩‍👧‍👦
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-story-purple via-story-pink to-story-orange">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-fredoka text-white mb-8 drop-shadow-lg" data-testid="cta-title">
            Start Creating Magic Today! 
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed" data-testid="cta-description">
            Join thousands of families creating personalized stories. Free to start, unlimited imagination! 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/create">
              <Button 
                size="lg"
                className="bg-white text-story-purple px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4"
                data-testid="button-create-first-story"
              >
                <Sparkles className="text-2xl" />
                <span>Create Your First Story Free!</span>
              </Button>
            </Link>
            <Button 
              size="lg"
              className="bg-story-yellow text-gray-800 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4"
              data-testid="button-try-premium"
            >
              <Gift className="text-2xl" />
              <span>Try Premium Features</span>
            </Button>
          </div>
          
          <div className="mt-12 text-white/80 text-lg" data-testid="cta-features">
            <p>✨ No credit card required • 🎨 3 free stories • 🔊 Audio included</p>
          </div>
        </div>
      </section>
    </div>
  );
}
