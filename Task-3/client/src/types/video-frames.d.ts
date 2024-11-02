declare interface VideoFrame {
    readonly format: string;
    readonly timestamp: number;
    readonly duration: number | null;
    readonly displayWidth: number;
    readonly displayHeight: number;
    close(): void;
}