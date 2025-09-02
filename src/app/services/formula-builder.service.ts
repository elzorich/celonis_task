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

@Injectable({
  providedIn: 'root'
})
export class FormulaBuilderService {

  private readonly precedence: Record<string, number> = {
    'ADDITION': 1,
    'SUBTRACTION': 1,
    'MULTIPLICATION': 2,
    'DIVISION': 2,
    'POWER': 3,
    'NEGATION': 4
  };

  private readonly operators: Record<string, string> = {
    'ADDITION': '+',
    'SUBTRACTION': '-',
    'MULTIPLICATION': '*',
    'DIVISION': '/',
    'POWER': '^'
  };

  buildFormula(ast: AstNode | null): string {
    if (!ast) return '';
    return this.visit(ast);
  }

  private visit(node: AstNode, parent?: AstNode): string {
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

  private visitUnaryOperation(node: UnaryOperationNode, parent?: AstNode): string {
    const expr = this.visit(node.expression, node);
    
    // Handle parentheses
    if (node.type === 'PAREN') {
      return `(${expr})`;
    }
    
    // Handle negation
    // Check if inner expression needs parentheses
    if (node.expression && isBinaryOperation(node.expression)) {
      return `-(${expr})`;
    }
    
    return `-${expr}`;
  }

  private visitFunction(node: FunctionNode): string {
    const args = node.arguments
      .map(arg => this.visit(arg))
      .join(', ');
    
    return `${node.name}(${args})`;
  }

  private visitNumber(node: NumberNode): string {
    // Handle integers vs decimals
    return Number.isInteger(node.value) 
      ? node.value.toString() 
      : node.value.toFixed(2);
  }

  private visitVariable(node: VariableNode): string {
    return node.name.startsWith('$') ? node.name : `$${node.name}`;
  }

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

  getNodeDescription(node: AstNode): string {
    if (isBinaryOperation(node)) {
      return `${node.type.toLowerCase()} operation`;
    }
    
    if (isUnaryOperation(node)) {
      return node.type === 'PAREN' ? 'parentheses' : 'negation';
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