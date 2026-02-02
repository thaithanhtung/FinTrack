import { Card, CardHeader } from "./Card";
import { Skeleton, SkeletonText } from "./Skeleton";

export function WorldGoldCardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 border-gold-200 dark:border-gold-800 animate-fade-in">
      <CardHeader
        title={<Skeleton className="h-5 w-32" />}
        subtitle={<Skeleton className="h-4 w-20 mt-1" />}
        action={<Skeleton className="h-4 w-4 rounded-full" />}
      />

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-200/50 dark:border-gold-800/50">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
}

export function VNGoldCardSkeleton() {
  return (
    <div className="space-y-4">
      {/* SJC Skeleton */}
      <Card className="animate-fade-in">
        <CardHeader
          title={<Skeleton className="h-5 w-24" />}
          subtitle={<Skeleton className="h-4 w-32 mt-1" />}
        />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>

      {/* Nhẫn 9999 Skeleton */}
      <Card className="animate-fade-in">
        <CardHeader
          title={<Skeleton className="h-5 w-28" />}
          subtitle={<Skeleton className="h-4 w-36 mt-1" />}
        />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    </div>
  );
}

export function PriceComparisonSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 animate-fade-in">
      <CardHeader
        title={<Skeleton className="h-5 w-28" />}
        subtitle={<Skeleton className="h-4 w-40 mt-1" />}
        action={<Skeleton className="h-4 w-4 rounded-full" />}
      />

      <div className="space-y-4">
        {/* World price converted */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>

        {/* VN price */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 space-y-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Difference */}
        <div className="rounded-xl p-3 bg-amber-100 dark:bg-amber-900/30 space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </Card>
  );
}

export function SpreadCalculatorSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800 animate-fade-in">
      <CardHeader
        title={<Skeleton className="h-5 w-40" />}
        subtitle={<Skeleton className="h-4 w-24 mt-1" />}
        action={<Skeleton className="h-4 w-4 rounded-full" />}
      />

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        <div className="bg-rose-100 dark:bg-rose-900/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>

        <Skeleton className="h-3 w-full" />
      </div>
    </Card>
  );
}

export function ConverterSkeleton() {
  return (
    <div className="space-y-4">
      {/* Current price skeleton */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </Card>

      {/* Converter skeleton */}
      <Card className="animate-fade-in">
        <CardHeader
          title={<Skeleton className="h-5 w-36" />}
          subtitle={<Skeleton className="h-4 w-48 mt-1" />}
          action={<Skeleton className="h-4 w-4 rounded-full" />}
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader
        title={<Skeleton className="h-5 w-32" />}
        subtitle={<Skeleton className="h-4 w-20 mt-1" />}
      />
      <div className="space-y-4">
        {/* Time range buttons */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-64" />
        {/* Chart area */}
        <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
        {/* Summary */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-5 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
