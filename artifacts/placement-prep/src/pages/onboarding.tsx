import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateProfile, useListRoles } from "@workspace/api-client-react";
import { useProfileStore } from "@/lib/profile-store";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  college: z.string().min(2, "College is required"),
  graduationYear: z.coerce.number().min(2024).max(2030),
  targetRoleId: z.coerce.number().min(1, "Select a target role"),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { profileId, setProfileId } = useProfileStore();
  const createProfile = useCreateProfile();
  const { data: roles } = useListRoles();

  useEffect(() => {
    if (profileId) {
      setLocation("/dashboard");
    }
  }, [profileId, setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      college: "",
      graduationYear: new Date().getFullYear() + 1,
      targetRoleId: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createProfile.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setProfileId(data.id);
          setLocation("/dashboard");
        },
      }
    );
  }

  if (profileId) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SkillSync</h1>
          <p className="text-muted-foreground">Your GPS for a successful engineering career.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College / University</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering Institute of Technology" {...field} data-testid="input-college" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-grad-year" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={createProfile.isPending} data-testid="button-submit">
              {createProfile.isPending ? "Creating Profile..." : "Start Preparing"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
