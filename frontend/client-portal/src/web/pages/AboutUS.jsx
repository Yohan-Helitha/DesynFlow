import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FaUsers, FaAward, FaHandshake, FaStar, FaPaintBrush, FaChalkboardTeacher } from 'react-icons/fa';
export const AboutUs = () => {
  // Animation controls for sections that animate when scrolled into view
  const fadeInUpControls = useAnimation();
  const [fadeInUpRef, fadeInUpInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  useEffect(() => {
    if (fadeInUpInView) {
      fadeInUpControls.start('visible');
    }
  }, [fadeInUpControls, fadeInUpInView]);
  const fadeInUpVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };
  const staggerChildrenVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const teamMembers = [{
    name: 'Alexandra Reynolds',
    role: 'Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'With over 15 years of experience in luxury interior design, Alexandra founded Interiora with a vision to revolutionize how clients experience the design process.'
  }, {
    name: 'Marcus Chen',
    role: 'Lead Designer',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    bio: 'Marcus brings his architectural background and minimalist aesthetic to create spaces that are both functional and visually striking.'
  }, {
    name: 'Sophia Williams',
    role: 'Project Manager',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    bio: 'Sophia ensures that every project runs smoothly from concept to completion, with meticulous attention to timelines and client satisfaction.'
  }, {
    name: 'James Rodriguez',
    role: '3D Visualization Specialist',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'James creates stunning 3D visualizations that allow clients to experience their space before a single renovation begins.'
  }];
  const values = [{
    icon: <FaAward className="w-8 h-8 text-brown-primary-500" />,
    title: 'Excellence',
    description: 'We strive for perfection in every detail, from concept to completion.'
  }, {
    icon: <FaHandshake className="w-8 h-8 text-brown-primary-500" />,
    title: 'Collaboration',
    description: 'We believe in working closely with our clients to bring their vision to life.'
  }, {
    icon: <FaStar className="w-8 h-8 text-brown-primary-500" />,
    title: 'Innovation',
    description: 'We continuously explore new technologies and design approaches.'
  }, {
    icon: <FaPaintBrush className="w-8 h-8 text-brown-primary-500" />,
    title: 'Creativity',
    description: 'We approach each project with fresh ideas and unique perspectives.'
  }, {
    icon: <FaChalkboardTeacher className="w-8 h-8 text-brown-primary-500" />,
    title: 'Transparency',
    description: 'We maintain clear communication throughout the design process.'
  }, {
    icon: <FaUsers className="w-8 h-8 text-brown-primary-500" />,
    title: 'Client-Centered',
    description: 'Your satisfaction and comfort are at the heart of everything we do.'
  }];
  return <div className="min-h-screen bg-cream">
      <Header />
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-brown-primary-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brown-primary-800/90 to-brown-primary-700/90"></div>
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" alt="About Us background" className="w-full h-full object-cover opacity-30" />
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
              About Interiora
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
              Transforming spaces and elevating experiences through thoughtful
              design
            </motion.p>
          </div>
        </div>
      </section>
      {/* Our Story Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            x: -30
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.3
          }}>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1400&auto=format&fit=crop" alt="Our studio" className="rounded-lg shadow-xl" />
                <div className="absolute -bottom-10 -right-10 hidden md:block">
                  <img src="https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?q=80&w=600&auto=format&fit=crop" alt="Design details" className="w-48 h-48 object-cover rounded-lg shadow-xl border-4 border-cream" />
                </div>
              </div>
            </motion.div>
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            x: 30
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.5
          }}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-brown-secondary-600">
                <p>
                  Founded in 2010, Interiora began with a simple yet powerful
                  vision: to transform how people experience interior design. We
                  recognized that traditional design processes often left
                  clients feeling disconnected from the creative journey and
                  uncertain about outcomes.
                </p>
                <p>
                  Our founder, Alexandra Reynolds, combined her passion for
                  design with innovative technology to create a system that
                  brings clients into the heart of the design process. What
                  started as a small studio has grown into a renowned design
                  firm that has transformed hundreds of spaces across the
                  country.
                </p>
                <p>
                  Today, Interiora stands at the forefront of interior design
                  management, offering a seamless blend of artistic vision and
                  technical precision. Our integrated system allows clients to
                  visualize their space, collaborate remotely with our
                  designers, and track every aspect of their project from
                  concept to completion.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="bg-cream-light p-4 rounded-lg flex items-center">
                  <span className="text-4xl font-bold text-brown-primary-600 mr-3">
                    500+
                  </span>
                  <span className="text-brown-secondary-600">
                    Projects Completed
                  </span>
                </div>
                <div className="bg-cream-light p-4 rounded-lg flex items-center">
                  <span className="text-4xl font-bold text-brown-primary-600 mr-3">
                    12
                  </span>
                  <span className="text-brown-secondary-600">
                    Years of Excellence
                  </span>
                </div>
                <div className="bg-cream-light p-4 rounded-lg flex items-center">
                  <span className="text-4xl font-bold text-brown-primary-600 mr-3">
                    98%
                  </span>
                  <span className="text-brown-secondary-600">
                    Client Satisfaction
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Our Mission & Vision */}
      <section className="py-20 bg-cream-light">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              Our Mission & Vision
            </h2>
            <div className="w-24 h-1 bg-brown-primary-500 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div className="bg-cream p-8 rounded-lg shadow-md" ref={fadeInUpRef} animate={fadeInUpControls} initial="hidden" variants={fadeInUpVariants}>
              <div className="w-16 h-16 bg-brown-primary-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-serif font-bold text-brown-primary-600">
                  M
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-brown-secondary-700 mb-4">
                Our Mission
              </h3>
              <p className="text-brown-secondary-600">
                To transform living and working environments through thoughtful
                design that enhances well-being and functionality. We strive to
                make exceptional design accessible and the process transparent,
                collaborative, and enjoyable for our clients.
              </p>
              <p className="text-brown-secondary-600 mt-4">
                We believe that well-designed spaces have the power to
                positively impact how people live, work, and interact. Our
                mission is to harness this power to create environments that
                reflect our clients' identities while improving their daily
                experiences.
              </p>
            </motion.div>
            <motion.div className="bg-cream p-8 rounded-lg shadow-md" ref={fadeInUpRef} animate={fadeInUpControls} initial="hidden" variants={fadeInUpVariants} transition={{
            delay: 0.2
          }}>
              <div className="w-16 h-16 bg-brown-primary-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-serif font-bold text-brown-primary-600">
                  V
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-brown-secondary-700 mb-4">
                Our Vision
              </h3>
              <p className="text-brown-secondary-600">
                To revolutionize the interior design industry by seamlessly
                blending artistic creativity with technological innovation. We
                envision a future where design processes are transparent,
                collaborative, and accessible to all.
              </p>
              <p className="text-brown-secondary-600 mt-4">
                We aim to be the leading force in redefining how people
                experience interior design, setting new standards for client
                involvement, project visualization, and design management across
                the industry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Our Values */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              These principles guide our approach to every project and
              interaction
            </p>
          </div>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerChildrenVariants} initial="hidden" animate="visible">
            {values.map((value, index) => <motion.div key={index} className="bg-cream-light p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow" variants={fadeInUpVariants}>
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-brown-primary-700 mb-3">
                  {value.title}
                </h3>
                <p className="text-brown-secondary-600">{value.description}</p>
              </motion.div>)}
          </motion.div>
        </div>
      </section>
      {/* Our Team */}
      <section className="py-20 bg-brown-secondary-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              The creative minds behind Interiora's innovative designs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => <motion.div key={index} initial={{
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
          }} className="bg-cream rounded-lg overflow-hidden shadow-md group">
                <div className="relative overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-secondary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brown-primary-700">
                    {member.name}
                  </h3>
                  <p className="text-brown-secondary-500 mb-3">{member.role}</p>
                  <p className="text-brown-secondary-600 text-sm">
                    {member.bio}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    {['LinkedIn', 'Instagram', 'Twitter'].map((social, idx) => <a key={idx} href={`https://www.${social.toLowerCase()}.com/`} target="_blank" rel="noopener noreferrer" className="text-brown-secondary-400 hover:text-brown-primary-600 transition-colors">
                        <div className="w-8 h-8 border border-brown-secondary-200 rounded-full flex items-center justify-center hover:border-brown-primary-400">
                          <span className="text-xs">{social[0]}</span>
                        </div>
                      </a>)}
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-brown-primary-700">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-cream mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-lg text-cream-light mb-8">
              Let's collaborate to create environments that inspire and elevate
              your daily experience.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <button className="bg-cream text-brown-primary-700 px-8 py-3 rounded-md hover:bg-cream-light transition-colors text-lg font-medium">
                Contact Our Team
              </button>
              <button className="bg-transparent border-2 border-cream text-cream px-8 py-3 rounded-md hover:bg-cream/10 transition-colors text-lg font-medium">
                View Our Projects
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>;
};