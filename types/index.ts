export interface Appointment {
  id: string
  fullname: string
  date: Date
  phone: string
  userId: number
  user: AllowedUser
  createdAt: Date
  updatedAt: Date
}

export interface AllowedUser {
  id: number
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  appointments: Appointment[]
  closedSlots: ClosedSlot[]
}

export interface ClosedSlot {
  id: string
  userId: number
  date: Date
  reason: string
  createdAt: Date
  updatedAt: Date
  user: AllowedUser
} 