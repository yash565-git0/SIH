import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MapPin, Leaf, FlaskConical, Package, ShoppingCart, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'current' | 'pending';
  location?: string;
  timestamp?: string;
  details: string[];
  data?: Record<string, any>;
}

export function TraceabilityFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: FlowStep[] = [
    {
      id: 'collection',
      title: 'Collection Event',
      description: 'GPS-tagged harvest by certified collectors',
      icon: Leaf,
      status: 'completed',
      location: 'Rajasthan, India (26.9124° N, 75.7873° E)',
      timestamp: '2025-01-15 06:30:00 IST',
      details: [
        'Species: Withania somnifera (Ashwagandha)',
        'Collector ID: NMPB-RAJ-001',
        'Harvest method: Sustainable root collection',
        'Initial quality check: Passed',
        'Moisture content: 8.5%'
      ],
      data: {
        weight: '50 kg',
        quality: 'Grade A',
        sustainability: 'Certified'
      }
    },
    {
      id: 'processing',
      title: 'Processing Step',
      description: 'Primary processing and drying',
      icon: Package,
      status: 'completed',
      location: 'Processing Unit, Jaipur',
      timestamp: '2025-01-16 14:20:00 IST',
      details: [
        'Processing method: Air drying at 45°C',
        'Duration: 48 hours',
        'Final moisture: 6.2%',
        'Batch size: 45 kg after processing',
        'Storage conditions: Climate controlled'
      ],
      data: {
        finalWeight: '45 kg',
        moistureReduction: '2.3%',
        storageTemp: '25°C'
      }
    },
    {
      id: 'testing',
      title: 'Quality Testing',
      description: 'Laboratory analysis and certification',
      icon: FlaskConical,
      status: 'completed',
      location: 'AYUSH Certified Lab, Mumbai',
      timestamp: '2025-01-18 11:45:00 IST',
      details: [
        'Heavy metals: Within limits (< 10 ppm)',
        'Pesticide residue: Not detected',
        'DNA barcoding: Species confirmed',
        'Withanolides content: 2.8% (>2.5% required)',
        'Microbial load: Acceptable'
      ],
      data: {
        heavyMetals: 'Pass',
        pesticides: 'Pass',
        dna: 'Confirmed',
        activeCompounds: '2.8%'
      }
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing',
      description: 'Formulation into finished products',
      icon: Package,
      status: 'current',
      location: 'Manufacturing Facility, Bengaluru',
      timestamp: '2025-01-20 09:15:00 IST',
      details: [
        'Product type: Ashwagandha capsules',
        'Batch size: 10,000 units',
        'Formulation: 500mg per capsule',
        'Quality control: In progress',
        'Packaging: Scheduled'
      ],
      data: {
        productType: 'Capsules',
        batchSize: '10,000 units',
        dosage: '500mg'
      }
    },
    {
      id: 'distribution',
      title: 'Distribution',
      description: 'Packaging and shipment to retailers',
      icon: ShoppingCart,
      status: 'pending',
      location: 'Distribution Centers',
      timestamp: 'Estimated: 2025-01-22',
      details: [
        'QR codes generated for each package',
        'Blockchain record finalized',
        'Distribution to verified retailers',
        'Cold chain requirements: None',
        'Shelf life: 24 months'
      ],
      data: {
        qrCodes: 'Generated',
        retailers: '150+',
        shelfLife: '24 months'
      }
    },
    {
      id: 'consumer',
      title: 'Consumer Verification',
      description: 'End-customer scans QR code for authenticity',
      icon: Smartphone,
      status: 'pending',
      location: 'Point of Sale',
      timestamp: 'On purchase',
      details: [
        'QR code scanning via mobile app',
        'Complete traceability record displayed',
        'Authenticity verification',
        'Sustainability credentials shown',
        'Feedback collection enabled'
      ],
      data: {
        scanRate: '85%',
        satisfaction: '4.8/5',
        authenticity: '100%'
      }
    }
  ];

  const simulateProgress = () => {
    setIsAnimating(true);
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setActiveStep(currentStep);
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-emerald-50 via-amber-50 to-teal-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-emerald-900 mb-4">End-to-End Traceability Flow</h2>
        <p className="text-lg text-slate-700 max-w-3xl mx-auto">
          Follow an Ashwagandha batch from sustainable harvest to consumer verification through our blockchain network
        </p>
        <div className="mt-8">
          <Button 
            onClick={simulateProgress}
            disabled={isAnimating}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3"
          >
            {isAnimating ? 'Simulating...' : 'Simulate Live Tracking'}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                index <= activeStep 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {index < activeStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  (() => {
                    const IconComponent = step.icon;
                    return <IconComponent className="w-6 h-6" />;
                  })()
                )}
              </div>
              <div className="text-xs text-center mt-2 max-w-20">
                <div className={`font-medium ${index <= activeStep ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {step.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-br from-emerald-50 via-amber-50 to-teal-50 px-3">
              <Progress 
                value={(activeStep / (steps.length - 1)) * 100} 
                className="w-96 h-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-emerald-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = steps[activeStep].icon;
                    return <IconComponent className="w-6 h-6 text-emerald-700" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-emerald-900">{steps[activeStep].title}</CardTitle>
                  <p className="text-slate-600 text-sm">{steps[activeStep].description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50">
                  <MapPin className="w-3 h-3 mr-1" />
                  {steps[activeStep].location}
                </Badge>
                <Badge variant="outline" className="border-teal-300 text-teal-800 bg-teal-50">
                  {steps[activeStep].timestamp}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Event Details</h4>
                  <ul className="space-y-1">
                    {steps[activeStep].details.map((detail, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {steps[activeStep].data && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-900 mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(steps[activeStep].data!).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-teal-700 font-medium uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm font-medium text-emerald-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blockchain Transaction */}
        <Card className="border-amber-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mr-2 animate-pulse"></div>
              Blockchain Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-sm">
              <div>
                <div className="text-slate-600">Block Hash</div>
                <div className="text-slate-800 break-all">
                  0x47291a5c8b3d2f1e9c7a6b4d8e2f1a9c5b3d7e6f2a8c4b1d9e5f7a3c6b8d2e1f
                </div>
              </div>
              
              <div>
                <div className="text-slate-600">Transaction ID</div>
                <div className="text-slate-800 break-all">
                  0x8f2a5d1c9b4e7f3a6d8c2b5e9f1a4d7c3b6e8f2a5d9c1b4e7f3a6d8c2b5e9f
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-600">Block Height</div>
                  <div className="text-slate-800">47,291</div>
                </div>
                <div>
                  <div className="text-slate-600">Gas Used</div>
                  <div className="text-slate-800">23,456</div>
                </div>
              </div>

              <div>
                <div className="text-slate-600">Smart Contract</div>
                <div className="text-slate-800 break-all">
                  AyurTraceCollection.sol
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded border border-emerald-200">
                <div className="text-emerald-800 font-medium mb-1">Status: Confirmed</div>
                <div className="text-emerald-700 text-xs">
                  ✓ Geo-location validated<br/>
                  ✓ Quality metrics recorded<br/>
                  ✓ Sustainability criteria met<br/>
                  ✓ Chain of custody established
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-center mt-12 space-x-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          Previous Step
        </Button>
        <Button 
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}