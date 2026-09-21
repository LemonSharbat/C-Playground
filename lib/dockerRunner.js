
import {
    rm,
    mkdtemp,
    writeFile
} from "node:fs/promises";
import { join } from "node:path";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";


const timeout_limit = 2000;  // in ms


async function compile(workspace) {
    const stdoutChunks = [];
    const stderrChunks = [];

    const gcc = spawn(
        "docker",
        [
            "run",
            "--rm",

            // Mount temporary workspace
            "-v",
            `${workspace}:/workspace`,

            // Container working directory
            "-w",
            "/workspace",

            // image
            "c-playground-runner",

            // Command executed inside container
            "gcc",
            "-Wall",
            "-Wextra",
            "main.c",
            "-o",
            "program"
        ]
    );

    gcc.on("error", (err) => {
        console.error("Docker compile spawn error:", err);
    });

    gcc.stdout.on("data", (chunk) => {
        stdoutChunks.push(chunk);
    });

    gcc.stderr.on("data", (chunk) => {
        stderrChunks.push(chunk);
    });

    const [code] = await once(gcc, "close");

    return {
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode: code
    };
}

// executes the compiled binary.
async function execute(workspace, input) {
    const stdoutChunks = [];
    const stderrChunks = [];

    let spawnError = null;
    let timedOut = false;

    // Give this execution container a unique name
    const containerName = `c-play-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    // [FIX] ./program might fail for windows
    const container = spawn(
        "docker",
        [
            "run",

            "--rm",

            // Give the container a name so we can explicitly stop this container later.
            "--name",
            containerName,

            "-i",

            "-v",
            `${workspace}:/workspace`,

            "-w",
            "/workspace",

            "c-playground-runner",

            "./program"
        ]
    );

    container.on('error', (err) => {
        spawnError = err;
        console.log({"execution container": err});
    });

    container.stdin.on('error', (err) => {
        if (err.code === "EPIPE") {
            console.log("[Warning] Program closed before writing input to stdin");
            
            return;
        }

        console.error("stdin error: ", err);
    });

    // wite to stdin and close it
    container.stdin.end(input ?? "");

    // Ask Docker to stop the container if it runs too long.
    const timeout = setTimeout(() => {
        timedOut = true;

        // `docker stop` sends SIGTERM first.
        // `-t 1` gives the program 1 second to terminate gracefully.
        // If it does not terminate, Docker sends SIGKILL.
        const stop = spawn(
            "docker",
            [
                "stop",
                "-t",
                "1",
                containerName
            ]
        );

        // We don't need the output of `docker stop`.
        stop.stdout.resume();
        stop.stderr.resume();

        stop.on("error", (err) => {
            console.error("Docker stop error:", err);
        });
    }, timeout_limit);

    container.stdout.on('data', (chunk) => {
        stdoutChunks.push(chunk);
    });

    container.stderr.on('data', (chunk) => {
        stderrChunks.push(chunk);
    });

    const [code, signal] = await once(container, 'close');

    // If the program finished before the timeout,
    // cancel the timeout timer.
    clearTimeout(timeout);

    return {
        stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
        exitCode: code,
        spawnError,
        timedOut,
        signal
    };
}

// compile and run
export async function executeC(code, input) {
    
    // create a unique temperory directory
    const workspace = await mkdtemp(join(tmpdir(), 'cPlay-'));
    const filePath = join(workspace, 'main.c');

    // [DEBUG]
    console.log("Created: ", workspace);

    try {
        // save code in workspace
        await writeFile(filePath, code, 'utf-8');

        // [DEBUG]
        console.log("Written to file: ", filePath);
    
        const compileRes = await compile(workspace);
    
        // compile error
        if (compileRes.exitCode !== 0 || compileRes.stderr !== "") {
            
            // [DEBUG]
            console.log("Compile error: ", compileRes.stderr);

            return {
                "status": "compile_error",
                "phase": "compilation",
                ...compileRes
            };
        }
    
        const runRes = await execute(workspace, input);
        
        return {
            "status": runRes.timedOut
                ? "timeout"
                : runRes.exitCode === 0
                    ? "success"
                    : "runtime_error",
            "phase": "execution",
            ...runRes
        };
    
    } finally {
        // delete worspace, like rm -rf
        await rm(workspace, { 
            recursive: true, 
            force: true 
        });

        // [DEBUG]
        console.log("Deleted: ", workspace);
    }
}