import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MockExamConfig } from '../data/schema';
import { Badge } from '@/components/ui/badge';

// 默认配置
const DEFAULT_MOCK_EXAM_CONFIG: MockExamConfig = {
  min: 60,
  count: 50,
  score: 60
};

interface MockExamConfigEditorProps {
  value: MockExamConfig | null;
  onChange: (value: MockExamConfig) => void;
}

export function MockExamConfigEditor({ value, onChange }: MockExamConfigEditorProps) {
  const [config, setConfig] = useState<MockExamConfig>(DEFAULT_MOCK_EXAM_CONFIG);
  const debounceTimerRef = useRef<number | null>(null);

  // 初始化配置
  useEffect(() => {
    if (value) {
      setConfig(value);
    } else {
      // 如果没有值，使用默认配置并通知父组件
      setConfig(DEFAULT_MOCK_EXAM_CONFIG);
      debouncedOnChange(DEFAULT_MOCK_EXAM_CONFIG);
    }
  }, [value]);

  // 防抖处理函数，延迟通知父组件
  const debouncedOnChange = useCallback((newConfig: MockExamConfig) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      onChange(newConfig);
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

  // 更新配置
  const handleUpdateConfig = (field: keyof MockExamConfig, value: number) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    debouncedOnChange(newConfig);
  };

  // 计算及格分数
  const calculatePassScore = () => {
    return Math.ceil(config.score * config.count / 100);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-4">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-500 hover:bg-purple-500">模拟考试配置</Badge>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="min-exams" className="text-xs">考试时长</Label>
                <span className="text-xs text-muted-foreground">{config.min} 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  id="min-exams"
                  min={1}
                  max={120}
                  step={1}
                  value={[config.min]}
                  onValueChange={(values: number[]) => handleUpdateConfig('min', values[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={config.min}
                  onChange={(e) => handleUpdateConfig('min', Number(e.target.value))}
                  className="w-16 h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="question-count" className="text-xs">题目总数</Label>
                <span className="text-xs text-muted-foreground">{config.count} 题</span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  id="question-count"
                  min={10}
                  max={100}
                  step={5}
                  value={[config.count]}
                  onValueChange={(values: number[]) => handleUpdateConfig('count', values[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={10}
                  max={100}
                  step={5}
                  value={config.count}
                  onChange={(e) => handleUpdateConfig('count', Number(e.target.value))}
                  className="w-16 h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="pass-score" className="text-xs">及格分数线</Label>
                <span className="text-xs text-muted-foreground">{config.score}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  id="pass-score"
                  min={50}
                  max={100}
                  step={5}
                  value={[config.score]}
                  onValueChange={(values: number[]) => handleUpdateConfig('score', values[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={50}
                  max={100}
                  step={5}
                  value={config.score}
                  onChange={(e) => handleUpdateConfig('score', Number(e.target.value))}
                  className="w-16 h-8"
                  onKeyDown={(e) => {
                    // 防止Enter键提交表单
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-muted p-2 rounded-md text-xs">
              <div className="flex justify-between mb-0.5">
                <span className="text-muted-foreground">考试时长：</span>
                <span className="font-medium">{config.min} 分钟</span>
              </div>
              <div className="flex justify-between mb-0.5">
                <span className="text-muted-foreground">每次考试题目数：</span>
                <span className="font-medium">{config.count} 题</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">及格要求：</span>
                <span className="font-medium">至少 {calculatePassScore()} 题正确 ({config.score}%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 