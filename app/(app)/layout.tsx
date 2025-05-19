import { Sidebar } from "@/components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row h-screen w-screen">
      <Sidebar />
      {children}
    </div>
  );
}
