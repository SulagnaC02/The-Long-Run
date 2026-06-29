# Firestore Database

## users

Stores basic user information.

Fields

- uid
- name
- email
- photoURL
- occupation
- timezone
- createdAt

---

## goals

Stores long-term goals.

Fields

- goalId
- title
- description
- priority
- deadline
- category
- progress

Example

Placement Preparation

CGPA 9+

German

Gym

---

## behavior_profile

Learns how the user works.

Fields

- bestFocusTime
- commuteTime
- transitionNeeded
- transitionRoutine
- averageFocusSession
- preferredBreakTime
- estimatedTaskAccuracy
- motivationStyle
- recoveryPattern
- sleepTime

---

## faculty_profiles

Stores context.

Fields

- subject

- professor

- strictness

- surpriseQuizzes

- assignmentDifficulty

- comments

---

## calendar_events

Imported from Google Calendar.

Fields

- title

- start

- end

- location

- source

---

## daily_plan

Generated every day.

Fields

- timeline

- reasoning

- meals

- breaks

- futureRelief

---

## daily_reflection

Fields

- satisfaction

- completedTasks

- skippedTasks

- energy

- reflection

- tomorrowSuggestion

---

## adaptive_life_model

This is the AI Memory.

Fields

- learnedPatterns

- productivityPatterns

- motivationPatterns

- energyPatterns

- planningMistakes

- successfulStrategies

- thingsToAvoid

- confidence