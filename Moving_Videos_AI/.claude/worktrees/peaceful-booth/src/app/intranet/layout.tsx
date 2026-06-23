"use client";

import { ProjectProvider } from "@/lib/store";
import { Header } from "@/components/header";
import { ErrorBoundary } from "@/components/error-boundary";

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <Header />
      <ErrorBoundary>
        <main className="flex-1">{children}</main>
      </ErrorBoundary>
    </ProjectProvider>
  );
}
