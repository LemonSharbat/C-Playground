import { z } from "zod";

export const ExecuteSchema = z.object({
    code: z.string(),
    stdin: z.string()
});