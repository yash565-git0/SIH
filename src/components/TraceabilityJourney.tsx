import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Microscope, 
  Package, 
  Truck, 
  Store, 
  Scan,
  MapPin,
  Clock,
  Shield,
  Award,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface JourneyStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  details: {
    temperature?: string;
    humidity?: string;
    certifications?: string[];
    gpsCoords?: string;
    batchId?: string;
    quality?: string;
  };
  blockchain: {
    hash: string;
    gasUsed: string;
    verified: boolean;
  };
}

export function TraceabilityJourney() {
  const [selectedStep, setSelectedStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<'timeline' | 'map' | 'blockchain'>('timeline');

  const journeySteps: JourneyStep[] = [
    {
      id: 'harvest',
      title: 'Organic Harvest',
      subtitle: 'Ashwagandha Root Collection',
      icon: Leaf,
      location: 'Mysore, Karnataka',
      timestamp: '2024-03-15 06:30 IST',
      status: 'completed',
      details: {
        temperature: '24°C',
        humidity: '65%',
        gpsCoords: '12.2958°N, 76.6394°E',
        certifications: ['Organic India', 'NPOP Certified'],
        batchId: 'AW-2024-001'
      },
      blockchain: {
        hash: '0x4f3c2a1b8e9d6f2a3c1b8e9d6f2a3c1b',
        gasUsed: '0.0021 ETH',
        verified: true
      }
    },
    {
      id: 'testing',
      title: 'Quality Testing',
      subtitle: 'Ayush Certified Laboratory',
      icon: Microscope,
      location: 'Bangalore, Karnataka',
      timestamp: '2024-03-16 14:20 IST',
      status: 'completed',
      details: {
        quality: '99.2% Pure',
        certifications: ['AYUSH Approved', 'ISO 17025'],
        batchId: 'AW-2024-001-T1'
      },
      blockchain: {
        hash: '0x8a7b6c5d4e3f2a1b9c8d7e6f5a4b3c2d',
        gasUsed: '0.0018 ETH',
        verified: true
      }
    },
    {
      id: 'processing',
      title: 'Traditional Processing',
      subtitle: 'Ayurvedic Preparation Methods',
      icon: Package,
      location: 'Coimbatore, Tamil Nadu',
      timestamp: '2024-03-18 09:15 IST',
      status: 'completed',
      details: {
        temperature: '45°C',
        humidity: '40%',
        certifications: ['GMP Certified', 'Traditional Methods'],
        batchId: 'AW-2024-001-P1'
      },
      blockchain: {
        hash: '0xf1e2d3c4b5a6978869d8c7b6a5948372',
        gasUsed: '0.0015 ETH',
        verified: true
      }
    },
    {
      id: 'packaging',
      title: 'Smart Packaging',
      subtitle: 'QR Code Integration',
      icon: Scan,
      location: 'Chennai, Tamil Nadu',
      timestamp: '2024-03-20 11:45 IST',
      status: 'current',
      details: {
        temperature: '22°C',
        humidity: '45%',
        certifications: ['FDA Registered', 'Export Quality'],
        batchId: 'AW-2024-001-F1'
      },
      blockchain: {
        hash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        gasUsed: '0.0012 ETH',
        verified: true
      }
    },
    {
      id: 'distribution',
      title: 'Distribution',
      subtitle: 'Cold Chain Logistics',
      icon: Truck,
      location: 'Mumbai, Maharashtra',
      timestamp: '2024-03-22 16:30 IST',
      status: 'pending',
      details: {
        temperature: '18°C',
        certifications: ['Cold Chain Certified'],
        batchId: 'AW-2024-001-D1'
      },
      blockchain: {
        hash: 'Pending...',
        gasUsed: 'Pending...',
        verified: false
      }
    },
    {
      id: 'retail',
      title: 'Retail Ready',
      subtitle: 'Consumer Purchase Point',
      icon: Store,
      location: 'Delhi, NCR',
      timestamp: 'Estimated: 2024-03-25',
      status: 'pending',
      details: {
        certifications: ['Retail Certified'],
        batchId: 'AW-2024-001-R1'
      },
      blockchain: {
        hash: 'Pending...',
        gasUsed: 'Pending...',
        verified: false
      }
    }
  ];

  const getCurrentStep = () => journeySteps[selectedStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-6">
            Complete Traceability Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow every step from farm to pharmacy with immutable blockchain verification 
            and real-time IoT data capture
          </p>
          
          {/* View Selector */}
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-emerald-100">
              {[
                { key: 'timeline', label: 'Timeline View' },
                { key: 'map', label: 'Geographic Map' },
                { key: 'blockchain', label: 'Blockchain Data' }
              ].map((view) => (
                <Button
                  key={view.key}
                  variant={currentView === view.key ? 'default' : 'ghost'}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                    currentView === view.key 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                  onClick={() => setCurrentView(view.key as any)}
                >
                  {view.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline Steps */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-emerald-700">Journey Steps</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-emerald-300 text-emerald-600"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="space-y-4">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = selectedStep === index;
                  
                  return (
                    <motion.div
                      key={step.id}
                      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'bg-emerald-50 border-2 border-emerald-300' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedStep(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : step.status === 'current'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">{step.title}</h4>
                            <Badge variant={
                              step.status === 'completed' ? 'default' :
                              step.status === 'current' ? 'secondary' : 'outline'
                            }>
                              {step.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{step.subtitle}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {step.location}
                          </div>
                        </div>
                      </div>
                      
                      {index < journeySteps.length - 1 && (
                        <div className="absolute left-10 bottom-0 w-0.5 h-4 bg-emerald-200" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {currentView === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-xl">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold text-emerald-700">
                            {getCurrentStep().title}
                          </h3>
                          <p className="text-xl text-gray-600">{getCurrentStep().subtitle}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-gray-600 mb-2">
                            <Clock className="w-4 h-4 mr-2" />
                            {getCurrentStep().timestamp}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {getCurrentStep().location}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                            Environmental Data
                          </h4>
                          {getCurrentStep().details.temperature && (
                            <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                              <span className="text-gray-600">Temperature</span>
                              <span className="font-semibold text-emerald-700">
                                {getCurrentStep().details.temperature}
                              </span>
                            </div>
                          )}
                          {getCurrentStep().details.humidity && (
                            <div className="flex justify-between p-3 bg-teal-50 rounded-lg">
                              <span className="text-gray-600">Humidity</span>
                              <span className="font-semibold text-teal-700">
                                {getCurrentStep().details.humidity}
                              </span>
                            </div>
                          )}
                          {getCurrentStep().details.gpsCoords && (
                            <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                              <span className="text-gray-600">GPS Coordinates</span>
                              <span className="font-semibold text-amber-700">
                                {getCurrentStep().details.gpsCoords}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-emerald-600" />
                            Certifications
                          </h4>
                          <div className="space-y-2">
                            {getCurrentStep().details.certifications?.map((cert, index) => (
                              <div key={index} className="p-3 bg-white border border-emerald-200 rounded-lg">
                                <span className="text-emerald-700 font-medium">{cert}</span>
                              </div>
                            ))}
                            {getCurrentStep().details.quality && (
                              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg">
                                <span className="text-emerald-800 font-medium">
                                  Quality: {getCurrentStep().details.quality}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Batch Information */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-2">Batch Information</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Batch ID:</span>
                            <p className="font-mono font-semibold text-emerald-700">
                              {getCurrentStep().details.batchId}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="font-semibold text-gray-800">{getCurrentStep().location}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <Badge className="ml-2">{getCurrentStep().status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {currentView === 'blockchain' && (
                <motion.div
                  key="blockchain"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-xl">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-emerald-700 flex items-center">
                        <Shield className="w-6 h-6 mr-2" />
                        Blockchain Verification
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-emerald-800">Transaction Hash</span>
                            <Badge variant={getCurrentStep().blockchain.verified ? 'default' : 'secondary'}>
                              {getCurrentStep().blockchain.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="font-mono text-sm text-emerald-700 break-all">
                            {getCurrentStep().blockchain.hash}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white border border-gray-200 rounded-xl">
                            <span className="text-gray-600">Gas Used</span>
                            <p className="font-semibold text-gray-800 mt-1">
                              {getCurrentStep().blockchain.gasUsed}
                            </p>
                          </div>
                          <div className="p-4 bg-white border border-gray-200 rounded-xl">
                            <span className="text-gray-600">Network</span>
                            <p className="font-semibold text-gray-800 mt-1">Ethereum Mainnet</p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-800 mb-3">Smart Contract Events</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Event Type:</span>
                              <span className="font-semibold">SupplyChainUpdate</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Block Number:</span>
                              <span className="font-mono">19,234,567</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confirmations:</span>
                              <span className="font-semibold text-emerald-600">142</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                disabled={selectedStep === 0}
                onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
                className="border-emerald-300 text-emerald-600"
              >
                Previous Step
              </Button>
              <Button
                disabled={selectedStep === journeySteps.length - 1}
                onClick={() => setSelectedStep(Math.min(journeySteps.length - 1, selectedStep + 1))}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Next Step
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}