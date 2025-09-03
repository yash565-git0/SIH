import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Shield, 
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

export function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  
  const verificationData = [
    { month: 'Jan', verified: 156, pending: 12, failed: 3 },
    { month: 'Feb', verified: 203, pending: 8, failed: 2 },
    { month: 'Mar', verified: 287, pending: 15, failed: 1 },
    { month: 'Apr', verified: 341, pending: 9, failed: 4 },
    { month: 'May', verified: 398, pending: 11, failed: 2 },
    { month: 'Jun', verified: 456, pending: 7, failed: 1 }
  ];

  const supplyChainData = [
    { name: 'Ashwagandha', value: 35, color: '#059669' },
    { name: 'Turmeric', value: 28, color: '#fbbf24' },
    { name: 'Brahmi', value: 18, color: '#0d9488' },
    { name: 'Neem', value: 12, color: '#84cc16' },
    { name: 'Others', value: 7, color: '#6b7280' }
  ];

  const realtimeMetrics = [
    { time: '00:00', transactions: 23, verifications: 18 },
    { time: '04:00', transactions: 31, verifications: 25 },
    { time: '08:00', transactions: 45, verifications: 39 },
    { time: '12:00', transactions: 67, verifications: 61 },
    { time: '16:00', transactions: 52, verifications: 48 },
    { time: '20:00', transactions: 38, verifications: 34 },
    { time: '24:00', transactions: 28, verifications: 24 }
  ];

  const stakeholderStats = [
    { icon: Users, label: 'Active Farmers', value: '247', change: '+12%', color: 'text-emerald-600' },
    { icon: Package, label: 'Tracked Batches', value: '1,842', change: '+8%', color: 'text-teal-600' },
    { icon: Shield, label: 'Verified Products', value: '99.2%', change: '+0.3%', color: 'text-amber-600' },
    { icon: Globe, label: 'Global Reach', value: '23', change: '+2', color: 'text-blue-600' }
  ];

  const recentAlerts = [
    { type: 'success', message: 'Batch AY-2024-156 verified successfully', time: '2 min ago' },
    { type: 'warning', message: 'Temperature deviation in cold chain transport', time: '15 min ago' },
    { type: 'info', message: 'New farmer onboarded in Kerala region', time: '1 hour ago' },
    { type: 'success', message: 'Smart contract deployed for new herb type', time: '2 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
                Analytics Dashboard
              </h2>
              <p className="text-xl text-gray-600">
                Real-time insights into your Ayurvedic supply chain ecosystem
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-emerald-100">
                {['7d', '30d', '90d', '1y'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedTimeframe === period ? 'default' : 'ghost'}
                    size="sm"
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      selectedTimeframe === period 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                    onClick={() => setSelectedTimeframe(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stakeholderStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-600 mt-1">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* Main Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white border border-emerald-100 rounded-2xl p-1">
                <TabsTrigger value="verification" className="rounded-xl">Verification Trends</TabsTrigger>
                <TabsTrigger value="supply" className="rounded-xl">Supply Distribution</TabsTrigger>
                <TabsTrigger value="realtime" className="rounded-xl">Real-time Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="verification" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-emerald-700 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Verification Analytics
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                        Verified
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                        Pending
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        Failed
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={verificationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #d1fae5',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Bar dataKey="verified" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failed" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>
              
              <TabsContent value="supply" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 mb-6 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Supply Chain Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={supplyChainData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {supplyChainData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {supplyChainData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="font-bold text-gray-800">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="realtime" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Real-time Activity
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={realtimeMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #d1fae5',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#059669" 
                        fill="#059669" 
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="verifications" 
                        stroke="#0d9488" 
                        fill="#0d9488" 
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* System Health */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                System Health
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Blockchain Sync</span>
                    <span className="text-sm font-semibold text-emerald-600">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">IoT Connectivity</span>
                    <span className="text-sm font-semibold text-teal-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">API Response</span>
                    <span className="text-sm font-semibold text-amber-600">156ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Recent Alerts */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'success' ? 'bg-emerald-500' :
                      alert.type === 'warning' ? 'bg-amber-500' :
                      alert.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-emerald-700 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Batch
                </Button>
                <Button variant="outline" className="w-full justify-start border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Users className="w-4 h-4 mr-2" />
                  Onboard Farmer
                </Button>
                <Button variant="outline" className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50">
                  <Shield className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}