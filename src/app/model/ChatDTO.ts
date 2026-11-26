export interface ChatMessageDTO {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequestDTO {
  profileId: number;
  message: string;
  history: ChatMessageDTO[];
}

export interface ChatResponseDTO {
  reply: string;
}
