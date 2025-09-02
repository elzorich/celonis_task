import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeVisualizerComponent } from './components/tree-visualizer/tree-visualizer.component';
import { AstManipulatorService } from './services/ast-manipulator.service';
import { FormulaBuilderService } from './services/formula-builder.service';

// @ts-ignore
import * as Parser from './parser/formula-parser.js';
const parse = Parser.parse;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeVisualizerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {

  private readonly astService = inject(AstManipulatorService);
  private readonly formulaBuilder = inject(FormulaBuilderService);

  readonly formula = signal('($b + SQRT(SQR($b) - 4 * $a)) / (2 * $a)');
  readonly isProcessing = signal(false);
  
  readonly hasFormula = computed(() => this.formula().trim().length > 0);
  readonly hasAst = computed(() => this.astService.ast() !== null);

  readonly ast = this.astService.ast;
  readonly nodeCount = this.astService.nodeCount;
  readonly treeDepth = this.astService.treeDepth;

  // Effect to log state changes
  constructor() {
    // Runs whenever the AST changes
    effect(() => {
      const astValue = this.ast();
      if (astValue) {
        console.log('AST Updated:', astValue);
        console.log('Node Count:', this.nodeCount());
        console.log('Tree Depth:', this.treeDepth());
      }
    });
  }

  ngOnInit(): void {
    this.parseFormula();
  }

  parseFormula(): void {
    const formulaValue = this.formula().trim();

    if (!formulaValue) {
      this.astService.clearAst();
      return;
    }
    this.isProcessing.set(true);

    try {
      const ast = parse(formulaValue);
      console.log('Parsed AST:', ast);
      
      // Update service with new AST
      this.astService.setAst(ast);
      console.log('AST set in service');

    } catch (error: any) {
      console.error('Parse error:', error);
      this.astService.clearAst();
    } finally {
      this.isProcessing.set(false);
    }
  }

  updateFormula(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.formula.set(target.value);
  }

  clearAll(): void {
    this.formula.set('');
    this.astService.clearAst();
  }

  loadExample(example: string): void {
    const examples: Record<string, string> = {
      quadratic: '($b + SQRT(SQR($b) - 4 * $a)) / (2 * $a)',
      simple: 'PI * SQR($r)',
      complex: '(SIN($x) + COS($y)) * EXP($z) / SQRT($w)',
      arithmetic: '(10 + 20) * (30 - 15) / 5',
      nested: 'SQRT(SQR(SQR($x) + SQR($y)))'
    };

    const formula = examples[example];
    if (formula) {
      this.formula.set(formula);
      this.parseFormula();
    }
  }
}