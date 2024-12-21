export interface BaseCrudRepositoryInterface<T, TWhereInput> {
  findOneById(id: string): Promise<T>
  read(where?: TWhereInput): Promise<T[]>
  create(param: T): Promise<T>
  update(param: T): Promise<T>
  delete(id: string): Promise<void>
}

export interface SingletonRepositoryInterface<T> {
  getInstance(): T
}
