export interface ColoringSheetData {
  id: string;
  title: string;
  elements: ColoringElement[];
  backgroundColor: string;
}

export interface ColoringElement {
  type: 'shape' | 'text' | 'path';
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation?: number;
}

export class ColoringSheetGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }
    this.ctx = context;
  }

  generateColoringSheet(sheetData: ColoringSheetData): void {
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Set background
    this.ctx.fillStyle = sheetData.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw elements
    sheetData.elements.forEach(element => {
      this.drawElement(element);
    });
    
    // Add title
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(sheetData.title, width / 2, 30);
  }

  private drawElement(element: ColoringElement): void {
    this.ctx.save();
    this.ctx.translate(element.x, element.y);
    
    if (element.rotation) {
      this.ctx.rotate(element.rotation * Math.PI / 180);
    }
    
    this.ctx.strokeStyle = element.color;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'transparent';

    switch (element.type) {
      case 'shape':
        this.drawShape(element);
        break;
      case 'text':
        this.drawText(element);
        break;
      case 'path':
        this.drawPath(element);
        break;
    }
    
    this.ctx.restore();
  }

  private drawShape(element: ColoringElement): void {
    const size = element.size;
    
    switch (element.content) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
      case 'square':
        this.ctx.strokeRect(-size / 2, -size / 2, size, size);
        break;
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size / 2);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.lineTo(size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.stroke();
        break;
      case 'star':
        this.drawStar(0, 0, 5, size / 2, size / 4);
        break;
      case 'heart':
        this.drawHeart(0, 0, size);
        break;
      case 'car':
        this.drawCar(0, 0, size);
        break;
      case 'flower':
        this.drawFlower(0, 0, size);
        break;
      case 'airplane':
        this.drawAirplane(0, 0, size);
        break;
      case 'rocket':
        this.drawRocket(0, 0, size);
        break;
    }
  }

  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }

    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private drawHeart(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size / 4);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 2, x, y + size);
    this.ctx.bezierCurveTo(x, y + size / 2, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    this.ctx.stroke();
  }

  private drawCar(x: number, y: number, size: number): void {
    // Car body
    this.ctx.strokeRect(x - size / 2, y - size / 4, size, size / 2);
    
    // Car roof
    this.ctx.strokeRect(x - size / 4, y - size / 2, size / 2, size / 4);
    
    // Wheels
    this.ctx.beginPath();
    this.ctx.arc(x - size / 3, y + size / 4, size / 8, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(x + size / 3, y + size / 4, size / 8, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  private drawFlower(x: number, y: number, size: number): void {
    // Flower center
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 6, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const petalX = x + Math.cos(angle) * size / 3;
      const petalY = y + Math.sin(angle) * size / 3;
      
      this.ctx.beginPath();
      this.ctx.arc(petalX, petalY, size / 6, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    
    // Stem
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size / 6);
    this.ctx.lineTo(x, y + size);
    this.ctx.stroke();
  }

  private drawAirplane(x: number, y: number, size: number): void {
    // Main body
    this.ctx.beginPath();
    this.ctx.moveTo(x - size / 2, y);
    this.ctx.lineTo(x + size / 2, y);
    this.ctx.stroke();
    
    // Wings
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size / 4);
    this.ctx.lineTo(x - size / 3, y + size / 4);
    this.ctx.moveTo(x, y - size / 4);
    this.ctx.lineTo(x + size / 3, y + size / 4);
    this.ctx.stroke();
    
    // Tail
    this.ctx.beginPath();
    this.ctx.moveTo(x + size / 2, y);
    this.ctx.lineTo(x + size / 2, y - size / 4);
    this.ctx.stroke();
  }

  private drawRocket(x: number, y: number, size: number): void {
    // Rocket body
    this.ctx.beginPath();
    this.ctx.moveTo(x - size / 4, y + size / 2);
    this.ctx.lineTo(x - size / 4, y - size / 4);
    this.ctx.lineTo(x, y - size / 2);
    this.ctx.lineTo(x + size / 4, y - size / 4);
    this.ctx.lineTo(x + size / 4, y + size / 2);
    this.ctx.closePath();
    this.ctx.stroke();
    
    // Fins
    this.ctx.beginPath();
    this.ctx.moveTo(x - size / 4, y + size / 4);
    this.ctx.lineTo(x - size / 2, y + size / 2);
    this.ctx.moveTo(x + size / 4, y + size / 4);
    this.ctx.lineTo(x + size / 2, y + size / 2);
    this.ctx.stroke();
    
    // Window
    this.ctx.beginPath();
    this.ctx.arc(x, y - size / 6, size / 8, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  private drawText(element: ColoringElement): void {
    this.ctx.font = `${element.size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.strokeText(element.content, 0, 0);
  }

  private drawPath(element: ColoringElement): void {
    this.ctx.beginPath();
    // Simple path drawing - you can expand this with more complex path data
    this.ctx.moveTo(-element.size / 2, 0);
    this.ctx.quadraticCurveTo(0, -element.size / 2, element.size / 2, 0);
    this.ctx.quadraticCurveTo(0, element.size / 2, -element.size / 2, 0);
    this.ctx.stroke();
  }

  downloadSheet(filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}

// Predefined coloring sheet templates
export const coloringSheetTemplates: Record<string, ColoringSheetData> = {
  'car-1': {
    id: 'car-1',
    title: 'Racing Car',
    backgroundColor: '#ffffff',
    elements: [
      { type: 'shape', content: 'car', x: 200, y: 200, size: 150, color: '#333333' },
      { type: 'shape', content: 'circle', x: 150, y: 250, size: 30, color: '#333333' },
      { type: 'shape', content: 'circle', x: 250, y: 250, size: 30, color: '#333333' },
      { type: 'text', content: 'RACING CAR', x: 200, y: 320, size: 20, color: '#333333' }
    ]
  },
  'animal-1': {
    id: 'animal-1',
    title: 'Cute Lion',
    backgroundColor: '#ffffff',
    elements: [
      { type: 'shape', content: 'circle', x: 200, y: 200, size: 100, color: '#333333' },
      { type: 'shape', content: 'circle', x: 180, y: 180, size: 15, color: '#333333' },
      { type: 'shape', content: 'circle', x: 220, y: 180, size: 15, color: '#333333' },
      { type: 'shape', content: 'star', x: 200, y: 150, size: 20, color: '#333333' },
      { type: 'text', content: 'CUTE LION', x: 200, y: 320, size: 20, color: '#333333' }
    ]
  },
  'flower-1': {
    id: 'flower-1',
    title: 'Sunflower',
    backgroundColor: '#ffffff',
    elements: [
      { type: 'shape', content: 'flower', x: 200, y: 200, size: 120, color: '#333333' },
      { type: 'shape', content: 'circle', x: 200, y: 200, size: 25, color: '#333333' },
      { type: 'text', content: 'SUNFLOWER', x: 200, y: 320, size: 20, color: '#333333' }
    ]
  },
  'space-1': {
    id: 'space-1',
    title: 'Rocket Ship',
    backgroundColor: '#ffffff',
    elements: [
      { type: 'shape', content: 'rocket', x: 200, y: 200, size: 100, color: '#333333' },
      { type: 'shape', content: 'star', x: 100, y: 100, size: 15, color: '#333333' },
      { type: 'shape', content: 'star', x: 300, y: 150, size: 15, color: '#333333' },
      { type: 'shape', content: 'star', x: 150, y: 300, size: 15, color: '#333333' },
      { type: 'text', content: 'ROCKET SHIP', x: 200, y: 320, size: 20, color: '#333333' }
    ]
  },
  'airplane-1': {
    id: 'airplane-1',
    title: 'Propeller Plane',
    backgroundColor: '#ffffff',
    elements: [
      { type: 'shape', content: 'airplane', x: 200, y: 200, size: 120, color: '#333333' },
      { type: 'shape', content: 'circle', x: 200, y: 200, size: 20, color: '#333333' },
      { type: 'text', content: 'PROPELLER PLANE', x: 200, y: 320, size: 20, color: '#333333' }
    ]
  }
};