
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading, Text } from "@/components/ui/typography";
import { useQuestions, Question } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  answer: z.string()
    .min(20, "Answer must be at least 20 characters")
    .max(2000, "Answer must be less than 2000 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function ExpertDashboard() {
  const { user } = useAuth();
  const { questions, answerQuestion } = useQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pendingQuestions = questions.filter(q => q.status === "pending");
  const answeredQuestions = questions.filter(q => q.status === "answered");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });
  
  const handleOpenQuestion = (question: Question) => {
    setSelectedQuestion(question);
    form.reset();
  };
  
  const handleCloseDialog = () => {
    setSelectedQuestion(null);
  };
  
  const onSubmit = async (data: FormData) => {
    if (!selectedQuestion || !user) return;
    
    try {
      setIsSubmitting(true);
      await answerQuestion(selectedQuestion.id, data.answer, user.id, user.name);
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">Expert Dashboard</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-krishi-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-krishi-700">Questions Awaiting Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-krishi-600">{pendingQuestions.length}</Text>
            <Text variant="muted">Farmers need your expertise</Text>
          </CardContent>
        </Card>
        
        <Card className="border-krishi-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-krishi-700">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-krishi-600">{answeredQuestions.length}</Text>
            <Text variant="muted">Helping knowledge grow</Text>
          </CardContent>
        </Card>
        
        <Card className="border-krishi-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-krishi-700">Your Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-krishi-600">{user ? user.name : "Expert"}</Text>
            <Text variant="muted">Agricultural Expert</Text>
          </CardContent>
        </Card>
      </div>
      
      {/* Questions to Answer */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Heading as="h2" size="lg" className="text-krishi-700">Questions Needing Answers</Heading>
          <Link to="/expert/questions" className="text-krishi-600 hover:underline">
            View All
          </Link>
        </div>
        
        {pendingQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuestions.slice(0, 4).map((question) => (
              <Card 
                key={question.id} 
                className="hover:border-krishi-300 transition-colors cursor-pointer h-full"
                onClick={() => handleOpenQuestion(question)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex justify-between">
                    <Text size="sm" variant="highlight">
                      Crop: {question.crop}
                    </Text>
                    <Text size="sm" variant="muted">
                      {format(new Date(question.createdAt), "MMM d, yyyy")}
                    </Text>
                  </div>
                  <Text className="font-semibold mb-2 line-clamp-2">{question.title}</Text>
                  <Text size="sm" className="line-clamp-3 mb-3">{question.description}</Text>
                  <div className="flex justify-between items-center">
                    <Text size="sm" variant="muted">By: {question.farmerName}</Text>
                    <Button size="sm" variant="outline" className="text-krishi-600 border-krishi-600 hover:bg-krishi-50">
                      Answer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 p-6">
            <div className="text-center py-8">
              <Text variant="muted" className="mb-2">
                There are currently no pending questions that need answers.
              </Text>
              <Text variant="muted">
                Check back later as farmers submit new questions.
              </Text>
            </div>
          </Card>
        )}
      </div>
      
      {/* Recently Answered */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Heading as="h2" size="lg" className="text-krishi-700">Recently Answered</Heading>
        </div>
        
        {answeredQuestions.length > 0 ? (
          <div className="space-y-4">
            {answeredQuestions.slice(0, 3).map((question) => (
              <Card key={question.id} className="border-krishi-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Text className="font-semibold">{question.title}</Text>
                    <Text size="sm" variant="muted">
                      {format(new Date(question.createdAt), "MMM d, yyyy")}
                    </Text>
                  </div>
                  <Text size="sm" variant="highlight" className="mb-3">Crop: {question.crop}</Text>
                  <Text size="sm" className="line-clamp-2 mb-3">{question.description}</Text>
                  
                  {question.answer && (
                    <div className="bg-green-50 p-3 rounded-md mt-2">
                      <Text size="sm" className="font-medium mb-1">Your Answer:</Text>
                      <Text size="sm" className="line-clamp-2">{question.answer.text}</Text>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 p-6">
            <div className="text-center py-8">
              <Text variant="muted">
                You haven't answered any questions yet.
              </Text>
            </div>
          </Card>
        )}
      </div>
      
      {/* Answer Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedQuestion.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-krishi-600">
                    Crop: {selectedQuestion.crop}
                  </span>
                  <span className="text-sm text-gray-500">
                    Asked by {selectedQuestion.farmerName} on {format(new Date(selectedQuestion.createdAt), "MMM d, yyyy")}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Text className="font-medium">Question:</Text>
                  <Text className="mt-1 whitespace-pre-wrap">{selectedQuestion.description}</Text>
                </div>
                
                {selectedQuestion.imageUrl && (
                  <div>
                    <Text className="font-medium mb-2">Attached Image:</Text>
                    <img 
                      src={selectedQuestion.imageUrl} 
                      alt="Question attachment" 
                      className="rounded-md max-h-64 w-auto"
                    />
                  </div>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide your expert advice here..." 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCloseDialog}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-krishi-600 hover:bg-krishi-700" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
