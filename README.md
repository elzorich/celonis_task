# Celonis Programming Challenge

Dear applicant,

Congratulations, you made it to the Celonis Programming Challenge!

Why do we ask you to complete this challenge?

First of all, we want to ask questions that are closer to the eventual job you’ll need to do. We also want to respect your time and schedule fewer in-person interviews. Finally, we’ll also share some insights into what we look at and how we evaluate. This challenge gives you the ability to shine :)

# Your task: designing and building a calculator

The task in this challenge is to build the formula visualization for a scientific calculator. The calculator should be able to take input in the form of a free text formula and then visualize & modify the formula.

You should limit yourself to 3 hours for this challenge, including familiarizing yourself with the challenge. As engineers we understand there is always more you want to do, but please respect the time limit for yourself. We understand this limit means your solution may not be comprehensive - that’s okay - but the solution should build and run so we can see the result of your work.

Note that there is nothing wrong with searching when you have certain questions or are unsure about some APIs, but you should avoid outright copying code. If you decide to copy code, please mark it as copied citing the source.

In the follow-up interview, expect to walk us through your design, code and discuss your approach to the challenge. What we are looking for:

- Analytical / problem-understanding / problem-solving skills
- Clear articulation of key design and coding decisions
- Ability to execute / implement
- OOP / abstraction / composition skills

# Technical details

## Description of the calculator language

The language which we want to execute is fairly simple and is similar to Excel syntax.

The language is built using the following rules (note that these are not formally correct, rather, an illustration):

```
EXPR = BINARY_EXPR 
    | FUNCTION 
    | UNARY_EXPR 
    | NUMBER 
    | STRING 
    | PARAMETER
    | PI
    | "(" EXPR ")"

BINARY_EXPR = EXPR + EXPR 
    | EXPR - EXPR 
    | EXPR * EXPR
    | EXPR / EXPR

FUNCTION = <FunctionName>"(" (EXPR (EXPR)*)? ")"

UNARY_EXPR = "-" EXPR

NUMBER = [Float or Integer Number]

STRING = "'"[String]"'"

PARAMETER = "$"[PARAMETER_NAME]

PI = "PI"
```

The following examples are valid queries

```
PI * SQR($r)

($b + SQRT (SQR($b) - 4 * $a)) / (2 * $a)
```


## Visualizing the formula

Data visualization is one of the key aspects of Celonis' software. In this task you should implement an interactive visualization of the formula entered.

As a starting point, in the src/ folder you can find a parser as well as AST classes and a small function library implemented for demonstration purposes. The output of the parser is a JSON syntax tree which is used below for the tasks.

# Tasks

Complete the following tasks for the challenge:

1. Build a formula string from the parsed syntax tree and display it in the UI. This is the same as the user's input string except for whitespace. (JSON syntax tree => Formula)
2. Design the architecture and component structure you’ll use to visualize the formula hierarchy. Note that deleting nodes is non-trivial and should be included in your design (see example below).
3. Visualize a syntax tree (parsed JSON tree) in a UI component that represents the formula. It should be easy for the user to distinguish between functions, constants etc. (JSON syntax tree => Visualized Syntax Tree)
4. Allow deletion of nodes from the tree through UI interactions (Changes to UI -> changes to JSON syntax tree)

# Examples

Here’s one of our engineers’ example work to show you how the output of task 3 and 4 might look:

![Alt text](./assets/calculator-example-ui.png?raw=true "Quick visual representation")

As another example, someone has entered the following formula for calculating the area of a circle: `PI * SQR(4)`. Here’s how the user could remove the ‘SQR(4)’ block from the formula (click to select, x button to remove):

![Alt text](./assets/Challenge_EditBlock.png?raw=true "Click to select and x button to remove")

This example is actually from Celonis’s formula editor UI, so it’s very polished compared to what we are asking for here, but it’s also representative of the work we do.

# Submitting your solution

Please ZIP up your source code and attach it to a reply on the email thread where you were provided the challenge.  To keep the file size small, please do not include the `node_modules` directory in your ZIP file.

# Hints on running the scaffolded code

We provide an Angular project as an easy option that lets you complete the first couple of tasks. For the UI-building tasks, optimize your time for writing UI components and interactions, and if it's faster for you to use another framework, you may need to demo your work during the follow-up interview.

This project was generated with [Nx](https://github.com/angular/angular-cli) version 21.0.2 and Angular 20. command-line instructions are below.

If you don't have a suitable dev environment available, you can download IntelliJ Ultimate Edition (30 day free trial, no automatic billing) and then install NodeJS for your OS. Create a new project from this directory, it will prompt you to run “npm install” to download remaining dependencies, then under Run>Edit Configurations, [start the local server](./assets/IntelliJ-configuration.png?raw=true "Change the type")

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## playwright test 

Run `npm run e2e` to run playwright test

# Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


