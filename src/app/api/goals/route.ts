import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { currentAmount, name, type, targetAmount, targetDate, monthlyContribution, icon, color } = body

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Update currentAmount if provided
    if (currentAmount !== undefined) {
      updateData.currentAmount = parseFloat(currentAmount);
    }

    // Update other fields if provided (for editing)
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
    if (monthlyContribution !== undefined) updateData.monthlyContribution = parseFloat(monthlyContribution) || 0;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
    })

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