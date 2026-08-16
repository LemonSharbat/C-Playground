'use client';

import { Editor } from "@monaco-editor/react";
import { useRef, useState } from "react";
import RunButton from "../components/RunButton";

const INITIAL_C_CODE = `#include <stdio.h>

int main() {
    printf("Hello, world!\\n");
    return 0;
}`;

export default function Home() {
  const editorRef = useRef(null);
  const [output, setOutput] = useState("Output appears here..");
  const [stdin, setStdin] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  async function handleSubmit() {
    if (!editorRef.current || isRunning) return;

    setOutput("Running...");
    setIsRunning(true);

    
    try {
      const code = editorRef.current.getValue();
      console.log({"code": code, "stdin": stdin});
      
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          stdin
        }),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        setOutput(data.error?.message ?? "Something went wrong");
        return;
      }

      if (data.phase === "execution" && data.status === "success") {
        setOutput(data.stdout || "(no output)");
      }

      if (data.phase === "compilation" && data.status === "compile_error") {
        setOutput(data.stderr);
      }

    } catch (error) {
      setOutput("Could not connect to the server");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-sm font-semibold tracking-wide uppercase text-slate-400">C Playground</h1>
        </div>
        <RunButton isRunning={isRunning} handleSubmit={handleSubmit} />
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Editor Workspace */}
        <div className="w-full md:w-[65%] border-r border-slate-800 p-4 bg-[#0d1117]">
          <div className="rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
            <Editor
              height="70vh"
              width="100%"
              defaultLanguage="c"
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                padding: { top: 12 },
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }
              }}
              defaultValue={INITIAL_C_CODE}
              onMount={handleEditorMount}
            />
          </div>
        </div>

        {/* Right Side: Execution Controls & Console Output */}
        <div className="w-full md:w-[35%] flex flex-col bg-[#161b22] p-6 justify-between gap-6">
          {/* Top Half: Input Parameter block */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard Input (stdin)</label>
            <textarea
              rows={4}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Provide execution inputs here..."
              className="w-full min-h-[120px] rounded-lg px-3 py-2 text-sm text-slate-100 bg-[#0d1117] border border-slate-800 transition-all duration-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 font-mono resize-none"
            />
          </div>

          {/* Bottom Half: Console Display */}
          <div className="flex-1 flex flex-col gap-2 min-h-[250px]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Console Output</label>
            <div className="flex-1 w-full bg-[#0d1117] rounded-lg p-4 border border-slate-800 overflow-auto font-mono text-sm shadow-inner">
              <pre className={`whitespace-pre-wrap ${output === "Running..." ? "text-amber-400" : "text-slate-300"}`}>
                {output}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
