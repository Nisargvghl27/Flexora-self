import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="flex flex-col min-h-screen page-enter">
      {children}
    </div>
  );
}
