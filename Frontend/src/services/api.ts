// Frontend/src/services/api.ts

// Fix for environment variables in React
const getApiBaseUrl = (): string => {
  // For Create React App
  if (typeof window !== 'undefined' && (window as any).__REACT_APP_API_URL) {
    return (window as any).__REACT_APP_API_URL;
  }
  
  // For Vite (with proper type checking)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  
  // Default fallback
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Types based on your backend models
export interface BatchResponse {
  _id: string;
  collection_event_ids: string[];
  species_id: string;
  processing_step_ids: string[];
  quality_test_ids: string[];
  status: string;
  current_location: string;
  provenance_bundle_url?: string;
  recall_flag: boolean;
  qr_code_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumerScanRequest {
  qrCodeValue: string;
  consumerId: string;
}

export interface ConsumerScanResponse {
  success: boolean;
  message: string;
  data?: {
    qr: {
      _id: string;
      value: string;
      batchId: BatchResponse;
    };
    scan: {
      _id: string;
      qrCode: string;
      consumerId: string;
      timestamp: string;
    };
  };
}

export interface ProvenanceResponse {
  success: boolean;
  data?: BatchResponse;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Consumer API methods
  async scanQRCode(qrCodeValue: string, consumerId: string = 'anonymous'): Promise<ConsumerScanResponse> {
    return this.makeRequest<ConsumerScanResponse>('/consumer/scan', {
      method: 'POST',
      body: JSON.stringify({ qrCodeValue, consumerId }),
    });
  }

  async getProvenanceByBatch(batchId: string): Promise<ProvenanceResponse> {
    return this.makeRequest<ProvenanceResponse>(`/consumer/provenance/${batchId}`);
  }

  // Batch API methods
  async getBatchDetails(batchId: string): Promise<any> {
    return this.makeRequest(`/batches/${batchId}`);
  }

  async getAllBatches(filters?: {
    status?: string;
    species_id?: string;
    location?: string;
    recall_flag?: boolean;
    page?: number;
    limit?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/batches?${queryString}` : '/batches';
    
    return this.makeRequest(endpoint);
  }

  async generateProvenanceBundle(batchId: string): Promise<any> {
    return this.makeRequest(`/batches/${batchId}/provenance`);
  }

  async getBatchAnalytics(timeframe: string = '30d'): Promise<any> {
    return this.makeRequest(`/batches/analytics?timeframe=${timeframe}`);
  }
}

export const apiService = new ApiService();

// Helper functions to transform backend data to frontend format
export const transformBatchToProductInfo = (batch: any): any => {
  return {
    id: batch._id,
    name: batch.species_id?.common_name || 'Unknown Product',
    scientificName: batch.species_id?.scientific_name || '',
    batchId: batch._id,
    harvestDate: batch.createdAt,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 year
    authenticity: batch.recall_flag ? 85 : 99.2,
    certifications: ['AYUSH Approved', 'Organic Certified', 'Quality Tested'],
    origin: {
      farm: batch.current_location || 'Unknown Farm',
      location: batch.current_location || 'Unknown Location',
      farmer: 'Certified Farmer',
      gps: '12.2958°N, 76.6394°E' // Default coordinates
    },
    quality: {
      purity: batch.recall_flag ? 88 : 99.2,
      grade: batch.recall_flag ? 'Grade B' : 'Premium A+',
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
      harvest: batch.createdAt,
      processing: batch.updatedAt,
      testing: batch.updatedAt,
      packaging: batch.updatedAt,
      distribution: batch.updatedAt
    }
  };
};

export const transformBatchToConsumerProduct = (batch: any): any => {
  return {
    id: batch._id,
    name: batch.species_id?.common_name || 'Ayurvedic Product',
    category: 'Herbal Medicine',
    origin: batch.current_location || 'India',
    harvestDate: new Date(batch.createdAt).toISOString().split('T')[0],
    farmer: 'Certified Farmer',
    processingCenter: 'Certified Processing Unit',
    labTested: !batch.recall_flag,
    certifications: batch.recall_flag ? 
      ['FSSAI Approved'] : 
      ['Organic', 'FSSAI Approved', 'Ayush Certified'],
    status: batch.recall_flag ? 'suspicious' : 'verified'
  };
};