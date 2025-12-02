import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExamConfigItem } from '../data/schema';
import { Badge } from '@/components/ui/badge';

interface ExamConfigEditorProps {
  value: ExamConfigItem[];
  onChange: (value: ExamConfigItem[]) => void;
}

export function ExamConfigEditor({ value, onChange }: ExamConfigEditorProps) {
  const [configs, setConfigs] = useState<ExamConfigItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // 初始化配置
  useEffect(() => {
    setConfigs(value || []);
  }, [value]);

  // 防抖处理函数，延迟通知父组件
  const debouncedOnChange = useCallback((newConfigs: ExamConfigItem[]) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      onChange(newConfigs);
      debounceTimerRef.current = null;
    }, 300); // 300ms延迟
  }, [onChange]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 添加新配置项
  const handleAddConfig = () => {
    const newConfigs = [...configs, { type: 'single', count: 10, score: 2 }];
    setConfigs(newConfigs);
    debouncedOnChange(newConfigs);
  };

  // 删除配置项，添加防重复点击和事件冒泡处理
  const handleDeleteConfig = (event: React.MouseEvent, index: number) => {
    // 阻止事件冒泡，避免触发表单提交
    event.preventDefault();
    event.stopPropagation();
    
    // 防重复点击保护
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500 || isDeleting) { // 500ms内不允许重复点击
      return;
    }
    lastClickTimeRef.current = now;
    
    // 设置删除状态
    setIsDeleting(true);
    
    // 更新本地状态
    const newConfigs = configs.filter((_, i) => i !== index);
    setConfigs(newConfigs);
    
    // 延迟通知父组件，避免立即刷新
    setTimeout(() => {
      debouncedOnChange(newConfigs);
      setIsDeleting(false);
    }, 50);
  };

  // 更新配置项
  const handleUpdateConfig = (index: number, field: keyof ExamConfigItem, value: string | number) => {
    const newConfigs = [...configs];
    newConfigs[index] = {
      ...newConfigs[index],
      [field]: field === 'type' ? value : Number(value)
    };
    setConfigs(newConfigs);
    debouncedOnChange(newConfigs);
  };

  // 获取题型名称
  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'single': return '单选题';
      case 'multiple': return '多选题';
      case 'judge': return '判断题';
      default: return '未知题型';
    }
  };

  // 获取题型对应的颜色
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'single': return 'bg-blue-500';
      case 'multiple': return 'bg-green-500';
      case 'judge': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  // 计算总分
  const calculateTotalScore = () => {
    return configs.reduce((total, config) => total + (config.count * config.score), 0);
  };

  // 计算总题数
  const calculateTotalQuestions = () => {
    return configs.reduce((total, config) => total + config.count, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        {configs.map((config, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-col space-y-2">
                {/* 标题行带删除按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getQuestionTypeColor(config.type)} hover:${getQuestionTypeColor(config.type)}`}>
                      {getQuestionTypeName(config.type)}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => handleDeleteConfig(e, index)}
                    disabled={isDeleting}
                    className="h-6 w-6 p-0 text-destructive"
                    type="button" // 明确指定为button类型，避免作为submit处理
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
                
                {/* 内容区域 - 行内布局 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`type-${index}`} className="text-xs whitespace-nowrap">题型:</Label>
                    <Select 
                      value={config.type}
                      onValueChange={(value) => handleUpdateConfig(index, 'type', value)}
                    >
                      <SelectTrigger id={`type-${index}`} className="h-8 w-[100px]">
                        <SelectValue placeholder="选择题型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">单选题</SelectItem>
                        <SelectItem value="multiple">多选题</SelectItem>
                        <SelectItem value="judge">判断题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`count-${index}`} className="text-xs whitespace-nowrap">数量:</Label>
                    <Input
                      id={`count-${index}`}
                      type="number"
                      min="1"
                      value={config.count}
                      onChange={(e) => handleUpdateConfig(index, 'count', e.target.value)}
                      className="h-8 w-[60px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`score-${index}`} className="text-xs whitespace-nowrap">分数:</Label>
                    <Input
                      id={`score-${index}`}
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={config.score}
                      onChange={(e) => handleUpdateConfig(index, 'score', e.target.value)}
                      className="h-8 w-[60px]"
                    />
                  </div>
                  
                  <span className="text-xs text-muted-foreground ml-auto">
                    共{config.count}题，每题{config.score}分，小计{config.count * config.score}分
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        type="button"
        variant="outline" 
        className="w-full" 
        onClick={handleAddConfig}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        添加题型
      </Button>

      {configs.length > 0 && (
        <div className="text-sm font-medium mt-2 flex justify-between">
          <span>总计：{calculateTotalQuestions()} 题</span>
          <span>总分：{calculateTotalScore()} 分</span>
        </div>
      )}
    </div>
  );
} 