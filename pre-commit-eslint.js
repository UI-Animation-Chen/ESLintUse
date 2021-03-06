/*
 * 对执行git add后的文件，执行eslint检查。
 */

console.log('--- pre-commit lint start ---');

if (process.platform === 'win32') {
    console.log('--- win32 platform ---');
} else {
    console.log('--- non-win platform ---');
}

const childProcess = require('child_process');

// --diff-filter=ACMR 过滤掉删除的文件，参考man git-diff中的--diff-filter选项
const gitCmdStr = 'git diff --cached --numstat --name-only --diff-filter=ACMR';
const files = childProcess
    .execSync(gitCmdStr)
    .toString()
    .replace(/[\r|\n]/g, ' ');

let filesToLint = '';
let filesToLintLen = 0;
if (!files) {
    console.log('--- no files changed ---');
    process.exit(0);
} else {
    const fileList = files.split(' ');
    console.log('--- changed files(' + (fileList.length - 1) + '): ', files);
    for (const fileName of fileList) {
        if (!fileName) continue;

        if (
            fileName.endsWith('.js') ||
            fileName.endsWith('.ts') ||
            fileName.endsWith('.jsx') ||
            fileName.endsWith('.tsx')
        ) {
            filesToLint += fileName + ' ';
            filesToLintLen++;
        }
    }
}
console.log('--- changed files to lint(' + filesToLintLen + '): ', filesToLint);

if (filesToLintLen <= 0) {
    console.log('--- no files to lint ---');
    process.exit(0);
}

let lintCmdStr = './node_modules/.bin/eslint ';
lintCmdStr += filesToLint;
try {
    const lintResult = childProcess.execSync(lintCmdStr, { stdio: 'inherit' });
    console.log(
        '--- no eslint error ---\n',
        lintResult ? lintResult.toString() : ' no eslint error'
    );
} catch (err) {
    console.log('---', err.toString());
    console.log('--- pre-commit lint end ---');
    process.exit(1);
}

console.log('--- pre-commit lint end ---');
