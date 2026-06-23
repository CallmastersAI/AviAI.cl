import { ProjectProvider } from "@/lib/store";
import { Header } from "@/components/header";

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <Header />
      <main className="flex-1">{children}</main>
    </ProjectProvider>
  );
}
