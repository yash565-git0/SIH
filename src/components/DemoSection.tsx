import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Play, Pause, RotateCcw, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Package, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface DemoMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface SimulationEvent {
  id: string;
  timestamp: string;
  type: 'collection' | 'processing' | 'testing' | 'manufacturing' | 'distribution';
  title: string;
  location: string;
  status: 'completed' | 'in-progress' | 'pending';
  details: string;
}

export function DemoSection() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [events, setEvents] = useState<SimulationEvent[]>([]);

  const demoSteps = [
    'Initializing blockchain network...',
    'Farmers registering collection events...',
    'GPS coordinates verified and logged...',
    'Processing facilities receiving batches...',
    'Quality testing laboratories analyzing samples...',
    'Manufacturing facilities creating finished products...',
    'QR codes generated and blockchain records finalized...',
    'Products distributed to verified retailers...',
    'Consumers scanning QR codes for verification...',
    'Demo simulation completed successfully!'
  ];

  const [metrics, setMetrics] = useState<DemoMetric[]>([
    { label: 'Active Nodes', value: '24', change: '+2', trend: 'up', color: 'blue' },
    { label: 'Transactions', value: '1,247', change: '+156', trend: 'up', color: 'green' },
    { label: 'Success Rate', value: '98.7%', change: '+1.2%', trend: 'up', color: 'purple' },
    { label: 'Avg Response', value: '1.2s', change: '-0.3s', trend: 'up', color: 'orange' }
  ]);

  const simulationEvents: SimulationEvent[] = [
    {
      id: '1',
      timestamp: '10:30:15',
      type: 'collection',
      title: 'Ashwagandha Collection Event',
      location: 'Rajasthan Farm #247',
      status: 'completed',
      details: 'GPS: 26.9124°N, 75.7873°E • Quality: Grade A • Weight: 50kg'
    },
    {
      id: '2',
      timestamp: '11:45:22',
      type: 'processing',
      title: 'Primary Processing Initiated',
      location: 'Jaipur Processing Unit',
      status: 'completed',
      details: 'Air drying at 45°C • Batch #RAJ-2025-001 • Duration: 48 hours'
    },
    {
      id: '3',
      timestamp: '13:20:08',
      type: 'testing',
      title: 'Quality Analysis Started',
      location: 'Mumbai AYUSH Lab',
      status: 'in-progress',
      details: 'Heavy metals, pesticides, DNA barcoding • Expected completion: 2 hours'
    },
    {
      id: '4',
      timestamp: '15:15:33',
      type: 'manufacturing',
      title: 'Manufacturing Process',
      location: 'Bengaluru Plant',
      status: 'pending',
      details: 'Capsule formulation • 10,000 units • QR code generation pending'
    },
    {
      id: '5',
      timestamp: '16:30:00',
      type: 'distribution',
      title: 'Distribution Network',
      location: 'Pan India',
      status: 'pending',
      details: 'Cold chain logistics • 150+ retailers • ETA: 24 hours'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        if (currentStep < demoSteps.length - 1) {
          const stepInterval = 3; // 3 seconds per step
          if (elapsedTime > 0 && elapsedTime % stepInterval === 0) {
            setCurrentStep(prev => Math.min(prev + 1, demoSteps.length - 1));
            
            // Add events progressively
            if (currentStep < simulationEvents.length) {
              setEvents(prev => [...prev, simulationEvents[currentStep]]);
            }
          }
        }

        // Update metrics periodically
        if (elapsedTime % 5 === 0) {
          setMetrics(prev => prev.map(metric => ({
            ...metric,
            value: metric.label === 'Active Nodes' ? String(24 + Math.floor(Math.random() * 3)) :
                   metric.label === 'Transactions' ? String(1247 + elapsedTime * 2) :
                   metric.label === 'Success Rate' ? `${(98.7 + Math.random() * 0.6).toFixed(1)}%` :
                   `${(1.2 + Math.random() * 0.3).toFixed(1)}s`
          })));
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedTime, currentStep]);

  const startSimulation = () => {
    setIsRunning(true);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setElapsedTime(0);
    setEvents([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Live Pilot Demonstration</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Experience a real-time simulation of our blockchain traceability system processing Ashwagandha from harvest to consumer
        </p>
      </div>

      {/* Control Panel */}
      <Card className="mb-8 border-blue-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              Simulation Control Panel
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-gray-600">Elapsed Time</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button
              onClick={startSimulation}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Demo
            </Button>
            <Button
              onClick={pauseSimulation}
              disabled={!isRunning}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Simulation Progress</span>
              <span className="text-sm text-gray-600">{currentStep + 1} of {demoSteps.length}</span>
            </div>
            <Progress value={((currentStep + 1) / demoSteps.length) * 100} className="h-3" />
            <div className="text-sm text-blue-600 font-medium">
              {demoSteps[currentStep]}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={{ scale: elapsedTime % 5 === 0 && isRunning ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    metric.color === 'blue' ? 'bg-blue-100' :
                    metric.color === 'green' ? 'bg-green-100' :
                    metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {metric.label === 'Active Nodes' ? <Package className={`w-5 h-5 ${metric.color === 'blue' ? 'text-blue-600' : 'text-gray-600'}`} /> :
                     metric.label === 'Transactions' ? <TrendingUp className={`w-5 h-5 ${metric.color === 'green' ? 'text-green-600' : 'text-gray-600'}`} /> :
                     metric.label === 'Success Rate' ? <Award className={`w-5 h-5 ${metric.color === 'purple' ? 'text-purple-600' : 'text-gray-600'}`} /> :
                     <Clock className={`w-5 h-5 ${metric.color === 'orange' ? 'text-orange-600' : 'text-gray-600'}`} />}
                  </div>
                  <Badge className={`text-xs ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {metric.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Live Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.length === 0 && !isRunning ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start the simulation to see live events</p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.status === 'completed' ? 'bg-green-100' :
                          event.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          {event.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           event.status === 'in-progress' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                           <AlertTriangle className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600">{event.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{event.timestamp}</div>
                        <Badge className={`text-xs mt-1 ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 pl-10">{event.details}</p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Status */}
        <Card className="border-green-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Blockchain Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Hyperledger Fabric network is operational with all nodes synchronized
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Network Consensus</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Progress value={100} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600">{47291 + currentStep * 3}</div>
                    <div className="text-xs text-gray-600">Total Blocks</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{156742 + elapsedTime * 2}</div>
                    <div className="text-xs text-gray-600">Transactions</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Block Generation Time</span>
                    <span className="font-medium text-gray-900">2.3s avg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Smart Contract Calls</span>
                    <span className="font-medium text-gray-900">45,678</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gas Usage Efficiency</span>
                    <span className="font-medium text-green-600">96.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Results */}
      {currentStep === demoSteps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Demo Completed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-sm text-gray-700">Traceability Coverage</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">7.2 days</div>
                  <div className="text-sm text-gray-700">Farm-to-Consumer Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.8%</div>
                  <div className="text-sm text-gray-700">Verification Success Rate</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-700 mb-4">
                  The simulation demonstrates complete end-to-end traceability with immutable blockchain records, 
                  automated quality validation, and consumer transparency.
                </p>
                <Button onClick={resetSimulation} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Run Demo Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}