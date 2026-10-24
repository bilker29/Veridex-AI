export interface LandAsset {
  id: string;
  registry_id: string;
  owner_name: string;
  owner_id: string; // NIK or KTP number
  land_location: string;
  land_area: string; // e.g. "500 m²"
  land_type: string; // SHM, SHGB, AJB, etc.
  certificate_number: string;
  pdf_hash: string;
  merkle_proof: string[];
  status: 'VALID' | 'REVOKED' | 'TRANSFERRED';
  created_at?: string;
  serial_number?: string;
}

export interface RegistryBatch {
  id: string;
  name: string;
  batch_id: string;
  merkle_root: string;
  tx_hash: string;
  block_number?: number;
  created_at: string;
  asset_count: number;
}

export interface ExtractedLandData {
  owner_name: string;
  owner_id: string;
  land_location: string;
  land_area: string;
  land_type: string;
}

export interface IssueRequestBody {
  registry_name: string;
  assets: Array<{
    owner_name: string;
    owner_id: string;
    land_location: string;
    land_area: string;
    land_type: string;
  }>;
}

export interface VerifyRequestBody {
  pdf_hash: string;
}

export interface VerifySuccessResponse {
  success: true;
  status: 'VERIFIED';
  owner_name: string;
  owner_id: string;
  land_location: string;
  land_area: string;
  land_type: string;
  certificate_number: string;
  registry_name: string;
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
