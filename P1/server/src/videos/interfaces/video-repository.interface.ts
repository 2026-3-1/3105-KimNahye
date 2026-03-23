export interface IVideoRepository {
  findById(id: string);
}

export const VIDEO_REPOSITORY = Symbol('IVideoRepository');
