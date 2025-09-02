# Implementation Notes

## Angular Signals - Learning & Implementation

In this project, I took the opportunity to deepen my understanding and practical experience with **Angular Signals**

### How I Used Signals

1. **AST State Management** (`ast-manipulator.service.ts`):
   - `astSignal = signal<AstNode | null>(null)` - Main AST tree state
   - `selectedNodeSignal = signal<AstNode | null>(null)` - Currently selected node
   - Computed signals for derived state (tree depth, node count)

2. **Component Communication**:
   - Services expose signals as readonly for components to consume
   - Direct signal updates trigger automatic UI updates

## File Structure Summary

```
celonis_task/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── node/                    # Node visualization component
│   │   │   │   ├── node.component.ts
│   │   │   │   ├── node.component.html
│   │   │   │   └── node.component.scss
│   │   │   └── tree-visualizer/         # Main tree visualization
│   │   │       ├── tree-visualizer.component.ts
│   │   │       ├── tree-visualizer.component.html
│   │   │       └── tree-visualizer.component.scss
│   │   ├── models/
│   │   │   └── ast-node.model.ts        # AST node interfaces & type guards
│   │   ├── services/
│   │   │   ├── ast-manipulator.service.ts  # Signal-based state management
│   │   │   └── formula-builder.service.ts  # AST to formula conversion
│   │   ├── app.component.ts             # Root component
│   │   ├── app.component.html
│   │   └── app.scss
│   ├── styles/
│   │   ├── abstracts/
│   │   │   ├── _variables.scss          # Design tokens
│   │   │   ├── _mixins.scss            # Reusable SCSS mixins
│   │   │   └── _index.scss             # Barrel export
│   │   └── styles.scss                  # Global styles
│   └── main.ts                          # Application entry point
├── assets/                              # Images and documentation assets
├── e2e/                                 # End-to-end tests
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript configuration
├── project.json                         # Nx project configuration
└── README.md                            # Challenge description
```

### Key Implementation Files:

- **`ast-manipulator.service.ts`**: Core Signal-based state management for AST
- **`formula-builder.service.ts`**: Implementation for formula generation
- **`node.component.ts`**: Recursive component for tree node visualization
- **`tree-visualizer.component.ts`**: Main visualization container with controls
- **`ast-node.model.ts`**: TypeScript interfaces and type guards for AST nodes

