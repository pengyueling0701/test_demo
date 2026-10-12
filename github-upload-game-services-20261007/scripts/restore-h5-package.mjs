import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const directory=new URL('../release/h5-v0.16.13/',import.meta.url);
const manifest=JSON.parse((await readFile(new URL('manifest.json',directory),'utf8')).replace(/^\uFEFF/,''));
const buffers=await Promise.all(manifest.parts.map(name=>readFile(new URL(name,directory))));
const archive=Buffer.concat(buffers);
const hash=createHash('sha256').update(archive).digest('hex');
if(archive.length!==manifest.bytes||hash!==manifest.sha256)throw new Error('H5 分片缺失或损坏，请重新下载完整仓库。');
const destination=new URL('../release/'+manifest.archive,import.meta.url);
await writeFile(destination,archive);
console.log('H5 包已还原：'+fileURLToPath(destination));
