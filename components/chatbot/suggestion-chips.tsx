import { CHATBOT_SUGGESTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { motion } from '@/lib/motion';

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.8
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9, y: 5 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto" 
      role="list" 
      aria-label="Suggestions de questions"
    >
      {CHATBOT_SUGGESTIONS.map((s) => (
        <motion.div key={s} variants={item}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(s)}
            className="rounded-full text-xs h-9 px-4 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all bg-card/50 backdrop-blur-sm border-border/50"
            role="listitem"
          >
            {s}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
