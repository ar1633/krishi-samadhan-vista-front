
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { warehouses } = useWarehouses();
  
  // Filter warehouses for the current vendor
  const vendorWarehouses = user ? warehouses.filter(w => w.vendor_id === user.id) : [];
  
  // Calculate stats
  const totalCapacity = vendorWarehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalAvailable = vendorWarehouses.reduce((sum, w) => sum + w.available, 0);
  const totalUsed = totalCapacity - totalAvailable;
  const utilizationPercentage = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
  
  return (
    <div className="page-container">
      <Heading as="h1" size="xl" className="text-earth-800 mb-6">Vendor Dashboard</Heading>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card className="border-earth-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-earth-700">Total Warehouses</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-earth-600">{vendorWarehouses.length}</Text>
                <Text variant="muted">Properties managed</Text>
              </CardContent>
            </Card>
            
            <Card className="border-earth-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-earth-700">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-earth-600">{totalCapacity.toLocaleString()}</Text>
                <Text variant="muted">Tons available</Text>
              </CardContent>
            </Card>
            
            <Card className="border-earth-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-earth-700">Space Used</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-earth-600">{totalUsed.toLocaleString()}</Text>
                <Text variant="muted">Tons occupied</Text>
              </CardContent>
            </Card>
            
            <Card className="border-earth-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-earth-700">Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-earth-600">{utilizationPercentage}%</Text>
                <Progress value={utilizationPercentage} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card className="border-earth-200">
            <CardHeader>
              <CardTitle className="text-earth-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-earth-700 hover:bg-earth-800">
                <Link to="/vendor/warehouses">Manage Warehouses</Link>
              </Button>
              <Text size="sm" variant="muted" className="text-center">
                Add, edit, or monitor your storage facilities
              </Text>
            </CardContent>
          </Card>
          
          <Card className="border-earth-200 mt-6">
            <CardHeader>
              <CardTitle className="text-earth-700">Storage Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Text size="sm">Available Space:</Text>
                <Text size="sm" className="font-medium">{totalAvailable.toLocaleString()} tons</Text>
              </div>
              <div className="flex justify-between">
                <Text size="sm">Revenue Potential:</Text>
                <Text size="sm" className="font-medium text-green-600">High</Text>
              </div>
              <div className="flex justify-between">
                <Text size="sm">Efficiency:</Text>
                <Text size="sm" className="font-medium">
                  {utilizationPercentage > 80 ? "Excellent" : utilizationPercentage > 60 ? "Good" : "Room for improvement"}
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Warehouse Overview */}
        <div className="lg:col-span-2">
          <Card className="border-earth-200">
            <CardHeader>
              <CardTitle className="text-earth-700">Warehouse Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorWarehouses.slice(0, 5).map((warehouse) => {
                const warehouseUtilization = Math.round(((warehouse.capacity - warehouse.available) / warehouse.capacity) * 100);
                return (
                  <div key={warehouse.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Text className="font-medium">{warehouse.name}</Text>
                        <Text size="sm" variant="muted" className="mt-1">
                          {warehouse.location}
                        </Text>
                        <div className="mt-2 flex items-center space-x-4">
                          <Text size="sm">
                            Capacity: {warehouse.capacity.toLocaleString()} tons
                          </Text>
                          <Text size="sm">
                            Available: {warehouse.available.toLocaleString()} tons
                          </Text>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <Text size="sm" className="font-medium">{warehouseUtilization}%</Text>
                        <Progress value={warehouseUtilization} className="w-20 mt-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {vendorWarehouses.length === 0 && (
                <div className="text-center py-6">
                  <Text variant="muted">No warehouses added yet.</Text>
                  <Button asChild className="mt-4 bg-earth-700 hover:bg-earth-800">
                    <Link to="/vendor/warehouses">Add Your First Warehouse</Link>
                  </Button>
                </div>
              )}
              
              {vendorWarehouses.length > 5 && (
                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link to="/vendor/warehouses">View All Warehouses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <Card className="border-earth-200 mt-6">
        <CardHeader>
          <CardTitle className="text-earth-700">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <Text className="font-medium">Occupancy Rate</Text>
            <Text size="lg" className="font-bold text-earth-600">{utilizationPercentage}%</Text>
            <Text size="sm" variant="muted">Current utilization</Text>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🏢</div>
            <Text className="font-medium">Average Warehouse Size</Text>
            <Text size="lg" className="font-bold text-earth-600">
              {vendorWarehouses.length > 0 ? Math.round(totalCapacity / vendorWarehouses.length).toLocaleString() : 0}
            </Text>
            <Text size="sm" variant="muted">Tons per warehouse</Text>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <Text className="font-medium">Efficiency Score</Text>
            <Text size="lg" className="font-bold text-earth-600">
              {utilizationPercentage > 80 ? "A+" : utilizationPercentage > 60 ? "B+" : "C"}
            </Text>
            <Text size="sm" variant="muted">Based on utilization</Text>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      {vendorWarehouses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 mt-6">
          <CardHeader>
            <CardTitle className="text-blue-800">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {utilizationPercentage < 50 && (
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">💡</span>
                  <div>
                    <Text className="font-medium">Increase Utilization</Text>
                    <Text size="sm" variant="muted">Your warehouses are underutilized. Consider marketing to more farmers or adjusting pricing.</Text>
                  </div>
                </div>
              )}
              
              {utilizationPercentage > 90 && (
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">🚀</span>
                  <div>
                    <Text className="font-medium">Expand Capacity</Text>
                    <Text size="sm" variant="muted">Your warehouses are nearly full. Consider adding more storage facilities to meet demand.</Text>
                  </div>
                </div>
              )}
              
              {vendorWarehouses.length === 1 && (
                <div className="flex items-start space-x-3">
                  <span className="text-amber-600 text-xl">📍</span>
                  <div>
                    <Text className="font-medium">Diversify Locations</Text>
                    <Text size="sm" variant="muted">Consider adding warehouses in different locations to serve more farmers.</Text>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
