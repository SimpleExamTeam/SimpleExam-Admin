import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'
import { useState, useRef, useCallback } from 'react'
import { Input } from './ui/input'
import { useClickOutside } from '@/hooks/use-click-outside'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  onSearch?: (value: string) => void
}

export function Search({ className = '', placeholder = 'Search', onSearch }: Props) {
  const { setOpen } = useSearch()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  
  const handleClickOutside = useCallback(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }, [isSearchOpen])
  
  useClickOutside(searchRef, handleClickOutside)
  
  const handleClick = () => {
    if (onSearch) {
      // 如果有onSearch回调，则打开搜索输入框
      setIsSearchOpen(true)
    } else {
      // 否则使用全局搜索
      setOpen(true)
    }
  }
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {isSearchOpen && onSearch ? (
        <div className="flex w-full">
          <Input
            className="h-8"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button 
            variant="ghost" 
            className="h-8 px-2" 
            onClick={handleSearch}
          >
            <IconSearch size={16} />
          </Button>
        </div>
      ) : (
        <Button
          variant='outline'
          className={cn(
            'bg-muted/25 text-muted-foreground hover:bg-muted/50 relative h-8 w-full flex-1 justify-start rounded-md text-sm font-normal shadow-none sm:pr-12 md:w-40 md:flex-none lg:w-56 xl:w-64',
            className
          )}
          onClick={handleClick}
        >
          <IconSearch
            aria-hidden='true'
            className='absolute top-1/2 left-1.5 -translate-y-1/2'
          />
          <span className='ml-3'>{placeholder}</span>
          <kbd className='bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
            <span className='text-xs'>⌘</span>K
          </kbd>
        </Button>
      )}
    </div>
  )
}
