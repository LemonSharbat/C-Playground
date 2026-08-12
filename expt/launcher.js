import { spawn } from 'node:child_process';
import { once } from 'node:events';

const fileName = process.argv[2];

if (!fileName) {
    console.log("Provide a C-file path");
    console.log("usage: node expt/launcher.js <source-file-path>")

    process.exit(1);
}

async function compile(fileName) {

    // Arrays to accumulate incomming binary chunks instead of string concatination..
    const stdoutChunks = [];
    const stderrChunks = [];

    const gcc = spawn('gcc', ['-Wall', '-Wextra', fileName]);


    gcc.stdout.on('data', (chunk) => {
        stdoutChunks.push(chunk);
    })
    
    gcc.stderr.on('data', (chunk) => {
        stderrChunks.push(chunk);
    })

    // once() returns a Promise that resolves to an array of event arguments.
    // [code] -> is array destructuring.. 
    // wait until the process closes and get the exit code
    const [code] = await once(gcc, 'close');
    
    return {
        stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
        exitCode: code
    }
}

// should handle './' : just filename isnt good
async function run(fileName='./a.out') {
    const stdoutChunks = [];
    const stderrChunks = [];

    const runC = spawn(fileName);

    runC.on('error', (err) => {
        console.error(`Failed to create subprocess..: ${err}`);
        process.exit(1)
    })

    runC.stdout.on('data', (chunk) => {
        stdoutChunks.push(chunk);
    })

    runC.stderr.on('data', (chunk) => {
        stderrChunks.push(chunk);
    })

    const [code] = await once(runC, 'close');

    return {
        stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
        exitCode: code
    };
}

const compileResult = await compile(fileName);

// failed compilation
if (compileResult.exitCode !== 0) {
    console.log(compileResult);
    process.exit(1);
}

// if compilation is sucess -> run the exe
const runResult = await run();
console.log(runResult);

