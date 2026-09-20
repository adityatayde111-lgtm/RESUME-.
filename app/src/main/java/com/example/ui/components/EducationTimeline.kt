package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.EducationItem
import com.example.data.PortfolioRepository

@Composable
fun EducationTimeline(
  modifier: Modifier = Modifier
) {
  val educations = PortfolioRepository.educations

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("education_section_card"),
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
            text = "Education & Academics",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "Academic journey & academic performance",
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
            imageVector = Icons.Default.School,
            contentDescription = null,
            tint = Color(0xFF38BDF8),
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      educations.forEachIndexed { index, edu ->
        StaggeredEntrance(index = index) {
          EducationTimelineItem(edu = edu, isLast = index == educations.lastIndex)
        }
      }
    }
  }
}

@Composable
fun EducationTimelineItem(
  edu: EducationItem,
  isLast: Boolean
) {
  Row(
    modifier = Modifier.fillMaxWidth()
  ) {
    // Timeline column
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier.width(32.dp)
    ) {
      Box(
        modifier = Modifier
          .size(16.dp)
          .clip(CircleShape)
          .background(if (edu.isCurrent) Color(0xFF0284C7) else Color(0xFF475569))
          .border(2.dp, if (edu.isCurrent) Color(0xFF38BDF8) else Color(0xFF64748B), CircleShape)
      )

      if (!isLast) {
        Box(
          modifier = Modifier
            .width(2.dp)
            .height(90.dp)
            .background(Color(0xFF1E293B))
        )
      }
    }

    Spacer(modifier = Modifier.width(12.dp))

    // Content card
    Surface(
      shape = RoundedCornerShape(14.dp),
      color = Color(0xFF162032),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47)),
      modifier = Modifier
        .weight(1f)
        .padding(bottom = if (isLast) 0.dp else 16.dp)
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = edu.institution,
            color = Color.White,
            fontSize = 14.5.sp,
            fontWeight = FontWeight.Bold
          )

          Surface(
            shape = RoundedCornerShape(6.dp),
            color = if (edu.isCurrent) Color(0xFF0284C7).copy(alpha = 0.2f) else Color(0xFF1E293B)
          ) {
            Text(
              text = edu.timeline.uppercase(),
              color = if (edu.isCurrent) Color(0xFF38BDF8) else Color(0xFF94A3B8),
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
          text = edu.degree,
          color = Color(0xFF38BDF8),
          fontSize = 12.5.sp,
          fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(6.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Star,
            contentDescription = null,
            tint = Color(0xFFF59E0B),
            modifier = Modifier.size(13.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "${edu.scoreLabel}: ${edu.scoreValue}",
            color = Color(0xFFFDE68A),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
          )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = edu.details,
          color = Color(0xFF94A3B8),
          fontSize = 11.5.sp,
          lineHeight = 16.sp
        )
      }
    }
  }
}
