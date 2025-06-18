export interface ServerFormData {
  name: string;
  description: string;
}

export interface Server {
  id: string;
  name: string;
  description: string;
  alias: string;
  createdAt: Date;
  updatedAt: Date;
}