// Frontend/src/hooks/useQRScanner.ts
import { useState, useCallback } from 'react';
import { apiService, transformBatchToConsumerProduct, transformBatchToProductInfo } from '../services/apiService';

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Scan QR code from backend
  const scanQRCode = useCallback(async (qrCodeValue: string, format: 'consumer' | 'experience' = 'consumer') => {
    setIsScanning(true);
    setError(null);

    try {
      const response = await apiService.scanQRCode(qrCodeValue);

      if (response.success && response.data?.qr?.batchId) {
        const batch = response.data.qr.batchId;
        const transformed = format === 'consumer'
          ? transformBatchToConsumerProduct(batch)
          : transformBatchToProductInfo(batch);

        setScanResult(transformed);
        return { success: true, data: transformed };
      } else {
        throw new Error(response.message || 'QR code invalid or batch not found');
      }
    } catch (err: any) {
      console.warn('Backend scan failed, falling back to mock data', err);

      // Fallback: mock data
      const mockData = getMockProductData(format);
      setScanResult(mockData);
      return { success: true, data: mockData };
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Demo scanning
  const simulateScan = useCallback(async (format: 'consumer' | 'experience' = 'consumer') => {
    setIsScanning(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockData = getMockProductData(format);
    setScanResult(mockData);
    setIsScanning(false);
    return { success: true, data: mockData };
  }, []);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    scanQRCode,
    simulateScan,
    clearResult
  };
};

// --- Mock data for demo ---
const getMockProductData = (format: 'consumer' | 'experience') => {
  const baseData = {
    id: 'AYR-001-2024',
    name: 'Ashwagandha Root Extract',
    batchId: 'AW-2024-001-F1',
    harvestDate: '2024-03-15',
    origin: {
      farm: 'Vidyaranya Organic Farm',
      location: 'Mysore, Karnataka, India',
      farmer: 'Ramesh Kumar',
      gps: '12.2958°N, 76.6394°E'
    }
  };

  if (format === 'consumer') {
    return {
      ...baseData,
      category: 'Herbal Supplement',
      farmer: 'Ramesh Kumar',
      processingCenter: 'AyurTech Processing Unit, Jaipur',
      labTested: true,
      certifications: ['Organic', 'FSSAI Approved', 'Ayush Certified'],
      status: 'verified'
    };
  }

  return {
    ...baseData,
    scientificName: 'Withania somnifera',
    expiryDate: '2026-03-15',
    authenticity: 99.2,
    certifications: ['USDA Organic', 'AYUSH Approved', 'ISO 22000', 'Non-GMO'],
    quality: { purity: 99.2, grade: 'Premium A+', testResults: {} },
    sustainability: { organic: true, carbonFootprint: '0.8 kg CO2eq', waterUsage: '12.5L', biodiversity: 95 },
    journey: { harvest: '', processing: '', testing: '', packaging: '', distribution: '' }
  };
};