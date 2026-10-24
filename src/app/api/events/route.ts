import { NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';

export async function GET() {
  try {
    const registries = VeridexDb.getRegistries();
    const assets = VeridexDb.getAssets();

    const formattedAssets = assets.map(a => ({
      id: a.id,
      registry_id: a.registry_id,
      owner_name: a.owner_name,
      owner_id: a.owner_id,
      land_location: a.land_location,
      land_area: a.land_area,
      land_type: a.land_type,
      certificate_number: a.certificate_number,
      pdf_hash: a.pdf_hash,
      status: a.status,
      serial_number: a.serial_number,
      created_at: a.created_at,
      download_url: `/api/certificates/${a.pdf_hash}`,
      // Backwards compatibility aliases if needed
      name: a.owner_name,
      email: a.owner_id,
    }));

    return NextResponse.json({
      success: true,
      registries,
      events: registries, // alias for backwards compatibility
      assets: formattedAssets,
      participants: formattedAssets, // alias for backwards compatibility
      stats: {
        total_registries: registries.length,
        total_land_assets: assets.length,
        valid_count: assets.filter(a => a.status === 'VALID').length,
        revoked_count: assets.filter(a => a.status === 'REVOKED').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memuat data pendaftaran tanah' },
      { status: 500 }
    );
  }
}
