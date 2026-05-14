import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layout, Button, Select, Slider, Switch, ColorPicker, Space, Typography, Divider } from 'antd';
import { DeleteOutlined, UndoOutlined, RedoOutlined, DownloadOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'ellipse' | 'triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  rx?: number;
  ry?: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

const GRID_SIZE = 20;
const GOLDEN_RATIO = 1.618;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'line' | 'ellipse' | 'triangle'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showGoldenRatio, setShowGoldenRatio] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(GRID_SIZE);
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasWidth = 800;
  const canvasHeight = 600;

  const snap = useCallback((value: number) => {
    if (snapToGrid) {
      return Math.round(value / gridSize) * gridSize;
    }
    return value;
  }, [snapToGrid, gridSize]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: snap(e.clientX - rect.left),
      y: snap(e.clientY - rect.top),
    };
  }, [snap]);

  const saveToHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  const hitTest = useCallback((shape: Shape, x: number, y: number): boolean => {
    const tolerance = 10;
    switch (shape.type) {
      case 'rectangle':
        return x >= shape.x! - tolerance && x <= shape.x! + shape.width! + tolerance &&
               y >= shape.y! - tolerance && y <= shape.y! + shape.height! + tolerance;
      case 'circle':
        const dx = x - shape.x;
        const dy = y - shape.y;
        return Math.sqrt(dx * dx + dy * dy) <= shape.radius! + tolerance;
      case 'ellipse':
        const edx = x - shape.x;
        const edy = y - shape.y;
        return (edx * edx) / ((shape.rx! + tolerance) ** 2) + 
               (edy * edy) / ((shape.ry! + tolerance) ** 2) <= 1;
      case 'line':
        const lx1 = shape.x, ly1 = shape.y;
        const lx2 = shape.x2!, ly2 = shape.y2!;
        const lineLen = Math.sqrt((lx2 - lx1) ** 2 + (ly2 - ly1) ** 2);
        const t = Math.max(0, Math.min(1, ((x - lx1) * (lx2 - lx1) + (y - ly1) * (ly2 - ly1)) / (lineLen ** 2)));
        const projX = lx1 + t * (lx2 - lx1);
        const projY = ly1 + t * (ly2 - ly1);
        return Math.sqrt((x - projX) ** 2 + (y - projY) ** 2) <= tolerance;
      case 'triangle':
        const tx = shape.x!, ty = shape.y!;
        const tw = shape.width!, th = shape.height!;
        return x >= tx - tolerance && x <= tx + tw + tolerance &&
               y >= ty - tolerance && y <= ty + th + tolerance;
      default:
        return false;
    }
  }, []);

  const getShapeCenter = useCallback((shape: Shape): { x: number, y: number } => {
    switch (shape.type) {
      case 'rectangle':
        return { x: shape.x! + shape.width! / 2, y: shape.y! + shape.height! / 2 };
      case 'circle':
        return { x: shape.x, y: shape.y };
      case 'ellipse':
        return { x: shape.x, y: shape.y };
      case 'line':
        return { x: (shape.x + shape.x2!) / 2, y: (shape.y + shape.y2!) / 2 };
      case 'triangle':
        return { x: shape.x! + shape.width! / 2, y: shape.y! + shape.height! / 2 };
      default:
        return { x: 0, y: 0 };
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    
    if (currentTool === 'select') {
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (hitTest(shapes[i], pos.x, pos.y)) {
          setSelectedShapeId(shapes[i].id);
          setIsDragging(true);
          const center = getShapeCenter(shapes[i]);
          setDragOffset({ x: pos.x - center.x, y: pos.y - center.y });
          setStartPos(pos);
          return;
        }
      }
      setSelectedShapeId(null);
      return;
    }
    
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    
    if (isDragging && selectedShapeId) {
      const newX = snap(pos.x - dragOffset.x);
      const newY = snap(pos.y - dragOffset.y);
      
      setShapes(prevShapes => prevShapes.map(shape => {
        if (shape.id !== selectedShapeId) return shape;
        
        const center = getShapeCenter(shape);
        const dx = newX - center.x;
        const dy = newY - center.y;
        
        switch (shape.type) {
          case 'rectangle':
            return { ...shape, x: shape.x! + dx, y: shape.y! + dy };
          case 'circle':
          case 'ellipse':
            return { ...shape, x: shape.x + dx, y: shape.y + dy };
          case 'line':
            return { ...shape, x: shape.x + dx, y: shape.y + dy, x2: shape.x2! + dx, y2: shape.y2! + dy };
          case 'triangle':
            return { ...shape, x: shape.x! + dx, y: shape.y! + dy };
          default:
            return shape;
        }
      }));
      return;
    }
    
    if (!isDrawing) return;
    setCurrentPos(pos);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory(shapes);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);

    const id = Date.now().toString();
    let newShape: Shape | null = null;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    switch (currentTool) {
      case 'rectangle':
        if (width > 0 && height > 0) {
          newShape = {
            id,
            type: 'rectangle',
            x,
            y,
            width,
            height,
            stroke: strokeColor,
            strokeWidth,
            fill: fillColor,
          };
        }
        break;
      case 'circle':
        const radius = Math.min(width, height) / 2;
        if (radius > 0) {
          newShape = {
            id,
            type: 'circle',
            x: x + width / 2,
            y: y + height / 2,
            radius,
            stroke: strokeColor,
            strokeWidth,
            fill: fillColor,
          };
        }
        break;
      case 'ellipse':
        if (width > 0 && height > 0) {
          newShape = {
            id,
            type: 'ellipse',
            x: x + width / 2,
            y: y + height / 2,
            rx: width / 2,
            ry: height / 2,
            stroke: strokeColor,
            strokeWidth,
            fill: fillColor,
          };
        }
        break;
      case 'line':
        if (width > 0 || height > 0) {
          newShape = {
            id,
            type: 'line',
            x: startPos.x,
            y: startPos.y,
            x2: currentPos.x,
            y2: currentPos.y,
            stroke: strokeColor,
            strokeWidth,
            fill: 'transparent',
          };
        }
        break;
      case 'triangle':
        if (width > 0 && height > 0) {
          newShape = {
            id,
            type: 'triangle',
            x,
            y,
            width,
            height,
            stroke: strokeColor,
            strokeWidth,
            fill: fillColor,
          };
        }
        break;
    }

    if (newShape) {
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      saveToHistory(newShapes);
    }
  };

  const clearCanvas = () => {
    const newShapes: Shape[] = [];
    setShapes(newShapes);
    saveToHistory(newShapes);
  };

  const deleteLastShape = () => {
    if (shapes.length > 0) {
      const newShapes = shapes.slice(0, -1);
      setShapes(newShapes);
      saveToHistory(newShapes);
    }
  };

  const downloadSVG = () => {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logo-draft.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSVG = () => {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">`;
    
    shapes.forEach(shape => {
      switch (shape.type) {
        case 'rectangle':
          svg += `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}" />`;
          break;
        case 'circle':
          svg += `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}" />`;
          break;
        case 'ellipse':
          svg += `<ellipse cx="${shape.x}" cy="${shape.y}" rx="${shape.rx}" ry="${shape.ry}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}" />`;
          break;
        case 'line':
          svg += `<line x1="${shape.x}" y1="${shape.y}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />`;
          break;
        case 'triangle':
          const points = `${shape.x! + shape.width! / 2},${shape.y} ${shape.x},${shape.y! + shape.height!} ${shape.x! + shape.width!},${shape.y! + shape.height!}`;
          svg += `<polygon points="${points}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}" />`;
          break;
      }
    });
    
    svg += '</svg>';
    return svg;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (showGrid) {
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#d9d9d9';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    if (showGoldenRatio) {
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const goldenWidth = canvasWidth / GOLDEN_RATIO;
      const goldenHeight = canvasHeight / GOLDEN_RATIO;

      ctx.beginPath();
      ctx.moveTo(goldenWidth, 0);
      ctx.lineTo(goldenWidth, canvasHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvasWidth - goldenWidth, 0);
      ctx.lineTo(canvasWidth - goldenWidth, canvasHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, goldenHeight);
      ctx.lineTo(canvasWidth, goldenHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, canvasHeight - goldenHeight);
      ctx.lineTo(canvasWidth, canvasHeight - goldenHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(canvasWidth, canvasHeight) / 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    shapes.forEach(shape => {
      ctx.strokeStyle = shape.stroke;
      ctx.fillStyle = shape.fill;
      ctx.lineWidth = shape.strokeWidth;

      switch (shape.type) {
        case 'rectangle':
          ctx.beginPath();
          ctx.rect(shape.x!, shape.y!, shape.width!, shape.height!);
          ctx.fill();
          ctx.stroke();
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius!, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'ellipse':
          ctx.beginPath();
          ctx.ellipse(shape.x, shape.y, shape.rx!, shape.ry!, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x2!, shape.y2!);
          ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(shape.x! + shape.width! / 2, shape.y);
          ctx.lineTo(shape.x!, shape.y! + shape.height!);
          ctx.lineTo(shape.x! + shape.width!, shape.y! + shape.height!);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }

      if (shape.id === selectedShapeId) {
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        switch (shape.type) {
          case 'rectangle':
            ctx.strokeRect(shape.x! - 5, shape.y! - 5, shape.width! + 10, shape.height! + 10);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius! + 5, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(shape.x, shape.y, shape.rx! + 5, shape.ry! + 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'line':
            ctx.strokeRect(Math.min(shape.x, shape.x2!) - 5, Math.min(shape.y, shape.y2!) - 5, 
                          Math.abs(shape.x2! - shape.x) + 10, Math.abs(shape.y2! - shape.y) + 10);
            break;
          case 'triangle':
            ctx.strokeRect(shape.x! - 5, shape.y! - 5, shape.width! + 10, shape.height! + 10);
            break;
        }
        ctx.setLineDash([]);
      }
    });

    if (isDrawing && currentTool !== 'select') {
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]);

      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);

      switch (currentTool) {
        case 'rectangle':
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.stroke();
          break;
        case 'circle':
          const radius = Math.min(width, height) / 2;
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'ellipse':
          ctx.beginPath();
          ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(currentPos.x, currentPos.y);
          ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(x + width / 2, y);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x + width, y + height);
          ctx.closePath();
          ctx.stroke();
          break;
      }
      ctx.setLineDash([]);
    }
  }, [shapes, isDrawing, isDragging, startPos, currentPos, showGrid, showGoldenRatio, gridSize, currentTool, strokeColor, fillColor, strokeWidth, selectedShapeId]);

  useEffect(() => {
    if (history.length === 0 && shapes.length === 0) {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, []);

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          🎨 网格基准 LOGO 草图设计器
        </Title>
        <Space>
          <Button icon={<UndoOutlined />} onClick={undo} disabled={historyIndex <= 0}>
            撤销
          </Button>
          <Button icon={<RedoOutlined />} onClick={redo} disabled={historyIndex >= history.length - 1}>
            重做
          </Button>
          <Button icon={<DeleteOutlined />} onClick={deleteLastShape} disabled={shapes.length === 0}>
            删除最后图形
          </Button>
          <Button icon={<DeleteOutlined />} onClick={clearCanvas} danger>
            清空画布
          </Button>
          <Button icon={<DownloadOutlined />} onClick={downloadSVG} type="primary">
            导出 SVG
          </Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={280} className="app-sider">
          <div className="sider-content">
            <Title level={5}>绘图工具</Title>
            <Select
              value={currentTool}
              onChange={(value) => setCurrentTool(value)}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <Select.Option value="select">👆 选择/拖动</Select.Option>
              <Select.Option value="rectangle">⬜ 矩形</Select.Option>
              <Select.Option value="circle">⭕ 圆形</Select.Option>
              <Select.Option value="ellipse">🔘 椭圆</Select.Option>
              <Select.Option value="line">➖ 直线</Select.Option>
              <Select.Option value="triangle">🔺 三角形</Select.Option>
            </Select>

            <Divider />

            <Title level={5}>样式设置</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8 }}>边框颜色</div>
                <ColorPicker value={strokeColor} onChange={(color) => setStrokeColor(color.toHexString())} showText />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>填充颜色</div>
                <ColorPicker value={fillColor} onChange={(color) => setFillColor(color.toHexString())} showText />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>边框粗细: {strokeWidth}px</div>
                <Slider min={1} max={10} value={strokeWidth} onChange={setStrokeWidth} />
              </div>
            </Space>

            <Divider />

            <Title level={5}>网格设置</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>显示网格</span>
                <Switch checked={showGrid} onChange={setShowGrid} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>吸附到网格</span>
                <Switch checked={snapToGrid} onChange={setSnapToGrid} />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>网格大小: {gridSize}px</div>
                <Slider min={10} max={50} value={gridSize} onChange={setGridSize} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>黄金分割辅助线</span>
                <Switch checked={showGoldenRatio} onChange={setShowGoldenRatio} />
              </div>
            </Space>

            <Divider />

            <Title level={5}>操作提示</Title>
            <ul style={{ fontSize: 12, color: '#666', paddingLeft: 16 }}>
              <li>选择工具后在画布上拖动绘制</li>
              <li>网格线帮助对齐元素</li>
              <li>黄金分割线辅助构图</li>
              <li>可导出 SVG 进行后续编辑</li>
            </ul>
          </div>
        </Sider>
        <Content className="app-content">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="design-canvas"
            />
          </div>
          <div className="canvas-info">
            <span>画布尺寸: {canvasWidth} × {canvasHeight}px</span>
            <span style={{ marginLeft: 24 }}>图形数量: {shapes.length}</span>
            <span style={{ marginLeft: 24 }}>黄金比例: φ = {GOLDEN_RATIO.toFixed(3)}</span>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
