/*
 * 从上次merge起，所有的改动文件执行eslint检查。
 */

console.log('--- eslint-diff-from-last-merge start ---');

if (process.platform === 'win32') {
    console.log('--- win32 platform ---');
} else {
    console.log('--- non-win platform ---');
}

const childProcess = require('child_process');

const gitLogCmdStr = 'git log --merges -n 1 --pretty=format:"%H"';
const lastMergeCommitId = childProcess.execSync(gitLogCmdStr);
if (!lastMergeCommitId) {
    console.log('--- no last merge commit ---');
    process.exit(0);
}

// --diff-filter=ACMR 过滤掉删除的文件，参考man git-diff中的--diff-filter选项
let gitDiffCmdStr = 'git diff --numstat --name-only --diff-filter=ACMR ';
gitDiffCmdStr += lastMergeCommitId;
gitDiffCmdStr += ' HEAD';
const files = childProcess
    .execSync(gitDiffCmdStr)
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
    console.log('--- eslint-diff-from-last-merge end ---');
    process.exit(1);
}

console.log('--- eslint-diff-from-last-merge end ---');
