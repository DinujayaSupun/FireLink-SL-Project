import React from 'react';

const AboutSection = () => (
  <section className="w-full bg-white py-16 flex justify-center items-center">
    <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 px-4 md:px-0">
      {/* Image */}
      <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center">
        <img
          src="/images/uniforms.jpg"
          alt="Firefighters in uniform"
          className="rounded-lg shadow-lg object-cover w-full max-w-lg"
        />
      </div>
      {/* Content */}
      <div className="w-full md:w-1/2 flex flex-col items-start">
  <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>A WORD ABOUT US</h2>
        <div className="flex flex-row gap-12 mb-8">
          <div className="flex flex-col items-center text-center">
            {/* Firefighter Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--color-amber)" className="w-12 h-12 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 0c-2.21 0-4 1.79-4 4v2a4 4 0 004 4 4 4 0 004-4V8c0-2.21-1.79-4-4-4zm0 0v2m0 0c-2.21 0-4 1.79-4 4v2a4 4 0 004 4 4 4 0 004-4V8c0-2.21-1.79-4-4-4z" />
            </svg>
            <p className="text-lg text-gray-800 mt-2 text-left" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>We have the most<br />qualified firefighters in<br />the city.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            {/* Emergency Line Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--color-amber)" className="w-12 h-12 mb-2">
              <rect x="6" y="4" width="12" height="16" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h6" />
            </svg>
            <p className="text-lg text-gray-800 mt-2 text-left" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Alert situations? We have<br />a special emergency line<br />to communicate with our<br />department.</p>
          </div>
        </div>
        <button className="bg-amber text-white text-lg font-semibold px-8 py-3 rounded-md shadow hover:bg-amber-dark transition">READ MORE</button>
      </div>
    </div>
  </section>
);

export default AboutSection;
