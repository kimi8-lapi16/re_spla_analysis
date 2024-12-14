export interface BaseCrudRepositoryInterface<T> {
  findOneById(id: string): Promise<T>
  read(): Promise<T[]>
  create(param: T): Promise<T>
  update(param: T): Promise<T>
  delete(id: string): Promise<void>
}

export interface SingletonRepositoryInterface<T> {
  getInstance(): T
}
