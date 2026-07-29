import React from 'react';

const Footer = () => (
  <footer style={{ background: 'var(--color-navy)', color: 'white', width: '100%', padding: '0', margin: '0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', minHeight: '250px', paddingTop: '50px', paddingBottom: '50px', paddingLeft: '120px', paddingRight: '120px', boxSizing: 'border-box' }}>
      {/* Emergency Call Section */}
      <div style={{ flex: 1, minWidth: '350px' }}>
  <div style={{ fontSize: '1.6rem', fontWeight: 500, marginBottom: '20px' }}>Emergency call?</div>
  <div style={{ color: 'var(--color-amber)', fontSize: '3rem', fontWeight: 500, lineHeight: '1.1', marginBottom: '0' }}>110</div>
  <div style={{ color: 'var(--color-amber)', fontSize: '2.2rem', fontWeight: 500, lineHeight: '1.1', marginBottom: '0' }}>0112 422222</div>
  <div style={{ color: 'var(--color-amber)', fontSize: '2.2rem', fontWeight: 500, lineHeight: '1.1', marginBottom: '0' }}>0112 422223</div>
      </div>
      {/* Opening Hours Section */}
      <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: '60px' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 500, marginBottom: '20px' }}>Opening hours:</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0' }}>Daily 06:00 AM to 07:30 PM</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0' }}>Emergency office: 24h</div>
      </div>
      {/* Address Section */}
      <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: '60px' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 500, marginBottom: '20px' }}>Main Fire Station (Head Quarters),</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0' }}>T.B. Jaya Mawatha</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0' }}>Colombo 10</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0' }}>Sri Lanka.</div>
      </div>
    </div>
  </footer>
);

export default Footer;
