
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/hooks/use-auth";

export interface Question {
  id: string;
  title: string;
  crop: string;
  description: string;
  image_url?: string;
  status: "pending" | "answered";
  created_at: string;
  farmer_id: string;
  farmer?: {
    name: string;
  };
  answers?: {
    id: string;
    content: string;
    expert_id: string;
    expert: {
      name: string;
    };
    created_at: string;
  }[];
}

interface QuestionsContextType {
  questions: Question[];
  loading: boolean;
  addQuestion: (question: Omit<Question, "id" | "status" | "created_at" | "farmer_id">) => Promise<void>;
  answerQuestion: (questionId: string, content: string) => Promise<void>;
  getQuestionsByFarmerId: (farmerId: string) => Question[];
  getPendingQuestions: () => Question[];
  getAnsweredQuestions: () => Question[];
  refreshQuestions: () => Promise<void>;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          farmer:profiles!farmer_id(name),
          answers(
            id,
            content,
            expert_id,
            created_at,
            expert:profiles!expert_id(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('questions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchQuestions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => {
        fetchQuestions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addQuestion = async (questionData: Omit<Question, "id" | "status" | "created_at" | "farmer_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('questions')
      .insert({
        ...questionData,
        farmer_id: user.id,
      });

    if (error) throw error;

    toast({
      title: "Question submitted successfully",
      description: "Experts will review your question soon",
    });

    await fetchQuestions();
  };

  const answerQuestion = async (questionId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        expert_id: user.id,
        content,
      });

    if (error) throw error;

    // Update question status to answered
    await supabase
      .from('questions')
      .update({ status: 'answered' })
      .eq('id', questionId);

    toast({
      title: "Answer submitted successfully",
      description: "The farmer will be notified of your response",
    });

    await fetchQuestions();
  };

  const getQuestionsByFarmerId = (farmerId: string) => {
    return questions.filter((q) => q.farmer_id === farmerId);
  };

  const getPendingQuestions = () => {
    return questions.filter((q) => q.status === "pending");
  };

  const getAnsweredQuestions = () => {
    return questions.filter((q) => q.status === "answered");
  };

  const refreshQuestions = async () => {
    await fetchQuestions();
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        loading,
        addQuestion,
        answerQuestion,
        getQuestionsByFarmerId,
        getPendingQuestions,
        getAnsweredQuestions,
        refreshQuestions,
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
