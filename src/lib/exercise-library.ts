// Curated exercise library with muscle group categorisation
// Used for autocomplete, search, and muscle-group filtering

export interface ExerciseEntry {
  name: string
  group: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Full Body'
  equipment?: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight' | 'Kettlebell'
}

export const EXERCISE_LIBRARY: ExerciseEntry[] = [
  // ─── Chest ────────────────────────────────────────────────────────────────
  { name: 'Barbell Bench Press',        group: 'Chest',      equipment: 'Barbell'    },
  { name: 'Incline Barbell Bench Press',group: 'Chest',      equipment: 'Barbell'    },
  { name: 'Decline Barbell Bench Press',group: 'Chest',      equipment: 'Barbell'    },
  { name: 'Dumbbell Bench Press',       group: 'Chest',      equipment: 'Dumbbell'   },
  { name: 'Incline Dumbbell Press',     group: 'Chest',      equipment: 'Dumbbell'   },
  { name: 'Dumbbell Fly',               group: 'Chest',      equipment: 'Dumbbell'   },
  { name: 'Cable Chest Fly',            group: 'Chest',      equipment: 'Cable'      },
  { name: 'Push-Up',                    group: 'Chest',      equipment: 'Bodyweight' },
  { name: 'Weighted Push-Up',           group: 'Chest',      equipment: 'Bodyweight' },
  { name: 'Chest Dip',                  group: 'Chest',      equipment: 'Bodyweight' },
  { name: 'Pec Deck Machine',           group: 'Chest',      equipment: 'Machine'    },
  { name: 'Cable Crossover',            group: 'Chest',      equipment: 'Cable'      },
  { name: 'Smith Machine Bench Press',  group: 'Chest',      equipment: 'Machine'    },

  // ─── Back ─────────────────────────────────────────────────────────────────
  { name: 'Conventional Deadlift',      group: 'Back',       equipment: 'Barbell'    },
  { name: 'Romanian Deadlift',          group: 'Back',       equipment: 'Barbell'    },
  { name: 'Sumo Deadlift',              group: 'Back',       equipment: 'Barbell'    },
  { name: 'Barbell Row',                group: 'Back',       equipment: 'Barbell'    },
  { name: 'Pendlay Row',                group: 'Back',       equipment: 'Barbell'    },
  { name: 'Dumbbell Row',               group: 'Back',       equipment: 'Dumbbell'   },
  { name: 'Pull-Up',                    group: 'Back',       equipment: 'Bodyweight' },
  { name: 'Weighted Pull-Up',           group: 'Back',       equipment: 'Bodyweight' },
  { name: 'Chin-Up',                    group: 'Back',       equipment: 'Bodyweight' },
  { name: 'Lat Pulldown',               group: 'Back',       equipment: 'Cable'      },
  { name: 'Seated Cable Row',           group: 'Back',       equipment: 'Cable'      },
  { name: 'T-Bar Row',                  group: 'Back',       equipment: 'Barbell'    },
  { name: 'Face Pull',                  group: 'Back',       equipment: 'Cable'      },
  { name: 'Good Morning',               group: 'Back',       equipment: 'Barbell'    },
  { name: 'Back Extension',             group: 'Back',       equipment: 'Machine'    },
  { name: 'Shrug',                      group: 'Back',       equipment: 'Barbell'    },
  { name: 'Dumbbell Shrug',             group: 'Back',       equipment: 'Dumbbell'   },

  // ─── Legs ─────────────────────────────────────────────────────────────────
  { name: 'Barbell Back Squat',         group: 'Legs',       equipment: 'Barbell'    },
  { name: 'Barbell Front Squat',        group: 'Legs',       equipment: 'Barbell'    },
  { name: 'Goblet Squat',               group: 'Legs',       equipment: 'Kettlebell' },
  { name: 'Leg Press',                  group: 'Legs',       equipment: 'Machine'    },
  { name: 'Hack Squat',                 group: 'Legs',       equipment: 'Machine'    },
  { name: 'Bulgarian Split Squat',      group: 'Legs',       equipment: 'Dumbbell'   },
  { name: 'Walking Lunge',              group: 'Legs',       equipment: 'Dumbbell'   },
  { name: 'Reverse Lunge',              group: 'Legs',       equipment: 'Barbell'    },
  { name: 'Leg Extension',              group: 'Legs',       equipment: 'Machine'    },
  { name: 'Leg Curl',                   group: 'Legs',       equipment: 'Machine'    },
  { name: 'Nordic Hamstring Curl',      group: 'Legs',       equipment: 'Bodyweight' },
  { name: 'Standing Calf Raise',        group: 'Legs',       equipment: 'Machine'    },
  { name: 'Seated Calf Raise',          group: 'Legs',       equipment: 'Machine'    },
  { name: 'Smith Machine Squat',        group: 'Legs',       equipment: 'Machine'    },
  { name: 'Step-Up',                    group: 'Legs',       equipment: 'Dumbbell'   },

  // ─── Shoulders ────────────────────────────────────────────────────────────
  { name: 'Barbell Overhead Press',     group: 'Shoulders',  equipment: 'Barbell'    },
  { name: 'Dumbbell Shoulder Press',    group: 'Shoulders',  equipment: 'Dumbbell'   },
  { name: 'Arnold Press',               group: 'Shoulders',  equipment: 'Dumbbell'   },
  { name: 'Lateral Raise',              group: 'Shoulders',  equipment: 'Dumbbell'   },
  { name: 'Cable Lateral Raise',        group: 'Shoulders',  equipment: 'Cable'      },
  { name: 'Front Raise',                group: 'Shoulders',  equipment: 'Dumbbell'   },
  { name: 'Rear Delt Fly',              group: 'Shoulders',  equipment: 'Dumbbell'   },
  { name: 'Machine Shoulder Press',     group: 'Shoulders',  equipment: 'Machine'    },
  { name: 'Upright Row',                group: 'Shoulders',  equipment: 'Barbell'    },

  // ─── Arms ─────────────────────────────────────────────────────────────────
  { name: 'Barbell Curl',               group: 'Arms',       equipment: 'Barbell'    },
  { name: 'Dumbbell Curl',              group: 'Arms',       equipment: 'Dumbbell'   },
  { name: 'Hammer Curl',                group: 'Arms',       equipment: 'Dumbbell'   },
  { name: 'Preacher Curl',              group: 'Arms',       equipment: 'Barbell'    },
  { name: 'Cable Curl',                 group: 'Arms',       equipment: 'Cable'      },
  { name: 'Incline Dumbbell Curl',      group: 'Arms',       equipment: 'Dumbbell'   },
  { name: 'Concentration Curl',         group: 'Arms',       equipment: 'Dumbbell'   },
  { name: 'Close-Grip Bench Press',     group: 'Arms',       equipment: 'Barbell'    },
  { name: 'Skull Crusher',              group: 'Arms',       equipment: 'Barbell'    },
  { name: 'Tricep Dip',                 group: 'Arms',       equipment: 'Bodyweight' },
  { name: 'Tricep Pushdown',            group: 'Arms',       equipment: 'Cable'      },
  { name: 'Overhead Tricep Extension',  group: 'Arms',       equipment: 'Dumbbell'   },
  { name: 'Diamond Push-Up',            group: 'Arms',       equipment: 'Bodyweight' },
  { name: 'Wrist Curl',                 group: 'Arms',       equipment: 'Barbell'    },

  // ─── Core ─────────────────────────────────────────────────────────────────
  { name: 'Plank',                      group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Side Plank',                 group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Crunch',                     group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Bicycle Crunch',             group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Leg Raise',                  group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Hanging Knee Raise',         group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Hanging Leg Raise',          group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Ab Wheel Rollout',           group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Cable Crunch',               group: 'Core',       equipment: 'Cable'      },
  { name: 'Russian Twist',              group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Dead Bug',                   group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Mountain Climber',           group: 'Core',       equipment: 'Bodyweight' },
  { name: 'V-Up',                       group: 'Core',       equipment: 'Bodyweight' },
  { name: 'Pallof Press',               group: 'Core',       equipment: 'Cable'      },

  // ─── Cardio ───────────────────────────────────────────────────────────────
  { name: 'Treadmill Run',              group: 'Cardio'                              },
  { name: 'Stair Climber',              group: 'Cardio',     equipment: 'Machine'    },
  { name: 'Rowing Machine',             group: 'Cardio',     equipment: 'Machine'    },
  { name: 'Jump Rope',                  group: 'Cardio',     equipment: 'Bodyweight' },
  { name: 'Cycling',                    group: 'Cardio'                              },
  { name: 'Swimming',                   group: 'Cardio'                              },
  { name: 'Box Jump',                   group: 'Cardio',     equipment: 'Bodyweight' },
  { name: 'Burpee',                     group: 'Cardio',     equipment: 'Bodyweight' },
  { name: 'Assault Bike',               group: 'Cardio',     equipment: 'Machine'    },

  // ─── Full Body ────────────────────────────────────────────────────────────
  { name: 'Clean and Jerk',             group: 'Full Body',  equipment: 'Barbell'    },
  { name: 'Power Clean',                group: 'Full Body',  equipment: 'Barbell'    },
  { name: 'Snatch',                     group: 'Full Body',  equipment: 'Barbell'    },
  { name: 'Kettlebell Swing',           group: 'Full Body',  equipment: 'Kettlebell' },
  { name: 'Kettlebell Turkish Get-Up',  group: 'Full Body',  equipment: 'Kettlebell' },
  { name: 'Thruster',                   group: 'Full Body',  equipment: 'Barbell'    },
  { name: 'Farmer Carry',               group: 'Full Body',  equipment: 'Dumbbell'   },
  { name: 'Sled Push',                  group: 'Full Body'                           },
]

/** Search exercises by name (case-insensitive substring match) */
export function searchExercises(query: string, limit = 8): ExerciseEntry[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return EXERCISE_LIBRARY
    .filter(e => e.name.toLowerCase().includes(q))
    .slice(0, limit)
}

/** Get all exercises for a given muscle group */
export function getByGroup(group: ExerciseEntry['group']): ExerciseEntry[] {
  return EXERCISE_LIBRARY.filter(e => e.group === group)
}

/** All unique muscle groups */
export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body',
] as const
