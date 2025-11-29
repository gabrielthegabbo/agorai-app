# Database Schema - Quick Reference

## ✅ Schema Status: READY FOR REVIEW

### What's Completed

✅ **Complete Prisma Schema** - `prisma/schema.prisma`
- 21 models organized by domain
- All enums defined
- Foreign key relationships
- Proper indexes
- ✅ Validated successfully

✅ **Comprehensive Documentation** - `docs/DATABASE_SCHEMA.md`
- Full table descriptions
- ERD diagrams
- Data dictionary
- Migration guide
- Best practices
- Query optimization tips

---

## Key Schema Highlights

### 📊 21 Database Models

**User Management (4)**
- User, Account, PersonalInfo, Contact

**Jobs & Companies (4)**
- Company, Team, Job, JobApplication

**Resume System (6)**
- Resume, ResumeSkill, ResumeExperience, ResumeEducation, ResumeCertification, ResumeRanking

**Interview System (4)**
- Interview, Question, Response, InterviewSummary

**AI Evaluation (1)**
- AIEvaluation

**Supporting (2)**
- Notification, AuditLog

---

## Critical New Tables (Not in Original ERD)

### 1. ⭐ JobApplication
**Purpose:** Central hub tracking all job applications
- Links users → jobs → resumes
- Stores AI ranking scores
- Tracks application status
- **Why Critical:** Missing link between candidates and jobs

### 2. ⭐ Resume Parsed Data (4 tables)
**Purpose:** Store structured resume information
- ResumeSkill - Skills with proficiency
- ResumeExperience - Work history
- ResumeEducation - Educational background
- ResumeCertification - Professional certifications
- **Why Critical:** Enables AI matching and ranking

### 3. ⭐ AIEvaluation
**Purpose:** Store AI-generated candidate assessments
- Overall scores (0-100)
- Resume match score
- Interview performance score
- Recommendation (hire/don't hire)
- Strengths/weaknesses arrays
- **Why Critical:** Core AI ranking functionality

### 4. ⭐ ResumeRanking
**Purpose:** AI-generated job-specific rankings
- Match scores per job
- Skills/experience/education percentages
- Ranking position
- **Why Critical:** Powers recruiter dashboard

---

## Enhanced Tables (From Original ERD)

### Interview
**Added Fields:**
- `recordingUrl` - Video storage
- `transcriptionText` - Full transcript
- `interviewStatus` - Progress tracking
- **Why:** Support AI video interviewing

### Question
**Added Fields:**
- `questionOrder` - Sequence (1, 2, 3)
- `questionType` - Technical/Behavioral/Situational
- `isAiGenerated` - Track AI vs manual
- **Why:** Support 3-question AI interview flow

### Response
**Added Fields:**
- `responseText` - Transcribed answer
- `responseAudioUrl` - Audio file
- `responseDurationSeconds` - Answer length
- **Why:** Store video interview answers

### Job
**Added Fields:**
- `requiredSkills` (JSON)
- `preferredSkills` (JSON)
- `requirements` (JSON)
- `minExperienceYears` / `maxExperienceYears`
- `educationLevelRequired`
- **Why:** Enable AI matching algorithms

### User
**Added Fields:**
- `role` (JOB_SEEKER, RECRUITER, ADMIN)
- `status` (ACTIVE, INACTIVE, SUSPENDED)
- **Why:** Role-based access control

---

## Database Flow Overview

### Recruiter Flow
```
Recruiter → Company → Job → (receives) JobApplications → View Rankings
```

### Job Seeker Flow
```
Job Seeker → Upload Resume → Parse Resume → Apply to Job → Interview → AI Evaluation
```

### AI Processing Flow
```
Resume Upload → AI Parser → Save to ResumeSkill/Experience/Education/Certification
Job Application → AI Ranker → ResumeRanking score
Interview Complete → AI Evaluator → AIEvaluation + InterviewSummary
```

---

## Next Steps Before Migration

### 1. Review Documentation
📄 **Read:** `docs/DATABASE_SCHEMA.md`
- Complete table descriptions
- Relationship diagrams
- Migration instructions

### 2. Confirm Requirements
✅ Does schema support all features?
- ✅ Resume parsing and storage
- ✅ AI ranking system
- ✅ Video interview recording
- ✅ AI evaluation and scoring
- ✅ Recruiter/Job Seeker roles
- ✅ Notifications
- ✅ Audit logging

### 3. Review AI Service Integration Points
**Where AI is needed:**
- Resume parsing (OpenAI/Textract)
- Resume ranking algorithm (GPT-4)
- Question generation (GPT-4)
- Text-to-Speech for questions (ElevenLabs/OpenAI)
- Speech-to-Text for answers (Whisper)
- Interview evaluation (GPT-4/Claude)

### 4. Consider Data Migration
**If you have existing data:**
- Current User/Post tables → New User schema
- Migration script needed
- Data backup plan

### 5. Environment Setup
**Before running migration:**
```env
DATABASE_URL="postgresql://..."
```

---

## Running the Migration

### Option 1: Fresh Database (Recommended for Development)
```bash
# Generate migration
npx prisma migrate dev --name init_agorai_schema

# Generate Prisma Client
npx prisma generate

# Seed sample data
npx prisma db seed
```

### Option 2: Existing Database
```bash
# Create migration without applying
npx prisma migrate dev --create-only --name add_agorai_tables

# Review migration file in prisma/migrations/
# Edit if needed

# Apply migration
npx prisma migrate dev
```

---

## Schema Validation Results

✅ **Syntax:** Valid  
✅ **Foreign Keys:** All relationships defined  
✅ **Indexes:** Performance indexes added  
✅ **Enums:** All types defined  
✅ **Constraints:** Unique constraints set  

**No errors found - Schema is ready for deployment**

---

## File Locations

| File | Path | Purpose |
|------|------|---------|
| Prisma Schema | `prisma/schema.prisma` | Database definition |
| Documentation | `docs/DATABASE_SCHEMA.md` | Complete reference |
| Requirements | `ANTIGRAVITY.md` | Platform requirements |
| This Summary | `docs/DATABASE_SUMMARY.md` | Quick reference |

---

## Support

**Questions?** Review the detailed documentation in `docs/DATABASE_SCHEMA.md`

**Ready to proceed?** Run the migration commands above to create the database.

**Need changes?** Update `prisma/schema.prisma` and re-run `npx prisma format` + `npx prisma validate`
