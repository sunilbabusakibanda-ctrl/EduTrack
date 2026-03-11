const fs = require('fs');
let content = fs.readFileSync('account_describe.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const describe = JSON.parse(content);
const emailFields = describe.result.fields.filter(f => f.name.toLowerCase().includes('email') || f.label.toLowerCase().includes('email'));
console.log(JSON.stringify(emailFields.map(f => ({ name: f.name, label: f.label })), null, 2));
