import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const photoId = parseInt(params.photoId);

    const photo = await prisma.clientPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    await prisma.clientPhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const photoId = parseInt(params.photoId);
    const body = await request.json();
    const { description, appointmentId } = body;

    const photo = await prisma.clientPhoto.update({
      where: { id: photoId },
      data: {
        description,
        appointmentId: appointmentId || null,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}
