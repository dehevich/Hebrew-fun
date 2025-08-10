"use client";

import { useState, useRef, useEffect } from 'react';
import { HapticButton } from '@/components/ui/haptic-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Palette, Save, Download, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components

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
  { name: 'Eraser', icon: '🧹', size: 15 },
];

// Detailed SVG path data for coloring sheets
const coloringSheets = [
  {
    id: 'car-1',
    title: 'Racing Car',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Main car body
        { type: 'path', content: 'M 50 200 L 100 150 L 300 150 L 350 200 L 350 250 L 50 250 Z', color: '#333333' },
        // Roof
        { type: 'path', content: 'M 120 150 L 280 150 L 260 100 L 140 100 Z', color: '#333333' },
        // Windows
        { type: 'path', content: 'M 145 105 L 255 105 L 245 145 L 155 145 Z', color: '#333333' },
        // Wheels
        { type: 'circle', content: '100 250 30', color: '#333333' },
        { type: 'circle', content: '300 250 30', color: '#333333' },
        // Wheel details
        { type: 'circle', content: '100 250 15', color: '#333333' },
        { type: 'circle', content: '300 250 15', color: '#333333' },
        // Headlight
        { type: 'path', content: 'M 350 200 L 370 190 L 370 210 L 350 220 Z', color: '#333333' },
        // Tail light
        { type: 'path', content: 'M 50 200 L 30 190 L 30 210 L 50 220 Z', color: '#333333' },
      ]
    }
  },
  {
    id: 'animal-1',
    title: 'Happy Lion',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Head
        { type: 'circle', content: '200 150 80', color: '#333333' },
        // Mane (multiple circles around head)
        { type: 'circle', content: '200 150 100', color: '#333333', fill: false },
        { type: 'circle', content: '200 150 105', color: '#333333', fill: false },
        // Ears
        { type: 'circle', content: '130 90 25', color: '#333333' },
        { type: 'circle', content: '270 90 25', color: '#333333' },
        // Eyes
        { type: 'circle', content: '170 130 10', color: '#333333' },
        { type: 'circle', content: '230 130 10', color: '#333333' },
        // Nose
        { type: 'path', content: 'M 200 160 L 190 175 L 210 175 Z', color: '#333333' },
        // Mouth
        { type: 'path', content: 'M 180 185 Q 200 200 220 185', color: '#333333' },
        // Body
        { type: 'ellipse', content: '200 280 120 70', color: '#333333' },
        // Legs
        { type: 'rect', content: '120 320 30 60', color: '#333333' },
        { type: 'rect', content: '250 320 30 60', color: '#333333' },
        // Tail
        { type: 'path', content: 'M 320 280 Q 350 250 380 300', color: '#333333' },
        { type: 'circle', content: '380 300 15', color: '#333333' }, // Tail tuft
      ]
    }
  },
  {
    id: 'flower-1',
    title: 'Beautiful Flower',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Center
        { type: 'circle', content: '200 200 40', color: '#333333' },
        // Petals
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 0 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 45 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 90 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 135 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 180 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 225 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 270 },
        { type: 'ellipse', content: '200 120 30 60', color: '#333333', rotation: 315 },
        // Stem
        { type: 'rect', content: '190 240 20 150', color: '#333333' },
        // Leaves
        { type: 'path', content: 'M 190 300 Q 150 280 180 260 Q 190 270 190 300 Z', color: '#333333' },
        { type: 'path', content: 'M 210 300 Q 250 280 220 260 Q 210 270 210 300 Z', color: '#333333' },
      ]
    }
  },
  {
    id: 'space-1',
    title: 'Rocket Ship',
    template: {
      backgroundColor: '#000033', // Dark blue for space background
      elements: [
        // Rocket body
        { type: 'path', content: 'M 200 50 L 250 150 L 250 350 L 200 400 L 150 350 L 150 150 Z', color: '#333333' },
        // Nose cone
        { type: 'path', content: 'M 200 50 L 150 150 L 250 150 Z', color: '#333333' },
        // Fins
        { type: 'path', content: 'M 150 300 L 100 350 L 150 350 Z', color: '#333333' },
        { type: 'path', content: 'M 250 300 L 300 350 L 250 350 Z', color: '#333333' },
        // Window
        { type: 'circle', content: '200 180 30', color: '#333333' },
        // Flame
        { type: 'path', content: 'M 180 400 Q 200 450 220 400 L 200 420 Z', color: '#333333' },
        // Stars (small circles)
        { type: 'circle', content: '50 80 5', color: '#333333' },
        { type: 'circle', content: '350 120 5', color: '#333333' },
        { type: 'circle', content: '100 300 5', color: '#333333' },
        { type: 'circle', content: '300 380 5', color: '#333333' },
      ]
    }
  },
  {
    id: 'airplane-1',
    title: 'Propeller Plane',
    template: {
      backgroundColor: '#ffffff',
      elements: [
        // Body
        { type: 'ellipse', content: '200 200 150 40', color: '#333333' },
        // Tail fin vertical
        { type: 'path', content: 'M 50 180 L 80 150 L 80 220 L 50 200 Z', color: '#333333' },
        // Tail fin horizontal
        { type: 'path', content: 'M 50 200 L 80 200 L 60 230 L 30 230 Z', color: '#333333' },
        // Wings
        { type: 'path', content: 'M 150 200 L 200 100 L 250 200 L 200 300 Z', color: '#333333' },
        // Propeller
        { type: 'circle', content: '350 200 20', color: '#333333' },
        { type: 'path', content: 'M 350 180 L 350 220 M 330 200 L 370 200', color: '#333333' },
        // Windows
        { type: 'circle', content: '250 190 10', color: '#333333' },
        { type: 'circle', content: '280 190 10', color: '#333333' },
        { type: 'circle', content: '310 190 10', color: '#333333' },
      ]
    }
  },
];

export default function ColoringGame({ sheetId, title, onBack, onSave }: ColoringGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#ef4444');
  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTemplate, setShowTemplate] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 500 });
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for mobile sheet

  const sheet = coloringSheets.find(s => s.id === sheetId) || coloringSheets[0];

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // Account for padding
        const aspectRatio = 4/5; // 400:500 ratio
        const newWidth = Math.min(containerWidth, 400);
        const newHeight = newWidth / aspectRatio;
        
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = sheet.template.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw template if enabled
    if (showTemplate) {
      drawTemplate(ctx);
    }
  }, [sheet, showTemplate, canvasSize]);

  const drawTemplate = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'transparent';

    // Calculate scale factor based on canvas size
    const scaleX = canvasSize.width / 400; // Original template width is 400
    const scaleY = canvasSize.height / 500; // Original template height is 500
    const scale = Math.min(scaleX, scaleY);

    // Apply scaling
    ctx.scale(scale, scale);

    sheet.template.elements.forEach(element => {
      ctx.save();
      
      if (element.rotation) {
        // Translate to center of rotation, rotate, then translate back
        // Assuming rotation is around the element's own center or a predefined point
        // For simplicity, if no specific center is given, rotate around canvas center or element's x,y
        // For these SVG paths, rotation is usually applied to the whole path.
        // If elements have x,y, they are already translated.
        // For now, assuming rotation is for the whole canvas context if needed.
        // For individual elements, it's more complex and usually part of the path data itself.
        // The current rotation logic in drawElement is for elements with x,y.
        // For template elements, if rotation is needed, it should be applied to the path.
        // For now, I'll keep it simple and assume rotation is not directly applied to template elements unless specified in path.
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
          ctx.ellipse(ex, ey, rx, ry, (element.rotation || 0) * Math.PI / 180, 0, 2 * Math.PI); // Apply rotation here
          ctx.stroke();
          break;
        case 'path':
          const path = new Path2D(element.content);
          ctx.stroke(path);
          break;
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  };

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (selectedTool.name === 'Eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
    }
    
    ctx.lineWidth = selectedTool.size * (canvasSize.width / 400); // Scale brush size
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedTool.name === 'Eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col p-4">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <HapticButton
            variant="outline"
            onClick={onBack}
            className="p-2"
            hapticType="light"
          >
            <ArrowLeft className="w-5 h-5" />
          </HapticButton>
          <div className="text-center flex-1">
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

        {/* Main Content Area - Canvas */}
        <div className="flex-grow flex items-center justify-center mb-4">
          <Card className="p-4 w-full max-w-md" ref={containerRef}>
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                aspectRatio: '4/5'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </Card>
        </div>

        {/* Mobile Tools/Colors - Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-around items-center lg:hidden safe-area-bottom">
          <HapticButton
            variant="outline"
            onClick={() => setShowTemplate(!showTemplate)}
            className="flex-1 mx-1"
            hapticType="light"
          >
            {showTemplate ? '👁️ Hide' : '👁️ Show'}
          </HapticButton>
          
          <HapticButton
            onClick={clearCanvas}
            className="flex-1 mx-1"
            hapticType="light"
          >
            <RotateCcw className="w-4 h-4" /> Clear
          </HapticButton>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <HapticButton
                variant="default"
                className="flex-1 mx-1 bg-purple-500 hover:bg-purple-600 text-white"
                hapticType="medium"
              >
                <Palette className="w-4 h-4 mr-1" /> Tools
              </HapticButton>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-2/3 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">🛠️ Tools & 🎨 Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tools */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Tools</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {tools.map((tool) => (
                      <HapticButton
                        key={tool.name}
                        variant={selectedTool.name === tool.name ? "default" : "outline"}
                        onClick={() => setSelectedTool(tool)}
                        className="h-14 text-xl"
                        hapticType="light"
                      >
                        {tool.icon}
                      </HapticButton>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Colors</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <HapticButton
                        key={color.name}
                        variant={selectedColor === color.value ? "default" : "outline"}
                        onClick={() => setSelectedColor(color.value)}
                        className="h-12"
                        style={{ backgroundColor: color.value }}
                        hapticType="light"
                      >
                        {selectedColor === color.value && (
                          <div className="w-3 h-3 bg-white rounded-full mx-auto" />
                        )}
                      </HapticButton>
                    ))}
                  </div>
                </div>
              </CardContent>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Tools and Colors - Right Side */}
        <div className="hidden lg:block w-full lg:w-80 space-y-4 absolute right-4 top-20"> {/* Positioned absolutely for desktop */}
          {/* Tools */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">🛠️ Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => (
                  <HapticButton
                    key={tool.name}
                    variant={selectedTool.name === tool.name ? "default" : "outline"}
                    onClick={() => setSelectedTool(tool)}
                    className="h-14 text-xl"
                    hapticType="light"
                  >
                    {tool.icon}
                  </HapticButton>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">🎨 Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <HapticButton
                    key={color.name}
                    variant={selectedColor === color.value ? "default" : "outline"}
                    onClick={() => setSelectedColor(color.value)}
                    className="h-12"
                    style={{ backgroundColor: color.value }}
                    hapticType="light"
                  >
                    {selectedColor === color.value && (
                      <div className="w-3 h-3 bg-white rounded-full mx-auto" />
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
              {showTemplate ? '👁️ Hide Template' : '👁️ Show Template'}
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
        </div>

        {/* Current Selection */}
        <div className="mt-auto text-center pb-4 hidden lg:block"> {/* Only show on desktop */}
          <div className="text-sm text-gray-600">
            Selected: {selectedTool.name} • 
            Color: <span className="inline-block w-4 h-4 rounded ml-1" style={{ backgroundColor: selectedColor }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}