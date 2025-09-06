import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Users, Package, Shield, Globe,
  AlertTriangle, CheckCircle, Clock, Zap, BarChart3, PieChart, Activity, Award, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

export function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // --- KPI / Key Metrics ---
  const kpiCards = [
    { title: 'Total Collections', value: '2,847', change: '+12.5%', trend: 'up', icon: Package, color: 'blue' },
    { title: 'Active Farmers', value: '1,234', change: '+8.3%', trend: 'up', icon: Users, color: 'green' },
    { title: 'Quality Pass Rate', value: '98.7%', change: '+2.1%', trend: 'up', icon: Award, color: 'purple' },
    { title: 'Avg. Farm-to-Consumer', value: '7.2 days', change: '-1.8%', trend: 'down', icon: Clock, color: 'orange' },
    { title: 'Tracked Batches', value: '1,842', change: '+8%', trend: 'up', icon: Package, color: 'teal' },
    { title: 'Verified Products', value: '99.2%', change: '+0.3%', trend: 'up', icon: Shield, color: 'amber' },
    { title: 'Global Reach', value: '23', change: '+2', trend: 'up', icon: Globe, color: 'blue' }
  ];

  // --- Charts Data ---
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

  const harvestVolumeData = [
    { month: 'Jan', volume: 45, target: 50 },
    { month: 'Feb', volume: 52, target: 55 },
    { month: 'Mar', volume: 48, target: 50 },
    { month: 'Apr', volume: 61, target: 60 },
    { month: 'May', volume: 58, target: 65 },
    { month: 'Jun', volume: 67, target: 70 }
  ];

  const qualityTrendsData = [
    { week: 'W1', gradeA: 85, gradeB: 12, gradeC: 3 },
    { week: 'W2', gradeA: 88, gradeB: 10, gradeC: 2 },
    { week: 'W3', gradeA: 91, gradeB: 8, gradeC: 1 },
    { week: 'W4', gradeA: 89, gradeB: 9, gradeC: 2 }
  ];

  const speciesDistribution = [
    { name: 'Ashwagandha', value: 35, color: '#2563eb' },
    { name: 'Brahmi', value: 22, color: '#06b6d4' },
    { name: 'Turmeric', value: 18, color: '#8b5cf6' },
    { name: 'Neem', value: 15, color: '#10b981' },
    { name: 'Others', value: 10, color: '#f59e0b' }
  ];

  // --- Recent Alerts / Activity ---
  const recentAlerts = [
    { type: 'success', message: 'Batch AY-2024-156 verified successfully', time: '2 min ago' },
    { type: 'warning', message: 'Temperature deviation in cold chain transport', time: '15 min ago' },
    { type: 'info', message: 'New farmer onboarded in Kerala region', time: '1 hour ago' },
    { type: 'success', message: 'Smart contract deployed for new herb type', time: '2 hours ago' }
  ];

  const recentEvents = [
    { id: 1, type: 'collection', title: 'New Ashwagandha batch collected', location: 'Rajasthan Farm #247', timestamp: '2 hours ago', status: 'completed' },
    { id: 2, type: 'quality', title: 'Quality test completed', location: 'Mumbai Lab', timestamp: '4 hours ago', status: 'passed' },
    { id: 3, type: 'processing', title: 'Processing step initiated', location: 'Jaipur Facility', timestamp: '6 hours ago', status: 'in-progress' },
    { id: 4, type: 'alert', title: 'Moisture content anomaly detected', location: 'Gujarat Collection Point', timestamp: '8 hours ago', status: 'attention' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
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

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    kpi.color === 'blue' ? 'bg-blue-100' :
                    kpi.color === 'green' ? 'bg-green-100' :
                    kpi.color === 'purple' ? 'bg-purple-100' :
                    kpi.color === 'orange' ? 'bg-orange-100' : 'bg-teal-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      kpi.color === 'blue' ? 'text-blue-600' :
                      kpi.color === 'green' ? 'text-green-600' :
                      kpi.color === 'purple' ? 'text-purple-600' :
                      kpi.color === 'orange' ? 'text-orange-600' : 'text-teal-600'
                    }`} />
                  </div>
                  <div className={`flex items-center text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                <div className="text-sm text-gray-600">{kpi.title}</div>
              </Card>
            );
          })}
        </motion.div>

        {/* Main Analytics + Side Panel */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Tabs */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-emerald-100 rounded-2xl p-1">
                <TabsTrigger value="verification" className="rounded-xl">Verification</TabsTrigger>
                <TabsTrigger value="supply" className="rounded-xl">Supply</TabsTrigger>
                <TabsTrigger value="realtime" className="rounded-xl">Real-time</TabsTrigger>
                <TabsTrigger value="harvest" className="rounded-xl">Harvest & Quality</TabsTrigger>
              </TabsList>

              {/* Verification */}
              <TabsContent value="verification" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <BarChart3 className="w-5 h-5 mr-2" /> Verification Analytics
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={verificationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="verified" fill="#059669" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="failed" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              {/* Supply Distribution */}
              <TabsContent value="supply" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <PieChart className="w-5 h-5 mr-2" /> Supply Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie data={supplyChainData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {supplyChainData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              {/* Real-time Metrics */}
              <TabsContent value="realtime" className="mt-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <Activity className="w-5 h-5 mr-2" /> Real-time Activity
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={realtimeMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Area type="monotone" dataKey="transactions" stroke="#0d9488" fill="#6ee7b7" />
                      <Area type="monotone" dataKey="verifications" stroke="#f59e0b" fill="#fde68a" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              {/* Harvest & Quality */}
              <TabsContent value="harvest" className="mt-6 space-y-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <BarChart3 className="w-5 h-5 mr-2" /> Harvest Volume
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={harvestVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="target" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <LineChart className="w-5 h-5 mr-2" /> Quality Grade Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={qualityTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line type="monotone" dataKey="gradeA" stroke="#059669" />
                      <Line type="monotone" dataKey="gradeB" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="gradeC" stroke="#ef4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center mb-6">
                    <PieChart className="w-5 h-5 mr-2" /> Species Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie data={speciesDistribution} dataKey="value" nameKey="name" outerRadius={80} label>
                        {speciesDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* System / Network Health */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center"><Zap className="w-5 h-5 mr-2" /> System & Network Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Server Uptime</p>
                  <Progress value={98} className="h-3 rounded-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Sync</p>
                  <Progress value={92} className="h-3 rounded-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Network Latency</p>
                  <Progress value={88} className="h-3 rounded-xl" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${alert.type === 'success' ? 'text-green-600' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>{alert.message}</span>
                    <span className="text-gray-400">{alert.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center"><MapPin className="w-5 h-5 mr-2" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-gray-400">{event.location} • {event.timestamp}</p>
                    </div>
                    <Badge className={`uppercase ${event.status === 'completed' ? 'bg-green-100 text-green-700' : event.status === 'passed' ? 'bg-blue-100 text-blue-700' : event.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{event.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}