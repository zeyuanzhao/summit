"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useProfileStore } from "@/lib/stores/useProfileStore";
import { createClient } from "@/lib/supabase/client";

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
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(32, { message: "Username must be at most 32 characters" }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(64, { message: "Display name must be at most 64 characters" }),
  avatar: z
    .string()
    .url({ message: "Avatar URL must be a valid URL" })
    .optional()
    .or(z.literal("")),
});

export function EditProfileDialog({
  onEdit,
}: {
  onEdit: (profile: {
    username: string;
    displayName: string;
    avatar?: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfileStore();

  const supabase = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username ?? "",
      displayName: profile?.displayName ?? "",
      avatar: profile?.avatar ?? "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { username, displayName, avatar } = data;

    const { error } = await supabase
      .from("profile")
      .update({
        username,
        display_name: displayName,
        avatar: avatar || null,
      })
      .eq("id", profile?.id);

    if (error) {
      toast.error("Failed to update profile. Please try again.");
    } else {
      form.reset(data);
      toast.success("Profile updated successfully!");
      setOpen(false);
      onEdit({ username, displayName, avatar });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your username, display name, and avatar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="username-1">Username</FormLabel>
                    <FormControl>
                      <Input
                        id="username-1"
                        placeholder="Username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="displayname-1">Display Name</FormLabel>
                    <FormControl>
                      <Input
                        id="displayname-1"
                        placeholder="Display Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="avatar-1">Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        id="avatar-1"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
