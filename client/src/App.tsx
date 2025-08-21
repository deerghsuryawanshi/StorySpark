import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import CreateStory from "@/pages/create-story";
import StoryReader from "@/pages/story-reader";
import Library from "@/pages/library";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateStory} />
      <Route path="/story/:id" component={StoryReader} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('english');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-story-cream">
          <Navigation 
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
