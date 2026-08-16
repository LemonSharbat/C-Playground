import { NextResponse } from "next/server";
import { executeC } from '@/lib/execution.js';
import { ExecuteSchema } from '@/lib/validation.js';

export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_JSON",
                    message: "Request body must contain valid JSON"
                }
            },
            { status: 400 }
        );
    }

    const validation = ExecuteSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_INPUT",
                    message: validation.error.issues
                }
            },
            { status: 400 }
        );
    }
    
    const { code, stdin } = validation.data;

    try {
        const result = await executeC(code, stdin);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Execution service failed:", error);

        return NextResponse.json(
            {
                error: {
                    code: "EXECUTION_SERVICE_ERROR",
                    message: "Unable to execute the program"
                }
            },
            { status: 500 }
        );
    }
}