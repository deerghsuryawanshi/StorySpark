import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGE_GROUPS, THEMES, LANGUAGES } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Wand2, Loader2 } from "lucide-react";

interface CreateStoryForm {
  ageGroup: string;
  theme: string;
  characters: string;
  language: string;
}

export default function CreateStory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState<CreateStoryForm>({
    ageGroup: '',
    theme: '',
    characters: '',
    language: 'english'
  });

  const generateStoryMutation = useMutation({
    mutationFn: async (data: CreateStoryForm) => {
      const charactersArray = data.characters
        .split(',')
        .map(char => char.trim())
        .filter(char => char.length > 0);

      const response = await apiRequest('POST', '/api/stories/generate', {
        ageGroup: data.ageGroup,
        theme: data.theme,
        characters: charactersArray,
        language: data.language,
      });

      return response.json();
    },
    onSuccess: (story) => {
      toast({
        title: "Story Created! 🎉",
        description: "Your magical story is ready to read!",
      });
      setLocation(`/story/${story.id}`);
    },
    onError: (error) => {
      toast({
        title: "Oops! Something went wrong",
        description: error instanceof Error ? error.message : "Failed to create story",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.ageGroup || !form.theme || !form.characters.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the fields to create your story!",
        variant: "destructive",
      });
      return;
    }

    generateStoryMutation.mutate(form);
  };

  const updateForm = (field: keyof CreateStoryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-story-cream to-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-fredoka text-center text-gray-800 mb-16" data-testid="page-title">
          Create Your Perfect Story! 🎨
        </h1>
        
        <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-story-purple to-story-pink p-8 text-white">
            <CardTitle className="text-3xl font-fredoka text-center">Story Creator</CardTitle>
            <p className="text-center text-lg opacity-90">Let's build something magical together!</p>
          </CardHeader>
          
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  {/* Age Group Selection */}
                  <div>
                    <Label className="block text-xl font-bold text-gray-800 mb-4">Choose Age Group:</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {AGE_GROUPS.map((age) => (
                        <Button
                          key={age.value}
                          type="button"
                          variant={form.ageGroup === age.value ? "default" : "outline"}
                          className={`p-4 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                            form.ageGroup === age.value
                              ? 'bg-story-purple text-white'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-story-purple'
                          }`}
                          onClick={() => updateForm('ageGroup', age.value)}
                          data-testid={`age-group-${age.value}`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{age.emoji}</div>
                            <div className="text-sm">{age.label}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <Label className="block text-xl font-bold text-gray-800 mb-4">Pick a Theme:</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map((theme) => (
                        <Button
                          key={theme.value}
                          type="button"
                          variant={form.theme === theme.value ? "default" : "outline"}
                          className={`p-4 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                            form.theme === theme.value
                              ? `bg-${theme.color} text-white`
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-story-purple'
                          }`}
                          onClick={() => updateForm('theme', theme.value)}
                          data-testid={`theme-${theme.value}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{theme.emoji}</span>
                            <span>{theme.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <Label className="block text-xl font-bold text-gray-800 mb-4">Choose Language:</Label>
                    <div className="flex gap-3">
                      {LANGUAGES.map((lang) => (
                        <Button
                          key={lang.value}
                          type="button"
                          variant={form.language === lang.value ? "default" : "outline"}
                          className={`flex-1 p-4 rounded-2xl font-bold transition-all ${
                            form.language === lang.value
                              ? 'bg-story-blue text-white'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-story-blue'
                          }`}
                          onClick={() => updateForm('language', lang.value)}
                          data-testid={`language-${lang.value}`}
                        >
                          {lang.fullLabel}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Character Names */}
                  <div>
                    <Label htmlFor="characters" className="block text-xl font-bold text-gray-800 mb-4">
                      Character Names:
                    </Label>
                    <Input
                      id="characters"
                      type="text"
                      placeholder="Enter character names (e.g., Priya, Max)"
                      value={form.characters}
                      onChange={(e) => updateForm('characters', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-story-purple focus:outline-none transition-all"
                      data-testid="input-characters"
                    />
                    <p className="text-sm text-gray-500 mt-2">Separate multiple names with commas</p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateStoryMutation.isPending}
                    className="w-full bg-gradient-to-r from-story-purple to-story-pink text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                    data-testid="button-generate-story"
                  >
                    {generateStoryMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        <span>Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 />
                        <span>Generate My Story!</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-full h-96 bg-gradient-to-br from-story-cream to-white rounded-3xl shadow-2xl animate-float flex items-center justify-center text-9xl">
                    📖
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
