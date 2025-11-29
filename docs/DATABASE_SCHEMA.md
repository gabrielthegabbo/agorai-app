# Agorai Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Agorai AI-powered Hiring Automation Platform database schema. The schema is designed to support resume parsing, AI-driven candidate ranking, automated video interviews, and intelligent evaluation systems.

**Database:** PostgreSQL (via Supabase)  
**ORM:** Prisma  
**Total Tables:** 21 models  
**Schema Version:** 1.0.0  
**Last Updated:** 2025-11-29

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Domain Models](#domain-models)
   - [User Management](#user-management)
   - [Jobs & Companies](#jobs--companies)
   - [Job Applications](#job-applications)
   - [Resume System](#resume-system)
   - [Interview System](#interview-system)
   - [AI Evaluation](#ai-evaluation)
   - [Supporting Systems](#supporting-systems)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Data Dictionary](#data-dictionary)
5. [Indexes & Performance](#indexes--performance)
6. [Migration Guide](#migration-guide)

---

## Database Architecture

The Agorai database is organized into **7 primary domains**:

```mermaid
graph TB
    A[User Management] --> B[Job Applications]
    C[Jobs & Companies] --> B
    D[Resume System] --> B
    B --> E[Interview System]
    B --> F[AI Evaluation]
    E --> F
    G[Supporting Systems] -.-> A
    G -.-> B
    G -.-> E
```

### Design Principles

- **Modular Domain Structure**: Each domain is self-contained with clear boundaries
- **AI-First Architecture**: Built-in support for AI parsing, ranking, and evaluation
- **Audit Trail**: Comprehensive tracking of all critical operations
- **Scalability**: Proper indexing and relationship design for growth
- **Data Integrity**: Foreign key constraints and cascading deletes
- **Privacy-Ready**: Structure supports GDPR/compliance requirements

---

## Domain Models

### User Management

Handles user authentication, profiles, and role-based access control.

#### Models:
- **User** - Core user account with role-based access
- **Account** - OAuth and authentication provider information
- **PersonalInfo** - Personal details and demographics
- **Contact** - Contact information and social links

#### User Roles:
- `JOB_SEEKER` - Candidates applying for positions
- `RECRUITER` - Hiring managers posting jobs
- `ADMIN` - Platform administrators

#### Key Features:
- ✅ Multi-provider OAuth support (Google, GitHub, LinkedIn)
- ✅ Role-based access control
- ✅ User status management (active, inactive, suspended)
- ✅ Separation of personal and contact information

---

### Jobs & Companies

Manages employer organizations, teams, and job postings with AI-optimized fields.

#### Models:
- **Company** - Employer organization profiles
- **Team** - Hiring teams within companies
- **Job** - Job postings with structured requirements

#### Job Types:
- `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `FREELANCE`

#### Job Status:
- `DRAFT` - Not yet published
- `OPEN` - Actively accepting applications
- `CLOSED` - No longer accepting applications
- `ON_HOLD` - Temporarily paused

#### AI-Optimized Fields:
- `requiredSkills` (JSON) - Array of must-have skills
- `preferredSkills` (JSON) - Nice-to-have skills
- `requirements` (JSON) - Structured requirements for AI parsing
- Experience range (min/max years)
- Education level requirements
- Salary ranges

---

### Job Applications

**Critical New Table** - Tracks all job applications and candidate rankings.

#### Model: JobApplication

Central hub connecting users, jobs, and resumes.

#### Application Status Flow:
```
APPLIED → UNDER_REVIEW → INTERVIEW_SCHEDULED → INTERVIEWED → OFFER_EXTENDED → ACCEPTED
                                     ↓
                               REJECTED / WITHDRAWN
```

#### Key Fields:
- `rankingScore` - AI-generated match score (0-100)
- `coverLetter` - Optional cover letter text
- `appliedAt` - Application timestamp
- Unique constraint: One application per user per job

#### Relations:
- Links to Job, User, and Resume
- Parent to Interview and AIEvaluation records

---

### Resume System

**Enhanced Multi-Table Design** - Stores both raw files and structured parsed data.

#### Models:
- **Resume** - Base resume file and metadata
- **ResumeSkill** - Extracted skills with proficiency levels
- **ResumeExperience** - Work history entries
- **ResumeEducation** - Educational background
- **ResumeCertification** - Professional certifications
- **ResumeRanking** - AI-generated job match scores

#### Resume Parsing Flow:

```mermaid
sequenceDiagram
    participant U as User
    participant S as System
    participant AI as AI Parser
    participant DB as Database

    U->>S: Upload Resume (PDF/DOCX)
    S->>AI: Send file for parsing
    AI->>AI: Extract structured data
    AI->>S: Return parsed data
    S->>DB: Save to Resume table
    S->>DB: Save to ResumeSkill
    S->>DB: Save to ResumeExperience
    S->>DB: Save to ResumeEducation
    S->>DB: Save to ResumeCertification
    S->>DB: Mark isParsed = true
```

#### Key Features:
- ✅ **One-time parsing** - Reuse parsed data for multiple applications
- ✅ **Structured storage** - Easy querying and AI matching
- ✅ **Version tracking** - Multiple resumes per user
- ✅ **Proficiency levels** - Skill expertise tracking
- ✅ **Experience timeline** - Start/end dates with current job flag

---

### Interview System

Supports AI-driven video interviews with recording and transcription.

#### Models:
- **Interview** - Interview session metadata
- **Question** - Individual interview questions
- **Response** - Job seeker answers (text + audio)
- **InterviewSummary** - AI-generated summary

#### Interview Types:
- `AI_VIDEO` - Automated AI interviewer (primary use case)
- `MANUAL_VIDEO` - Human-conducted video interview
- `PHONE` - Phone screening
- `IN_PERSON` - On-site interview

#### Interview Status Flow:
```
SCHEDULED → IN_PROGRESS → COMPLETED
                ↓
         CANCELLED / NO_SHOW
```

#### AI Video Interview Flow:

```mermaid
sequenceDiagram
    participant JS as Job Seeker
    participant UI as Interview UI
    participant AI as AI Engine
    participant DB as Database

    JS->>UI: Click "Interview Now"
    UI->>AI: Request questions (resume + job details)
    AI->>AI: Generate 3 custom questions
    AI->>DB: Save questions
    
    loop For each question (1-3)
        UI->>JS: Display question + AI reads (TTS)
        JS->>UI: Record video answer
        UI->>DB: Save response + audio URL
        UI->>AI: Transcribe audio (STT)
        AI->>DB: Save transcription
    end
    
    AI->>AI: Analyze responses + resume
    AI->>DB: Save InterviewSummary
    AI->>DB: Save AIEvaluation
```

#### Key Fields:

**Interview:**
- `recordingUrl` - Full video file path/URL
- `transcriptionText` - Complete interview transcript
- Timestamps: scheduled, started, completed

**Question:**
- `questionOrder` - Sequence (1, 2, 3)
- `questionType` - Technical, Behavioral, Situational
- `isAiGenerated` - Tracks AI vs manual questions

**Response:**
- `responseText` - Transcribed answer
- `responseAudioUrl` - Audio file reference
- `responseDurationSeconds` - Answer length

---

### AI Evaluation

**Critical New Domain** - Stores AI-generated candidate assessments.

#### Model: AIEvaluation

Comprehensive candidate scoring and recommendation engine.

#### Scoring Metrics (0-100):
- `overallScore` - Combined assessment score
- `resumeMatchScore` - How well resume matches job
- `interviewPerformanceScore` - Interview quality
- `skillsAssessmentScore` - Technical skills evaluation

#### Recommendation Types:
- `STRONGLY_RECOMMEND` - Top candidate
- `RECOMMEND` - Good fit
- `NEUTRAL` - Average candidate
- `NOT_RECOMMEND` - Below requirements
- `STRONGLY_NOT_RECOMMEND` - Poor fit

#### Analysis Fields:
- `strengths` (JSON) - Array of candidate strengths
- `weaknesses` (JSON) - Areas for improvement
- `detailedFeedback` - Comprehensive written evaluation
- `modelUsed` - AI model identifier (e.g., "gpt-4")

#### Evaluation Sources:
1. Resume qualifications vs job requirements
2. Interview performance and responses
3. Skills match percentage
4. Experience relevance

---

### Supporting Systems

#### Notifications

Real-time updates for users.

**Types:**
- `APPLICATION_STATUS` - Application updates
- `INTERVIEW_INVITATION` - Interview scheduling
- `INTERVIEW_REMINDER` - Upcoming interview alerts
- `INTERVIEW_RESULT` - Post-interview feedback
- `NEW_JOB_MATCH` - Recommended jobs for candidates
- `MESSAGE` - Direct messages
- `SYSTEM` - Platform announcements

**Statuses:** `UNREAD`, `READ`, `ARCHIVED`

#### Audit Log

Compliance and security tracking.

**Tracked Actions:**
- User authentication events
- Job creation/modification
- Application submissions
- Interview completions
- Data access and modifications

**Logged Data:**
- User ID and action type
- Entity type and ID
- Old/new values (JSON)
- IP address and user agent
- Timestamp

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Account : has
    User ||--o| PersonalInfo : has
    User ||--o| Contact : has
    User ||--o{ Resume : uploads
    User ||--o{ JobApplication : submits
    User ||--|| Company : "recruiter manages"
    User }o--o{ Team : "member of"
    
    Company ||--o{ Team : has
    Company ||--o{ Job : posts
    
    Job ||--o{ JobApplication : receives
    Job ||--o{ Interview : requires
    Job ||--o{ ResumeRanking : generates
    Job }o--|| User : "posted by recruiter"
    
    Resume ||--o{ ResumeSkill : contains
    Resume ||--o{ ResumeExperience : contains
    Resume ||--o{ ResumeEducation : contains
    Resume ||--o{ ResumeCertification : contains
    Resume ||--o{ JobApplication : "used in"
    Resume ||--o{ ResumeRanking : "ranked in"
    
    JobApplication ||--o{ Interview : triggers
    JobApplication ||--o{ AIEvaluation : evaluated
    JobApplication }o--|| Resume : uses
    JobApplication }o--|| Job : "applies to"
    JobApplication }o--|| User : "submitted by"
    
    Interview ||--o{ Question : contains
    Interview ||--o{ Response : records
    Interview ||--o| InterviewSummary : generates
    Interview ||--o{ AIEvaluation : evaluated
    
    Question ||--o{ Response : answered
```

---

## Data Dictionary

### Critical Tables Detailed

#### JobApplication
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| jobId | UUID | FK → jobs.id | Job being applied to |
| userId | UUID | FK → users.id | Applicant |
| resumeId | UUID | FK → resumes.id | Resume used |
| status | Enum | NOT NULL | Current application status |
| rankingScore | Decimal(5,2) | 0-100 | AI match score |
| coverLetter | Text | NULLABLE | Optional cover letter |
| appliedAt | Timestamp | DEFAULT now() | Application submit time |
| updatedAt | Timestamp | AUTO | Last update time |

**Unique Constraint:** `(jobId, userId)` - One application per user per job

**Indexes:**
- `userId` - Fast user application lookup
- `jobId` - Fast job applicant lookup
- `status` - Status filtering

---

#### Resume
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → users.id | Resume owner |
| title | String | NOT NULL | Resume title/version |
| fileName | String | NOT NULL | Original filename |
| filePath | String | NOT NULL | Storage path/URL |
| isParsed | Boolean | DEFAULT false | Parsing status |
| parsedAt | Timestamp | NULLABLE | When parsed |
| uploadedAt | Timestamp | DEFAULT now() | Upload time |

**Related Tables:**
- `ResumeSkill` - 1:Many
- `ResumeExperience` - 1:Many
- `ResumeEducation` - 1:Many
- `ResumeCertification` - 1:Many

---

#### Interview
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| applicationId | UUID | FK → job_applications.id | Related application |
| userId | UUID | FK → users.id | Interviewee |
| jobId | UUID | FK → jobs.id | Job position |
| interviewType | Enum | DEFAULT AI_VIDEO | Interview format |
| interviewStatus | Enum | DEFAULT SCHEDULED | Current status |
| recordingUrl | String | NULLABLE | Video file URL |
| transcriptionText | Text | NULLABLE | Full transcript |
| startedAt | Timestamp | NULLABLE | Interview start |
| completedAt | Timestamp | NULLABLE | Interview end |

**Critical Fields for AI Interview:**
- `recordingUrl` - Store video file
- `transcriptionText` - Store AI-transcribed text
- `interviewStatus` - Track progress

---

#### AIEvaluation
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| applicationId | UUID | FK → job_applications.id | Evaluated application |
| interviewId | UUID | FK → interviews.id (NULLABLE) | Related interview |
| overallScore | Decimal(5,2) | 0-100 | Combined score |
| resumeMatchScore | Decimal(5,2) | 0-100 | Resume vs job match |
| interviewPerformanceScore | Decimal(5,2) | 0-100 (NULLABLE) | Interview quality |
| skillsAssessmentScore | Decimal(5,2) | 0-100 (NULLABLE) | Skills evaluation |
| recommendation | Enum | NOT NULL | Hiring recommendation |
| strengths | JSON | NULLABLE | Array of strengths |
| weaknesses | JSON | NULLABLE | Array of weaknesses |
| detailedFeedback | Text | NULLABLE | Full evaluation text |
| modelUsed | String | NULLABLE | AI model identifier |
| createdAt | Timestamp | DEFAULT now() | Evaluation time |

**Evaluation Trigger Points:**
1. After resume upload → Resume match score
2. After interview completion → Full evaluation with interview score

---

## Indexes & Performance

### Primary Indexes

**High-Traffic Queries:**
```sql
-- Job Applications
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Interviews
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(interview_status);

-- Resumes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resume_skills_resume_id ON resume_skills(resume_id);

-- AI Evaluations
CREATE INDEX idx_ai_evaluations_application_id ON ai_evaluations(application_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Query Optimization Tips

1. **Fetching Candidate Rankings:**
   ```prisma
   // Efficient query with indexes
   const rankedCandidates = await prisma.jobApplication.findMany({
     where: { jobId: jobId, status: 'UNDER_REVIEW' },
     orderBy: { rankingScore: 'desc' },
     include: { user: true, resume: true }
   });
   ```

2. **User Interview History:**
   ```prisma
   const interviews = await prisma.interview.findMany({
     where: { userId: userId },
     include: { questions: true, responses: true, summary: true },
     orderBy: { createdAt: 'desc' }
   });
   ```

---

## Migration Guide

### Initial Setup

1. **Install Dependencies:**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Configure Environment:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/agorai?schema=public"
   ```

3. **Generate Initial Migration:**
   ```bash
   npx prisma migrate dev --name init_agorai_schema
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Migration from Current Schema

If you have existing User/Post tables:

1. **Create Migration:**
   ```bash
   npx prisma migrate dev --name add_agorai_tables
   ```

2. **Data Migration Steps:**
   - Backup existing data
   - Update User model (add role, status fields)
   - Create new tables
   - Migrate existing users to new schema
   - Set default role = JOB_SEEKER for existing users

3. **Rollback Plan:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

### Seeding Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample recruiter
  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@agorai.com',
      username: 'recruiter1',
      password: 'hashed_password', // Use proper hashing!
      role: UserRole.RECRUITER,
      personalInfo: {
        create: {
          firstName: 'Jane',
          lastName: 'Recruiter',
          city: 'San Francisco',
          country: 'USA'
        }
      }
    }
  });

  // Create sample company
  const company = await prisma.company.create({
    data: {
      companyName: 'Tech Innovators Inc.',
      industry: 'Technology',
      location: 'San Francisco, CA',
      accountId: recruiter.id
    }
  });

  // Create sample job
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      recruiterId: recruiter.id,
      title: 'Senior Software Engineer',
      description: 'Looking for experienced backend engineer...',
      jobType: 'FULL_TIME',
      status: JobStatus.OPEN,
      requiredSkills: ['JavaScript', 'Node.js', 'PostgreSQL'],
      minExperienceYears: 5,
      salaryMin: 120000,
      salaryMax: 180000
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

---

## Best Practices

### Data Validation

1. **Resume Parsing:**
   - Validate file types (PDF, DOCX)
   - Max file size: 5MB
   - Sanitize extracted text
   - Handle parsing failures gracefully

2. **Job Applications:**
   - Enforce unique constraint
   - Validate resume belongs to user
   - Check job is still open

3. **Interviews:**
   - Verify application exists
   - Validate user permissions
   - Check interview status before allowing responses

### Security Considerations

1. **File Storage:**
   - Store files outside web root
   - Use signed URLs for access
   - Implement virus scanning
   - Encrypt sensitive files

2. **AI Data:**
   - Sanitize input to AI models
   - Don't expose raw AI prompts
   - Validate AI responses
   - Rate limit AI requests

3. **Privacy:**
   - GDPR right to deletion (cascading deletes)
   - Audit log for data access
   - Anonymize data for analytics
   - Secure API endpoints

### Performance Tips

1. **Eager Loading:**
   ```prisma
   // Good: Single query
   const applications = await prisma.jobApplication.findMany({
     include: { user: true, resume: true, job: true }
   });
   
   // Bad: N+1 queries
   const applications = await prisma.jobApplication.findMany();
   for (const app of applications) {
     const user = await prisma.user.findUnique({ where: { id: app.userId } });
   }
   ```

2. **Pagination:**
   ```prisma
   const applications = await prisma.jobApplication.findMany({
     skip: page * pageSize,
     take: pageSize,
     orderBy: { appliedAt: 'desc' }
   });
   ```

3. **Caching:**
   - Cache job listings
   - Cache company profiles
   - Cache AI evaluation results
   - Use Redis for frequently accessed data

---

## Appendix

### Enum Reference

**UserRole:** `JOB_SEEKER`, `RECRUITER`, `ADMIN`  
**UserStatus:** `ACTIVE`, `INACTIVE`, `SUSPENDED`  
**AccountType:** `EMAIL`, `GOOGLE`, `GITHUB`, `LINKEDIN`  
**JobType:** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `FREELANCE`  
**JobStatus:** `DRAFT`, `OPEN`, `CLOSED`, `ON_HOLD`  
**ApplicationStatus:** `APPLIED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `INTERVIEWED`, `OFFER_EXTENDED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`  
**InterviewType:** `AI_VIDEO`, `MANUAL_VIDEO`, `PHONE`, `IN_PERSON`  
**InterviewStatus:** `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`  
**QuestionType:** `TECHNICAL`, `BEHAVIORAL`, `SITUATIONAL`, `GENERAL`  
**RecommendationType:** `STRONGLY_RECOMMEND`, `RECOMMEND`, `NEUTRAL`, `NOT_RECOMMEND`, `STRONGLY_NOT_RECOMMEND`  
**NotificationType:** `APPLICATION_STATUS`, `INTERVIEW_INVITATION`, `INTERVIEW_REMINDER`, `INTERVIEW_RESULT`, `NEW_JOB_MATCH`, `MESSAGE`, `SYSTEM`  
**NotificationStatus:** `UNREAD`, `READ`, `ARCHIVED`

### JSON Field Structures

**Job.requiredSkills / preferredSkills:**
```json
["JavaScript", "Node.js", "PostgreSQL", "Docker"]
```

**Job.requirements:**
```json
{
  "education": "Bachelor's degree in Computer Science or related field",
  "experience": "5+ years in backend development",
  "technical": ["RESTful APIs", "Microservices", "CI/CD"],
  "soft": ["Team leadership", "Communication"]
}
```

**AIEvaluation.strengths / weaknesses:**
```json
["Strong technical background in Node.js", "5 years relevant experience", "Good communication skills"]
```

**InterviewSummary.keyInsights:**
```json
["Candidate has deep understanding of microservices", "Excellent problem-solving approach", "Could improve system design knowledge"]
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-29 | Initial schema design |

---

## Support & Feedback

For questions or schema modification requests, please refer to `ANTIGRAVITY.md` for the full platform requirements and architecture.

**Schema Maintainer:** Agorai Development Team  
**Last Review:** 2025-11-29
