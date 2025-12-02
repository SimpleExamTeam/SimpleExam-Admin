import React, { useState, KeyboardEvent } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = '搜索...',
  className = '',
}: SearchInputProps) {
  // 如果没有提供外部值，则使用内部状态
  const [internalValue, setInternalValue] = useState('')
  
  // 确定使用哪个值
  const value = externalValue !== undefined ? externalValue : internalValue
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (onChange) {
      onChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }
  
  // 处理回车键
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value)
    }
  }
  
  // 处理搜索按钮点击
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value)
    }
  }
  
  // 清除搜索内容
  const handleClear = () => {
    if (onChange) {
      onChange('')
    } else {
      setInternalValue('')
    }
    if (onSearch) {
      onSearch('')
    }
  }
  
  return (
    <div className={`relative flex items-center ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-16"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-8 h-7 w-7"
          onClick={handleClear}
        >
          <IconX size={16} />
          <span className="sr-only">清除</span>
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 h-7 w-7"
        onClick={handleSearchClick}
      >
        <IconSearch size={16} />
        <span className="sr-only">搜索</span>
      </Button>
    </div>
  )
} 