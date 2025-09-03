import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Users, Factory, FlaskConical, Package, Store, Smartphone, Activity, MapPin, Zap } from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'farmer' | 'processor' | 'lab' | 'manufacturer' | 'retailer' | 'consumer';
  name: string;
  location: string;
  status: 'active' | 'idle' | 'processing';
  transactions: number;
  position: { x: number; y: number };
  icon: any;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  active: boolean;
}

export function NetworkVisualization() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [animateConnections, setAnimateConnections] = useState(false);

  const nodes: NetworkNode[] = [
    {
      id: 'farmer1',
      type: 'farmer',
      name: 'Sunrise Organic Farm',
      location: 'Rajasthan',
      status: 'active',
      transactions: 156,
      position: { x: 15, y: 25 },
      icon: Users,
      color: 'green'
    },
    {
      id: 'farmer2',
      type: 'farmer',
      name: 'Green Valley Collective',
      location: 'Gujarat',
      status: 'processing',
      transactions: 89,
      position: { x: 25, y: 45 },
      icon: Users,
      color: 'green'
    },
    {
      id: 'farmer3',
      type: 'farmer',
      name: 'Heritage Herbs Farm',
      location: 'Kerala',
      status: 'idle',
      transactions: 203,
      position: { x: 20, y: 65 },
      icon: Users,
      color: 'green'
    },
    {
      id: 'processor1',
      type: 'processor',
      name: 'Natural Processing Unit',
      location: 'Jaipur',
      status: 'active',
      transactions: 445,
      position: { x: 40, y: 35 },
      icon: Factory,
      color: 'blue'
    },
    {
      id: 'lab1',
      type: 'lab',
      name: 'AYUSH Certified Lab',
      location: 'Mumbai',
      status: 'processing',
      transactions: 278,
      position: { x: 60, y: 30 },
      icon: FlaskConical,
      color: 'purple'
    },
    {
      id: 'lab2',
      type: 'lab',
      name: 'Quality Assurance Center',
      location: 'Delhi',
      status: 'active',
      transactions: 134,
      position: { x: 55, y: 55 },
      icon: FlaskConical,
      color: 'purple'
    },
    {
      id: 'manufacturer1',
      type: 'manufacturer',
      name: 'AyurVedic Naturals Ltd',
      location: 'Bengaluru',
      status: 'active',
      transactions: 892,
      position: { x: 75, y: 42 },
      icon: Package,
      color: 'orange'
    },
    {
      id: 'retailer1',
      type: 'retailer',
      name: 'Health Plus Stores',
      location: 'Pan India',
      status: 'active',
      transactions: 1247,
      position: { x: 90, y: 25 },
      icon: Store,
      color: 'red'
    },
    {
      id: 'retailer2',
      type: 'retailer',
      name: 'Wellness Mart',
      location: 'Online',
      status: 'active',
      transactions: 956,
      position: { x: 88, y: 60 },
      icon: Store,
      color: 'red'
    }
  ];

  const connections: Connection[] = [
    { from: 'farmer1', to: 'processor1', active: true },
    { from: 'farmer2', to: 'processor1', active: false },
    { from: 'farmer3', to: 'lab2', active: true },
    { from: 'processor1', to: 'lab1', active: true },
    { from: 'lab1', to: 'manufacturer1', active: true },
    { from: 'lab2', to: 'manufacturer1', active: false },
    { from: 'manufacturer1', to: 'retailer1', active: true },
    { from: 'manufacturer1', to: 'retailer2', active: true }
  ];

  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'farmer': return 'border-green-500 bg-green-50';
      case 'processor': return 'border-blue-500 bg-blue-50';
      case 'lab': return 'border-purple-500 bg-purple-50';
      case 'manufacturer': return 'border-orange-500 bg-orange-50';
      case 'retailer': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateConnections(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Blockchain Network Visualization</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Interactive view of the permissioned blockchain network connecting farmers, processors, labs, and retailers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Network Map */}
        <div className="lg:col-span-2">
          <Card className="border-blue-200 shadow-xl h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Network Activity
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  {connections.map((connection, index) => {
                    const fromNode = getNodeById(connection.from);
                    const toNode = getNodeById(connection.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <motion.line
                        key={`${connection.from}-${connection.to}`}
                        x1={`${fromNode.position.x}%`}
                        y1={`${fromNode.position.y}%`}
                        x2={`${toNode.position.x}%`}
                        y2={`${toNode.position.y}%`}
                        stroke={connection.active ? '#3b82f6' : '#e5e7eb'}
                        strokeWidth="2"
                        strokeDasharray={connection.active ? "5,5" : "none"}
                        initial={{ pathLength: 0 }}
                        animate={{ 
                          pathLength: 1,
                          strokeDashoffset: animateConnections ? -10 : 0
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className={`absolute w-16 h-16 rounded-full border-4 cursor-pointer transition-all duration-300 ${getTypeColor(node.type)} ${
                      activeNode === node.id ? 'scale-125 shadow-lg' : 'hover:scale-110'
                    }`}
                    style={{
                      left: `${node.position.x}%`,
                      top: `${node.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2
                    }}
                    onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-full h-full flex items-center justify-center relative">
                      {(() => {
                        const IconComponent = node.icon;
                        return <IconComponent className="w-6 h-6 text-gray-700" />;
                      })()}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(node.status)}`}></div>
                    </div>
                    
                    {/* Node Label */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-center whitespace-nowrap">
                      <div className="bg-white px-2 py-1 rounded shadow-md border">
                        <div className="font-medium text-gray-800">{node.name}</div>
                        <div className="text-gray-500">{node.location}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details & Network Stats */}
        <div className="space-y-6">
          {/* Node Details */}
          {activeNode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-900">Node Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const node = getNodeById(activeNode);
                    if (!node) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg border-2 ${getTypeColor(node.type)} flex items-center justify-center`}>
                            {(() => {
                              const IconComponent = node.icon;
                              return <IconComponent className="w-6 h-6" />;
                            })()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{node.name}</h3>
                            <p className="text-gray-600 text-sm capitalize">{node.type}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-gray-600 text-xs font-medium">Location</div>
                            <div className="text-gray-900 text-sm">{node.location}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs font-medium">Status</div>
                            <Badge className={`text-xs ${
                              node.status === 'active' ? 'bg-green-100 text-green-800' :
                              node.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {node.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-600 text-xs font-medium mb-1">Transactions Processed</div>
                          <div className="text-2xl font-bold text-blue-600">{node.transactions.toLocaleString()}</div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            <MapPin className="w-4 h-4 mr-2" />
                            View Node Details
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-600 font-medium mb-2">Select a Node</h3>
                <p className="text-gray-500 text-sm">
                  Click on any network node to view detailed information
                </p>
              </CardContent>
            </Card>
          )}

          {/* Network Statistics */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Network Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
                    <div className="text-xs text-gray-600">Total Nodes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {nodes.filter(n => n.status === 'active').length}
                    </div>
                    <div className="text-xs text-gray-600">Active Nodes</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Network Uptime</span>
                    <span className="text-green-600 font-medium">99.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="text-blue-600 font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Transactions</span>
                    <span className="text-purple-600 font-medium">15,247</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Node Types</h4>
                  <div className="space-y-1">
                    {['farmer', 'processor', 'lab', 'manufacturer', 'retailer'].map((type) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize text-gray-600">{type}s</span>
                        <span className="font-medium">
                          {nodes.filter(n => n.type === type).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}