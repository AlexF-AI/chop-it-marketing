import type { ReactNode } from 'react';

import Footer from './Footer';
import Nav from './Nav';
import AiChef from './home/AiChef';
import Capture from './home/Capture';
import Download from './home/Download';
import Hero from './home/Hero';
import PlugIn from './home/PlugIn';
import SmartShop from './home/SmartShop';
import Variety from './home/Variety';
import Waste from './home/Waste';

type HomeProps = {
  /** Server-rendered rail of published recipes. */
  recipeRail: ReactNode;
  /** Server-rendered pantry block (reads the guest pantry). */
  pantry: ReactNode;
};

export default function Home({ recipeRail, pantry }: HomeProps) {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {recipeRail}
        <PlugIn />
        <Waste />
        <AiChef />
        <Capture />
        <SmartShop />
        {pantry}
        <Variety />
        <Download />
      </main>
      <Footer />
    </>
  );
}
