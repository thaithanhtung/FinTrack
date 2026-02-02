import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PhoneFrame } from "./PhoneFrame";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PhoneFrame>
      <div className="h-full bg-gray-50 dark:bg-gray-950 flex flex-col relative">
        <Header />
        <main className="flex-1 w-full px-4 py-4 pb-32 overflow-y-auto">
          <div className="max-w-lg mx-auto">{children}</div>
        </main>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
