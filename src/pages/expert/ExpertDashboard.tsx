
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuestions } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ExpertDashboard() {
  const { user } = useAuth();
  const { questions } = useQuestions();
  
  const pendingQuestions = questions.filter(q => q.status === "pending");
  const answeredQuestions = questions.filter(q => q.status === "answered");
  
  // Get recent questions the expert answered
  const expertAnsweredQuestions = answeredQuestions.filter(q => 
    q.answers && q.answers.some(answer => answer.expert_id === user?.id)
  );
  
  return (
    <div className="page-container">
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">Expert Dashboard</Heading>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-krishi-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-krishi-700">Pending Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-krishi-600">{pendingQuestions.length}</Text>
                <Text variant="muted">Questions awaiting answers</Text>
              </CardContent>
            </Card>
            
            <Card className="border-krishi-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-krishi-700">Questions Answered</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-krishi-600">{expertAnsweredQuestions.length}</Text>
                <Text variant="muted">Your contributions</Text>
              </CardContent>
            </Card>
            
            <Card className="border-krishi-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-krishi-700">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Text size="4xl" className="font-bold text-krishi-600">{questions.length}</Text>
                <Text variant="muted">In the platform</Text>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card className="border-krishi-200">
            <CardHeader>
              <CardTitle className="text-krishi-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-krishi-600 hover:bg-krishi-700">
                <Link to="/expert/questions">Answer Questions</Link>
              </Button>
              <Text size="sm" variant="muted" className="text-center">
                Help farmers by sharing your expertise
              </Text>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border-krishi-200">
            <CardHeader>
              <CardTitle className="text-krishi-700">Recent Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingQuestions.slice(0, 5).map((question) => (
                <div key={question.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Text className="font-medium">{question.title}</Text>
                      <Text size="sm" variant="muted" className="mt-1">
                        Crop: {question.crop} • {format(new Date(question.created_at), "MMM d, yyyy")}
                      </Text>
                      <Text size="sm" variant="muted">
                        by {question.farmer?.name || "Unknown Farmer"}
                      </Text>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
              
              {pendingQuestions.length === 0 && (
                <div className="text-center py-6">
                  <Text variant="muted">No pending questions at the moment.</Text>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-krishi-200 mt-6">
            <CardHeader>
              <CardTitle className="text-krishi-700">Your Recent Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expertAnsweredQuestions.slice(0, 3).map((question) => {
                const userAnswer = question.answers?.find(answer => answer.expert_id === user?.id);
                
                return (
                  <div key={question.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Text className="font-medium">{question.title}</Text>
                        <Text size="sm" variant="muted" className="mt-1">
                          Crop: {question.crop} • {format(new Date(question.created_at), "MMM d, yyyy")}
                        </Text>
                        {userAnswer && (
                          <Text size="sm" className="mt-2 text-gray-600 line-clamp-2">
                            Your answer: {userAnswer.content.substring(0, 100)}...
                          </Text>
                        )}
                      </div>
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        Answered
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {expertAnsweredQuestions.length === 0 && (
                <div className="text-center py-6">
                  <Text variant="muted">You haven't answered any questions yet.</Text>
                  <Button asChild className="mt-4 bg-krishi-600 hover:bg-krishi-700">
                    <Link to="/expert/questions">Start Helping Farmers</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Featured Section */}
      <Card className="border-krishi-200 mt-6">
        <CardHeader>
          <CardTitle className="text-krishi-700">Platform Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🌾</div>
            <Text className="font-medium">Most Asked About</Text>
            <Text size="sm" variant="muted">Rice and Wheat crops</Text>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <Text className="font-medium">Response Rate</Text>
            <Text size="sm" variant="muted">85% questions answered</Text>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <Text className="font-medium">Active Users</Text>
            <Text size="sm" variant="muted">Growing community</Text>
          </div>
        </CardContent>
      </Card>
      
      {/* Urgent Questions */}
      {pendingQuestions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 mt-6">
          <CardHeader>
            <CardTitle className="text-amber-800">Urgent: Questions Need Your Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingQuestions.slice(0, 2).map((question) => (
                <div key={question.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <Text className="font-medium">{question.title}</Text>
                    <Text size="sm" variant="muted">
                      {question.farmer?.name || "Unknown Farmer"} • {format(new Date(question.created_at), "MMM d")}
                    </Text>
                  </div>
                  {question.image_url && (
                    <div className="ml-4">
                      <img 
                        src={question.image_url} 
                        alt="Question attachment" 
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
              <Link to="/expert/questions">View All Pending Questions</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
