export class ProgressResponseDto {
  videoId: string;
  watchedDuration: number;
  isCompleted: boolean;
  lastWatchedAt: Date | null;
}
