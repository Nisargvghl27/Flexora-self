import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden group border-muted/50 hover:border-primary/20 transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
        <Skeleton className="w-full h-full absolute inset-0 rounded-none" />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3 mb-1" />
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </CardFooter>
    </Card>
  );
}

export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden border-muted/50 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="w-full h-full absolute inset-0 rounded-none" />
      </div>
      <CardContent className="p-5 flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-5/6 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-muted/20 mt-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
}
