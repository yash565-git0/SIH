import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Wheat, MapPin, Calendar, Thermometer, Droplets, Plus, CheckCircle, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';

interface FarmerDashboardProps {
  onLogout: () => void;
}

interface HarvestEntry {
  id: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  location: string;
  coordinates: string;
  weather: string;
  temperature: number;
  humidity: number;
  notes: string;
  status: 'pending' | 'recorded' | 'processing';
  timestamp: string;
}

export function FarmerDashboard({ onLogout }: FarmerDashboardProps) {
  const [entries, setEntries] = useState<HarvestEntry[]>([
    {
      id: 'H-001',
      crop: 'Ashwagandha',
      variety: 'Withania Somnifera',
      quantity: 50,
      unit: 'kg',
      harvestDate: '2024-01-15',
      location: 'Field A-3, Rajasthan',
      coordinates: '26.9124, 75.7873',
      weather: 'Sunny',
      temperature: 28,
      humidity: 45,
      notes: 'High quality roots, optimal maturity',
      status: 'recorded',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 'H-002',
      crop: 'Turmeric',
      variety: 'Curcuma Longa',
      quantity: 75,
      unit: 'kg',
      harvestDate: '2024-01-10',
      location: 'Field B-1, Rajasthan',
      coordinates: '26.9256, 75.8024',
      weather: 'Partly Cloudy',
      temperature: 25,
      humidity: 60,
      notes: 'Excellent color and size',
      status: 'processing',
      timestamp: '2024-01-10T14:20:00Z'
    }
  ]);

  const [formData, setFormData] = useState({
    crop: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    location: '',
    coordinates: '',
    weather: '',
    temperature: '',
    humidity: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate blockchain submission
    setTimeout(() => {
      const newEntry: HarvestEntry = {
        id: `H-${String(entries.length + 1).padStart(3, '0')}`,
        crop: formData.crop,
        variety: formData.variety,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        harvestDate: formData.harvestDate,
        location: formData.location,
        coordinates: formData.coordinates,
        weather: formData.weather,
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        notes: formData.notes,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      setEntries(prev => [newEntry, ...prev]);
      setFormData({
        crop: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        harvestDate: '',
        location: '',
        coordinates: '',
        weather: '',
        temperature: '',
        humidity: '',
        notes: ''
      });

      toast("Harvest data recorded successfully!", {
        description: "Your entry has been added to the blockchain.",
        duration: 3000,
      });

      setIsSubmitting(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recorded': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'processing': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recorded': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        handleInputChange("coordinates", coords);
        toast("Location captured successfully!", {
          description: `Coordinates: ${coords}`,
          duration: 3000,
        });
      },
      (error) => {
        toast("Unable to get location", {
          description: "Please enable location services",
          duration: 3000,
        });
      }
    );
  }
};


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Farmer Dashboard
            </h1>
            <p className="text-slate-600">Record and track your harvest data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Data Entry Form */}
        <div className="xl:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-900">
                <Plus className="w-5 h-5" />
                <span>Record New Harvest</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop" className="text-amber-900">Crop Type *</Label>
                    <Select value={formData.crop} onValueChange={(value) => handleInputChange('crop', value)}>
                      <SelectTrigger className="border-amber-200 focus:border-amber-500">
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ashwagandha">Ashwagandha</SelectItem>
                        <SelectItem value="turmeric">Turmeric</SelectItem>
                        <SelectItem value="brahmi">Brahmi</SelectItem>
                        <SelectItem value="neem">Neem</SelectItem>
                        <SelectItem value="tulsi">Tulsi</SelectItem>
                        <SelectItem value="amla">Amla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variety" className="text-amber-900">Variety</Label>
                    <Input
                      id="variety"
                      value={formData.variety}
                      onChange={(e) => handleInputChange('variety', e.target.value)}
                      placeholder="e.g., Withania Somnifera"
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-amber-900">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="0"
                      className="border-amber-200 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-amber-900">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="border-amber-200 focus:border-amber-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="tons">Tons</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvestDate" className="text-amber-900">Harvest Date *</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                      className="border-amber-200 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-amber-900">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Field A-3, Village Name, State"
                    className="border-amber-200 focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates" className="text-amber-900">GPS Coordinates</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="coordinates"
                      value={formData.coordinates}
                      onChange={(e) => handleInputChange('coordinates', e.target.value)}
                      placeholder="Latitude, Longitude"
                      className="border-amber-200 focus:border-amber-500"
                    />
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 px-3"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weather" className="text-amber-900">Weather Condition</Label>
                    <Select value={formData.weather} onValueChange={(value) => handleInputChange('weather', value)}>
                      <SelectTrigger className="border-amber-200 focus:border-amber-500">
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">Sunny</SelectItem>
                        <SelectItem value="cloudy">Cloudy</SelectItem>
                        <SelectItem value="partly-cloudy">Partly Cloudy</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-amber-900">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', e.target.value)}
                      placeholder="25"
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humidity" className="text-amber-900">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      value={formData.humidity}
                      onChange={(e) => handleInputChange('humidity', e.target.value)}
                      placeholder="60"
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-amber-900">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about the harvest..."
                    className="border-amber-200 focus:border-amber-500 min-h-[80px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.crop || !formData.quantity || !formData.harvestDate || !formData.location}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? 'Recording to Blockchain...' : 'Record Harvest Data'}
                  <Plus className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-amber-900">{entry.crop}</h4>
                        <p className="text-sm text-slate-600">{entry.id}</p>
                      </div>
                      <Badge className={`${getStatusColor(entry.status)} flex items-center space-x-1`}>
  {getStatusIcon(entry.status)}
  <span className="capitalize">{entry.status}</span>
</Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Package className="w-3 h-3" />
                        <span>{entry.quantity} {entry.unit}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.harvestDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{entry.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-800 font-medium">Recorded</span>
                  <span className="text-emerald-900 font-bold">{entries.filter(e => e.status === 'recorded').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-800 font-medium">Processing</span>
                  <span className="text-amber-900 font-bold">{entries.filter(e => e.status === 'processing').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">Pending</span>
                  <span className="text-blue-900 font-bold">{entries.filter(e => e.status === 'pending').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}