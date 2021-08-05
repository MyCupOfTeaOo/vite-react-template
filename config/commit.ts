/**
 * 版本信息
 */
import child_process from 'child_process';
import fs from 'fs';

const commit = {
  hash: '',
  msg: '',
};
const stdout = child_process
  .execSync('git log --pretty=format:%h%n%s -1')
  .toString()
  .split('\n');
commit.hash = stdout[0];
commit.msg = stdout[1];

fs.writeFileSync(
  'src/.commit.ts',
  `export default { hash: "${commit.hash}", msg: ${JSON.stringify(
    commit.msg,
  )} };`,
  'utf-8',
);
