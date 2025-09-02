import { Component, ChangeDetectionStrategy, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AstManipulatorService } from '../../services/ast-manipulator.service';
import { FormulaBuilderService } from '../../services/formula-builder.service';
import { NodeComponent } from '../node/node.component';

@Component({
  selector: 'app-tree-visualizer',
  standalone: true,
  imports: [CommonModule, NodeComponent],
  templateUrl: './tree-visualizer.component.html',
  styleUrl: './tree-visualizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeVisualizerComponent {

  private readonly astService = inject(AstManipulatorService);
  private readonly formulaBuilder = inject(FormulaBuilderService);

  readonly ast = this.astService.ast;
  readonly selectedNodeId = this.astService.selectedNodeId;
  readonly nodeCount = this.astService.nodeCount;
  readonly treeDepth = this.astService.treeDepth;
  readonly canDelete = this.astService.canDelete;
  
  constructor() {
    // Debug: Log when AST changes
    effect(() => {
      const astValue = this.ast();
      console.log('TreeVisualizer - AST changed:', astValue);
    });
  }

  readonly reconstructedFormula = computed(() => {
    const astValue = this.ast();
    return astValue ? this.formulaBuilder.buildFormula(astValue) : '';
  });

  readonly selectedNodeDescription = computed(() => {
    const selected = this.astService.selectedNode();
    return selected ? this.formulaBuilder.getNodeDescription(selected) : null;
  });

  onNodeClick(nodeId: string): void {
    console.log('Node clicked:', nodeId);
    this.astService.selectNode(nodeId);
  }

  onNodeDelete(nodeId: string): void {
    console.log('Node delete requested:', nodeId);
    this.astService.deleteNode(nodeId);
  }

  deleteSelected(): void {
    const selectedId = this.selectedNodeId();
    if (selectedId) {
      this.astService.deleteNode(selectedId);
    }
  }

  clearSelection(): void {
    this.astService.selectNode(null);
  }

  clearTree(): void {
    this.astService.clearAst();
  }
}