import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LogOut, Package, Plus, TrendingUp, TrendingDown, Factory, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface ManufacturerDashboardProps {
  onLogout: () => void;
}

interface HerbBatch {
  id: string;
  herbName: string;
  supplier: string;
  quantity: number;
  unit: 'kg' | 'tons';
  quality: 'A' | 'B' | 'C';
  receivedDate: string;
  batchNumber: string;
  certification: string;
  price: number;
  status: 'received' | 'processing' | 'used';
}

interface ProductBatch {
  id: string;
  productName: string;
  batchNumber: string;
  herbsUsed: string[];
  quantity: number;
  unit: 'units' | 'bottles' | 'packets';
  productionDate: string;
  expiryDate: string;
  status: 'produced' | 'quality_check' | 'packaged' | 'exported';
  destination?: string;
  exportDate?: string;
}

export function ManufacturerDashboard({ onLogout }: ManufacturerDashboardProps) {
  const [receivedHerbs, setReceivedHerbs] = useState<HerbBatch[]>([
    {
      id: 'HRB001',
      herbName: 'Turmeric Powder',
      supplier: 'Rajesh Kumar Farm',
      quantity: 500,
      unit: 'kg',
      quality: 'A',
      receivedDate: '2024-01-20',
      batchNumber: 'TUR-2024-001',
      certification: 'Organic Certified',
      price: 25000,
      status: 'received'
    },
    {
      id: 'HRB002',
      herbName: 'Ashwagandha Root',
      supplier: 'Himalayan Herbs Co.',
      quantity: 200,
      unit: 'kg',
      quality: 'A',
      receivedDate: '2024-01-22',
      batchNumber: 'ASH-2024-005',
      certification: 'Lab Tested',
      price: 45000,
      status: 'processing'
    }
  ]);

  const [producedBatches, setProducedBatches] = useState<ProductBatch[]>([
    {
      id: 'PRD001',
      productName: 'Turmeric Capsules',
      batchNumber: 'TC-2024-001',
      herbsUsed: ['Turmeric Powder', 'Black Pepper'],
      quantity: 1000,
      unit: 'bottles',
      productionDate: '2024-01-25',
      expiryDate: '2026-01-25',
      status: 'exported',
      destination: 'USA - California',
      exportDate: '2024-01-30'
    },
    {
      id: 'PRD002',
      productName: 'Stress Relief Formula',
      batchNumber: 'SRF-2024-002',
      herbsUsed: ['Ashwagandha Root', 'Brahmi Extract'],
      quantity: 500,
      unit: 'bottles',
      productionDate: '2024-01-28',
      expiryDate: '2026-01-28',
      status: 'packaged'
    }
  ]);

  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newHerbBatch, setNewHerbBatch] = useState<Partial<HerbBatch>>({});
  const [newProductBatch, setNewProductBatch] = useState<Partial<ProductBatch>>({});

  const totalInventoryValue = receivedHerbs.reduce((sum, batch) => sum + batch.price, 0);
  const totalExported = producedBatches.filter(batch => batch.status === 'exported').length;
  const pendingProduction = producedBatches.filter(batch => batch.status !== 'exported').length;

  const handleReceiveHerb = () => {
    if (!newHerbBatch.herbName || !newHerbBatch.supplier || !newHerbBatch.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    const newBatch: HerbBatch = {
      id: `HRB${String(receivedHerbs.length + 1).padStart(3, '0')}`,
      herbName: newHerbBatch.herbName!,
      supplier: newHerbBatch.supplier!,
      quantity: newHerbBatch.quantity!,
      unit: newHerbBatch.unit || 'kg',
      quality: newHerbBatch.quality || 'A',
      receivedDate: new Date().toISOString().split('T')[0],
      batchNumber: `${newHerbBatch.herbName?.substring(0, 3).toUpperCase()}-2024-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
      certification: newHerbBatch.certification || 'Organic Certified',
      price: newHerbBatch.price || 0,
      status: 'received'
    };

    setReceivedHerbs([...receivedHerbs, newBatch]);
    setNewHerbBatch({});
    setShowReceiveForm(false);
    toast.success('Herb batch received successfully');
  };

  const handleAddProduct = () => {
    if (!newProductBatch.productName || !newProductBatch.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    const newProduct: ProductBatch = {
      id: `PRD${String(producedBatches.length + 1).padStart(3, '0')}`,
      productName: newProductBatch.productName!,
      batchNumber: `${newProductBatch.productName?.substring(0, 3).toUpperCase()}-2024-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
      herbsUsed: newProductBatch.herbsUsed || [],
      quantity: newProductBatch.quantity!,
      unit: newProductBatch.unit || 'bottles',
      productionDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years
      status: 'produced'
    };

    setProducedBatches([...producedBatches, newProduct]);
    setNewProductBatch({});
    setShowProductForm(false);
    toast.success('Product batch added successfully');
  };

  const handleExport = (productId: string, destination: string) => {
    setProducedBatches(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'exported' as const, destination, exportDate: new Date().toISOString().split('T')[0] }
        : product
    ));
    toast.success(`Product exported to ${destination}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'used': return 'bg-slate-100 text-slate-800 border border-slate-300';
      case 'produced': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'quality_check': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'packaged': return 'bg-teal-100 text-teal-800 border border-teal-300';
      case 'exported': return 'bg-green-100 text-green-800 border border-green-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'B': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'C': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/30 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-emerald-600 rounded-lg">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-amber-900">Manufacturer Dashboard</h1>
                <p className="text-sm text-slate-600">Herb Processing & Export Management</p>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-emerald-900">₹{totalInventoryValue.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Herb Batches</p>
                  <p className="text-2xl font-bold text-amber-900">{receivedHerbs.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700">Products Exported</p>
                  <p className="text-2xl font-bold text-teal-900">{totalExported}</p>
                </div>
                <Truck className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Pending Production</p>
                  <p className="text-2xl font-bold text-blue-900">{pendingProduction}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="herbs" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-emerald-200">
            <TabsTrigger value="herbs" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">
              Received Herbs ({receivedHerbs.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Products ({producedBatches.length})
            </TabsTrigger>
          </TabsList>

          {/* Received Herbs Tab */}
          <TabsContent value="herbs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-emerald-900">Herb Inventory</h2>
              <Button
                onClick={() => setShowReceiveForm(!showReceiveForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Receive New Batch
              </Button>
            </div>

            {showReceiveForm && (
              <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Receive New Herb Batch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-emerald-900">Herb Name *</Label>
                      <Input
                        value={newHerbBatch.herbName || ''}
                        onChange={(e) => setNewHerbBatch(prev => ({ ...prev, herbName: e.target.value }))}
                        placeholder="e.g., Turmeric Powder"
                        className="border-emerald-300"
                      />
                    </div>
                    <div>
                      <Label className="text-emerald-900">Supplier *</Label>
                      <Input
                        value={newHerbBatch.supplier || ''}
                        onChange={(e) => setNewHerbBatch(prev => ({ ...prev, supplier: e.target.value }))}
                        placeholder="Supplier name"
                        className="border-emerald-300"
                      />
                    </div>
                    <div>
                      <Label className="text-emerald-900">Quantity *</Label>
                      <Input
                        type="number"
                        value={newHerbBatch.quantity || ''}
                        onChange={(e) => setNewHerbBatch(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                        placeholder="500"
                        className="border-emerald-300"
                      />
                    </div>
                    <div>
                      <Label className="text-emerald-900">Quality Grade</Label>
                      <Select onValueChange={(value) => setNewHerbBatch(prev => ({ ...prev, quality: value as 'A' | 'B' | 'C' }))}>
                        <SelectTrigger className="border-emerald-300">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-emerald-900">Price (₹)</Label>
                      <Input
                        type="number"
                        value={newHerbBatch.price || ''}
                        onChange={(e) => setNewHerbBatch(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        placeholder="25000"
                        className="border-emerald-300"
                      />
                    </div>
                    <div>
                      <Label className="text-emerald-900">Certification</Label>
                      <Input
                        value={newHerbBatch.certification || ''}
                        onChange={(e) => setNewHerbBatch(prev => ({ ...prev, certification: e.target.value }))}
                        placeholder="Organic Certified"
                        className="border-emerald-300"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleReceiveHerb} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Receive Batch
                    </Button>
                    <Button onClick={() => setShowReceiveForm(false)} variant="outline" className="border-emerald-300">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {receivedHerbs.map((batch) => (
                <Card key={batch.id} className="bg-white/80 backdrop-blur-sm border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-emerald-900">{batch.herbName}</h3>
                          <p className="text-sm text-slate-600 font-mono">{batch.id} • {batch.supplier}</p>
                          <p className="text-sm text-slate-600">{batch.quantity} {batch.unit} • ₹{batch.price.toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getQualityColor(batch.quality)}>
                            Grade {batch.quality}
                          </Badge>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Received: {batch.receivedDate}</p>
                        <p>Batch: {batch.batchNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-amber-900">Product Batches</h2>
              <Button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {showProductForm && (
              <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Add New Product Batch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-900">Product Name *</Label>
                      <Input
                        value={newProductBatch.productName || ''}
                        onChange={(e) => setNewProductBatch(prev => ({ ...prev, productName: e.target.value }))}
                        placeholder="e.g., Turmeric Capsules"
                        className="border-amber-300"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-900">Quantity *</Label>
                      <Input
                        type="number"
                        value={newProductBatch.quantity || ''}
                        onChange={(e) => setNewProductBatch(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                        placeholder="1000"
                        className="border-amber-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-amber-900">Herbs Used</Label>
                    <Textarea
                      value={newProductBatch.herbsUsed?.join(', ') || ''}
                      onChange={(e) => setNewProductBatch(prev => ({ ...prev, herbsUsed: e.target.value.split(', ') }))}
                      placeholder="Turmeric Powder, Black Pepper"
                      className="border-amber-300"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleAddProduct} className="bg-amber-600 hover:bg-amber-700 text-white">
                      Add Product
                    </Button>
                    <Button onClick={() => setShowProductForm(false)} variant="outline" className="border-amber-300">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {producedBatches.map((product) => (
                <Card key={product.id} className="bg-white/80 backdrop-blur-sm border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-amber-900">{product.productName}</h3>
                          <p className="text-sm text-slate-600 font-mono">{product.id} • {product.batchNumber}</p>
                          <p className="text-sm text-slate-600">{product.quantity} {product.unit}</p>
                          <p className="text-xs text-slate-500">Herbs: {product.herbsUsed.join(', ')}</p>
                        </div>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-slate-600 text-right">
                          <p>Produced: {product.productionDate}</p>
                          {product.exportDate && <p>Exported: {product.exportDate}</p>}
                          {product.destination && <p>To: {product.destination}</p>}
                        </div>
                        {product.status === 'packaged' && (
                          <Button
                            onClick={() => handleExport(product.id, 'USA - California')}
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}