import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton variants for different loading states
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
    <div className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  </div>
)

const SkeletonPlantCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-card overflow-hidden", className)} {...props}>
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  </div>
)

const SkeletonText = ({ lines = 3, className, ...props }: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
)

const SkeletonAvatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
)

const SkeletonButton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton className={cn("h-10 w-24 rounded-md", className)} {...props} />
)

const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }: { rows?: number; cols?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("w-full", className)} {...props}>
    <div className="rounded-md border">
      <div className="border-b p-4">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-4 last:border-b-0">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SkeletonList = ({ items = 5, className, ...props }: { items?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3", className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
)

const SkeletonChart = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-end space-x-2 h-32">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  </div>
)

const SkeletonStats = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)} {...props}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    ))}
  </div>
)

const SkeletonForm = ({ fields = 4, className, ...props }: { fields?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-6", className)} {...props}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

const SkeletonGallery = ({ items = 6, className, ...props }: { items?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
)

const SkeletonPost = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-18" />
      </div>
    </div>
  </div>
)

const SkeletonNavigation = ({ items = 5, className, ...props }: { items?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1", className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 px-3 py-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
)

export { 
  Skeleton,
  SkeletonCard,
  SkeletonPlantCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTable,
  SkeletonList,
  SkeletonChart,
  SkeletonStats,
  SkeletonForm,
  SkeletonGallery,
  SkeletonPost,
  SkeletonNavigation,
}