# Agorai: AI-powered Hiring Automation Platform

## Platform Overview

Agorai is an AI-powered hiring automation platform that streamlines the recruitment process by connecting recruiters with qualified job seekers through intelligent resume parsing, ranking, and AI-driven video interviews.

## User Roles

### 1. Recruiter
- Upload and manage job postings
- Review ranked candidates
- Access AI-generated interview evaluations
- Make hiring decisions based on comprehensive candidate profiles

### 2. Job Seeker
- Apply to jobs with resume upload
- Participate in AI-driven video interviews
- Track application status
- Access interview feedback

---

## Core Features

### 1. Resume Parsing
**Flow:**
- Job seeker uploads resume (PDF/DOCX)
- System extracts structured data (skills, experience, education, certifications)
- Parsed data saved to database for reuse
- Future applications: job seeker can select existing parsed resume or upload new one

**Key Benefits:**
- One-time parsing per resume version
- Faster application process
- Consistent data extraction

### 2. Resume Ranking
**Flow:**
- System analyzes job requirements against candidate resumes
- AI scores candidates based on:
  - Skills match
  - Experience relevance
  - Education alignment
  - Keyword matching
- Recruiters see ranked list of applicants

### 3. AI Video Interviewer
**Flow:**
1. Job seeker clicks "Interview Now"
2. AI generates 3 custom questions based on:
   - Job seeker's resume
   - Job requirements and description
3. Interview session begins:
   - Job seeker clicks "Start Interview"
   - Recording starts automatically
   - AI reads Question 1 (text-to-speech) and displays on screen
   - Job seeker answers verbally
   - Job seeker clicks "Next Question"
   - Repeat for Questions 2 and 3
4. Post-interview processing:
   - AI transcribes all answers (speech-to-text)
   - AI generates evaluation summary
   - AI scores candidate based on:
     - Resume qualifications
     - Interview responses
     - Job requirements alignment

---

## Database Architecture Analysis

### Current Schema Overview
Based on the provided ERD, the current schema includes:
- **User Management:** `user`, `account`, `personal_info`, `contact`
- **Company & Jobs:** `company`, `team`, `job`
- **Resume:** `resume` (basic table)
- **Interview System:** `interview`, `question`, `response`, `summary`

### ⚠️ Critical Missing Components

#### 1. **Job Application Tracking**
**Issue:** No table to track which job seekers applied to which jobs

**Needed:**
```
job_application
├── application_id (PK)
├── job_id (FK → job)
├── user_id (FK → user)
├── resume_id (FK → resume)
├── status (applied, interview_scheduled, interviewed, rejected, hired)
├── ranking_score (AI-generated match score)
├── applied_at
└── updated_at
```

#### 2. **Parsed Resume Data**
**Issue:** Current `resume` table only stores file_name and file_path, no structured parsed data

**Needed:**
```
resume_skills
├── skill_id (PK)
├── resume_id (FK → resume)
├── skill_name
├── proficiency_level
└── years_experience

resume_experience
├── experience_id (PK)
├── resume_id (FK → resume)
├── company_name
├── position_title
├── start_date
├── end_date
├── description
└── is_current

resume_education
├── education_id (PK)
├── resume_id (FK → resume)
├── institution_name
├── degree
├── field_of_study
├── graduation_date
└── gpa

resume_certifications
├── certification_id (PK)
├── resume_id (FK → resume)
├── certification_name
├── issuing_organization
├── issue_date
└── expiration_date
```

#### 3. **Interview Recording & Transcription**
**Issue:** No fields to store video recordings, audio transcriptions, or AI analysis

**Needed:** Update `interview` table:
```
interview (updated)
├── interview_id (PK)
├── application_id (FK → job_application)
├── user_id (FK → user)
├── job_id (FK → job)
├── interview_type (ai_video, manual)
├── interview_status (scheduled, in_progress, completed, cancelled)
├── recording_url (video file path/URL)
├── transcription_text (full interview transcript)
├── created_timestamp
├── started_at
├── completed_at
└── ends_timestamp

question (updated)
├── question_id (PK)
├── interview_id (FK → interview)
├── question_text
├── question_order (1, 2, 3)
├── ai_generated (boolean)
└── question_type (technical, behavioral, situational)

response (updated)
├── response_id (PK)
├── question_id (FK → question)
├── user_id (FK → user)
├── response_content (transcribed text)
├── response_audio_url (audio file)
├── response_timestamp
└── response_duration_seconds
```

#### 4. **AI Evaluation & Scoring**
**Issue:** No structured storage for AI-generated evaluations and rankings

**Needed:**
```
ai_evaluation
├── evaluation_id (PK)
├── application_id (FK → job_application)
├── interview_id (FK → interview)
├── overall_score (0-100)
├── resume_match_score (0-100)
├── interview_performance_score (0-100)
├── skills_assessment_score (0-100)
├── recommendation (strongly_recommend, recommend, neutral, not_recommend)
├── strengths (JSON array)
├── weaknesses (JSON array)
├── detailed_feedback (text)
└── created_at

resume_ranking
├── ranking_id (PK)
├── job_id (FK → job)
├── resume_id (FK → resume)
├── user_id (FK → user)
├── matching_score (0-100)
├── skills_match_percentage
├── experience_match_percentage
├── education_match_percentage
├── ranking_position (1, 2, 3...)
└── generated_at
```

#### 5. **User Role Management**
**Issue:** No clear distinction between recruiter and job seeker roles

**Needed:** Update `user` table:
```
user (updated)
├── user_id (PK)
├── account_id (FK → account)
├── username
├── email
├── password
├── user_role (job_seeker, recruiter, admin)
├── status (active, inactive, suspended)
├── created_at
└── updated_at
```

#### 6. **Job Requirements Structure**
**Issue:** `job` table needs detailed fields for AI matching

**Needed:** Update `job` table:
```
job (updated)
├── job_id (PK)
├── company_info_id (FK → company)
├── job_type
├── title
├── description
├── requirements (JSON: skills, experience, education)
├── required_skills (JSON array)
├── preferred_skills (JSON array)
├── min_experience_years
├── max_experience_years
├── education_level_required
├── salary_range
├── location
├── remote_option (boolean)
├── position_title
├── experience_required
├── salary_range
├── job_description
├── skills_required (JSON array)
├── status (open, closed, draft, on_hold)
├── created_at
├── updated_at
└── closes_at
```

---

## Additional Recommendations

### 1. **Notifications System**
Add a notifications table to track:
- Application status updates
- Interview invitations
- Interview results
- New job matches (for job seekers)

### 2. **File Storage Strategy**
Define clear paths for:
- Resume files (PDF/DOCX)
- Interview video recordings
- Interview audio segments
- Profile pictures

Recommendation: Use cloud storage (S3, Azure Blob, Supabase Storage)

### 3. **AI Service Integration**
Document required AI services:
- **Resume Parsing:** OpenAI GPT-4, Amazon Textract, or Affinda
- **Text-to-Speech:** ElevenLabs, Google TTS, OpenAI TTS
- **Speech-to-Text:** OpenAI Whisper, Google Speech-to-Text
- **Evaluation Engine:** OpenAI GPT-4, Claude
- **Ranking Algorithm:** Custom ML model or GPT-4

### 4. **Privacy & Compliance**
Consider adding fields for:
- User consent for data processing
- GDPR/privacy compliance flags
- Data retention policies
- Audit logs for sensitive operations

### 5. **Performance Optimization**
Add indexes for:
- `job_application.user_id` and `job_application.job_id`
- `resume_skills.resume_id`
- `interview.user_id` and `interview.job_id`
- `ai_evaluation.application_id`

---

## Implementation Checklist

### Phase 1: Database Schema
- [ ] Create missing tables (job_application, resume_skills, resume_experience, etc.)
- [ ] Update existing tables with new fields
- [ ] Add proper foreign key constraints
- [ ] Create database indexes for performance
- [ ] Set up database migrations with Prisma

### Phase 2: Resume Parsing
- [ ] Integrate AI parsing service (OpenAI/Textract)
- [ ] Build resume upload and storage system
- [ ] Create parsing pipeline to extract structured data
- [ ] Store parsed data in resume_* tables
- [ ] Build resume selection UI for job applications

### Phase 3: Job Application & Ranking
- [ ] Create job application submission flow
- [ ] Implement AI ranking algorithm
- [ ] Build recruiter dashboard to view ranked candidates
- [ ] Add filtering and sorting capabilities

### Phase 4: AI Video Interview
- [ ] Build interview question generation (GPT-4)
- [ ] Implement TTS for question reading
- [ ] Create video recording interface
- [ ] Set up cloud storage for recordings
- [ ] Implement STT for transcription (Whisper)
- [ ] Build AI evaluation engine
- [ ] Create interview results dashboard

### Phase 5: UI/UX
- [ ] Job seeker dashboard and application flow
- [ ] Recruiter dashboard and candidate review
- [ ] Interview interface design
- [ ] Notification system
- [ ] Mobile responsiveness

### Phase 6: Testing & Deployment
- [ ] Unit tests for API endpoints
- [ ] Integration tests for AI workflows
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Production deployment

---

## Technology Stack Recommendations

### Backend
- **Framework:** Next.js 14+ (App Router with Server Actions)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js or Supabase Auth
- **File Storage:** Supabase Storage or AWS S3

### AI Services
- **Resume Parsing:** OpenAI GPT-4 or Document Intelligence API
- **TTS:** ElevenLabs or OpenAI TTS
- **STT:** OpenAI Whisper API
- **Evaluation:** OpenAI GPT-4 or Claude

### Frontend
- **Framework:** Next.js 14+ with React
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** React Context or Zustand
- **Video Recording:** MediaRecorder API or third-party library

---

## Next Steps Before Coding

1. ✅ **Review this document** - Ensure all requirements are captured
2. ⚠️ **Finalize database schema** - Get approval on all tables and relationships
3. ⚠️ **Choose AI service providers** - Determine which APIs to use for each feature
4. ⚠️ **Define API structure** - Plan Server Actions and API routes
5. ⚠️ **Create wireframes** - Design user flows for job seeker and recruiter
6. ⚠️ **Set up development environment** - Supabase project, API keys, etc.
7. ⚠️ **Write Prisma schema** - Translate this analysis into actual schema.prisma
8. ⚠️ **Plan authentication** - User registration, login, role-based access

**Once these are complete, development can begin.**
