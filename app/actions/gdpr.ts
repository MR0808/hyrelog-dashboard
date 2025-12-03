'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { GdprRequestType, GdprRequestStatus } from '@/generated/prisma/enums';

/**
 * Create a GDPR request
 */
export async function createGdprRequest(formData: FormData) {
  try {
    const session = await requireAuth();
    
    const requestType = formData.get('requestType') as 'DELETE' | 'ANONYMIZE';
    const actorEmail = formData.get('actorEmail') as string | null;
    const actorId = formData.get('actorId') as string | null;

    if (!requestType || !['DELETE', 'ANONYMIZE'].includes(requestType)) {
      return { error: 'Invalid request type' };
    }

    // Get user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!companyUser) {
      return { error: 'User is not associated with a company' };
    }

    const companyId = companyUser.company.id;

    // Check if user has permission (should be ADMIN or OWNER)
    // For now, allow any company member to create requests
    // You can add stricter checks if needed

    // Create GDPR request
    const gdprRequest = await prisma.gdprRequest.create({
      data: {
        companyId,
        requestedByUserId: session.user.id,
        requestType: requestType as GdprRequestType,
        status: GdprRequestStatus.CUSTOMER_PENDING,
        actorEmail: actorEmail || null,
        actorId: actorId || null,
      },
    });

    revalidatePath('/gdpr');
    
    return {
      success: true,
      request: {
        id: gdprRequest.id,
        requestType: gdprRequest.requestType,
        status: gdprRequest.status,
        createdAt: gdprRequest.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating GDPR request:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create GDPR request',
    };
  }
}

/**
 * Approve a GDPR request (customer approval step)
 */
export async function approveGdprRequest(requestId: string) {
  try {
    const session = await requireAuth();
    
    const request = await prisma.gdprRequest.findUnique({
      where: { id: requestId },
      include: {
        company: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return { error: 'GDPR request not found' };
    }

    // Check if user is a member of the company
    if (request.company.members.length === 0) {
      return { error: 'Access denied' };
    }

    // Check if request is in correct status
    if (request.status !== GdprRequestStatus.CUSTOMER_PENDING) {
      return { error: 'Request cannot be approved in current status' };
    }

    // Update status to CUSTOMER_APPROVED
    const updated = await prisma.gdprRequest.update({
      where: { id: requestId },
      data: {
        status: GdprRequestStatus.CUSTOMER_APPROVED,
      },
    });

    // Create approval record
    await prisma.gdprRequestApproval.create({
      data: {
        gdprRequestId: requestId,
        approvedByUserId: session.user.id,
        approvalType: 'CUSTOMER_APPROVAL',
      },
    });

    revalidatePath('/gdpr');
    
    return {
      success: true,
      request: updated,
    };
  } catch (error) {
    console.error('Error approving GDPR request:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to approve GDPR request',
    };
  }
}

