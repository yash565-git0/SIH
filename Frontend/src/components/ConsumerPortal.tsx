import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, MapPin, Calendar, Award, Star, Share2, Download, AlertCircle, CheckCircle, Leaf, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  image: string;
  manufacturer: string;
  rating: number;
  reviews: number;
  price: string;
  sustainability: {
    score: number;
    carbonFootprint: string;
    waterSaved: string;
    farmersSupported: number;
  };
  certifications: string[];
  origin: {
    farm: string;
    location: string;
    coordinates: string;
    harvestDate: string;
  };
  journey: Array<{
    step: string;
    location: string;
    date: string;
    status: 'completed' | 'verified';
  }>;
  qualityMetrics: {
    purity: number;
    potency: number;
    freshness: number;
    authenticity: number;
  };
  activeCompounds: Record<string, string>;
}

export function ConsumerPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const sampleProducts: Product[] = [
    {
      id: 'ASH-001',
      name: 'Premium Ashwagandha Capsules',
      image: 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBoZXJicyUyMG1lZGljaW5hbCUyMHBsYW50c3xlbnwxfHx8fDE3NTY0NzgwODR8MA&ixlib=rb-4.1.0&q=80&w=400',
      manufacturer: 'AyurVedic Naturals Ltd.',
      rating: 4.8,
      reviews: 1247,
      price: '₹899',
      sustainability: {
        score: 92,
        carbonFootprint: '0.8 kg CO₂ eq',
        waterSaved: '15.2L per 100g',
        farmersSupported: 5
      },
      certifications: ['AYUSH Certified', 'Organic India', 'Fair Trade', 'Sustainable Harvest'],
      origin: {
        farm: 'Sunrise Organic Farm',
        location: 'Rajasthan, India',
        coordinates: '26.9124°N, 75.7873°E',
        harvestDate: '2025-01-15'
      },
      journey: [
        { step: 'Harvest', location: 'Rajasthan Farm', date: '2025-01-15', status: 'completed' },
        { step: 'Processing', location: 'Jaipur Facility', date: '2025-01-16', status: 'verified' },
        { step: 'Quality Testing', location: 'Mumbai Lab', date: '2025-01-18', status: 'verified' },
        { step: 'Manufacturing', location: 'Bengaluru Plant', date: '2025-01-20', status: 'completed' },
        { step: 'Distribution', location: 'Pan India', date: '2025-01-22', status: 'completed' }
      ],
      qualityMetrics: {
        purity: 98,
        potency: 95,
        freshness: 92,
        authenticity: 100
      },
      activeCompounds: {
        'Withanolides': '2.8%',
        'Total Alkaloids': '0.3%',
        'Moisture Content': '6.2%'
      }
    },
    {
      id: 'BRA-002',
      name: 'Brahmi Memory Enhancer',
      image: 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBoZXJicyUyMG1lZGljaW5hbCUyMHBsYW50c3xlbnwxfHx8fDE3NTY0NzgwODR8MA&ixlib=rb-4.1.0&q=80&w=400',
      manufacturer: 'Heritage Herbals',
      rating: 4.6,
      reviews: 892,
      price: '₹1,299',
      sustainability: {
        score: 88,
        carbonFootprint: '1.2 kg CO₂ eq',
        waterSaved: '22.5L per 100g',
        farmersSupported: 8
      },
      certifications: ['AYUSH Certified', 'Organic', 'GMP Certified'],
      origin: {
        farm: 'Kerala Wetlands Collective',
        location: 'Kerala, India',
        coordinates: '9.9312°N, 76.2673°E',
        harvestDate: '2025-01-10'
      },
      journey: [
        { step: 'Harvest', location: 'Kerala Wetlands', date: '2025-01-10', status: 'completed' },
        { step: 'Processing', location: 'Kochi Unit', date: '2025-01-12', status: 'verified' },
        { step: 'Quality Testing', location: 'Chennai Lab', date: '2025-01-14', status: 'verified' },
        { step: 'Manufacturing', location: 'Coimbatore Plant', date: '2025-01-16', status: 'completed' },
        { step: 'Distribution', location: 'South India', date: '2025-01-18', status: 'completed' }
      ],
      qualityMetrics: {
        purity: 96,
        potency: 94,
        freshness: 89,
        authenticity: 100
      },
      activeCompounds: {
        'Bacosides': '12%',
        'Saponins': '3.2%',
        'Alkaloids': '0.8%'
      }
    }
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const QualityMeter = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Consumer Transparency Portal</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Search and verify the authenticity, quality, and sustainability of Ayurvedic products through blockchain transparency
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Product Search & Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-grow">
              <Input
                placeholder="Search by product name, batch number, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 Try searching for "Ashwagandha" or "Brahmi" to see sample results
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-1">
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedProduct?.id === product.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => handleProductSelect(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                        <p className="text-gray-600 text-xs">{product.manufacturer}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                          <Badge className="text-xs bg-green-100 text-green-800">Verified</Badge>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{product.price}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="journey">Journey</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="border-blue-200 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-blue-900">{selectedProduct.name}</CardTitle>
                          <p className="text-gray-600">{selectedProduct.manufacturer}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{selectedProduct.price}</div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <ImageWithFallback
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Origin Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-gray-700">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                {selectedProduct.origin.location}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                Harvested: {selectedProduct.origin.harvestDate}
                              </div>
                              <div className="text-gray-600 font-mono text-xs">
                                📍 {selectedProduct.origin.coordinates}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.certifications.map((cert, index) => (
                                <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                            <Button variant="outline" className="border-blue-300 text-blue-700">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="journey">
                  <Card className="border-blue-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Supply Chain Journey</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedProduct.journey.map((step, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {step.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900">{step.step}</h4>
                                <Badge className={`text-xs ${
                                  step.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {step.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                📍 {step.location} • {step.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quality">
                  <Card className="border-blue-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Quality Scores</h4>
                          <div className="space-y-4">
                            <QualityMeter label="Purity" value={selectedProduct.qualityMetrics.purity} color="bg-green-500" />
                            <QualityMeter label="Potency" value={selectedProduct.qualityMetrics.potency} color="bg-blue-500" />
                            <QualityMeter label="Freshness" value={selectedProduct.qualityMetrics.freshness} color="bg-yellow-500" />
                            <QualityMeter label="Authenticity" value={selectedProduct.qualityMetrics.authenticity} color="bg-purple-500" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Active Compounds</h4>
                          <div className="space-y-3">
                            {Object.entries(selectedProduct.activeCompounds).map(([compound, value]) => (
                              <div key={compound} className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-700">{compound}</span>
                                <span className="font-medium text-gray-900">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="impact">
                  <Card className="border-green-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-green-900 flex items-center">
                        <Leaf className="w-5 h-5 mr-2" />
                        Sustainability Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                              <span className="text-2xl font-bold text-green-600">
                                {selectedProduct.sustainability.score}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Sustainability Score</h3>
                            <p className="text-sm text-gray-600">Overall environmental impact rating</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <Leaf className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-700">Carbon Footprint</span>
                            </div>
                            <span className="font-medium text-gray-900">{selectedProduct.sustainability.carbonFootprint}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600">💧</span>
                              </div>
                              <span className="text-sm text-gray-700">Water Conservation</span>
                            </div>
                            <span className="font-medium text-gray-900">{selectedProduct.sustainability.waterSaved}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm text-gray-700">Farmers Supported</span>
                            </div>
                            <span className="font-medium text-gray-900">{selectedProduct.sustainability.farmersSupported}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <Card className="border-gray-200 h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-600 font-medium mb-2">Select a Product</h3>
                <p className="text-gray-500 text-sm">
                  Choose a product from the list to view detailed traceability information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}