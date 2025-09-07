// Frontend/src/components/ConsumerExperience.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { QrReader as Scan } from 'react-qr-reader';
import { Star, Leaf, Camera, Download, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useQRScanner } from '../hooks/useQRScanner';

interface Product {
  id: string;
  name: string;
  scientificName?: string;
  batchId?: string;
  image: string;
  manufacturer: string;
  rating: number;
  reviews: number;
  price: string;
  sustainability: any;
  certifications: string[];
  origin: any;
  journey: any[];
  qualityMetrics?: any;
  activeCompounds?: Record<string, string>;
  authenticity?: number;
  harvestDate?: string;
  expiryDate?: string;
}

export function ConsumerExperience() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'quality' | 'sustainability'>('overview');

  const { scanResult, scanQRCode, isScanning } = useQRScanner();

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (scanResult) {
      const transformed = transformScanToProduct(scanResult);
      setProducts((prev) => [transformed, ...prev]);
      setSelectedProduct(transformed);
    }
  }, [scanResult]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllBatches({ limit: 10, page: 1 });
      if (response.batches) {
        const transformed = response.batches.map((batch: any) => transformBatchToProduct(batch));
        setProducts(transformed);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load products. Showing sample data.');
      setProducts(getSampleProducts());
    } finally {
      setIsLoading(false);
    }
  };

  const transformBatchToProduct = (batch: any): Product => ({
    id: batch._id,
    name: batch.species_id?.common_name || `Batch ${batch._id.substring(0, 8)}`,
    scientificName: batch.species_id?.scientific_name,
    batchId: batch.batchId,
    image: batch.image || 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max',
    manufacturer: batch.manufacturer || 'AyurVedic Naturals Ltd.',
    rating: batch.recall_flag ? 3.5 : 4.8,
    reviews: Math.floor(Math.random() * 1000) + 100,
    price: '₹' + (Math.floor(Math.random() * 2000) + 500),
    sustainability: batch.sustainability || { score: 92 },
    certifications: batch.certifications || ['AYUSH Certified'],
    origin: batch.origin || { farm: 'Organic Farm Collective', location: 'India', harvestDate: '2025-01-01' },
    journey: batch.journey || [],
    qualityMetrics: batch.qualityMetrics || { purity: 98, potency: 95, freshness: 92, authenticity: 100 },
    activeCompounds: batch.activeCompounds || { Withanolides: '2.8%', 'Total Alkaloids': '0.3%' },
    authenticity: batch.qualityMetrics?.authenticity || 99
  });

  const transformScanToProduct = (scanData: any): Product => ({
    id: scanData.id,
    name: scanData.name,
    scientificName: scanData.scientificName,
    batchId: scanData.batchId,
    image: scanData.image || 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max',
    manufacturer: scanData.manufacturer || 'AyurVedic Naturals Ltd.',
    rating: 4.8,
    reviews: Math.floor(Math.random() * 500) + 50,
    price: '₹899',
    sustainability: scanData.sustainability || { score: 92 },
    certifications: scanData.certifications || ['AYUSH Certified'],
    origin: scanData.origin || { farm: 'Vidyaranya Organic Farm', location: 'India', harvestDate: '2024-03-15' },
    journey: scanData.journey || [],
    qualityMetrics: scanData.qualityMetrics || { purity: 99, potency: 95, freshness: 92, authenticity: 99 },
    activeCompounds: scanData.activeCompounds || { 'Primary Compounds': '2.8%', 'Total Alkaloids': '0.3%' },
    authenticity: scanData.authenticity || 99,
    harvestDate: scanData.harvestDate,
    expiryDate: scanData.expiryDate
  });

  const getSampleProducts = (): Product[] => [
    {
      id: 'ASH-001',
      name: 'Premium Ashwagandha Capsules',
      image: 'https://images.unsplash.com/photo-1655275194063-08d11b6abea6?crop=entropy&cs=tinysrgb&fit=max',
      manufacturer: 'AyurVedic Naturals Ltd.',
      rating: 4.8,
      reviews: 1247,
      price: '₹899',
      sustainability: { score: 92 },
      certifications: ['AYUSH Certified', 'Organic India'],
      origin: { farm: 'Sunrise Organic Farm', location: 'Rajasthan, India', harvestDate: '2025-01-15' },
      journey: [],
      qualityMetrics: { purity: 98, potency: 95, freshness: 92, authenticity: 100 },
      activeCompounds: { Withanolides: '2.8%', 'Total Alkaloids': '0.3%' },
      authenticity: 100
    }
  ];

  const handleSelect = (product: Product) => setSelectedProduct(product);

  const handleManualVerify = () => {
    if (!manualCode.trim()) return;
    const found = products.find(p => p.id === manualCode.trim());
    if (found) setSelectedProduct(found);
    else setError('Product code not found. Try scanning instead.');
  };

  const clearResult = () => {
    setSelectedProduct(null);
    setActiveTab('overview');
    setManualCode('');
  };

  const getAuthenticityColor = (auth: number) => {
    if (auth >= 90) return 'text-green-600';
    if (auth >= 70) return 'text-yellow-500';
    return 'text-red-600';
  };

  const Progress = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 h-3 rounded-full">
      <motion.div className="h-3 rounded-full bg-emerald-600" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
    </div>
  );

  const currentProduct = selectedProduct || (scanResult ? transformScanToProduct(scanResult) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-6">
            Verify Your Ayurvedic Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scan or enter your product code to access complete transparency about your Ayurvedic herbs - from farm to pharmacy
          </p>
        </motion.div>

        {!currentProduct ? (
          // Scan / Manual Entry
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-3xl shadow-2xl">
              <div className="text-center space-y-8">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <motion.div className="w-64 h-64 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center border-4 border-dashed border-emerald-300">
                    {isScanning ? (
                      <p className="text-emerald-600 font-semibold">Scanning...</p>
                    ) : (
                      <p className="text-emerald-600 font-semibold">Position QR Code Here</p>
                    )}
                  </motion.div>
                </div>

                <Button onClick={scanQRCode} disabled={isScanning} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl shadow-lg">
                  <Camera className="w-5 h-5 mr-2" />
                  {isScanning ? 'Scanning...' : 'Start Camera Scan'}
                </Button>

                <div className="flex items-center">
                  <div className="flex-1 h-px bg-emerald-200"></div>
                  <span className="px-4 text-gray-500">or</span>
                  <div className="flex-1 h-px bg-emerald-200"></div>
                </div>

                <div className="space-y-4">
                  <Input placeholder="Enter batch or product ID" value={manualCode} onChange={(e) => setManualCode(e.target.value)} className="flex-1 h-12 rounded-xl border-emerald-200 focus:border-emerald-500" onKeyPress={(e) => e.key === 'Enter' && handleManualVerify()} />
                  <Button onClick={handleManualVerify} disabled={isScanning || !manualCode.trim()} className="bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-xl">Verify</Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Product Details with Tabs
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto">
            {/* Product List */}
            <div className="flex space-x-4 overflow-x-auto py-4">
              {products.map(p => (
                <div key={p.id} onClick={() => handleSelect(p)} className={`cursor-pointer p-2 rounded-lg border ${selectedProduct?.id === p.id ? 'border-emerald-600' : 'border-gray-200'}`}>
                  <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-lg"/>
                  <p className="text-sm text-center">{p.name}</p>
                </div>
              ))}
            </div>

            {/* Product Card */}
            <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-3xl shadow-2xl">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold text-emerald-700">{currentProduct.name}</h3>
                  <p className="text-lg text-gray-600 italic">{currentProduct.scientificName}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {currentProduct.batchId && <Badge className="bg-emerald-100 text-emerald-800">Batch: {currentProduct.batchId}</Badge>}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getAuthenticityColor(currentProduct.authenticity || 99)}`}>
                    {currentProduct.authenticity || 99}%
                  </div>
                  <p className="text-gray-600">Authenticity Score</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="w-4 h-4 mr-1" /> Download Report
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={clearResult}>Scan Another</Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6">
                <div className="flex space-x-4 border-b border-gray-200">
                  {['overview','journey','quality','sustainability'].map(tab => (
                    <button key={tab} className={`py-2 px-4 ${activeTab===tab ? 'border-b-2 border-emerald-600 font-semibold' : 'text-gray-500'}`} onClick={() => setActiveTab(tab as any)}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  {activeTab === 'overview' && <OverviewTab product={currentProduct} />}
                  {activeTab === 'journey' && <JourneyTab product={currentProduct} />}
                  {activeTab === 'quality' && <QualityTab product={currentProduct} />}
                  {activeTab === 'sustainability' && <SustainabilityTab product={currentProduct} />}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Placeholder tab components — replace with your actual ConsumerPortal content
const OverviewTab = ({ product }: { product: Product }) => (
  <div>
    <h4 className="font-semibold text-emerald-700 mb-2">Overview</h4>
    <p>{product.manufacturer} | Price: {product.price}</p>
  </div>
);
const JourneyTab = ({ product }: { product: Product }) => (
  <div>
    <h4 className="font-semibold text-emerald-700 mb-2">Journey</h4>
    <ul className="list-disc pl-5">
      {product.journey.map((j, i) => <li key={i}>{j.step} at {j.location} ({j.status})</li>)}
    </ul>
  </div>
);
const QualityTab = ({ product }: { product: Product }) => (
  <div>
    <h4 className="font-semibold text-emerald-700 mb-2">Quality</h4>
    {product.qualityMetrics && Object.entries(product.qualityMetrics).map(([k,v]) => (
      <div key={k} className="flex justify-between my-1">
        <span>{k}</span>
        <Progress value={v as number} />
      </div>
    ))}
  </div>
);
const SustainabilityTab = ({ product }: { product: Product }) => (
  <div>
    <h4 className="font-semibold text-emerald-700 mb-2">Sustainability</h4>
    <p>Score: {product.sustainability.score}%</p>
  </div>
);

const Progress = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 h-3 rounded-full my-1">
    <motion.div className="h-3 rounded-full bg-emerald-600" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
  </div>
);