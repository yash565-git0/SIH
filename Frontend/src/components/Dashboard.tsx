import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, MapPin, AlertTriangle, CheckCircle, Clock, Leaf, Award } from 'lucide-react';

export function Dashboard() {
  // Mock data for charts
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

  const recentEvents = [
    {
      id: 1,
      type: 'collection',
      title: 'New Ashwagandha batch collected',
      location: 'Rajasthan Farm #247',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'quality',
      title: 'Quality test completed',
      location: 'Mumbai Lab',
      timestamp: '4 hours ago',
      status: 'passed'
    },
    {
      id: 3,
      type: 'processing',
      title: 'Processing step initiated',
      location: 'Jaipur Facility',
      timestamp: '6 hours ago',
      status: 'in-progress'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Moisture content anomaly detected',
      location: 'Gujarat Collection Point',
      timestamp: '8 hours ago',
      status: 'attention'
    }
  ];

  const kpiCards = [
    {
      title: 'Total Collections',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Active Farmers',
      value: '1,234',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Quality Pass Rate',
      value: '98.7%',
      change: '+2.1%',
      trend: 'up',
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Avg. Farm-to-Consumer',
      value: '7.2 days',
      change: '-1.8%',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Stakeholder Dashboard</h2>
        <p className="text-gray-700">Real-time insights into the Ayurvedic supply chain network</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  kpi.color === 'blue' ? 'bg-blue-100' :
                  kpi.color === 'green' ? 'bg-green-100' :
                  kpi.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <kpi.icon className={`w-6 h-6 ${
                    kpi.color === 'blue' ? 'text-blue-600' :
                    kpi.color === 'green' ? 'text-green-600' :
                    kpi.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                <div className={`flex items-center text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? 
                    <TrendingUp className="w-4 h-4 mr-1" /> : 
                    <TrendingDown className="w-4 h-4 mr-1" />
                  }
                  {kpi.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Harvest Volume Chart */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Monthly Harvest Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={harvestVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#2563eb" name="Actual (tons)" />
                <Bar dataKey="target" fill="#93c5fd" name="Target (tons)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Trends */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Quality Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="gradeA" stroke="#10b981" strokeWidth={2} name="Grade A %" />
                <Line type="monotone" dataKey="gradeB" stroke="#f59e0b" strokeWidth={2} name="Grade B %" />
                <Line type="monotone" dataKey="gradeC" stroke="#ef4444" strokeWidth={2} name="Grade C %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Species Distribution */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Species Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={speciesDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {speciesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">Recent Network Activity</CardTitle>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.status === 'completed' ? 'bg-green-100' :
                    event.status === 'passed' ? 'bg-blue-100' :
                    event.status === 'in-progress' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {event.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     event.status === 'passed' ? <Award className="w-5 h-5 text-blue-600" /> :
                     event.status === 'in-progress' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                     <AlertTriangle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          event.status === 'completed' || event.status === 'passed' ? 'border-green-300 text-green-700' :
                          event.status === 'in-progress' ? 'border-yellow-300 text-yellow-700' :
                          'border-red-300 text-red-700'
                        }`}
                      >
                        {event.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Health */}
      <Card className="mt-8 border-green-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Network Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Blockchain Nodes</span>
                <span className="text-sm text-green-600">24/24 Online</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Transaction Processing</span>
                <span className="text-sm text-green-600">Normal</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Data Sync</span>
                <span className="text-sm text-green-600">99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">47,291</div>
              <div className="text-xs text-gray-600">Total Blocks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">156,742</div>
              <div className="text-xs text-gray-600">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">2.3s</div>
              <div className="text-xs text-gray-600">Avg Block Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">15 TPS</div>
              <div className="text-xs text-gray-600">Throughput</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}