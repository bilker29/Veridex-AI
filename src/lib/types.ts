export interface Participant {
  id: string;
  event_id: string;
  name: string;
  email: string;
  pdf_hash: string;
  merkle_proof: string[];
  status: 'VALID' | 'REVOKED';
  created_at?: string;
  serial_number?: string;
}

export interface EventBatch {
  id: string;
  name: string;
  batch_id: string;
  merkle_root: string;
  tx_hash: string;
  block_number?: number;
  created_at: string;
  participant_count: number;
}

export interface ExtractedParticipant {
  name: string;
  email: string;
}

export interface IssueRequestBody {
  event_name: string;
  participants: Array<{
    name: string;
    email: string;
  }>;
}

export interface VerifyRequestBody {
  pdf_hash: string;
}

export interface VerifySuccessResponse {
  success: true;
  status: 'VERIFIED';
  participant_name: string;
  participant_email: string;
  event_name: string;
  batch_id: string;
  merkle_root: string;
  merkle_proof: string[];
  tx_hash: string;
  block_number: number;
  issued_at: string;
  pdf_hash: string;
}

export interface VerifyFailureResponse {
  success: false;
  status: 'FORGED' | 'REVOKED' | 'NOT_FOUND';
  message: string;
  pdf_hash?: string;
  details?: string;
}
