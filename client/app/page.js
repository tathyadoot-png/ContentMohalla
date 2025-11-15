"use client";
import HeroFeaturedSection from "@/components/content/HeroFeaturedSection";
import HomeSections from "@/components/content/HomeSections";
import NotebookLayout from "@/components/content/NotebookLayout";
import HeroSection from "@/components/ui/HeroSection";

export default function Home() {
  return (
    <main className="App min-h-screen">
      <HeroSection />
      
      {/* <HorizontalSection/> */}
      <HomeSections/>
      <HeroFeaturedSection/>
      <NotebookLayout/>
    </main>
  );
}
