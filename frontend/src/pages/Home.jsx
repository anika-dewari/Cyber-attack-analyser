import React, { useState, useRef ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Features from '../components/Features';
import Contact from '../components/Contact';
import { useLocation } from 'react-router-dom';
import lockImage from '../assets/lockandkey.png';

export default function Home() {
  const navigate = useNavigate(); // ✅ moved here
  const [url, setUrl] = useState('');
  const featuresRef = useRef(null);
  const contactRef = useRef(null);
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/report');
  };

  useEffect(() => {
  if (location.state?.scrollTo === 'features') {
    featuresRef.current.scrollIntoView({ behavior: 'smooth' });
  } else if (location.state?.scrollTo === 'contact') {
    contactRef.current.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [location]);

  return (
    <div className="h-full w-full  relative overflow-x-hidden">
      {/* Background animated glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-600/20 via-teal-600/10 to-purple-700/20 animate-pulse blur-3xl pointer-events-none z-0" />

      <Header
        scrollToFeatures={() => featuresRef.current.scrollIntoView({ behavior: 'smooth' })}
        scrollToContact={() => contactRef.current.scrollIntoView({ behavior: 'smooth' })}
      />

      <main className="min-h-screen w-full flex items-center justify-center py-20 bg-[#0B0B14]">
  <div className="max-w-7xl w-full grid md:grid-cols-2 items-center gap-10">
    {/* Text + Form Section */}
    <div className="space-y-8">
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white  ">
        Welcome to KillSwitch 
      </h1>
      <h1 className="text-3xl md:text-3xl font-bold leading-tight text-white ">
       -Your First Line of Cyber Defense
      </h1>
      <p className="text-lg text-gray-300 max-w-md">
         A Cyber Attack Analyser that scans your website for vulnerabilities and analyzes potential threats in real-time.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block mb-2 text-gray-300 font-medium">
            Enter URL or IP:
          </label>
          <input
            id="url"
            name="url"
            type="text"
            placeholder="e.g., https://yourwebsite.com"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#1a1d24] text-white shadow-inner shadow-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300"
          />
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-cyan-400 to-teal-700 text-[#0f1117] font-extrabold rounded-2xl cursor-pointer shadow-lg shadow-cyan-500/70 hover:from-cyan-300 hover:to-teal-600 hover:scale-105 transition-transform duration-300"
        >
          🚀 Start Scan
        </button>
      </form>
    </div>

    {/* Image or Graphic Placeholder */}
    <div className="w-full flex justify-center items-center">
      <img className="w-[600px] object-contain rounded-xl shadow-xl" src={lockImage} alt="Lock" />
    </div>
  </div>
</main>

        <section ref={featuresRef} className="w-full ">
          <Features />
        </section>

        <section ref={contactRef} className="w-full ">
          <Contact />
        </section>

      <Footer />
    </div>
  );
}
