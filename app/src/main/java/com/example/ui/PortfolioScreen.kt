package com.example.ui

import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.ContactMail
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.PlayCircleOutline
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PortfolioRepository
import com.example.data.ProjectItem
import com.example.ui.components.AchievementsCard
import com.example.ui.components.CareerObjectiveCard
import com.example.ui.components.ConnectSection
import com.example.ui.components.EducationTimeline
import com.example.ui.components.HeroHeader
import com.example.ui.components.InteractiveBadge3D
import com.example.ui.components.ProjectsSection
import com.example.ui.components.SkillsGrid
import com.example.ui.components.StaggeredEntrance
import com.example.ui.worksamples.WorkSampleSheet
import kotlinx.coroutines.launch

enum class PortfolioTab(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
  OVERVIEW("Overview", Icons.Default.Dashboard),
  WORK_SAMPLES("Work Samples", Icons.Default.PlayCircleOutline),
  SKILLS("Skills", Icons.Default.Code),
  EDUCATION_CONNECT("Connect", Icons.Default.ContactMail)
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalAnimationApi::class)
@Composable
fun PortfolioScreen(modifier: Modifier = Modifier) {
  val context = LocalContext.current
  val listState = rememberLazyListState()
  val coroutineScope = rememberCoroutineScope()

  var selectedTab by remember { mutableStateOf(PortfolioTab.OVERVIEW) }
  var activeProjectSample by remember { mutableStateOf<ProjectItem?>(null) }

  fun sharePortfolio() {
    try {
      val shareText = """
        Aditya Santosh Tyade - Portfolio & Resume
        Integrated B.Tech in Computer Science & Engineering (CGPA: 8.0)
        Sanjivani University

        • Skills: Python, C++, AI/ML, MySQL, HTML/CSS, JavaScript, Git, Linux
        • Projects: AI Chat Assistant, Student Management System, Event Coordinator
        
        Contact:
        Email: adityatayde111@gmail.com
        Phone: +91 9403206007
        LinkedIn: https://linkedin.com/in/aditya-tayde-02a030383
        GitHub: https://github.com/adityatayde111-lgtm
      """.trimIndent()

      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "Aditya Santosh Tyade - Portfolio")
        putExtra(Intent.EXTRA_TEXT, shareText)
      }
      context.startActivity(Intent.createChooser(intent, "Share Portfolio"))
    } catch (e: Exception) {
      Toast.makeText(context, "Could not share", Toast.LENGTH_SHORT).show()
    }
  }

  Scaffold(
    modifier = modifier
      .fillMaxSize()
      .testTag("portfolio_root_scaffold"),
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(
                  Brush.linearGradient(
                    colors = listOf(Color(0xFF0284C7), Color(0xFF6366F1))
                  )
                ),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = "AT",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black
              )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                text = "Aditya Tyade",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
              )
              Text(
                text = "Portfolio • Sanjivani Univ",
                color = Color(0xFF94A3B8),
                fontSize = 11.sp
              )
            }
          }
        },
        actions = {
          IconButton(
            onClick = { sharePortfolio() },
            modifier = Modifier.testTag("top_bar_share_btn")
          ) {
            Icon(
              imageVector = Icons.Default.Share,
              contentDescription = "Share",
              tint = Color(0xFF38BDF8)
            )
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = Color(0xFF0B101E),
          titleContentColor = Color.White
        )
      )
    },
    bottomBar = {
      NavigationBar(
        containerColor = Color(0xFF0B101E),
        contentColor = Color.White,
        tonalElevation = 8.dp
      ) {
        PortfolioTab.values().forEach { tab ->
          val isSelected = selectedTab == tab
          NavigationBarItem(
            selected = isSelected,
            onClick = {
              selectedTab = tab
              coroutineScope.launch { listState.scrollToItem(0) }
            },
            icon = {
              Icon(
                imageVector = tab.icon,
                contentDescription = tab.title
              )
            },
            label = {
              Text(
                text = tab.title,
                fontSize = 10.5.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
              )
            },
            colors = NavigationBarItemDefaults.colors(
              selectedIconColor = Color.White,
              selectedTextColor = Color(0xFF38BDF8),
              indicatorColor = Color(0xFF0284C7),
              unselectedIconColor = Color(0xFF94A3B8),
              unselectedTextColor = Color(0xFF94A3B8)
            ),
            modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
          )
        }
      }
    },
    containerColor = Color(0xFF0B101E)
  ) { innerPadding ->
    BoxWithConstraints(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      val isWideLayout = maxWidth >= 720.dp

      LazyColumn(
        state = listState,
        modifier = Modifier
          .fillMaxSize()
          .padding(horizontal = if (isWideLayout) 32.dp else 16.dp, vertical = 12.dp)
          .widthIn(max = 1100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Render content based on selected tab with smooth entrance
        when (selectedTab) {
          PortfolioTab.OVERVIEW -> {
            item {
              StaggeredEntrance(index = 0) {
                if (isWideLayout) {
                  // Side-by-side Hero and 3D Interactive Badge
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.Top
                  ) {
                    HeroHeader(
                      onViewWorkSamples = { selectedTab = PortfolioTab.WORK_SAMPLES },
                      onOpenContact = { selectedTab = PortfolioTab.EDUCATION_CONNECT },
                      onShareProfile = { sharePortfolio() },
                      modifier = Modifier.weight(1.2f)
                    )
                    InteractiveBadge3D(
                      modifier = Modifier.weight(1f)
                    )
                  }
                } else {
                  Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    HeroHeader(
                      onViewWorkSamples = { selectedTab = PortfolioTab.WORK_SAMPLES },
                      onOpenContact = { selectedTab = PortfolioTab.EDUCATION_CONNECT },
                      onShareProfile = { sharePortfolio() }
                    )
                    InteractiveBadge3D()
                  }
                }
              }
            }

            item {
              StaggeredEntrance(index = 1) {
                CareerObjectiveCard()
              }
            }

            item {
              StaggeredEntrance(index = 2) {
                ProjectsSection(
                  onSelectProjectSample = { project -> activeProjectSample = project },
                  isWideLayout = isWideLayout
                )
              }
            }

            item {
              StaggeredEntrance(index = 3) {
                SkillsGrid(isWideLayout = isWideLayout)
              }
            }

            item {
              StaggeredEntrance(index = 4) {
                ConnectSection(isWideLayout = isWideLayout)
              }
            }
          }

          PortfolioTab.WORK_SAMPLES -> {
            item {
              StaggeredEntrance(index = 0) {
                Surface(
                  shape = RoundedCornerShape(16.dp),
                  color = Color(0xFF162032),
                  border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
                  modifier = Modifier.fillMaxWidth()
                ) {
                  Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                      Box(
                        modifier = Modifier
                          .size(36.dp)
                          .clip(CircleShape)
                          .background(Color(0xFF0284C7).copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                      ) {
                        Icon(
                          imageVector = Icons.Default.PlayCircleOutline,
                          contentDescription = null,
                          tint = Color(0xFF38BDF8),
                          modifier = Modifier.size(20.dp)
                        )
                      }
                      Spacer(modifier = Modifier.width(12.dp))
                      Column {
                        Text(
                          text = "Direct Work Samples Viewer",
                          color = Color.White,
                          fontSize = 17.sp,
                          fontWeight = FontWeight.Bold
                        )
                        Text(
                          text = "Launch interactive live demos and test Aditya's work directly",
                          color = Color(0xFF94A3B8),
                          fontSize = 12.sp
                        )
                      }
                    }
                  }
                }
              }
            }

            item {
              StaggeredEntrance(index = 1) {
                ProjectsSection(
                  onSelectProjectSample = { project -> activeProjectSample = project },
                  isWideLayout = isWideLayout
                )
              }
            }
          }

          PortfolioTab.SKILLS -> {
            item {
              StaggeredEntrance(index = 0) {
                SkillsGrid(isWideLayout = isWideLayout)
              }
            }

            item {
              StaggeredEntrance(index = 1) {
                AchievementsCard(isWideLayout = isWideLayout)
              }
            }
          }

          PortfolioTab.EDUCATION_CONNECT -> {
            item {
              StaggeredEntrance(index = 0) {
                EducationTimeline()
              }
            }

            item {
              StaggeredEntrance(index = 1) {
                ConnectSection(isWideLayout = isWideLayout)
              }
            }

            item {
              StaggeredEntrance(index = 2) {
                AchievementsCard(isWideLayout = isWideLayout)
              }
            }
          }
        }

        item {
          Spacer(modifier = Modifier.height(16.dp))
        }
      }
    }

    // Modal Bottom Sheet for Active Interactive Work Sample
    activeProjectSample?.let { project ->
      WorkSampleSheet(
        project = project,
        onDismiss = { activeProjectSample = null }
      )
    }
  }
}
