export type Command = 'check' | 'fix';
export type CliArgs = {
    command: Command;
    path: string;
    majorOnly: boolean;
    rootDir: string;
    repo: string | null;
};
export type ParsedUsesLine = {
    prefix: string;
    action: string;
    ref: string;
    comment: string;
    original: string;
};
export type FileChange = {
    filePath: string;
    lineNumber: number;
    action: string;
    targetRef: string;
    currentRef: string;
    currentComment: string;
    currentLine: string;
    nextLine: string;
    nextSha: string;
};
export type InspectionResult = {
    filePath: string;
    raw: string;
    lines: string[];
    changes: FileChange[];
};
export type ResolveRef = (action: string, ref: string, repo?: string | null) => Promise<string>;
export type InspectOptions = {
    rootDir: string;
    path: string;
    majorOnly: boolean;
    repo?: string | null;
    resolveRef: ResolveRef;
};
export declare function parseArgs(argv: string[]): CliArgs;
export declare function findWorkflowFiles(rootDir: string, pattern?: string): Promise<string[]>;
export declare function parseUsesLine(line: string): ParsedUsesLine | null;
export declare function getTargetRef(parsedLine: ParsedUsesLine | null): string | null;
export declare function buildPinnedLine(parsedLine: Pick<ParsedUsesLine, 'prefix' | 'action'>, sha: string, targetRef: string): string;
export declare function inspectFile(filePath: string, options: InspectOptions): Promise<InspectionResult>;
export declare function inspectWorkflows(options: InspectOptions): Promise<InspectionResult[]>;
export declare function applyChanges(results: InspectionResult[]): Promise<void>;
export declare function formatReport(results: InspectionResult[], rootDir?: string): string;
export declare function createGitHubResolver({ fetchImpl, token, }?: {
    fetchImpl?: typeof fetch;
    token?: string | undefined;
}): ResolveRef;
