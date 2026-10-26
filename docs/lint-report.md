
# ESLint Report

## 1. Objective

The objective is to use ESLint to detect common JavaScript coding mistakes and maintain consistent code quality in the E-Commerce Inventory and Order Management System.

## 2. Run ESLint

Execute the following command from the project root:

```bash
npm run lint
```

To attempt automatic fixes:

```bash
npm run lint:fix
```

## 3. Rules Used

| Rule | Purpose |
|---|---|
| no-unused-vars | Detect unused variables |
| no-undef | Detect undeclared variables |
| eqeqeq | Require strict equality |
| curly | Require braces around control statements |
| prefer-const | Prefer const when reassignment is unnecessary |
| no-var | Disallow var declarations |

## 4. Fifteen Intentional Defect Examples

Create a separate temporary JavaScript file to demonstrate these defects. Do not add the defective examples to the working application.

| No. | Intentional defect | Expected concern |
|---:|---|---|
| 1 | Declare an unused variable | no-unused-vars |
| 2 | Use an undeclared variable | no-undef |
| 3 | Use == instead of === | eqeqeq |
| 4 | Use != instead of !== | eqeqeq |
| 5 | Declare a variable using var | no-var |
| 6 | Use let where const is sufficient | prefer-const |
| 7 | Omit braces around an if statement | curly |
| 8 | Omit braces around a loop | curly |
| 9 | Declare an unused function parameter | no-unused-vars, depending on configuration |
| 10 | Use an undefined function name | no-undef |
| 11 | Assign a value to an undeclared variable | no-undef |
| 12 | Declare an unused imported variable | no-unused-vars |
| 13 | Use == in a conditional | eqeqeq |
| 14 | Use var in a loop | no-var |
| 15 | Leave an unused constant | no-unused-vars |

## 5. Actual Results

After running ESLint on the temporary defect file, record:

- The command used.
- The number of errors and warnings.
- The rule reported for each defect.
- Any defects ESLint did not detect.
- Any fixes applied manually or automatically.

Do not report expected findings as actual results until the command has been executed.

## 6. Conclusion

ESLint helps detect certain coding errors and enforce consistent practices. It cannot identify every logical error, incorrect business rule, or inventory concurrency problem. Automated tests and code review are also necessary.
