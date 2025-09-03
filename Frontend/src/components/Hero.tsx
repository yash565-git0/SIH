import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf, Shield, Globe, Scan, Award, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      icon: Leaf,
      title: "Organic Verification",
      description: "GPS-tagged harvest events with blockchain immutability",
      color: "text-emerald-600"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Smart contracts enforcing Ayurvedic standards",
      color: "text-teal-600"
    },
    {
      icon: Scan,
      title: "Consumer Trust",
      description: "QR-based authenticity verification",
      color: "text-amber-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-200 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full"
              >
                <Award className="w-4 h-4 text-emerald-600 mr-2" />
                <span className="text-emerald-700 font-medium">Hackathon Innovation</span>
              </motion.div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-amber-600 bg-clip-text text-transparent leading-tight">
                AyurChain
              </h1>
              
              <h2 className="text-3xl font-semibold text-gray-800">
                Blockchain Traceability for
                <span className="text-emerald-600"> Ayurvedic Herbs</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Revolutionary supply chain transparency combining ancient Ayurvedic wisdom 
                with cutting-edge blockchain technology. Track every herb from farm to pharmacy 
                with immutable proof of authenticity.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Platform
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl"
              >
                View Demo
              </Button>
            </div>

            {/* Feature Showcase */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      activeFeature === index 
                        ? 'border-emerald-600 bg-emerald-50' 
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                    onClick={() => setActiveFeature(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-8 h-8 ${feature.color} mb-2`} />
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Visual Card */}
              <Card className="p-8 bg-gradient-to-br from-white to-emerald-50 shadow-2xl border-0 rounded-3xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-emerald-700">Live Tracking</h3>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Interactive Herb Journey */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Ashwagandha Harvest</p>
                        <p className="text-sm text-gray-600">Karnataka, India • GPS: 12.9716°N, 77.5946°E</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Quality Testing</p>
                        <p className="text-sm text-gray-600">Ayush Certified Lab • Batch #AY2024-001</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Consumer Ready</p>
                        <p className="text-sm text-gray-600">Blockchain Verified • QR Code Generated</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">1,247</p>
                      <p className="text-sm text-gray-600">Verified Batches</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">98.5%</p>
                      <p className="text-sm text-gray-600">Authenticity Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">24</p>
                      <p className="text-sm text-gray-600">Partner Farms</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating Accent Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl opacity-20"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}