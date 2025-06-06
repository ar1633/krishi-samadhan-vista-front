
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  answer: z.string()
    .min(20, "Answer must be at least 20 characters")
    .max(2000, "Answer must be less than 2000 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function ExpertQuestions() {
  const { user } = useAuth();
  const { questions, answerQuestion } = useQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const pendingQuestions = questions.filter(q => q.status === "pending");
  const answeredQuestions = questions.filter(q => q.status === "answered");
  
  const filteredPendingQuestions = pendingQuestions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAnsweredQuestions = answeredQuestions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.answer?.text.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );
  
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
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">
        Questions Management
      </Heading>
      
      <div className="mb-6">
        <Input
          placeholder="Search questions by title, crop, description, or farmer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-2xl"
        />
      </div>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Questions ({filteredPendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="answered">
            Answered Questions ({filteredAnsweredQuestions.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Pending Questions Tab */}
        <TabsContent value="pending">
          {filteredPendingQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredPendingQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  className="hover:border-krishi-300 transition-colors cursor-pointer"
                  onClick={() => handleOpenQuestion(question)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Text className="font-medium text-lg">{question.title}</Text>
                        <div className="flex items-center gap-4 mt-1 mb-2">
                          <Text size="sm" variant="highlight">
                            Crop: {question.crop}
                          </Text>
                          <Text size="sm" variant="muted">
                            Asked by {question.farmerName}
                          </Text>
                          <Text size="sm" variant="muted">
                            {format(new Date(question.createdAt), "MMM d, yyyy")}
                          </Text>
                        </div>
                        <Text size="sm" className="line-clamp-2">{question.description}</Text>
                      </div>
                      <Button 
                        size="sm" 
                        className="ml-4 bg-krishi-600 hover:bg-krishi-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenQuestion(question);
                        }}
                      >
                        Answer
                      </Button>
                    </div>
                    {question.imageUrl && (
                      <div className="mt-3">
                        <Text size="sm" className="font-medium">Attached Image</Text>
                        <div className="mt-1 h-16 w-16 rounded bg-gray-100 overflow-hidden">
                          <img 
                            src={question.imageUrl} 
                            alt="Question attachment" 
                            className="h-full w-full object-cover"
                          />
                        </div>
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
                  {searchTerm 
                    ? "No pending questions match your search." 
                    : "There are no pending questions at the moment."}
                </Text>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Answered Questions Tab */}
        <TabsContent value="answered">
          {filteredAnsweredQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredAnsweredQuestions.map((question) => (
                <Card key={question.id} className="border-krishi-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Text className="font-medium text-lg">{question.title}</Text>
                        <div className="flex items-center gap-4 mt-1">
                          <Text size="sm" variant="highlight">
                            Crop: {question.crop}
                          </Text>
                          <Text size="sm" variant="muted">
                            Asked by {question.farmerName}
                          </Text>
                        </div>
                      </div>
                      <Text size="sm" variant="muted">
                        {format(new Date(question.createdAt), "MMM d, yyyy")}
                      </Text>
                    </div>
                    <Text size="sm" className="line-clamp-2 mb-3">{question.description}</Text>
                    
                    {question.answer && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <Text size="sm" className="font-medium">Answer:</Text>
                          <Text size="sm" variant="muted">
                            {format(new Date(question.answer.answeredAt), "MMM d, yyyy")}
                          </Text>
                        </div>
                        <Text size="sm" className="line-clamp-3">{question.answer.text}</Text>
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
                  {searchTerm 
                    ? "No answered questions match your search." 
                    : "There are no answered questions yet."}
                </Text>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
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
