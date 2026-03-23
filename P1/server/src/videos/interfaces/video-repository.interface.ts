export interface IVideosRepository {
  findById(id: string);
}

export const VIDEOS_REPOSITORY = Symbol('IVideosRepository');
