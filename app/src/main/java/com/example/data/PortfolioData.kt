package com.example.data

enum class SkillCategory(val displayName: String) {
  ALL("All"),
  LANGUAGES("Languages"),
  AI_DATA("AI & Data"),
  WEB_SYSTEMS("Web & Systems"),
  TOOLS("Tools & Dev")
}

data class SkillItem(
  val name: String,
  val category: SkillCategory,
  val proficiency: Int, // 0 - 100
  val tag: String,
  val description: String
)

enum class WorkSampleType {
  AI_ASSISTANT,
  STUDENT_MANAGEMENT,
  EVENT_LEADERSHIP,
  CODE_INSPECTOR
}

data class ProjectItem(
  val id: String,
  val title: String,
  val role: String,
  val typeLabel: String,
  val description: String,
  val longDescription: String,
  val technologies: List<String>,
  val highlights: List<String>,
  val sampleType: WorkSampleType,
  val githubUrl: String = "https://github.com/adityatayde111-lgtm",
  val stats: String = ""
)

data class EducationItem(
  val institution: String,
  val degree: String,
  val timeline: String,
  val scoreLabel: String,
  val scoreValue: String,
  val details: String,
  val isCurrent: Boolean
)

data class ContactLink(
  val title: String,
  val value: String,
  val iconEmoji: String,
  val actionUri: String,
  val isUrl: Boolean = true
)

data class AchievementItem(
  val title: String,
  val organization: String,
  val date: String,
  val description: String,
  val linkUrl: String? = null
)

// Simulated Student model for the Student Management System interactive work sample
data class StudentRecord(
  val id: String,
  val name: String,
  val department: String,
  val semester: Int,
  val cgpa: Double,
  val attendance: Int, // Percentage
  val status: String
)

object PortfolioRepository {
  val profileName = "Aditya Santosh Tyade"
  val profileTitle = "Computer Science Engineering Student"
  val profileTagline = "Passionate about Software Development, AI/ML, Python, Data Science, and Full-Stack Development."
  val university = "Sanjivani University"
  val degree = "Integrated B.Tech in Computer Science & Engineering"
  val currentCgpa = "8.0"
  val careerObjective = "Computer Science Engineering student (CGPA: 8.0) passionate about Software Development, AI/ML, Python, Data Science, and Full-Stack Development. Quick learner with strong communication, leadership, and teamwork skills seeking internship opportunities."

  val contactLinks = listOf(
    ContactLink(
      title = "Phone",
      value = "+91 9403206007",
      iconEmoji = "📱",
      actionUri = "tel:+919403206007",
      isUrl = false
    ),
    ContactLink(
      title = "Email",
      value = "adityatayde111@gmail.com",
      iconEmoji = "✉️",
      actionUri = "mailto:adityatayde111@gmail.com",
      isUrl = false
    ),
    ContactLink(
      title = "LinkedIn",
      value = "linkedin.com/in/aditya-tayde",
      iconEmoji = "🔗",
      actionUri = "https://linkedin.com/in/aditya-tayde-02a030383"
    ),
    ContactLink(
      title = "GitHub",
      value = "github.com/adityatayde111-lgtm",
      iconEmoji = "💻",
      actionUri = "https://github.com/adityatayde111-lgtm"
    ),
    ContactLink(
      title = "Google Developers",
      value = "Google Developers Profile",
      iconEmoji = "👨💻",
      actionUri = "https://me.developers.google.com/u/101792320153173175016"
    ),
    ContactLink(
      title = "Credly",
      value = "Credly Certifications",
      iconEmoji = "🏅",
      actionUri = "https://Inkd.in/gTUQ98dp"
    ),
    ContactLink(
      title = "Instagram",
      value = "@aditya_tayde_96",
      iconEmoji = "📷",
      actionUri = "https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq"
    )
  )

  val skills = listOf(
    SkillItem("Python", SkillCategory.LANGUAGES, 92, "Core / AI", "Data analysis, backend scripting, automation, ML integration"),
    SkillItem("C / C++", SkillCategory.LANGUAGES, 86, "Core / DSA", "Algorithms, memory architecture, high performance coding"),
    SkillItem("AI / ML", SkillCategory.AI_DATA, 85, "Intelligent Systems", "Prompt architecture, Conversational AI, neural network fundamentals"),
    SkillItem("DSA", SkillCategory.AI_DATA, 88, "Problem Solving", "Arrays, Trees, Graphs, Dynamic Programming, sorting algorithms"),
    SkillItem("MySQL", SkillCategory.AI_DATA, 84, "Databases", "Relational schemas, queries, indexing, joins, stored procedures"),
    SkillItem("DBMS", SkillCategory.AI_DATA, 86, "Systems", "ACID properties, transaction recovery, normalization rules"),
    SkillItem("HTML / CSS", SkillCategory.WEB_SYSTEMS, 90, "UI / Styling", "Glassmorphism, responsive grid, flexbox, scroll animations"),
    SkillItem("JavaScript", SkillCategory.WEB_SYSTEMS, 82, "Frontend Logic", "DOM manipulation, asynchronous fetch, interactive widgets"),
    SkillItem("Git / GitHub", SkillCategory.TOOLS, 88, "Version Control", "Repositories, pull requests, collaboration, CI/CD basics"),
    SkillItem("Linux", SkillCategory.TOOLS, 80, "OS & Shell", "Terminal scripting, package management, server environments")
  )

  val projects = listOf(
    ProjectItem(
      id = "ai_chat_assistant",
      title = "AI Chat Assistant",
      role = "Lead Developer",
      typeLabel = "Project • AI / ML",
      description = "Built a conversational AI assistant with interactive chat, contextual memory, and natural dialogue handling.",
      longDescription = "An intelligent conversational chatbot built to assist users with technical explanations, coding challenges, study schedules, and system queries. Features immediate interactive responses and clean multi-turn prompting.",
      technologies = listOf("Python", "AI/ML", "NLP", "API Integration", "Clean UI"),
      highlights = listOf(
        "Interactive query handling with zero latency",
        "Contextual prompt engineering and memory retention",
        "Engineered for software engineering assistance & tutoring"
      ),
      sampleType = WorkSampleType.AI_ASSISTANT,
      stats = "99% prompt resolution • Sub-second answers"
    ),
    ProjectItem(
      id = "student_management_system",
      title = "Student Management System",
      role = "Full-Stack Developer",
      typeLabel = "Project • Database & CRUD",
      description = "Developed a comprehensive system for tracking, managing, and analyzing student academic data and records.",
      longDescription = "A robust academic records management application designed for universities. Features student enrollment, automated CGPA calculations, department filtering, attendance tracking, and grading metrics.",
      technologies = listOf("Python", "MySQL", "Relational Modeling", "CRUD", "Data Analytics"),
      highlights = listOf(
        "Comprehensive database schema with normalization",
        "Instant search, filtering by department, semester, and CGPA",
        "Automated attendance warnings and academic standing flags"
      ),
      sampleType = WorkSampleType.STUDENT_MANAGEMENT,
      stats = "120+ active student records • Instant filter queries"
    ),
    ProjectItem(
      id = "event_coordinator",
      title = "Event Coordinator & Social Media",
      role = "Department Handler",
      typeLabel = "Leadership & Operations",
      description = "Managed promotional campaigns, posters, reels, and technical and cultural events at Sanjivani University.",
      longDescription = "Orchestrated large-scale technical symposia, hackathons, and cultural festivals for the university. Led social media marketing campaigns, created viral posters and reels, and directed multi-member organizing committees.",
      technologies = listOf("Event Management", "Social Branding", "Leadership", "Media Strategy", "Team Coordination"),
      highlights = listOf(
        "Coordinated flagship technical & cultural college events with 1,200+ attendees",
        "Drove social media outreach with +350% engagement growth across Instagram & platforms",
        "Mentored junior coordinators in sponsorship outreach and operational planning"
      ),
      sampleType = WorkSampleType.EVENT_LEADERSHIP,
      stats = "1,200+ attendees • 15+ organized events"
    )
  )

  val educations = listOf(
    EducationItem(
      institution = "SANJIVANI UNIVERSITY",
      degree = "Integrated B.Tech in Computer Science & Engineering",
      timeline = "Current",
      scoreLabel = "CGPA",
      scoreValue = "8.0",
      details = "Rigorous coursework in Data Structures, Relational Databases, AI/ML, Operating Systems, and Object-Oriented Software Design.",
      isCurrent = true
    ),
    EducationItem(
      institution = "Class X",
      degree = "Secondary School Certificate",
      timeline = "Completed",
      scoreLabel = "Score",
      scoreValue = "84%",
      details = "Strong foundation in Mathematics, Science, and Analytical Logic with academic honors.",
      isCurrent = false
    )
  )

  val achievements = listOf(
    AchievementItem(
      title = "Google Developers Profile Member",
      organization = "Google Developers",
      date = "Active Milestone",
      description = "Recognized member of Google Developers with hands-on labs and badge milestones.",
      linkUrl = "https://me.developers.google.com/u/101792320153173175016"
    ),
    AchievementItem(
      title = "Credly Verified Credentials",
      organization = "Credly",
      date = "Verified",
      description = "Demonstrated technical skills in computing, databases, and software fundamentals.",
      linkUrl = "https://Inkd.in/gTUQ98dp"
    ),
    AchievementItem(
      title = "Department Event Lead & Coordinator",
      organization = "Sanjivani University",
      date = "Academic Year",
      description = "Successfully led promotional and technical coordination for university festivals.",
      linkUrl = null
    )
  )

  // Sample student database records for the interactive work sample demo
  val initialStudents = listOf(
    StudentRecord("STU-101", "Aditya Tayde", "Computer Science", 6, 8.0, 94, "Excellent"),
    StudentRecord("STU-102", "Pooja Sharma", "Computer Science", 6, 8.4, 91, "Good Standing"),
    StudentRecord("STU-103", "Rohan Patil", "AI & Data Science", 4, 7.8, 88, "Good Standing"),
    StudentRecord("STU-104", "Sneha Kulkarni", "Computer Science", 6, 8.9, 96, "Honor Roll"),
    StudentRecord("STU-105", "Tanmay Deshmukh", "Information Tech", 4, 7.4, 82, "Good Standing"),
    StudentRecord("STU-106", "Ananya Verma", "AI & Data Science", 6, 8.6, 95, "Honor Roll"),
    StudentRecord("STU-107", "Kunal Shinde", "Computer Science", 4, 6.9, 74, "Academic Warning")
  )
}
