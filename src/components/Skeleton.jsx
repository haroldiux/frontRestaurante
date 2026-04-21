import React from 'react';
import { clsx } from 'clsx';

export const Skeleton = ({ className, ...props }) => (
  <div
    className={clsx('animate-pulse bg-gray-700/30 rounded', className)}
    {...props}
  />
);

export const SkeletonCard = () => (
  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    ))}
  </div>
);