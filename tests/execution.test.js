import { expect, test, describe } from "vitest";
import { executeC } from "../lib/execution.js";

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
        expect(result.stdout).toBe("Hello world!\n");
    });

    test("direct return 0", async () => {
        const input = "";
        const code = await readSourceFile("return0.c");

        const result = await(executeC(code, input));

        expect(result.exitCode).toBe(0);
        expect(result.status).toBe("success");
    });

    test("simple return 0, with some input", async () => {
        const input = "sghd sgshjckgs c gcdkc d";
        const code = await readSourceFile("epipe.c");

        const result = await executeC(code, input);

        expect(result.exitCode).toBe(0);
        expect(result.phase).toBe("execution");
        expect(result.status).toBe("success");
    });
});
