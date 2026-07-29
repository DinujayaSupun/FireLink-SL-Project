import React from 'react';

const GallerySection = () => (
  <section className="w-full bg-navy py-16 flex flex-col items-center">
    <h2 className="text-xl font-bold text-white bg-amber px-6 py-2 rounded mb-10 tracking-wide" style={{ letterSpacing: '0.04em' }}>GALLERY</h2>
    <div className="max-w-6xl w-full flex flex-col gap-8 px-4 md:px-0">
      <div className="grid grid-cols-3 gap-6">
        {/* Main large image */}
        <div className="col-span-2 row-span-2">
          <img
            src="/images/fire3.webp"
            alt="Fire truck in front of building"
            className="w-full h-full object-cover rounded-lg shadow-lg"
            style={{ minHeight: '340px', maxHeight: '400px' }}
          />
        </div>
        {/* Top right image */}
        <div>
          <img
            src="/images/soldierwork.jpg"
            alt="Fire station building"
            className="w-full h-full object-cover rounded-lg shadow-lg"
            style={{ minHeight: '160px', maxHeight: '190px' }}
          />
        </div>
        {/* Bottom right image */}
        <div>
          <img
            src="/images/department.webp"
            alt="Firefighters at work"
            className="w-full h-full object-cover rounded-lg shadow-lg"
            style={{ minHeight: '160px', maxHeight: '190px' }}
          />
        </div>
      </div>
  <hr className="w-full border-t-2 border-gray-200 my-8" />
      <div className="flex justify-between items-center mt-0 w-full" style={{ marginTop: '-16px' }}>
        <span className="text-2xl font-bold text-white tracking-wide">SEE ALL</span>
        <button className="bg-amber text-white text-lg font-semibold px-8 py-3 rounded-md shadow hover:bg-amber-dark transition">SEE ALL</button>
      </div>
    </div>
  </section>
);

export default GallerySection;
