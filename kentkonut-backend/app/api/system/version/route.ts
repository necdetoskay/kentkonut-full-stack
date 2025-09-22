import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  getVersionHistory, 
  getCurrentVersionInfo, 
  getLatestVersionInfo,
  getPackageVersion 
} from "@/lib/version-manager";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current';

    // Basic version info doesn't require authentication
    if (type === 'basic') {
      const packageVersion = getPackageVersion();
      const currentInfo = getCurrentVersionInfo();
      
      return NextResponse.json({
        version: currentInfo?.version || packageVersion,
        title: currentInfo?.title || 'Kent Konut Admin Panel',
        releaseDate: currentInfo?.releaseDate || new Date().toISOString()
      });
    }

    // Version info is now public for system monitoring
    // Authentication removed to allow frontend health checks

    switch (type) {
      case 'current':
        const currentInfo = getCurrentVersionInfo();
        if (!currentInfo) {
          return NextResponse.json({ error: 'Current version not found' }, { status: 404 });
        }
        return NextResponse.json(currentInfo);

      case 'latest':
        const latestInfo = getLatestVersionInfo();
        if (!latestInfo) {
          return NextResponse.json({ error: 'Latest version not found' }, { status: 404 });
        }
        return NextResponse.json(latestInfo);

      case 'history':
        const history = getVersionHistory();
        return NextResponse.json(history);

      case 'all':
        const allVersions = getVersionHistory().versions;
        return NextResponse.json({ versions: allVersions });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Version API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin users can update version info
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update_current':
        const { updateCurrentVersion } = await import('@/lib/version-manager');
        const success = updateCurrentVersion(data);
        
        if (success) {
          return NextResponse.json({ message: 'Version updated successfully' });
        } else {
          return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
        }

      case 'add_version':
        const { addNewVersion } = await import('@/lib/version-manager');
        const addSuccess = addNewVersion(data);
        
        if (addSuccess) {
          return NextResponse.json({ message: 'New version added successfully' });
        } else {
          return NextResponse.json({ error: 'Failed to add new version' }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Version update error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
