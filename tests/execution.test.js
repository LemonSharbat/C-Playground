import { expect, test, describe } from "vitest";
import { executeC } from "../lib/dockerRunner.js";

import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";``


async function readSourceFile(fileName) {
    try {
        const fileContent = await readFile(
            join(cwd(), "tests", "fixtures", fileName),
            { encoding: 'utf8' }
        );

        return fileContent;
    } catch (error) {
        console.error("Error read file: ", error);
        // Should i need to return something? or exit?
    }
}

describe("executeC", () => {
    test("hello world", async () => {
        const input = "";
        const code = await readSourceFile("helloWorld.c", input);
    
        const result = await executeC(code, input);
    
        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.stdout).toBe("Hello world!\n");
    });

    test("direct return 0", async () => {
        const input = "";
        const code = await readSourceFile("return0.c");

        const result = await(executeC(code, input));

        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.status).toBe("success");
    });

    test("simple return 0, with some input", async () => {
        const input = "sghd sgshjckgs c gcdkc d";
        const code = await readSourceFile("epipe.c");

        const result = await executeC(code, input);

        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("success");
    });

    test("Takes string input and prints that back", async () => {
        const input = "Hello Dinku! 123";
        const code = await readSourceFile("fgets.c");

        const result = await executeC(code, input);

        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("success");
        expect(result.stdout).toBe(`Got: ${input}`);
    });

    test("A simple for loop",  async () => {
        const input = "13";
        const code = await readSourceFile("loop.c");

        const result = await executeC(code, input);

        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("success");
        expect(result.stdout).toBe("1 2 3 4 5 6 7 8 9 10 11 12 13 \n");
    });

    test("simple array with sum and avg calculation", async () => {
        const input = "6\n2\n-1\n4\n55\n9\n3";
        const code = await readSourceFile("array.c");

        const result = await executeC(code, input);

        expect(result.exitCode).toBe(0);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("success");
        expect(result.stdout).toBe("Sum = 72\nAverage = 12.00\n");
    });

    test("infinite loop", async () => {
        const input = "";
        const code = await readSourceFile("infinite_loop.c");

        const result = await executeC(code, input);

        expect(result.timedOut).toBe(true);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("timeout");
        expect(result.stdout).toBe("");
    });
});
