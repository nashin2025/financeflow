import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (id) where.id = id
    if (type) where.type = type

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
    })

    const total = await prisma.goal.count({ where })

    return NextResponse.json({ goals, total, limit, offset })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, targetAmount, currentAmount, targetDate, monthlyContribution, icon, color, userId } = body

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Name and target amount are required" }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        type: type || "savings",
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        targetDate: targetDate ? new Date(targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0,
        icon: icon || "Target",
        color: color || "#3B82F6",
        userId: userId || "1",
      },
    })

    return NextResponse.json({ goal, message: "Goal created successfully" })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Check if goal exists
    const existingGoal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal) {
      console.error('Goal not found:', id);
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await request.json()
    const { currentAmount, name, type, targetAmount, targetDate, monthlyContribution, icon, color } = body

    console.log('Updating goal:', id, { currentAmount, name, type, targetAmount, targetDate, monthlyContribution, icon, color });

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Update currentAmount if provided
    if (currentAmount !== undefined) {
      const newAmount = parseFloat(currentAmount);
      if (isNaN(newAmount)) {
        return NextResponse.json({ error: 'Invalid currentAmount value' }, { status: 400 });
      }
      updateData.currentAmount = newAmount;
    }

    // Update other fields if provided (for editing)
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (targetAmount !== undefined) {
      const target = parseFloat(targetAmount);
      if (isNaN(target)) {
        return NextResponse.json({ error: 'Invalid targetAmount value' }, { status: 400 });
      }
      updateData.targetAmount = target;
    }
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
    if (monthlyContribution !== undefined) {
      const contrib = parseFloat(monthlyContribution);
      if (isNaN(contrib)) {
        return NextResponse.json({ error: 'Invalid monthlyContribution value' }, { status: 400 });
      }
      updateData.monthlyContribution = contrib;
    }
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
    })

    console.log('Goal updated successfully:', updatedGoal);

    return NextResponse.json({ goal: updatedGoal, message: 'Goal updated' })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    await prisma.goal.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
