import { prisma } from './prisma';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export async function getAvailableSlots(
  date: Date,
  durationMinutes: number
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();
  
  // Get availability rules for this day
  const availabilityRules = await prisma.availabilityRule.findMany({
    where: {
      dayOfWeek,
      active: true,
    },
  });

  if (availabilityRules.length === 0) {
    return [];
  }

  // Get settings for buffer time
  const bookingSettings = await prisma.settings.findUnique({
    where: { key: 'booking_settings' },
  });

  const settings = bookingSettings 
    ? JSON.parse(bookingSettings.value)
    : { bufferBetweenAppointments: 15 };

  const bufferMinutes = settings.bufferBetweenAppointments || 15;

  // Get existing appointments for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledStart: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['cancelled', 'no_show'],
      },
    },
  });

  // Get blocks for the day
  const blocks = await prisma.block.findMany({
    where: {
      startTime: {
        lte: endOfDay,
      },
      endTime: {
        gte: startOfDay,
      },
    },
  });

  const slots: TimeSlot[] = [];

  // Generate slots for each availability rule
  for (const rule of availabilityRules) {
    const [startHour, startMinute] = rule.startTime.split(':').map(Number);
    const [endHour, endMinute] = rule.endTime.split(':').map(Number);

    const ruleStart = new Date(date);
    ruleStart.setHours(startHour, startMinute, 0, 0);

    const ruleEnd = new Date(date);
    ruleEnd.setHours(endHour, endMinute, 0, 0);

    // Generate 30-minute slots
    let currentSlot = new Date(ruleStart);
    
    while (currentSlot < ruleEnd) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(currentSlot.getMinutes() + durationMinutes);

      // Check if slot end is within working hours
      if (slotEnd <= ruleEnd) {
        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some((apt) => {
          const aptStart = new Date(apt.scheduledStart);
          const aptEnd = new Date(apt.scheduledEnd);
          
          // Add buffer to appointment end
          aptEnd.setMinutes(aptEnd.getMinutes() + bufferMinutes);

          return (
            (currentSlot >= aptStart && currentSlot < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (currentSlot <= aptStart && slotEnd >= aptEnd)
          );
        });

        // Check if slot conflicts with blocks
        const hasBlock = blocks.some((block) => {
          const blockStart = new Date(block.startTime);
          const blockEnd = new Date(block.endTime);

          return (
            (currentSlot >= blockStart && currentSlot < blockEnd) ||
            (slotEnd > blockStart && slotEnd <= blockEnd) ||
            (currentSlot <= blockStart && slotEnd >= blockEnd)
          );
        });

        slots.push({
          start: new Date(currentSlot),
          end: new Date(slotEnd),
          available: !hasConflict && !hasBlock,
        });
      }

      // Move to next 30-minute slot
      currentSlot = new Date(currentSlot);
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }
  }

  return slots;
}

export function isSlotInPast(slot: Date): boolean {
  return slot < new Date();
}

export async function isSlotAvailable(
  start: Date,
  end: Date
): Promise<boolean> {
  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledStart: {
        lt: end,
      },
      scheduledEnd: {
        gt: start,
      },
      status: {
        notIn: ['cancelled', 'no_show'],
      },
    },
  });

  const blocks = await prisma.block.findMany({
    where: {
      startTime: {
        lt: end,
      },
      endTime: {
        gt: start,
      },
    },
  });

  return appointments.length === 0 && blocks.length === 0;
}
