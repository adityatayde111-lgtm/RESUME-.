package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PortfolioRepository
import com.example.data.SkillCategory
import com.example.data.SkillItem

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SkillsGrid(
  modifier: Modifier = Modifier,
  isWideLayout: Boolean = false
) {
  var selectedCategory by remember { mutableStateOf(SkillCategory.ALL) }
  var searchQuery by remember { mutableStateOf("") }

  val filteredSkills = remember(selectedCategory, searchQuery) {
    PortfolioRepository.skills.filter { skill ->
      val matchesCategory = (selectedCategory == SkillCategory.ALL || skill.category == selectedCategory)
      val matchesSearch = searchQuery.isBlank() ||
        skill.name.contains(searchQuery, ignoreCase = true) ||
        skill.tag.contains(searchQuery, ignoreCase = true) ||
        skill.description.contains(searchQuery, ignoreCase = true)
      matchesCategory && matchesSearch
    }
  }

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("skills_section_card"),
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF111827)
    ),
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
            text = "Technical Skills",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "Core languages, systems, AI/ML & developer tools",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp
          )
        }

        Box(
          modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(Color(0xFF06B6D4).copy(alpha = 0.15f)),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Default.Code,
            contentDescription = null,
            tint = Color(0xFF38BDF8),
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Search bar
      OutlinedTextField(
        value = searchQuery,
        onValueChange = { searchQuery = it },
        placeholder = { Text("Filter skills (e.g. Python, AI, SQL)...", fontSize = 13.sp, color = Color(0xFF64748B)) },
        leadingIcon = {
          Icon(
            imageVector = Icons.Default.Search,
            contentDescription = "Search",
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(18.dp)
          )
        },
        trailingIcon = {
          if (searchQuery.isNotEmpty()) {
            IconButton(onClick = { searchQuery = "" }) {
              Icon(
                imageVector = Icons.Default.Clear,
                contentDescription = "Clear",
                tint = Color(0xFF94A3B8),
                modifier = Modifier.size(18.dp)
              )
            }
          }
        },
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = Color(0xFF162032),
          unfocusedContainerColor = Color(0xFF162032),
          focusedBorderColor = Color(0xFF38BDF8),
          unfocusedBorderColor = Color(0xFF1E293B),
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("skills_search_input")
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Category Chips
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        SkillCategory.values().forEach { category ->
          val isSelected = category == selectedCategory
          Surface(
            shape = RoundedCornerShape(20.dp),
            color = if (isSelected) Color(0xFF0284C7) else Color(0xFF162032),
            border = androidx.compose.foundation.BorderStroke(
              1.dp,
              if (isSelected) Color(0xFF38BDF8) else Color(0xFF1F2E47)
            ),
            modifier = Modifier
              .clickable { selectedCategory = category }
              .testTag("skill_cat_${category.name.lowercase()}")
          ) {
            Text(
              text = category.displayName,
              color = if (isSelected) Color.White else Color(0xFF94A3B8),
              fontSize = 12.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Responsive Grid of Skills
      if (filteredSkills.isEmpty()) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "No matching skills found",
            color = Color(0xFF64748B),
            fontSize = 13.sp
          )
        }
      } else {
        val columns = if (isWideLayout) 2 else 1

        if (columns == 2) {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            for (i in filteredSkills.indices step 2) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
              ) {
                StaggeredEntrance(
                  index = i,
                  modifier = Modifier.weight(1f)
                ) {
                  SkillCardTile(skill = filteredSkills[i])
                }
                if (i + 1 < filteredSkills.size) {
                  StaggeredEntrance(
                    index = i + 1,
                    modifier = Modifier.weight(1f)
                  ) {
                    SkillCardTile(skill = filteredSkills[i + 1])
                  }
                } else {
                  Spacer(modifier = Modifier.weight(1f))
                }
              }
            }
          }
        } else {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            filteredSkills.forEachIndexed { index, skill ->
              StaggeredEntrance(index = index) {
                SkillCardTile(skill = skill)
              }
            }
          }
        }
      }
    }
  }
}

@Composable
fun SkillCardTile(skill: SkillItem) {
  val animatedProgress by animateFloatAsState(
    targetValue = skill.proficiency / 100f,
    animationSpec = tween(durationMillis = 800),
    label = "skillProgress"
  )

  Surface(
    shape = RoundedCornerShape(12.dp),
    color = Color(0xFF162032),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
    modifier = Modifier
      .fillMaxWidth()
      .testTag("skill_tile_${skill.name.lowercase().replace(" ", "_")}")
  ) {
    Column(modifier = Modifier.padding(14.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(
            text = skill.name,
            color = Color.White,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
          )
          Spacer(modifier = Modifier.width(8.dp))
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF0F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
          ) {
            Text(
              text = skill.tag,
              color = Color(0xFF38BDF8),
              fontSize = 10.sp,
              fontWeight = FontWeight.Medium,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
          }
        }

        Text(
          text = "${skill.proficiency}%",
          color = Color(0xFF67E8F9),
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold
        )
      }

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = skill.description,
        color = Color(0xFF94A3B8),
        fontSize = 11.5.sp,
        lineHeight = 16.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      // Custom progress bar
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(6.dp)
          .clip(CircleShape)
          .background(Color(0xFF0F172A))
      ) {
        Box(
          modifier = Modifier
            .fillMaxWidth(animatedProgress)
            .height(6.dp)
            .clip(CircleShape)
            .background(
              Brush.horizontalGradient(
                colors = listOf(Color(0xFF0284C7), Color(0xFF38BDF8), Color(0xFF67E8F9))
              )
            )
        )
      }
    }
  }
}
