export interface TComeServiceInterface<T> {
  findAll(): Promise<T[]>
  upsert(param: T): Promise<T>
  delete(id: string): Promise<void>
}

export interface SingletonServiceInterface<T> {
  getInstance(): T
}
