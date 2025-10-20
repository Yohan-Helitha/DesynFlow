import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
export const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };
  const contactInfo = [{
    icon: <FaMapMarkerAlt className="w-6 h-6 text-brown-primary-500" />,
    title: 'Our Location',
    details: ['123 Design Avenue', 'Luxury District, LD 10001']
  }, {
    icon: <FaPhone className="w-6 h-6 text-brown-primary-500" />,
    title: 'Phone Number',
    details: ['+1 (555) 123-4567', '+1 (555) 765-4321']
  }, {
    icon: <FaEnvelope className="w-6 h-6 text-brown-primary-500" />,
    title: 'Email Address',
    details: ['info@interiora.com', 'support@interiora.com']
  }, {
    icon: <FaClock className="w-6 h-6 text-brown-primary-500" />,
    title: 'Working Hours',
    details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM']
  }];
  const supplierRequirements = ['High-quality materials that meet our standards', 'Sustainable and eco-friendly production practices', 'Reliable delivery and consistent stock availability', 'Competitive pricing and flexible payment terms', 'Excellent customer service and support'];
  return <div className="min-h-screen bg-cream">
      <Header />
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-brown-primary-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brown-primary-800/90 to-brown-primary-700/90"></div>
          <img src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2000&auto=format&fit=crop" alt="Contact Us background" className="w-full h-full object-cover opacity-30" />
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
              Contact Us
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
              We'd love to hear from you. Let's start a conversation about your
              design needs.
            </motion.p>
          </div>
        </div>
      </section>
      {/* Contact Information Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="bg-cream-light p-8 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brown-primary-50 rounded-full mb-4">
                  {info.icon}
                </div>
                <h3 className="text-xl font-semibold text-brown-primary-700 mb-3">
                  {info.title}
                </h3>
                {info.details.map((detail, i) => <p key={i} className="text-brown-secondary-600">
                    {detail}
                  </p>)}
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* Contact Form & Map Section */}
      <section className="py-16 bg-cream-light">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8
          }} viewport={{
            once: true
          }}>
              <h2 className="text-3xl font-serif font-bold text-brown-secondary-700 mb-6">
                Send Us a Message
              </h2>
              <p className="text-brown-secondary-600 mb-8">
                Have questions about our interior design services or management
                system? Fill out the form below and our team will get back to
                you as soon as possible.
              </p>
              {submitted ? <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    Thank you for reaching out. We'll respond to your inquiry
                    shortly.
                  </p>
                </div> : <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-brown-secondary-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-md border border-brown-secondary-200 focus:outline-none focus:ring-2 focus:ring-brown-primary-500" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-brown-secondary-700 font-medium mb-2">
                        Email Address
                      </label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-md border border-brown-secondary-200 focus:outline-none focus:ring-2 focus:ring-brown-primary-500" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-brown-secondary-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-brown-secondary-200 focus:outline-none focus:ring-2 focus:ring-brown-primary-500" placeholder="Your phone number" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-brown-secondary-700 font-medium mb-2">
                        Subject
                      </label>
                      <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 rounded-md border border-brown-secondary-200 focus:outline-none focus:ring-2 focus:ring-brown-primary-500 bg-white">
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Design Consultation">
                          Design Consultation
                        </option>
                        <option value="Project Quote">Project Quote</option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Supplier Inquiry">
                          Supplier Inquiry
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-brown-secondary-700 font-medium mb-2">
                      Your Message
                    </label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 rounded-md border border-brown-secondary-200 focus:outline-none focus:ring-2 focus:ring-brown-primary-500" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" disabled={submitting} className={`bg-brown-primary-700 text-cream px-8 py-3 rounded-md hover:bg-brown-primary-800 transition-colors text-lg font-medium w-full ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>}
            </motion.div>
            {/* Map */}
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} viewport={{
            once: true
          }}>
              <div className="h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059353029!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sca!4v1626710777555!5m2!1sen!2sca" width="100%" height="100%" style={{
                border: 0,
                minHeight: '500px'
              }} allowFullScreen loading="lazy" title="Office Location"></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Become a Supplier Section */}
      <section className="py-20 bg-brown-secondary-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7
          }} viewport={{
            once: true
          }}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-secondary-700 mb-4">
                Become a Supplier
              </h2>
              <div className="w-24 h-1 bg-brown-primary-500 mx-auto mb-6"></div>
              <p className="text-lg text-brown-secondary-600 max-w-3xl mx-auto">
                Join our network of premium suppliers and provide high-quality
                materials and products for our interior design projects.
              </p>
            </motion.div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} viewport={{
            once: true
          }}>
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400&auto=format&fit=crop" alt="Supplier materials" className="rounded-lg shadow-xl" />
            </motion.div>
            <motion.div className="lg:w-1/2" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} viewport={{
            once: true
          }}>
              <div className="flex items-center mb-6">
                <FaTruck className="w-8 h-8 text-brown-primary-500 mr-4" />
                <h3 className="text-2xl font-serif font-bold text-brown-secondary-700">
                  Partner With Us
                </h3>
              </div>
              <p className="text-brown-secondary-600 mb-6">
                At Interiora, we're always looking for reliable suppliers who
                share our commitment to quality and excellence. Our supplier
                network is crucial to delivering exceptional interior design
                projects that exceed our clients' expectations.
              </p>
              <h4 className="text-xl font-semibold text-brown-primary-700 mb-4">
                What We Look For
              </h4>
              <ul className="space-y-3 mb-8">
                {supplierRequirements.map((requirement, index) => <li key={index} className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 text-brown-primary-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-brown-secondary-600">
                      {requirement}
                    </span>
                  </li>)}
              </ul>
              <p className="text-brown-secondary-600 mb-8">
                If you believe your products would be a good fit for our
                projects, we'd love to hear from you. Fill out our supplier
                application form and our procurement team will review your
                submission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-brown-primary-700 text-cream px-8 py-3 rounded-md hover:bg-brown-primary-800 transition-colors text-lg font-medium flex items-center justify-center">
                  <FaTruck className="w-5 h-5 mr-2" />
                  Become a Supplier
                </button>
                <Link to="/gallery" className="bg-transparent border-2 border-brown-primary-700 text-brown-primary-700 px-8 py-3 rounded-md hover:bg-brown-primary-50 transition-colors text-lg font-medium flex items-center justify-center">
                  View Our Projects
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-brown-secondary-700 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-brown-secondary-600 max-w-2xl mx-auto">
              Find answers to common questions about our services and processes
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {[{
            question: 'What areas do you serve?',
            answer: 'We currently provide our interior design services in New York City and surrounding areas within a 50-mile radius. For special projects, we can accommodate clients nationwide through our remote design services.'
          }, {
            question: 'How does the initial consultation work?',
            answer: "The initial consultation can be conducted in-person or virtually. During this 60-minute session, we'll discuss your design goals, budget, timeline, and answer any questions you might have about our process. This helps us understand your needs and determine if we're a good fit for your project."
          }, {
            question: 'What is your pricing structure?',
            answer: "Our pricing varies based on the scope and requirements of each project. We offer both hourly rates and flat-fee packages. After the initial consultation, we'll provide a detailed proposal outlining all costs associated with your specific project."
          }, {
            question: 'How long does a typical project take?',
            answer: "Project timelines vary depending on scope and complexity. Small room redesigns may take 4-6 weeks, while full home renovations can take several months. During our consultation, we'll provide an estimated timeline tailored to your specific project."
          }, {
            question: 'How do I become a supplier?',
            answer: "To become a supplier, click the 'Become a Supplier' button above and complete our application form. Our procurement team will review your submission and contact you within 5-7 business days to discuss potential partnership opportunities."
          }].map((faq, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="mb-6">
                <h3 className="text-xl font-semibold text-brown-primary-700 mb-2">
                  {faq.question}
                </h3>
                <p className="text-brown-secondary-600">{faq.answer}</p>
                {index < 4 && <div className="border-b border-brown-secondary-200 mt-6"></div>}
              </motion.div>)}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-brown-primary-700">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-cream mb-4">
              Ready to Start Your Design Journey?
            </h2>
            <p className="text-lg text-cream-light mb-8">
              Whether you're looking to transform your space or join our
              supplier network, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <button className="bg-cream text-brown-primary-700 px-8 py-3 rounded-md hover:bg-cream-light transition-colors text-lg font-medium">
                Schedule Consultation
              </button>
              <Link to="/gallery" className="bg-transparent border-2 border-cream text-cream px-8 py-3 rounded-md hover:bg-cream/10 transition-colors text-lg font-medium">
                View Our Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>;
};