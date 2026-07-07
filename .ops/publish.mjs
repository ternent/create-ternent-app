import shell from "shelljs";
import packageJson from '../package.json' with { type: 'json' }; 

const { name, version } = packageJson;

console.log(`Publishing ${name}@${version} to npm...`);
const fullChangelog = shell
  .exec(
    `gh pr list -B "main" -s merged -H changeset-release/"main" --json body --jq '.[].body' -L 1`,
    { silent: true },
  )
  .toString();

const changelog = fullChangelog?.split(`## ${name}@${version}`)[1]?.split("## ")[1];

if (changelog) {
  shell.exec(
    `gh release create "${name}-${version}" -t "${name}-${version}" -n "${name}-${version}" -n "${changelog}"`,
    { silent: true },
  );
}
