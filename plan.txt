Last Minute Lifesaver
AI-Powered Autonomous Productivity Companion
Core Vision

This is not another reminder app.

Existing apps remind users to do work.

Our app actively helps users finish work.

The AI continuously monitors deadlines, predicts risks, creates plans, performs actions, and rescues users before deadlines are missed.

Think of it as an AI Chief of Staff rather than a calendar.

Tech Stack
Frontend
Next.js (App Router)
TailwindCSS
shadcn/ui
Framer Motion
Google Authentication
Backend

Python FastAPI

Reason:

Gemini SDK
AI agents
Better scheduling logic
Easy async support
Database

Postgres

Tables:

Users
Tasks
Calendar Events
AI Sessions
Deadlines
Notifications
Habits
Workspace Connections
AI Memory
AI

Gemini 2.5 Flash

Use Function Calling extensively.

Gemini should never only generate text.

It should call tools.

Example tools:

Create Google Task

Update Calendar

Draft Gmail

Create Google Slides

Create Google Docs

Read Gmail

Read Calendar

Read Drive

Read PDF

Get Maps Traffic

Send Notification

Start Focus Mode

Create Checklist

Summarize Meeting

Gemini acts as the orchestrator.

Integrations

Google Calendar

Google Gmail

Google Tasks

Google Drive

Google Docs

Google Slides

Google Meet

Google Maps

Google OAuth

Backend Architecture
Frontend

↓

API Gateway

↓

Authentication

↓

Agent Orchestrator (Gemini)

↓

Tool Layer

↓

Google APIs
Database
Notification Service
Agent Architecture
1. Screener Agent

Runs continuously.

Responsibilities

Read Gmail
Read Calendar
Detect deadlines
Detect meetings
Detect assignments
Detect bills
Detect interviews
Detect exams
Detect attached PDFs

Outputs

New Tasks

Priority Scores

Deadlines

2. Triage Agent

Runs every few minutes.

Responsibilities

Recalculate priorities.

Detect if user is falling behind.

Estimate completion probability.

Reschedule today's tasks.

Move low priority tasks.

Insert micro tasks.

3. Executor Agent

Actually performs work.

Can

Create Docs

Create Slides

Draft emails

Create checklists

Generate project outlines

Generate study plans

Generate presentation skeletons

Prepare meeting notes

4. Guardian Agent

Monitors execution.

Responsibilities

Track progress.

Detect inactivity.

Detect procrastination.

Launch Focus Mode.

Suggest Panic Mode.

Restore backups.

Protect deadlines.

5. Memory Agent

Learns user behavior.

Examples

User writes fastest at night.

User procrastinates after lunch.

User likes coding in mornings.

Professor prefers APA format.

Manager prefers emails.

Future schedules improve automatically.

Screens
1. Login

Google OAuth

Permissions requested

Calendar

Gmail

Tasks

Drive

Docs

Maps

2. Dashboard

Main screen.

Shows

Threat Level

Today's Tasks

AI Recommendations

Current Focus

Completion %

Upcoming Deadlines

Burnout Indicator

Timeline

Example

Threat Level

🟢 Safe

🟡 Busy

🟠 High Risk

🔴 Critical

⚫ Impossible
3. AI Command Center

Chat with Gemini.

Examples

"I can't finish my assignment."

"Move my meetings."

"Help me study."

"I have only 2 hours."

"Create my slides."

Uses Function Calling.

4. Calendar

Enhanced Calendar.

Shows

Meetings

Deadlines

Micro Tasks

Travel Time

Buffers

AI Suggested Changes

Buttons

Accept Schedule

Reject

Regenerate

5. Tasks

Each task contains

Title

Deadline

Priority

Estimated Time

Current Progress

Completion Prediction

Risk Score

Dependencies

Subtasks

6. Deadline Center

Shows

Upcoming deadlines.

Risk prediction.

Example

Assignment

Due

Tomorrow

Completion Chance

27%

Suggested Actions

Create outline

Cancel gym

Focus Mode

Draft extension email
7. Panic Mode

Emergency screen.

Activated manually or automatically.

Actions

Pause notifications

Reorder schedule

Cancel low priority tasks

Start timer

Generate checklist

Generate first draft

Open required files

One tap.

8. Focus Mode

Minimal interface.

Shows

Current task

Timer

Progress

Checklist

Blocks distractions.

Auto replies optional.

9. AI Workspace

Generated content.

Contains

Draft emails

Generated Docs

Slides

Study plans

Meeting summaries

Notes

10. Analytics

Shows

Clutch Score

Weekly productivity

Deadline survival

Burnout

Completion %

Focus hours

Features
Intelligent Task Prioritization

Every task gets

Importance

Urgency

Effort

Risk

Context

AI constantly recalculates.

Reverse Planning

Deadline

↓

Milestones

↓

Tasks

↓

Micro Tasks

↓

Calendar

Automatically generated.

Micro Task Fragmentation

Large task

↓

15-minute pieces.

Example

Research Paper

↓

Read rubric

↓

Find source

↓

Write intro

↓

Write methods

↓

Add citations

↓

Proofread

Dynamic Slotting

Find empty calendar gaps.

Insert micro tasks automatically.

Even

20 minutes before class.

Airport waiting.

Train commute.

Lunch break.

Deadline Prediction

AI predicts

Chance of success.

Shows

Finish Probability

91%

or

31%

High Risk

Ghostwriter

If deadline likely missed

Generate

Extension email

Manager email

Client email

Professor email

Places in Gmail Drafts.

One Click Starter

Blank page syndrome.

AI

Reads prompt.

Creates

Slides

Docs

Outline

Checklist

First content.

Meeting Intelligence

After Google Meet

Generate

Summary

Action Items

Owners

Follow ups

Calendar tasks.

Attachment Intelligence

Every PDF

Every assignment

Every document

AI extracts

Deadline

Rubric

Sections

Keywords

Estimated workload

Creates tasks automatically.

Opportunity Detector

AI detects

Hackathons

Scholarships

Competitions

Bills

Events

Registration deadlines

Suggests participation.

Traffic Buffer

Uses Google Maps.

Adjusts departure time.

Reschedules work.

Visual Progress

Monitor

Google Docs

Slides

GitHub

Drive

Detect real progress automatically.

Focus Mode

Minimal UI.

Mute distractions.

Optional

Auto reply

Emergency Mode

Panic Mode

Emergency optimization.

Cancel events.

Create work plan.

Generate first draft.

Open required files.

Timer.

Checklist.

Deadline Insurance

Automatic backups.

Drive versions.

Offline copy.

PDF export.

Restore previous versions.

Memory Graph

Learns

Preferred work hours

Writing speed

Coding speed

Editing speed

Reading speed

Preferred apps

Meeting preferences

Formatting preferences

Improves future schedules.

AI Critic

Before submission

Reviews

Presentation

Assignment

Resume

Report

Suggests improvements.

Geo Productivity

Location aware.

Walking

Flashcards.

Airport

Reply emails.

Bus

Watch lecture.

Clutch Score

Gamification.

Earn points for

Saving deadlines.

Completing difficult tasks.

Maintaining focus.

Avoiding procrastination.

Accountability Partner

Optional.

Repeated snoozes

↓

Notify accountability buddy.

Sleep Optimizer

Suggest

Sleep schedule.

Naps.

Balanced productivity.

Background Jobs

Every 5 minutes

Run Screener Agent.

Every 10 minutes

Run Triage Agent.

On Gmail webhook

Parse incoming mail.

On Calendar changes

Recalculate schedule.

Every completed meeting

Generate summary.

Nightly

Update Memory Graph.

Predict tomorrow.

Typical Flow
Email arrives

↓

Assignment PDF attached

↓

Screener reads PDF

↓

Deadline extracted

↓

Reverse Planner creates milestones

↓

Micro tasks created

↓

Calendar updated

↓

Risk prediction

↓

Executor creates outline

↓

Slides created

↓

Guardian monitors progress

↓

User falls behind

↓

Panic Mode

↓

Ghostwriter drafts extension

↓

Deadline saved
Folder Structure
frontend/
    app/
    components/
    hooks/
    services/
    lib/
    types/

backend/
    api/
    agents/
        screener/
        triage/
        executor/
        guardian/
        memory/
    tools/
        gmail/
        calendar/
        docs/
        slides/
        maps/
        tasks/
    scheduler/
    database/
    models/
    services/
    prompts/
MVP (Hackathon Scope)

To keep the project achievable in a hackathon while still showcasing strong AI capabilities, prioritize these features:

Must Have
Google OAuth
Google Calendar integration
Gmail integration
Gemini function calling
AI chat interface
Dashboard with Threat Level
Screener Agent (detect deadlines from emails/calendar)
Reverse Planning + Micro-task generation
Dynamic scheduling into calendar
Ghostwriter (extension emails to Gmail Drafts)
One-Click Starter (Google Docs/Slides skeleton generation)
Panic Mode
Focus Mode (UI-based)
Risk prediction dashboard
Nice to Have
Google Meet summaries
Google Maps traffic buffer
Clutch Score
Memory Agent
Attachment intelligence
Accountability partner
Visual progress tracking
AI critic
Opportunity detector