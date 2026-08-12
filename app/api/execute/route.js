import { NextResponse } from "next/server";
import { executeC } from '@/lib/execution.js';

export async function POST(request) {
    const body = await request.json();
    const code = body.code;

    // [TODO] request validation, gcc not there etc.. 

    const res = await executeC(code);
    
    return NextResponse.json(res);
}