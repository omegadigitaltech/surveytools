const fs = require('fs');
const { execSync } = require('child_process');

function resolveAppJs() {
    if (!fs.existsSync('app.js')) return;
    const content = fs.readFileSync('app.js', 'utf8');
    const lines = content.split('\n');
    const out = [];
    for (const line of lines) {
        if (line.startsWith('<<<<<<<') || line.startsWith('=======') || line.startsWith('>>>>>>>')) continue;
        out.push(line);
    }
    fs.writeFileSync('app.js', out.join('\n'));
}

function resolveOpenApi() {
    if (!fs.existsSync('docs/survey-tools-kyc.openapi.yaml')) return;
    const content = fs.readFileSync('docs/survey-tools-kyc.openapi.yaml', 'utf8');
    const lines = content.split('\n');
    const out = [];
    for (const line of lines) {
        if (line.startsWith('<<<<<<<') || line.startsWith('=======') || line.startsWith('>>>>>>>')) continue;
        out.push(line);
    }
    fs.writeFileSync('docs/survey-tools-kyc.openapi.yaml', out.join('\n'));
}

function resolvePackageJson() {
    if (!fs.existsSync('package.json')) return;
    try {
        execSync('git show :2:package.json > ours.json');
        execSync('git show :3:package.json > theirs.json');
        const ours = JSON.parse(fs.readFileSync('ours.json', 'utf8'));
        const theirs = JSON.parse(fs.readFileSync('theirs.json', 'utf8'));
        if (theirs.dependencies) {
            if (!ours.dependencies) ours.dependencies = {};
            for (const [k, v] of Object.entries(theirs.dependencies)) {
                ours.dependencies[k] = v;
            }
        }
        fs.writeFileSync('package.json', JSON.stringify(ours, null, 2) + '\n');
    } catch (e) {
    }
}

resolveAppJs();
resolveOpenApi();
resolvePackageJson();
