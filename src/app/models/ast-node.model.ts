export interface BaseAstNode {
  type: string;
  id?: string; // Unique identifier for tracking in UI
  selected?: boolean; // UI state for selection
}

export interface BinaryOperationNode extends BaseAstNode {
  type: 'ADDITION' | 'SUBTRACTION' | 'MULTIPLICATION' | 'DIVISION' | 'POWER';
  left: AstNode;
  right: AstNode;
}

export interface UnaryOperationNode extends BaseAstNode {
  type: 'NEGATION' | 'PAREN';
  expression: AstNode;
}

export interface FunctionNode extends BaseAstNode {
  type: 'FUNCTION';
  name: string;
  arguments: AstNode[];
}

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
  return node.type === 'NEGATION' || node.type === 'PAREN';
};

export const isFunction = (node: AstNode): node is FunctionNode => {
  return node.type === 'FUNCTION';
};

export const isLeafNode = (node: AstNode): boolean => {
  return ['NUMBER', 'VARIABLE', 'PI', 'E'].includes(node.type);
};