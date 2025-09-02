import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AstNode, NodeMetadata, isBinaryOperation, isUnaryOperation, isFunction, isLeafNode } from '../../models/ast-node.model';

@Component({
  selector: 'app-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent implements OnChanges {
  private _node!: AstNode;
  private nodeSignal = signal<AstNode | null>(null);
  
  @Input({ required: true }) 
  set node(value: AstNode) {
    this._node = value;
    this.nodeSignal.set(value);
  }
  get node(): AstNode {
    return this._node;
  }
  
  @Input() isRoot = false;
  @Input() isSelected = false;
  
  @Output() nodeClick = new EventEmitter<string>();
  @Output() nodeDelete = new EventEmitter<string>();
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['node']) {
      console.log('Node changed:', changes['node'].currentValue);
    }
  }

  // Node type metadata for visualization
  private readonly metadata: Record<string, NodeMetadata> = {
    'ADDITION': { color: '#a8e6cf', icon: '+', label: 'Add', deletable: true },
    'SUBTRACTION': { color: '#ffd3b6', icon: '-', label: 'Sub', deletable: true },
    'MULTIPLICATION': { color: '#ffaaa5', icon: '×', label: 'Mul', deletable: true },
    'DIVISION': { color: '#ff8b94', icon: '÷', label: 'Div', deletable: true },
    'POWER': { color: '#a8d8ea', icon: '^', label: 'Pow', deletable: true },
    'NEGATION': { color: '#aa96da', icon: '−', label: 'Neg', deletable: true },
    'PAREN': { color: '#e1bee7', icon: '( )', label: 'Paren', deletable: true },
    'FUNCTION': { color: '#ce93d8', icon: 'ƒ', label: 'Func', deletable: true },
    'NUMBER': { color: '#ffcc80', icon: '#', label: 'Num', deletable: true },
    'VARIABLE': { color: '#81c784', icon: '$', label: 'Var', deletable: true },
    'PI': { color: '#4fc3f7', icon: 'π', label: 'Pi', deletable: false },
    'E': { color: '#4db6ac', icon: 'e', label: 'E', deletable: false }
  };

  // Getters for node properties
  get nodeType(): string {
    return this.node?.type || 'UNKNOWN';
  }
  
  get nodeId(): string {
    return this.node?.id || '';
  }
  
  get nodeMetadata(): NodeMetadata {
    return this.metadata[this.nodeType] || { 
      color: '#ccc', 
      icon: '?', 
      label: 'Unknown', 
      deletable: false 
    };
  }

  // Type checking computed signals
  readonly isBinary = computed(() => {
    const node = this.nodeSignal();
    return node ? isBinaryOperation(node) : false;
  });
  
  readonly isUnary = computed(() => {
    const node = this.nodeSignal();
    return node ? isUnaryOperation(node) : false;
  });
  
  readonly isFunction = computed(() => {
    const node = this.nodeSignal();
    return node ? isFunction(node) : false;
  });
  
  readonly isLeaf = computed(() => {
    const node = this.nodeSignal();
    return node ? isLeafNode(node) : false;
  });

  // Node specific properties
  readonly leftChild = computed(() => {
    const node = this.nodeSignal();
    if (node && isBinaryOperation(node)) {
      return node.left;
    }
    return null;
  });

  readonly rightChild = computed(() => {
    const node = this.nodeSignal();
    if (node && isBinaryOperation(node)) {
      return node.right;
    }
    return null;
  });

  readonly expression = computed(() => {
    const node = this.nodeSignal();
    if (node && isUnaryOperation(node)) {
      return node.expression;
    }
    return null;
  });

  readonly functionName = computed(() => {
    const node = this.nodeSignal();
    if (node && isFunction(node)) {
      return node.name;
    }
    return '';
  });

  readonly functionArgs = computed(() => {
    const node = this.nodeSignal();
    if (node && isFunction(node)) {
      return node.arguments || [];
    }
    return [];
  });

  readonly nodeValue = computed(() => {
    const node = this.nodeSignal();
    if (!node) return '';
    
    if (node.type === 'NUMBER') {
      return (node as any).value;
    }
    if (node.type === 'VARIABLE') {
      return (node as any).name;
    }
    return '';
  });

  readonly operatorSymbol = computed(() => {
    const symbols: Record<string, string> = {
      'ADDITION': '+',
      'SUBTRACTION': '−',
      'MULTIPLICATION': '×',
      'DIVISION': '÷',
      'POWER': '^'
    };
    return symbols[this.nodeType] || '';
  });

  readonly hasChildren = computed(() => 
    this.isBinary() || this.isUnary() || (this.isFunction() && this.functionArgs().length > 0)
  );

  readonly canDelete = computed(() => 
    !this.isRoot && this.nodeMetadata.deletable
  );

  onNodeClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.nodeId) {
      this.nodeClick.emit(this.nodeId);
    }
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.nodeId && this.canDelete()) {
      this.nodeDelete.emit(this.nodeId);
    }
  }

  onChildNodeClick(nodeId: string): void {
    this.nodeClick.emit(nodeId);
  }

  onChildNodeDelete(nodeId: string): void {
    this.nodeDelete.emit(nodeId);
  }
}