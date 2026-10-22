# Chantilly Science Olympiad — Team Portal

A team management portal for Science Olympiad coaches, captains, and competitors. Built with **React + Vite + Tailwind CSS** and **Firebase** (Authentication, Cloud Firestore, Hosting, optional Cloud Storage).

## Features

| Area | What it does |
| --- | --- |
| **Accounts & roles** | Email/password sign-in. Roles per team: **Coach**, **Captain**, **Student**, enforced by Firestore security rules. |
| **Teams** | Anyone can create a team (and becomes its coach). Students join with a 6-character code, or coaches/captains create accounts for them directly. |
| **Event Board** | Assign students to events, set team size, track status and progress. Assigned students can update their own event's progress. |
| **Resources** | Study guides, rules, notes, practice tests and links, filterable per event. Optional file uploads. |
| **Practice Scores** | Log test scores; per-event averages, trends, and charts. Students only see their own scores. |
| **Announcements** | Coaches/captains post (and pin) updates; everyone can reply. |
| **Calendar** | Tournaments, deadlines, practices in a month view, with `.ics` export and "Add to Google Calendar". |

Mobile-friendly throughout, so students can check their events on the go.

## Role permissions

| | Student | Captain | Coach |
| --- | :-: | :-: | :-: |
| View team, events, resources, announcements, calendar | ✅ | ✅ | ✅ |
| Update progress on own events | ✅ | ✅ | ✅ |
| Post resources, log own scores, reply to announcements | ✅ | ✅ | ✅ |
| See everyone's scores | | ✅ | ✅ |
| Create/assign events, post announcements, edit calendar | | ✅ | ✅ |
| Add members, change student ↔ captain | | ✅ | ✅ |
| Add/promote coaches, edit team name | | | ✅ |

## Setup

### 1. Create the Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode, any region).
4. **Project settings → Your apps → Web (`</>`)** → register an app and copy the config.

### 2. Configure locally
```bash
npm install
cp .env.example .env.local   # then paste your config values into .env.local
npm run dev
```

### 3. Deploy rules + hosting
```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick your project (updates .firebaserc)
npm run deploy                # builds, deploys Hosting + Firestore rules/indexes
```
Your site will be live at `https://<project-id>.web.app`.

> **Deploy the Firestore rules before using the app** — `npm run deploy` does this. Without them, Firestore's default rules will block every read and write.

### Optional: file uploads
Cloud Storage requires the Blaze (pay-as-you-go) plan on new projects. Without it, resources work as links (e.g. Google Drive) and text notes. To enable uploads:
1. Upgrade to Blaze and enable **Build → Storage**.
2. Set `VITE_ENABLE_STORAGE=true` in `.env.local`.
3. `npm run deploy:storage`, then `npm run deploy`.

## Data model (Firestore)

```
users/{uid}                         name, email, teamId
joinCodes/{code}                    teamId
teams/{teamId}                      name, school, joinCode, createdBy
  members/{uid}                     name, email, role
  events/{id}                       name, type, maxSize, assignees[], status, progress, notes
  resources/{id}                    title, type, eventId, url, body, fileUrl, authorUid
  scores/{id}                       eventId, studentUid, testName, score, maxScore, date
  announcements/{id}                title, body, pinned, authorUid, replyCount
    replies/{id}                    body, authorUid
  calendar/{id}                     title, type, date, endDate, location, notes
```

## Notes
- The portal ships with no sample data: events, members, scores and posts all start empty.
- When a coach adds a member, the app creates their account with a temporary password and emails them a password-reset link (sent from Firebase Auth's default email template).
