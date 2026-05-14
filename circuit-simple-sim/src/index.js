import './styles.styl';

class CircuitSimulator {
  constructor() {
    this.canvas = document.getElementById('circuitCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.components = [];
    this.wires = [];
    this.draggingComponent = null;
    this.dragOffset = { x: 0, y: 0 };
    this.connecting = null;
    this.mousePos = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.animate();
  }
  
  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
    
    document.querySelectorAll('.component-item').forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
        item.style.opacity = '0.5';
      });
      
      item.addEventListener('dragend', (e) => {
        item.style.opacity = '1';
      });
      
      item.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.addComponent(item.dataset.type, rect.width / 2, rect.height / 2);
      });
    });
    
    const canvasContainer = this.canvas.parentElement;
    
    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      if (type) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.addComponent(type, x, y);
      }
    });
    
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }
  
  addComponent(type, x, y) {
    const component = new Component(type, x, y);
    this.components.push(component);
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const component of this.components) {
      const terminal = component.getClickedTerminal(x, y);
      if (terminal) {
        if (this.connecting === null) {
          this.connecting = { component, terminal };
        } else {
          if (this.connecting.component !== component || this.connecting.terminal !== terminal) {
            this.wires.push({
              from: { component: this.connecting.component, terminal: this.connecting.terminal },
              to: { component, terminal }
            });
          }
          this.connecting = null;
        }
        return;
      }
    }
    
    for (const component of this.components) {
      if (component.isPointInside(x, y)) {
        if (component.type === 'switch') {
          component.toggle();
        } else {
          this.draggingComponent = component;
          this.dragOffset = {
            x: x - component.x,
            y: y - component.y
          };
        }
        return;
      }
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (this.draggingComponent) {
      this.draggingComponent.x = this.mousePos.x - this.dragOffset.x;
      this.draggingComponent.y = this.mousePos.y - this.dragOffset.y;
    }
  }
  
  handleMouseUp(e) {
    this.draggingComponent = null;
  }
  
  checkCircuit() {
    const bulbs = this.components.filter(c => c.type === 'bulb');
    bulbs.forEach(bulb => bulb.isOn = false);
    
    const batteries = this.components.filter(c => c.type === 'battery');
    
    for (const battery of batteries) {
      const positiveConnected = this.findAllReachable(battery, 'positive');
      const negativeConnected = this.findAllReachable(battery, 'negative');
      
      for (const bulb of bulbs) {
        const bulbLeftInPositive = positiveConnected.some(
          c => c.component.id === bulb.id && c.terminal === 'left'
        );
        const bulbRightInPositive = positiveConnected.some(
          c => c.component.id === bulb.id && c.terminal === 'right'
        );
        const bulbLeftInNegative = negativeConnected.some(
          c => c.component.id === bulb.id && c.terminal === 'left'
        );
        const bulbRightInNegative = negativeConnected.some(
          c => c.component.id === bulb.id && c.terminal === 'right'
        );
        
        if ((bulbLeftInPositive && bulbRightInNegative) || 
            (bulbLeftInNegative && bulbRightInPositive)) {
          bulb.isOn = true;
        }
      }
    }
  }
  
  findAllReachable(startComponent, startTerminal) {
    const visited = new Set();
    const result = [];
    const queue = [{ component: startComponent, terminal: startTerminal }];
    
    while (queue.length > 0) {
      const { component, terminal } = queue.shift();
      const key = `${component.id}-${terminal}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      result.push({ component, terminal });
      
      for (const wire of this.wires) {
        let nextComponent = null;
        let nextTerminal = null;
        
        if (wire.from.component.id === component.id && wire.from.terminal === terminal) {
          nextComponent = wire.to.component;
          nextTerminal = wire.to.terminal;
        } else if (wire.to.component.id === component.id && wire.to.terminal === terminal) {
          nextComponent = wire.from.component;
          nextTerminal = wire.from.terminal;
        }
        
        if (nextComponent) {
          if (nextComponent.type === 'switch') {
            if (nextComponent.isOn) {
              const otherTerminal = nextTerminal === 'left' ? 'right' : 'left';
              queue.push({ component: nextComponent, terminal: otherTerminal });
            }
          } else if (nextComponent.type === 'bulb') {
            const otherTerminal = nextTerminal === 'left' ? 'right' : 'left';
            queue.push({ component: nextComponent, terminal: otherTerminal });
          } else {
            queue.push({ component: nextComponent, terminal: nextTerminal });
          }
        }
      }
    }
    
    return result;
  }
  
  animate() {
    this.checkCircuit();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawGrid();
    
    this.wires.forEach(wire => this.drawWire(wire));
    
    if (this.connecting) {
      const startPos = this.connecting.component.getTerminalPosition(this.connecting.terminal);
      this.ctx.beginPath();
      this.ctx.moveTo(startPos.x, startPos.y);
      this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
      this.ctx.strokeStyle = '#ff6b6b';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    this.components.forEach(component => component.draw(this.ctx));
  }
  
  drawGrid() {
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    
    const gridSize = 20;
    
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  drawWire(wire) {
    const fromPos = wire.from.component.getTerminalPosition(wire.from.terminal);
    const toPos = wire.to.component.getTerminalPosition(wire.to.terminal);
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);
    this.ctx.lineTo(toPos.x, toPos.y);
    this.ctx.strokeStyle = '#e74c3c';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }
}

class Component {
  static idCounter = 0;
  
  constructor(type, x, y) {
    this.id = ++Component.idCounter;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 50;
    this.isOn = type === 'battery';
    this.terminalRadius = 8;
  }
  
  getTerminalPosition(terminal) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    switch (terminal) {
      case 'left':
      case 'negative':
        return { x: this.x - halfWidth, y: this.y };
      case 'right':
      case 'positive':
        return { x: this.x + halfWidth, y: this.y };
    }
    return { x: this.x, y: this.y };
  }
  
  getClickedTerminal(x, y) {
    const terminals = this.getTerminals();
    for (const terminal of terminals) {
      const pos = this.getTerminalPosition(terminal);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < this.terminalRadius + 5) {
        return terminal;
      }
    }
    return null;
  }
  
  getTerminals() {
    switch (this.type) {
      case 'battery':
        return ['negative', 'positive'];
      case 'bulb':
      case 'switch':
        return ['left', 'right'];
      default:
        return [];
    }
  }
  
  isPointInside(x, y) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    return x >= this.x - halfWidth && x <= this.x + halfWidth &&
           y >= this.y - halfHeight && y <= this.y + halfHeight;
  }
  
  toggle() {
    this.isOn = !this.isOn;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    switch (this.type) {
      case 'battery':
        this.drawBattery(ctx);
        break;
      case 'bulb':
        this.drawBulb(ctx);
        break;
      case 'switch':
        this.drawSwitch(ctx);
        break;
    }
    
    ctx.restore();
    
    this.drawTerminals(ctx);
  }
  
  drawBattery(ctx) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-halfWidth, -halfHeight, this.width, this.height);
    
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfWidth, -halfHeight, this.width, this.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', -halfWidth / 2, 0);
    ctx.fillText('-', halfWidth / 2, 0);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('电源', 0, -halfHeight / 2 - 5);
  }
  
  drawBulb(ctx) {
    const radius = 20;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isOn ? '#f1c40f' : '#95a5a6';
    ctx.fill();
    ctx.strokeStyle = this.isOn ? '#f39c12' : '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    if (this.isOn) {
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
      ctx.fill();
    }
    
    ctx.fillStyle = '#34495e';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('灯泡', 0, -radius - 15);
  }
  
  drawSwitch(ctx) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-halfWidth, -halfHeight, this.width, this.height);
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfWidth, -halfHeight, this.width, this.height);
    
    const leverLength = 25;
    ctx.beginPath();
    ctx.moveTo(-leverLength / 2, 0);
    if (this.isOn) {
      ctx.lineTo(leverLength / 2, 0);
    } else {
      ctx.lineTo(leverLength / 2, -15);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.isOn ? '开' : '关', 0, halfHeight / 2 + 10);
  }
  
  drawTerminals(ctx) {
    const terminals = this.getTerminals();
    for (const terminal of terminals) {
      const pos = this.getTerminalPosition(terminal);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.terminalRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

new CircuitSimulator();
