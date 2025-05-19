import { Sidebar } from "@/components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen flex-row">
      <Sidebar />
      {children}
    </div>
  );
}
