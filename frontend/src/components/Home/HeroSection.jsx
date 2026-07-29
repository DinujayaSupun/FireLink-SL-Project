import React from 'react';
import AboutSection from './AboutSection';
import VisionMissionValuesSection from './VisionMissionValuesSection';
import GallerySection from './GallerySection';
import ResultsVerificationSection from './ResultsVerificationSection';
import Footer from './Footer';
// Import Special Elite font from Google Fonts

const HeroSection = () => {
  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Images - Right side collage */}
        <div className="absolute inset-0 z-0">
          {/* Right side background images - moved down to avoid nav overlap */}
          <div className="absolute right-0 w-3/5 h-full grid grid-cols-2 gap-2 p-4" style={{ top: '80px' }}>
            {/* Top Left - fire1.jpg */}
            <div className="relative rounded-xl overflow-hidden col-span-1 row-span-1">
              <img
                src="/images/fire1.jpg"
                alt="Fire 1"
                className="w-full h-full object-cover"
                style={{ minHeight: '100%', minWidth: '100%' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            {/* Top Middle - fire2.jpeg */}
            <div className="relative rounded-xl overflow-hidden col-span-1 row-span-1">
              <img
                src="/images/fire2.jpeg"
                alt="Fire 2"
                className="w-full h-full object-cover"
                style={{ minHeight: '100%', minWidth: '100%' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            {/* Top Right - empty/overlay */}
            <div className="rounded-xl bg-transparent border border-navy-light col-span-1 row-span-1" />
            {/* Bottom Right - fire4.jpg */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="/images/fire4.jpg"
                alt="Fire 4"
                className="w-full h-full object-cover"
                style={{ minHeight: '100%', minWidth: '100%' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* Navy Blue Background Square - positioned behind text, extending to left edge */}
        <div className="absolute left-0 z-15 bg-gray-800 bg-opacity-95 shadow-2xl backdrop-blur-sm" style={{ top: '200px', width: '750px', height: '520px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}></div>

        {/* Main Heading - extends beyond the box */}
        <div className="relative z-20 w-full flex items-center min-h-screen">
          <div className="ml-12 md:ml-20 lg:ml-28" style={{ marginTop: '210px' }}>
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-left" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {/* Multi-line with smart quotes and colored RUSH IN */}
                <span className="block mb-0 text-white" style={{ fontFamily: 'Special Elite, cursive', fontWeight: '700', fontSize: '6rem', letterSpacing: '0.02em', lineHeight: '1.1', marginBottom: '0' }}>
                  WHEN OTHERS
                </span>
                <span className="block mb-0 text-white" style={{ fontFamily: 'Special Elite, cursive', fontWeight: '700', fontSize: '6rem', letterSpacing: '0.02em', lineHeight: '1.1', marginBottom: '0', marginTop: '0' }}>
                  RUN OUT,
                </span>
                <span className="block mb-0 text-white" style={{ fontFamily: 'Special Elite, cursive', fontWeight: '700', fontSize: '8rem', letterSpacing: '0.02em', lineHeight: '1.1', marginTop: '0' }}>
                  WE <span className="font-extrabold" style={{ color: '#D7263D', fontFamily: 'Special Elite, cursive', fontWeight: '700' }}>RUSH IN</span><span style={{ fontSize: '4rem', verticalAlign: 'middle' }}>. </span>
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>
      <AboutSection />
      <div style={{ background: 'transparent', width: '100%' }}>
        <hr style={{ width: '100%', height: '4px', background: '#D7263D', border: 'none', margin: '0' }} />
      </div>
      <VisionMissionValuesSection />
      <GallerySection />
      <ResultsVerificationSection />
      <Footer />
    </>
  );
};

export default HeroSection;