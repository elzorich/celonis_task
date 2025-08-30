import { Injectable, computed, signal } from '@angular/core';
import { AstNode, isBinaryOperation, isFunction, isUnaryOperation } from '../models/ast-node.model';

/**
 * AST Manipulator Service - Core State Management with Signals
 * 
 * Learning Points:
 * 1. Signals provide reactive state management without RxJS
 * 2. Computed signals automatically update when dependencies change
 * 3. Signal updates are synchronous and immediately available
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages AST state and operations
 * - Dependency Inversion: Components depend on abstraction (service interface)
 */
@Injectable({
  providedIn: 'root' // Tree-shakeable singleton
})
export class AstManipulatorService {
  // Private writable signals - encapsulation principle
  private readonly _ast = signal<AstNode | null>(null);
  private readonly _selectedNodeId = signal<string | null>(null);

  // Public readonly signals - immutability principle
  public readonly ast = this._ast.asReadonly();
  public readonly selectedNodeId = this._selectedNodeId.asReadonly();

  // Computed signals - automatically update when dependencies change
  public readonly selectedNode = computed(() => {
    const astValue = this._ast();
    const selectedId = this._selectedNodeId();
    
    if (!astValue || !selectedId) return null;
    return this.findNodeById(astValue, selectedId);
  });

  public readonly nodeCount = computed(() => {
    const astValue = this._ast();
    return astValue ? this.countNodes(astValue) : 0;
  });

  public readonly treeDepth = computed(() => {
    const astValue = this._ast();
    return astValue ? this.calculateDepth(astValue) : 0;
  });

  public readonly canDelete = computed(() => {
    const selected = this.selectedNode();
    const astValue = this._ast();
    
    // Can't delete root node
    return selected !== null && selected !== astValue;
  });

  /**
   * Set the AST and add unique IDs to each node
   * Demonstrates immutability - creates new objects instead of mutating
   */
  setAst(ast: AstNode): void {
    const astWithIds = this.addNodeIds(ast);
    this._ast.set(astWithIds);
    this._selectedNodeId.set(null); // Clear selection when AST changes
  }

  /**
   * Select a node by ID
   * Updates both the selection ID and marks the node as selected in the AST
   */
  selectNode(nodeId: string | null): void {
    this._selectedNodeId.set(nodeId);
    
    const currentAst = this._ast();
    if (currentAst) {
      // Create new AST with updated selection state (immutability)
      const updatedAst = this.updateNodeSelection(currentAst, nodeId);
      this._ast.set(updatedAst);
    }
  }

  /**
   * Delete a node from the AST
   * Demonstrates recursive tree manipulation with immutability
   */
  deleteNode(nodeId: string): void {
    const currentAst = this._ast();
    if (!currentAst || currentAst.id === nodeId) {
      return; // Can't delete root
    }

    const updatedAst = this.removeNodeRecursive(currentAst, nodeId);
    if (updatedAst) {
      this._ast.set(updatedAst);
      this._selectedNodeId.set(null);
    }
  }

  /**
   * Clear the entire AST
   */
  clearAst(): void {
    this._ast.set(null);
    this._selectedNodeId.set(null);
  }

  // Private helper methods - encapsulation

  /**
   * Add unique IDs to all nodes in the AST
   * Path-based IDs help with debugging (e.g., "L_R_ADDITION_xyz")
   */
  private addNodeIds(node: AstNode, path = ''): AstNode {
    const id = `${path}${node.type}_${Math.random().toString(36).substr(2, 9)}`;
    const nodeWithId = { ...node, id, selected: false };

    if (isBinaryOperation(node)) {
      return {
        ...nodeWithId,
        left: this.addNodeIds(node.left, `${path}L_`),
        right: this.addNodeIds(node.right, `${path}R_`)
      } as AstNode;
    }

    if (isUnaryOperation(node)) {
      return {
        ...nodeWithId,
        expression: this.addNodeIds(node.expression, `${path}E_`)
      } as AstNode;
    }

    if (isFunction(node)) {
      return {
        ...nodeWithId,
        arguments: node.arguments.map((arg, index) => 
          this.addNodeIds(arg, `${path}A${index}_`)
        )
      } as AstNode;
    }

    return nodeWithId;
  }

  /**
   * Update selection state in the AST
   * Creates new objects to maintain immutability
   */
  private updateNodeSelection(node: AstNode, selectedId: string | null): AstNode {
    const updatedNode = { ...node, selected: node.id === selectedId };

    if (isBinaryOperation(node)) {
      return {
        ...updatedNode,
        left: this.updateNodeSelection(node.left, selectedId),
        right: this.updateNodeSelection(node.right, selectedId)
      } as AstNode;
    }

    if (isUnaryOperation(node)) {
      return {
        ...updatedNode,
        expression: this.updateNodeSelection(node.expression, selectedId)
      } as AstNode;
    }

    if (isFunction(node)) {
      return {
        ...updatedNode,
        arguments: node.arguments.map(arg => 
          this.updateNodeSelection(arg, selectedId)
        )
      } as AstNode;
    }

    return updatedNode;
  }

  /**
   * Remove a node from the AST
   * Handles different cases: binary ops, functions, unary ops
   */
  private removeNodeRecursive(node: AstNode, targetId: string): AstNode | null {
    if (isBinaryOperation(node)) {
      // If left child is target, return right child
      if (node.left.id === targetId) {
        return node.right;
      }
      // If right child is target, return left child
      if (node.right.id === targetId) {
        return node.left;
      }
      
      // Recursively check children
      return {
        ...node,
        left: this.removeNodeRecursive(node.left, targetId) || node.left,
        right: this.removeNodeRecursive(node.right, targetId) || node.right
      } as AstNode;
    }

    if (isUnaryOperation(node)) {
      if (node.expression.id === targetId) {
        // Replace with a placeholder number
        return { type: 'NUMBER', value: 0, id: `placeholder_${Date.now()}` } as AstNode;
      }
      
      const updatedExpression = this.removeNodeRecursive(node.expression, targetId);
      return updatedExpression ? { ...node, expression: updatedExpression } as AstNode : node;
    }

    if (isFunction(node)) {
      const filteredArgs = node.arguments.filter(arg => arg.id !== targetId);
      
      // If all arguments removed, add placeholder
      if (filteredArgs.length === 0 && node.arguments.length > 0) {
        filteredArgs.push({ 
          type: 'NUMBER', 
          value: 0, 
          id: `placeholder_${Date.now()}` 
        } as AstNode);
      }
      
      const updatedArgs = filteredArgs.map(arg => 
        this.removeNodeRecursive(arg, targetId) || arg
      );
      
      return { ...node, arguments: updatedArgs } as AstNode;
    }

    return node;
  }

  /**
   * Find a node by ID in the AST
   */
  private findNodeById(node: AstNode, id: string): AstNode | null {
    if (node.id === id) return node;

    if (isBinaryOperation(node)) {
      return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
    }

    if (isUnaryOperation(node)) {
      return this.findNodeById(node.expression, id);
    }

    if (isFunction(node)) {
      for (const arg of node.arguments) {
        const found = this.findNodeById(arg, id);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Count total nodes in the AST
   */
  private countNodes(node: AstNode): number {
    let count = 1;

    if (isBinaryOperation(node)) {
      count += this.countNodes(node.left) + this.countNodes(node.right);
    } else if (isUnaryOperation(node)) {
      count += this.countNodes(node.expression);
    } else if (isFunction(node)) {
      count += node.arguments.reduce((sum, arg) => sum + this.countNodes(arg), 0);
    }

    return count;
  }

  /**
   * Calculate tree depth
   */
  private calculateDepth(node: AstNode): number {
    if (isBinaryOperation(node)) {
      return 1 + Math.max(
        this.calculateDepth(node.left),
        this.calculateDepth(node.right)
      );
    }

    if (isUnaryOperation(node)) {
      return 1 + this.calculateDepth(node.expression);
    }

    if (isFunction(node)) {
      const maxArgDepth = node.arguments.length > 0
        ? Math.max(...node.arguments.map(arg => this.calculateDepth(arg)))
        : 0;
      return 1 + maxArgDepth;
    }

    return 1; // Leaf node
  }
}