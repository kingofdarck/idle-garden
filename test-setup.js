// Test setup for Space Defender game
// Mock canvas and context for testing

// Mock HTMLCanvasElement
global.HTMLCanvasElement = class HTMLCanvasElement {
  constructor() {
    this.width = 800;
    this.height = 600;
  }
  
  getContext() {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      font: '',
      textAlign: '',
      textBaseline: ''
    };
  }
};

// Mock canvas element
global.document = {
  getElementById: jest.fn(() => new HTMLCanvasElement()),
  createElement: jest.fn(() => new HTMLCanvasElement())
};