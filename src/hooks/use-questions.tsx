
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Question {
  id: string;
  title: string;
  crop: string;
  description: string;
  imageUrl?: string;
  status: "pending" | "answered";
  createdAt: Date;
  farmerId: string;
  farmerName: string;
  answer?: {
    text: string;
    expertId: string;
    expertName: string;
    answeredAt: Date;
  };
}

// Sample questions data
const sampleQuestions: Question[] = [
  {
    id: "q1",
    title: "Yellow leaves on my tomato plants",
    crop: "Tomato",
    description: "My tomato plants have developed yellow leaves at the bottom. Is this a nutrient deficiency or disease?",
    status: "answered",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    farmerId: "f1",
    farmerName: "Rajesh Kumar",
    answer: {
      text: "This is likely a nitrogen deficiency. The older leaves turning yellow at the bottom is a classic sign. Try adding a nitrogen-rich fertilizer and make sure you're not overwatering, which can wash away nutrients.",
      expertId: "e1",
      expertName: "Dr. Priya Sharma",
      answeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  },
  {
    id: "q2",
    title: "Best time to harvest wheat",
    crop: "Wheat",
    description: "I've planted wheat and am not sure when is the optimal time to harvest. What signs should I look for?",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    farmerId: "f2",
    farmerName: "Amit Singh",
  },
  {
    id: "q3",
    title: "White spots on cucumber leaves",
    crop: "Cucumber",
    description: "My cucumber plants have white powdery spots on the leaves. The plants are still producing but I'm worried about the disease spreading.",
    imageUrl: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=2942&auto=format&fit=crop",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    farmerId: "f1",
    farmerName: "Rajesh Kumar",
  },
  {
    id: "q4",
    title: "Paddy irrigation frequency",
    crop: "Rice",
    description: "How often should I irrigate my paddy field during the dry season? Is once a week sufficient?",
    status: "answered",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    farmerId: "f3",
    farmerName: "Lakshmi Devi",
    answer: {
      text: "For paddy fields during dry season, maintaining consistent water level is crucial. Once a week is not enough - you should maintain 2-5cm of standing water at all times. Check water levels every 2-3 days and irrigate as needed. Dry spells can significantly reduce rice yield.",
      expertId: "e2",
      expertName: "Dr. Mohan Rao",
      answeredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  },
];

interface QuestionsContextType {
  questions: Question[];
  addQuestion: (question: Omit<Question, "id" | "status" | "createdAt">) => Promise<void>;
  answerQuestion: (questionId: string, answer: string, expertId: string, expertName: string) => Promise<void>;
  getQuestionsByFarmerId: (farmerId: string) => Question[];
  getPendingQuestions: () => Question[];
  getAnsweredQuestions: () => Question[];
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  
  // Initialize with sample data
  useEffect(() => {
    const storedQuestions = localStorage.getItem("krishiQuestions");
    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions, (key, value) => {
          if (key === "createdAt" || key === "answeredAt") {
            return new Date(value);
          }
          return value;
        });
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Error parsing stored questions:", error);
        setQuestions(sampleQuestions);
        localStorage.setItem("krishiQuestions", JSON.stringify(sampleQuestions));
      }
    } else {
      setQuestions(sampleQuestions);
      localStorage.setItem("krishiQuestions", JSON.stringify(sampleQuestions));
    }
  }, []);

  const addQuestion = async (questionData: Omit<Question, "id" | "status" | "createdAt">) => {
    const newQuestion: Question = {
      ...questionData,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      createdAt: new Date(),
    };
    
    const updatedQuestions = [newQuestion, ...questions];
    setQuestions(updatedQuestions);
    localStorage.setItem("krishiQuestions", JSON.stringify(updatedQuestions));
    
    toast({
      title: "Question submitted successfully",
      description: "Experts will review your question soon",
    });
  };

  const answerQuestion = async (questionId: string, answerText: string, expertId: string, expertName: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          status: "answered" as const,
          answer: {
            text: answerText,
            expertId,
            expertName,
            answeredAt: new Date(),
          },
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    localStorage.setItem("krishiQuestions", JSON.stringify(updatedQuestions));
    
    toast({
      title: "Answer submitted successfully",
      description: "The farmer will be notified of your response",
    });
  };

  const getQuestionsByFarmerId = (farmerId: string) => {
    return questions.filter((q) => q.farmerId === farmerId);
  };

  const getPendingQuestions = () => {
    return questions.filter((q) => q.status === "pending");
  };

  const getAnsweredQuestions = () => {
    return questions.filter((q) => q.status === "answered");
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        addQuestion,
        answerQuestion,
        getQuestionsByFarmerId,
        getPendingQuestions,
        getAnsweredQuestions,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};
