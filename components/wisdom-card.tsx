import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface WisdomCardProps {
  insight: string
  source?: string
}

export function WisdomCard({ insight, source }: WisdomCardProps) {
  return (
    <Card className="bg-gradient-to-br from-secondary/60 to-secondary/30 border border-secondary/40 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 mt-1">
            <Sparkles className="h-5 w-5 text-primary/60" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">
              KAAL Insight
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              {insight}
            </p>
            {source && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-secondary/50">
                {source}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
