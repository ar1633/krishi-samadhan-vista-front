import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeatherWidget from "@/components/common/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuestions } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { questions } = useQuestions();
  
  // Filter questions for the current farmer
  const farmerQuestions = user ? questions.filter(q => q.farmer_id === user.id) : [];
  const pendingQuestions = farmerQuestions.filter(q => q.status === "pending");
  const answeredQuestions = farmerQuestions.filter(q => q.status === "answered");
  
  return (
    <div className="page-container">
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">Farmer Dashboard</Heading>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Weather */}
        <div>
          <WeatherWidget />
          
          <Card className="mt-6 border-krishi-200">
            <CardHeader>
              <CardTitle className="text-krishi-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-krishi-600 hover:bg-krishi-700">
                <Link to="/farmer/questions/new">Ask New Question</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/farmer/questions">View My Questions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Column - Summary and Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-krishi-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-krishi-700">Pending Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-krishi-600">{pendingQuestions.length}</Text>
                <Text variant="muted">Awaiting expert answers</Text>
              </CardContent>
            </Card>
            
            <Card className="border-krishi-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-krishi-700">Answered Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-krishi-600">{answeredQuestions.length}</Text>
                <Text variant="muted">Responses received</Text>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-krishi-200">
            <CardHeader>
              <CardTitle className="text-krishi-700">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {farmerQuestions.slice(0, 3).map((question) => (
                <div key={question.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text className="font-medium">{question.title}</Text>
                      <Text size="sm" variant="muted" className="mt-1">
                        Crop: {question.crop} • {format(new Date(question.created_at), "MMM d, yyyy")}
                      </Text>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                      question.status === "pending" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {question.status === "pending" ? "Pending" : "Answered"}
                    </div>
                  </div>
                </div>
              ))}
              
              {farmerQuestions.length === 0 && (
                <div className="text-center py-6">
                  <Text variant="muted">No questions asked yet.</Text>
                  <Button asChild className="mt-4 bg-krishi-600 hover:bg-krishi-700">
                    <Link to="/farmer/questions/new">Ask Your First Question</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-krishi-200">
            <CardHeader>
              <CardTitle className="text-krishi-700">Farming Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">🌱</span>
                <div>
                  <Text className="font-medium">Soil Health</Text>
                  <Text size="sm" variant="muted">Regularly test your soil to check pH levels and nutrient content. This helps in making informed decisions about fertilizers.</Text>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-xl">💧</span>
                <div>
                  <Text className="font-medium">Water Management</Text>
                  <Text size="sm" variant="muted">Implement drip irrigation to conserve water while ensuring plants get adequate moisture. Morning is the best time to water most crops.</Text>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-amber-600 text-xl">🌞</span>
                <div>
                  <Text className="font-medium">Crop Rotation</Text>
                  <Text size="sm" variant="muted">Practice crop rotation to maintain soil fertility and prevent pest buildup. Avoid planting same family crops in succession.</Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
