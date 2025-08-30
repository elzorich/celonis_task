import { Injectable } from '@angular/core';
import { 
  AstNode, 
  BinaryOperationNode, 
  UnaryOperationNode, 
  FunctionNode,
  NumberNode,
  VariableNode,
  ConstantNode,
  isBinaryOperation,
  isUnaryOperation,
  isFunction
} from '../models/ast-node.model';

/**
 * Formula Builder Service - Visitor Pattern Implementation
 * 
 * Learning Points:
 * 1. Visitor Pattern: Separates algorithm from object structure
 * 2. Each node type has its own visit method
 * 3. Handles operator precedence automatically
 * 
 * Design Patterns:
 * - Visitor Pattern: Visit methods for each node type
 * - Strategy Pattern: Different strategies for different node types
 * 
 * SOLID Principles:
 * - Open/Closed: Can add new node types without modifying existing code
 * - Single Responsibility: Only responsible for AST to string conversion
 */
@Injectable({
  providedIn: 'root'
})
export class FormulaBuilderService {
  // Operator precedence for proper parentheses placement
  private readonly precedence: Record<string, number> = {
    'ADDITION': 1,
    'SUBTRACTION': 1,
    'MULTIPLICATION': 2,
    'DIVISION': 2,
    'POWER': 3,
    'NEGATION': 4
  };

  // Operator symbols mapping
  private readonly operators: Record<string, string> = {
    'ADDITION': '+',
    'SUBTRACTION': '-',
    'MULTIPLICATION': '*',
    'DIVISION': '/',
    'POWER': '^'
  };

  /**
   * Main entry point - builds formula from AST
   * Demonstrates the Visitor pattern entry point
   */
  buildFormula(ast: AstNode | null): string {
    if (!ast) return '';
    return this.visit(ast);
  }

  /**
   * Central dispatcher - routes to appropriate visitor method
   * This is the core of the Visitor pattern
   */
  private visit(node: AstNode, parent?: AstNode): string {
    // Type-safe visitor routing
    if (isBinaryOperation(node)) {
      return this.visitBinaryOperation(node, parent);
    }
    
    if (isUnaryOperation(node)) {
      return this.visitUnaryOperation(node, parent);
    }
    
    if (isFunction(node)) {
      return this.visitFunction(node);
    }

    // Handle leaf nodes
    switch (node.type) {
      case 'NUMBER':
        return this.visitNumber(node as NumberNode);
      case 'VARIABLE':
        return this.visitVariable(node as VariableNode);
      case 'PI':
      case 'E':
        return this.visitConstant(node as ConstantNode);
      default:
        return '?'; // Unknown node type
    }
  }

  /**
   * Visit binary operation node
   * Handles operator precedence with parentheses
   */
  private visitBinaryOperation(node: BinaryOperationNode, parent?: AstNode): string {
    const operator = this.operators[node.type] || '?';
    const leftExpr = this.visit(node.left, node);
    const rightExpr = this.visit(node.right, node);
    
    const expression = `${leftExpr} ${operator} ${rightExpr}`;
    
    // Add parentheses if needed based on precedence
    if (parent && this.needsParentheses(parent, node)) {
      return `(${expression})`;
    }
    
    return expression;
  }

  /**
   * Visit unary operation node (negation)
   */
  private visitUnaryOperation(node: UnaryOperationNode, parent?: AstNode): string {
    const expr = this.visit(node.expression, node);
    
    // Check if inner expression needs parentheses
    if (node.expression && isBinaryOperation(node.expression)) {
      return `-(${expr})`;
    }
    
    return `-${expr}`;
  }

  /**
   * Visit function node
   * Formats as FUNCTION_NAME(arg1, arg2, ...)
   */
  private visitFunction(node: FunctionNode): string {
    const args = node.arguments
      .map(arg => this.visit(arg))
      .join(', ');
    
    return `${node.name}(${args})`;
  }

  /**
   * Visit number node
   */
  private visitNumber(node: NumberNode): string {
    // Handle integers vs decimals
    return Number.isInteger(node.value) 
      ? node.value.toString() 
      : node.value.toFixed(2);
  }

  /**
   * Visit variable node
   * Variables start with $ in our formula language
   */
  private visitVariable(node: VariableNode): string {
    return node.name.startsWith('$') ? node.name : `$${node.name}`;
  }

  /**
   * Visit constant node (PI, E)
   */
  private visitConstant(node: ConstantNode): string {
    return node.type;
  }

  /**
   * Determine if parentheses are needed based on operator precedence
   * Lower precedence operations need parentheses when nested in higher precedence
   * 
   * Example: (2 + 3) * 4 needs parentheses
   * But: 2 * 3 + 4 doesn't need parentheses
   */
  private needsParentheses(parent: AstNode, child: AstNode): boolean {
    const parentPrecedence = this.precedence[parent.type];
    const childPrecedence = this.precedence[child.type];
    
    if (parentPrecedence === undefined || childPrecedence === undefined) {
      return false;
    }
    
    // Need parentheses if child has lower precedence
    // Also need them for same precedence in certain cases (like subtraction/division)
    if (childPrecedence < parentPrecedence) {
      return true;
    }
    
    // Special case: right-associative operations
    if (childPrecedence === parentPrecedence) {
      // For subtraction and division, right operand needs parentheses
      if ((parent.type === 'SUBTRACTION' || parent.type === 'DIVISION') &&
          isBinaryOperation(parent) && parent.right === child) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate formula structure
   * Returns errors if formula is invalid
   */
  validateFormula(ast: AstNode): string[] {
    const errors: string[] = [];
    
    this.validateNode(ast, errors);
    
    return errors;
  }

  private validateNode(node: AstNode, errors: string[]): void {
    if (isBinaryOperation(node)) {
      if (!node.left || !node.right) {
        errors.push(`Binary operation ${node.type} missing operands`);
      } else {
        this.validateNode(node.left, errors);
        this.validateNode(node.right, errors);
      }
    } else if (isUnaryOperation(node)) {
      if (!node.expression) {
        errors.push('Unary operation missing expression');
      } else {
        this.validateNode(node.expression, errors);
      }
    } else if (isFunction(node)) {
      if (!node.name) {
        errors.push('Function missing name');
      }
      if (node.arguments.length === 0) {
        errors.push(`Function ${node.name} has no arguments`);
      }
      node.arguments.forEach(arg => this.validateNode(arg, errors));
    } else if (node.type === 'NUMBER') {
      const numNode = node as NumberNode;
      if (typeof numNode.value !== 'number' || isNaN(numNode.value)) {
        errors.push('Invalid number value');
      }
    } else if (node.type === 'VARIABLE') {
      const varNode = node as VariableNode;
      if (!varNode.name) {
        errors.push('Variable missing name');
      }
    }
  }

  /**
   * Get a human-readable description of a node
   * Useful for tooltips and debugging
   */
  getNodeDescription(node: AstNode): string {
    if (isBinaryOperation(node)) {
      return `${node.type.toLowerCase()} operation`;
    }
    
    if (isUnaryOperation(node)) {
      return 'negation';
    }
    
    if (isFunction(node)) {
      return `${node.name} function with ${node.arguments.length} argument(s)`;
    }
    
    switch (node.type) {
      case 'NUMBER':
        return `number: ${(node as NumberNode).value}`;
      case 'VARIABLE':
        return `variable: ${(node as VariableNode).name}`;
      case 'PI':
        return 'constant: π';
      case 'E':
        return 'constant: e';
      default:
        return 'unknown node';
    }
  }
}