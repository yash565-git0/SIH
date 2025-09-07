import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FlaskConical, CheckCircle, XCircle, Clock, Search, FileText, AlertTriangle, Beaker, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';

interface LaboratoryDashboardProps {
  onLogout: () => void;
}

interface TestSample {
  id: string;
  productId: string;
  productName: string;
  farmer: string;
  harvestDate: string;
  submissionDate: string;
  testType: string[];
  status: 'pending' | 'approved' | 'rejected' | 'testing';
  results?: TestResults;
  priority: 'high' | 'medium' | 'low';
  processingCenter: string;
}

interface TestResults {
  purity: number;
  moisture: number;
  contamination: string;
  activeCompounds: { [key: string]: number };
  microbiological: string;
  heavyMetals: string;
  pesticides: string;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  certified: boolean;
  notes: string;
}

export function LaboratoryDashboard({ onLogout }: LaboratoryDashboardProps) {
  const [samples, setSamples] = useState<TestSample[]>([
    {
      id: 'TS-001',
      productId: 'AYR-001-2024',
      productName: 'Ashwagandha Root Extract',
      farmer: 'Ramesh Kumar',
      harvestDate: '2024-01-15',
      submissionDate: '2024-01-20',
      testType: ['Purity', 'Microbiological', 'Heavy Metals'],
      status: 'approved',
      priority: 'high',
      processingCenter: 'AyurTech Processing Unit',
      results: {
        purity: 95.2,
        moisture: 8.5,
        contamination: 'None detected',
        activeCompounds: { 'Withanolides': 3.2, 'Alkaloids': 0.8 },
        microbiological: 'Pass',
        heavyMetals: 'Within limits',
        pesticides: 'Not detected',
        overallGrade: 'A',
        certified: true,
        notes: 'Excellent quality sample meeting all standards'
      }
    },
    {
      id: 'TS-002',
      productId: 'AYR-002-2024',
      productName: 'Turmeric Powder',
      farmer: 'Lakshmi Nair',
      harvestDate: '2024-02-10',
      submissionDate: '2024-02-12',
      testType: ['Purity', 'Curcumin Content', 'Microbiological'],
      status: 'testing',
      priority: 'medium',
      processingCenter: 'Spice Valley Processing'
    },
    {
      id: 'TS-003',
      productId: 'AYR-003-2024',
      productName: 'Brahmi Extract',
      farmer: 'Suresh Patel',
      harvestDate: '2024-01-25',
      submissionDate: '2024-01-28',
      testType: ['Purity', 'Bacosides Content', 'Heavy Metals'],
      status: 'pending',
      priority: 'high',
      processingCenter: 'Herbal Labs Processing'
    }
  ]);

  const [selectedSample, setSelectedSample] = useState<TestSample | null>(null);
  const [testResults, setTestResults] = useState<Partial<TestResults>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (sampleId: string) => {
    setSamples(prev => prev.map(sample => 
      sample.id === sampleId 
        ? { ...sample, status: 'approved' as const, results: testResults as TestResults }
        : sample
    ));
    toast("Sample approved successfully!", {
      description: "Test results have been recorded to blockchain.",
      duration: 3000,
    });
    setSelectedSample(null);
    setTestResults({});
  };

  const handleReject = (sampleId: string) => {
    setSamples(prev => prev.map(sample => 
      sample.id === sampleId 
        ? { ...sample, status: 'rejected' as const }
        : sample
    ));
    toast("Sample rejected", {
      description: "Sample has been marked as rejected.",
      duration: 3000,
    });
    setSelectedSample(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'testing': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'testing': return <Beaker className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredSamples = samples.filter(sample => 
    sample.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.farmer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSamples = filteredSamples.filter(s => s.status === 'pending' || s.status === 'testing');
  const completedSamples = filteredSamples.filter(s => s.status === 'approved' || s.status === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Laboratory Dashboard
            </h1>
            <p className="text-slate-600">Review and approve test results</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{samples.filter(s => s.status === 'pending').length}</p>
                <p className="text-sm text-blue-700">Pending Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Beaker className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900">{samples.filter(s => s.status === 'testing').length}</p>
                <p className="text-sm text-amber-700">In Testing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-900">{samples.filter(s => s.status === 'approved').length}</p>
                <p className="text-sm text-emerald-700">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{samples.filter(s => s.status === 'rejected').length}</p>
                <p className="text-sm text-red-700">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-white/80 backdrop-blur-sm border-teal-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-teal-500" />
            <Input
              placeholder="Search by sample ID, product name, or farmer..."
              className="pl-10 border-teal-200 focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-teal-50 border border-teal-200">
          <TabsTrigger value="pending" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Pending Samples ({pendingSamples.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Completed ({completedSamples.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingSamples.map((sample) => (
  <Card key={sample.id} className="bg-white/80 backdrop-blur-sm border-teal-200 hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg text-teal-900">{sample.productName}</CardTitle>
          <p className="text-sm text-slate-600 font-mono">{sample.id}</p>
        </div>
        <div className="flex space-x-2">
          <Badge className={`${getPriorityColor(sample.priority)} text-xs`}>
            {sample.priority}
          </Badge>
          <Badge className={`${getStatusColor(sample.status)} flex items-center space-x-1`}>
            {getStatusIcon(sample.status)}
            <span>{sample.status}</span>
          </Badge>
        </div>
      </div>
    </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Farmer</p>
                        <p className="font-medium text-slate-900">{sample.farmer}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Harvest Date</p>
                        <p className="font-medium text-slate-900">{sample.harvestDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Submission Date</p>
                        <p className="font-medium text-slate-900">{sample.submissionDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Processing Center</p>
                        <p className="font-medium text-slate-900">{sample.processingCenter}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-slate-500 text-sm">Test Types</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sample.testType.map((test, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-teal-100 text-teal-800">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button
                        onClick={() => setSelectedSample(sample)}
                        size="sm"
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {sample.status === 'pending' && (
                        <Button
                          onClick={() => setSamples(prev => prev.map(s => 
                            s.id === sample.id ? { ...s, status: 'testing' as const } : s
                          ))}
                          variant="outline"
                          size="sm"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Start Testing
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {completedSamples.map((sample) => (
              <Card key={sample.id} className="bg-white/80 backdrop-blur-sm border-teal-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-teal-900">{sample.productName}</h3>
                        <p className="text-sm text-slate-600 font-mono">{sample.id} • {sample.farmer}</p>
                      </div>
                      {sample.results && (
                        <Badge className="bg-slate-100 text-slate-800 border border-slate-300">
                          Grade {sample.results.overallGrade}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(sample.status)} flex items-center space-x-1`}>
                        {getStatusIcon(sample.status)}
                        <span>{sample.status}</span>
                      </Badge>
                      <Button
                        onClick={() => setSelectedSample(sample)}
                        size="sm"
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Sample Detail Modal/Panel */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-teal-900">{selectedSample.productName}</CardTitle>
                  <p className="text-slate-600 font-mono">{selectedSample.id}</p>
                </div>
                <Button
                  onClick={() => {setSelectedSample(null); setTestResults({});}}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSample.status === 'approved' && selectedSample.results ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <h4 className="font-semibold text-emerald-900 mb-2">Test Results Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Overall Grade:</span>
                          <Badge className="bg-emerald-100 text-emerald-800">{selectedSample.results.overallGrade}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Purity:</span>
                          <span className="font-medium">{selectedSample.results.purity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Moisture:</span>
                          <span className="font-medium">{selectedSample.results.moisture}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Certified:</span>
                          <span className="font-medium">{selectedSample.results.certified ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Safety Checks</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Microbiological:</span>
                          <span className="font-medium">{selectedSample.results.microbiological}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heavy Metals:</span>
                          <span className="font-medium">{selectedSample.results.heavyMetals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pesticides:</span>
                          <span className="font-medium">{selectedSample.results.pesticides}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contamination:</span>
                          <span className="font-medium">{selectedSample.results.contamination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedSample.results.notes && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2">Lab Notes</h4>
                      <p className="text-slate-700">{selectedSample.results.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Farmer:</p>
                      <p className="font-medium">{selectedSample.farmer}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Harvest Date:</p>
                      <p className="font-medium">{selectedSample.harvestDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Processing Center:</p>
                      <p className="font-medium">{selectedSample.processingCenter}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Priority:</p>
                      <Badge className={getPriorityColor(selectedSample.priority)}>
                        {selectedSample.priority}
                      </Badge>
                    </div>
                  </div>

                  {selectedSample.status === 'testing' && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-900">Enter Test Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-amber-900">Purity (%)</Label>
                          <Input
                            type="number"
                            placeholder="95.0"
                            onChange={(e) => setTestResults(prev => ({ ...prev, purity: parseFloat(e.target.value) }))}
                            className="border-amber-300"
                          />
                        </div>
                        <div>
                          <Label className="text-amber-900">Overall Grade</Label>
                          <Select onValueChange={(value) => setTestResults(prev => ({ ...prev, overallGrade: value as 'A' | 'B' | 'C' | 'D' }))}>
                            <SelectTrigger className="border-amber-300">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Grade A</SelectItem>
                              <SelectItem value="B">Grade B</SelectItem>
                              <SelectItem value="C">Grade C</SelectItem>
                              <SelectItem value="D">Grade D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-amber-900">Lab Notes</Label>
                        <Textarea
                          placeholder="Enter test observations and notes..."
                          onChange={(e) => setTestResults(prev => ({ ...prev, notes: e.target.value }))}
                          className="border-amber-300"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleApprove(selectedSample.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedSample.id)}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}