
export type SolcImage = {
  images: any
  name: string
}

export interface SolcDockerService {
  list(page?: number): Promise<SolcImage[]>
}
