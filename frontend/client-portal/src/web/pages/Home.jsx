import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaLightbulb, FaPhone, FaClock, FaShieldAlt } from 'react-icons/fa';
export const Home = () => {
  const [lightOn, setLightOn] = useState(false);
  useEffect(() => {
    // Trigger the light on effect after a short delay when component mounts
    const timer = setTimeout(() => {
      setLightOn(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  const featureItems = [{
    icon: <FaLightbulb className="w-12 h-12 text-brown-primary-500" />,
    title: '3D Modeling & Design',
    description: "Experience your space before it's built with our detailed 3D modeling services that bring your vision to life."
  }, {
    icon: <FaPhone className="w-12 h-12 text-brown-primary-500" />,
    title: 'Remote Discussions',
    description: 'Collaborate seamlessly with our designers from anywhere in the world through our advanced remote communication tools.'
  }, {
    icon: <FaClock className="w-12 h-12 text-brown-primary-500" />,
    title: 'Live Project Updates',
    description: "Stay informed with real-time updates on your project's progress, milestones, and changes."
  }, {
    icon: <FaShieldAlt className="w-12 h-12 text-brown-primary-500" />,
    title: 'Advanced Warranty Tracking',
    description: 'Never worry about warranties again with our automated tracking system that manages all your product guarantees.'
  }];
  return <div className="min-h-screen bg-cream">
      <Header />
      {/* Hero Section with Light On Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Dark overlay that fades out */}
        <motion.div className="absolute inset-0 bg-brown-secondary-900 z-10" initial={{
        opacity: 1
      }} animate={{
        opacity: lightOn ? 0 : 1
      }} transition={{
        duration: 1.5,
        ease: 'easeInOut'
      }} />
        {/* Background image that brightens */}
        <div className="absolute inset-0 z-0">
          <motion.div className="w-full h-full bg-cover bg-center" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')"
        }} initial={{
          filter: 'brightness(0.1)'
        }} animate={{
          filter: lightOn ? 'brightness(1)' : 'brightness(0.1)'
        }} transition={{
          duration: 2,
          ease: 'easeInOut'
        }} />
        </div>
        {/* Content that slides up */}
        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} animate={{
          opacity: lightOn ? 1 : 0,
          y: lightOn ? 0 : 50
        }} transition={{
          duration: 1,
          delay: 0.5
        }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-6">
              Transform Your Space Into A Masterpiece
            </h1>
            <p className="text-xl text-cream-light mb-8">
              Luxury interior design management system that brings your vision
              to life
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <GetStartedButton />
              <Link to="/gallery" className="bg-transparent border-2 border-cream text-cream px-8 py-3 rounded-md hover:bg-cream/10 transition-colors text-lg font-medium flex items-center justify-center">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-cream-light">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              Our Key Features
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              Discover how our interior design management system revolutionizes
              the way you transform spaces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureItems.map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="bg-cream p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-brown-primary-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-brown-secondary-600">
                  {feature.description}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* Portfolio Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              Our Recent Projects
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              Explore our portfolio of stunning interior transformations that
              showcase our expertise and creativity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=800&auto=format&fit=crop'].map((image, index) => <motion.div key={index} initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-w-4 aspect-h-3">
                  <img src={image} alt={`Interior design project ${index + 1}`} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brown-secondary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6">
                    <h3 className="text-cream font-medium text-xl">
                      Project {index + 1}
                    </h3>
                    <p className="text-cream-light text-sm mt-1">
                      Luxury {index % 2 === 0 ? 'Living Room' : 'Kitchen'}{' '}
                      Design
                    </p>
                  </div>
                </div>
              </motion.div>)}
          </div>
          <div className="text-center mt-12">
            <button className="bg-brown-primary-600 text-cream px-8 py-3 rounded-md hover:bg-brown-primary-700 transition-colors text-lg font-medium">
              View All Projects
            </button>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-brown-secondary-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              Hear from our satisfied clients about their experience working
              with our interior design team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            name: 'Emily Johnson',
            role: 'Homeowner',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
            quote: 'Working with Interiora was a dream. They transformed our house into a home that perfectly reflects our style and personality.'
          }, {
            name: 'Michael Chen',
            role: 'Real Estate Developer',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
            quote: 'The 3D modeling feature saved us countless hours and helped us make confident decisions for our multi-unit development project.'
          }, {
            name: 'Sarah Williams',
            role: 'Restaurant Owner',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
            quote: 'The remote collaboration tools allowed us to work with their team despite being in different cities. The result exceeded our expectations.'
          }].map((testimonial, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.2
          }} viewport={{
            once: true
          }} className="bg-cream p-8 rounded-lg shadow-md flex flex-col">
                <div className="flex-grow">
                  <div className="flex mb-6 items-center">
                    <svg className="w-6 h-6 text-brown-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.039 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                    </svg>
                  </div>
                  <p className="text-brown-secondary-600 mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center mt-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className="font-medium text-brown-primary-700">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-brown-secondary-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-brown-primary-700">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl text-cream-light mb-8">
              Let's collaborate to create the interior of your dreams with our
              innovative design management system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-cream text-brown-primary-700 px-8 py-3 rounded-md hover:bg-cream-light transition-colors text-lg font-medium">
                Schedule Consultation
              </button>
              <button className="bg-transparent border-2 border-cream text-cream px-8 py-3 rounded-md hover:bg-cream/10 transition-colors text-lg font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>;
};

const GetStartedButton = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  return <button onClick={handleClick} className="bg-brown-primary-700 text-cream px-8 py-3 rounded-md hover:bg-brown-primary-800 transition-colors text-lg font-medium">
      Get Started
    </button>;
};