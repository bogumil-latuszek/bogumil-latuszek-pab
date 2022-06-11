import fs from 'fs';

const config_file_content = fs.readFileSync(".config.json", 'utf-8');
const config = JSON.parse(config_file_content)
export default config;
