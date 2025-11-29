// app/page.js
'use client';

import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import EmailTemplates from './components/EmailTemplates';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Ticket, Star, Users, Calendar, MapPin, X } from 'lucide-react';

export default function ConcertTicketWebsite() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFreeTicketOpen, setIsFreeTicketOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTicketType, setCurrentTicketType] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(0);

  const ticketTypes = {
    regular: { name: 'Regular', price: 0, color: '#3498db' },
    vip: { name: 'VIP Experience', price: 30000, color: '#e74c3c' },
  };

  const addToCart = (ticketType, quantity) => {
    if (quantity > 0) {
      setCart(prev => {
        const existing = prev.find(item => item.type === ticketType);
        if (existing) {
          return prev.map(item => 
            item.type === ticketType 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { type: ticketType, quantity, ...ticketTypes[ticketType] }];
      });
    }
  };

  const removeFromCart = (ticketType) => {
    setCart(prev => prev.filter(item => item.type !== ticketType));
  };

  const updateCartQuantity = (ticketType, change) => {
    setCart(prev => prev.map(item => 
      item.type === ticketType 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
  if (cart.length === 0) return;
  setIsCartOpen(false);
  
  // Check if it's only regular tickets (free)
  const hasOnlyRegularTickets = cart.every(item => item.type === 'regular');
  const hasVipTickets = cart.some(item => item.type === 'vip');
  
  if (hasOnlyRegularTickets) {
    // Only free tickets - go to free ticket modal
    setIsFreeTicketOpen(true);
  } else if (hasVipTickets) {
    // Has VIP tickets - go to payment modal
    setIsPaymentOpen(true);
  }
};

  const handleDirectFreeTicket = (ticketType, quantity) => {
    setCurrentTicketType(ticketType);
    setCurrentQuantity(quantity);
    setIsFreeTicketOpen(true);
  };

  const generateTicketId = () => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };
const processFreeTicket = async (ticketData, customerInfo, ticketId) => {
  try {
    console.log('🎟️ Processing free ticket reservation...');
    
    // Create ticket object
    const ticket = {
      id: ticketId,
      ticketData,
      customerInfo,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      type: 'free'
    };

    // Save to localStorage (or your backend)
    const existingTickets = JSON.parse(localStorage.getItem('tickets') || '{}');
    existingTickets[ticketId] = ticket;
    localStorage.setItem('tickets', JSON.stringify(existingTickets));
    
    console.log('✅ Free ticket processed successfully:', ticketId);
    return ticket;
    
  } catch (error) {
    console.error('❌ Error processing free ticket:', error);
    throw error;
  }
};

// Also add the createPendingTicket function that's referenced
const createPendingTicket = async (ticketData, customerInfo, ticketId) => {
  try {
    console.log('⏳ Creating pending ticket record...');
    
    // Store the ticket as pending payment
    const pendingTicket = {
      id: ticketId,
      ticketData,
      customerInfo,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      type: 'vip'
    };

    // Save to localStorage or your backend
    const pendingTickets = JSON.parse(localStorage.getItem('pendingTickets') || '{}');
    pendingTickets[ticketId] = pendingTicket;
    localStorage.setItem('pendingTickets', JSON.stringify(pendingTickets));
    
    console.log('✅ Pending ticket created:', ticketId);
    return pendingTicket;
    
  } catch (error) {
    console.error('❌ Error creating pending ticket:', error);
    throw error;
  }
};

// Paystack payment function
const initializePaystackPayment = async (ticketData, customerInfo, ticketId) => {
  try {
    console.log('💳 Initializing Paystack payment...');
    
    // Calculate total amount (convert to kobo for Paystack)
    const totalAmount = ticketData.price * ticketData.quantity;
    const amountInKobo = totalAmount * 100; // Paystack uses kobo

    // Check if Paystack is loaded
    if (typeof window.PaystackPop === 'undefined') {
      throw new Error('Paystack payment service is not available. Please refresh the page.');
    }

    // Create payment data
    const paymentData = {
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: customerInfo.email,
      amount: amountInKobo,
      reference: ticketId,
      metadata: {
        ticket_id: ticketId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone || '',
        ticket_type: ticketData.name,
        ticket_quantity: ticketData.quantity,
        total_amount: totalAmount
      },
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
  // In initializePaystackPayment function, update the callback:
callback: function(response) {
  // This function will be called when payment is successful
  console.log('✅ Payment successful!', response);
  
  if (response.status === 'success') {
    // Send email notifications after successful payment
    sendEmailNotification(ticketData, customerInfo, ticketId, false)
      .then(() => {
        // Remove the ticket from pending status
        const pendingTickets = JSON.parse(localStorage.getItem('pendingTickets') || '{}');
        delete pendingTickets[ticketId];
        localStorage.setItem('pendingTickets', JSON.stringify(pendingTickets));
        
        // Remove from cart
        setCart(prev => prev.filter(item => !(item.type === 'vip' && item.quantity === ticketData.quantity)));
        
        if (window.showFancyNotification) {
          window.showFancyNotification(
            'success', 
            'Payment Successful!', 
            `Your VIP tickets have been confirmed! Check your email for details. Ticket ID: ${ticketId}`
          );
        }
        
        // Close payment modal if it's open
        setIsPaymentOpen(false);
        setCustomerInfo({ email: '', name: '', phone: '' });
      })
      .catch(emailError => {
        console.error('Email sending failed:', emailError);
        if (window.showFancyNotification) {
          window.showFancyNotification(
            'success', 
            'Payment Successful!', 
            `Your VIP tickets are confirmed! Ticket ID: ${ticketId} (Email issue)`
          );
        }
      });
  }
},
      onClose: function() {
        console.log('🔒 Payment window closed');
        if (window.showFancyNotification) {
          window.showFancyNotification(
            'info', 
            'Payment Cancelled', 
            'You can complete your payment later from your cart.'
          );
        }
      }
    };

    // Add this helper function
const processMixedCart = async () => {
  try {
    setIsProcessing(true);
    
    const ticketId = generateTicketId();
    const freeItems = cart.filter(item => item.type === 'regular');
    const vipItems = cart.filter(item => item.type === 'vip');
    
    // Process free tickets immediately
    for (const item of freeItems) {
      const ticketData = {
        type: item.type,
        quantity: item.quantity,
        ...ticketTypes[item.type]
      };
      await sendEmailNotification(ticketData, customerInfo, ticketId, true);
    }
    
    // Process VIP tickets through Paystack
    if (vipItems.length > 0) {
      const vipItem = vipItems[0]; // Take first VIP item for Paystack
      const ticketData = {
        name: vipItem.name,
        price: vipItem.price,
        quantity: vipItem.quantity,
        type: vipItem.type
      };
      
      await initializePaystackPayment(ticketData, customerInfo, ticketId);
    }
    
  } catch (error) {
    console.error('Mixed cart processing error:', error);
    throw error;
  } finally {
    setIsProcessing(false);
  }
};

    // Initialize Paystack payment
    const handler = window.PaystackPop.setup(paymentData);
    handler.openIframe();
    
  } catch (error) {
    console.error('❌ Paystack initialization error:', error);
    
    if (window.showFancyNotification) {
      window.showFancyNotification(
        'error', 
        'Payment Error', 
        'Failed to initialize payment. Please try again.'
      );
    }
    throw error;
  }
};

// Main ticket processing function
const processTicketOrder = async (ticketData, customerInfo, isFree = false) => {
  try {
    console.log('🎫 Processing ticket order...');
    
    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    if (isFree) {
      // Free ticket flow
      console.log('🎟️ Processing free ticket...');
      await processFreeTicket(ticketData, customerInfo, ticketId);
      await sendEmailNotification(ticketData, customerInfo, ticketId, true);
      
      return ticketId;
      
    } else {
      // VIP ticket flow - redirect to Paystack
      console.log('💼 Processing VIP ticket with payment...');
      
      // First, create a temporary ticket record (pending payment)
      await createPendingTicket(ticketData, customerInfo, ticketId);
      
      // Then initialize Paystack payment
      await initializePaystackPayment(ticketData, customerInfo, ticketId);
      
      // Don't return ticketId here since we're redirecting to Paystack
      return null;
    }
    
  } catch (error) {
    console.error('❌ Ticket processing error:', error);
    throw error;
  }
};

  // In your app/page.js - Update the sendEmailNotification function
const sendEmailNotification = async (ticketData, customerInfo, ticketId, isFree = false) => {
  try {
    console.log('🚀 Starting email notification process with real API...');

    // Import your external email templates (make sure the path is correct)
    const { generateCustomerEmail, generateArtistEmail } = await import('./components/EmailTemplates');

    // Prepare data for email templates
    const emailData = {
      id: ticketId,
      type: ticketData.name,
      quantity: ticketData.quantity,
      price: ticketData.price,
      isFree: isFree,
      customerInfo: customerInfo,
      eventName: 'Lloyd Section December Tour',
      eventDate: 'December 25, 2025',
      eventVenue: 'Eko Hotel, Lagos',
      eventTime: '7:00 PM'
    };

    const sendSingleEmail = async (to, subject, html) => {
      console.log(`📨 Sending real email to: ${to}`);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Email API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Email sending failed');
      }

      return result;
    };

    // Send to artist
    console.log('📧 Sending artist notification...');
    try {
      const artistEmailHTML = generateArtistEmail(emailData);
      await sendSingleEmail(
        'mhycienth57@gmail.com',
        `🎵 New ${isFree ? 'Free' : 'VIP'} Ticket Order - ${ticketId}`,
        artistEmailHTML
      );
      console.log('✅ Artist email sent successfully');
    } catch (artistError) {
      console.error('❌ Failed to send artist email:', artistError.message);
      // Continue even if artist email fails
    }

    // Send to customer
    console.log('📧 Sending customer confirmation...');
    const customerEmailHTML = generateCustomerEmail(emailData);
    await sendSingleEmail(
      customerInfo.email,
      `🎟️ Your Ticket Confirmation - Lloyd Section December Tour`,
      customerEmailHTML
    );
    console.log('✅ Customer email sent successfully');
// Success message with fancy notification
if (window.showFancyNotification) {
  window.showFancyNotification(
    'success', 
    'Tickets Confirmed!', 
    `Ticket ID: ${ticketId}. Emails sent to you and the artist!`
  );
}
    console.log('🎉 All emails sent successfully via API!');
    return true;

  } catch (error) {
    console.error('❌ Error in sendEmailNotification:', error);
   // Even if emails fail, the ticket is still confirmed
if (window.showFancyNotification) {
  window.showFancyNotification(
    'success', 
    'Tickets Reserved!', 
    `Ticket ID: ${ticketId}. Email issue but tickets are confirmed.`
  );
}
  }
};

  const processPayment = async () => {
  if (!customerInfo.email || !customerInfo.name) {
    if (window.showFancyNotification) {
      window.showFancyNotification('error', 'Missing Information', 'Please fill in all required fields (name and email)');
    }
    return;
  }

  try {
    setIsProcessing(true);
    
    // Check if there are VIP tickets in cart
    const hasVipTickets = cart.some(item => item.type === 'vip');
    
    if (hasVipTickets) {
      // For VIP tickets, process through Paystack
      console.log('💳 Processing VIP tickets through Paystack...');
      
      // Generate ticket ID for the entire order
      const ticketId = generateTicketId();
      
      // Process each VIP ticket through Paystack
      const vipItems = cart.filter(item => item.type === 'vip');
      
      for (const item of vipItems) {
        const ticketData = {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type
        };
        
        // Initialize Paystack payment for VIP tickets
        await initializePaystackPayment(ticketData, customerInfo, ticketId);
      }
      
    } else 
      {
      // For free tickets only, process directly
      console.log('🎟️ Processing free tickets only...');
      const ticketId = generateTicketId();
      
      for (const item of cart) {
        const ticketData = {
          type: item.type,
          quantity: item.quantity,
          ...ticketTypes[item.type]
        };
        
        await sendEmailNotification(ticketData, customerInfo, ticketId, true);
      }

      // Show success message for free tickets
      if (window.showFancyNotification) {
        window.showFancyNotification(
          'success', 
          'Free Tickets Confirmed!', 
          `Your free tickets have been reserved! Check your email for confirmation.`
        );
      }
      
      // Reset everything
      setCart([]);
      setCustomerInfo({ email: '', name: '', phone: '' });
      setIsPaymentOpen(false);
    }
    
  } catch (error) {
    console.error('Payment error:', error);
    if (window.showFancyNotification) {
      window.showFancyNotification('error', 'Payment Failed', 'There was an issue processing your payment. Please try again.');
    }
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Lloyd Section December Tour | Exclusive Concert Experience</title>
        <meta name="description" content="Join us for an unforgettable musical journey with Lloyd Section this December" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <FancyNotification />
      <Navigation 
        cartCount={totalItems} 
        onCartClick={() => setIsCartOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main>
        <HeroSection onTicketsClick={() => setActiveSection('tickets')} />
        <ArtistSection />
        <TicketSection 
          ticketTypes={ticketTypes} 
          onAddToCart={addToCart}
          onDirectFreeTicket={handleDirectFreeTicket}
        />
        <ConcertDetails />
      </main>

      <Footer />

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateCart={updateCartQuantity}
        onRemoveFromCart={removeFromCart}
        onCheckout={handleCheckout}
        totalAmount={totalAmount}
      />

                  {/* Free Ticket Modal */}
      <FreeTicketModal
        isOpen={isFreeTicketOpen}
        onClose={() => {
          setIsFreeTicketOpen(false);
          setCustomerInfo({ email: '', name: '', phone: '' });
        }}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        ticketType={currentTicketType}
        quantity={currentQuantity}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        processTicketOrder={processTicketOrder}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        cart={cart}
        totalAmount={totalAmount}
        onProcessPayment={processPayment}
        isProcessing={isProcessing}
      />
    </div>
  );
}

// Navigation Component with smooth scrolling
const Navigation = ({ cartCount, onCartClick, activeSection, setActiveSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { id: "home", label: "Home" },
      { id: "artist", label: "Artist" },
      { id: "tickets", label: "Tickets" },
      { id: "details", label: "Details" },
    ],
    []
  );

  const handleNavClick = (sectionId) => {
    setActiveSection?.(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isScrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <h1 className="font-bold text-white text-lg">🎵 Event</h1>

        <ul className="flex gap-6 text-white">
          {navItems.map((item) => (
            <li
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`cursor-pointer hover:text-yellow-400 transition ${
                activeSection === item.id ? "text-yellow-400 font-semibold" : ""
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <button onClick={onCartClick} className="text-white relative">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

// Hero Section with animated elements - SINGLE CORRECT VERSION
const HeroSection = ({ onTicketsClick }) => {
  const particles = useMemo(() => [
    { left: 15, top: 25, duration: 3.2, delay: 0.3 },
    { left: 35, top: 65, duration: 4.1, delay: 1.1 },
    { left: 55, top: 35, duration: 3.8, delay: 0.7 },
    { left: 75, top: 75, duration: 3.5, delay: 1.4 },
    { left: 25, top: 45, duration: 4.2, delay: 0.2 },
    { left: 85, top: 85, duration: 3.9, delay: 1.6 },
    { left: 45, top: 15, duration: 3.6, delay: 0.8 },
    { left: 65, top: 55, duration: 4.0, delay: 1.2 },
    { left: 5, top: 95, duration: 3.3, delay: 0.9 },
    { left: 95, top: 5, duration: 4.3, delay: 0.4 },
  ], []);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#e74c3c] rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white px-6">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          SECTION
          CLUB
          <motion.span
            className="block text-[#e74c3c]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            TOUR
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          An Extraordinary evening with LLOYD SECTION
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center space-x-2">
              <Calendar size={20} />
              <span>December 25, 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={20} />
              <span>Lagos, Nigeria</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTicketsClick}
            className="bg-[#e74c3c] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            GET TICKETS
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

// Artist Section with interactive elements
const ArtistSection = () => (
  <section id="artist" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">MY WORLD</h2>
          
        <h5 className="text-1xl md:text-2xl font-bold text-gray-900 mb-4">Built by Vision, Powered by Purpose.</h5>

        <div className="w-20 h-1 bg-[#e74c3c] mx-auto"></div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
<div className="aspect-square bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
  <div className="w-full h-full flex items-center justify-center">
        <Image
      src="/lloyd.jpg"
      alt="Lloyd Section"
      width={400}
      height={400}
      className="object-cover w-full h-full"
    />
  </div>
</div>
          
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#e74c3c]"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#e74c3c]"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-gray-900">LLOYD SECTION </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            
            Lloyd Section is a Nigerian artist, songwriter, and performer known for his distinctive sound 
            and bold creative direction in contemporary music. He began pursuing music professionally in 2015 and 
            has since evolved into a more intentional and refined artist. Lloyd runs his own record label, 
            Section Music Group, through which he continues to build his brand and expand his influence.
             
            </p>   
            <p className="text-lg text-gray-600 leading-relaxed">
            His debut single, <span className="font-bold text-gray-900"> “Marcopolo” </span> featuring Magnito, was released in October 2020 and is available on all 
            major music platforms. Lloyd further solidified his presence with hit songs like  
            <span className="font-bold text-gray-900"> “Thanksgiving” </span> from his <span className="font-bold text-gray-900"> GANGSHIT </span> album a track that sparked one of Africa’s biggest Instagram giveaways, 
            earning massive attention and engagement across the continent.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="text-center p-4 border-2 border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-[#e74c3c]">5M+</div>
              <div className="text-gray-600">Streams</div>
            </div>
            <div className="text-center p-4 border-2 border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-[#e74c3c]">50+</div>
              <div className="text-gray-600">Shows</div>
            </div>
            <div className="text-center p-4 border-2 border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-[#e74c3c]">3</div>
              <div className="text-gray-600">Awards</div>
            </div>
            <div className="text-center p-4 border-2 border-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-[#e74c3c]">5</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Ticket Section with smaller cards matching hero colors
const TicketSection = ({ ticketTypes, onAddToCart, onDirectFreeTicket }) => {
  const TicketCard = ({ type, data, onAddToCart, onDirectFreeTicket }) => {
    const [quantity, setQuantity] = useState(0);

    const updateQuantity = (change) => {
      setQuantity(prev => Math.max(0, prev + change));
    };

 const handleAdd = () => {
  if (quantity === 0) return;

  if (type === 'regular' && data.price === 0) {
    // For free tickets, go directly to customer info
    onDirectFreeTicket(type, quantity);
  } else {
    // For paid tickets, add to cart
    onAddToCart(type, quantity);
    setQuantity(0);
    
    // Show notification for VIP tickets added to cart
    if (type === 'vip' && window.showFancyNotification) {
      window.showFancyNotification(
        'success',
        'VIP Tickets Added',
        `${quantity} VIP ticket(s) added to cart. Proceed to checkout to complete payment.`
      );
    }
  }
};

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
        className="relative overflow-hidden rounded-2xl shadow-xl group p-6 text-white max-w-sm mx-auto"
      >
        {/* Background matching hero section */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-black opacity-95 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Accent border */}
        <div className="absolute inset-0 border-2 border-[#e74c3c] rounded-2xl opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="px-3 py-1 bg-[#e74c3c] rounded-full border border-white/30"
            >
              <span className="font-bold text-xs uppercase tracking-wider">
                {data.name}
              </span>
            </motion.div>

            {type === "vip" && (
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                className="px-2 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold animate-pulse"
              >
                PREMIUM
              </motion.div>
            )}

            {type === "regular" && data.price === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse"
              >
                FREE
              </motion.div>
            )}
          </div>

          {/* Price */}
          <motion.div className="text-center mb-6" whileHover={{ scale: 1.05 }}>
            <div className="text-4xl font-black mb-1 drop-shadow-lg">
              {data.price === 0 ? 'FREE' : `₦${data.price.toLocaleString()}`}
            </div>
            <div className="text-white/80 text-xs">PER PERSON</div>
          </motion.div>

          {/* Features List - Compact */}
          <div className="space-y-3 mb-6">
            <motion.div
              className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm"
              whileHover={{ x: 3 }}
            >
              <div className="w-2 h-2 bg-[#e74c3c] rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Premium concert access</span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm"
              whileHover={{ x: 3 }}
            >
              <div className="w-2 h-2 bg-[#e74c3c] rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Digital concert booklet</span>
            </motion.div>

            {type === "regular" && (
              <>
                <motion.div
                  className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 3 }}
                >
                  <div className="w-2 h-2 bg-[#e74c3c] rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">General admission</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2 p-2 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-400/30"
                  whileHover={{ x: 3, scale: 1.02 }}
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                  </div>
                  <span className="font-bold text-sm">Completely Free</span>
                </motion.div>
              </>
            )}

            {type === "vip" && (
              <>
                <motion.div
                  className="flex items-center space-x-2 p-2 bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-400/30"
                  whileHover={{ x: 3, scale: 1.02 }}
                >
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 bg-yellow-200 rounded-full"></div>
                  </div>
                  <span className="font-bold text-sm">VIP lounge access</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2 p-2 bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-400/30"
                  whileHover={{ x: 3, scale: 1.02 }}
                >
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 bg-yellow-200 rounded-full"></div>
                  </div>
                  <span className="font-bold text-sm">Front row seating</span>
                </motion.div>
              </>
            )}
          </div>

          {/* Quantity Selector - Compact */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">Quantity:</div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(-1)}
                  className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  disabled={quantity === 0}
                >
                  <span className="text-lg font-bold">-</span>
                </motion.button>

                <motion.span
                  key={quantity}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-black w-8 text-center"
                >
                  {quantity}
                </motion.span>

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(1)}
                  className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-lg font-bold">+</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{
              scale: quantity > 0 ? 1.05 : 1,
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
            }}
            whileTap={{ scale: quantity > 0 ? 0.95 : 1 }}
            onClick={handleAdd}
            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 transform ${
              quantity > 0
                ? type === 'regular' 
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-[#e74c3c] text-white shadow-lg"
                : "bg-white/20 text-white/60 border-2 border-white/30"
            }`}
            disabled={quantity === 0}
          >
            {quantity > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <span>
                  {type === 'regular' && data.price === 0 ? 'GET FREE TICKETS' : `ADD ${quantity} TO CART`}
                </span>
              </motion.span>
            ) : (
              "SELECT QUANTITY"
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="tickets" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ scale: 0.5 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            TICKET OPTIONS
          </motion.h2>
          <div className="w-20 h-1 bg-[#e74c3c] mx-auto mb-6"></div>

          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choose your experience and join us for an unforgettable night with Lloyd Section
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(ticketTypes).map(([type, data]) => (
            <TicketCard 
              key={type} 
              type={type} 
              data={data} 
              onAddToCart={onAddToCart}
              onDirectFreeTicket={onDirectFreeTicket}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 bg-gray-50 rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto"
        >
          <p className="text-gray-600 text-lg font-medium">
            🔥 Limited tickets available • Don&apos;t miss out on this exclusive experience
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Concert Details Section
const ConcertDetails = () => (
  <section id="details" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">CONCERT DETAILS</h2>
        <div className="w-20 h-1 bg-[#e74c3c] mx-auto"></div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center p-6"
        >
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={24} />
          </div>
          <h3 className="text-xl text-gray-700 font-bold mb-2">Date & Time</h3>
          <p className="text-gray-600">December 25, 2025</p>
          <p className="text-gray-600">7:00 PM - till Dawn</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center p-6"
        >
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-white" size={24} />
          </div>
          <h3 className="text-xl text-gray-700 font-bold mb-2">Venue</h3>
          <p className="text-gray-600">Lagos, Nigeria</p>
          <p className="text-gray-600">Eko Hotel</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center p-6"
        >
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={24} />
          </div>
          <h3 className="text-xl text-gray-700 font-bold mb-2">Capacity</h3>
          <p className="text-gray-600">Limited Seating</p>
          <p className="text-gray-600">1000 Guests Only</p>
        </motion.div>
      </div>
    </div>
  </section>
);

// Cart Modal Component
const CartModal = ({ isOpen, onClose, cart, onUpdateCart, onRemoveFromCart, onCheckout, totalAmount }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 text-gray-500 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl text-gray-500 font-bold">Your Cart</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Ticket size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-2">Add some tickets to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <motion.div
                        key={item.type}
                        layout
                        className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <button
                              onClick={() => onRemoveFromCart(item.type)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm">₦{item.price.toLocaleString()} each</p>
                          
                          <div className="flex text-gray-500 items-center space-x-3 mt-3">
                            <button
                              onClick={() => onUpdateCart(item.type, -1)}
                              className="w-6 h-6 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-bold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateCart(item.type, 1)}
                              className="w-6 h-6 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="mt-2 text-gray-500 text-sm font-semibold">
                            Subtotal: ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold  from-gray-900 via-gray-800 to-black">₦{totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCheckout}
                      className="w-full bg-linear-to-br from-gray-900 via-gray-800 to-black py-4 rounded-lg font-bold text-lg"
                    >
                      PROCEED TO CHECKOUT
                    </motion.button>
                    
                    <button
                      onClick={onClose}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Free Ticket Modal Component - FIXED VERSION
const FreeTicketModal = ({ 
  isOpen, 
  onClose, 
  customerInfo, 
  setCustomerInfo, 
  ticketType, 
  quantity, 
  isProcessing, 
  setIsProcessing,
  processTicketOrder // ADD THIS PROP
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerInfo.name || !customerInfo.email) {
      if (window.showFancyNotification) {
        window.showFancyNotification('error', 'Missing Information', 'Please fill in all required fields (name and email)');
      }
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create ticket data
      const ticketData = {
        name: 'Regular Ticket',
        price: 0,
        quantity: quantity,
        type: ticketType
      };

      console.log('🎟️ Starting free ticket processing...');
      
      // Process the free ticket order using the passed function
      await processTicketOrder(ticketData, customerInfo, true);
      
      console.log('✅ Free ticket process completed');
      
      // Show fancy success notification
      if (window.showFancyNotification) {
        window.showFancyNotification('success', 'Tickets Confirmed!', `Your ${quantity} free ticket(s) have been reserved! Check your email for confirmation.`);
      }
      
      // Close modal and reset
      onClose();
      setCustomerInfo({ email: '', name: '', phone: '' });
      
    } catch (error) {
      console.error('Free ticket error:', error);
      if (window.showFancyNotification) {
        window.showFancyNotification('error', 'Processing Failed', 'Failed to process free tickets. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-linear-to-br from-gray-900 via-gray-800 to-blackrounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Get Your Free Tickets</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">Free Ticket Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>{quantity}x Regular Ticket</span>
                      <span className="font-bold text-green-600">FREE</span>
                    </div>
                  </div>
                  <div className="border-t text-gray-700 border-green-200 mt-3 pt-3 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-2">
                    🎉 No payment required! Just fill in your details to get your free tickets.
                  </p>
                </div>

                {/* Customer Information Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    className="w-full bg-white text-green-600 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center  justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Getting Your Tickets...</span>
                      </div>
                    ) : (
                      `GET ${quantity} FREE TICKET${quantity > 1 ? 'S' : ''}`
                    )}
                  </motion.button>
                </form>

                <div className="mt-4 text-center text-sm text-white">
                  <p>📧 Your tickets will be sent to your email immediately</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


// Fancy Notification Component
const FancyNotification = () => {
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

  const showFancyNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', title: '', message: '' });
    }, 5000);
  };

  // Make this function available globally
  useEffect(() => {
    window.showFancyNotification = showFancyNotification;
  }, []);

  return (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className={`fixed top-14 right-4 z-50 max-w-sm w-full ${
            notification.type === 'success' 
              ? 'bg-linear-to-br from-gray-900 via-gray-800 to-black border-[#e74c3c]' 
              : 'bg-linear-to-br from-gray-900 via-gray-800 to-black border-red-500'
          } border-2 text-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md`}
        >
          <div className="p-28">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'success' 
                  ? 'bg-[#e74c3c]' 
                  : 'bg-red-500'
              } border border-white/30`}>
                {notification.type === 'success' ? '🎉' : '❌'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{notification.title}</h3>
                <p className="text-sm opacity-90 text-gray-200">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white border border-white/20"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className={`h-1 ${
              notification.type === 'success' ? 'bg-[#e74c3c]' : 'bg-red-500'
            } origin-left`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, customerInfo, setCustomerInfo, cart, totalAmount, onProcessPayment, isProcessing }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onProcessPayment();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-linear-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="text-lg text-white font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.type} className="flex text-green-600 justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t text-white mt-3 pt-3 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Customer Information Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-white px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full text-white px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full text-white px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                <motion.button
  type="submit"
  disabled={isProcessing || cart.length === 0}
  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
  className="w-full text-green-600 bg-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isProcessing ? (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Processing...</span>
    </div>
  ) : (
    `Pay with Paystack - ₦${totalAmount.toLocaleString()}`
  )}
                </motion.button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>🔒 Your payment is secure and encrypted</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-6">
      <div className="text-center">
        <motion.div 
          className="flex items-center justify-center space-x-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="w-3 h-3 bg-[#e74c3c] rounded-full"></div>
          <span className="text-xl font-bold">DECEMBER NIGHTS</span>
        </motion.div>
        
        <p className="text-gray-400 mb-6">
          An unforgettable musical experience coming this December
        </p>
        
        <div className="flex justify-center space-x-6">
          {['Twitter', 'Instagram', 'Facebook', 'YouTube'].map((social) => (
            <motion.a
              key={social}
              href="#"
              whileHover={{ y: -2 }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {social}
            </motion.a>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
          <p>&copy; 2025 December Nights. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);