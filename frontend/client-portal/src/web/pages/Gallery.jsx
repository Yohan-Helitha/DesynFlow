import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FaSearch } from 'react-icons/fa';
export const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [animateImages, setAnimateImages] = useState(false);
  useEffect(() => {
    // Start animation after a short delay
    const timer = setTimeout(() => {
      setAnimateImages(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  const categories = [{
    id: 'all',
    name: 'All Projects'
  }, {
    id: 'living-room',
    name: 'Living Room'
  }, {
    id: 'bedroom',
    name: 'Bedroom'
  }, {
    id: 'kitchen',
    name: 'Kitchen'
  }, {
    id: 'bathroom',
    name: 'Bathroom'
  }, {
    id: 'office',
    name: 'Office'
  }];
  const galleryItems = [{
    id: 1,
    category: 'living-room',
    title: 'Modern Minimalist Living Room',
    description: 'Clean lines and neutral tones create a peaceful sanctuary',
    image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1000&auto=format&fit=crop',
    featured: true
  }, {
    id: 2,
    category: 'bedroom',
    title: 'Luxurious Master Bedroom',
    description: 'Elegant retreat with plush textures and ambient lighting',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 3,
    category: 'kitchen',
    title: 'Contemporary Open Kitchen',
    description: 'Functional design with premium materials and appliances',
    image: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 4,
    category: 'bathroom',
    title: 'Spa-Inspired Bathroom',
    description: 'Tranquil space with natural elements and luxury fixtures',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 5,
    category: 'office',
    title: 'Productive Home Office',
    description: 'Ergonomic workspace with thoughtful organization',
    image: 'https://images.unsplash.com/photo-1593476550610-87baa860004a?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 6,
    category: 'living-room',
    title: 'Eclectic Living Space',
    description: 'Bold patterns and vintage accents create a unique atmosphere',
    image: 'https://images.unsplash.com/photo-1618219740975-d40978bb7378?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 7,
    category: 'bedroom',
    title: 'Serene Guest Bedroom',
    description: 'Comfortable and inviting space for visitors',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64b72?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 8,
    category: 'kitchen',
    title: 'Traditional Kitchen Remodel',
    description: 'Classic design with modern functionality',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 9,
    category: 'bathroom',
    title: 'Compact Luxury Bathroom',
    description: 'Small space transformed with high-end materials',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 10,
    category: 'office',
    title: 'Creative Studio Space',
    description: 'Inspiring environment designed for innovation',
    image: 'https://images.unsplash.com/photo-1593476550284-a3d77af49bed?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 11,
    category: 'living-room',
    title: 'Coastal Living Room',
    description: 'Breezy space inspired by seaside elements',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop'
  }, {
    id: 12,
    category: 'bedroom',
    title: 'Mid-Century Modern Bedroom',
    description: 'Retro-inspired design with contemporary comfort',
    image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop'
  }];
  // Filter gallery items based on selected category and search query
  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return <div className="min-h-screen bg-cream">
      <Header />
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-brown-primary-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brown-primary-800/90 to-brown-primary-700/90"></div>
          <img src="https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?q=80&w=2000&auto=format&fit=crop" alt="Gallery background" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7
          }} className="text-4xl md:text-6xl font-serif font-bold text-cream mb-6">
              Our Project Gallery
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            delay: 0.2
          }} className="text-xl text-cream-light mb-8">
              Explore our collection of stunning interior transformations
            </motion.p>
            {/* Search Bar */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            delay: 0.4
          }} className="relative max-w-xl mx-auto">
              <div className="relative">
                <input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full py-3 px-5 pr-12 rounded-full bg-cream/10 text-cream placeholder-cream/60 border border-cream/20 focus:outline-none focus:ring-2 focus:ring-brown-primary-400" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <FaSearch className="w-5 h-5 text-cream/60" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Category Filter */}
      <section className="py-8 bg-cream-light border-b border-brown-primary-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-6 py-2 rounded-full transition-all ${selectedCategory === category.id ? 'bg-brown-primary-600 text-cream shadow-md' : 'bg-cream text-brown-secondary-600 hover:bg-brown-primary-50'}`}>
                {category.name}
              </button>)}
          </div>
        </div>
      </section>
      {/* Gallery Grid */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          {filteredItems.length > 0 ? <>
              {/* Featured Project (if any) */}
              {selectedCategory === 'all' && filteredItems.some(item => item.featured) && <div className="mb-16">
                    {filteredItems.filter(item => item.featured).map(item => <motion.div key={item.id} initial={{
              opacity: 0
            }} animate={{
              opacity: animateImages ? 1 : 0
            }} transition={{
              duration: 0.8
            }} className="relative overflow-hidden rounded-xl shadow-xl">
                          <div className="aspect-w-16 aspect-h-9">
                            <img src={item.image} alt={item.title} className="w-full h-[600px] object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-brown-secondary-900/90 to-transparent flex items-end">
                            <div className="p-8 md:p-12">
                              <span className="bg-brown-primary-600 text-cream text-sm px-3 py-1 rounded-full uppercase tracking-wider">
                                Featured Project
                              </span>
                              <h3 className="text-2xl md:text-3xl font-serif font-bold text-cream mt-3">
                                {item.title}
                              </h3>
                              <p className="text-cream-light mt-2 max-w-2xl">
                                {item.description}
                              </p>
                              <button className="mt-6 bg-cream text-brown-primary-700 px-6 py-2 rounded hover:bg-cream-light transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </motion.div>)}
                  </div>}
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.filter(item => !item.featured || selectedCategory !== 'all').map((item, index) => <motion.div key={item.id} initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: animateImages ? 1 : 0,
              y: animateImages ? 0 : 30
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="aspect-w-4 aspect-h-3">
                        <img src={item.image} alt={item.title} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-brown-secondary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6">
                          <h3 className="text-cream font-medium text-xl">
                            {item.title}
                          </h3>
                          <p className="text-cream-light text-sm mt-1">
                            {item.description}
                          </p>
                          <button className="mt-4 bg-brown-primary-600 text-cream text-sm px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            View Project
                          </button>
                        </div>
                      </div>
                    </motion.div>)}
              </div>
            </> : <div className="text-center py-16">
              <h3 className="text-2xl font-medium text-brown-secondary-600">
                No projects found
              </h3>
              <p className="text-brown-secondary-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-brown-secondary-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brown-secondary-700 mb-4">
              Ready to Start Your Own Project?
            </h2>
            <p className="text-lg text-brown-secondary-600 mb-8">
              Let our team of expert designers bring your vision to life with
              our innovative design management system.
            </p>
            <button className="bg-brown-primary-700 text-cream px-8 py-3 rounded-md hover:bg-brown-primary-800 transition-colors text-lg font-medium">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>;
};