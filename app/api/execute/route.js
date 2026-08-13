import { NextResponse } from "next/server";
import { executeC } from '@/lib/execution.js';

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

    
    if (typeof body.code !== "string") {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_INPUT",
                    message: "code must be a string"
                }
            },
            { status: 400 }
        );
    }
        
    try {
        const result = await executeC(body.code);

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

    // [TODO] request validation, gcc not there etc.. 

    
}