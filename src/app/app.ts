import { Component } from '@angular/core';

// @ts-ignore
import * as Parser from './parser/formula-parser.js';
import { FormsModule } from '@angular/forms';
const parse = Parser.parse;

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  formula = '($b + SQRT (SQR($b) - 4 * $a)) / (2 * $a)';
  visualizerOutput = '';
  syntaxTree: any;
  syntaxTreeJson = '';

  updateAstView() {
    console.log('creating ast view...');
    this.syntaxTree = parse(this.formula);
    console.log('The ast is: ', this.syntaxTree);
    this.syntaxTreeJson = JSON.stringify(this.syntaxTree, null, 2);
  }

  convertAstToFormula() {
    console.log('converting ast to string...');
    this.visualizerOutput = 'TO BE IMPLEMENTED';
  }
}
