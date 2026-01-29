// app/api/timeSlot/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://schedemy-website-alb-1534266831.eu-north-1.elb.amazonaws.com/time', {
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching timeslot:', error);
    return NextResponse.json({ error: 'Failed to fetch timeslot' }, { status: 500 });
  }
}
