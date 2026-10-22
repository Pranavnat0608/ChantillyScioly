# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Chantilly High School's Science Olympiad team, used evenly by two groups:
- **Students** (competitors, some of them captains) on phones, checking their assigned events, study resources, announcements, and upcoming dates between classes or at practice.
- **Coaches and captains** on laptops, building the roster, assigning students to events, logging practice scores, and posting team updates.

## Product Purpose
One place for the team to coordinate who competes in which event, what to study, and when tournaments and deadlines are, so nothing lives across scattered group chats, drives, and spreadsheets. Success: every student knows their events and what to prepare; coaches can see staffing gaps and progress at a glance.

## Positioning
Built for one specific team's Science Olympiad season: the unit of work is the *event* (Div C events with 2–3 person teams, build/study/lab types), not a generic task or project.

## Operating Context
- Season rhythm: invitationals, regionals, states; registration deadlines; practice tests per event.
- Roles: Coach, Captain, Student, with permissions enforced by Firestore security rules.
- Students join with a 6-character team code, or a coach creates their account.

## Capabilities and Constraints
- React + Vite + Tailwind, Firebase Auth, Firestore, and Hosting. Cloud Storage uploads are optional (Blaze plan); otherwise resources are links and notes.
- Features: roster and roles, event board with assignments and progress, resources per event, practice score tracking with charts, announcements with replies, calendar with .ics and Google Calendar export.

## Brand Commitments
- The Chantilly Chargers logo (purple "C" with a jousting knight), at `public/logo.png`.
- Chantilly purple as the main color.
- Product name as written: "Chantilly Science Olympiad".

## Evidence on Hand
- The logo only. There is no real roster, event lineup, scores, or photos in the project.
- Never ship invented people, events, scores, or announcements. Every list starts empty until the team fills it.

## Product Principles
- The event is the unit: everything (people, resources, scores) hangs off an event.
- A student on a phone finds their events and next date in seconds.
- Staff see gaps (unstaffed events, unassigned members) without hunting.
- Empty means empty: no placeholder data that looks real.
