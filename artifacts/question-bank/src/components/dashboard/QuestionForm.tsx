import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { 
  useListSegments, useListSubjects, useListChapters, useListTopics
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuestionInput } from "@workspace/api-client-react";
import { Trash2, Plus, GripVertical } from "lucide-react";

// Using any here as a base schema, actual validation depends on the type
const optionSchema = z.object({
  optionLabel: z.string().min(1),
  optionText: z.string().min(1),
  isCorrect: z.boolean().default(false),
  explanationText: z.string().optional(),
  orderNo: z.number().optional()
});

const subPartSchema = z.object({
  partLabel: z.string().min(1),
  partText: z.string().min(1),
  marks: z.coerce.number().optional(),
  answerText: z.string().optional(),
  explanationText: z.string().optional(),
  orderNo: z.number().optional()
});

const questionSchema = z.object({
  segmentId: z.coerce.number().min(1, "Segment is required"),
  subjectId: z.coerce.number().min(1, "Subject is required"),
  chapterId: z.coerce.number().optional(),
  topicId: z.coerce.number().optional(),
  questionType: z.enum(['MCQ', 'CQ', 'WRITTEN']),
  stimulusText: z.string().optional(),
  questionText: z.string().min(1, "Question text is required"),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  language: z.enum(['bn', 'en']).default('bn'),
  hasMath: z.boolean().default(false),
  isPreviousYear: z.boolean().default(false),
  marks: z.coerce.number().optional(),
  year: z.coerce.number().optional(),
  examName: z.string().optional(),
  answerText: z.string().optional(),
  explanationText: z.string().optional(),
  videoSolutionUrl: z.string().url().optional().or(z.literal("")),
  options: z.array(optionSchema).optional(),
  subParts: z.array(subPartSchema).optional()
});

type FormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  initialValues?: Partial<QuestionInput>;
  onSubmit: (data: QuestionInput) => void;
  isSubmitting?: boolean;
}

export function QuestionForm({ initialValues, onSubmit, isSubmitting }: QuestionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: 'MCQ',
      difficulty: 'medium',
      language: 'bn',
      hasMath: false,
      isPreviousYear: false,
      options: [
        { optionLabel: 'A', optionText: '', isCorrect: true, orderNo: 1 },
        { optionLabel: 'B', optionText: '', isCorrect: false, orderNo: 2 },
        { optionLabel: 'C', optionText: '', isCorrect: false, orderNo: 3 },
        { optionLabel: 'D', optionText: '', isCorrect: false, orderNo: 4 }
      ],
      ...initialValues
    }
  });

  const questionType = form.watch("questionType");
  const isPreviousYear = form.watch("isPreviousYear");
  const segmentId = form.watch("segmentId");
  const subjectId = form.watch("subjectId");

  const { data: segments } = useListSegments();
  const { data: subjects } = useListSubjects();
  const { data: chapters } = useListChapters(subjectId ? { subjectId } : undefined, { query: { enabled: !!subjectId } });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const { fields: subPartFields, append: appendSubPart, remove: removeSubPart } = useFieldArray({
    control: form.control,
    name: "subParts"
  });

  const handleFormSubmit = (data: FormValues) => {
    // Clean up empty optional strings to undefined
    const cleanData: any = { ...data };
    if (!cleanData.videoSolutionUrl) delete cleanData.videoSolutionUrl;
    if (!cleanData.stimulusText) delete cleanData.stimulusText;
    if (!cleanData.examName) delete cleanData.examName;
    
    onSubmit(cleanData as QuestionInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxonomy & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="segmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment *</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select segment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {segments?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {subjectId && (
                <FormField
                  control={form.control}
                  name="chapterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chapter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chapters?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MCQ">MCQ</SelectItem>
                          <SelectItem value="CQ">Creative (CQ)</SelectItem>
                          <SelectItem value="WRITTEN">Written</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bn">Bengali</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t space-y-4">
                <FormField
                  control={form.control}
                  name="isPreviousYear"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Previous Year Question?</FormLabel>
                        <FormDescription>Is this from a past exam?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isPreviousYear && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="examName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="e.g. HSC 2021" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionType === 'CQ' && (
                  <FormField
                    control={form.control}
                    name="stimulusText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stimulus / Scenario (CQ Context)</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[100px] font-serif" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text *</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[100px] text-lg font-medium" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {questionType === 'MCQ' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Options</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ optionLabel: String.fromCharCode(65 + optionFields.length), optionText: '', isCorrect: false, orderNo: optionFields.length + 1 })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optionFields.map((field, index) => (
                    <div key={field.id} className={`flex gap-4 items-start p-4 rounded-lg border ${form.watch(`options.${index}.isCorrect`) ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <FormField
                            control={form.control}
                            name={`options.${index}.optionLabel`}
                            render={({ field }) => (
                              <FormItem className="w-16 shrink-0">
                                <FormControl>
                                  <Input {...field} className="font-mono text-center font-bold" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`options.${index}.optionText`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} placeholder="Option text" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name={`options.${index}.isCorrect`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={(val) => {
                                    // if true, unset others (single correct assumption for now)
                                    if (val) {
                                      optionFields.forEach((_, i) => {
                                        if (i !== index) form.setValue(`options.${i}.isCorrect`, false);
                                      });
                                    }
                                    field.onChange(val);
                                  }} />
                                </FormControl>
                                <FormLabel className={field.value ? "text-primary font-bold" : ""}>Correct Answer</FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeOption(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {questionType === 'CQ' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sub Parts (ক, খ, গ, ঘ)</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSubPart({ partLabel: 'ক', partText: '', orderNo: subPartFields.length + 1 })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Part
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subPartFields.map((field, index) => (
                    <div key={field.id} className="p-4 rounded-lg border bg-card space-y-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeSubPart(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name={`subParts.${index}.partLabel`}
                          render={({ field }) => (
                            <FormItem className="w-16 shrink-0">
                              <FormLabel>Label</FormLabel>
                              <FormControl>
                                <Input {...field} className="font-mono text-center font-bold" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subParts.${index}.marks`}
                          render={({ field }) => (
                            <FormItem className="w-20 shrink-0">
                              <FormLabel>Marks</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`subParts.${index}.partText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subParts.${index}.answerText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(questionType === 'WRITTEN') && (
              <Card>
                <CardHeader>
                  <CardTitle>Answer & Explanation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="answerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer Text</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[150px]" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="explanationText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 py-4 border-t sticky bottom-0 bg-background/80 backdrop-blur z-10 px-4 -mx-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
