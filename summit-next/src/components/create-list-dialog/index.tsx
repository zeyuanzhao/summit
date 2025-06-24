"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

import { UserContext } from "../context/user-context";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be between 2 and 100 characters",
    })
    .max(100, {
      message: "Title must be between 2 and 100 characters",
    }),
  description: z.string().max(500, {
    message: "Description must be at most 500 characters",
  }),
});

export function CreateListDialog() {
  const [open, setOpen] = useState(false);
  const user = useContext(UserContext);

  const supabase = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { title, description } = data;

    const { error } = await supabase.from("list").insert({
      user_id: user?.id,
      title,
      description,
    });

    if (error) {
      toast.error("Failed to create list. Please try again.");
    } else {
      form.reset();
      toast.success("List created successfully!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create List</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            Lists allow you to save and organize your papers from the feed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="title-1">Title</FormLabel>
                    <FormControl>
                      <Input id="title-1" placeholder="My List" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="description-1">Description</FormLabel>
                    <FormControl>
                      <Input
                        id="description-1"
                        placeholder="ML papers for future reading"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
