/**
 * Seeded sample data for the leaderboard while there's no backend.
 *
 * These are invented people, not users. Keep this import behind
 * `IS_DEMO_DATA` so it can't quietly ship as social proof — swap the whole
 * module for a real `/api/leaderboard` fetch when the backend lands.
 */

export const IS_DEMO_DATA = true

export type LeaderboardRow = {
  id: string
  name: string
  tasksCompleted: number
  earned: number
}

export const DEMO_LEADERBOARD: LeaderboardRow[] = [
  { id: 'd1', name: 'Chidi Okafor', tasksCompleted: 48, earned: 12000000 },
  { id: 'd2', name: 'Amara Nwosu', tasksCompleted: 45, earned: 10800000 },
  { id: 'd3', name: 'Tunde Balogun', tasksCompleted: 41, earned: 9600000 },
  { id: 'd4', name: 'Fatima Bello', tasksCompleted: 39, earned: 8600000 },
  { id: 'd5', name: 'Emeka Obi', tasksCompleted: 36, earned: 7700000 },
  { id: 'd6', name: 'Ngozi Adeyemi', tasksCompleted: 34, earned: 6900000 },
  { id: 'd7', name: 'Yusuf Ibrahim', tasksCompleted: 31, earned: 6200000 },
  { id: 'd8', name: 'Blessing Eze', tasksCompleted: 29, earned: 5600000 },
  { id: 'd9', name: 'Segun Adewale', tasksCompleted: 26, earned: 5100000 },
  { id: 'd10', name: 'Halima Sani', tasksCompleted: 24, earned: 4700000 },
  { id: 'd11', name: 'Ifeanyi Uche', tasksCompleted: 21, earned: 4300000 },
  { id: 'd12', name: 'Zainab Musa', tasksCompleted: 19, earned: 4000000 },
  { id: 'd13', name: 'Chinedu Nnamdi', tasksCompleted: 18, earned: 3800000 },
  { id: 'd14', name: 'Aisha Yakubu', tasksCompleted: 17, earned: 3600000 },
  { id: 'd15', name: 'Bayo Ogunleye', tasksCompleted: 16, earned: 3400000 },
  { id: 'd16', name: 'Chioma Anyanwu', tasksCompleted: 15, earned: 3200000 },
  { id: 'd17', name: 'Musa Abdullahi', tasksCompleted: 15, earned: 3100000 },
  { id: 'd18', name: 'Grace Effiong', tasksCompleted: 14, earned: 2900000 },
  { id: 'd19', name: 'Kelechi Iwu', tasksCompleted: 13, earned: 2750000 },
  { id: 'd20', name: 'Fatimah Garba', tasksCompleted: 13, earned: 2700000 },
  { id: 'd21', name: 'Obinna Chukwu', tasksCompleted: 12, earned: 2500000 },
  { id: 'd22', name: 'Aminat Bakare', tasksCompleted: 12, earned: 2450000 },
  { id: 'd23', name: 'Uche Okonkwo', tasksCompleted: 11, earned: 2300000 },
  { id: 'd24', name: 'Rashida Umar', tasksCompleted: 11, earned: 2250000 },
  { id: 'd25', name: 'Femi Adisa', tasksCompleted: 10, earned: 2100000 },
  { id: 'd26', name: 'Ijeoma Nwachukwu', tasksCompleted: 10, earned: 2050000 },
  { id: 'd27', name: 'Suleiman Danjuma', tasksCompleted: 9, earned: 1900000 },
  { id: 'd28', name: 'Adaeze Okoro', tasksCompleted: 9, earned: 1850000 },
  { id: 'd29', name: 'Tobi Ajayi', tasksCompleted: 8, earned: 1700000 },
  { id: 'd30', name: 'Hauwa Mohammed', tasksCompleted: 8, earned: 1650000 },
  { id: 'd31', name: 'Chukwuemeka Ude', tasksCompleted: 7, earned: 1500000 },
  { id: 'd32', name: 'Bisi Fashola', tasksCompleted: 7, earned: 1450000 },
  { id: 'd33', name: 'Ismail Lawal', tasksCompleted: 6, earned: 1300000 },
  { id: 'd34', name: 'Ndidi Okeke', tasksCompleted: 6, earned: 1250000 },
  { id: 'd35', name: 'Precious Etim', tasksCompleted: 5, earned: 1100000 },
  { id: 'd36', name: 'Abubakar Sadiq', tasksCompleted: 5, earned: 1050000 },
  { id: 'd37', name: 'Omolara Adekunle', tasksCompleted: 4, earned: 900000 },
  { id: 'd38', name: 'Chuka Ibe', tasksCompleted: 4, earned: 850000 },
  { id: 'd39', name: 'Zulaikha Hassan', tasksCompleted: 3, earned: 700000 },
  { id: 'd40', name: 'Godwin Osaretin', tasksCompleted: 3, earned: 650000 },
]
