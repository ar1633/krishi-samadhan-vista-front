
import { useState } from "react";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuestions } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ExpertQuestions() {
  const { user } = useAuth();
  const { questions, answerQuestion } = useQuestions();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState<Record<string, boolean>>({});
  
  const pendingQuestions = questions.filter(q => q.status === "pending");
  const answeredQuestions = questions.filter(q => q.status === "answered");
  
  // Filter questions answered by this expert
  const expertAnsweredQuestions = answeredQuestions.filter(q => 
    q.answers && q.answers.some(answer => answer.expert_id === user?.id)
  );
  
  const handleAnswerChange = (questionId: string, content: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: content }));
  };
  
  const handleSubmitAnswer = async (questionId: string) => {
    const content = answers[questionId];
    if (!content?.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: true }));
      await answerQuestion(questionId, content.trim());
      setAnswers(prev => ({ ...prev, [questionId]: "" }));
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };
  
  const QuestionCard = ({ question, showAnswerForm = false }: { question: any; showAnswerForm?: boolean }) => (
    <Card key={question.id} className="border-krishi-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-krishi-700">{question.title}</CardTitle>
            <Text size="sm" variant="muted" className="mt-1">
              by {question.farmer?.name || "Unknown Farmer"} • {format(new Date(question.created_at), "MMM d, yyyy")}
            </Text>
          </div>
          <Badge variant={question.status === "pending" ? "outline" : "default"}>
            {question.status === "pending" ? "Pending" : "Answered"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Text size="sm" className="font-medium text-gray-600">Crop:</Text>
            <Text>{question.crop}</Text>
          </div>
          
          <div>
            <Text size="sm" className="font-medium text-gray-600">Description:</Text>
            <Text className="mt-1">{question.description}</Text>
          </div>
          
          {question.image_url && (
            <div>
              <Text size="sm" className="font-medium text-gray-600 mb-2">Attached Image:</Text>
              <img 
                src={question.image_url} 
                alt="Question attachment" 
                className="max-w-md h-48 object-cover rounded-lg border"
              />
            </div>
          )}
          
          {showAnswerForm && (
            <div className="space-y-4 mt-6 pt-4 border-t">
              <Text className="font-medium">Your Answer:</Text>
              <Textarea
                placeholder="Provide your expert advice here..."
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={() => handleSubmitAnswer(question.id)}
                disabled={submittingAnswers[question.id] || !answers[question.id]?.trim()}
                className="bg-krishi-600 hover:bg-krishi-700"
              >
                {submittingAnswers[question.id] ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          )}
          
          {question.status === "answered" && question.answers && question.answers.length > 0 && (
            <div className="space-y-3 mt-6 pt-4 border-t">
              <Text className="font-medium">Answer{question.answers.length > 1 ? "s" : ""}:</Text>
              {question.answers.map((answer: any) => (
                <div key={answer.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Text size="sm" className="font-medium text-krishi-700">
                      {answer.expert.name}
                    </Text>
                    <Text size="sm" variant="muted">
                      {format(new Date(answer.created_at), "MMM d, yyyy")}
                    </Text>
                  </div>
                  <Text>{answer.content}</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="page-container">
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">Expert Questions</Heading>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Questions ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="answered">
            Answered by Me ({expertAnsweredQuestions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-6 mt-6">
          {pendingQuestions.length > 0 ? (
            <div className="space-y-6">
              {pendingQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} showAnswerForm={true} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 p-6">
              <div className="text-center py-8">
                <Text variant="muted" className="mb-4">
                  No pending questions at the moment.
                </Text>
                <Text size="sm" variant="muted">
                  Check back later for new questions from farmers.
                </Text>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="answered" className="space-y-6 mt-6">
          {expertAnsweredQuestions.length > 0 ? (
            <div className="space-y-6">
              {expertAnsweredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} showAnswerForm={false} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 p-6">
              <div className="text-center py-8">
                <Text variant="muted" className="mb-4">
                  You haven't answered any questions yet.
                </Text>
                <Text size="sm" variant="muted">
                  Start helping farmers by answering pending questions.
                </Text>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
