import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { WhyUs } from "@/components/sections/why-us";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <WhyUs />
    </>
  );
}
