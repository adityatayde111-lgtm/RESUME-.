package com.example.ui.worksamples

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SheetState
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PortfolioRepository
import com.example.data.ProjectItem
import com.example.data.StudentRecord
import com.example.data.WorkSampleType
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
  val isUser: Boolean,
  val text: String,
  val codeSnippet: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkSampleSheet(
  project: ProjectItem,
  onDismiss: () -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = Color(0xFF0F172A),
    dragHandle = null,
    modifier = Modifier
      .fillMaxHeight(0.92f)
      .testTag("work_sample_bottom_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
      // Header Bar
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF0284C7).copy(alpha = 0.2f),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f))
          ) {
            Text(
              text = "LIVE INTERACTIVE WORK SAMPLE",
              color = Color(0xFF38BDF8),
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.sp,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
            )
          }
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = project.title,
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = project.role + " • " + project.stats,
            color = Color(0xFF94A3B8),
            fontSize = 12.sp
          )
        }

        IconButton(
          onClick = onDismiss,
          modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(Color(0xFF1E293B))
            .testTag("close_work_sample_sheet")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = Color.White,
            modifier = Modifier.size(18.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Switch based on sample type
      when (project.sampleType) {
        WorkSampleType.AI_ASSISTANT -> AiChatAssistantWorkSample()
        WorkSampleType.STUDENT_MANAGEMENT -> StudentManagementWorkSample()
        WorkSampleType.EVENT_LEADERSHIP -> EventLeadershipWorkSample()
        WorkSampleType.CODE_INSPECTOR -> CodeInspectorWorkSample()
      }
    }
  }
}

/**
 * Interactive Live Demo for AI Chat Assistant
 */
@Composable
fun AiChatAssistantWorkSample() {
  val context = LocalContext.current
  val clipboardManager = LocalClipboardManager.current
  val coroutineScope = rememberCoroutineScope()

  val messages = remember {
    mutableStateListOf(
      ChatMessage(
        isUser = false,
        text = "Hello! I am Aditya's AI Chat Assistant work sample. Ask me a question about algorithms, Python, database design, or interview preparation."
      )
    )
  }

  var inputText by remember { mutableStateOf("") }
  var isTyping by remember { mutableStateOf(false) }

  val samplePrompts = listOf(
    "Explain QuickSort with C++ code",
    "Design student attendance SQL schema",
    "How does gradient descent work?",
    "Why choose Python for AI/ML?"
  )

  fun sendMessage(query: String) {
    if (query.isBlank()) return
    messages.add(ChatMessage(isUser = true, text = query))
    inputText = ""
    isTyping = true

    coroutineScope.launch {
      delay(600)
      val (response, code) = when {
        query.contains("QuickSort", ignoreCase = true) || query.contains("sort", ignoreCase = true) -> {
          Pair(
            "QuickSort is an efficient divide-and-conquer sorting algorithm with average time complexity O(N log N). It picks an element as a pivot and partitions the array around it.",
            """// C++ QuickSort Partition Function
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}"""
          )
        }
        query.contains("schema", ignoreCase = true) || query.contains("SQL", ignoreCase = true) -> {
          Pair(
            "Here is a normalized relational schema with primary and foreign key constraints for student attendance tracking:",
            """-- SQL Schema: Student Attendance
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    cgpa DECIMAL(3,2)
);

CREATE TABLE attendance (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    date DATE NOT NULL,
    is_present BOOLEAN DEFAULT TRUE
);"""
          )
        }
        query.contains("gradient", ignoreCase = true) || query.contains("AI", ignoreCase = true) -> {
          Pair(
            "Gradient Descent is an optimization algorithm used to minimize cost functions in machine learning by iteratively moving in the direction of steepest descent specified by the negative of the gradient.",
            """# Python Gradient Descent Update Rule
def update_weights(w, b, X, y, lr=0.01):
    m = len(y)
    y_pred = X.dot(w) + b
    dw = (1/m) * X.T.dot(y_pred - y)
    db = (1/m) * np.sum(y_pred - y)
    w -= lr * dw
    b -= lr * db
    return w, b"""
          )
        }
        else -> {
          Pair(
            "Great query! Aditya built this AI Assistant to process user context, extract intents, and deliver well-structured technical answers tailored for students and engineers.",
            null
          )
        }
      }
      isTyping = false
      messages.add(ChatMessage(isUser = false, text = response, codeSnippet = code))
    }
  }

  Column(modifier = Modifier.fillMaxSize()) {
    // Prompt suggestion chips
    Text(
      text = "TEST WITH ONE-TAP QUERIES:",
      color = Color(0xFF94A3B8),
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.5.sp
    )
    Spacer(modifier = Modifier.height(6.dp))

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 8.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      samplePrompts.take(2).forEach { prompt ->
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = Color(0xFF1E293B),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
          modifier = Modifier
            .weight(1f)
            .clickable { sendMessage(prompt) }
        ) {
          Text(
            text = prompt,
            color = Color(0xFF38BDF8),
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
          )
        }
      }
    }

    // Chat Message Log
    LazyColumn(
      modifier = Modifier
        .weight(1f)
        .fillMaxWidth()
        .clip(RoundedCornerShape(14.dp))
        .background(Color(0xFF162032))
        .padding(12.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      items(messages) { msg ->
        if (msg.isUser) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
          ) {
            Surface(
              shape = RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp),
              color = Color(0xFF0284C7)
            ) {
              Text(
                text = msg.text,
                color = Color.White,
                fontSize = 13.sp,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
              )
            }
          }
        } else {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
          ) {
            Column(modifier = Modifier.fillMaxWidth(0.92f)) {
              Surface(
                shape = RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp),
                color = Color(0xFF1E293B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
              ) {
                Column(modifier = Modifier.padding(12.dp)) {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                      imageVector = Icons.Default.Psychology,
                      contentDescription = null,
                      tint = Color(0xFF38BDF8),
                      modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                      text = "Aditya AI Assistant",
                      color = Color(0xFF38BDF8),
                      fontSize = 11.sp,
                      fontWeight = FontWeight.Bold
                    )
                  }
                  Spacer(modifier = Modifier.height(6.dp))
                  Text(
                    text = msg.text,
                    color = Color.White,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                  )

                  // Render Code Snippet if present
                  msg.codeSnippet?.let { code ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                      shape = RoundedCornerShape(8.dp),
                      color = Color(0xFF0B1329),
                      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
                      modifier = Modifier.fillMaxWidth()
                    ) {
                      Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                          modifier = Modifier.fillMaxWidth(),
                          horizontalArrangement = Arrangement.SpaceBetween,
                          verticalAlignment = Alignment.CenterVertically
                        ) {
                          Text(
                            text = "CODE SNIPPET",
                            color = Color(0xFF64748B),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                          )
                          IconButton(
                            onClick = {
                              clipboardManager.setText(AnnotatedString(code))
                              Toast.makeText(context, "Code copied to clipboard!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(24.dp)
                          ) {
                            Icon(
                              imageVector = Icons.Default.ContentCopy,
                              contentDescription = "Copy code",
                              tint = Color(0xFF38BDF8),
                              modifier = Modifier.size(14.dp)
                            )
                          }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                          text = code,
                          color = Color(0xFF67E8F9),
                          fontSize = 11.sp,
                          fontFamily = FontFamily.Monospace
                        )
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (isTyping) {
        item {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.AutoAwesome,
              contentDescription = null,
              tint = Color(0xFF38BDF8),
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Assistant is processing query...",
              color = Color(0xFF94A3B8),
              fontSize = 11.5.sp
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Chat input bar
    Row(
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically
    ) {
      OutlinedTextField(
        value = inputText,
        onValueChange = { inputText = it },
        placeholder = { Text("Ask technical question...", fontSize = 13.sp, color = Color(0xFF64748B)) },
        singleLine = true,
        shape = RoundedCornerShape(20.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = Color(0xFF162032),
          unfocusedContainerColor = Color(0xFF162032),
          focusedBorderColor = Color(0xFF38BDF8),
          unfocusedBorderColor = Color(0xFF1E293B),
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White
        ),
        modifier = Modifier
          .weight(1f)
          .testTag("ai_chat_input")
      )

      Spacer(modifier = Modifier.width(8.dp))

      IconButton(
        onClick = { sendMessage(inputText) },
        modifier = Modifier
          .size(46.dp)
          .clip(CircleShape)
          .background(Color(0xFF0284C7))
          .testTag("send_ai_chat_button")
      ) {
        Icon(
          imageVector = Icons.AutoMirrored.Filled.Send,
          contentDescription = "Send",
          tint = Color.White,
          modifier = Modifier.size(18.dp)
        )
      }
    }
  }
}

/**
 * Interactive Live Demo for Student Management System
 */
@Composable
fun StudentManagementWorkSample() {
  val context = LocalContext.current
  var searchQuery by remember { mutableStateOf("") }
  var selectedDept by remember { mutableStateOf("All") }

  val studentsList = remember {
    mutableStateListOf<StudentRecord>().apply {
      addAll(PortfolioRepository.initialStudents)
    }
  }

  val departments = listOf("All", "Computer Science", "AI & Data Science", "Information Tech")

  val filteredStudents = remember(searchQuery, selectedDept, studentsList.size) {
    studentsList.filter { student ->
      val matchesDept = selectedDept == "All" || student.department == selectedDept
      val matchesSearch = searchQuery.isBlank() ||
        student.name.contains(searchQuery, ignoreCase = true) ||
        student.id.contains(searchQuery, ignoreCase = true)
      matchesDept && matchesSearch
    }
  }

  fun addNewTestStudent() {
    val newId = "STU-${studentsList.size + 101}"
    val randomNames = listOf("Aarav Mehta", "Diya Sharma", "Sameer Deshmukh", "Priya Verma")
    val randomName = randomNames.random()
    studentsList.add(
      0,
      StudentRecord(
        id = newId,
        name = randomName,
        department = "Computer Science",
        semester = 6,
        cgpa = 8.5,
        attendance = 92,
        status = "Enrolled"
      )
    )
    Toast.makeText(context, "Added sample student: $randomName ($newId)", Toast.LENGTH_SHORT).show()
  }

  Column(modifier = Modifier.fillMaxSize()) {
    // Quick Metrics Header
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(12.dp))
        .background(Color(0xFF162032))
        .padding(12.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column {
        Text(text = "TOTAL RECORDS", color = Color(0xFF94A3B8), fontSize = 8.5.sp, fontWeight = FontWeight.Bold)
        Text(text = "${studentsList.size} Students", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
      }
      Box(modifier = Modifier.width(1.dp).height(20.dp).background(Color(0xFF334155)))
      Column {
        Text(text = "BATCH AVG CGPA", color = Color(0xFF94A3B8), fontSize = 8.5.sp, fontWeight = FontWeight.Bold)
        Text(text = "8.1 / 10.0", color = Color(0xFFF59E0B), fontSize = 14.sp, fontWeight = FontWeight.Bold)
      }
      Box(modifier = Modifier.width(1.dp).height(20.dp).background(Color(0xFF334155)))
      Button(
        onClick = { addNewTestStudent() },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.height(34.dp)
      ) {
        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = "Add Student", fontSize = 11.sp, fontWeight = FontWeight.Bold)
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Search and Department Filter
    OutlinedTextField(
      value = searchQuery,
      onValueChange = { searchQuery = it },
      placeholder = { Text("Search by student name or ID...", fontSize = 12.sp, color = Color(0xFF64748B)) },
      leadingIcon = {
        Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(16.dp))
      },
      singleLine = true,
      shape = RoundedCornerShape(10.dp),
      colors = OutlinedTextFieldDefaults.colors(
        focusedContainerColor = Color(0xFF162032),
        unfocusedContainerColor = Color(0xFF162032),
        focusedBorderColor = Color(0xFF38BDF8),
        unfocusedBorderColor = Color(0xFF1E293B),
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White
      ),
      modifier = Modifier.fillMaxWidth()
    )

    Spacer(modifier = Modifier.height(8.dp))

    // Dept chips
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
      departments.forEach { dept ->
        val isSelected = dept == selectedDept
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = if (isSelected) Color(0xFF0284C7) else Color(0xFF1E293B),
          modifier = Modifier.clickable { selectedDept = dept }
        ) {
          Text(
            text = dept,
            color = if (isSelected) Color.White else Color(0xFF94A3B8),
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Student Roster
    LazyColumn(
      modifier = Modifier.weight(1f),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      items(filteredStudents) { student ->
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFF162032),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color(0xFF0284C7).copy(alpha = 0.2f)),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = student.name.take(2).uppercase(),
                color = Color(0xFF38BDF8),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
              )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = student.name,
                color = Color.White,
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Bold
              )
              Text(
                text = "${student.department} • Sem ${student.semester} • ${student.id}",
                color = Color(0xFF94A3B8),
                fontSize = 11.sp
              )
            }

            Column(horizontalAlignment = Alignment.End) {
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (student.cgpa >= 8.0) Color(0xFF10B981).copy(alpha = 0.2f) else Color(0xFFF59E0B).copy(alpha = 0.2f)
              ) {
                Text(
                  text = "CGPA ${student.cgpa}",
                  color = if (student.cgpa >= 8.0) Color(0xFF6EE7B7) else Color(0xFFFDE68A),
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
              }
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Attd: ${student.attendance}%",
                color = Color(0xFF94A3B8),
                fontSize = 10.sp
              )
            }
          }
        }
      }
    }
  }
}

/**
 * Interactive Live Demo for Event Coordinator & Social Media
 */
@Composable
fun EventLeadershipWorkSample() {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(vertical = 4.dp)
  ) {
    // Key Achievement Banner
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color(0xFF162032),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
      modifier = Modifier.fillMaxWidth()
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text(
          text = "DEPARTMENT LEADERSHIP METRICS",
          color = Color(0xFF38BDF8),
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 0.8.sp
        )
        Spacer(modifier = Modifier.height(10.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          MetricItem(title = "Total Attendees", value = "1,200+", sub = "Campus Festivals")
          MetricItem(title = "Social Reach", value = "+350%", sub = "Instagram Reels")
          MetricItem(title = "Events Led", value = "15+", sub = "Hackathons & Tech")
        }
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    Text(
      text = "FLAGSHIP INITIATIVES & CAMPAIGNS",
      color = Color.White,
      fontSize = 13.sp,
      fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    LazyColumn(
      modifier = Modifier.weight(1f),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      item {
        EventCampaignCard(
          eventName = "Sanjivani National Tech Hackathon",
          role = "Lead Coordinator & Promotion Handler",
          date = "2024",
          impact = "Registered 400+ student developers across 30 colleges. Spearheaded tech branding and sponsorship decks."
        )
      }
      item {
        EventCampaignCard(
          eventName = "Social Media Video & Reels Blitz",
          role = "Content Strategist & Editor",
          date = "2024",
          impact = "Engineered viral short-form reels for event promotion, capturing over 50,000 organic views on college channels."
        )
      }
      item {
        EventCampaignCard(
          eventName = "Annual Cultural Carnival & Symposium",
          role = "Department Stage & Logistics Head",
          date = "2023 - 2024",
          impact = "Managed 25-member cross-functional volunteer team, audio-visual technical setups, and VIP guest reception."
        )
      }
    }
  }
}

@Composable
fun MetricItem(title: String, value: String, sub: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(text = value, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
    Text(text = title, color = Color(0xFF38BDF8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    Text(text = sub, color = Color(0xFF64748B), fontSize = 9.sp)
  }
}

@Composable
fun EventCampaignCard(
  eventName: String,
  role: String,
  date: String,
  impact: String
) {
  Surface(
    shape = RoundedCornerShape(12.dp),
    color = Color(0xFF162032),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
    modifier = Modifier.fillMaxWidth()
  ) {
    Column(modifier = Modifier.padding(14.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = eventName,
          color = Color.White,
          fontSize = 14.sp,
          fontWeight = FontWeight.Bold
        )
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Color(0xFF1E293B)
        ) {
          Text(
            text = date,
            color = Color(0xFF94A3B8),
            fontSize = 10.sp,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = role,
        color = Color(0xFF38BDF8),
        fontSize = 12.sp,
        fontWeight = FontWeight.Medium
      )
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        text = impact,
        color = Color(0xFF94A3B8),
        fontSize = 12.sp,
        lineHeight = 17.sp
      )
    }
  }
}

/**
 * Code Inspector Work Sample
 */
@Composable
fun CodeInspectorWorkSample() {
  val context = LocalContext.current
  val clipboardManager = LocalClipboardManager.current

  val codeSample = """# Aditya's Project Architecture: Conversational AI Pipeline
import time
from typing import Dict, Any, List

class ConversationalAssistant:
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt
        self.context_memory: List[Dict[str, str]] = []

    def dispatch_prompt(self, user_query: str) -> Dict[str, Any]:
        start_time = time.time()
        self.context_memory.append({"role": "user", "content": user_query})
        
        # Simulating optimized inference pipeline
        response_payload = {
            "query": user_query,
            "status": "200_OK",
            "latency_ms": round((time.time() - start_time) * 1000, 2),
            "response": f"Processed: {user_query}"
        }
        return response_payload"""

  Column(modifier = Modifier.fillMaxSize()) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "CLEAN CODE SHOWCASE (PYTHON)",
        color = Color(0xFF38BDF8),
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace
      )
      Button(
        onClick = {
          clipboardManager.setText(AnnotatedString(codeSample))
          Toast.makeText(context, "Code copied!", Toast.LENGTH_SHORT).show()
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.height(32.dp)
      ) {
        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = "Copy Code", fontSize = 11.sp)
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    Surface(
      shape = RoundedCornerShape(12.dp),
      color = Color(0xFF0B1329),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
      modifier = Modifier
        .weight(1f)
        .fillMaxWidth()
    ) {
      LazyColumn(modifier = Modifier.padding(14.dp)) {
        item {
          Text(
            text = codeSample,
            color = Color(0xFF67E8F9),
            fontSize = 12.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 18.sp
          )
        }
      }
    }
  }
}
