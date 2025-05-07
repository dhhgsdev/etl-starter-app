import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export const TabsList = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex w-full border-b border-gray-700",
      className
    )}
    {...props}
  />
)

export const TabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400",
      "border-b-2 border-transparent",
      "data-[state=active]:border-white data-[state=active]:text-white",
      "hover:text-white transition-colors duration-200 focus:outline-none",
      "bg-transparent shadow-none", // ⬅ remove default background and shadow
      className
    )}
    {...props}
  />
)

export const TabsContent = TabsPrimitive.Content
