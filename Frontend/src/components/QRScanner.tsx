import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { QrCode, Camera, MapPin, Calendar, Award, Leaf, CheckCircle, ExternalLink, Share } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface ProductInfo {
  id: string;
  name: string;
  batch: string;
  manufacturer: string;
  image: string;
  harvestLocation: {
    farm: string;
    coordinates: string;
    region: string;
  };
  harvestDate: string;
  qualityGrade: string;
  certifications: string[];
  activeCompounds: Record<string, string>;
  sustainability: {
    carbonFootprint: string;
    waterUsage: string;
    communityImpact: string;
  };
  traceability: {
    farmToConsumer: string;
    intermediaries: number;
    qualityChecks: number;
  };
}

export function QRScanner() {
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);

  const sampleProduct: ProductInfo = {
    id: 'ASH-RAJ-2025-001',
    name: 'Premium Ashwagandha Capsules',
    batch: 'BATCH-47291',
    manufacturer: 'AyurVedic Naturals Ltd.',
    image: 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBoZXJicyUyMG1lZGljaW5hbCUyMHBsYW50c3xlbnwxfHx8fDE3NTY0NzgwODR8MA&ixlib=rb-4.1.0&q=80&w=400',
    harvestLocation: {
      farm: 'Sunrise Organic Farm',
      coordinates: '26.9124°N, 75.7873°E',
      region: 'Rajasthan, India'
    },
    harvestDate: '2025-01-15',
    qualityGrade: 'Grade A Premium',
    certifications: ['AYUSH Certified', 'Organic India', 'Fair Trade', 'Sustainable Harvest'],
    activeCompounds: {
      'Withanolides': '2.8%',
      'Total Alkaloids': '0.3%',
      'Moisture Content': '6.2%'
    },
    sustainability: {
      carbonFootprint: '0.8 kg CO₂ equivalent',
      waterUsage: '15.2 liters per 100g',
      communityImpact: '5 farming families supported'
    },
    traceability: {
      farmToConsumer: '7 days',
      intermediaries: 3,
      qualityChecks: 4
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    setScanAnimation(true);
    
    setTimeout(() => {
      setScannedProduct(sampleProduct);
      setIsScanning(false);
      setScanAnimation(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Consumer QR Code Scanner</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Experience how consumers verify product authenticity and view complete traceability information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* QR Scanner Interface */}
        <Card className="border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <QrCode className="w-6 h-6 mr-2" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mock QR Code */}
              <div className="relative">
                <div className="bg-white p-8 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
                  {scanAnimation ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1.2 }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center"
                    >
                      <div className="text-white text-xs text-center">
                        AyurTrace<br/>QR Code<br/>Scanning...
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer" onClick={simulateQRScan}>
                      <div className="text-white text-xs text-center">
                        AyurTrace<br/>QR Code<br/>Click to Scan
                      </div>
                    </div>
                  )}
                </div>
                
                {scanAnimation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                  />
                )}
              </div>

              {/* Scan Button */}
              <div className="text-center space-y-4">
                <Button
                  onClick={simulateQRScan}
                  disabled={isScanning}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isScanning ? 'Scanning QR Code...' : 'Start QR Scan Demo'}
                </Button>
                
                <p className="text-sm text-gray-600">
                  In the real app, consumers would use their phone camera to scan QR codes on product packaging
                </p>
              </div>

              {/* Status */}
              {isScanning && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Connecting to blockchain network and retrieving product information...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Information Display */}
        {scannedProduct ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-green-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900">Product Verified ✓</CardTitle>
                  <Badge className="bg-green-100 text-green-800">Authentic</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Product Basic Info */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <ImageWithFallback 
                        src={scannedProduct.image}
                        alt={scannedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{scannedProduct.name}</h3>
                      <p className="text-gray-600 text-sm">{scannedProduct.manufacturer}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">Batch: {scannedProduct.batch}</Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">{scannedProduct.qualityGrade}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Harvest Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Harvest Origin
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-700 font-medium">Farm</div>
                        <div className="text-blue-800">{scannedProduct.harvestLocation.farm}</div>
                      </div>
                      <div>
                        <div className="text-blue-700 font-medium">Region</div>
                        <div className="text-blue-800">{scannedProduct.harvestLocation.region}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-blue-700 font-medium">GPS Coordinates</div>
                        <div className="text-blue-800 font-mono text-xs">{scannedProduct.harvestLocation.coordinates}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800 text-sm">Harvested on {scannedProduct.harvestDate}</span>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scannedProduct.certifications.map((cert, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Active Compounds */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Active Compounds</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(scannedProduct.activeCompounds).map(([compound, value]) => (
                        <div key={compound} className="flex justify-between items-center py-1">
                          <span className="text-gray-700 text-sm">{compound}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sustainability Metrics */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center">
                      <Leaf className="w-4 h-4 mr-2" />
                      Sustainability Impact
                    </h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(scannedProduct.sustainability).map(([metric, value]) => (
                        <div key={metric} className="flex justify-between">
                          <span className="text-green-700 capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-green-800 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Journey
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-12 text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-600 font-medium mb-2">Scan a QR Code</h3>
                <p className="text-gray-500 text-sm">
                  Product information will appear here after scanning
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="mt-16 bg-white rounded-xl border border-blue-200 p-8">
        <h3 className="text-2xl font-bold text-blue-900 text-center mb-8">Consumer Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Authenticity Guarantee</h4>
            <p className="text-gray-600 text-sm">Verify that your Ayurvedic products are genuine and unadultered through immutable blockchain records</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Sustainability Story</h4>
            <p className="text-gray-600 text-sm">Learn about the environmental impact and community benefits of your purchase</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Complete Traceability</h4>
            <p className="text-gray-600 text-sm">Track your product's journey from the exact farm where it was harvested to your hands</p>
          </div>
        </div>
      </div>
    </div>
  );
}