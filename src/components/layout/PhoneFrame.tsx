import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <>
      {/* Mobile: No frame */}
      <div className="md:hidden min-h-screen bg-gray-50 dark:bg-gray-950">
        {children}
      </div>

      {/* Desktop: iPhone frame */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 p-8">
        {/* iPhone 14 Pro Frame */}
        <div className="relative">
          {/* Phone shadow */}
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 blur-3xl transform translate-y-8" />

          {/* Phone body */}
          <div className="relative w-[390px] h-[844px] bg-black rounded-[60px] p-3 shadow-2xl">
            {/* Screen bezel */}
            <div className="relative w-full h-full bg-gray-50 dark:bg-gray-950 rounded-[48px] overflow-hidden flex flex-col">
              {/* Dynamic Island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <div className="w-[126px] h-[37px] bg-black dark:bg-gray-950 rounded-b-[20px] flex items-center justify-center">
                  {/* Camera dot */}
                  <div className="w-[10px] h-[10px] bg-gray-800 rounded-full ml-2" />
                </div>
              </div>

              {/* App content - SCROLLABLE INSIDE FRAME */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative">
                {children}
              </div>
            </div>

            {/* Side buttons */}
            {/* Volume buttons */}
            <div className="absolute left-0 top-[140px] w-[3px] h-[30px] bg-gray-800 dark:bg-gray-600 rounded-r-sm -translate-x-3" />
            <div className="absolute left-0 top-[180px] w-[3px] h-[30px] bg-gray-800 dark:bg-gray-600 rounded-r-sm -translate-x-3" />

            {/* Power button */}
            <div className="absolute right-0 top-[180px] w-[3px] h-[50px] bg-gray-800 dark:bg-gray-600 rounded-l-sm translate-x-3" />
          </div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/4 -right-20 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 bottom-1/4 -left-20 w-64 h-64 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* App info (optional) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Trải nghiệm tốt nhất trên mobile
          </p>
        </div>
      </div>
    </>
  );
}
