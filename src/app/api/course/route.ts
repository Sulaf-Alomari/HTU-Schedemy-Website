// app/api/course/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('schedemy-website-alb-1811935318.eu-north-1.elb.amazonaws.com/courses', { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch courses. Status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
