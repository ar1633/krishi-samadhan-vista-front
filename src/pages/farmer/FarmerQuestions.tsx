
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading, Text } from "@/components/ui/typography";
import { useQuestions, Question } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FarmerQuestions() {
  const { user } = useAuth();
  const { questions } = useQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered">("all");
  
  // Filter questions for the current farmer
  const farmerQuestions = user 
    ? questions.filter(q => q.farmerId === user.id)
    : [];
  
  const filteredQuestions = farmerQuestions.filter(question => {
    // Apply text search
    const matchesSearch = 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.crop.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || question.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort by newest first
  const sortedQuestions = [...filteredQuestions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleOpenQuestion = (question: Question) => {
    setSelectedQuestion(question);
  };
  
  const handleCloseDialog = () => {
    setSelectedQuestion(null);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <Heading as="h1" size="xl" className="text-krishi-800">My Questions</Heading>
        
        <Button asChild className="bg-krishi-600 hover:bg-krishi-700">
          <Link to="/farmer/questions/new">Ask New Question</Link>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-2/3">
          <Input
            placeholder="Search by title, crop, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="md:w-1/3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | "pending" | "answered")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="answered">Answered Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Questions List */}
      {sortedQuestions.length > 0 ? (
        <div className="space-y-4">
          {sortedQuestions.map((question) => (
            <Card 
              key={question.id} 
              className="hover:border-krishi-300 transition-colors cursor-pointer"
              onClick={() => handleOpenQuestion(question)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={question.status === "pending" ? "outline" : "default"} className={
                        question.status === "pending" 
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                          : "bg-green-100 text-green-800 hover:bg-green-100"
                      }>
                        {question.status === "pending" ? "Pending" : "Answered"}
                      </Badge>
                      <Text size="sm" variant="muted">
                        Asked on {format(new Date(question.createdAt), "MMM d, yyyy")}
                      </Text>
                    </div>
                    <Text className="font-medium text-lg mb-1">{question.title}</Text>
                    <Text size="sm" variant="muted">Crop: {question.crop}</Text>
                    <Text size="sm" className="line-clamp-2 mt-2">{question.description}</Text>
                  </div>
                  
                  {question.status === "answered" && (
                    <div className="ml-4 bg-green-50 px-3 py-1 rounded-md flex flex-col items-center justify-center">
                      <Text size="xs" variant="muted">Answered by</Text>
                      <Text size="sm" className="font-medium">{question.answer?.expertName}</Text>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 p-6">
          <div className="text-center py-8">
            <Text variant="muted" className="mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "No questions match your filters." 
                : "You haven't asked any questions yet."}
            </Text>
            {!searchTerm && statusFilter === "all" && (
              <Button asChild className="bg-krishi-600 hover:bg-krishi-700">
                <Link to="/farmer/questions/new">Ask Your First Question</Link>
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Question Detail Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedQuestion.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={selectedQuestion.status === "pending" ? "outline" : "default"} className={
                    selectedQuestion.status === "pending" 
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                      : "bg-green-100 text-green-800 hover:bg-green-100"
                  }>
                    {selectedQuestion.status === "pending" ? "Pending" : "Answered"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Crop: {selectedQuestion.crop}
                  </span>
                  <span className="text-sm text-gray-500">
                    Asked on {format(new Date(selectedQuestion.createdAt), "MMM d, yyyy")}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Text className="font-medium">Description:</Text>
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
                
                {selectedQuestion.status === "answered" && selectedQuestion.answer && (
                  <div className="bg-green-50 p-4 rounded-md mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <Text className="font-medium">Expert Answer:</Text>
                      <Text size="sm" variant="muted">
                        Answered on {format(new Date(selectedQuestion.answer.answeredAt), "MMM d, yyyy")}
                      </Text>
                    </div>
                    <Text className="whitespace-pre-wrap">{selectedQuestion.answer.text}</Text>
                    <Text size="sm" className="mt-4 text-right font-medium">
                      - {selectedQuestion.answer.expertName}
                    </Text>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
