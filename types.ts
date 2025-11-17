
export interface UserProfile {
  name: string;
  age: string;
  height: string;
  weight: string;
  steps: string;
  notes: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}
