import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateQuestionSet } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  negativeMarking: z.coerce.number().min(0).max(1).default(0)
});

export default function QuestionSetCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createSet = useCreateQuestionSet();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", negativeMarking: 0 }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createSet.mutate({ data }, {
      onSuccess: (res) => {
        toast({ title: "Success", description: "Question set created." });
        setLocation(`/dashboard/question-sets/${res.id}`);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Question Set</h1>
        <p className="text-muted-foreground mt-1">Initialize a new bundle of questions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. HSC Physics Mock Test 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="negativeMarking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negative Marking (Marks deducted per wrong answer)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                <Button type="submit" disabled={createSet.isPending}>Create</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
