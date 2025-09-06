import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { QrCode, Scan, CheckCircle, AlertTriangle, Package, MapPin, Calendar, User, Wheat, FlaskConical } from 'lucide-react';
import { useQRScanner } from '../hooks/useQRScanner';

interface ConsumerScannerProps {
  onLogout: () => void;
}

export function ConsumerScanner({ onLogout }: ConsumerScannerProps) {
  const { isScanning, scanResult, error, scanQRCode, simulateScan, clearResult } = useQRScanner();
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const handleScan = async () => {
    const result = await simulateScan('consumer');
    if (result.success && result.data) {
      setScanHistory(prev => [result.data, ...prev.slice(0, 4)]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'authentic': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'suspicious': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'authentic': return <CheckCircle className="w-4 h-4" />;
      case 'suspicious': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Product Scanner
            </h1>
            <p className="text-slate-600">Verify authenticity of Ayurvedic products</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="mt-4 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
        >
          Logout
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-900">
              <Scan className="w-5 h-5" />
              <span>QR Code Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {isScanning ? (
                  <div className="animate-pulse">
                    <div className="w-32 h-32 border-4 border-emerald-500 rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-emerald-600 font-medium mt-4">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-600 font-medium">Tap to scan QR code</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isScanning ? 'Scanning...' : 'Start Scan (Demo)'}
                <Scan className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Demo mode - simulates real QR code scanning
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-900">
              <Package className="w-5 h-5" />
              <span>Product Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResult ? (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <Badge className={`px-4 py-2 rounded-xl border ${getStatusColor(scanResult.status)} flex items-center space-x-2`}>
                    {getStatusIcon(scanResult.status)}
                    <span className="font-semibold capitalize">{scanResult.status}</span>
                  </Badge>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900">{scanResult.name}</h3>
                    <p className="text-slate-600">{scanResult.category}</p>
                    <p className="text-sm text-emerald-600 font-mono">{scanResult.id}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-900">Origin</p>
                        <p className="text-sm text-slate-600">{scanResult.origin}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-800">Harvest Date</p>
                        <p className="text-sm text-slate-600">{scanResult.harvestDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                      <Wheat className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-semibold text-teal-800">Farmer</p>
                        <p className="text-sm text-slate-600">{scanResult.farmer}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-semibold text-purple-800">Lab Tested</p>
                        <p className="text-sm text-slate-600">{scanResult.labTested ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <p className="font-semibold text-emerald-900 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.certifications?.map((cert: string, index: number) => (
                        <Badge key={index} className="bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg px-2 py-1">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Button */}
                <div className="text-center pt-4">
                  <Button 
                    onClick={clearResult}
                    variant="outline"
                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    Clear Results
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Scan a QR code to view product details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-900">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanHistory.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-emerald-900 text-sm">{product.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(product.status)} flex items-center space-x-1`}>
                      {getStatusIcon(product.status)}
                      <span className="capitalize">{product.status}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{product.id}</p>
                  <p className="text-xs text-slate-500 mt-1">{product.origin}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}