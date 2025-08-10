"use client";

import { useState, useRef, useEffect } from 'react';
import { HapticButton } from '@/components/ui/haptic-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Palette, Save, Download, RotateCcw } from 'lucide-react';

interface ColoringGameProps {
  sheetId: string;
  title: string;
  onBack: () => void;
  onSave: (imageData: string) => void;
}

interface Color {
  name: string;
  value: string;
}

interface Tool {
  name: string;
  icon: string;
  size: number;
}

const colors: Color[] = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Brown', value: '#92400e' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
];

const tools: Tool[] = [
  { name: 'Pencil', icon: '✏️', size: 2 },
  { name: 'Marker', icon: '🖊️', size: 8 },
  { name: 'Brush', icon: '🖌️', size: 12 },
  { name: 'Sponge', icon: '🧽', size: 20 },
];

const coloringSheets = [
  {
    id: 'car-1',
    title: 'Racing Car',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Car body
        { type: 'path', content: 'M 100 150 L 300 150 L 320 180 L 320 220 L 300 250 L 100 250 L 80 220 L 80 180 Z', color: '#ff0000' },
        // Car windows
        { type: 'path', content: 'M 120 160 L 200 160 L 220 190 L 220 210 L 200 230 L 120 230 L 100 210 L 100 190 Z', color: '#87ceeb' },
        { type: 'path', content: 'M 220 160 L 280 160 L 300 190 L 300 210 L 280 230 L 220 230 L 220 210 L 220 190 Z', color: '#87ceeb' },
        // Wheels
        { type: 'circle', content: '140 230 25', color: '#000000' },
        { type: 'circle', content: '260 230 25', color: '#000000' },
        { type: 'circle', content: '140 230 15', color: '#c0c0c0' },
        { type: 'circle', content: '260 230 15', color: '#c0c0c0' },
        // Car details
        { type: 'rect', content: '50 190 30 20', color: '#ffff00' },
        { type: 'rect', content: '320 190 30 20', color: '#ffff00' },
      ]
    }
  },
  {
    id: 'animal-1',
    title: 'Happy Lion',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Lion body
        { type: 'ellipse', content: '200 200 80 60', color: '#daa520' },
        // Lion head
        { type: 'circle', content: '200 120 50', color: '#daa520' },
        // Lion mane
        { type: 'circle', content: '200 120 70', color: '#8b4513', fill: false },
        // Lion face details
        { type: 'circle', content: '180 110 8', color: '#000000' },
        { type: 'circle', content: '220 110 8', color: '#000000' },
        { type: 'ellipse', content: '200 130 15 10', color: '#000000' },
        { type: 'path', content: 'M 190 140 Q 200 150 210 140', color: '#000000' },
        // Lion legs
        { type: 'rect', content: '160 240 15 40', color: '#daa520' },
        { type: 'rect', content: '185 240 15 40', color: '#daa520' },
        { type: 'rect', content: '215 240 15 40', color: '#daa520' },
        { type: 'rect', content: '240 240 15 40', color: '#daa520' },
        // Lion tail
        { type: 'path', content: 'M 280 200 Q 320 180 340 200 Q 350 220 330 230', color: '#daa520' },
      ]
    }
  },
  {
    id: 'flower-1',
    title: 'Beautiful Flower',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Flower petals
        { type: 'ellipse', content: '200 150 30 50', color: '#ff69b4', rotation: 0 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff1493', rotation: 45 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff69b4', rotation: 90 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff1493', rotation: 135 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff69b4', rotation: 180 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff1493', rotation: 225 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff69b4', rotation: 270 },
        { type: 'ellipse', content: '200 150 30 50', color: '#ff1493', rotation: 315 },
        // Flower center
        { type: 'circle', content: '200 150 20', color: '#ffff00' },
        // Flower stem
        { type: 'rect', content: '195 170 10 80', color: '#228b22' },
        // Leaves
        { type: 'ellipse', content: '180 200 20 10', color: '#228b22', rotation: -30 },
        { type: 'ellipse', content: '220 210 20 10', color: '#228b22', rotation: 30 },
      ]
    }
  },
  {
    id: 'space-1',
    title: 'Rocket Ship',
    template: {
      backgroundColor: '#000033',
      elements: [
        // Rocket body
        { type: 'path', content: 'M 200 100 L 250 200 L 250 280 L 200 300 L 150 280 L 150 200 Z', color: '#c0c0c0' },
        // Rocket nose
        { type: 'path', content: 'M 200 100 L 150 200 L 250 200 Z', color: '#ff0000' },
        // Rocket window
        { type: 'circle', content: '200 150 20', color: '#87ceeb' },
        // Rocket fins
        { type: 'path', content: 'M 150 250 L 120 280 L 150 280 Z', color: '#ff0000' },
        { type: 'path', content: 'M 250 250 L 280 280 L 250 280 Z', color: '#ff0000' },
        // Rocket flames
        { type: 'path', content: 'M 170 300 L 180 340 L 200 320 L 220 340 L 230 300', color: '#ffa500' },
        { type: 'path', content: 'M 175 310 L 185 330 L 200 315 L 215 330 L 225 310', color: '#ffff00' },
        // Stars
        { type: 'path', content: 'M 50 50 L 55 60 L 65 60 L 57 67 L 60 77 L 50 70 L 40 77 L 43 67 L 35 60 L 45 60 Z', color: '#ffff00' },
        { type: 'path', content: 'M 350 80 L 355 90 L 365 90 L 357 97 L 360 107 L 350 100 L 340 107 L 343 97 L 335 90 L 345 90 Z', color: '#ffff00' },
        { type: 'path', content: 'M 100 120 L 105 130 L 115 130 L 107 137 L 110 147 L 100 140 L 90 147 L 93 137 L 85 130 L 95 130 Z', color: '#ffff00' },
      ]
    }
  },
  {
    id: 'airplane-1',
    title: 'Airplane',
    template: {
      backgroundColor: '#87ceeb',
      elements: [
        // Airplane body
        { type: 'ellipse', content: '200 200 100 20', color: '#ffffff' },
        // Airplane nose
        { type: 'path', content: 'M 300 200 L 320 190 L 320 210 Z', color: '#ffffff' },
        // Airplane wings
        { type: 'path', content: 'M 180 200 L 120 150 L 140 140 L 200 190 Z', color: '#4169e1' },
        { type: 'path', content: 'M 180 200 L 120 250 L 140 260 L 200 210 Z', color: '#4169e1' },
        // Airplane tail
        { type: 'path', content: 'M 100 200 L 80 170 L 90 165 L 110 195 Z', color: '#4169e1' },
        { type: 'path', content: 'M 100 200 L 80 230 L 90 235 L 110 205 Z', color: '#4169e1' },
        // Airplane windows
        { type: 'circle', content: '220 195 5', color: '#000000' },
        { type: 'circle', content: '240 195 5', color: '#000000' },
        { type: 'circle', content: '260 195 5', color: '#000000' },
        // Airplane engine
        { type: 'circle', content: '150 220 15', color: '#696969' },
        { type: 'circle', content: '150 180 15', color: '#696969' },
        // Clouds
        { type: 'ellipse', content: '80 100 30 20', color: '#ffffff' },
        { type: 'ellipse', content: '100 95 25 18', color: '#ffffff' },
        { type: 'ellipse', content: '320 120 35 22', color: '#ffffff' },
        { type: 'ellipse', content: '340 115 28 20', color: '#ffffff' },
      ]
    }
  },
];

export default function ColoringGame({ sheetId, title, onBack, onSave }: ColoringGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#ff0000');
  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTemplate, setShowTemplate] = useState(true);

  const sheet = coloringSheets.find(s => s.id === sheetId) || coloringSheets[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = sheet.template.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw template if enabled
    if (showTemplate) {
      drawTemplate(ctx);
    }
  }, [sheet, showTemplate]);

  const drawTemplate = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'transparent';

    sheet.template.elements.forEach(element => {
      ctx.save();
      
      if (element.rotation) {
        ctx.translate(200, 200);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.translate(-200, -200);
      }

      switch (element.type) {
        case 'rect':
          const [x, y, w, h] = element.content.split(' ').map(Number);
          ctx.strokeRect(x, y, w, h);
          break;
        case 'circle':
          const [cx, cy, r] = element.content.split(' ').map(Number);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'ellipse':
          const [ex, ey, rx, ry] = element.content.split(' ').map(Number);
          ctx.beginPath();
          ctx.ellipse(ex, ey, rx, ry, 0, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'path':
          const path = new Path2D(element.content);
          ctx.stroke(path);
          break;
      }
      
      ctx.restore();
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedTool.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw background and template
    ctx.fillStyle = sheet.template.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (showTemplate) {
      drawTemplate(ctx);
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    onSave(imageData);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_colored.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <HapticButton
            variant="outline"
            onClick={onBack}
            className="p-2"
            hapticType="light"
          >
            <ArrowLeft className="w-5 h-5" />
          </HapticButton>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600">Coloring Game</p>
          </div>
          <div className="flex gap-2">
            <HapticButton
              variant="outline"
              onClick={saveDrawing}
              className="p-2"
              hapticType="light"
            >
              <Save className="w-5 h-5" />
            </HapticButton>
            <HapticButton
              variant="outline"
              onClick={downloadDrawing}
              className="p-2"
              hapticType="light"
            >
              <Download className="w-5 h-5" />
            </HapticButton>
          </div>
        </div>

        {/* Canvas */}
        <Card className="mb-6 p-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current?.dispatchEvent(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current?.dispatchEvent(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              const mouseEvent = new MouseEvent('mouseup', {});
              canvasRef.current?.dispatchEvent(mouseEvent);
            }}
          />
        </Card>

        {/* Tools */}
        <Card className="mb-6 p-4">
          <CardHeader>
            <CardTitle className="text-lg">🛠️ Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <HapticButton
                  key={tool.name}
                  variant={selectedTool.name === tool.name ? "default" : "outline"}
                  onClick={() => setSelectedTool(tool)}
                  className="h-16 text-2xl"
                  hapticType="light"
                >
                  {tool.icon}
                </HapticButton>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="mb-6 p-4">
          <CardHeader>
            <CardTitle className="text-lg">🎨 Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <HapticButton
                  key={color.name}
                  variant={selectedColor === color.value ? "default" : "outline"}
                  onClick={() => setSelectedColor(color.value)}
                  className="h-16"
                  style={{ backgroundColor: color.value }}
                  hapticType="light"
                >
                  {selectedColor === color.value && (
                    <div className="w-4 h-4 bg-white rounded-full mx-auto" />
                  )}
                </HapticButton>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <HapticButton
            variant="outline"
            onClick={() => setShowTemplate(!showTemplate)}
            className="h-12"
            hapticType="light"
          >
            {showTemplate ? 'Hide Template' : 'Show Template'}
          </HapticButton>
          
          <HapticButton
            onClick={clearCanvas}
            className="h-12"
            hapticType="light"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </HapticButton>
        </div>

        {/* Current Selection */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            Selected: {selectedTool.name} • 
            Color: <span className="inline-block w-4 h-4 rounded ml-1" style={{ backgroundColor: selectedColor }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}