/**
 * AST Node Models and Interfaces
 * 
 * This file demonstrates several SOLID principles:
 * 1. Single Responsibility: Each interface has one clear purpose
 * 2. Interface Segregation: Small, focused interfaces instead of one large interface
 * 3. Open/Closed: Can extend with new node types without modifying existing ones
 */

// Base node type that all AST nodes extend
export interface BaseAstNode {
  type: string;
  id?: string; // Unique identifier for tracking in UI
  selected?: boolean; // UI state for selection
}

// Binary operations (addition, multiplication, etc.)
export interface BinaryOperationNode extends BaseAstNode {
  type: 'ADDITION' | 'SUBTRACTION' | 'MULTIPLICATION' | 'DIVISION' | 'POWER';
  left: AstNode;
  right: AstNode;
}

// Unary operations (negation)
export interface UnaryOperationNode extends BaseAstNode {
  type: 'NEGATION';
  expression: AstNode;
}

// Function calls (SQR, SQRT, etc.)
export interface FunctionNode extends BaseAstNode {
  type: 'FUNCTION';
  name: string;
  arguments: AstNode[];
}

// Leaf nodes (terminals)
export interface NumberNode extends BaseAstNode {
  type: 'NUMBER';
  value: number;
}

export interface VariableNode extends BaseAstNode {
  type: 'VARIABLE';
  name: string;
}

export interface ConstantNode extends BaseAstNode {
  type: 'PI' | 'E';
}

// Union type for all possible AST nodes
export type AstNode = 
  | BinaryOperationNode 
  | UnaryOperationNode 
  | FunctionNode 
  | NumberNode 
  | VariableNode 
  | ConstantNode;

// Node metadata for UI visualization
export interface NodeMetadata {
  color: string;
  icon: string;
  label: string;
  deletable: boolean;
}

// Type guards for safe type checking
export const isBinaryOperation = (node: AstNode): node is BinaryOperationNode => {
  return ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'POWER'].includes(node.type);
};

export const isUnaryOperation = (node: AstNode): node is UnaryOperationNode => {
  return node.type === 'NEGATION';
};

export const isFunction = (node: AstNode): node is FunctionNode => {
  return node.type === 'FUNCTION';
};

export const isLeafNode = (node: AstNode): boolean => {
  return ['NUMBER', 'VARIABLE', 'PI', 'E'].includes(node.type);
};