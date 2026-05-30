import { useTaxonomies } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'

interface InterestsPickerProps {
  selected: number[]
  onChange: (ids: number[]) => void
}

export function InterestsPicker({ selected, onChange }: InterestsPickerProps) {
  const { interests } = useTaxonomies()

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(interests.data || []).map((interest: { id: number; slug: string; label: string }) => (
        <button
          key={interest.id}
          type="button"
          onClick={() => toggle(interest.id)}
          className={cn(
            'px-3 py-1 rounded-full text-sm border transition-colors',
            selected.includes(interest.id)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input hover:bg-accent',
          )}
        >
          {interest.label}
        </button>
      ))}
    </div>
  )
}
