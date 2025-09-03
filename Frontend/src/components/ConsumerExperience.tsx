import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  Shield, 
  Leaf, 
  Award, 
  MapPin, 
  Calendar,
  Thermometer,
  Droplets,
  CheckCircle,
  AlertCircle,
  Star,
  Camera,
  Download,
  Share2,
  Heart
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductInfo {
  id: string;
  name: string;
  scientificName: string;
  batchId: string;
  harvestDate: string;
  expiryDate: string;
  authenticity: number;
  certifications: string[];
  origin: {
    farm: string;
    location: string;
    farmer: string;
    gps: string;
  };
  quality: {
    purity: number;
    grade: string;
    testResults: {
      heavy_metals: string;
      pesticides: string;
      microbial: string;
    };
  };
  sustainability: {
    organic: boolean;
    carbonFootprint: string;
    waterUsage: string;
    biodiversity: number;
  };
  journey: {
    harvest: string;
    processing: string;
    testing: string;
    packaging: string;
    distribution: string;
  };
}

export function ConsumerExperience() {
  const [scanResult, setScanResult] = useState<ProductInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const mockProductData: ProductInfo = {
    id: 'AY-ASH-2024-001',
    name: 'Organic Ashwagandha Root Powder',
    scientificName: 'Withania somnifera',
    batchId: 'AW-2024-001-F1',
    harvestDate: '2024-03-15',
    expiryDate: '2026-03-15',
    authenticity: 99.2,
    certifications: ['USDA Organic', 'AYUSH Approved', 'ISO 22000', 'Non-GMO'],
    origin: {
      farm: 'Vidyaranya Organic Farm',
      location: 'Mysore, Karnataka, India',
      farmer: 'Ramesh Kumar',
      gps: '12.2958°N, 76.6394°E'
    },
    quality: {
      purity: 99.2,
      grade: 'Premium A+',
      testResults: {
        heavy_metals: 'Below detection limit',
        pesticides: 'Not detected',
        microbial: 'Within safe limits'
      }
    },
    sustainability: {
      organic: true,
      carbonFootprint: '0.8 kg CO2eq',
      waterUsage: '12.5L per 100g',
      biodiversity: 95
    },
    journey: {
      harvest: '2024-03-15T06:30:00Z',
      processing: '2024-03-18T09:15:00Z',
      testing: '2024-03-20T14:30:00Z',
      packaging: '2024-03-22T11:45:00Z',
      distribution: '2024-03-25T16:20:00Z'
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanResult(mockProductData);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualVerify = () => {
    if (manualCode) {
      setScanResult(mockProductData);
    }
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 98) return 'text-emerald-600';
    if (score >= 90) return 'text-amber-600';
    return 'text-red-600';
  };

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
            Verify Your Ayurvedic Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scan or enter your product code to access complete transparency about 
            your Ayurvedic herbs - from farm to pharmacy
          </p>
        </motion.div>

        {!scanResult ? (
          /* Scanning Interface */
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-3xl shadow-2xl">
              <div className="text-center space-y-8">
                {/* QR Scanner */}
                <div className="relative">
                  <motion.div
                    className="w-64 h-64 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center border-4 border-dashed border-emerald-300"
                    animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
                  >
                    {isScanning ? (
                      <div className="text-emerald-600">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Scan className="w-16 h-16" />
                        </motion.div>
                        <p className="mt-4 font-semibold">Scanning...</p>
                      </div>
                    ) : (
                      <div className="text-emerald-600 text-center">
                        <Scan className="w-16 h-16 mx-auto" />
                        <p className="mt-4 font-semibold">Position QR Code Here</p>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Corner Brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-emerald-500 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-emerald-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-emerald-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-emerald-500 rounded-br-lg"></div>
                </div>

                <Button 
                  onClick={handleScan}
                  disabled={isScanning}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isScanning ? 'Scanning...' : 'Start Camera Scan'}
                </Button>

                <div className="flex items-center">
                  <div className="flex-1 h-px bg-emerald-200"></div>
                  <span className="px-4 text-gray-500">or</span>
                  <div className="flex-1 h-px bg-emerald-200"></div>
                </div>

                {/* Manual Entry */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Enter Product Code Manually</h3>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Enter batch or product ID"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 h-12 rounded-xl border-emerald-200 focus:border-emerald-500"
                    />
                    <Button 
                      onClick={handleManualVerify}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-xl"
                    >
                      Verify
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Example: AY-ASH-2024-001 or AW-2024-001-F1
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Product Information Display */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl mx-auto"
            >
              {/* Product Header */}
              <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-3xl shadow-2xl">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Leaf className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-emerald-700">{scanResult.name}</h3>
                        <p className="text-lg text-gray-600 italic">{scanResult.scientificName}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className="bg-emerald-100 text-emerald-800">
                            Batch: {scanResult.batchId}
                          </Badge>
                          <Badge variant="outline">
                            Grade: {scanResult.quality.grade}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-4">
                      <div className={`text-4xl font-bold ${getAuthenticityColor(scanResult.authenticity)}`}>
                        {scanResult.authenticity}%
                      </div>
                      <p className="text-gray-600">Authenticity Score</p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tabs Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-2xl p-2 shadow-lg border border-emerald-100">
                  {[
                    { key: 'overview', label: 'Overview', icon: Shield },
                    { key: 'journey', label: 'Journey', icon: MapPin },
                    { key: 'quality', label: 'Quality', icon: Award },
                    { key: 'sustainability', label: 'Sustainability', icon: Leaf }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'ghost'}
                        className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === tab.key 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-gray-600 hover:text-emerald-600'
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid lg:grid-cols-2 gap-8"
                  >
                    {/* Origin Information */}
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                      <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Origin Details
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Farm:</span>
                          <span className="font-semibold">{scanResult.origin.farm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Farmer:</span>
                          <span className="font-semibold">{scanResult.origin.farmer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold">{scanResult.origin.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GPS:</span>
                          <span className="font-mono text-sm">{scanResult.origin.gps}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Certifications */}
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                      <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Certifications
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {scanResult.certifications.map((cert, index) => (
                          <div key={index} className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                              <span className="text-emerald-800 font-medium text-sm">{cert}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'quality' && (
                  <motion.div
                    key="quality"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="p-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                      <h4 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center">
                        <Award className="w-6 h-6 mr-2" />
                        Quality Analysis
                      </h4>
                      
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-3">
                              <span className="font-semibold text-gray-700">Purity Level</span>
                              <span className="font-bold text-emerald-600">{scanResult.quality.purity}%</span>
                            </div>
                            <Progress value={scanResult.quality.purity} className="h-3" />
                          </div>
                          
                          <div className="p-4 bg-emerald-50 rounded-xl">
                            <h5 className="font-semibold text-emerald-800 mb-3">Test Results</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-emerald-700">Heavy Metals:</span>
                                <span className="font-semibold text-emerald-800">{scanResult.quality.testResults.heavy_metals}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-700">Pesticides:</span>
                                <span className="font-semibold text-emerald-800">{scanResult.quality.testResults.pesticides}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-700">Microbial:</span>
                                <span className="font-semibold text-emerald-800">{scanResult.quality.testResults.microbial}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-white border border-emerald-200 rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-700">Product Grade</span>
                              <Badge className="bg-emerald-600 text-white">
                                {scanResult.quality.grade}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white border border-emerald-200 rounded-xl">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-gray-700">Harvest Date</span>
                              <span className="text-gray-600">{new Date(scanResult.harvestDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-700">Expiry Date</span>
                              <span className="text-gray-600">{new Date(scanResult.expiryDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back Button */}
              <div className="text-center mt-8">
                <Button 
                  onClick={() => setScanResult(null)}
                  variant="outline"
                  size="lg"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-2xl"
                >
                  Scan Another Product
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}