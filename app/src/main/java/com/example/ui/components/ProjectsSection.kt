package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PortfolioRepository
import com.example.data.ProjectCategory
import com.example.data.ProjectItem

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProjectsSection(
  onSelectProjectSample: (ProjectItem) -> Unit,
  modifier: Modifier = Modifier,
  isWideLayout: Boolean = false
) {
  val context = LocalContext.current
  val projects = PortfolioRepository.projects
  var selectedCategory by remember { mutableStateOf(ProjectCategory.ALL) }

  val filteredProjects = remember(selectedCategory, projects) {
    if (selectedCategory == ProjectCategory.ALL) {
      projects
    } else {
      projects.filter { it.category == selectedCategory }
    }
  }

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("projects_section_card"),
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
  ) {
    Column(modifier = Modifier.padding(20.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Projects & Leadership",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "Tap 'Work Sample' to launch interactive in-app demo",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp
          )
        }

        Box(
          modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(Color(0xFF0284C7).copy(alpha = 0.15f)),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Default.Work,
            contentDescription = null,
            tint = Color(0xFF38BDF8),
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Category filter toggle chips
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("projects_filter_row")
      ) {
        ProjectCategory.values().forEach { category ->
          val isSelected = category == selectedCategory
          val count = if (category == ProjectCategory.ALL) {
            projects.size
          } else {
            projects.count { it.category == category }
          }

          Surface(
            shape = RoundedCornerShape(20.dp),
            color = if (isSelected) Color(0xFF0284C7) else Color(0xFF162032),
            border = androidx.compose.foundation.BorderStroke(
              1.dp,
              if (isSelected) Color(0xFF38BDF8) else Color(0xFF1F2E47)
            ),
            modifier = Modifier
              .clip(RoundedCornerShape(20.dp))
              .clickable { selectedCategory = category }
              .testTag("project_filter_${category.name.lowercase()}")
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(horizontal = 13.dp, vertical = 7.dp)
            ) {
              Text(
                text = category.displayName,
                color = if (isSelected) Color.White else Color(0xFF94A3B8),
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
              )
              Spacer(modifier = Modifier.width(6.dp))
              Surface(
                shape = CircleShape,
                color = if (isSelected) Color.White.copy(alpha = 0.25f) else Color(0xFF0F172A),
                modifier = Modifier.size(18.dp)
              ) {
                Box(contentAlignment = Alignment.Center) {
                  Text(
                    text = "$count",
                    color = if (isSelected) Color.White else Color(0xFF64748B),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      if (filteredProjects.isEmpty()) {
        Surface(
          shape = RoundedCornerShape(14.dp),
          color = Color(0xFF162032),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
          modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
        ) {
          Column(
            modifier = Modifier.padding(24.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text(
              text = "No projects found in this category",
              color = Color(0xFF94A3B8),
              fontSize = 13.sp
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedButton(
              onClick = { selectedCategory = ProjectCategory.ALL },
              shape = RoundedCornerShape(8.dp),
              colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF38BDF8))
            ) {
              Text("Show All Projects (${projects.size})", fontSize = 12.sp)
            }
          }
        }
      } else {
        // Responsive layout for project cards
        if (isWideLayout) {
          Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            for (i in filteredProjects.indices step 2) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
              ) {
                StaggeredEntrance(
                  index = i,
                  modifier = Modifier.weight(1f)
                ) {
                  ProjectCard(
                    project = filteredProjects[i],
                    onViewSample = { onSelectProjectSample(filteredProjects[i]) },
                    onOpenGithub = {
                      try {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(filteredProjects[i].githubUrl)))
                      } catch (e: Exception) {
                        Toast.makeText(context, "Could not open GitHub", Toast.LENGTH_SHORT).show()
                      }
                    }
                  )
                }

                if (i + 1 < filteredProjects.size) {
                  StaggeredEntrance(
                    index = i + 1,
                    modifier = Modifier.weight(1f)
                  ) {
                    ProjectCard(
                      project = filteredProjects[i + 1],
                      onViewSample = { onSelectProjectSample(filteredProjects[i + 1]) },
                      onOpenGithub = {
                        try {
                          context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(filteredProjects[i + 1].githubUrl)))
                        } catch (e: Exception) {
                          Toast.makeText(context, "Could not open GitHub", Toast.LENGTH_SHORT).show()
                        }
                      }
                    )
                  }
                } else {
                  Spacer(modifier = Modifier.weight(1f))
                }
              }
            }
          }
        } else {
          Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            filteredProjects.forEachIndexed { index, project ->
              StaggeredEntrance(index = index) {
                ProjectCard(
                  project = project,
                  onViewSample = { onSelectProjectSample(project) },
                  onOpenGithub = {
                    try {
                      context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(project.githubUrl)))
                    } catch (e: Exception) {
                      Toast.makeText(context, "Could not open GitHub", Toast.LENGTH_SHORT).show()
                    }
                  }
                )
              }
            }
          }
        }
      }
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProjectCard(
  project: ProjectItem,
  onViewSample: () -> Unit,
  onOpenGithub: () -> Unit,
  modifier: Modifier = Modifier
) {
  var isExpanded by remember { mutableStateOf(false) }
  var isHovered by remember { mutableStateOf(false) }

  val scale by animateFloatAsState(
    targetValue = if (isHovered) 1.025f else 1.0f,
    animationSpec = spring(
      dampingRatio = 0.75f,
      stiffness = 400f
    ),
    label = "projectCardScale"
  )

  val shadowElevation by animateDpAsState(
    targetValue = if (isHovered) 12.dp else 0.dp,
    animationSpec = tween(durationMillis = 200),
    label = "projectCardShadow"
  )

  val cardBorder = if (isHovered) {
    androidx.compose.foundation.BorderStroke(
      1.5.dp,
      Brush.linearGradient(
        colors = listOf(Color(0xFF38BDF8), Color(0xFF818CF8))
      )
    )
  } else {
    androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47))
  }

  Surface(
    shape = RoundedCornerShape(16.dp),
    color = if (isHovered) Color(0xFF19243A) else Color(0xFF162032),
    border = cardBorder,
    shadowElevation = shadowElevation,
    modifier = modifier
      .fillMaxWidth()
      .graphicsLayer {
        scaleX = scale
        scaleY = scale
      }
      .pointerInput(Unit) {
        awaitPointerEventScope {
          while (true) {
            val event = awaitPointerEvent()
            when (event.type) {
              PointerEventType.Enter -> isHovered = true
              PointerEventType.Exit -> isHovered = false
            }
          }
        }
      }
      .testTag("project_card_${project.id}")
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      // Top Tag and Role
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Color(0xFF0284C7).copy(alpha = 0.2f),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.4f))
        ) {
          Text(
            text = project.typeLabel,
            color = Color(0xFF38BDF8),
            fontSize = 10.5.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
          )
        }

        Text(
          text = project.role,
          color = Color(0xFF94A3B8),
          fontSize = 11.5.sp,
          fontWeight = FontWeight.Medium
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Title
      Text(
        text = project.title,
        color = Color.White,
        fontSize = 17.sp,
        fontWeight = FontWeight.Bold
      )

      if (project.stats.isNotEmpty()) {
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = "⚡ " + project.stats,
          color = Color(0xFF67E8F9),
          fontSize = 11.5.sp,
          fontWeight = FontWeight.SemiBold
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Description
      Text(
        text = project.description,
        color = Color(0xFFCBD5E1),
        fontSize = 12.5.sp,
        lineHeight = 18.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Tech tags
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        project.technologies.forEach { tech ->
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF0F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
          ) {
            Text(
              text = tech,
              color = Color(0xFFE2E8F0),
              fontSize = 10.5.sp,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
            )
          }
        }
      }

      // Expandable highlights
      AnimatedVisibility(visible = isExpanded) {
        Column(modifier = Modifier.padding(top = 12.dp)) {
          Text(
            text = "KEY ACCOMPLISHMENTS:",
            color = Color(0xFF94A3B8),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
          )
          Spacer(modifier = Modifier.height(4.dp))
          project.highlights.forEach { hl ->
            Row(
              modifier = Modifier.padding(vertical = 2.dp),
              verticalAlignment = Alignment.Top
            ) {
              Text(text = "• ", color = Color(0xFF38BDF8), fontSize = 12.sp)
              Text(text = hl, color = Color(0xFF94A3B8), fontSize = 11.5.sp, lineHeight = 16.sp)
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Action buttons
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Button(
          onClick = onViewSample,
          modifier = Modifier
            .weight(1f)
            .height(42.dp)
            .testTag("btn_view_sample_${project.id}"),
          colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF0284C7)
          ),
          shape = RoundedCornerShape(10.dp)
        ) {
          Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "View Work Sample",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
          )
        }

        OutlinedButton(
          onClick = onOpenGithub,
          modifier = Modifier
            .height(42.dp)
            .testTag("btn_github_${project.id}"),
          shape = RoundedCornerShape(10.dp),
          colors = ButtonDefaults.outlinedButtonColors(
            contentColor = Color(0xFF38BDF8)
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.6f))
        ) {
          Icon(
            imageVector = Icons.Default.Code,
            contentDescription = "GitHub",
            modifier = Modifier.size(15.dp)
          )
        }

        IconButton(
          onClick = { isExpanded = !isExpanded },
          modifier = Modifier.size(36.dp)
        ) {
          Icon(
            imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
            contentDescription = "Toggle Details",
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(20.dp)
          )
        }
      }
    }
  }
}
