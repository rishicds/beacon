import { NextRequest, NextResponse } from 'next/server';
import { data } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, companyId } = body;
    if (!name || !email || !role || !companyId) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
    // Use the same logic as before, but on the server
    const user = await data.users.createUser({ name, email, role, companyId });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create user.' }, { status: 500 });
  }
}
