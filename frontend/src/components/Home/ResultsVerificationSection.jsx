import React from 'react';

const ResultsVerificationSection = () => (
  <section className="w-full bg-white py-20 flex flex-col items-center">
    <img
      src="/images/Verifiedlogo.jpg"
      alt="Verified Seal"
      className="w-48 h-48 object-contain mb-8"
      style={{ maxWidth: '220px' }}
    />
    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      Fire and Rescue Training Program<br />Results Verification
    </h2>
    <button className="bg-amber text-white text-xl font-semibold px-10 py-5 rounded-md shadow hover:bg-amber-dark transition">
      Verify Results
    </button>
  </section>
);

export default ResultsVerificationSection;
