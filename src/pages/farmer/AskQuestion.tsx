
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuestions } from "@/hooks/use-questions";
import { useAuth } from "@/hooks/use-auth";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { Heading, Text } from "@/components/ui/typography";

const formSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  crop: z.string()
    .min(2, "Crop name must be at least 2 characters")
    .max(50, "Crop name must be less than 50 characters"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function AskQuestion() {
  const { addQuestion } = useQuestions();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      crop: "",
      description: "",
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to ask a question",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In a real app, you would upload the image and get a URL
      // For this demo, we'll create a placeholder URL if a file exists
      let imageUrl;
      if (uploadedFile) {
        // Simulate image upload with a placeholder
        imageUrl = URL.createObjectURL(uploadedFile); // This is temporary and only works in the current session
      }
      
      await addQuestion({
        title: data.title,
        crop: data.crop,
        description: data.description,
        farmerId: user.id,
        farmerName: user.name,
        imageUrl,
      });
      
      navigate("/farmer/questions");
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Failed to submit your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  return (
    <div className="page-container max-w-3xl">
      <Heading as="h1" size="xl" className="text-krishi-800 mb-6">Ask a Question</Heading>
      
      <Text variant="muted" className="mb-6">
        Get expert advice from agricultural specialists. Be specific about your issue to receive
        the most helpful answers. Adding an image can help experts diagnose problems more accurately.
      </Text>
      
      <Card className="border-krishi-200">
        <CardHeader>
          <CardTitle className="text-krishi-700">Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., How to treat powdery mildew on cucumber leaves?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop/Plant Type</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Tomato, Rice, Wheat, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your issue in detail. Include information about when it started, symptoms you're seeing, what you've tried so far, etc." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Upload Image (Optional)</FormLabel>
                <FileUpload
                  onFileChange={handleFileChange}
                  acceptedFileTypes="image/*"
                  maxSizeMB={5}
                />
                <Text size="xs" variant="muted">
                  Upload a clear image of the issue to help experts provide better guidance.
                </Text>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/farmer/questions")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-krishi-600 hover:bg-krishi-700" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Question"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
